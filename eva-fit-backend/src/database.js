const mysql = require('mysql2/promise');

class Database {
  constructor() {
    this.pool = null;
  }

  async connect() {
    try {
      // Configuración del pool
      this.pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'eva_fit',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
        timezone: '+00:00', // ✅ Importante para DATETIME
        dateStrings: false // ✅ Parsear fechas automáticamente
      });

      // Probar conexión
      const connection = await this.pool.getConnection();
      console.log('✅ Connected to MySQL database at', process.env.DB_HOST || 'localhost');
      connection.release();

      await this.createTables();
      return true;
    } catch (error) {
      console.error('❌ Error connecting to MySQL:', error.message);
      console.error('Verify your .env file has:');
      console.error('  DB_HOST=localhost');
      console.error('  DB_USER=root');
      console.error('  DB_PASSWORD=your_password');
      console.error('  DB_NAME=eva_fit');
      throw error;
    }
  }

  async createTables() {
    const tables = [
      // ✅ Tabla de usuarios
      `CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        daily_goals JSON DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      // ✅ Tabla de comidas
      `CREATE TABLE IF NOT EXISTS meals (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        calories INT NOT NULL DEFAULT 0,
        protein DECIMAL(10,2) NOT NULL DEFAULT 0,
        carbs DECIMAL(10,2) NOT NULL DEFAULT 0,
        fat DECIMAL(10,2) NOT NULL DEFAULT 0,
        quantity DECIMAL(10,2) NOT NULL DEFAULT 100,
        meal_time DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_meal_time (meal_time),
        INDEX idx_user_date (user_id, meal_time)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      // ✅ Tabla de entrenamientos
      `CREATE TABLE IF NOT EXISTS workouts (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        duration INT NOT NULL DEFAULT 0,
        calories_burned INT NOT NULL DEFAULT 0,
        workout_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_workout_date (workout_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      // ✅ Tabla de comidas recientes
      `CREATE TABLE IF NOT EXISTS recent_foods (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        calories INT NOT NULL DEFAULT 0,
        protein DECIMAL(10,2) NOT NULL DEFAULT 0,
        carbs DECIMAL(10,2) NOT NULL DEFAULT 0,
        fat DECIMAL(10,2) NOT NULL DEFAULT 0,
        last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_last_used (last_used),
        UNIQUE KEY unique_user_food (user_id, name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    ];

    try {
      for (const sql of tables) {
        await this.pool.query(sql);
      }
      console.log('✅ All database tables created successfully');
    } catch (error) {
      console.error('❌ Error creating tables:', error.message);
      throw error;
    }
  }

  // ✅ Método run corregido para MySQL con UUIDs
  async run(sql, params = []) {
    try {
      const [result] = await this.pool.execute(sql, params);
      return {
        lastID: result.insertId || null, // Para UUIDs será null
        changes: result.affectedRows,
        insertId: result.insertId
      };
    } catch (error) {
      console.error('❌ Database run error:', error.message);
      console.error('   SQL:', sql);
      console.error('   Params:', params);
      throw error;
    }
  }

  // ✅ Método get con mejor manejo de errores
  async get(sql, params = []) {
    try {
      const [rows] = await this.pool.execute(sql, params);
      return rows[0] || null;
    } catch (error) {
      console.error('❌ Database get error:', error.message);
      console.error('   SQL:', sql);
      console.error('   Params:', params);
      throw error;
    }
  }

  // ✅ Método all con mejor manejo de errores
  async all(sql, params = []) {
    try {
      const [rows] = await this.pool.execute(sql, params);
      return rows;
    } catch (error) {
      console.error('❌ Database all error:', error.message);
      console.error('   SQL:', sql);
      console.error('   Params:', params);
      throw error;
    }
  }

  async close() {
    try {
      if (this.pool) {
        await this.pool.end();
        console.log('✅ Database connection closed');
      }
    } catch (error) {
      console.error('❌ Error closing database:', error.message);
      throw error;
    }
  }

  async transaction(callback) {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // ✅ Método helper para verificar conexión
  async ping() {
    try {
      const connection = await this.pool.getConnection();
      await connection.ping();
      connection.release();
      return true;
    } catch (error) {
      console.error('❌ Database ping failed:', error.message);
      return false;
    }
  }
}

const database = new Database();
module.exports = database;