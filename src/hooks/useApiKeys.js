import { useState, useEffect } from 'react';
import { api } from '../services/api';

export const useApiKeys = () => {
  // Estados para API Keys - ahora se cargan desde la API
  const [apiKey, setApiKey] = useState('');
  const [fdcApiKey, setFdcApiKey] = useState('');
  
  // Estados para modales
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [showFdcApiKeyInput, setShowFdcApiKeyInput] = useState(false);
  
  // Estados para loading
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Estados de carga y error
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar API keys al inicializar
  useEffect(() => {
    const loadApiKeys = async () => {
      try {
        const response = await api.apiKeys.get();
        if (response.success) {
          setApiKey(response.data.openai || '');
          setFdcApiKey(response.data.foodDataCentral || '');
        }
      } catch (err) {
        console.error('Error loading API keys:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadApiKeys();
  }, []);

  // Actualizar API key cuando cambie
  const updateApiKey = async (newApiKey) => {
    try {
      await api.apiKeys.update('openai', newApiKey);
      setApiKey(newApiKey);
    } catch (err) {
      console.error('Error updating OpenAI API key:', err);
    }
  };

  // Actualizar FDC API key cuando cambie
  const updateFdcApiKey = async (newFdcApiKey) => {
    try {
      await api.apiKeys.update('foodDataCentral', newFdcApiKey);
      setFdcApiKey(newFdcApiKey);
    } catch (err) {
      console.error('Error updating FDC API key:', err);
    }
  };

  // Función para buscar alimentos por nombre usando la API
  const searchFoodByName = async (query) => {
    if (!isFDCConfigured() || !query.trim()) {
      alert('Por favor, configura tu API Key de FoodData Central y escribe un término de búsqueda');
      setShowFdcApiKeyInput(true);
      return [];
    }

    setIsSearching(true);
    setError(null);
    
    try {
      const response = await api.external.searchFood(query, fdcApiKey);
      if (response.success) {
        if (response.message) {
          alert(response.message);
        }
        return response.data;
      } else {
        setError('Error al buscar alimentos');
        return [];
      }
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
      const response = await api.external.getFoodNutrition(fdcId, fdcApiKey);
      if (response.success) {
        return response.data;
      } else {
        setError('Error al obtener información nutricional');
        return null;
      }
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
      const response = await api.external.searchByBarcode(barcode);
      
      if (response.success) {
        if (response.needsManualEntry) {
          alert('Producto encontrado pero sin información nutricional completa. Puedes agregar la información manualmente.');
        }
        return response.data;
      } else {
        setError('Error al buscar código de barras');
        return null;
      }
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
      const response = await api.external.analyzeImage(imageFile, apiKey);
      if (response.success) {
        return response.data;
      } else {
        setError('Error al analizar imagen');
        return null;
      }
    } catch (err) {
      setError(err.message);
      alert(`Error al analizar la imagen: ${err.message}`);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Función para enviar mensaje a OpenAI
  const sendMessageToAI = async (messages) => {
    if (!isOpenAIConfigured()) {
      alert('Por favor, configura tu API Key de OpenAI primero');
      setShowApiKeyInput(true);
      return null;
    }

    setError(null);

    try {
      const response = await api.external.sendMessage(messages, apiKey);
      if (response.success) {
        return response.data;
      } else {
        setError('Error en el chat');
        return null;
      }
    } catch (err) {
      setError(err.message);
      throw new Error(err.message);
    }
  };

  // Funciones helper para verificar configuración
  const isOpenAIConfigured = () => !!apiKey;
  const isFDCConfigured = () => !!fdcApiKey;
  const areAllApiKeysConfigured = () => apiKey && fdcApiKey;

  // Handlers para actualizar API keys y cerrar modales
  const handleApiKeyChange = (newKey) => {
    setApiKey(newKey);
    updateApiKey(newKey);
  };

  const handleFdcApiKeyChange = (newKey) => {
    setFdcApiKey(newKey);
    updateFdcApiKey(newKey);
  };

  return {
    // Estados de API Keys
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
    
    // Funciones de API - ahora usando la capa de servicios
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