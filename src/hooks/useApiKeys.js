import { useState } from 'react';

export const useApiKeys = () => {
  // Estados para API Keys
  const [apiKey, setApiKey] = useState('');
  const [fdcApiKey, setFdcApiKey] = useState('');
  
  // Estados para modales
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [showFdcApiKeyInput, setShowFdcApiKeyInput] = useState(false);
  
  // Estados para loading
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Función helper para convertir archivo a Base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Función para buscar alimentos por nombre en FoodData Central
  const searchFoodByName = async (query) => {
    if (!fdcApiKey || !query.trim()) {
      alert('Por favor, configura tu API Key de FoodData Central y escribe un término de búsqueda');
      setShowFdcApiKeyInput(true);
      return [];
    }

    setIsSearching(true);
    try {
      const response = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${fdcApiKey}&query=${encodeURIComponent(query)}&dataType=Foundation,SR%20Legacy&pageSize=10`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.foods && data.foods.length > 0) {
        return data.foods.slice(0, 5);
      } else {
        alert('No se encontraron alimentos con ese nombre');
        return [];
      }
    } catch (error) {
      console.error('Error searching food:', error);
      alert('Error al buscar el alimento. Verifica tu API Key de FoodData Central.');
      return [];
    } finally {
      setIsSearching(false);
    }
  };

  // Función para obtener información nutricional por FDC ID
  const getFoodNutrition = async (fdcId) => {
    if (!fdcApiKey) {
      alert('Por favor, configura tu API Key de FoodData Central');
      setShowFdcApiKeyInput(true);
      return null;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch(`https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${fdcApiKey}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const nutrients = data.foodNutrients || [];
      
      const energyNutrient = nutrients.find(n => n.nutrient.id === 1008);
      const proteinNutrient = nutrients.find(n => n.nutrient.id === 1003);
      const carbsNutrient = nutrients.find(n => n.nutrient.id === 1005);
      const fatNutrient = nutrients.find(n => n.nutrient.id === 1004);
      
      return {
        name: data.description || 'Alimento encontrado',
        calories: energyNutrient ? Math.round(energyNutrient.amount) : 0,
        protein: proteinNutrient ? Math.round(proteinNutrient.amount * 10) / 10 : 0,
        carbs: carbsNutrient ? Math.round(carbsNutrient.amount * 10) / 10 : 0,
        fat: fatNutrient ? Math.round(fatNutrient.amount * 10) / 10 : 0,
        serving: '100'
      };
    } catch (error) {
      console.error('Error getting food nutrition:', error);
      alert('Error al obtener información nutricional del alimento.');
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
    try {
      const openFoodFactsResponse = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const openFoodFactsData = await openFoodFactsResponse.json();
      
      if (openFoodFactsData.status === 1 && openFoodFactsData.product) {
        const product = openFoodFactsData.product;
        
        if (product.nutriments) {
          return {
            name: product.product_name || product.product_name_es || 'Producto encontrado',
            calories: Math.round(product.nutriments['energy-kcal_100g'] || product.nutriments['energy-kcal'] || 0),
            protein: Math.round((product.nutriments.proteins_100g || product.nutriments.proteins || 0) * 10) / 10,
            carbs: Math.round((product.nutriments.carbohydrates_100g || product.nutriments.carbohydrates || 0) * 10) / 10,
            fat: Math.round((product.nutriments.fat_100g || product.nutriments.fat || 0) * 10) / 10,
            serving: '100'
          };
        } else {
          // Si no tiene nutrientes, intentar buscar por nombre
          const productName = product.product_name || product.product_name_es;
          if (productName && fdcApiKey) {
            const searchResults = await searchFoodByName(productName);
            if (searchResults.length > 0) {
              return await getFoodNutrition(searchResults[0].fdcId);
            }
          }
          
          return {
            name: productName || 'Producto encontrado',
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            serving: '100'
          };
        }
      } else {
        alert('Producto no encontrado. Puedes agregar la información manualmente.');
        return {
          name: `Producto ${barcode}`,
          calories: '',
          protein: '',
          carbs: '',
          fat: '',
          serving: '100'
        };
      }
    } catch (error) {
      console.error('Error searching barcode:', error);
      alert('Error al buscar el código de barras. Intenta nuevamente.');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Función para analizar imagen con IA
  const analyzeImageWithAI = async (imageFile) => {
    if (!apiKey) {
      alert('Por favor, configura tu API Key de OpenAI primero');
      setShowApiKeyInput(true);
      return null;
    }

    setIsAnalyzing(true);
    try {
      const base64Image = await convertToBase64(imageFile);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Analiza esta imagen de comida y proporciona la siguiente información en formato JSON exacto:\n{\n  \"name\": \"nombre del plato\",\n  \"calories\": número_de_calorías,\n  \"protein\": gramos_de_proteína,\n  \"carbs\": gramos_de_carbohidratos,\n  \"fat\": gramos_de_grasa\n}\n\nSolo responde con el JSON, sin texto adicional."
                },
                {
                  type: "image_url",
                  image_url: {
                    url: base64Image
                  }
                }
              ]
            }
          ],
          max_tokens: 300
        })
      });

      const data = await response.json();
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        try {
          const analysis = JSON.parse(data.choices[0].message.content);
          return {
            name: analysis.name,
            calories: analysis.calories.toString(),
            protein: analysis.protein.toString(),
            carbs: analysis.carbs.toString(),
            fat: analysis.fat.toString(),
            serving: '100'
          };
        } catch (parseError) {
          console.error('Error parsing AI response:', parseError);
          alert('Error al procesar la respuesta de la IA');
          return null;
        }
      } else {
        throw new Error('Respuesta inválida de la API');
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      alert('Error al analizar la imagen. Verifica tu API Key.');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Función para enviar mensaje a OpenAI
  const sendMessageToAI = async (messages) => {
    if (!apiKey) {
      alert('Por favor, configura tu API Key de OpenAI primero');
      setShowApiKeyInput(true);
      return null;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: messages,
          max_tokens: 500,
          temperature: 0.7
        })
      });

      const data = await response.json();
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content;
      } else {
        throw new Error('Respuesta inválida de la API');
      }
    } catch (error) {
      console.error('Error sending message to AI:', error);
      throw error;
    }
  };

  // Funciones helper para verificar configuración
  const isOpenAIConfigured = () => !!apiKey;
  const isFDCConfigured = () => !!fdcApiKey;
  const areAllApiKeysConfigured = () => apiKey && fdcApiKey;

  return {
    // Estados
    apiKey,
    setApiKey,
    fdcApiKey,
    setFdcApiKey,
    showApiKeyInput,
    setShowApiKeyInput,
    showFdcApiKeyInput,
    setShowFdcApiKeyInput,
    isAnalyzing,
    setIsAnalyzing,
    isSearching,
    setIsSearching,
    
    // Funciones de API
    searchFoodByName,
    getFoodNutrition,
    searchByBarcode,
    analyzeImageWithAI,
    sendMessageToAI,
    convertToBase64,
    
    // Helpers
    isOpenAIConfigured,
    isFDCConfigured,
    areAllApiKeysConfigured
  };
};