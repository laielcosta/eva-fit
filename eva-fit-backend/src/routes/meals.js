const express = require('express');
const mealsController = require('../controllers/mealsController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas de comidas
router.get('/', mealsController.getAllMeals);
router.get('/today', mealsController.getTodayMeals);
router.post('/', mealsController.createMeal);
router.put('/:id', mealsController.updateMeal);
router.delete('/:id', mealsController.deleteMeal);

// Estadísticas
router.get('/stats', mealsController.getNutritionStats);

// Comidas recientes
router.get('/recent', mealsController.getRecentFoods);

module.exports = router;