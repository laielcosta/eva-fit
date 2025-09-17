import React from 'react';
import { Send, Bot, User, Camera, Scan, X } from 'lucide-react';
import { STYLES, MESSAGES, COLORS } from '../services/constants';

const AssistantScreen = ({
  // Estados del chat
  chatMessages,
  newMessage,
  setNewMessage,
  isSendingMessage,
  
  // Estados de imagen
  capturedImage,
  setCapturedImage,
  
  // Estados de configuración
  isOpenAIConfigured,
  isAnalyzing,
  
  // Referencias
  fileInputRef,
  
  // Funciones
  handleSendMessage,
  handleAnalyzeImage,
  startCamera,
  setActiveTab
}) => {
  return (
    <div className="p-6 space-y-6">
      {/* Chat con IA */}
      <div className={`${STYLES.card} h-96 flex flex-col`}>
        <h2 className={`text-lg font-semibold text-${COLORS.text.primary} mb-4`}>Asistente Nutricional</h2>
        
        {/* Área de mensajes */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {chatMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-2 max-w-xs ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.sender === 'user' ? `bg-${COLORS.primaryShades[600]}` : 'bg-gray-600'
                }`}>
                  {message.sender === 'user' ? 
                    <User className="w-4 h-4 text-white" /> : 
                    <Bot className="w-4 h-4 text-white" />
                  }
                </div>
                <div className={`p-3 rounded-lg ${
                  message.sender === 'user' 
                    ? `bg-${COLORS.primaryShades[600]} text-white` 
                    : `bg-gray-100 text-${COLORS.text.primary}`
                }`}>
                  <div className="text-sm">{message.text}</div>
                </div>
              </div>
            </div>
          ))}
          {isSendingMessage && (
            <div className="flex justify-start">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className={`text-sm text-${COLORS.text.secondary}`}>EVA está escribiendo...</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input de mensaje */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isSendingMessage && handleSendMessage()}
            placeholder={MESSAGES.placeholders.chatMessage}
            className={`flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${COLORS.primaryShades[600]} focus:border-transparent`}
            disabled={isSendingMessage}
          />
          <button
            onClick={handleSendMessage}
            disabled={isSendingMessage || !newMessage.trim()}
            className={`bg-${COLORS.primaryShades[600]} text-white p-2 rounded-lg hover:bg-${COLORS.primaryShades[700]} disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* Aviso de API Key */}
        {!isOpenAIConfigured && (
          <div className={`mt-4 p-4 bg-${COLORS.status.warning}-50 border border-${COLORS.status.warning}-200 rounded-lg`}>
            <div className={`text-${COLORS.status.warning}-800 text-sm`}>
              Para usar el asistente necesitas configurar la API key de OpenAI.
              <button
                onClick={() => setActiveTab('profile')}
                className={`ml-2 text-${COLORS.status.warning}-900 font-medium hover:underline`}
              >
                {MESSAGES.actions.configure} ahora
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Análisis de Imágenes */}
      <div className={STYLES.card}>
        <h3 className={`text-lg font-semibold text-${COLORS.text.primary} mb-4`}>Análisis de Imágenes</h3>
        
        <div className="space-y-4">
          {/* Botones de captura */}
          <div className="flex space-x-3">
            <button
              onClick={startCamera}
              className={`flex-1 bg-${COLORS.primaryShades[600]} text-white py-3 rounded-lg hover:bg-${COLORS.primaryShades[700]} transition-colors flex items-center justify-center space-x-2`}
            >
              <Camera className="w-5 h-5" />
              <span>Tomar Foto</span>
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Scan className="w-5 h-5" />
              <span>Subir Imagen</span>
            </button>
          </div>

          {/* Input de archivo oculto */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  setCapturedImage(event.target.result);
                };
                reader.readAsDataURL(file);
              }
            }}
            className="hidden"
          />

          {/* Preview de imagen capturada */}
          {capturedImage && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <img src={capturedImage} alt="Captured" className="w-full h-48 object-cover rounded-lg" />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleAnalyzeImage}
                  disabled={isAnalyzing}
                  className={`flex-1 bg-${COLORS.primaryShades[600]} text-white py-3 rounded-lg hover:bg-${COLORS.primaryShades[700]} disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                >
                  {isAnalyzing ? MESSAGES.loading.analyzing : MESSAGES.actions.analyze + ' Imagen'}
                </button>
                
                <button
                  onClick={() => setCapturedImage(null)}
                  className={`px-4 py-3 ${STYLES.button.secondary}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Aviso de API Key para imágenes */}
          {!isOpenAIConfigured && (
            <div className={`p-4 bg-${COLORS.status.warning}-50 border border-${COLORS.status.warning}-200 rounded-lg`}>
              <div className={`text-${COLORS.status.warning}-800 text-sm`}>
                Para usar el análisis de imágenes necesitas configurar la API key de OpenAI.
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`ml-2 text-${COLORS.status.warning}-900 font-medium hover:underline`}
                >
                  {MESSAGES.actions.configure} ahora
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssistantScreen;