import React, { useState, useRef } from 'react';
import { Upload, Video, Play, Loader, CheckCircle, AlertCircle } from 'lucide-react';

const VideoUploadAnalyzer = ({ exerciseType, onComplete }) => {
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [error, setError] = useState(null);

  // Manejar selección de archivo
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      setError('Formato de vídeo no soportado. Usa MP4, MOV, AVI o WebM.');
      return;
    }

    // Validar tamaño (máximo 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      setError('El vídeo es muy grande. Máximo 50MB.');
      return;
    }

    setError(null);
    setSelectedFile(file);
    
    // Crear URL para preview
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
  };

  // Subir y analizar vídeo
  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      // 1. Subir vídeo al servidor
      const formData = new FormData();
      formData.append('video', selectedFile);
      formData.append('exerciseType', exerciseType);

      const uploadResponse = await fetch('http://localhost:3001/api/exercises/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error('Error al subir el vídeo');
      }

      const uploadData = await uploadResponse.json();
      setUploadProgress(100);
      setIsUploading(false);

      // 2. Simular análisis del vídeo
      setIsAnalyzing(true);
      
      // Simular progreso de análisis
      for (let i = 0; i <= 100; i += 10) {
        setAnalysisProgress(i);
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // 3. Generar resultados simulados (en producción esto vendría del backend)
      const mockResults = {
        exerciseType,
        duration: Math.floor(selectedFile.size / (1024 * 50)), // Duración aproximada
        repetitions: Math.floor(Math.random() * 15) + 5,
        avgAngle: Math.floor(Math.random() * 50) + 70,
        errors: [
          'Mantén la espalda más recta',
          'Profundiza un poco más el movimiento'
        ].slice(0, Math.floor(Math.random() * 2) + 1),
        feedback: `Análisis completado. Detectamos ${Math.floor(Math.random() * 15) + 5} repeticiones con buena técnica general.`,
        videoId: uploadData.videoId
      };

      // 4. Guardar análisis en el backend
      await fetch('http://localhost:3001/api/exercises/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(mockResults)
      });

      setIsAnalyzing(false);
      
      // 5. Llamar callback con resultados
      if (onComplete) {
        onComplete(mockResults);
      }

    } catch (err) {
      console.error('Error en upload/análisis:', err);
      setError(err.message || 'Error al procesar el vídeo');
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  // Resetear
  const handleReset = () => {
    setSelectedFile(null);
    setVideoUrl(null);
    setUploadProgress(0);
    setAnalysisProgress(0);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Input de archivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/mov,video/avi,video/webm"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Zona de upload */}
      {!selectedFile ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-colors"
        >
          <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Sube tu vídeo de ejercicio
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Formatos soportados: MP4, MOV, AVI, WebM<br/>
            Tamaño máximo: 50MB
          </p>
          <button className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors">
            Seleccionar Vídeo
          </button>
        </div>
      ) : (
        <>
          {/* Preview del vídeo */}
          <div className="bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              src={videoUrl}
              controls
              className="w-full h-auto max-h-96"
            />
          </div>

          {/* Información del archivo */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Video className="w-5 h-5 text-gray-600" />
              <div className="flex-1">
                <div className="font-medium text-gray-800">{selectedFile.name}</div>
                <div className="text-sm text-gray-600">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </div>
              </div>
              {!isUploading && !isAnalyzing && (
                <button
                  onClick={handleReset}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Cambiar
                </button>
              )}
            </div>
          </div>

          {/* Estado de upload */}
          {isUploading && (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <Loader className="w-5 h-5 text-blue-600 animate-spin" />
                <span className="font-medium text-blue-800">Subiendo vídeo...</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <div className="text-sm text-blue-600 mt-1">{uploadProgress}%</div>
            </div>
          )}

          {/* Estado de análisis */}
          {isAnalyzing && (
            <div className="bg-emerald-50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <Loader className="w-5 h-5 text-emerald-600 animate-spin" />
                <span className="font-medium text-emerald-800">Analizando ejercicio...</span>
              </div>
              <div className="w-full bg-emerald-200 rounded-full h-2">
                <div
                  className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
              <div className="text-sm text-emerald-600 mt-1">{analysisProgress}%</div>
              <p className="text-xs text-emerald-700 mt-2">
                EVA está detectando tu movimiento y analizando tu técnica...
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-800">Error</span>
              </div>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          )}

          {/* Botón de análisis */}
          {!isUploading && !isAnalyzing && (
            <button
              onClick={handleUploadAndAnalyze}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Play className="w-5 h-5" />
              <span>Analizar Vídeo</span>
            </button>
          )}
        </>
      )}

      {/* Error de selección */}
      {error && !selectedFile && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Instrucciones */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 Consejos para mejores resultados:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Graba de lado para ver mejor tu forma</li>
          <li>• Asegúrate de estar completamente en el encuadre</li>
          <li>• Buena iluminación ayuda al análisis</li>
          <li>• Vídeos de 20-60 segundos funcionan mejor</li>
        </ul>
      </div>
    </div>
  );
};

export default VideoUploadAnalyzer;