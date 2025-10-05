const database = require('../database');
const crypto = require('crypto');

function generateUUID() {
  return crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ✅ Función helper fuera de la clase
async function addToRecentFoods(userId, foodData) {
  try {
    const foodId = generateUUID();
    
    await database.run(
      `INSERT INTO recent_foods (id, user_id, name, calories, protein, carbs, fat, last_used) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE last_used = NOW()`,
      [
        foodId,
        userId,
        foodData.name,
        parseInt(foodData.calories),
        parseFloat(foodData.protein),
        parseFloat(foodData.carbs),
        parseFloat(foodData.fat)
      ]
    );

    await database.run(
      `DELETE FROM recent_foods 
       WHERE user_id = ? 
       AND id NOT IN (
         SELECT id FROM (
           SELECT id FROM recent_foods 
           WHERE user_id = ? 
           ORDER BY last_used DESC 
           LIMIT 10
         ) AS top_foods
       )`,
      [userId, userId]
    );
  } catch (error) {
    console.error('Error adding to recent foods:', error.message);
  }
}

class MealsController {
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
          protein: parseFloat(meal.protein),
          carbs: parseFloat(meal.carbs),
          fat: parseFloat(meal.fat),
          quantity: parseFloat(meal.quantity),
          time: meal.meal_time,
          createdAt: meal.created_at
        }))
      });
    } catch (error) {
      console.error('Error in getAllMeals:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

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
          protein: parseFloat(meal.protein),
          carbs: parseFloat(meal.carbs),
          fat: parseFloat(meal.fat),
          quantity: parseFloat(meal.quantity),
          time: meal.meal_time,
          createdAt: meal.created_at
        }))
      });
    } catch (error) {
      console.error('Error in getTodayMeals:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async createMeal(req, res) {
    try {
      const { name, calories, protein, carbs, fat, quantity = 100 } = req.body;

      if (!name || calories === undefined) {
        return res.status(400).json({ error: 'Nombre y calorías son requeridos' });
      }

      if (calories < 0 || protein < 0 || carbs < 0 || fat < 0) {
        return res.status(400).json({ error: 'Los valores nutricionales no pueden ser negativos' });
      }

      const mealId = generateUUID();
      const mealTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

      await database.run(
        'INSERT INTO meals (id, user_id, name, calories, protein, carbs, fat, quantity, meal_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          mealId, 
          req.userId, 
          name, 
          parseInt(calories), 
          parseFloat(protein || 0), 
          parseFloat(carbs || 0), 
          parseFloat(fat || 0), 
          parseFloat(quantity),
          mealTime
        ]
      );

      // ✅ Llamar función sin 'this'
      await addToRecentFoods(req.userId, { 
        name, 
        calories: parseInt(calories), 
        protein: parseFloat(protein || 0), 
        carbs: parseFloat(carbs || 0), 
        fat: parseFloat(fat || 0)
      });

      res.status(201).json({
        message: 'Comida agregada exitosamente',
        meal: {
          id: mealId,
          name,
          calories: parseInt(calories),
          protein: parseFloat(protein || 0),
          carbs: parseFloat(carbs || 0),
          fat: parseFloat(fat || 0),
          quantity: parseFloat(quantity),
          time: mealTime
        }
      });
    } catch (error) {
      console.error('Error in createMeal:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async updateMeal(req, res) {
    try {
      const { id } = req.params;
      const { name, calories, protein, carbs, fat, quantity } = req.body;

      const existingMeal = await database.get(
        'SELECT id FROM meals WHERE id = ? AND user_id = ?',
        [id, req.userId]
      );

      if (!existingMeal) {
        return res.status(404).json({ error: 'Comida no encontrada' });
      }

      const updates = [];
      const params = [];

      if (name !== undefined) {
        updates.push('name = ?');
        params.push(name);
      }
      if (calories !== undefined) {
        updates.push('calories = ?');
        params.push(parseInt(calories));
      }
      if (protein !== undefined) {
        updates.push('protein = ?');
        params.push(parseFloat(protein));
      }
      if (carbs !== undefined) {
        updates.push('carbs = ?');
        params.push(parseFloat(carbs));
      }
      if (fat !== undefined) {
        updates.push('fat = ?');
        params.push(parseFloat(fat));
      }
      if (quantity !== undefined) {
        updates.push('quantity = ?');
        params.push(parseFloat(quantity));
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No hay campos para actualizar' });
      }

      params.push(id, req.userId);

      await database.run(
        `UPDATE meals SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
        params
      );

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
          protein: parseFloat(updatedMeal.protein),
          carbs: parseFloat(updatedMeal.carbs),
          fat: parseFloat(updatedMeal.fat),
          quantity: parseFloat(updatedMeal.quantity),
          time: updatedMeal.meal_time
        }
      });
    } catch (error) {
      console.error('Error in updateMeal:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async deleteMeal(req, res) {
    try {
      const { id } = req.params;

      const result = await database.run(
        'DELETE FROM meals WHERE id = ? AND user_id = ?',
        [id, req.userId]
      );

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Comida no encontrada' });
      }

      res.json({ message: 'Comida eliminada exitosamente' });
    } catch (error) {
      console.error('Error in deleteMeal:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

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
          totalCalories: parseInt(stats.totalCalories),
          totalProtein: Math.round(parseFloat(stats.totalProtein) * 10) / 10,
          totalCarbs: Math.round(parseFloat(stats.totalCarbs) * 10) / 10,
          totalFat: Math.round(parseFloat(stats.totalFat) * 10) / 10,
          mealCount: parseInt(stats.mealCount)
        },
        date: today
      });
    } catch (error) {
      console.error('Error in getNutritionStats:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

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
          protein: parseFloat(food.protein),
          carbs: parseFloat(food.carbs),
          fat: parseFloat(food.fat),
          lastUsed: food.last_used
        }))
      });
    } catch (error) {
      console.error('Error in getRecentFoods:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

module.exports = new MealsController();