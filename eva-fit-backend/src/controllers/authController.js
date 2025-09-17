const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('crypto');
const database = require('../database');

class AuthController {
  // Registrar nuevo usuario
  async register(req, res) {
    try {
      const { email, password, name } = req.body;

      // Validaciones básicas
      if (!email || !password || !name) {
        return res.status(400).json({
          error: 'Todos los campos son requeridos',
          fields: ['email', 'password', 'name']
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          error: 'La contraseña debe tener al menos 6 caracteres'
        });
      }

      // Verificar si el usuario ya existe
      const existingUser = await database.get(
        'SELECT id FROM users WHERE email = ?',
        [email.toLowerCase()]
      );

      if (existingUser) {
        return res.status(409).json({
          error: 'El usuario ya existe con este email'
        });
      }

      // Hashear contraseña
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // Crear usuario
      const userId = uuidv4();
      await database.run(
        'INSERT INTO users (id, email, password, name) VALUES (?, ?, ?, ?)',
        [userId, email.toLowerCase(), hashedPassword, name]
      );

      // Generar token JWT
      const token = jwt.sign(
        { userId, email: email.toLowerCase() },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'Usuario creado exitosamente',
        user: {
          id: userId,
          email: email.toLowerCase(),
          name
        },
        token
      });
    } catch (error) {
      console.error('Error in register:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  // Iniciar sesión
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validaciones básicas
      if (!email || !password) {
        return res.status(400).json({
          error: 'Email y contraseña son requeridos'
        });
      }

      // Buscar usuario
      const user = await database.get(
        'SELECT id, email, password, name, daily_goals FROM users WHERE email = ?',
        [email.toLowerCase()]
      );

      if (!user) {
        return res.status(401).json({
          error: 'Email o contraseña incorrectos'
        });
      }

      // Verificar contraseña
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({
          error: 'Email o contraseña incorrectos'
        });
      }

      // Generar token JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Parsear objetivos diarios
      let dailyGoals;
      try {
        dailyGoals = JSON.parse(user.daily_goals);
      } catch {
        dailyGoals = { calories: 2000, protein: 150, carbs: 250, fat: 65 };
      }

      res.json({
        message: 'Sesión iniciada exitosamente',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          dailyGoals
        },
        token
      });
    } catch (error) {
      console.error('Error in login:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  // Obtener perfil del usuario
  async getProfile(req, res) {
    try {
      const user = await database.get(
        'SELECT id, email, name, daily_goals, created_at FROM users WHERE id = ?',
        [req.userId]
      );

      if (!user) {
        return res.status(404).json({
          error: 'Usuario no encontrado'
        });
      }

      // Parsear objetivos diarios
      let dailyGoals;
      try {
        dailyGoals = JSON.parse(user.daily_goals);
      } catch {
        dailyGoals = { calories: 2000, protein: 150, carbs: 250, fat: 65 };
      }

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          dailyGoals,
          memberSince: user.created_at
        }
      });
    } catch (error) {
      console.error('Error in getProfile:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  // Actualizar perfil
  async updateProfile(req, res) {
    try {
      const { name, dailyGoals } = req.body;

      // Preparar campos a actualizar
      const updates = [];
      const params = [];

      if (name) {
        updates.push('name = ?');
        params.push(name);
      }

      if (dailyGoals) {
        updates.push('daily_goals = ?');
        params.push(JSON.stringify(dailyGoals));
      }

      if (updates.length === 0) {
        return res.status(400).json({
          error: 'No hay campos para actualizar'
        });
      }

      updates.push('updated_at = CURRENT_TIMESTAMP');
      params.push(req.userId);

      await database.run(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        params
      );

      // Obtener usuario actualizado
      const user = await database.get(
        'SELECT id, email, name, daily_goals FROM users WHERE id = ?',
        [req.userId]
      );

      let parsedGoals;
      try {
        parsedGoals = JSON.parse(user.daily_goals);
      } catch {
        parsedGoals = { calories: 2000, protein: 150, carbs: 250, fat: 65 };
      }

      res.json({
        message: 'Perfil actualizado exitosamente',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          dailyGoals: parsedGoals
        }
      });
    } catch (error) {
      console.error('Error in updateProfile:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }
}

module.exports = new AuthController();