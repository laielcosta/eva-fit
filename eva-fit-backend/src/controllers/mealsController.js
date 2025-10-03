const database = require('../database');
const crypto = require('crypto');

// Función para generar UUID v4 simple
function generateUUID() {
  return crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

class MealsController {
  // Obtener todas las comidas del usuario
  async getAllMeals(req, res) {
    try {
      const meals = await database.all(
        'SELECT * FROM meals WHERE user_id = ? ORDER BY meal_time DESC',
        [req.userId]
      );

      res.json({
        meals: meals.map(meal => ({
          id: meal.id,
          name: meal.name,
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fat: meal.fat,
          quantity: meal.quantity,
          time: meal.meal_time,
          createdAt: meal.created_at
        }))
      });
    } catch (error) {
      console.error('Error in getAllMeals:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  // Obtener comidas de hoy
  async getTodayMeals(req, res) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const meals = await database.all(
        'SELECT * FROM meals WHERE user_id = ? AND DATE(meal_time) = ? ORDER BY meal_time DESC',
        [req.userId, today]
      );

      res.json({
        meals: meals.map(meal => ({
          id: meal.id,
          name: meal.name,
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fat: meal.fat,
          quantity: meal.quantity,
          time: meal.meal_time,
          createdAt: meal.created_at
        }))
      });
    } catch (error) {
      console.error('Error in getTodayMeals:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  // Crear nueva comida
  async createMeal(req, res) {
    try {
      const { name, calories, protein, carbs, fat, quantity = 100 } = req.body;

      // Validaciones básicas
      if (!name || calories === undefined) {
        return res.status(400).json({
          error: 'Nombre y calorías son requeridos'
        });
      }

      if (calories < 0 || protein < 0 || carbs < 0 || fat < 0) {
        return res.status(400).json({
          error: 'Los valores nutricionales no pueden ser negativos'
        });
      }

      const mealId = generateUUID();
      const mealTime = new Date().toISOString();

      console.log('Creating meal:', { mealId, userId: req.userId, name, calories, protein, carbs, fat, quantity, mealTime });

      await database.run(
        'INSERT INTO meals (id, user_id, name, calories, protein, carbs, fat, quantity, meal_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [mealId, req.userId, name, calories, protein || 0, carbs || 0, fat || 0, quantity, mealTime]
      );

      // Agregar a comidas recientes
      await this.addToRecentFoods(req.userId, { 
        name, 
        calories, 
        protein: protein || 0, 
        carbs: carbs || 0, 
        fat: fat || 0 
      });

      const newMeal = {
        id: mealId,
        name,
        calories,
        protein: protein || 0,
        carbs: carbs || 0,
        fat: fat || 0,
        quantity,
        time: mealTime
      };

      res.status(201).json({
        message: 'Comida agregada exitosamente',
        meal: newMeal
      });
    } catch (error) {
      console.error('Error in createMeal:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  }

  // Actualizar comida
  async updateMeal(req, res) {
    try {
      const { id } = req.params;
      const { name, calories, protein, carbs, fat, quantity } = req.body;

      // Verificar que la comida existe y pertenece al usuario
      const existingMeal = await database.get(
        'SELECT id FROM meals WHERE id = ? AND user_id = ?',
        [id, req.userId]
      );

      if (!existingMeal) {
        return res.status(404).json({
          error: 'Comida no encontrada'
        });
      }

      // Preparar campos a actualizar
      const updates = [];
      const params = [];

      if (name !== undefined) {
        updates.push('name = ?');
        params.push(name);
      }
      if (calories !== undefined) {
        updates.push('calories = ?');
        params.push(calories);
      }
      if (protein !== undefined) {
        updates.push('protein = ?');
        params.push(protein);
      }
      if (carbs !== undefined) {
        updates.push('carbs = ?');
        params.push(carbs);
      }
      if (fat !== undefined) {
        updates.push('fat = ?');
        params.push(fat);
      }
      if (quantity !== undefined) {
        updates.push('quantity = ?');
        params.push(quantity);
      }

      if (updates.length === 0) {
        return res.status(400).json({
          error: 'No hay campos para actualizar'
        });
      }

      params.push(id, req.userId);

      await database.run(
        `UPDATE meals SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
        params
      );

      // Obtener comida actualizada
      const updatedMeal = await database.get(
        'SELECT * FROM meals WHERE id = ? AND user_id = ?',
        [id, req.userId]
      );

      res.json({
        message: 'Comida actualizada exitosamente',
        meal: {
          id: updatedMeal.id,
          name: updatedMeal.name,
          calories: updatedMeal.calories,
          protein: updatedMeal.protein,
          carbs: updatedMeal.carbs,
          fat: updatedMeal.fat,
          quantity: updatedMeal.quantity,
          time: updatedMeal.meal_time
        }
      });
    } catch (error) {
      console.error('Error in updateMeal:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  // Eliminar comida
  async deleteMeal(req, res) {
    try {
      const { id } = req.params;

      const result = await database.run(
        'DELETE FROM meals WHERE id = ? AND user_id = ?',
        [id, req.userId]
      );

      if (result.changes === 0) {
        return res.status(404).json({
          error: 'Comida no encontrada'
        });
      }

      res.json({
        message: 'Comida eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error in deleteMeal:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  // Obtener estadísticas nutricionales
  async getNutritionStats(req, res) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const stats = await database.get(
        `SELECT 
          COALESCE(SUM(calories), 0) as totalCalories,
          COALESCE(SUM(protein), 0) as totalProtein,
          COALESCE(SUM(carbs), 0) as totalCarbs,
          COALESCE(SUM(fat), 0) as totalFat,
          COUNT(*) as mealCount
        FROM meals 
        WHERE user_id = ? AND DATE(meal_time) = ?`,
        [req.userId, today]
      );

      res.json({
        stats: {
          totalCalories: stats.totalCalories,
          totalProtein: Math.round(stats.totalProtein * 10) / 10,
          totalCarbs: Math.round(stats.totalCarbs * 10) / 10,
          totalFat: Math.round(stats.totalFat * 10) / 10,
          mealCount: stats.mealCount
        },
        date: today
      });
    } catch (error) {
      console.error('Error in getNutritionStats:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  // Método helper para agregar a comidas recientes
  async addToRecentFoods(userId, foodData) {
    try {
      // Verificar si ya existe
      const existing = await database.get(
        'SELECT id FROM recent_foods WHERE user_id = ? AND name = ?',
        [userId, foodData.name]
      );

      if (existing) {
        // Actualizar fecha de uso
        await database.run(
          'UPDATE recent_foods SET last_used = CURRENT_TIMESTAMP WHERE id = ?',
          [existing.id]
        );
      } else {
        // Agregar nuevo
        const foodId = generateUUID();
        await database.run(
          'INSERT INTO recent_foods (id, user_id, name, calories, protein, carbs, fat) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [foodId, userId, foodData.name, foodData.calories, foodData.protein, foodData.carbs, foodData.fat]
        );

        // Mantener solo los últimos 10
        await database.run(
          `DELETE FROM recent_foods 
          WHERE user_id = ? AND id NOT IN (
            SELECT id FROM recent_foods 
            WHERE user_id = ? 
            ORDER BY last_used DESC 
            LIMIT 10
          )`,
          [userId, userId]
        );
      }
    } catch (error) {
      console.error('Error adding to recent foods:', error);
      // No propagamos el error para no afectar el guardado de la comida
    }
  }

  // Obtener comidas recientes
  async getRecentFoods(req, res) {
    try {
      const recentFoods = await database.all(
        'SELECT * FROM recent_foods WHERE user_id = ? ORDER BY last_used DESC LIMIT 10',
        [req.userId]
      );

      res.json({
        recentFoods: recentFoods.map(food => ({
          id: food.id,
          name: food.name,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          lastUsed: food.last_used
        }))
      });
    } catch (error) {
      console.error('Error in getRecentFoods:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }
}

module.exports = new MealsController();