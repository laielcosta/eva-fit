const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Rutas públicas (no requieren autenticación)
router.post('/register', authController.register);
router.post('/login', authController.login);

// Rutas protegidas (requieren autenticación)
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);

// Ruta para verificar token
router.get('/verify', authMiddleware, (req, res) => {
  res.json({
    valid: true,
    userId: req.userId,
    email: req.userEmail
  });
});

module.exports = router;