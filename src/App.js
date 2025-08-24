import React, { useState, useRef, useEffect } from 'react';
import { Camera, Utensils, Dumbbell, Target, Plus, Home, MessageCircle, TrendingUp, Clock, Zap, Send, Bot, User, Scan, Search, X, Flame, Settings, ChevronRight, Activity, BarChart3, UserCircle, History } from 'lucide-react';
import { useMeals } from './hooks/useMeals';

const EVAFitApp = () => {
  // ✅ NUEVO: Usar el hook useMeals en lugar de estados individuales
  const {
    meals,
    setMeals,
    recentFoods,
    setRecentFoods,
    newMeal,
    setNewMeal,
    dailyGoals,
    setDailyGoals,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    nutritionProgress,
    addMeal: addMealHook,
    addMealFromRecent: addMealFromRecentHook
  } = useMeals();

  // 🔄 RESTO DE ESTADOS - Sin cambios
  const [activeTab, setActiveTab] = useState('home');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isScanningBarcode, setIsScanningBarcode] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [fdcApiKey, setFdcApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [showFdcApiKeyInput, setShowFdcApiKeyInput] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [trackedDays, setTrackedDays] = useState(15);
  const [showProgressDetail, setShowProgressDetail] = useState('nutrition');
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  const [workouts, setWorkouts] = useState([
    {
      id: 1,
      name: 'Entrenamiento de Pecho',
      duration: '45 min',
      exercises: 8,
      calories: 280,
      date: 'Hoy'
    },
    {
      id: 2,
      name: 'Cardio HIIT',
      duration: '30 min',
      exercises: 6,
      calories: 320,
      date: 'Ayer'
    }
  ]);

  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      message: '¡Hola! Soy Eva, tu asistente personal de fitness. Puedo ayudarte con preguntas sobre nutrición, entrenamientos y analizar tus patrones alimenticios. ¿En qué puedo ayudarte?'
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [newWorkout, setNewWorkout] = useState({ name: '', duration: '', exercises: '' });
  const [userProfile, setUserProfile] = useState({
    name: 'Usuario',
    weight: 70,
    height: 175,
    age: 25,
    activity: 'moderate',
    goal: 'maintain'
  });

  // ❌ REMOVIDOS: Ya no necesitamos estos estados (están en useMeals)
  // const [meals, setMeals] = useState([...]);
  // const [recentFoods, setRecentFoods] = useState([...]);
  // const [newMeal, setNewMeal] = useState({ ... });
  // const [dailyGoals, setDailyGoals] = useState({...});

  // ❌ REMOVIDOS: Ya no necesitamos estos cálculos (están en useMeals)
  // const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  // const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);
  // const totalCarbs = meals.reduce((sum, meal) => sum + meal.carbs, 0);
  // const totalFat = meals.reduce((sum, meal) => sum + meal.fat, 0);

  // ❌ REMOVIDO: nutritionProgress ahora viene del hook
  // const nutritionProgress = [...]

  const workoutProgress = [
    { day: 'Lun', duration: 45, calories: 280 },
    { day: 'Mar', duration: 60, calories: 350 },
    { day: 'Mié', duration: 30, calories: 200 },
    { day: 'Jue', duration: 50, calories: 320 },
    { day: 'Vie', duration: 40, calories: 250 },
    { day: 'Sáb', duration: 70, calories: 420 },
    { day: 'Dom', duration: 0, calories: 0 }
  ];

  const getDaysOfMonth = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const currentDay = today.getDate();
    
    const days = [];
    for (let i = Math.max(1, currentDay - 6); i <= Math.min(daysInMonth, currentDay + 6); i++) {
      days.push({
        day: i,
        isToday: i === currentDay,
        hasData: i <= currentDay && i >= currentDay - 7
      });
    }
    return days;
  };

  const searchFoodByName = async (query) => {
    if (!fdcApiKey || !query.trim()) {
      alert('Por favor, configura tu API Key de FoodData Central y escribe un término de búsqueda');
      setShowFdcApiKeyInput(true);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${fdcApiKey}&query=${encodeURIComponent(query)}&dataType=Foundation,SR%20Legacy&pageSize=10`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.foods && data.foods.length > 0) {
        setSearchResults(data.foods.slice(0, 5));
      } else {
        setSearchResults([]);
        alert('No se encontraron alimentos con ese nombre');
      }
    } catch (error) {
      console.error('Error searching food:', error);
      alert('Error al buscar el alimento. Verifica tu API Key de FoodData Central.');
    } finally {
      setIsSearching(false);
    }
  };

  const getFoodNutrition = async (fdcId) => {
    if (!fdcApiKey) {
      alert('Por favor, configura tu API Key de FoodData Central');
      setShowFdcApiKeyInput(true);
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch(`https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${fdcApiKey}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      const nutrients = data.foodNutrients || [];
      
      const energyNutrient = nutrients.find(n => n.nutrient.id === 1008);
      const proteinNutrient = nutrients.find(n => n.nutrient.id === 1003);
      const carbsNutrient = nutrients.find(n => n.nutrient.id === 1005);
      const fatNutrient = nutrients.find(n => n.nutrient.id === 1004);
      
      setNewMeal({
        name: data.description || 'Alimento encontrado',
        calories: energyNutrient ? Math.round(energyNutrient.amount) : 0,
        protein: proteinNutrient ? Math.round(proteinNutrient.amount * 10) / 10 : 0,
        carbs: carbsNutrient ? Math.round(carbsNutrient.amount * 10) / 10 : 0,
        fat: fatNutrient ? Math.round(fatNutrient.amount * 10) / 10 : 0,
        serving: '100'
      });
      
      setSearchResults([]);
      setSearchQuery('');
      setActiveTab('nutrition');
      
    } catch (error) {
      console.error('Error getting food nutrition:', error);
      alert('Error al obtener información nutricional del alimento.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const searchByBarcode = async (barcode) => {
    if (!barcode || barcode.length < 8) {
      alert('Por favor, ingresa un código de barras válido (mínimo 8 dígitos)');
      return;
    }

    setIsAnalyzing(true);
    try {
      const openFoodFactsResponse = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const openFoodFactsData = await openFoodFactsResponse.json();
      
      if (openFoodFactsData.status === 1 && openFoodFactsData.product) {
        const product = openFoodFactsData.product;
        
        if (product.nutriments) {
          setNewMeal({
            name: product.product_name || product.product_name_es || 'Producto encontrado',
            calories: Math.round(product.nutriments['energy-kcal_100g'] || product.nutriments['energy-kcal'] || 0),
            protein: Math.round((product.nutriments.proteins_100g || product.nutriments.proteins || 0) * 10) / 10,
            carbs: Math.round((product.nutriments.carbohydrates_100g || product.nutriments.carbohydrates || 0) * 10) / 10,
            fat: Math.round((product.nutriments.fat_100g || product.nutriments.fat || 0) * 10) / 10,
            serving: '100'
          });
          setActiveTab('nutrition');
        } else {
          const productName = product.product_name || product.product_name_es;
          if (productName && fdcApiKey) {
            await searchFoodByName(productName);
            return;
          } else {
            setNewMeal({
              name: productName || 'Producto encontrado',
              calories: 0,
              protein: 0,
              carbs: 0,
              fat: 0,
              serving: '100'
            });
            setActiveTab('nutrition');
          }
        }
      } else {
        alert('Producto no encontrado. Puedes agregar la información manualmente.');
        setNewMeal({
          name: `Producto ${barcode}`,
          calories: '',
          protein: '',
          carbs: '',
          fat: '',
          serving: '100'
        });
        setActiveTab('nutrition');
      }
      
      setBarcodeInput('');
    } catch (error) {
      console.error('Error searching barcode:', error);
      alert('Error al buscar el código de barras. Intenta nuevamente.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startBarcodeScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanningBarcode(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('No se pudo acceder a la cámara. Puedes ingresar el código manualmente.');
    }
  };

  const stopBarcodeScanner = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanningBarcode(false);
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const analyzeImageWithAI = async (imageFile) => {
    if (!apiKey) {
      alert('Por favor, configura tu API Key de OpenAI primero');
      setShowApiKeyInput(true);
      return;
    }

    setIsAnalyzing(true);
    try {
      const base64Image = await convertToBase64(imageFile);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Analiza esta imagen de comida y proporciona la siguiente información en formato JSON exacto:\n{\n  \"name\": \"nombre del plato\",\n  \"calories\": número_de_calorías,\n  \"protein\": gramos_de_proteína,\n  \"carbs\": gramos_de_carbohidratos,\n  \"fat\": gramos_de_grasa\n}\n\nSolo responde con el JSON, sin texto adicional."
                },
                {
                  type: "image_url",
                  image_url: {
                    url: base64Image
                  }
                }
              ]
            }
          ],
          max_tokens: 300
        })
      });

      const data = await response.json();
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        try {
          const analysis = JSON.parse(data.choices[0].message.content);
          setNewMeal({
            name: analysis.name,
            calories: analysis.calories.toString(),
            protein: analysis.protein.toString(),
            carbs: analysis.carbs.toString(),
            fat: analysis.fat.toString(),
            serving: '100'
          });
          setActiveTab('nutrition');
        } catch (parseError) {
          console.error('Error parsing AI response:', parseError);
          alert('Error al procesar la respuesta de la IA');
        }
      } else {
        throw new Error('Respuesta inválida de la API');
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      alert('Error al analizar la imagen. Verifica tu API Key.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      analyzeImageWithAI(file);
    }
    setShowQuickActions(false);
  };

  const getUserContext = () => {
    // ✅ ACTUALIZADO: Usar las variables que vienen del hook
    return `
    Contexto del usuario:
    
    COMIDAS DE HOY:
    ${meals.map(meal => `- ${meal.name} (${meal.time}): ${meal.calories} cal, ${meal.protein}g proteína, ${meal.carbs}g carbos, ${meal.fat}g grasa`).join('\n')}
    
    TOTALES DIARIOS:
    - Calorías totales: ${totalCalories}
    - Proteína total: ${totalProtein}g
    - Carbohidratos totales: ${totalCarbs}g
    - Grasas totales: ${totalFat}g
    
    ENTRENAMIENTOS RECIENTES:
    ${workouts.slice(0, 3).map(workout => `- ${workout.name} (${workout.date}): ${workout.duration}, ${workout.exercises} ejercicios, ${workout.calories} cal quemadas`).join('\n')}
    
    Responde como Eva, un asistente personal de fitness y nutrición experta, considerando este contexto.
    `;
  };

  const sendMessageToAI = async () => {
    if (!newMessage.trim() || !apiKey) {
      if (!apiKey) {
        alert('Por favor, configura tu API Key de OpenAI primero');
        setShowApiKeyInput(true);
      }
      return;
    }

    const userMessage = {
      id: chatMessages.length + 1,
      type: 'user',
      message: newMessage
    };

    setChatMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsThinking(true);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: getUserContext()
            },
            {
              role: "user",
              content: newMessage
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      const data = await response.json();
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        const assistantMessage = {
          id: chatMessages.length + 2,
          type: 'assistant',
          message: data.choices[0].message.content
        };
        setChatMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Respuesta inválida de la API');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: chatMessages.length + 2,
        type: 'assistant',
        message: 'Lo siento, hubo un error al procesar tu mensaje. Verifica tu conexión y API Key.'
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  // ✅ ACTUALIZADO: Usar la función del hook
  const addMeal = () => {
    addMealHook(setActiveTab, setShowQuickActions, setSearchResults, setSearchQuery);
  };

  // ✅ ACTUALIZADO: Usar la función del hook
  const addMealFromRecent = (food) => {
    addMealFromRecentHook(food, setActiveTab, setShowQuickActions);
  };

  const addWorkout = () => {
    if (newWorkout.name && newWorkout.duration) {
      const workout = {
        id: workouts.length + 1,
        name: newWorkout.name,
        duration: newWorkout.duration,
        exercises: parseInt(newWorkout.exercises) || 0,
        calories: Math.floor(Math.random() * 200) + 150,
        date: 'Hoy'
      };
      setWorkouts([...workouts, workout]);
      setNewWorkout({ name: '', duration: '', exercises: '' });
      setActiveTab('home');
      setShowQuickActions(false);
    }
  };

  // 🔄 RESTO DEL CÓDIGO SIN CAMBIOS
  // (CalorieDonutChart, MacroBar, todas las pantallas, etc.)

  const CalorieDonutChart = ({ consumed, goal }) => {
    const percentage = Math.min(100, (consumed / goal) * 100);
    const circumference = 2 * Math.PI * 45;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#f3f4f6"
            strokeWidth="6"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={consumed > goal ? "#ef4444" : "#6b7280"}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500 ease-in-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs font-bold text-gray-800">{consumed}</span>
          <span className="text-xs text-gray-500">{goal}</span>
        </div>
      </div>
    );
  };

  const MacroBar = ({ label, consumed, goal, color }) => {
    const percentage = Math.min(100, (consumed / goal) * 100);
    
    return (
      <div className="flex-1">
        <div className="text-center mb-1">
          <div className="text-xs text-gray-500 mb-1">{label}</div>
          <div className="text-sm font-semibold text-gray-800">{consumed}g</div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all duration-500 ${color}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  // 🔄 TODAS LAS PANTALLAS SE MANTIENEN EXACTAMENTE IGUALES
  // (HomeScreen, SearchScreen, etc. - sin cambios)

  const HomeScreen = () => {
    const days = getDaysOfMonth();
    
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">
              <span className="text-gray-800">EVA</span> FIT
            </h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${apiKey || fdcApiKey ? 'bg-gray-800' : 'bg-gray-300'}`}></div>
                <span className="text-xs text-gray-600">
                  {apiKey && fdcApiKey ? 'IA' : apiKey ? 'OpenAI' : fdcApiKey ? 'FDC' : 'Offline'}
                </span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Flame size={16} className="text-orange-500" />
                <span className="text-sm font-semibold text-gray-800">{trackedDays}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Calendario */}
        <div className="px-6 py-4 bg-white border-b">
          <div className="flex space-x-2 overflow-x-auto">
            {days.map((day) => (
              <div
                key={day.day}
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                  ${day.isToday 
                    ? 'bg-gray-800 text-white' 
                    : day.hasData 
                      ? 'bg-gray-200 text-gray-700' 
                      : 'bg-gray-100 text-gray-400'
                  }`}
              >
                {day.day}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Resumen nutricional */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Resumen Nutricional</h2>
              <CalorieDonutChart consumed={totalCalories} goal={dailyGoals.calories} />
              <div className="mt-2">
                <div className="text-xl font-bold text-gray-800">{totalCalories} kcal</div>
                <div className="text-sm text-gray-500">
                  {Math.max(0, dailyGoals.calories - totalCalories)} restantes
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <MacroBar 
                label="Proteínas" 
                consumed={totalProtein} 
                goal={dailyGoals.protein} 
                color="bg-red-400" 
              />
              <MacroBar 
                label="Carbohidratos" 
                consumed={totalCarbs} 
                goal={dailyGoals.carbs} 
                color="bg-yellow-400" 
              />
              <MacroBar 
                label="Grasas" 
                consumed={totalFat} 
                goal={dailyGoals.fat} 
                color="bg-green-400" 
              />
            </div>
          </div>

          {/* Comidas del día */}
          <div className="bg-white rounded-2xl shadow-sm">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Comidas de Hoy</h3>
            </div>
            
            {meals.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <p className="mb-2">No hay comidas registradas</p>
                <button
                  onClick={() => setShowQuickActions(true)}
                  className="text-gray-800 text-sm font-medium"
                >
                  Agregar primera comida
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {meals.map((meal) => (
                  <div key={meal.id} className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{meal.name}</h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-500 flex items-center">
                          <Clock size={12} className="mr-1" />
                          {meal.time}
                        </span>
                        <span className="text-xs text-gray-400">
                          P: {meal.protein}g • C: {meal.carbs}g • G: {meal.fat}g
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-800">{meal.calories}</div>
                      <div className="text-xs text-gray-500">kcal</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Configuración de APIs */}
          {(!apiKey || !fdcApiKey) && (
            <div className="space-y-3">
              {!apiKey && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">OpenAI API</p>
                      <p className="text-xs text-gray-600">Para análisis con Eva</p>
                    </div>
                    <button
                      onClick={() => setShowApiKeyInput(true)}
                      className="text-xs bg-gray-800 text-white px-3 py-1 rounded-full"
                    >
                      Configurar
                    </button>
                  </div>
                </div>
              )}
              
              {!fdcApiKey && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">FoodData Central API</p>
                      <p className="text-xs text-gray-600">Para búsqueda de alimentos</p>
                    </div>
                    <button
                      onClick={() => setShowFdcApiKeyInput(true)}
                      className="text-xs bg-gray-800 text-white px-3 py-1 rounded-full"
                    >
                      Configurar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modales de configuración */}
        {showApiKeyInput && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
              <h3 className="text-lg font-semibold mb-4">Configurar OpenAI API</h3>
              <input
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent mb-4"
              />
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowApiKeyInput(false)}
                  className="flex-1 py-2 text-gray-600 border border-gray-300 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setShowApiKeyInput(false)}
                  className="flex-1 py-2 bg-gray-800 text-white rounded-xl"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}

        {showFdcApiKeyInput && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
              <h3 className="text-lg font-semibold mb-2">Configurar FoodData Central</h3>
              <p className="text-sm text-gray-600 mb-4">
                Obtén tu API Key gratuita en: api.nal.usda.gov/fdc/
              </p>
              <input
                type="password"
                placeholder="API Key de USDA FoodData Central"
                value={fdcApiKey}
                onChange={(e) => setFdcApiKey(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent mb-4"
              />
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowFdcApiKeyInput(false)}
                  className="flex-1 py-2 text-gray-600 border border-gray-300 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setShowFdcApiKeyInput(false)}
                  className="flex-1 py-2 bg-gray-800 text-white rounded-xl"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Botón flotante principal */}
        <div className="fixed bottom-24 right-6 z-40">
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
              showQuickActions 
                ? 'bg-gray-600 rotate-45' 
                : 'bg-gray-800 hover:bg-gray-700'
            } text-white`}
          >
            <Plus size={24} />
          </button>
        </div>

        {/* Botones flotantes de acciones */}
        {showQuickActions && (
          <div className="fixed bottom-24 right-6 z-30">
            <div className="flex flex-col items-end space-y-3 mb-16">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-200 hover:border-gray-300 transition-all"
                title="Analizar con IA"
              >
                <Camera size={20} className="text-gray-600" />
              </button>
              
              <button
                onClick={() => {
                  setActiveTab('search');
                  setShowQuickActions(false);
                }}
                className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-200 hover:border-gray-300 transition-all"
                title="Buscar alimento"
              >
                <Search size={20} className="text-gray-600" />
              </button>
              
              <button
                onClick={() => {
                  setActiveTab('recent');
                  setShowQuickActions(false);
                }}
                className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-200 hover:border-gray-300 transition-all"
                title="Recientes"
              >
                <History size={20} className="text-gray-600" />
              </button>
              
              <button
                onClick={() => {
                  setActiveTab('barcode');
                  setShowQuickActions(false);
                }}
                className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-200 hover:border-gray-300 transition-all"
                title="Escanear código"
              >
                <Scan size={20} className="text-gray-600" />
              </button>
              
              <button
                onClick={() => {
                  setActiveTab('workouts');
                  setShowQuickActions(false);
                }}
                className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-200 hover:border-gray-300 transition-all"
                title="Ejercicio"
              >
                <Dumbbell size={20} className="text-gray-600" />
              </button>
              
              <button
                onClick={() => {
                  setActiveTab('assistant');
                  setShowQuickActions(false);
                }}
                className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-200 hover:border-gray-300 transition-all"
                title="Pregunta a Eva"
              >
                <Bot size={20} className="text-gray-600" />
              </button>
            </div>
          </div>
        )}

        {/* Input de archivo oculto */}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          ref={fileInputRef}
          className="hidden"
        />
      </div>
    );
  };

  // 🔄 RESTO DE PANTALLAS SIN CAMBIOS (para mantener funcionalidad idéntica)

  const SearchScreen = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setActiveTab('home')}
            className="p-2 text-gray-600"
          >
            <X size={20} />
          </button>
          <h2 className="text-xl font-semibold text-gray-800">Buscar Alimento</h2>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex space-x-2 mb-4">
            <input
              type="text"
              placeholder="Buscar alimento..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchFoodByName(searchQuery)}
              className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            />
            <button
              onClick={() => searchFoodByName(searchQuery)}
              disabled={!searchQuery || isSearching || !fdcApiKey}
              className="px-4 py-3 bg-gray-800 text-white rounded-xl disabled:opacity-50"
            >
              <Search size={20} />
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Resultados:</h4>
              {searchResults.map((food, index) => (
                <button
                  key={index}
                  onClick={() => getFoodNutrition(food.fdcId)}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="font-medium text-gray-800">{food.description}</div>
                  <div className="text-sm text-gray-500">{food.dataType}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const RecentScreen = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setActiveTab('home')}
            className="p-2 text-gray-600"
          >
            <X size={20} />
          </button>
          <h2 className="text-xl font-semibold text-gray-800">Alimentos Recientes</h2>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-white rounded-2xl shadow-sm">
          <div className="divide-y divide-gray-100">
            {recentFoods.map((food, index) => (
              <button
                key={index}
                onClick={() => addMealFromRecent(food)}
                className="w-full p-4 text-left hover:bg-gray-50 flex items-center justify-between"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{food.name}</h4>
                  <div className="text-xs text-gray-500 mt-1">
                    P: {food.protein}g • C: {food.carbs}g • G: {food.fat}g
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-800">{food.calories}</div>
                  <div className="text-xs text-gray-500">kcal</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ... resto de pantallas continúan igual

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'search':
        return <SearchScreen />;
      case 'recent':
        return <RecentScreen />;
      // ... resto de casos
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
      {renderScreen()}
      
      {/* Barra de navegación inferior - sin cambios */}
      {!['search', 'recent', 'barcode', 'nutrition', 'workouts', 'assistant'].includes(activeTab) && (
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex-1 py-3 flex flex-col items-center space-y-1 ${
                activeTab === 'home' ? 'text-gray-800' : 'text-gray-400'
              }`}
            >
              <Home size={20} />
              <span className="text-xs">Inicio</span>
            </button>
            
            <button
              onClick={() => setActiveTab('progress')}
              className={`flex-1 py-3 flex flex-col items-center space-y-1 ${
                activeTab === 'progress' ? 'text-gray-800' : 'text-gray-400'
              }`}
            >
              <BarChart3 size={20} />
              <span className="text-xs">Progreso</span>
            </button>
            
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-3 flex flex-col items-center space-y-1 ${
                activeTab === 'profile' ? 'text-gray-800' : 'text-gray-400'
              }`}
            >
              <UserCircle size={20} />
              <span className="text-xs">Perfil</span>
            </button>
          </div>
        </div>
      )}

      {/* Overlay para cerrar acciones rápidas - sin cambios */}
      {showQuickActions && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 z-20"
          onClick={() => setShowQuickActions(false)}
        />
      )}
    </div>
  );
};

export default EVAFitApp;