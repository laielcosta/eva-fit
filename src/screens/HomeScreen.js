import React from 'react';
import { X } from 'lucide-react';
import CalorieDonutChart from '../components/CalorieDonutChart';
import MacroBar from '../components/MacroBar';
import { STYLES, MESSAGES, COLORS, NUTRITION_CONFIG } from '../services/constants';

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
      <div className={STYLES.card}>
        <div className="text-center mb-6">
          <h2 className={`text-lg font-semibold text-${COLORS.text.primary} mb-2`}>Resumen Nutricional</h2>
          <CalorieDonutChart consumed={totalCalories} goal={dailyGoals.calories} />
          <div className="mt-2">
            <div className={`text-xl font-bold text-${COLORS.text.primary}`}>{totalCalories} kcal</div>
            <div className={`text-sm text-${COLORS.text.muted}`}>
              {Math.max(0, dailyGoals.calories - totalCalories)} restantes
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <MacroBar
            label={NUTRITION_CONFIG.macros.protein.name}
            current={totalProtein}
            goal={dailyGoals.protein}
            color={`bg-${NUTRITION_CONFIG.macros.protein.color}`}
          />
          <MacroBar
            label={NUTRITION_CONFIG.macros.carbs.name}
            current={totalCarbs}
            goal={dailyGoals.carbs}
            color={`bg-${NUTRITION_CONFIG.macros.carbs.color}`}
          />
          <MacroBar
            label={NUTRITION_CONFIG.macros.fat.name}
            current={totalFat}
            goal={dailyGoals.fat}
            color={`bg-${NUTRITION_CONFIG.macros.fat.color}`}
          />
        </div>
      </div>

      {/* Comidas de Hoy */}
      <div className={STYLES.card}>
        <h3 className={`text-lg font-semibold text-${COLORS.text.primary} mb-4`}>Comidas de Hoy</h3>
        {mealsLoading ? (
          <div className="text-center py-4">
            <div className={`text-${COLORS.text.muted}`}>{MESSAGES.loading.meals}</div>
          </div>
        ) : meals.length === 0 ? (
          <div className="text-center py-4">
            <div className={`text-${COLORS.text.muted} mb-2`}>{MESSAGES.empty.meals}</div>
            <button
              onClick={() => setShowQuickActions(true)}
              className={`text-${COLORS.primaryShades[600]} font-medium hover:text-${COLORS.primaryShades[700]}`}
            >
              Agregar primera comida
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {meals.map((meal) => (
              <div key={meal.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className={`font-medium text-${COLORS.text.primary}`}>{meal.name}</div>
                  <div className={`text-sm text-${COLORS.text.secondary}`}>
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
        <div className={STYLES.card}>
          <h3 className={`text-lg font-semibold text-${COLORS.text.primary} mb-4`}>Comidas Recientes</h3>
          <div className="space-y-2">
            {recentFoods.slice(0, 3).map((food, index) => (
              <button
                key={index}
                onClick={() => addMealFromRecent(food)}
                className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className={`font-medium text-${COLORS.text.primary}`}>{food.name}</div>
                <div className={`text-sm text-${COLORS.text.secondary}`}>{food.calories} kcal</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeScreen;