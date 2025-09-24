import React, { useState, useRef, useEffect } from 'react';
import { Camera, Utensils, Dumbbell, Target, Plus, Home, MessageCircle, TrendingUp, Clock, Zap, Send, Bot, User, Scan, Search, X, Flame, Settings, ChevronRight, Activity, BarChart3, UserCircle, History } from 'lucide-react';
import { useMeals } from './hooks/useMeals';
import { useApiKeys } from './hooks/useApiKeys';
import { useWorkouts } from './hooks/useWorkouts';
import CalorieDonutChart from './components/CalorieDonutChart';
import MacroBar from './components/MacroBar';
import QuickActionsModal from './components/QuickActionsModal';
import HomeScreen from './screens/HomeScreen';
import WorkoutsScreen from './screens/WorkoutsScreen';
import ProfileScreen from './screens/ProfileScreen';
import AssistantScreen from './screens/AssistantScreen';
import Login from './components/Login';
import { authAPI } from './services/api';

const EVAFitApp = () => {
  // Hooks de lógica de negocio
  const {
    meals, setMeals, recentFoods, setRecentFoods,
    newMeal, setNewMeal, dailyGoals, setDailyGoals,
    totalCalories, totalProtein, totalCarbs, totalFat,
    nutritionProgress, addMeal: addMealHook, addMealFromRecent: addMealFromRecentHook,
    isLoading: mealsLoading, error: mealsError, deleteMeal, refreshMeals, updateGoals
  } = useMeals();

  const {
    apiKey, setApiKey, fdcApiKey, setFdcApiKey,
    showApiKeyInput, setShowApiKeyInput, showFdcApiKeyInput, setShowFdcApiKeyInput,
    isAnalyzing, isSearching, searchFoodByName: searchFoodByNameAPI, getFoodNutrition: getFoodNutritionAPI,
    searchByBarcode: searchByBarcodeAPI, analyzeImageWithAI: analyzeImageWithAIAPI,
    sendMessageToAI: sendMessageToAIAPI, isOpenAIConfigured, isFDCConfigured, areAllApiKeysConfigured
  } = useApiKeys();

  const {
    workouts, isLoading: workoutsLoading, error: workoutsError,
    totalCaloriesBurned, workoutStats, todaysWorkouts,
    addWorkout, deleteWorkout, updateWorkout, refreshWorkouts
  } = useWorkouts();

  // Estados locales para navegación y UI
  const [activeTab, setActiveTab] = useState('home');
  
  // Estados para funcionalidades específicas
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, text: '¡Hola! Soy EVA, tu asistente nutricional. ¿En qué puedo ayudarte hoy?', sender: 'bot' }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Referencias para funcionalidades específicas
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Funciones utilitarias
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('No se pudo acceder a la cámara. Por favor, verifica los permisos.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      const imageDataURL = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageDataURL);
      stopCamera();
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Funciones principales que conectan con los hooks
  const addMeal = () => {
    addMealHook(setActiveTab, setShowQuickActions, setSearchResults, setSearchQuery);
  };

  const addMealFromRecent = (food) => {
    addMealFromRecentHook(food, setActiveTab, setShowQuickActions);
  };

  const searchFoodByName = async (query) => {
    const results = await searchFoodByNameAPI(query);
    setSearchResults(results);
  };

  const getFoodNutrition = async (fdcId) => {
    const nutrition = await getFoodNutritionAPI(fdcId);
    setSelectedFood(nutrition);
  };

  const searchByBarcode = async (barcode) => {
    const result = await searchByBarcodeAPI(barcode);
    if (result) {
      setSelectedFood(result);
    }
  };

  const analyzeImageWithAI = async (imageData) => {
    const result = await analyzeImageWithAIAPI(imageData);
    return result;
  };

  const sendMessageToAI = async (message) => {
    setIsSendingMessage(true);
    const response = await sendMessageToAIAPI(message);
    if (response) {
      setChatMessages(prev => [...prev, response]);
    }
    setIsSendingMessage(false);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage = { id: Date.now(), text: newMessage, sender: 'user' };
    setChatMessages(prev => [...prev, userMessage]);
    
    const messageToSend = newMessage;
    setNewMessage('');
    
    await sendMessageToAI(messageToSend);
  };

  const handleAnalyzeImage = async () => {
    if (!capturedImage) return;
    
    const result = await analyzeImageWithAI(capturedImage);
    if (result && result.foods && result.foods.length > 0) {
      setActiveTab('search');
      setSearchResults(result.foods);
    }
    setCapturedImage(null);
  };

  const handleBarcodeSearch = async () => {
    if (!scannedBarcode.trim()) return;
    await searchByBarcode(scannedBarcode);
    setScannedBarcode('');
    setShowScanner(false);
    setActiveTab('nutrition');
  };

  // Componente para renderizar cada pantalla
  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            totalCalories={totalCalories}
            totalProtein={totalProtein}
            totalCarbs={totalCarbs}
            totalFat={totalFat}
            dailyGoals={dailyGoals}
            meals={meals}
            mealsLoading={mealsLoading}
            recentFoods={recentFoods}
            setShowQuickActions={setShowQuickActions}
            addMealFromRecent={addMealFromRecent}
            deleteMeal={deleteMeal}
          />
        );

      case 'search':
        return (
          <div className="p-6 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Buscar Alimentos</h2>
              
              <div className="relative mb-4">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar alimento..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchFoodByName(searchQuery)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={() => searchFoodByName(searchQuery)}
                disabled={isSearching || !searchQuery.trim()}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSearching ? 'Buscando...' : 'Buscar'}
              </button>

              {!areAllApiKeysConfigured && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-yellow-800 text-sm">
                    Para usar la búsqueda necesitas configurar las API keys.
                    <button
                      onClick={() => setActiveTab('profile')}
                      className="ml-2 text-yellow-900 font-medium hover:underline"
                    >
                      Configurar ahora
                    </button>
                  </div>
                </div>
              )}
            </div>

            {searchResults.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Resultados</h3>
                <div className="space-y-3">
                  {searchResults.map((food, index) => (
                    <button
                      key={index}
                      onClick={() => getFoodNutrition(food.fdcId)}
                      className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
                    >
                      <div className="font-medium text-gray-800">{food.description}</div>
                      {food.brandOwner && (
                        <div className="text-sm text-gray-600">{food.brandOwner}</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'recent':
        return (
          <div className="p-6 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Comidas Recientes</h2>
              {recentFoods.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <div className="text-gray-500">No hay comidas recientes</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentFoods.map((food, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{food.name}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            {food.calories} kcal • {food.protein}g proteína • {food.carbs}g carbohidratos • {food.fat}g grasas
                          </div>
                        </div>
                        <button
                          onClick={() => addMealFromRecent(food)}
                          className="ml-4 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                          Agregar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'barcode':
        return (
          <div className="p-6 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Escanear Código de Barras</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código de barras
                  </label>
                  <input
                    type="text"
                    value={scannedBarcode}
                    onChange={(e) => setScannedBarcode(e.target.value)}
                    placeholder="Ingresa el código de barras"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={handleBarcodeSearch}
                  disabled={!scannedBarcode.trim() || isSearching}
                  className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSearching ? 'Buscando...' : 'Buscar Producto'}
                </button>

                {!isFDCConfigured && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="text-yellow-800 text-sm">
                      Para usar el escáner necesitas configurar la API key de FoodData Central.
                      <button
                        onClick={() => setActiveTab('profile')}
                        className="ml-2 text-yellow-900 font-medium hover:underline"
                      >
                        Configurar ahora
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'nutrition':
        return (
          <div className="p-6 space-y-6">
            {selectedFood ? (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Información Nutricional</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-800 mb-2">{selectedFood.description}</h3>
                    {selectedFood.brandOwner && (
                      <p className="text-sm text-gray-600">{selectedFood.brandOwner}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">Calorías</div>
                      <div className="text-xl font-bold text-gray-800">{selectedFood.calories || 0}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">Proteína</div>
                      <div className="text-xl font-bold text-gray-800">{selectedFood.protein || 0}g</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">Carbohidratos</div>
                      <div className="text-xl font-bold text-gray-800">{selectedFood.carbs || 0}g</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">Grasas</div>
                      <div className="text-xl font-bold text-gray-800">{selectedFood.fat || 0}g</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cantidad (gramos)
                      </label>
                      <input
                        type="number"
                        value={newMeal.quantity}
                        onChange={(e) => setNewMeal({...newMeal, quantity: parseFloat(e.target.value) || 0})}
                        placeholder="100"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>

                    <button
                      onClick={() => {
                        setNewMeal({
                          ...newMeal,
                          name: selectedFood.description,
                          calories: Math.round((selectedFood.calories || 0) * (newMeal.quantity / 100)),
                          protein: Math.round((selectedFood.protein || 0) * (newMeal.quantity / 100)),
                          carbs: Math.round((selectedFood.carbs || 0) * (newMeal.quantity / 100)),
                          fat: Math.round((selectedFood.fat || 0) * (newMeal.quantity / 100))
                        });
                        addMeal();
                        setSelectedFood(null);
                      }}
                      className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      Agregar a Mis Comidas
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <div className="text-gray-500">Selecciona un alimento para ver su información nutricional</div>
                </div>
              </div>
            )}
          </div>
        );

      case 'workouts':
        return (
          <WorkoutsScreen
            workouts={workouts}
            workoutsLoading={workoutsLoading}
            workoutsError={workoutsError}
            workoutStats={workoutStats}
            totalCaloriesBurned={totalCaloriesBurned}
            deleteWorkout={deleteWorkout}
          />
        );

      case 'assistant':
        return (
          <div className="p-6 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm h-96 flex flex-col">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Asistente Nutricional</h2>
              
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-2 max-w-xs ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.sender === 'user' ? 'bg-emerald-600' : 'bg-gray-600'
                      }`}>
                        {message.sender === 'user' ? 
                          <User className="w-4 h-4 text-white" /> : 
                          <Bot className="w-4 h-4 text-white" />
                        }
                      </div>
                      <div className={`p-3 rounded-lg ${
                        message.sender === 'user' 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <div className="text-sm">{message.text}</div>
                      </div>
                    </div>
                  </div>
                ))}
                {isSendingMessage && (
                  <div className="flex justify-start">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <div className="text-sm text-gray-600">EVA está escribiendo...</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {!isOpenAIConfigured && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-yellow-800 text-sm">
                    Para usar el asistente necesitas configurar la API key de OpenAI.
                    <button
                      onClick={() => setActiveTab('profile')}
                      className="ml-2 text-yellow-900 font-medium hover:underline"
                    >
                      Configurar ahora
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Botón de análisis de imagen */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Análisis de Imágenes</h3>
              
              <div className="space-y-4">
                <div className="flex space-x-3">
                  <button
                    onClick={startCamera}
                    className="flex-1 bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Tomar Foto</span>
                  </button>
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Scan className="w-5 h-5" />
                    <span>Subir Imagen</span>
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {capturedImage && (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <img src={capturedImage} alt="Captured" className="w-full h-48 object-cover rounded-lg" />
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={handleAnalyzeImage}
                        disabled={isAnalyzing}
                        className="flex-1 bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isAnalyzing ? 'Analizando...' : 'Analizar Imagen'}
                      </button>
                      
                      <button
                        onClick={() => setCapturedImage(null)}
                        className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                {!isOpenAIConfigured && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="text-yellow-800 text-sm">
                      Para usar el análisis de imágenes necesitas configurar la API key de OpenAI.
                      <button
                        onClick={() => setActiveTab('profile')}
                        className="ml-2 text-yellow-900 font-medium hover:underline"
                      >
                        Configurar ahora
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'progress':
        return (
          <div className="p-6 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">Progreso Diario</h2>
              
              <div className="text-center mb-6">
                <CalorieDonutChart consumed={totalCalories} goal={dailyGoals.calories} />
                <div className="mt-2">
                  <div className="text-xl font-bold text-gray-800">{totalCalories} kcal</div>
                  <div className="text-sm text-gray-500">
                    de {dailyGoals.calories} kcal objetivo
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <MacroBar
                  label="Proteína"
                  current={totalProtein}
                  goal={dailyGoals.protein}
                  color="bg-blue-500"
                />
                <MacroBar
                  label="Carbohidratos"
                  current={totalCarbs}
                  goal={dailyGoals.carbs}
                  color="bg-green-500"
                />
                <MacroBar
                  label="Grasas"
                  current={totalFat}
                  goal={dailyGoals.fat}
                  color="bg-orange-500"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Estadísticas</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-emerald-600">{meals.length}</div>
                  <div className="text-sm text-gray-600">Comidas registradas</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{workoutStats.totalWorkouts}</div>
                  <div className="text-sm text-gray-600">Entrenamientos</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.round((totalCalories / dailyGoals.calories) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Meta calórica</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {totalCaloriesBurned}
                  </div>
                  <div className="text-sm text-gray-600">Kcal quemadas</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'profile':
        return (
          <ProfileScreen
            dailyGoals={dailyGoals}
            setDailyGoals={setDailyGoals}
            apiKey={apiKey}
            setApiKey={setApiKey}
            fdcApiKey={fdcApiKey}
            setFdcApiKey={setFdcApiKey}
            showApiKeyInput={showApiKeyInput}
            setShowApiKeyInput={setShowApiKeyInput}
            showFdcApiKeyInput={showFdcApiKeyInput}
            setShowFdcApiKeyInput={setShowFdcApiKeyInput}
            isOpenAIConfigured={isOpenAIConfigured}
            isFDCConfigured={isFDCConfigured}
            refreshMeals={refreshMeals}
          />
        );

      default:
        return <div>Pantalla no encontrada</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modal de cámara */}
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Tomar Foto</h3>
              <button onClick={stopCamera}>
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-64 bg-gray-200 rounded-lg object-cover"
              />
              
              <button
                onClick={captureImage}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Capturar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Canvas oculto para captura */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Modal de acciones rápidas */}
      <QuickActionsModal
        isVisible={showQuickActions}
        onClose={() => setShowQuickActions(false)}
        onNavigate={setActiveTab}
      />

      {/* Contenido principal */}
      <div className="pb-20">
        {renderScreen()}
      </div>

      {/* Botón flotante */}
      <button
        onClick={() => setShowQuickActions(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-all duration-200 flex items-center justify-center z-30"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Navegación inferior - Diseño minimalista */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-2 z-20">
        <div className="flex justify-around">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
              activeTab === 'home' 
                ? 'text-emerald-600 bg-emerald-50' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs mt-1">Inicio</span>
          </button>
          
          <button
            onClick={() => setActiveTab('progress')}
            className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
              activeTab === 'progress' 
                ? 'text-emerald-600 bg-emerald-50' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <TrendingUp className="w-6 h-6" />
            <span className="text-xs mt-1">Progreso</span>
          </button>
          
          <button
            onClick={() => setActiveTab('assistant')}
            className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
              activeTab === 'assistant' 
                ? 'text-emerald-600 bg-emerald-50' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-xs mt-1">EVA</span>
          </button>
          
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
              activeTab === 'profile' 
                ? 'text-emerald-600 bg-emerald-50' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <UserCircle className="w-6 h-6" />
            <span className="text-xs mt-1">Perfil</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EVAFitApp;