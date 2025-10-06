// src/services/poseDetection.js
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';

class PoseDetectionService {
  constructor() {
    this.detector = null;
    this.isReady = false;
  }

  /**
   * Inicializar el modelo MoveNet
   */
  async initialize() {
    if (this.isReady) return;

    try {
      const model = poseDetection.SupportedModels.MoveNet;
      const detectorConfig = {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        enableTracking: true,
        trackerType: poseDetection.TrackerType.BoundingBox
      };

      this.detector = await poseDetection.createDetector(model, detectorConfig);
      this.isReady = true;
      console.log('✅ MoveNet cargado correctamente');
    } catch (error) {
      console.error('❌ Error cargando MoveNet:', error);
      throw error;
    }
  }

  /**
   * Detectar pose en una imagen/frame
   */
  async detectPose(imageElement) {
    if (!this.isReady) {
      await this.initialize();
    }

    try {
      const poses = await this.detector.estimatePoses(imageElement);
      return poses.length > 0 ? poses[0] : null;
    } catch (error) {
      console.error('Error detectando pose:', error);
      return null;
    }
  }

  /**
   * Calcular ángulo entre tres puntos (articulaciones)
   */
  calculateAngle(pointA, pointB, pointC) {
    const radians = Math.atan2(pointC.y - pointB.y, pointC.x - pointB.x) -
                    Math.atan2(pointA.y - pointB.y, pointA.x - pointB.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    
    if (angle > 180.0) {
      angle = 360 - angle;
    }
    
    return Math.round(angle * 10) / 10;
  }

  /**
   * Obtener keypoints específicos
   */
  getKeypoint(pose, keypointName) {
    if (!pose || !pose.keypoints) return null;
    
    const keypoint = pose.keypoints.find(kp => kp.name === keypointName);
    return keypoint && keypoint.score > 0.3 ? keypoint : null;
  }

  /**
   * Analizar ejercicio de sentadillas
   */
  analyzeSquat(pose) {
    const hip = this.getKeypoint(pose, 'right_hip') || this.getKeypoint(pose, 'left_hip');
    const knee = this.getKeypoint(pose, 'right_knee') || this.getKeypoint(pose, 'left_knee');
    const ankle = this.getKeypoint(pose, 'right_ankle') || this.getKeypoint(pose, 'left_ankle');

    if (!hip || !knee || !ankle) {
      return { angle: null, feedback: 'Posición no visible' };
    }

    const kneeAngle = this.calculateAngle(hip, knee, ankle);
    
    let feedback = '';
    let status = 'neutral';
    
    if (kneeAngle < 70) {
      feedback = 'Excelente profundidad';
      status = 'good';
    } else if (kneeAngle < 90) {
      feedback = 'Buena forma, profundiza un poco más';
      status = 'good';
    } else if (kneeAngle < 120) {
      feedback = 'Baja más para mejor rango';
      status = 'warning';
    } else {
      feedback = 'Posición de inicio';
      status = 'neutral';
    }

    return { angle: kneeAngle, feedback, status };
  }

  /**
   * Analizar ejercicio de flexiones
   */
  analyzePushup(pose) {
    const shoulder = this.getKeypoint(pose, 'right_shoulder') || this.getKeypoint(pose, 'left_shoulder');
    const elbow = this.getKeypoint(pose, 'right_elbow') || this.getKeypoint(pose, 'left_elbow');
    const wrist = this.getKeypoint(pose, 'right_wrist') || this.getKeypoint(pose, 'left_wrist');

    if (!shoulder || !elbow || !wrist) {
      return { angle: null, feedback: 'Posición no visible' };
    }

    const elbowAngle = this.calculateAngle(shoulder, elbow, wrist);
    
    let feedback = '';
    let status = 'neutral';
    
    if (elbowAngle < 90) {
      feedback = 'Buen rango de movimiento';
      status = 'good';
    } else if (elbowAngle < 120) {
      feedback = 'Baja un poco más';
      status = 'warning';
    } else {
      feedback = 'Posición inicial';
      status = 'neutral';
    }

    return { angle: elbowAngle, feedback, status };
  }

  /**
   * Analizar ejercicio de curl de bíceps
   */
  analyzeBicepCurl(pose) {
    const shoulder = this.getKeypoint(pose, 'right_shoulder') || this.getKeypoint(pose, 'left_shoulder');
    const elbow = this.getKeypoint(pose, 'right_elbow') || this.getKeypoint(pose, 'left_elbow');
    const wrist = this.getKeypoint(pose, 'right_wrist') || this.getKeypoint(pose, 'left_wrist');

    if (!shoulder || !elbow || !wrist) {
      return { angle: null, feedback: 'Posición no visible' };
    }

    const elbowAngle = this.calculateAngle(shoulder, elbow, wrist);
    
    let feedback = '';
    let status = 'neutral';
    
    if (elbowAngle < 45) {
      feedback = 'Contracción máxima perfecta';
      status = 'good';
    } else if (elbowAngle < 90) {
      feedback = 'Buena contracción';
      status = 'good';
    } else if (elbowAngle < 150) {
      feedback = 'Posición intermedia';
      status = 'neutral';
    } else {
      feedback = 'Posición inicial';
      status = 'neutral';
    }

    return { angle: elbowAngle, feedback, status };
  }

  /**
   * Analizar ejercicio según tipo
   */
  analyzeExercise(pose, exerciseType) {
    switch (exerciseType.toLowerCase()) {
      case 'squat':
      case 'sentadilla':
        return this.analyzeSquat(pose);
      case 'pushup':
      case 'flexion':
        return this.analyzePushup(pose);
      case 'bicep_curl':
      case 'curl':
        return this.analyzeBicepCurl(pose);
      default:
        return { angle: null, feedback: 'Ejercicio no soportado' };
    }
  }

  /**
   * Dibujar esqueleto en canvas
   */
  drawPose(pose, canvas, video) {
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!pose || !pose.keypoints) return;

    // Dibujar keypoints
    pose.keypoints.forEach(keypoint => {
      if (keypoint.score > 0.3) {
        ctx.beginPath();
        ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#00ff00';
        ctx.fill();
      }
    });

    // Dibujar conexiones
    const connections = poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.MoveNet);
    connections.forEach(([i, j]) => {
      const kp1 = pose.keypoints[i];
      const kp2 = pose.keypoints[j];
      
      if (kp1.score > 0.3 && kp2.score > 0.3) {
        ctx.beginPath();
        ctx.moveTo(kp1.x, kp1.y);
        ctx.lineTo(kp2.x, kp2.y);
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  }

  /**
   * Limpiar recursos
   */
  dispose() {
    if (this.detector) {
      this.detector.dispose();
      this.detector = null;
      this.isReady = false;
    }
  }
}

export default new PoseDetectionService();