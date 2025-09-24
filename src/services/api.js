// services/api.js - Conectado al backend real
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Función para obtener el token de autenticación
const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

// Función para guardar el token de autenticación
const setAuthToken = (token) => {
  localStorage.setItem('auth_token', token);
};

// Función para remover el token de autenticación
const removeAuthToken = () => {
  localStorage.removeItem('auth_token');
};

// Función helper para hacer peticiones HTTP
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      // Manejar errores de autenticación
      if (response.status === 401) {
        removeAuthToken();
        window.location.href = '/login'; // Redirigir al login si no hay token válido
        throw new Error('Sesión expirada. Inicia sesión nuevamente.');
      }
      throw new Error(data.error || 'Error en la petición');
    }

    return { data, success: true };
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    return { error: error.message, success: false };
  }
};

// API para autenticación
export const authAPI = {
  // Registrar usuario
  async register(userData) {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    
    if (response.success && response.data.token) {
      setAuthToken(response.data.token);
    }
    
    return response;
  },

  // Iniciar sesión
  async login(credentials) {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    
    if (response.success && response.data.token) {
      setAuthToken(response.data.token);
    }
    
    return response;
  },

  // Cerrar sesión
  logout() {
    removeAuthToken();
    window.location.href = '/login';
  },

  // Obtener perfil
  async getProfile() {
    return await apiRequest('/auth/profile');
  },

  // Actualizar perfil
  async updateProfile(profileData) {
    return await apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },

  // Verificar si hay token
  isAuthenticated() {
    return !!getAuthToken();
  }
};

// API para comidas
export const mealsAPI = {
  // Obtener todas las comidas
  async getAll() {
    return await apiRequest('/meals');
  },

  // Obtener comidas de hoy
  async getToday() {
    const response = await apiRequest('/meals/today');
    return response.success 
      ? { data: response.data.meals, success: true }
      : response;
  },

  // Crear nueva comida
  async create(mealData) {
    const response = await apiRequest('/meals', {
      method: 'POST',
      body: JSON.stringify({
        name: mealData.name,
        calories: parseInt(mealData.calories) || 0,
        protein: parseFloat(mealData.protein) || 0,
        carbs: parseFloat(mealData.carbs) || 0,
        fat: parseFloat(mealData.fat) || 0,
        quantity: parseFloat(mealData.quantity) || 100
      })
    });
    
    return response.success 
      ? { data: response.data.meal, success: true }
      : response;
  },

  // Actualizar comida
  async update(id, mealData) {
    const response = await apiRequest(`/meals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(mealData)
    });
    
    return response.success 
      ? { data: response.data.meal, success: true }
      : response;
  },

  // Eliminar comida
  async delete(id) {
    return await apiRequest(`/meals/${id}`, {
      method: 'DELETE'
    });
  },

  // Obtener estadísticas nutricionales
  async getStats() {
    const response = await apiRequest('/meals/stats');
    return response.success 
      ? { data: response.data.stats, success: true }
      : response;
  }
};

// API para entrenamientos (básica por ahora)
export const workoutsAPI = {
  async getAll() {
    // Datos simulados por ahora - más tarde crearemos la API real
    const mockWorkouts = [
      { id: 1, name: 'Push-ups', duration: 15, calories: 120, date: new Date().toISOString().split('T')[0] },
      { id: 2, name: 'Running', duration: 30, calories: 300, date: new Date().toISOString().split('T')[0] }
    ];
    return { data: mockWorkouts, success: true };
  },

  async create(workoutData) {
    // Simulado por ahora
    const newWorkout = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      ...workoutData
    };
    return { data: newWorkout, success: true };
  },

  async delete(id) {
    // Simulado por ahora
    return { success: true };
  }
};

// API para objetivos diarios
export const goalsAPI = {
  async get() {
    const profile = await authAPI.getProfile();
    if (profile.success && profile.data.user.dailyGoals) {
      return { data: profile.data.user.dailyGoals, success: true };
    }
    
    // Valores por defecto si no hay objetivos guardados
    const defaultGoals = {
      calories: 2000,
      protein: 150,
      carbs: 250,
      fat: 65
    };
    
    return { data: defaultGoals, success: true };
  },

  async update(newGoals) {
    return await authAPI.updateProfile({ dailyGoals: newGoals });
  }
};

// API para comidas recientes
export const recentFoodsAPI = {
  async get() {
    const response = await apiRequest('/meals/recent');
    return response.success 
      ? { data: response.data.recentFoods, success: true }
      : response;
  },

  async add(foodData) {
    // Las comidas recientes se agregan automáticamente al crear una comida
    // Esta función no es necesaria pero la mantenemos por compatibilidad
    return { success: true };
  }
};

// API para chat (simulada por ahora)
export const chatAPI = {
  async getHistory() {
    const history = JSON.parse(localStorage.getItem('chat_history') || '[]');
    if (history.length === 0) {
      history.push({
        id: 1,
        type: 'assistant',
        message: '¡Hola! Soy Eva, tu asistente personal de fitness. Puedo ayudarte con preguntas sobre nutrición, entrenamientos y analizar tus patrones alimenticios. ¿En qué puedo ayudarte?',
        timestamp: new Date().toISOString()
      });
    }
    return { data: history, success: true };
  },

  async addMessage(message, type = 'user') {
    const history = JSON.parse(localStorage.getItem('chat_history') || '[]');
    const newMessage = {
      id: Date.now(),
      type,
      message,
      timestamp: new Date().toISOString()
    };
    
    history.push(newMessage);
    
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
    
    localStorage.setItem('chat_history', JSON.stringify(history));
    return { data: newMessage, success: true };
  }
};

// API consolidada manteniendo la estructura anterior para compatibilidad
export const api = {
  auth: authAPI,
  meals: mealsAPI,
  workouts: workoutsAPI,
  goals: goalsAPI,
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