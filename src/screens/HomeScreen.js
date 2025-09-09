import React from 'react';
import { X } from 'lucide-react';
import CalorieDonutChart from '../components/CalorieDonutChart';
import MacroBar from '../components/MacroBar';

const HomeScreen = ({
  // Datos nutricionales
  totalCalories,
  totalProtein,
  totalCarbs,
  totalFat,
  dailyGoals,
  
  // Datos de comidas
  meals,
  mealsLoading,
  recentFoods,
  
  // Funciones
  setShowQuickActions,
  addMealFromRecent,
  deleteMeal
}) => {
  return (
    <div className="p-6 space-y-6">
      {/* Resumen Nutricional */}
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

      {/* Comidas de Hoy */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Comidas de Hoy</h3>
        {mealsLoading ? (
          <div className="text-center py-4">
            <div className="text-gray-500">Cargando comidas...</div>
          </div>
        ) : meals.length === 0 ? (
          <div className="text-center py-4">
            <div className="text-gray-500 mb-2">No has registrado comidas hoy</div>
            <button
              onClick={() => setShowQuickActions(true)}
              className="text-emerald-600 font-medium hover:text-emerald-700"
            >
              Agregar primera comida
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {meals.map((meal) => (
              <div key={meal.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-800">{meal.name}</div>
                  <div className="text-sm text-gray-600">
                    {meal.calories} kcal • {meal.protein}g proteína
                  </div>
                </div>
                <button
                  onClick={() => deleteMeal(meal.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comidas Recientes */}
      {recentFoods.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Comidas Recientes</h3>
          <div className="space-y-2">
            {recentFoods.slice(0, 3).map((food, index) => (
              <button
                key={index}
                onClick={() => addMealFromRecent(food)}
                className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="font-medium text-gray-800">{food.name}</div>
                <div className="text-sm text-gray-600">{food.calories} kcal</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeScreen;