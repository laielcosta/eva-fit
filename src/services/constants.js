// services/constants.js - Constantes centralizadas para EVA Fit

// Colores del tema principal
export const COLORS = {
  primary: 'emerald',
  primaryShades: {
    50: 'emerald-50',
    100: 'emerald-100', 
    600: 'emerald-600',
    700: 'emerald-700'
  },
  macros: {
    protein: 'blue-500',
    carbs: 'green-500',
    fat: 'orange-500'
  },
  status: {
    success: 'green',
    error: 'red',
    warning: 'yellow',
    info: 'blue'
  },
  text: {
    primary: 'gray-800',
    secondary: 'gray-600',
    muted: 'gray-500',
    white: 'white'
  }
};

// Estilos comunes de Tailwind
export const STYLES = {
  card: 'bg-white rounded-2xl p-6 shadow-sm',
  cardSmall: 'bg-white rounded-xl p-4 shadow-sm',
  button: {
    primary: `bg-${COLORS.primaryShades[600]} text-white py-3 rounded-lg hover:bg-${COLORS.primaryShades[700]} transition-colors`,
    secondary: 'bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors',
    ghost: `text-${COLORS.primaryShades[600]} font-medium hover:text-${COLORS.primaryShades[700]}`,
    icon: `text-${COLORS.text.muted} hover:text-${COLORS.text.secondary}`
  },
  input: `w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${COLORS.primaryShades[600]} focus:border-transparent`,
  modal: 'fixed inset-0 z-40 bg-black bg-opacity-50 flex items-end justify-center',
  modalContent: 'bg-white rounded-t-2xl w-full max-w-md p-6 space-y-4'
};

// Configuraciones de la aplicación
export const APP_CONFIG = {
  name: 'EVA Fit',
  version: '1.0.0',
  theme: {
    primaryColor: COLORS.primary,
    borderRadius: '2xl',
    shadowSize: 'sm'
  },
  limits: {
    maxRecentFoods: 10,
    maxChatMessages: 100,
    maxMealsPerDay: 20,
    maxWorkoutsPerDay: 10
  },
  defaults: {
    dailyGoals: {
      calories: 2000,
      protein: 150,
      carbs: 250,
      fat: 65
    },
    mealQuantity: 100,
    workoutDuration: 30
  }
};

// Textos y mensajes
export const MESSAGES = {
  loading: {
    meals: 'Cargando comidas...',
    workouts: 'Cargando entrenamientos...',
    search: 'Buscando...',
    analyzing: 'Analizando...',
    general: 'Cargando...'
  },
  errors: {
    apiKeyMissing: 'Por favor, configura tu API Key',
    networkError: 'Error de conexión. Intenta de nuevo.',
    genericError: 'Ha ocurrido un error. Intenta de nuevo.',
    noResults: 'No se encontraron resultados',
    cameraAccess: 'No se pudo acceder a la cámara. Verifica los permisos.'
  },
  empty: {
    meals: 'No has registrado comidas hoy',
    workouts: 'No hay entrenamientos registrados',
    recentFoods: 'No hay comidas recientes',
    chatHistory: 'Inicia una conversación con EVA'
  },
  placeholders: {
    searchFood: 'Buscar alimento...',
    barcode: 'Ingresa el código de barras',
    chatMessage: 'Pregunta sobre nutrición...',
    apiKey: 'sk-...',
    fdcApiKey: 'DEMO_KEY o tu API key',
    quantity: '100'
  },
  actions: {
    add: 'Agregar',
    delete: 'Eliminar',
    edit: 'Editar',
    save: 'Guardar',
    cancel: 'Cancelar',
    refresh: 'Refrescar',
    configure: 'Configurar',
    search: 'Buscar',
    analyze: 'Analizar',
    capture: 'Capturar'
  }
};

// Configuraciones de API
export const API_CONFIG = {
  delays: {
    simulation: 300, // ms para simular latencia de red
    debounce: 500    // ms para debounce en búsquedas
  },
  endpoints: {
    openai: 'https://api.openai.com/v1/chat/completions',
    fdc: 'https://api.nal.usda.gov/fdc/v1',
    openFoodFacts: 'https://world.openfoodfacts.org/api/v0'
  },
  limits: {
    retries: 3,
    timeout: 30000, // 30 segundos
    rateLimitPerHour: 100
  }
};

// Keys para localStorage
export const STORAGE_KEYS = {
  meals: 'eva_fit_meals',
  goals: 'eva_fit_daily_goals',
  recentFoods: 'eva_fit_recent_foods',
  workouts: 'eva_fit_workouts',
  apiKeys: 'eva_fit_api_keys',
  fdcApiKey: 'eva_fit_fdc_api_key',
  userProfile: 'eva_fit_user_profile',
  chatHistory: 'eva_fit_chat_history',
  settings: 'eva_fit_settings'
};

// Configuraciones de navegación
export const NAVIGATION = {
  tabs: [
    { id: 'home', label: 'Inicio', icon: 'Home' },
    { id: 'progress', label: 'Progreso', icon: 'TrendingUp' },
    { id: 'assistant', label: 'EVA', icon: 'MessageCircle' },
    { id: 'profile', label: 'Perfil', icon: 'UserCircle' }
  ],
  quickActions: [
    { id: 'search', label: 'Buscar Alimento', icon: 'Search', screen: 'search' },
    { id: 'barcode', label: 'Escanear Código', icon: 'Scan', screen: 'barcode' },
    { id: 'workout', label: 'Registrar Ejercicio', icon: 'Dumbbell', screen: 'workouts' },
    { id: 'photo', label: 'Foto de Comida', icon: 'Camera', screen: 'assistant' }
  ]
};

// Configuraciones de macronutrientes
export const NUTRITION_CONFIG = {
  macros: {
    protein: {
      name: 'Proteína',
      color: COLORS.macros.protein,
      unit: 'g',
      caloriesPerGram: 4
    },
    carbs: {
      name: 'Carbohidratos', 
      color: COLORS.macros.carbs,
      unit: 'g',
      caloriesPerGram: 4
    },
    fat: {
      name: 'Grasas',
      color: COLORS.macros.fat,
      unit: 'g',
      caloriesPerGram: 9
    }
  },
  displayLimits: {
    maxCaloriesDisplay: 9999,
    maxMacroDisplay: 999,
    decimalPlaces: 1
  }
};

// Configuraciones de validación
export const VALIDATION = {
  meal: {
    nameMinLength: 2,
    nameMaxLength: 100,
    caloriesMin: 0,
    caloriesMax: 9999,
    macroMin: 0,
    macroMax: 999,
    quantityMin: 1,
    quantityMax: 9999
  },
  workout: {
    nameMinLength: 2,
    nameMaxLength: 50,
    durationMin: 1,
    durationMax: 600, // 10 horas
    caloriesMin: 0,
    caloriesMax: 2000
  },
  apiKey: {
    openaiMinLength: 20,
    fdcMinLength: 8
  }
};

// Configuraciones de formato
export const FORMATTING = {
  date: {
    display: 'es-ES',
    options: { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }
  },
  time: {
    display: 'es-ES',
    options: { 
      hour: '2-digit', 
      minute: '2-digit' 
    }
  },
  number: {
    maxDecimals: 1,
    thousandSeparator: '.',
    decimalSeparator: ','
  }
};

// Exportación por defecto con toda la configuración
export default {
  COLORS,
  STYLES,
  APP_CONFIG,
  MESSAGES,
  API_CONFIG,
  STORAGE_KEYS,
  NAVIGATION,
  NUTRITION_CONFIG,
  VALIDATION,
  FORMATTING
};