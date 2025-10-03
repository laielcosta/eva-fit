import React, { useState, useRef, useEffect } from 'react';
import { Camera, Plus } from 'lucide-react';
import { useMeals } from './hooks/useMeals';
import { useApiKeys } from './hooks/useApiKeys';
import { useWorkouts } from './hooks/useWorkouts';
import QuickActionsModal from './components/QuickActionsModal';
import BottomNavigation from './components/BottomNavigation';
import HomeScreen from './screens/HomeScreen';
import WorkoutsScreen from './screens/WorkoutsScreen';
import ProfileScreen from './screens/ProfileScreen';
import AssistantScreen from './screens/AssistantScreen';
import Login from './components/Login';
import { authAPI } from './services/api';
import ProgressScreen from './screens/ProgressScreen';

const EVAFitApp = () => {
  // Estado de autenticación - NUEVO
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar si hay sesión activa al cargar la app
  useEffect(() => {
    const checkAuth = async () => {
      if (authAPI.isAuthenticated()) {
        try {
          const response = await authAPI.getProfile();
          if (response.success) {
            setUser(response.data.user);
          } else {
            // Si el token es inválido, limpiar
            authAPI.logout();
          }
        } catch (error) {
          console.error('Error checking auth:', error);
          authAPI.logout();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Hooks de lógica de negocio
  const {
    meals, setMeals, recentFoods, setRecentFoods,
    newMeal, setNewMeal, dailyGoals, setDailyGoals,
    totalCalories, totalProtein, totalCarbs, totalFat,
    nutritionProgress, addMeal: addMealHook, addMealFromRecent: addMealFromRecentHook,
    isLoading: mealsLoading, error: mealsError, deleteMeal, refreshMeals, updateGoals, loadInitialData
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
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, text: '¡Hola! Soy EVA, tu asistente nutricional. ¿En qué puedo ayudarte hoy?', sender: 'bot' }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Función para manejar login exitoso
// En App.js, encuentra esta función y reemplázala:

const handleLoginSuccess = async (userData) => {
  setUser(userData);
  
  // ✅ Cargar datos DESPUÉS del login exitoso
  await loadInitialData(); // Hook de meals
  refreshWorkouts();      // Hook de workouts
};

  // Función para cerrar sesión
  const handleLogout = () => {
    authAPI.logout();
    setUser(null);
    // Limpiar datos locales
    setMeals([]);
    setRecentFoods([]);
  };

  // Mostrar pantalla de carga mientras verificamos autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario logueado, mostrar Login
  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Funciones auxiliares (las que ya tenías)
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
    setActiveTab('nutrition');
  };



// Luego, dentro de la función renderScreen(), actualiza el switch:
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

    case 'progress':
      return (
        <ProgressScreen
          totalCalories={totalCalories}
          totalProtein={totalProtein}
          totalCarbs={totalCarbs}
          totalFat={totalFat}
          dailyGoals={dailyGoals}
          nutritionProgress={nutritionProgress}
          isLoading={mealsLoading}
        />
      );

    case 'assistant':
      return (
        <AssistantScreen
          chatMessages={chatMessages}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          isSendingMessage={isSendingMessage}
          capturedImage={capturedImage}
          setCapturedImage={setCapturedImage}
          isOpenAIConfigured={isOpenAIConfigured}
          isAnalyzing={isAnalyzing}
          fileInputRef={fileInputRef}
          handleSendMessage={handleSendMessage}
          handleAnalyzeImage={handleAnalyzeImage}
          startCamera={startCamera}
          setActiveTab={setActiveTab}
        />
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

    case 'profile':
      return (
        <ProfileScreen
          user={user}
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
          onLogout={handleLogout}
        />
      );

    default:
      return <div>Pantalla en desarrollo</div>;
  }
};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modal de cámara */}
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-64 bg-gray-200 rounded-lg object-cover"
            />
            <div className="flex space-x-3 mt-4">
              <button
                onClick={captureImage}
                className="flex-1 bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700"
              >
                Capturar
              </button>
              <button
                onClick={stopCamera}
                className="px-6 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />

      <QuickActionsModal
        isVisible={showQuickActions}
        onClose={() => setShowQuickActions(false)}
        onNavigate={setActiveTab}
      />

      <div className="pb-20">
        {renderScreen()}
      </div>

      <button
        onClick={() => setShowQuickActions(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-all duration-200 flex items-center justify-center z-30"
      >
        <Plus className="w-6 h-6" />
      </button>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default EVAFitApp;