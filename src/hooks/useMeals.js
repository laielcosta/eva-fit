import { useState } from 'react';

export const useMeals = () => {
  // Estados relacionados con comidas
  const [meals, setMeals] = useState([
    {
      id: 1,
      name: 'Avena con frutas',
      time: '08:30',
      calories: 350,
      protein: 12,
      carbs: 58,
      fat: 8
    },
    {
      id: 2,
      name: 'Pollo con arroz',
      time: '13:15',
      calories: 520,
      protein: 35,
      carbs: 45,
      fat: 18
    },
    {
      id: 3,
      name: 'Ensalada de atún',
      time: '20:30',
      calories: 280,
      protein: 25,
      carbs: 15,
      fat: 12
    }
  ]);

  const [recentFoods, setRecentFoods] = useState([
    { name: 'Pollo a la plancha', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    { name: 'Arroz integral', calories: 123, protein: 2.6, carbs: 23, fat: 0.9 },
    { name: 'Plátano', calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
    { name: 'Avena', calories: 68, protein: 2.4, carbs: 12, fat: 1.4 }
  ]);

  const [newMeal, setNewMeal] = useState({ 
    name: '', 
    calories: '', 
    protein: '', 
    carbs: '', 
    fat: '', 
    serving: '100'
  });

  // Metas diarias
  const [dailyGoals, setDailyGoals] = useState({
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 65
  });

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

  // Función para agregar comida - exactamente igual que antes
  const addMeal = (setActiveTab, setShowQuickActions, setSearchResults, setSearchQuery) => {
    if (newMeal.name && newMeal.calories) {
      const servingRatio = parseInt(newMeal.serving) / 100;
      const meal = {
        id: meals.length + 1,
        name: newMeal.name,
        time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        calories: Math.round(parseInt(newMeal.calories) * servingRatio),
        protein: Math.round(parseFloat(newMeal.protein) * servingRatio * 10) / 10,
        carbs: Math.round(parseFloat(newMeal.carbs) * servingRatio * 10) / 10,
        fat: Math.round(parseFloat(newMeal.fat) * servingRatio * 10) / 10
      };
      setMeals([...meals, meal]);
      setNewMeal({ name: '', calories: '', protein: '', carbs: '', fat: '', serving: '100' });
      setSearchResults([]);
      setSearchQuery('');
      setActiveTab('home');
      setShowQuickActions(false);
    }
  };

  // Función para agregar desde alimentos recientes - exactamente igual que antes
  const addMealFromRecent = (food, setActiveTab, setShowQuickActions) => {
    setNewMeal({
      name: food.name,
      calories: food.calories.toString(),
      protein: food.protein.toString(),
      carbs: food.carbs.toString(),
      fat: food.fat.toString(),
      serving: '100'
    });
    setActiveTab('nutrition');
    setShowQuickActions(false);
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
    
    // Valores calculados
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    nutritionProgress,
    
    // Funciones
    addMeal,
    addMealFromRecent
  };
};