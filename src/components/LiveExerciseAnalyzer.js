import React, { useRef, useState, useEffect } from 'react';
import { Camera, StopCircle, Play, BarChart } from 'lucide-react';

// Mock del servicio de pose detection para la demostración
const poseDetectionService = {
  isReady: false,
  
  async initialize() {
    this.isReady = true;
    return Promise.resolve();
  },
  
  async detectPose(videoElement) {
    // Simulación de detección
    return {
      keypoints: [
        { name: 'right_shoulder', x: 320, y: 200, score: 0.9 },
        { name: 'right_elbow', x: 350, y: 250, score: 0.9 },
        { name: 'right_wrist', x: 380, y: 300, score: 0.9 },
        { name: 'right_hip', x: 300, y: 350, score: 0.9 },
        { name: 'right_knee', x: 310, y: 450, score: 0.9 },
        { name: 'right_ankle', x: 320, y: 550, score: 0.9 }
      ]
    };
  },
  
  calculateAngle(pointA, pointB, pointC) {
    const radians = Math.atan2(pointC.y - pointB.y, pointC.x - pointB.x) -
                    Math.atan2(pointA.y - pointB.y, pointA.x - pointB.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    if (angle > 180.0) angle = 360 - angle;
    return Math.round(angle * 10) / 10;
  },
  
  getKeypoint(pose, name) {
    if (!pose || !pose.keypoints) return null;
    return pose.keypoints.find(kp => kp.name === name);
  },
  
  analyzeExercise(pose, exerciseType) {
    // Generar ángulo aleatorio para simulación
    const angle = Math.floor(Math.random() * 180);
    
    let feedback = '';
    let status = 'neutral';
    
    if (angle < 90) {
      feedback = 'Buena forma';
      status = 'good';
    } else if (angle < 120) {
      feedback = 'Mejora el rango';
      status = 'warning';
    } else {
      feedback = 'Posición inicial';
      status = 'neutral';
    }
    
    return { angle, feedback, status };
  },
  
  drawPose(pose, canvas, video) {
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (!pose || !pose.keypoints) return;
    
    // Dibujar keypoints
    pose.keypoints.forEach(kp => {
      ctx.beginPath();
      ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = '#00ff00';
      ctx.fill();
    });
    
    // Dibujar líneas entre keypoints
    const connections = [
      ['right_shoulder', 'right_elbow'],
      ['right_elbow', 'right_wrist'],
      ['right_hip', 'right_knee'],
      ['right_knee', 'right_ankle']
    ];
    
    connections.forEach(([start, end]) => {
      const kp1 = pose.keypoints.find(k => k.name === start);
      const kp2 = pose.keypoints.find(k => k.name === end);
      
      if (kp1 && kp2) {
        ctx.beginPath();
        ctx.moveTo(kp1.x, kp1.y);
        ctx.lineTo(kp2.x, kp2.y);
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  },
  
  dispose() {
    this.isReady = false;
  }
};

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

  // Estados para detección de repeticiones
  const [isDown, setIsDown] = useState(false);
  const [lastAngle, setLastAngle] = useState(null);

  // Inicializar cámara
  const startCamera = async () => {
    setIsLoading(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
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

  // Detener cámara
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Analizar frame en tiempo real
  const analyzeFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !isAnalyzing) return;

    const pose = await poseDetectionService.detectPose(videoRef.current);
    
    if (pose) {
      // Dibujar esqueleto
      poseDetectionService.drawPose(pose, canvasRef.current, videoRef.current);
      
      // Analizar ejercicio
      const analysis = poseDetectionService.analyzeExercise(pose, exerciseType);
      
      if (analysis.angle) {
        setCurrentAngle(analysis.angle);
        setFeedback(analysis.feedback);
        setStatus(analysis.status);
        
        // Guardar datos para estadísticas
        setSessionData(prev => ({
          angles: [...prev.angles, analysis.angle],
          timestamps: [...prev.timestamps, Date.now()],
          errors: analysis.status === 'warning' ? [...prev.errors, analysis.feedback] : prev.errors
        }));

        // Detectar repeticiones (para sentadillas: ángulo < 90 = abajo)
        detectRepetition(analysis.angle);
      }
    }

    // Continuar análisis
    if (isAnalyzing) {
      requestAnimationFrame(analyzeFrame);
    }
  };

  // Detectar repeticiones automáticamente
  const detectRepetition = (angle) => {
    const threshold = exerciseType === 'squat' ? 90 : 90; // Ajustar según ejercicio
    
    if (angle < threshold && !isDown) {
      setIsDown(true);
    } else if (angle > threshold + 30 && isDown) {
      setIsDown(false);
      setRepCount(prev => prev + 1);
    }
    
    setLastAngle(angle);
  };

  // Iniciar análisis
  const startAnalysis = async () => {
    setIsLoading(true);
    try {
      await poseDetectionService.initialize();
      setIsAnalyzing(true);
      analyzeFrame();
    } catch (error) {
      console.error('Error starting analysis:', error);
      alert('Error al iniciar el análisis');
    } finally {
      setIsLoading(false);
    }
  };

  // Detener análisis
  const stopAnalysis = () => {
    setIsAnalyzing(false);
    
    // Calcular estadísticas finales
    const avgAngle = sessionData.angles.length > 0
      ? Math.round(sessionData.angles.reduce((a, b) => a + b, 0) / sessionData.angles.length)
      : 0;
    
    const duration = sessionData.timestamps.length > 1
      ? Math.round((sessionData.timestamps[sessionData.timestamps.length - 1] - sessionData.timestamps[0]) / 1000)
      : 0;

    // Llamar callback con resultados
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

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      stopCamera();
      poseDetectionService.dispose();
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Video y Canvas */}
      <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
        />
        
        {/* Overlay de información */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          {/* Métricas en tiempo real */}
          <div className="bg-black bg-opacity-70 text-white px-4 py-3 rounded-lg space-y-2">
            <div className="text-sm font-medium">
              Ejercicio: {exerciseType === 'squat' ? 'Sentadilla' : exerciseType === 'pushup' ? 'Flexión' : 'Curl de Bíceps'}
            </div>
            <div className="text-2xl font-bold">{repCount} reps</div>
            {currentAngle && (
              <div className="text-sm">Ángulo: {currentAngle}°</div>
            )}
          </div>
          
          {/* Feedback visual */}
          {feedback && (
            <div className={`px-4 py-3 rounded-lg text-white font-medium ${
              status === 'good' ? 'bg-green-600' : 
              status === 'warning' ? 'bg-yellow-600' : 
              'bg-gray-600'
            }`}>
              {feedback}
            </div>
          )}
        </div>
      </div>

      {/* Controles */}
      <div className="flex space-x-3">
        {!stream ? (
          <button
            onClick={startCamera}
            disabled={isLoading}
            className="flex-1 bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <Camera className="w-5 h-5" />
            <span>{isLoading ? 'Iniciando...' : 'Activar Cámara'}</span>
          </button>
        ) : !isAnalyzing ? (
          <>
            <button
              onClick={startAnalysis}
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <Play className="w-5 h-5" />
              <span>{isLoading ? 'Cargando modelo...' : 'Iniciar Análisis'}</span>
            </button>
            <button
              onClick={stopCamera}
              className="px-6 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700"
            >
              Cerrar
            </button>
          </>
        ) : (
          <button
            onClick={stopAnalysis}
            className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 flex items-center justify-center space-x-2"
          >
            <StopCircle className="w-5 h-5" />
            <span>Detener y Guardar</span>
          </button>
        )}
      </div>

      {/* Estadísticas en tiempo real */}
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
              <div className="text-2xl font-bold text-orange-600">
                {sessionData.errors.length}
              </div>
              <div className="text-sm text-gray-600">Alertas</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveExerciseAnalyzer;