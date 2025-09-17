import React from 'react';
import { X, Settings, Activity } from 'lucide-react';
import { STYLES, MESSAGES, COLORS } from '../services/constants';

const ProfileScreen = ({
  // Estados de metas
  dailyGoals,
  setDailyGoals,
  
  // Estados de API keys
  apiKey,
  setApiKey,
  fdcApiKey,
  setFdcApiKey,
  showApiKeyInput,
  setShowApiKeyInput,
  showFdcApiKeyInput,
  setShowFdcApiKeyInput,
  
  // Estados de configuración
  isOpenAIConfigured,
  isFDCConfigured,
  
  // Funciones
  refreshMeals
}) => {
  return (
    <div className="p-6 space-y-6">
      <div className={STYLES.card}>
        <h2 className={`text-lg font-semibold text-${COLORS.text.primary} mb-6`}>Configuración</h2>
        
        <div className="space-y-6">
          {/* Objetivos Diarios */}
          <div>
            <h3 className={`text-md font-semibold text-${COLORS.text.primary} mb-4`}>Objetivos Diarios</h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium text-${COLORS.text.secondary} mb-2`}>
                  Calorías objetivo
                </label>
                <input
                  type="number"
                  value={dailyGoals.calories}
                  onChange={(e) => setDailyGoals({...dailyGoals, calories: parseInt(e.target.value) || 0})}
                  className={STYLES.input}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium text-${COLORS.text.secondary} mb-2`}>
                  Proteína objetivo (g)
                </label>
                <input
                  type="number"
                  value={dailyGoals.protein}
                  onChange={(e) => setDailyGoals({...dailyGoals, protein: parseInt(e.target.value) || 0})}
                  className={STYLES.input}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium text-${COLORS.text.secondary} mb-2`}>
                  Carbohidratos objetivo (g)
                </label>
                <input
                  type="number"
                  value={dailyGoals.carbs}
                  onChange={(e) => setDailyGoals({...dailyGoals, carbs: parseInt(e.target.value) || 0})}
                  className={STYLES.input}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium text-${COLORS.text.secondary} mb-2`}>
                  Grasas objetivo (g)
                </label>
                <input
                  type="number"
                  value={dailyGoals.fat}
                  onChange={(e) => setDailyGoals({...dailyGoals, fat: parseInt(e.target.value) || 0})}
                  className={STYLES.input}
                />
              </div>
            </div>
          </div>

          {/* API Keys */}
          <div>
            <h3 className={`text-md font-semibold text-${COLORS.text.primary} mb-4`}>API Keys</h3>
            <div className="space-y-4">
              {/* OpenAI API Key */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={`block text-sm font-medium text-${COLORS.text.secondary}`}>
                    OpenAI API Key
                  </label>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    isOpenAIConfigured ? `bg-${COLORS.status.success}-100 text-${COLORS.status.success}-800` : `bg-${COLORS.status.error}-100 text-${COLORS.status.error}-800`
                  }`}>
                    {isOpenAIConfigured ? 'Configurada' : 'No configurada'}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <input
                    type={showApiKeyInput ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={MESSAGES.placeholders.apiKey}
                    className={`flex-1 ${STYLES.input}`}
                  />
                  <button
                    onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                    className={`px-4 py-3 ${STYLES.button.secondary}`}
                  >
                    {showApiKeyInput ? <X className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* FoodData Central API Key */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={`block text-sm font-medium text-${COLORS.text.secondary}`}>
                    FoodData Central API Key
                  </label>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    isFDCConfigured ? `bg-${COLORS.status.success}-100 text-${COLORS.status.success}-800` : `bg-${COLORS.status.error}-100 text-${COLORS.status.error}-800`
                  }`}>
                    {isFDCConfigured ? 'Configurada' : 'No configurada'}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <input
                    type={showFdcApiKeyInput ? 'text' : 'password'}
                    value={fdcApiKey}
                    onChange={(e) => setFdcApiKey(e.target.value)}
                    placeholder={MESSAGES.placeholders.fdcApiKey}
                    className={`flex-1 ${STYLES.input}`}
                  />
                  <button
                    onClick={() => setShowFdcApiKeyInput(!showFdcApiKeyInput)}
                    className={`px-4 py-3 ${STYLES.button.secondary}`}
                  >
                    {showFdcApiKeyInput ? <X className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={refreshMeals}
              className={`w-full ${STYLES.button.primary} flex items-center justify-center space-x-2`}
            >
              <Activity className="w-5 h-5" />
              <span>{MESSAGES.actions.refresh} Datos</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;