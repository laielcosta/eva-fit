import { useState, useEffect } from 'react';
import { api } from '../services/api';

export const useMeals = () => {
  // Estados - ahora se sincronizan con la API
  const [meals, setMeals] = useState([]);
  const [recentFoods, setRecentFoods] = useState([]);
  const [newMeal, setNewMeal] = useState({ 
    name: '', 
    calories: '', 
    protein: '', 
    carbs: '', 
    fat: '', 
    serving: '100'
  });
  const [dailyGoals, setDailyGoals] = useState({
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 65
  });

  // Estados de carga
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        // Cargar múltiples datos en paralelo
        const [mealsResponse, recentFoodsResponse, goalsResponse] = await Promise.all([
          api.meals.getToday(),
          api.recentFoods.get(),
          api.goals.get()
        ]);

        if (mealsResponse.success) setMeals(mealsResponse.data);
        if (recentFoodsResponse.success) setRecentFoods(recentFoodsResponse.data);
        if (goalsResponse.success) setDailyGoals(goalsResponse.data);

      } catch (err) {
        setError('Error cargando datos');
        console.error('Error loading initial data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Cálculos derivados - exactamente igual que antes
  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);
  const totalCarbs = meals.reduce((sum, meal) => sum + meal.carbs, 0);
  const totalFat = meals.reduce((sum, meal) => sum + meal.fat, 0);

  // Datos para gráficos de progreso - usando los totales calculados
  const nutritionProgress = [
    { day: 'Lun', calories: 1850, protein: 140, carbs: 220, fat: 60 },
    { day: 'Mar', calories: 2100, protein: 160, carbs: 280, fat: 70 },
    { day: 'Mié', calories: 1950, protein: 145, carbs: 240, fat: 65 },
    { day: 'Jue', calories: 2200, protein: 170, carbs: 300, fat: 75 },
    { day: 'Vie', calories: 1800, protein: 135, carbs: 200, fat: 55 },
    { day: 'Sáb', calories: 2300, protein: 180, carbs: 320, fat: 80 },
    { day: 'Dom', calories: totalCalories, protein: totalProtein, carbs: totalCarbs, fat: totalFat }
  ];

  // Función para agregar comida - ahora usa la API
  const addMeal = async (setActiveTab, setShowQuickActions, setSearchResults, setSearchQuery) => {
    if (!newMeal.name || !newMeal.calories) return;

    try {
      const servingRatio = parseInt(newMeal.serving) / 100;
      const mealData = {
        name: newMeal.name,
        calories: Math.round(parseInt(newMeal.calories) * servingRatio),
        protein: Math.round(parseFloat(newMeal.protein) * servingRatio * 10) / 10,
        carbs: Math.round(parseFloat(newMeal.carbs) * servingRatio * 10) / 10,
        fat: Math.round(parseFloat(newMeal.fat) * servingRatio * 10) / 10
      };

      // Llamada a la API
      const response = await api.meals.create(mealData);
      
      if (response.success) {
        // Actualizar estado local
        setMeals(prev => [...prev, response.data]);
        
        // Agregar a alimentos recientes
        await api.recentFoods.add({
          name: newMeal.name,
          calories: parseInt(newMeal.calories),
          protein: parseFloat(newMeal.protein),
          carbs: parseFloat(newMeal.carbs),
          fat: parseFloat(newMeal.fat)
        });

        // Limpiar formulario y navegar
        setNewMeal({ name: '', calories: '', protein: '', carbs: '', fat: '', serving: '100' });
        setSearchResults([]);
        setSearchQuery('');
        setActiveTab('home');
        setShowQuickActions(false);
      } else {
        setError('Error al agregar comida');
      }
    } catch (err) {
      setError('Error al agregar comida');
      console.error('Error adding meal:', err);
    }
  };

  // Función para agregar desde alimentos recientes - ahora usa la API
  const addMealFromRecent = async (food, setActiveTab, setShowQuickActions) => {
    try {
      setNewMeal({
        name: food.name,
        calories: food.calories.toString(),
        protein: food.protein.toString(),
        carbs: food.carbs.toString(),
        fat: food.fat.toString(),
        serving: '100'
      });
      
      // Actualizar el uso del alimento reciente
      await api.recentFoods.add(food);
      
      setActiveTab('nutrition');
      setShowQuickActions(false);
    } catch (err) {
      console.error('Error adding meal from recent:', err);
    }
  };

  // Función para actualizar metas
  const updateGoals = async (newGoals) => {
    try {
      const response = await api.goals.update(newGoals);
      if (response.success) {
        setDailyGoals(response.data);
      } else {
        setError('Error al actualizar metas');
      }
    } catch (err) {
      setError('Error al actualizar metas');
      console.error('Error updating goals:', err);
    }
  };

  // Función para eliminar comida
  const deleteMeal = async (mealId) => {
    try {
      const response = await api.meals.delete(mealId);
      if (response.success) {
        setMeals(prev => prev.filter(meal => meal.id !== mealId));
      } else {
        setError('Error al eliminar comida');
      }
    } catch (err) {
      setError('Error al eliminar comida');
      console.error('Error deleting meal:', err);
    }
  };

  // Función para refrescar datos
  const refreshMeals = async () => {
    try {
      const response = await api.meals.getToday();
      if (response.success) {
        setMeals(response.data);
      }
    } catch (err) {
      console.error('Error refreshing meals:', err);
    }
  };

  // Retornar todo lo que necesita el componente principal
  return {
    // Estados
    meals,
    setMeals,
    recentFoods,
    setRecentFoods,
    newMeal,
    setNewMeal,
    dailyGoals,
    setDailyGoals,
    
    // Estados de carga y error
    isLoading,
    error,
    setError,
    
    // Valores calculados
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    nutritionProgress,
    
    // Funciones
    addMeal,
    addMealFromRecent,
    updateGoals,
    deleteMeal,
    refreshMeals
  };
};