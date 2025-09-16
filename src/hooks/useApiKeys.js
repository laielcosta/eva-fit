import { useState, useEffect } from 'react';

export const useApiKeys = () => {
  // Estados para API Keys - carga desde localStorage directamente
  const [apiKey, setApiKey] = useState('');
  const [fdcApiKey, setFdcApiKey] = useState('');
  
  // Estados para modales
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [showFdcApiKeyInput, setShowFdcApiKeyInput] = useState(false);
  
  // Estados para loading
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Estados de carga y error
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar API keys desde localStorage directamente al inicializar
  useEffect(() => {
    try {
      const savedApiKey = localStorage.getItem('eva_fit_api_keys') || '';
      const savedFdcApiKey = localStorage.getItem('eva_fit_fdc_api_key') || '';
      
      setApiKey(savedApiKey);
      setFdcApiKey(savedFdcApiKey);
    } catch (err) {
      console.error('Error loading API keys from localStorage:', err);
    }
  }, []);

  // Actualizar API key cuando cambie
  const updateApiKey = (newApiKey) => {
    try {
      localStorage.setItem('eva_fit_api_keys', newApiKey);
      setApiKey(newApiKey);
    } catch (err) {
      console.error('Error updating OpenAI API key:', err);
    }
  };

  // Actualizar FDC API key cuando cambie
  const updateFdcApiKey = (newFdcApiKey) => {
    try {
      localStorage.setItem('eva_fit_fdc_api_key', newFdcApiKey);
      setFdcApiKey(newFdcApiKey);
    } catch (err) {
      console.error('Error updating FDC API key:', err);
    }
  };

  // Función para buscar alimentos por nombre
  const searchFoodByName = async (query) => {
    if (!isFDCConfigured() || !query.trim()) {
      alert('Por favor, configura tu API Key de FoodData Central y escribe un término de búsqueda');
      setShowFdcApiKeyInput(true);
      return [];
    }

    setIsSearching(true);
    setError(null);
    
    try {
      // Simulación de búsqueda - puedes reemplazar con API real
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Datos de ejemplo para que funcione
      const mockResults = [
        { fdcId: '123', description: 'Pollo a la plancha', brandOwner: 'Genérico' },
        { fdcId: '124', description: 'Arroz integral', brandOwner: 'Genérico' },
        { fdcId: '125', description: 'Brócoli', brandOwner: 'Genérico' }
      ];
      
      return mockResults.filter(item => 
        item.description.toLowerCase().includes(query.toLowerCase())
      );
    } catch (err) {
      setError(err.message);
      alert(`Error al buscar el alimento: ${err.message}`);
      return [];
    } finally {
      setIsSearching(false);
    }
  };

  // Función para obtener información nutricional por FDC ID
  const getFoodNutrition = async (fdcId) => {
    if (!isFDCConfigured()) {
      alert('Por favor, configura tu API Key de FoodData Central');
      setShowFdcApiKeyInput(true);
      return null;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Simulación de obtener nutrición - puedes reemplazar con API real
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Datos de ejemplo
      const mockNutrition = {
        description: 'Pollo a la plancha',
        calories: 165,
        protein: 31,
        carbs: 0,
        fat: 3.6,
        brandOwner: 'Genérico'
      };
      
      return mockNutrition;
    } catch (err) {
      setError(err.message);
      alert(`Error al obtener información nutricional: ${err.message}`);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Función para buscar por código de barras
  const searchByBarcode = async (barcode) => {
    if (!barcode || barcode.length < 8) {
      alert('Por favor, ingresa un código de barras válido (mínimo 8 dígitos)');
      return null;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Simulación de búsqueda por código de barras
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Datos de ejemplo
      const mockProduct = {
        description: 'Producto escaneado',
        calories: 100,
        protein: 5,
        carbs: 15,
        fat: 2,
        brandOwner: 'Marca ejemplo'
      };
      
      return mockProduct;
    } catch (err) {
      setError(err.message);
      alert(`Error al buscar el código de barras: ${err.message}`);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Función para analizar imagen con IA
  const analyzeImageWithAI = async (imageFile) => {
    if (!isOpenAIConfigured()) {
      alert('Por favor, configura tu API Key de OpenAI primero');
      setShowApiKeyInput(true);
      return null;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Simulación de análisis de imagen
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Datos de ejemplo
      const mockAnalysis = {
        foods: [
          { description: 'Manzana', calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
          { description: 'Pan integral', calories: 247, protein: 13, carbs: 41, fat: 4 }
        ]
      };
      
      return mockAnalysis;
    } catch (err) {
      setError(err.message);
      alert(`Error al analizar la imagen: ${err.message}`);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Función para enviar mensaje a OpenAI
  const sendMessageToAI = async (message) => {
    if (!isOpenAIConfigured()) {
      alert('Por favor, configura tu API Key de OpenAI primero');
      setShowApiKeyInput(true);
      return null;
    }

    setError(null);

    try {
      // Simulación de respuesta de IA
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Respuesta de ejemplo
      const mockResponse = {
        id: Date.now(),
        text: `Entiendo tu consulta sobre "${message}". Como asistente nutricional, te recomiendo mantener una dieta balanceada y consultar con un profesional para recomendaciones específicas.`,
        sender: 'bot'
      };
      
      return mockResponse;
    } catch (err) {
      setError(err.message);
      throw new Error(err.message);
    }
  };

  // Funciones helper para verificar configuración
  const isOpenAIConfigured = () => !!apiKey;
  const isFDCConfigured = () => !!fdcApiKey;
  const areAllApiKeysConfigured = () => apiKey && fdcApiKey;

  // Handlers para actualizar API keys
  const handleApiKeyChange = (newKey) => {
    updateApiKey(newKey);
  };

  const handleFdcApiKeyChange = (newKey) => {
    updateFdcApiKey(newKey);
  };

  return {
    // Estados
    apiKey,
    setApiKey: handleApiKeyChange,
    fdcApiKey,
    setFdcApiKey: handleFdcApiKeyChange,
    
    // Estados de modales
    showApiKeyInput,
    setShowApiKeyInput,
    showFdcApiKeyInput,
    setShowFdcApiKeyInput,
    
    // Estados de loading
    isAnalyzing,
    setIsAnalyzing,
    isSearching,
    setIsSearching,
    isLoading,
    error,
    setError,
    
    // Funciones de API - versiones simplificadas que funcionan sin el api.js
    searchFoodByName,
    getFoodNutrition,
    searchByBarcode,
    analyzeImageWithAI,
    sendMessageToAI,
    
    // Helpers
    isOpenAIConfigured,
    isFDCConfigured,
    areAllApiKeysConfigured
  };
};