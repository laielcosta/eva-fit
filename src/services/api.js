// services/api.js - Capa de servicios que simula un backend
// Más tarde se puede reemplazar con llamadas HTTP reales

const STORAGE_KEYS = {
  MEALS: 'eva_fit_meals',
  WORKOUTS: 'eva_fit_workouts',
  GOALS: 'eva_fit_goals',
  USER_PROFILE: 'eva_fit_profile',
  RECENT_FOODS: 'eva_fit_recent_foods',
  CHAT_HISTORY: 'eva_fit_chat'
};

// Simulador de delay de red
const delay = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms));

// Utilidades de localStorage
const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }
};

// API para Comidas
export const mealsAPI = {
  // Obtener todas las comidas
  async getAll() {
    await delay();
    const meals = storage.get(STORAGE_KEYS.MEALS, []);
    return { data: meals, success: true };
  },

  // Obtener comidas de hoy
  async getToday() {
    await delay();
    const meals = storage.get(STORAGE_KEYS.MEALS, []);
    const today = new Date().toDateString();
    const todayMeals = meals.filter(meal => {
      const mealDate = new Date(meal.time).toDateString();
      return mealDate === today;
    });
    return { data: todayMeals, success: true };
  },

  // Crear nueva comida
  async create(mealData) {
    await delay();
    const meals = storage.get(STORAGE_KEYS.MEALS, []);
    const newMeal = {
      id: Date.now(),
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString(),
      ...mealData
    };
    
    meals.push(newMeal);
    storage.set(STORAGE_KEYS.MEALS, meals);
    
    return { data: newMeal, success: true };
  },

  // Actualizar comida
  async update(id, mealData) {
    await delay();
    const meals = storage.get(STORAGE_KEYS.MEALS, []);
    const index = meals.findIndex(meal => meal.id === id);
    
    if (index === -1) {
      return { error: 'Comida no encontrada', success: false };
    }
    
    meals[index] = { ...meals[index], ...mealData, updatedAt: new Date().toISOString() };
    storage.set(STORAGE_KEYS.MEALS, meals);
    
    return { data: meals[index], success: true };
  },

  // Eliminar comida
  async delete(id) {
    await delay();
    const meals = storage.get(STORAGE_KEYS.MEALS, []);
    const filteredMeals = meals.filter(meal => meal.id !== id);
    storage.set(STORAGE_KEYS.MEALS, filteredMeals);
    
    return { success: true };
  },

  // Obtener estadísticas nutricionales
  async getStats(date = null) {
    await delay();
    const { data: meals } = await this.getToday();
    
    const stats = {
      totalCalories: meals.reduce((sum, meal) => sum + meal.calories, 0),
      totalProtein: meals.reduce((sum, meal) => sum + meal.protein, 0),
      totalCarbs: meals.reduce((sum, meal) => sum + meal.carbs, 0),
      totalFat: meals.reduce((sum, meal) => sum + meal.fat, 0),
      mealCount: meals.length
    };
    
    return { data: stats, success: true };
  }
};

// API para Entrenamientos
export const workoutsAPI = {
  async getAll() {
    await delay();
    const workouts = storage.get(STORAGE_KEYS.WORKOUTS, [
      { id: 1, name: 'Entrenamiento de Pecho', duration: '45 min', exercises: 8, calories: 280, date: 'Hoy' },
      { id: 2, name: 'Cardio HIIT', duration: '30 min', exercises: 6, calories: 320, date: 'Ayer' }
    ]);
    return { data: workouts, success: true };
  },

  async create(workoutData) {
    await delay();
    const workouts = storage.get(STORAGE_KEYS.WORKOUTS, []);
    const newWorkout = {
      id: Date.now(),
      date: 'Hoy',
      createdAt: new Date().toISOString(),
      calories: Math.floor(Math.random() * 200) + 150, // Simulación
      ...workoutData
    };
    
    workouts.push(newWorkout);
    storage.set(STORAGE_KEYS.WORKOUTS, workouts);
    
    return { data: newWorkout, success: true };
  },

  async delete(id) {
    await delay();
    const workouts = storage.get(STORAGE_KEYS.WORKOUTS, []);
    const filteredWorkouts = workouts.filter(workout => workout.id !== id);
    storage.set(STORAGE_KEYS.WORKOUTS, filteredWorkouts);
    
    return { success: true };
  }
};

// API para Metas y Objetivos
export const goalsAPI = {
  async get() {
    await delay();
    const goals = storage.get(STORAGE_KEYS.GOALS, {
      calories: 2000,
      protein: 150,
      carbs: 250,
      fat: 65
    });
    return { data: goals, success: true };
  },

  async update(newGoals) {
    await delay();
    storage.set(STORAGE_KEYS.GOALS, newGoals);
    return { data: newGoals, success: true };
  }
};

// API para Perfil de Usuario
export const userAPI = {
  async getProfile() {
    await delay();
    const profile = storage.get(STORAGE_KEYS.USER_PROFILE, {
      name: 'Usuario',
      weight: 70,
      height: 175,
      age: 25,
      activity: 'moderate',
      goal: 'maintain'
    });
    return { data: profile, success: true };
  },

  async updateProfile(profileData) {
    await delay();
    const currentProfile = storage.get(STORAGE_KEYS.USER_PROFILE, {});
    const updatedProfile = { ...currentProfile, ...profileData };
    storage.set(STORAGE_KEYS.USER_PROFILE, updatedProfile);
    return { data: updatedProfile, success: true };
  }
};

// API para Alimentos Recientes
export const recentFoodsAPI = {
  async get() {
    await delay();
    const recentFoods = storage.get(STORAGE_KEYS.RECENT_FOODS, [
      { name: 'Pollo a la plancha', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
      { name: 'Arroz integral', calories: 123, protein: 2.6, carbs: 23, fat: 0.9 },
      { name: 'Plátano', calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
      { name: 'Avena', calories: 68, protein: 2.4, carbs: 12, fat: 1.4 }
    ]);
    return { data: recentFoods, success: true };
  },

  async add(foodData) {
    await delay();
    const recentFoods = storage.get(STORAGE_KEYS.RECENT_FOODS, []);
    
    // Evitar duplicados
    const existingIndex = recentFoods.findIndex(food => food.name === foodData.name);
    if (existingIndex !== -1) {
      recentFoods.splice(existingIndex, 1);
    }
    
    // Agregar al inicio y limitar a 10 elementos
    recentFoods.unshift({ ...foodData, lastUsed: new Date().toISOString() });
    const limitedFoods = recentFoods.slice(0, 10);
    
    storage.set(STORAGE_KEYS.RECENT_FOODS, limitedFoods);
    return { data: limitedFoods, success: true };
  }
};

// API para Chat
export const chatAPI = {
  async getHistory() {
    await delay();
    const history = storage.get(STORAGE_KEYS.CHAT_HISTORY, [
      {
        id: 1,
        type: 'assistant',
        message: '¡Hola! Soy Eva, tu asistente personal de fitness. Puedo ayudarte con preguntas sobre nutrición, entrenamientos y analizar tus patrones alimenticios. ¿En qué puedo ayudarte?',
        timestamp: new Date().toISOString()
      }
    ]);
    return { data: history, success: true };
  },

  async addMessage(message, type = 'user') {
    await delay();
    const history = storage.get(STORAGE_KEYS.CHAT_HISTORY, []);
    const newMessage = {
      id: Date.now(),
      type,
      message,
      timestamp: new Date().toISOString()
    };
    
    history.push(newMessage);
    
    // Limitar a 100 mensajes para no llenar localStorage
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
    
    storage.set(STORAGE_KEYS.CHAT_HISTORY, history);
    return { data: newMessage, success: true };
  },

  async clearHistory() {
    await delay();
    storage.set(STORAGE_KEYS.CHAT_HISTORY, []);
    return { success: true };
  }
};

// API consolidada
export const api = {
  meals: mealsAPI,
  workouts: workoutsAPI,
  goals: goalsAPI,
  user: userAPI,
  recentFoods: recentFoodsAPI,
  chat: chatAPI
};

// Función helper para manejo de errores
export const handleAPIError = (error) => {
  console.error('API Error:', error);
  return {
    success: false,
    error: error.message || 'Error desconocido'
  };
};

export default api;