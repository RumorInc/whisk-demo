const Dish = require('../../schema/dishes-schema');
const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { orderItems } = req.body;
    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ message: 'Invalid or empty orderItems array.' });
    }

    const allDishes = await Dish.find({}).lean();
    const dishMap = new Map(allDishes.map(dish => [dish._id.toString(), dish]));
    const stockToTake = {};

    for (const item of orderItems) {
      const fullDish = dishMap.get(item.id);
      if (fullDish && fullDish.ingredients) {
        for (const ingredientName in fullDish.ingredients) {
          const amountPerServing = fullDish.ingredients[ingredientName];
          const amountForOrder = amountPerServing * item.quantity;
          if (stockToTake[ingredientName]) {
            stockToTake[ingredientName] += amountForOrder;
          } else {
            stockToTake[ingredientName] = amountForOrder;
          }
        }
      }
    }

    res.status(200).json({
      message: 'Order processed successfully.',
      stockToTake
    });
  } catch (error) {
    console.error('Error processing order:', error);
    res.status(500).json({ message: 'An internal server error occurred.', error: error.message });
  }
});

module.exports = router;