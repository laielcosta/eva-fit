import { useState, useEffect } from 'react';

export const useWorkouts = () => {
  // Estado inicial - exactamente igual que en tu App.js actual
  const [workouts, setWorkouts] = useState([
    { id: 1, name: 'Push-ups', duration: 15, calories: 120, date: new Date().toISOString().split('T')[0] },
    { id: 2, name: 'Running', duration: 30, calories: 300, date: new Date().toISOString().split('T')[0] }
  ]);

  // Estados de carga (para futuro uso)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cálculos derivados
  const totalCaloriesBurned = workouts.reduce((total, workout) => total + workout.calories, 0);
  
  const workoutStats = {
    totalWorkouts: workouts.length,
    totalCaloriesBurned,
    averageCaloriesPerWorkout: workouts.length > 0 ? Math.round(totalCaloriesBurned / workouts.length) : 0,
    totalDuration: workouts.reduce((sum, workout) => sum + (workout.duration || 0), 0)
  };

  // Entrenamientos de hoy
  const todaysWorkouts = workouts.filter(workout => {
    const today = new Date().toISOString().split('T')[0];
    return workout.date === today;
  });

  // Funciones básicas (por ahora solo manipulan el estado local)
  const addWorkout = (workout) => {
    const newWorkout = {
      ...workout,
      id: Date.now(),
      date: new Date().toISOString().split('T')[0]
    };
    setWorkouts(prev => [...prev, newWorkout]);
    return newWorkout;
  };

  const deleteWorkout = (id) => {
    setWorkouts(prev => prev.filter(workout => workout.id !== id));
    return true;
  };

  const updateWorkout = (id, updatedData) => {
    setWorkouts(prev => prev.map(workout => 
      workout.id === id ? { ...workout, ...updatedData } : workout
    ));
    return true;
  };

  const refreshWorkouts = () => {
    // Por ahora no hace nada, pero mantiene la interfaz
    console.log('Refreshing workouts...');
  };

  return {
    // Estado
    workouts,
    setWorkouts, // Mantenemos por compatibilidad
    isLoading,
    error,
    
    // Estadísticas
    totalCaloriesBurned,
    workoutStats,
    todaysWorkouts,
    
    // Funciones
    addWorkout,
    deleteWorkout,
    updateWorkout,
    refreshWorkouts
  };
};