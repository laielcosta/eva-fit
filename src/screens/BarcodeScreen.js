import React, { useState } from 'react';
import { Scan, ArrowLeft, Camera } from 'lucide-react';
import { STYLES, MESSAGES, COLORS } from '../services/constants';

const BarcodeScreen = ({
  // Estados
  scannedBarcode,
  setScannedBarcode,
  isAnalyzing,
  
  // Estados de comida
  newMeal,
  setNewMeal,
  selectedFood,
  setSelectedFood,
  
  // Funciones
  searchByBarcode,
  addMeal,
  setActiveTab,
  startCamera
}) => {
  const [showResult, setShowResult] = useState(false);

  const handleBarcodeSearch = async () => {
    if (scannedBarcode.trim()) {
      const result = await searchByBarcode(scannedBarcode);
      if (result) {
        setSelectedFood(result);
        setNewMeal({
          name: result.description || result.name,
          calories: result.calories?.toString() || '',
          protein: result.protein?.toString() || '0',
          carbs: result.carbs?.toString() || '0',
          fat: result.fat?.toString() || '0',
          serving: '100'
        });
        setShowResult(true);
      }
    }
  };

  const handleAddMeal = async () => {
    await addMeal(setActiveTab, () => {}, () => {}, () => {});
    setShowResult(false);
    setScannedBarcode('');
    setSelectedFood(null);
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
            Escanear Código de Barras
          </h1>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {!showResult ? (
          <>
            {/* Instrucciones */}
            <div className={STYLES.card}>
              <div className="text-center">
                <Scan className={`w-16 h-16 text-${COLORS.primaryShades[600]} mx-auto mb-4`} />
                <h2 className={`text-lg font-semibold text-${COLORS.text.primary} mb-2`}>
                  Escanea el código de barras
                </h2>
                <p className={`text-sm text-${COLORS.text.secondary}`}>
                  Usa la cámara para escanear o ingresa el código manualmente
                </p>
              </div>
            </div>

            {/* Botón de cámara */}
            <button
              onClick={startCamera}
              className={`w-full ${STYLES.button.primary} flex items-center justify-center space-x-2`}
            >
              <Camera className="w-5 h-5" />
              <span>Abrir Cámara</span>
            </button>

            {/* Entrada manual */}
            <div className={STYLES.card}>
              <h3 className={`text-md font-semibold text-${COLORS.text.primary} mb-4`}>
                O ingresa el código manualmente
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  value={scannedBarcode}
                  onChange={(e) => setScannedBarcode(e.target.value)}
                  placeholder={MESSAGES.placeholders.barcode}
                  className={STYLES.input}
                />
                <button
                  onClick={handleBarcodeSearch}
                  disabled={isAnalyzing || !scannedBarcode.trim()}
                  className={`w-full ${STYLES.button.primary} disabled:opacity-50`}
                >
                  {isAnalyzing ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {MESSAGES.loading.search}
                    </div>
                  ) : (
                    'Buscar Producto'
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Resultado del escaneo */
          <div className={STYLES.card}>
            <h3 className={`text-lg font-semibold text-${COLORS.text.primary} mb-4`}>
              Producto Encontrado
            </h3>
            
            <div className="space-y-4">
              {/* Nombre */}
              <div>
                <label className={`block text-sm font-medium text-${COLORS.text.secondary} mb-2`}>
                  Nombre
                </label>
                <input
                  type="text"
                  value={newMeal.name}
                  onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                  className={STYLES.input}
                />
              </div>

              {/* Información nutricional */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className={`text-sm text-${COLORS.text.secondary}`}>Calorías</div>
                  <div className={`text-2xl font-bold text-${COLORS.text.primary}`}>
                    {newMeal.calories}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className={`text-sm text-${COLORS.text.secondary}`}>Proteína</div>
                  <div className={`text-2xl font-bold text-${COLORS.text.primary}`}>
                    {newMeal.protein}g
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className={`text-sm text-${COLORS.text.secondary}`}>Carbohidratos</div>
                  <div className={`text-2xl font-bold text-${COLORS.text.primary}`}>
                    {newMeal.carbs}g
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className={`text-sm text-${COLORS.text.secondary}`}>Grasas</div>
                  <div className={`text-2xl font-bold text-${COLORS.text.primary}`}>
                    {newMeal.fat}g
                  </div>
                </div>
              </div>

              {/* Cantidad */}
              <div>
                <label className={`block text-sm font-medium text-${COLORS.text.secondary} mb-2`}>
                  Cantidad (gramos)
                </label>
                <input
                  type="number"
                  value={newMeal.serving}
                  onChange={(e) => setNewMeal({ ...newMeal, serving: e.target.value })}
                  className={STYLES.input}
                  min="1"
                />
              </div>

              {/* Botones */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowResult(false);
                    setScannedBarcode('');
                  }}
                  className={`flex-1 ${STYLES.button.secondary}`}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddMeal}
                  className={`flex-1 ${STYLES.button.primary}`}
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BarcodeScreen;