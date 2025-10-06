// eva-fit-backend/src/routes/exercises.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const authMiddleware = require('../middleware/auth');
const database = require('../database');
const crypto = require('crypto');

const router = express.Router();

// Configurar almacenamiento temporal de vídeos
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/videos');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${crypto.randomUUID()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB máximo
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp4|mov|avi|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Solo se permiten vídeos (mp4, mov, avi, webm)'));
  }
});

// Middleware de autenticación
router.use(authMiddleware);

// ✅ Subir vídeo para análisis
router.post('/upload', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ningún vídeo' });
    }

    const { exerciseType } = req.body;
    
    res.json({
      success: true,
      videoId: path.basename(req.file.filename, path.extname(req.file.filename)),
      videoPath: req.file.path,
      exerciseType: exerciseType || 'unknown',
      message: 'Vídeo subido correctamente. Procesa en el frontend.'
    });
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).json({ error: 'Error al subir el vídeo' });
  }
});

// ✅ Guardar resultados de análisis
router.post('/analysis', async (req, res) => {
  try {
    const {
      exerciseType,
      duration,
      repetitions,
      avgAngle,
      errors,
      feedback,
      videoId
    } = req.body;

    const analysisId = crypto.randomUUID();
    
    await database.run(
      `INSERT INTO exercise_analyses 
       (id, user_id, exercise_type, duration, repetitions, avg_angle, errors, feedback, video_id, analyzed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        analysisId,
        req.userId,
        exerciseType,
        duration,
        repetitions,
        avgAngle,
        JSON.stringify(errors),
        feedback,
        videoId
      ]
    );

    // Eliminar vídeo después de guardar análisis (privacidad)
    if (videoId) {
      const videoPath = path.join(__dirname, '../../uploads/videos', `${videoId}.mp4`);
      try {
        await fs.unlink(videoPath);
        console.log(`Video ${videoId} eliminado tras análisis`);
      } catch (err) {
        console.warn(`No se pudo eliminar el vídeo ${videoId}:`, err.message);
      }
    }

    res.json({
      success: true,
      analysisId,
      message: 'Análisis guardado exitosamente'
    });
  } catch (error) {
    console.error('Error saving analysis:', error);
    res.status(500).json({ error: 'Error al guardar el análisis' });
  }
});

// ✅ Obtener historial de análisis
router.get('/history', async (req, res) => {
  try {
    const analyses = await database.all(
      `SELECT 
        id, exercise_type, duration, repetitions, 
        avg_angle, errors, feedback, analyzed_at
       FROM exercise_analyses 
       WHERE user_id = ? 
       ORDER BY analyzed_at DESC 
       LIMIT 50`,
      [req.userId]
    );

    res.json({
      success: true,
      analyses: analyses.map(a => ({
        ...a,
        errors: JSON.parse(a.errors || '[]')
      }))
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

// ✅ Eliminar vídeo manualmente
router.delete('/video/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const videoPath = path.join(__dirname, '../../uploads/videos', `${videoId}.mp4`);
    
    await fs.unlink(videoPath);
    
    res.json({
      success: true,
      message: 'Vídeo eliminado correctamente'
    });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ error: 'Error al eliminar el vídeo' });
  }
});

module.exports = router;