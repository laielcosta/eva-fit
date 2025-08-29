import React, { useState, useRef } from 'react';
import { Camera, Utensils, Dumbbell, Target, Plus, Home, MessageCircle, TrendingUp, Clock, Zap, Send, Bot, User, Scan, Search, X, Flame, Settings, ChevronRight, Activity, BarChart3, UserCircle, History } from 'lucide-react';
import { useMeals } from './hooks/useMeals';
import { useApiKeys } from './hooks/useApiKeys';

const EVAFitApp = () => {
  // Hooks personalizados
  const {
    meals, setMeals, recentFoods, setRecentFoods, newMeal, setNewMeal,
    dailyGoals, setDailyGoals, totalCalories, totalProtein, totalCarbs, totalFat,
    nutritionProgress, addMeal: addMealHook, addMealFromRecent: addMealFromRecentHook
  } = useMeals();

  const {
    apiKey, setApiKey, fdcApiKey, setFdcApiKey, showApiKeyInput, setShowApiKeyInput,
    showFdcApiKeyInput, setShowFdcApiKeyInput, isAnalyzing, setIsAnalyzing,
    isSearching, setIsSearching, searchFoodByName, getFoodNutrition,
    searchByBarcode, analyzeImageWithAI, sendMessageToAI, isOpenAIConfigured,
    isFDCConfigured, areAllApiKeysConfigured
  } = useApiKeys();

  // Estados locales del componente
  const [activeTab, setActiveTab] = useState('home');
  const [isScanningBarcode, setIsScanningBarcode] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [trackedDays, setTrackedDays] = useState(15);
  const [showProgressDetail, setShowProgressDetail] = useState('nutrition');
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      message: '¡Hola! Soy Eva, tu asistente personal de fitness. Puedo ayudarte con preguntas sobre nutrición, entrenamientos y analizar tus patrones alimenticios. ¿En qué puedo ayudarte?'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  
  // Estados para entrenamientos
  const [workouts, setWorkouts] = useState([
    { id: 1, name: 'Entrenamiento de Pecho', duration: '45 min', exercises: 8, calories: 280, date: 'Hoy' },
    { id: 2, name: 'Cardio HIIT', duration: '30 min', exercises: 6, calories: 320, date: 'Ayer' }
  ]);
  const [newWorkout, setNewWorkout] = useState({ name: '', duration: '', exercises: '' });
  
  // Perfil del usuario
  const [userProfile, setUserProfile] = useState({
    name: 'Usuario', weight: 70, height: 175, age: 25, activity: 'moderate', goal: 'maintain'
  });

  // Referencias
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  // Datos para gráficos de entrenamiento
  const workoutProgress = [
    { day: 'Lun', duration: 45, calories: 280 },
    { day: 'Mar', duration: 60, calories: 350 },
    { day: 'Mié', duration: 30, calories: 200 },
    { day: 'Jue', duration: 50, calories: 320 },
    { day: 'Vie', duration: 40, calories: 250 },
    { day: 'Sáb', duration: 70, calories: 420 },
    { day: 'Dom', duration: 0, calories: 0 }
  ];

  // Funciones locales (no relacionadas con APIs)
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

  const startBarcodeScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
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

  const getUserContext = () => {
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

  // Funciones de manejo mejoradas (usando los hooks)
  const handleSearchFoodByName = async (query) => {
    const results = await searchFoodByName(query);
    setSearchResults(results);
  };

  const handleGetFoodNutrition = async (fdcId) => {
    const nutrition = await getFoodNutrition(fdcId);
    if (nutrition) {
      setNewMeal(nutrition);
      setSearchResults([]);
      setSearchQuery('');
      setActiveTab('nutrition');
    }
  };

  const handleSearchByBarcode = async (barcode) => {
    const result = await searchByBarcode(barcode);
    if (result) {
      setNewMeal(result);
      setActiveTab('nutrition');
    }
    setBarcodeInput('');
  };

  const handleAnalyzeImage = async (imageFile) => {
    const result = await analyzeImageWithAI(imageFile);
    if (result) {
      setNewMeal(result);
      setActiveTab('nutrition');
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      handleAnalyzeImage(file);
    }
    setShowQuickActions(false);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage = { id: chatMessages.length + 1, type: 'user', message: newMessage };
    setChatMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsThinking(true);

    try {
      const messages = [
        { role: "system", content: getUserContext() },
        { role: "user", content: newMessage }
      ];

      const response = await sendMessageToAI(messages);
      if (response) {
        const assistantMessage = { id: chatMessages.length + 2, type: 'assistant', message: response };
        setChatMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
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

  const addMeal = () => {
    addMealHook(setActiveTab, setShowQuickActions, setSearchResults, setSearchQuery);
  };

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

  // Componentes de UI
  const CalorieDonutChart = ({ consumed, goal }) => {
    const percentage = Math.min(100, (consumed / goal) * 100);
    const circumference = 2 * Math.PI * 45;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="6" />
          <circle
            cx="50" cy="50" r="45" fill="none" strokeWidth="6" strokeLinecap="round"
            stroke={consumed > goal ? "#ef4444" : "#6b7280"}
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

  // Pantallas
  const HomeScreen = () => {
    const days = getDaysOfMonth();
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">
              <span className="text-gray-800">EVA</span> FIT
            </h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${areAllApiKeysConfigured() ? 'bg-gray-800' : 'bg-gray-300'}`}></div>
                <span className="text-xs text-gray-600">
                  {areAllApiKeysConfigured() ? 'IA' : isOpenAIConfigured() ? 'OpenAI' : isFDCConfigured() ? 'FDC' : 'Offline'}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Flame size={16} className="text-orange-500" />
                <span className="text-sm font-semibold text-gray-800">{trackedDays}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-white border-b">
          <div className="flex space-x-2 overflow-x-auto">
            {days.map((day) => (
              <div
                key={day.day}
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                  ${day.isToday ? 'bg-gray-800 text-white' : day.hasData ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-400'}`}
              >
                {day.day}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-6">
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
              <MacroBar label="Proteínas" consumed={totalProtein} goal={dailyGoals.protein} color="bg-red-400" />
              <MacroBar label="Carbohidratos" consumed={totalCarbs} goal={dailyGoals.carbs} color="bg-yellow-400" />
              <MacroBar label="Grasas" consumed={totalFat} goal={dailyGoals.fat} color="bg-green-400" />
            </div>
          </div>

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

          {!areAllApiKeysConfigured() && (
            <div className="space-y-3">
              {!isOpenAIConfigured() && (
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
              
              {!isFDCConfigured() && (
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

        {/* Botones flotantes */}
        <div className="fixed bottom-24 right-6 z-40">
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
              showQuickActions ? 'bg-gray-600 rotate-45' : 'bg-gray-800 hover:bg-gray-700'
            } text-white`}
          >
            <Plus size={24} />
          </button>
        </div>

        {showQuickActions && (
          <div className="fixed bottom-24 right-6 z-30">
            <div className="flex flex-col items-end space-y-3 mb-16">
              <button onClick={() => fileInputRef.current?.click()} className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-200 hover:border-gray-300 transition-all" title="Analizar con IA">
                <Camera size={20} className="text-gray-600" />
              </button>
              <button onClick={() => { setActiveTab('search'); setShowQuickActions(false); }} className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-200 hover:border-gray-300 transition-all" title="Buscar alimento">
                <Search size={20} className="text-gray-600" />
              </button>
              <button onClick={() => { setActiveTab('recent'); setShowQuickActions(false); }} className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-200 hover:border-gray-300 transition-all" title="Recientes">
                <History size={20} className="text-gray-600" />
              </button>
              <button onClick={() => { setActiveTab('barcode'); setShowQuickActions(false); }} className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-200 hover:border-gray-300 transition-all" title="Escanear código">
                <Scan size={20} className="text-gray-600" />
              </button>
              <button onClick={() => { setActiveTab('workouts'); setShowQuickActions(false); }} className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-200 hover:border-gray-300 transition-all" title="Ejercicio">
                <Dumbbell size={20} className="text-gray-600" />
              </button>
              <button onClick={() => { setActiveTab('assistant'); setShowQuickActions(false); }} className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-200 hover:border-gray-300 transition-all" title="Pregunta a Eva">
                <Bot size={20} className="text-gray-600" />
              </button>
            </div>
          </div>
        )}

        <input type="file" accept="image/*" onChange={handleFileSelect} ref={fileInputRef} className="hidden" />
      </div>
    );
  };

  const SearchScreen = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center space-x-4">
          <button onClick={() => setActiveTab('home')} className="p-2 text-gray-600">
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
              onKeyDown={(e) => e.key === 'Enter' && handleSearchFoodByName(searchQuery)}
              className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            />
            <button
              onClick={() => handleSearchFoodByName(searchQuery)}
              disabled={!searchQuery || isSearching || !isFDCConfigured()}
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
                  onClick={() => handleGetFoodNutrition(food.fdcId)}
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
          <button onClick={() => setActiveTab('home')} className="p-2 text-gray-600">
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

  const BarcodeScreen = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center space-x-4">
          <button onClick={() => setActiveTab('home')} className="p-2 text-gray-600">
            <X size={20} />
          </button>
          <h2 className="text-xl font-semibold text-gray-800">Escanear Código</h2>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          {isScanningBarcode ? (
            <div className="space-y-4">
              <video ref={videoRef} autoPlay playsInline className="w-full h-48 bg-black rounded-lg" />
              <button onClick={stopBarcodeScanner} className="w-full bg-red-500 text-white py-3 rounded-xl font-medium">
                Detener Escáner
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <button onClick={startBarcodeScanner} className="w-full bg-gray-800 text-white py-3 rounded-xl font-medium flex items-center justify-center">
                <Camera className="mr-2" size={20} />
                Activar Cámara
              </button>
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="O ingresa código manualmente"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchByBarcode(barcodeInput)}
                  className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
                <button
                  onClick={() => handleSearchByBarcode(barcodeInput)}
                  disabled={!barcodeInput || isAnalyzing}
                  className="px-4 py-3 bg-gray-800 text-white rounded-xl disabled:opacity-50"
                >
                  <Search size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const NutritionScreen = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center space-x-4">
          <button onClick={() => setActiveTab('home')} className="p-2 text-gray-600">
            <X size={20} />
          </button>
          <h2 className="text-xl font-semibold text-gray-800">Agregar Comida</h2>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {isAnalyzing ? 'Procesando...' : 'Información Nutricional'}
          </h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Nombre de la comida"
              value={newMeal.name}
              onChange={(e) => setNewMeal({...newMeal, name: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            />
            
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Calorías"
                value={newMeal.calories}
                onChange={(e) => setNewMeal({...newMeal, calories: e.target.value})}
                className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
              <input
                type="number"
                placeholder="Porción (g)"
                value={newMeal.serving}
                onChange={(e) => setNewMeal({...newMeal, serving: e.target.value})}
                className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <input
                type="number"
                step="0.1"
                placeholder="Proteínas (g)"
                value={newMeal.protein}
                onChange={(e) => setNewMeal({...newMeal, protein: e.target.value})}
                className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
              <input
                type="number"
                step="0.1"
                placeholder="Carbohidratos (g)"
                value={newMeal.carbs}
                onChange={(e) => setNewMeal({...newMeal, carbs: e.target.value})}
                className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
              <input
                type="number"
                step="0.1"
                placeholder="Grasas (g)"
                value={newMeal.fat}
                onChange={(e) => setNewMeal({...newMeal, fat: e.target.value})}
                className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
            </div>
            
            <button 
              onClick={addMeal}
              disabled={!newMeal.name || !newMeal.calories}
              className="w-full bg-gray-800 text-white py-3 rounded-xl font-medium flex items-center justify-center disabled:opacity-50"
            >
              <Plus className="mr-2" size={20} />
              Agregar Comida
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const WorkoutsScreen = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center space-x-4">
          <button onClick={() => setActiveTab('home')} className="p-2 text-gray-600">
            <X size={20} />
          </button>
          <h2 className="text-xl font-semibold text-gray-800">Agregar Ejercicio</h2>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Nuevo Entrenamiento</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Nombre del entrenamiento"
              value={newWorkout.name}
              onChange={(e) => setNewWorkout({...newWorkout, name: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Duración (ej: 45 min)"
                value={newWorkout.duration}
                onChange={(e) => setNewWorkout({...newWorkout, duration: e.target.value})}
                className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
              <input
                type="number"
                placeholder="Nº ejercicios"
                value={newWorkout.exercises}
                onChange={(e) => setNewWorkout({...newWorkout, exercises: e.target.value})}
                className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
            </div>
            <button 
              onClick={addWorkout}
              disabled={!newWorkout.name || !newWorkout.duration}
              className="w-full bg-gray-800 text-white py-3 rounded-xl font-medium flex items-center justify-center disabled:opacity-50"
            >
              <Plus className="mr-2" size={20} />
              Agregar Entrenamiento
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">Entrenamientos Recientes</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {workouts.map((workout) => (
              <div key={workout.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-800">{workout.name}</h4>
                  <div className="flex items-center text-gray-600">
                    <Zap size={16} className="mr-1" />
                    <span className="font-semibold">{workout.calories} cal</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{workout.duration}</span>
                  <span>{workout.exercises} ejercicios</span>
                  <span>{workout.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const AssistantScreen = () => (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center space-x-4">
          <button onClick={() => setActiveTab('home')} className="p-2 text-gray-600">
            <X size={20} />
          </button>
          <h2 className="text-xl font-semibold text-gray-800">Pregunta a Eva</h2>
        </div>
      </div>

      <div className="flex-1 p-6">
        <div className="bg-white rounded-2xl shadow-sm h-full flex flex-col">
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  msg.type === 'user' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'
                }`}>
                  <p className="text-sm">{msg.message}</p>
                </div>
              </div>
            ))}
            
            {isThinking && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-2 rounded-2xl">
                  <p className="text-sm text-gray-600">Eva está pensando...</p>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-100">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Pregunta sobre nutrición, entrenamientos..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
              <button 
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isThinking || !isOpenAIConfigured()}
                className="bg-gray-800 text-white p-3 rounded-xl disabled:opacity-50"
              >
                <Send size={20} />
              </button>
            </div>
            {!isOpenAIConfigured() && (
              <p className="text-sm text-gray-500 mt-2">Configura tu API Key de OpenAI para chatear con Eva</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const ProgressScreen = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-6 py-4 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800">Progreso</h2>
      </div>

      <div className="p-6 space-y-6">
        <div className="bg-white rounded-2xl p-2 shadow-sm">
          <div className="flex">
            <button
              onClick={() => setShowProgressDetail('nutrition')}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                showProgressDetail === 'nutrition' ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Nutrición
            </button>
            <button
              onClick={() => setShowProgressDetail('workout')}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                showProgressDetail === 'workout' ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Entrenamiento
            </button>
          </div>
        </div>

        {showProgressDetail === 'nutrition' ? (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Calorías Semanales</h3>
              <div className="space-y-2">
                {nutritionProgress.map((day, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 w-12">{day.day}</span>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gray-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (day.calories / dailyGoals.calories) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-800 w-16 text-right">{day.calories}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribución de Macros Hoy</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Proteínas</span>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (totalProtein / dailyGoals.protein) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-800">{totalProtein}g</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Carbohidratos</span>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (totalCarbs / dailyGoals.carbs) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-800">{totalCarbs}g</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Grasas</span>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (totalFat / dailyGoals.fat) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-800">{totalFat}g</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Entrenamientos Semanales</h3>
              <div className="space-y-2">
                {workoutProgress.map((day, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 w-12">{day.day}</span>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gray-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (day.duration / 90) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-800 w-16 text-right">{day.duration}min</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Estadísticas de la Semana</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">
                    {workoutProgress.reduce((sum, day) => sum + day.duration, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Minutos totales</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">
                    {workoutProgress.reduce((sum, day) => sum + day.calories, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Calorías quemadas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">
                    {workoutProgress.filter(day => day.duration > 0).length}
                  </div>
                  <div className="text-sm text-gray-600">Días activos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">
                    {Math.round(workoutProgress.reduce((sum, day) => sum + day.duration, 0) / 7)}
                  </div>
                  <div className="text-sm text-gray-600">Promedio diario</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const ProfileScreen = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-6 py-4 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800">Perfil</h2>
      </div>

      <div className="p-6 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <UserCircle size={32} className="text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{userProfile.name}</h3>
              <p className="text-sm text-gray-600">Objetivo: Mantener peso</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-800">{userProfile.weight}kg</div>
              <div className="text-xs text-gray-600">Peso</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-800">{userProfile.height}cm</div>
              <div className="text-xs text-gray-600">Altura</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-800">{userProfile.age}</div>
              <div className="text-xs text-gray-600">Años</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Metas Diarias</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Calorías objetivo</span>
              <span className="font-semibold text-gray-800">{dailyGoals.calories} kcal</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Proteínas</span>
              <span className="font-semibold text-gray-800">{dailyGoals.protein}g</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Carbohidratos</span>
              <span className="font-semibold text-gray-800">{dailyGoals.carbs}g</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Grasas</span>
              <span className="font-semibold text-gray-800">{dailyGoals.fat}g</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">Configuración</h3>
          </div>
          <div className="divide-y divide-gray-100">
            <button
              onClick={() => setShowApiKeyInput(true)}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <Bot size={20} className="text-gray-600" />
                <span className="text-gray-800">API OpenAI</span>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
            
            <button
              onClick={() => setShowFdcApiKeyInput(true)}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <Search size={20} className="text-gray-600" />
                <span className="text-gray-800">API FoodData Central</span>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
            
            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center space-x-3">
                <Target size={20} className="text-gray-600" />
                <span className="text-gray-800">Ajustar Metas</span>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
            
            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center space-x-3">
                <Settings size={20} className="text-gray-600" />
                <span className="text-gray-800">Configuración General</span>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Sobre EVA FIT</h3>
          <p className="text-sm text-gray-600 mb-2">
            Tu asistente personal de fitness impulsado por inteligencia artificial.
          </p>
          <p className="text-xs text-gray-500">Versión 1.0.0</p>
        </div>
      </div>
    </div>
  );

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'search':
        return <SearchScreen />;
      case 'recent':
        return <RecentScreen />;
      case 'barcode':
        return <BarcodeScreen />;
      case 'nutrition':
        return <NutritionScreen />;
      case 'workouts':
        return <WorkoutsScreen />;
      case 'assistant':
        return <AssistantScreen />;
      case 'progress':
        return <ProgressScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
      {renderScreen()}
      
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