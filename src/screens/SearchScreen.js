import React, { useState } from 'react';
import { Search, X, Plus, ArrowLeft } from 'lucide-react';
import { STYLES, MESSAGES, COLORS } from '../services/constants';

const SearchScreen = ({
  // Estados de búsqueda
  searchQuery,
  setSearchQuery,
  searchResults,
  setSearchResults,
  isSearching,
  
  // Estados de comida nueva
  newMeal,
  setNewMeal,
  
  // Funciones
  searchFoodByName,
  addMeal,
  setActiveTab,
  
  // Comidas recientes
  recentFoods
}) => {
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      await searchFoodByName(searchQuery);
    }
  };

  const handleSelectFood = (food) => {
    setSelectedFood(food);
    setNewMeal({
      name: food.description || food.name,
      calories: food.calories?.toString() || '',
      protein: food.protein?.toString() || '0',
      carbs: food.carbs?.toString() || '0',
      fat: food.fat?.toString() || '0',
      serving: '100'
    });
    setShowManualEntry(true);
  };

  const handleManualEntry = () => {
    setShowManualEntry(true);
    setSelectedFood(null);
    setNewMeal({
      name: '',
      calories: '',
      protein: '0',
      carbs: '0',
      fat: '0',
      serving: '100'
    });
  };

  const handleAddMeal = async () => {
    await addMeal(setActiveTab, () => {}, setSearchResults, setSearchQuery);
    setShowManualEntry(false);
    setSelectedFood(null);
  };

  const handleCancel = () => {
    setShowManualEntry(false);
    setSelectedFood(null);
    setNewMeal({
      name: '',
      calories: '',
      protein: '0',
      carbs: '0',
      fat: '0',
      serving: '100'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveTab('home')}
            className={`text-${COLORS.text.secondary} hover:text-${COLORS.text.primary}`}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className={`text-xl font-bold text-${COLORS.text.primary} flex-1`}>
            Agregar Comida
          </h1>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Barra de búsqueda */}
        {!showManualEntry && (
          <div className={STYLES.card}>
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder={MESSAGES.placeholders.searchFood}
                  className={STYLES.input}
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    <X className={`w-5 h-5 text-${COLORS.text.muted}`} />
                  </button>
                )}
              </div>
              <button
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className={`${STYLES.button.primary} px-6 disabled:opacity-50`}
              >
                {isSearching ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Botón para entrada manual */}
            <button
              onClick={handleManualEntry}
              className={`w-full mt-4 py-3 border-2 border-dashed border-${COLORS.primaryShades[600]} text-${COLORS.primaryShades[600]} rounded-lg hover:bg-${COLORS.primaryShades[50]} transition-colors flex items-center justify-center space-x-2`}
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Agregar Manualmente</span>
            </button>
          </div>
        )}

        {/* Resultados de búsqueda */}
        {!showManualEntry && searchResults.length > 0 && (
          <div className={STYLES.card}>
            <h3 className={`text-lg font-semibold text-${COLORS.text.primary} mb-4`}>
              Resultados de Búsqueda
            </h3>
            <div className="space-y-2">
              {searchResults.map((food, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectFood(food)}
                  className="w-full text-left p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className={`font-medium text-${COLORS.text.primary}`}>
                    {food.description || food.name}
                  </div>
                  {food.brandOwner && (
                    <div className={`text-sm text-${COLORS.text.muted}`}>
                      {food.brandOwner}
                    </div>
                  )}
                  {food.calories && (
                    <div className={`text-sm text-${COLORS.text.secondary} mt-1`}>
                      {food.calories} kcal • {food.protein || 0}g proteína
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Comidas recientes (solo si no hay búsqueda activa) */}
        {!showManualEntry && !searchQuery && recentFoods.length > 0 && (
          <div className={STYLES.card}>
            <h3 className={`text-lg font-semibold text-${COLORS.text.primary} mb-4`}>
              Comidas Recientes
            </h3>
            <div className="space-y-2">
              {recentFoods.map((food, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectFood(food)}
                  className="w-full text-left p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className={`font-medium text-${COLORS.text.primary}`}>
                    {food.name}
                  </div>
                  <div className={`text-sm text-${COLORS.text.secondary}`}>
                    {food.calories} kcal • {food.protein}g proteína
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Formulario de entrada manual */}
        {showManualEntry && (
          <div className={STYLES.card}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-semibold text-${COLORS.text.primary}`}>
                {selectedFood ? 'Ajustar Comida' : 'Agregar Manualmente'}
              </h3>
              <button
                onClick={handleCancel}
                className={`text-${COLORS.text.muted} hover:text-${COLORS.text.primary}`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Nombre */}
              <div>
                <label className={`block text-sm font-medium text-${COLORS.text.secondary} mb-2`}>
                  Nombre de la comida
                </label>
                <input
                  type="text"
                  value={newMeal.name}
                  onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                  placeholder="Ej: Pollo a la plancha"
                  className={STYLES.input}
                  required
                />
              </div>

              {/* Cantidad/Porción */}
              <div>
                <label className={`block text-sm font-medium text-${COLORS.text.secondary} mb-2`}>
                  Cantidad (gramos)
                </label>
                <input
                  type="number"
                  value={newMeal.serving}
                  onChange={(e) => setNewMeal({ ...newMeal, serving: e.target.value })}
                  placeholder="100"
                  className={STYLES.input}
                  min="1"
                />
              </div>

              {/* Calorías */}
              <div>
                <label className={`block text-sm font-medium text-${COLORS.text.secondary} mb-2`}>
                  Calorías (kcal)
                </label>
                <input
                  type="number"
                  value={newMeal.calories}
                  onChange={(e) => setNewMeal({ ...newMeal, calories: e.target.value })}
                  placeholder="0"
                  className={STYLES.input}
                  required
                  min="0"
                />
              </div>

              {/* Macros en grid */}
              <div className="grid grid-cols-3 gap-4">
                {/* Proteína */}
                <div>
                  <label className={`block text-sm font-medium text-${COLORS.text.secondary} mb-2`}>
                    Proteína (g)
                  </label>
                  <input
                    type="number"
                    value={newMeal.protein}
                    onChange={(e) => setNewMeal({ ...newMeal, protein: e.target.value })}
                    placeholder="0"
                    className={STYLES.input}
                    min="0"
                    step="0.1"
                  />
                </div>

                {/* Carbohidratos */}
                <div>
                  <label className={`block text-sm font-medium text-${COLORS.text.secondary} mb-2`}>
                    Carbos (g)
                  </label>
                  <input
                    type="number"
                    value={newMeal.carbs}
                    onChange={(e) => setNewMeal({ ...newMeal, carbs: e.target.value })}
                    placeholder="0"
                    className={STYLES.input}
                    min="0"
                    step="0.1"
                  />
                </div>

                {/* Grasas */}
                <div>
                  <label className={`block text-sm font-medium text-${COLORS.text.secondary} mb-2`}>
                    Grasas (g)
                  </label>
                  <input
                    type="number"
                    value={newMeal.fat}
                    onChange={(e) => setNewMeal({ ...newMeal, fat: e.target.value })}
                    placeholder="0"
                    className={STYLES.input}
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>

              {/* Vista previa de calorías calculadas */}
              {(newMeal.protein || newMeal.carbs || newMeal.fat) && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className={`text-sm text-${COLORS.text.secondary} mb-2`}>
                    Calorías calculadas por macros:
                  </div>
                  <div className={`text-lg font-bold text-${COLORS.text.primary}`}>
                    {Math.round(
                      (parseFloat(newMeal.protein) || 0) * 4 +
                      (parseFloat(newMeal.carbs) || 0) * 4 +
                      (parseFloat(newMeal.fat) || 0) * 9
                    )} kcal
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleCancel}
                  className={`flex-1 ${STYLES.button.secondary}`}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddMeal}
                  disabled={!newMeal.name || !newMeal.calories}
                  className={`flex-1 ${STYLES.button.primary} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Agregar Comida
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mensaje cuando no hay resultados */}
        {!showManualEntry && searchQuery && searchResults.length === 0 && !isSearching && (
          <div className={STYLES.card}>
            <div className="text-center py-8">
              <Search className={`w-12 h-12 text-${COLORS.text.muted} mx-auto mb-3`} />
              <div className={`text-${COLORS.text.primary} font-medium mb-2`}>
                No se encontraron resultados
              </div>
              <div className={`text-sm text-${COLORS.text.muted} mb-4`}>
                Intenta con otro término de búsqueda
              </div>
              <button
                onClick={handleManualEntry}
                className={`text-${COLORS.primaryShades[600]} font-medium hover:text-${COLORS.primaryShades[700]}`}
              >
                Agregar manualmente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchScreen;