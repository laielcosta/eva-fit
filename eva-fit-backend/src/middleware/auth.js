const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        error: 'Token de acceso requerido',
        message: 'Debes iniciar sesión para acceder a este recurso'
      });
    }

    // Verificar token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Agregar información del usuario a la request
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'El token de acceso no es válido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado',
        message: 'El token de acceso ha expirado, inicia sesión nuevamente'
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

module.exports = authMiddleware;