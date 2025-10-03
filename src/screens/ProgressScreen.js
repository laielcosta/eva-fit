import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { STYLES, COLORS } from '../services/constants';

const ProgressScreen = ({
  // Datos nutricionales actuales
  totalCalories,
  totalProtein,
  totalCarbs,
  totalFat,
  dailyGoals,
  
  // Datos históricos
  nutritionProgress,
  
  // Estado de carga
  isLoading
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('week'); // week, month, year

  // Calcular estadísticas de la semana
  const weekStats = {
    avgCalories: Math.round(nutritionProgress.reduce((sum, day) => sum + day.calories, 0) / nutritionProgress.length),
    avgProtein: Math.round(nutritionProgress.reduce((sum, day) => sum + day.protein, 0) / nutritionProgress.length),
    avgCarbs: Math.round(nutritionProgress.reduce((sum, day) => sum + day.carbs, 0) / nutritionProgress.length),
    avgFat: Math.round(nutritionProgress.reduce((sum, day) => sum + day.fat, 0) / nutritionProgress.length)
  };

  // Calcular diferencias con objetivos
  const caloriesDiff = totalCalories - dailyGoals.calories;
  const proteinDiff = totalProtein - dailyGoals.protein;
  const carbsDiff = totalCarbs - dailyGoals.carbs;
  const fatDiff = totalFat - dailyGoals.fat;

  return (
    <div className="p-6 space-y-6">
      {/* Selector de período */}
      <div className={STYLES.card}>
        <div className="flex space-x-2">
          {['week', 'month', 'year'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`flex-1 py-2 rounded-lg transition-colors ${
                selectedPeriod === period
                  ? `bg-${COLORS.primaryShades[600]} text-white`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {period === 'week' ? 'Semana' : period === 'month' ? 'Mes' : 'Año'}
            </button>
          ))}
        </div>
      </div>

      {/* Resumen de Hoy */}
      <div className={STYLES.card}>
        <h3 className={`text-lg font-semibold text-${COLORS.text.primary} mb-4 flex items-center`}>
          <Calendar className="w-5 h-5 mr-2" />
          Resumen de Hoy
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Calorías */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm text-${COLORS.text.secondary}`}>Calorías</span>
              {caloriesDiff > 0 ? (
                <TrendingUp className="w-4 h-4 text-red-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-green-500" />
              )}
            </div>
            <div className={`text-2xl font-bold text-${COLORS.text.primary}`}>
              {totalCalories}
            </div>
            <div className={`text-xs ${caloriesDiff > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {caloriesDiff > 0 ? '+' : ''}{caloriesDiff} kcal
            </div>
          </div>

          {/* Proteína */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm text-${COLORS.text.secondary}`}>Proteína</span>
              {proteinDiff > 0 ? (
                <TrendingUp className="w-4 h-4 text-blue-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-orange-500" />
              )}
            </div>
            <div className={`text-2xl font-bold text-${COLORS.text.primary}`}>
              {totalProtein}g
            </div>
            <div className={`text-xs ${proteinDiff > 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              {proteinDiff > 0 ? '+' : ''}{Math.round(proteinDiff)}g
            </div>
          </div>

          {/* Carbohidratos */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm text-${COLORS.text.secondary}`}>Carbos</span>
              {carbsDiff > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
            </div>
            <div className={`text-2xl font-bold text-${COLORS.text.primary}`}>
              {totalCarbs}g
            </div>
            <div className={`text-xs ${carbsDiff > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {carbsDiff > 0 ? '+' : ''}{Math.round(carbsDiff)}g
            </div>
          </div>

          {/* Grasas */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm text-${COLORS.text.secondary}`}>Grasas</span>
              {fatDiff > 0 ? (
                <TrendingUp className="w-4 h-4 text-orange-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-green-500" />
              )}
            </div>
            <div className={`text-2xl font-bold text-${COLORS.text.primary}`}>
              {totalFat}g
            </div>
            <div className={`text-xs ${fatDiff > 0 ? 'text-orange-600' : 'text-green-600'}`}>
              {fatDiff > 0 ? '+' : ''}{Math.round(fatDiff)}g
            </div>
          </div>
        </div>
      </div>

      {/* Promedios de la Semana */}
      <div className={STYLES.card}>
        <h3 className={`text-lg font-semibold text-${COLORS.text.primary} mb-4`}>
          Promedios de la Semana
        </h3>
        
        <div className="space-y-4">
          {/* Calorías promedio */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className={`text-sm font-medium text-${COLORS.text.secondary}`}>Calorías</span>
              <span className={`text-sm text-${COLORS.text.primary}`}>
                {weekStats.avgCalories} / {dailyGoals.calories} kcal
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full bg-${COLORS.primaryShades[600]} transition-all duration-300`}
                style={{ width: `${Math.min((weekStats.avgCalories / dailyGoals.calories) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Proteína promedio */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className={`text-sm font-medium text-${COLORS.text.secondary}`}>Proteína</span>
              <span className={`text-sm text-${COLORS.text.primary}`}>
                {weekStats.avgProtein} / {dailyGoals.protein}g
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                style={{ width: `${Math.min((weekStats.avgProtein / dailyGoals.protein) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Carbohidratos promedio */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className={`text-sm font-medium text-${COLORS.text.secondary}`}>Carbohidratos</span>
              <span className={`text-sm text-${COLORS.text.primary}`}>
                {weekStats.avgCarbs} / {dailyGoals.carbs}g
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-green-500 transition-all duration-300"
                style={{ width: `${Math.min((weekStats.avgCarbs / dailyGoals.carbs) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Grasas promedio */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className={`text-sm font-medium text-${COLORS.text.secondary}`}>Grasas</span>
              <span className={`text-sm text-${COLORS.text.primary}`}>
                {weekStats.avgFat} / {dailyGoals.fat}g
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-orange-500 transition-all duration-300"
                style={{ width: `${Math.min((weekStats.avgFat / dailyGoals.fat) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico Semanal Simplificado */}
      <div className={STYLES.card}>
        <h3 className={`text-lg font-semibold text-${COLORS.text.primary} mb-4`}>
          Calorías por Día
        </h3>
        
        <div className="flex items-end justify-between h-48 space-x-2">
          {nutritionProgress.map((day, index) => {
            const percentage = (day.calories / dailyGoals.calories) * 100;
            const height = Math.min(percentage, 100);
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '100%' }}>
                  <div
                    className={`absolute bottom-0 w-full rounded-t-lg ${
                      percentage > 100 ? 'bg-red-500' : `bg-${COLORS.primaryShades[600]}`
                    } transition-all duration-300`}
                    style={{ height: `${height}%` }}
                  ></div>
                </div>
                <span className={`text-xs text-${COLORS.text.muted} mt-2`}>{day.day}</span>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-center items-center">
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center">
              <div className={`w-3 h-3 bg-${COLORS.primaryShades[600]} rounded mr-2`}></div>
              <span className={`text-${COLORS.text.secondary}`}>Dentro del objetivo</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
              <span className={`text-${COLORS.text.secondary}`}>Sobre el objetivo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressScreen;