import React from 'react';
import { Dumbbell, X } from 'lucide-react';
import { STYLES, MESSAGES, COLORS } from '../services/constants';

const WorkoutsScreen = ({
  // Estados
  workouts,
  workoutsLoading,
  workoutsError,
  workoutStats,
  totalCaloriesBurned,
  
  // Funciones
  deleteWorkout
}) => {
  return (
    <div className="p-6 space-y-6">
      {/* Lista de Entrenamientos */}
      <div className={STYLES.card}>
        <h2 className={`text-lg font-semibold text-${COLORS.text.primary} mb-4`}>Entrenamientos</h2>
        
        {workoutsLoading ? (
          <div className="text-center py-8">
            <div className={`text-${COLORS.text.muted}`}>{MESSAGES.loading.workouts}</div>
          </div>
        ) : workouts.length === 0 ? (
          <div className="text-center py-8">
            <Dumbbell className={`w-12 h-12 text-${COLORS.text.muted} mx-auto mb-3`} />
            <div className={`text-${COLORS.text.muted} mb-2`}>{MESSAGES.empty.workouts}</div>
            <button
              onClick={() => {
                console.log('Agregar entrenamiento');
              }}
              className={`text-${COLORS.primaryShades[600]} font-medium hover:text-${COLORS.primaryShades[700]}`}
            >
              Registrar primer entrenamiento
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {workouts.map((workout) => (
              <div key={workout.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <div className={`font-medium text-${COLORS.text.primary}`}>{workout.name}</div>
                    <div className={`text-sm text-${COLORS.text.secondary}`}>
                      {workout.duration} min • {workout.calories} kcal quemadas
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`text-sm text-${COLORS.text.muted}`}>{workout.date}</div>
                    <button
                      onClick={() => deleteWorkout(workout.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {workoutsError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-800 text-sm">{workoutsError}</div>
          </div>
        )}
      </div>

      {/* Estadísticas de entrenamientos */}
      <div className={STYLES.card}>
        <h3 className={`text-lg font-semibold text-${COLORS.text.primary} mb-4`}>Estadísticas de Entrenamiento</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className={`text-2xl font-bold text-${COLORS.primaryShades[600]}`}>{workoutStats.totalWorkouts}</div>
            <div className={`text-sm text-${COLORS.text.secondary}`}>Total entrenamientos</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{totalCaloriesBurned}</div>
            <div className={`text-sm text-${COLORS.text.secondary}`}>Calorías quemadas</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600">{workoutStats.averageCaloriesPerWorkout}</div>
            <div className={`text-sm text-${COLORS.text.secondary}`}>Promedio por sesión</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{workoutStats.totalDuration}</div>
            <div className={`text-sm text-${COLORS.text.secondary}`}>Minutos totales</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutsScreen;