import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Activity, Video, Camera, Clock, StopCircle, Play, BarChart } from 'lucide-react';

// Componente VideoUploadAnalyzer integrado
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

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      setError('Formato de vídeo no soportado. Usa MP4, MOV, AVI o WebM.');
      return;
    }

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('El vídeo es muy grande. Máximo 50MB.');
      return;
    }

    setError(null);
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('video', selectedFile);
      formData.append('exerciseType', exerciseType);

      const uploadResponse = await fetch('http://localhost:3001/api/exercises/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
        body: formData
      });

      if (!uploadResponse.ok) throw new Error('Error al subir el vídeo');

      const uploadData = await uploadResponse.json();
      setUploadProgress(100);
      setIsUploading(false);
      setIsAnalyzing(true);
      
      for (let i = 0; i <= 100; i += 10) {
        setAnalysisProgress(i);
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      const mockResults = {
        exerciseType,
        duration: Math.floor(selectedFile.size / (1024 * 50)),
        repetitions: Math.floor(Math.random() * 15) + 5,
        avgAngle: Math.floor(Math.random() * 50) + 70,
        errors: ['Mantén la espalda más recta', 'Profundiza un poco más el movimiento'].slice(0, Math.floor(Math.random() * 2) + 1),
        feedback: `Análisis completado. Detectamos ${Math.floor(Math.random() * 15) + 5} repeticiones con buena técnica general.`,
        videoId: uploadData.videoId
      };

      await fetch('http://localhost:3001/api/exercises/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(mockResults)
      });

      setIsAnalyzing(false);
      if (onComplete) onComplete(mockResults);

    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Error al procesar el vídeo');
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setVideoUrl(null);
    setUploadProgress(0);
    setAnalysisProgress(0);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      <input ref={fileInputRef} type="file" accept="video/mp4,video/mov,video/avi,video/webm" onChange={handleFileSelect} className="hidden" />

      {!selectedFile ? (
        <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-colors">
          <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Sube tu vídeo de ejercicio</h3>
          <p className="text-sm text-gray-600 mb-4">Formatos: MP4, MOV, AVI, WebM<br/>Máximo: 50MB</p>
          <button className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700">Seleccionar Vídeo</button>
        </div>
      ) : (
        <>
          <div className="bg-black rounded-lg overflow-hidden">
            <video ref={videoRef} src={videoUrl} controls className="w-full h-auto max-h-96" />
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Video className="w-5 h-5 text-gray-600" />
              <div className="flex-1">
                <div className="font-medium text-gray-800">{selectedFile.name}</div>
                <div className="text-sm text-gray-600">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</div>
              </div>
              {!isUploading && !isAnalyzing && (
                <button onClick={handleReset} className="text-red-600 hover:text-red-700 text-sm font-medium">Cambiar</button>
              )}
            </div>
          </div>

          {isUploading && (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="font-medium text-blue-800">Subiendo vídeo...</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="bg-emerald-50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
                <span className="font-medium text-emerald-800">Analizando ejercicio...</span>
              </div>
              <div className="w-full bg-emerald-200 rounded-full h-2">
                <div className="bg-emerald-600 h-2 rounded-full transition-all" style={{ width: `${analysisProgress}%` }} />
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {!isUploading && !isAnalyzing && (
            <button onClick={handleUploadAndAnalyze} className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 flex items-center justify-center space-x-2">
              <Play className="w-5 h-5" />
              <span>Analizar Vídeo</span>
            </button>
          )}
        </>
      )}

      {error && !selectedFile && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 Consejos:</h4>
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

// Componente LiveExerciseAnalyzer integrado directamente
const LiveExerciseAnalyzer = ({ exerciseType, onComplete }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stream, setStream] = useState(null);
  const [currentAngle, setCurrentAngle] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [status, setStatus] = useState('neutral');
  const [repCount, setRepCount] = useState(0);
  const [sessionData, setSessionData] = useState({
    angles: [],
    timestamps: [],
    errors: []
  });
  const [isDown, setIsDown] = useState(false);

  const startCamera = async () => {
    setIsLoading(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('No se pudo acceder a la cámara. Verifica los permisos.');
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const analyzeFrame = () => {
    if (!videoRef.current || !canvasRef.current || !isAnalyzing) return;

    // Simulación de análisis
    const angle = Math.floor(Math.random() * 180);
    let newFeedback = '';
    let newStatus = 'neutral';
    
    if (angle < 90) {
      newFeedback = 'Buena forma';
      newStatus = 'good';
    } else if (angle < 120) {
      newFeedback = 'Mejora el rango';
      newStatus = 'warning';
    } else {
      newFeedback = 'Posición inicial';
      newStatus = 'neutral';
    }
    
    setCurrentAngle(angle);
    setFeedback(newFeedback);
    setStatus(newStatus);
    
    setSessionData(prev => ({
      angles: [...prev.angles, angle],
      timestamps: [...prev.timestamps, Date.now()],
      errors: newStatus === 'warning' ? [...prev.errors, newFeedback] : prev.errors
    }));

    const threshold = 90;
    if (angle < threshold && !isDown) {
      setIsDown(true);
    } else if (angle > threshold + 30 && isDown) {
      setIsDown(false);
      setRepCount(prev => prev + 1);
    }

    if (isAnalyzing) {
      setTimeout(() => analyzeFrame(), 100);
    }
  };

  const startAnalysis = () => {
    setIsAnalyzing(true);
    analyzeFrame();
  };

  const stopAnalysis = () => {
    setIsAnalyzing(false);
    const avgAngle = sessionData.angles.length > 0
      ? Math.round(sessionData.angles.reduce((a, b) => a + b, 0) / sessionData.angles.length)
      : 0;
    const duration = sessionData.timestamps.length > 1
      ? Math.round((sessionData.timestamps[sessionData.timestamps.length - 1] - sessionData.timestamps[0]) / 1000)
      : 0;

    if (onComplete) {
      onComplete({
        exerciseType,
        duration,
        repetitions: repCount,
        avgAngle,
        errors: sessionData.errors,
        feedback: `Completaste ${repCount} repeticiones en ${duration} segundos. Ángulo promedio: ${avgAngle}°`
      });
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
        
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <div className="bg-black bg-opacity-70 text-white px-4 py-3 rounded-lg space-y-2">
            <div className="text-sm font-medium">
              Ejercicio: {exerciseType === 'squat' ? 'Sentadilla' : exerciseType === 'pushup' ? 'Flexión' : 'Curl de Bíceps'}
            </div>
            <div className="text-2xl font-bold">{repCount} reps</div>
            {currentAngle && <div className="text-sm">Ángulo: {currentAngle}°</div>}
          </div>
          
          {feedback && (
            <div className={`px-4 py-3 rounded-lg text-white font-medium ${
              status === 'good' ? 'bg-green-600' : status === 'warning' ? 'bg-yellow-600' : 'bg-gray-600'
            }`}>
              {feedback}
            </div>
          )}
        </div>
      </div>

      <div className="flex space-x-3">
        {!stream ? (
          <button onClick={startCamera} disabled={isLoading}
            className="flex-1 bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center space-x-2">
            <Camera className="w-5 h-5" />
            <span>{isLoading ? 'Iniciando...' : 'Activar Cámara'}</span>
          </button>
        ) : !isAnalyzing ? (
          <>
            <button onClick={startAnalysis} disabled={isLoading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2">
              <Play className="w-5 h-5" />
              <span>Iniciar Análisis</span>
            </button>
            <button onClick={stopCamera} className="px-6 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700">
              Cerrar
            </button>
          </>
        ) : (
          <button onClick={stopAnalysis}
            className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 flex items-center justify-center space-x-2">
            <StopCircle className="w-5 h-5" />
            <span>Detener y Guardar</span>
          </button>
        )}
      </div>

      {isAnalyzing && sessionData.angles.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <BarChart className="w-5 h-5 text-gray-600" />
            <h3 className="font-medium text-gray-800">Estadísticas de Sesión</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-emerald-600">{repCount}</div>
              <div className="text-sm text-gray-600">Repeticiones</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(sessionData.angles.reduce((a, b) => a + b, 0) / sessionData.angles.length)}°
              </div>
              <div className="text-sm text-gray-600">Ángulo Promedio</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{sessionData.errors.length}</div>
              <div className="text-sm text-gray-600">Alertas</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ExerciseAnalysisScreen = ({ setActiveTab }) => {
  const [selectedMode, setSelectedMode] = useState(null); // 'live' o 'upload'
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);

  const exercises = [
    { id: 'squat', name: 'Sentadilla', icon: '🏋️', description: 'Analiza tu técnica de sentadilla' },
    { id: 'pushup', name: 'Flexión', icon: '💪', description: 'Verifica tu forma en flexiones' },
    { id: 'bicep_curl', name: 'Curl de Bíceps', icon: '💪', description: 'Optimiza tu curl de bíceps' }
  ];

  const handleAnalysisComplete = async (results) => {
    setAnalysisResults(results);
    
    // Guardar en backend (opcional)
    try {
      const response = await fetch('http://localhost:3001/api/exercises/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(results)
      });
      
      if (response.ok) {
        console.log('✅ Análisis guardado en el servidor');
      }
    } catch (error) {
      console.error('Error guardando análisis:', error);
    }
  };

  const resetAnalysis = () => {
    setSelectedMode(null);
    setSelectedExercise(null);
    setAnalysisResults(null);
  };

  // Vista: Selección de modo
  if (!selectedMode) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab('workouts')}
              className="text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-gray-800 flex-1">
              Análisis de Ejercicios
            </h1>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Descripción */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-3">
              <Activity className="w-6 h-6 text-emerald-600" />
              <h2 className="text-lg font-semibold text-gray-800">
                EVA Analiza tu Técnica
              </h2>
            </div>
            <p className="text-gray-600 text-sm">
              Usa inteligencia artificial para analizar tu forma y recibir feedback en tiempo real sobre tus ejercicios.
            </p>
          </div>

          {/* Selección de Modo */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">Elige cómo analizar:</h3>
            
            {/* Modo: Cámara en Vivo */}
            <button
              onClick={() => setSelectedMode('live')}
              className="w-full bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow text-left border-2 border-transparent hover:border-emerald-600"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Camera className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">Análisis en Tiempo Real</h4>
                  <p className="text-sm text-gray-600">
                    Usa tu cámara para recibir feedback instantáneo mientras entrenas
                  </p>
                </div>
              </div>
            </button>

            {/* Modo: Subir Vídeo */}
            <button
              onClick={() => setSelectedMode('upload')}
              className="w-full bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow text-left border-2 border-transparent hover:border-blue-600"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Video className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">Analizar Vídeo</h4>
                  <p className="text-sm text-gray-600">
                    Sube un vídeo de tu entrenamiento para un análisis detallado
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vista: Selección de ejercicio
  if (!selectedExercise) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSelectedMode(null)}
              className="text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-gray-800 flex-1">
              Selecciona tu Ejercicio
            </h1>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {exercises.map(exercise => (
            <button
              key={exercise.id}
              onClick={() => setSelectedExercise(exercise.id)}
              className="w-full bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow text-left border-2 border-transparent hover:border-emerald-600"
            >
              <div className="flex items-center space-x-4">
                <div className="text-4xl">{exercise.icon}</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{exercise.name}</h4>
                  <p className="text-sm text-gray-600">{exercise.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Vista: Resultados del análisis
  if (analysisResults) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <button
              onClick={resetAnalysis}
              className="text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-gray-800 flex-1">
              Resultados del Análisis
            </h1>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Resumen */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Resumen de la Sesión</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-emerald-50 rounded-lg">
                <div className="text-3xl font-bold text-emerald-600">
                  {analysisResults.repetitions}
                </div>
                <div className="text-sm text-gray-600">Repeticiones</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  {analysisResults.duration}s
                </div>
                <div className="text-sm text-gray-600">Duración</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-3xl font-bold text-orange-600">
                  {analysisResults.avgAngle}°
                </div>
                <div className="text-sm text-gray-600">Ángulo Promedio</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-3xl font-bold text-red-600">
                  {analysisResults.errors?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Alertas</div>
              </div>
            </div>
          </div>

          {/* Feedback */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">Feedback de EVA</h3>
            <p className="text-gray-700">{analysisResults.feedback}</p>
          </div>

          {/* Errores detectados */}
          {analysisResults.errors && analysisResults.errors.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-3">Puntos de Mejora</h3>
              <ul className="space-y-2">
                {analysisResults.errors.map((error, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                    <span className="text-yellow-600">⚠️</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Botón para nuevo análisis */}
          <button
            onClick={resetAnalysis}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Analizar Otro Ejercicio
          </button>
        </div>
      </div>
    );
  }

  // Vista: Análisis en tiempo real
  if (selectedMode === 'live') {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSelectedExercise(null)}
              className="text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-gray-800 flex-1">
              {exercises.find(e => e.id === selectedExercise)?.name}
            </h1>
          </div>
        </div>

        <div className="p-6">
          <LiveExerciseAnalyzer 
            exerciseType={selectedExercise}
            onComplete={handleAnalysisComplete}
          />
        </div>
      </div>
    );
  }

  // Vista: Subir vídeo (placeholder)
if (selectedMode === 'upload') {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSelectedExercise(null)}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-gray-800 flex-1">
            {exercises.find(e => e.id === selectedExercise)?.name} - Subir Vídeo
          </h1>
        </div>
      </div>

      <div className="p-6">
        {/* REEMPLAZA el div del placeholder con esto: */}
        <VideoUploadAnalyzer 
          exerciseType={selectedExercise}
          onComplete={handleAnalysisComplete}
        />
      </div>
    </div>
  );
}
};

export default ExerciseAnalysisScreen;