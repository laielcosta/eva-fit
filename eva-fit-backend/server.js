require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Seleccionar base de datos según configuración
const dbType = process.env.DB_TYPE || 'sqlite';
const database = dbType === 'mysql' 
  ? require('./src/database-mysql')
  : require('./src/database');

const app = express();
// ... resto del código igual
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.get('/', (req, res) => {
  res.json({
    message: 'EVA Fit API Server',
    version: '1.0.0',
    status: 'running'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Auth routes
app.use('/api/auth', require('./src/routes/auth'));

// Meals routes
app.use('/api/meals', require('./src/routes/meals'));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Inicializar servidor
const startServer = async () => {
  try {
    // Conectar a la base de datos
    await database.connect();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
      console.log(`💾 Database: ${process.env.DB_TYPE || 'SQLite'}`);
      console.log(`📋 Available endpoints:`);
      console.log(`   POST /api/auth/register - Register user`);
      console.log(`   POST /api/auth/login - Login user`);
      console.log(`   GET /api/auth/profile - Get profile`);
      console.log(`   PUT /api/auth/profile - Update profile`);
      console.log(`   GET /api/meals - Get all meals`);
      console.log(`   GET /api/meals/today - Get today's meals`);
      console.log(`   POST /api/meals - Create meal`);
      console.log(`   PUT /api/meals/:id - Update meal`);
      console.log(`   DELETE /api/meals/:id - Delete meal`);
      console.log(`   GET /api/meals/stats - Nutrition statistics`);
      console.log(`   GET /api/meals/recent - Recent foods`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Manejar cierre graceful
process.on('SIGINT', async () => {
  console.log('\nShutting down server...');
  try {
    await database.close();
    console.log('Database closed');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

startServer();