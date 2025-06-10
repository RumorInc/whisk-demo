const Dish = require('../../schema/dishes-schema');
const Inventory = require('../../schema/inventory-schema');
const express = require('express');
const mongoose = require('mongoose');
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
          stockToTake[ingredientName] = (stockToTake[ingredientName] || 0) + amountForOrder;
        }
      }
    }

    for (const [ingredientName, qtyToDeduct] of Object.entries(stockToTake)) {
      const inventoryItem = await Inventory.findOne({ name: ingredientName });
      if (!inventoryItem) {
        return res.status(500).json({ message: `Ingredient not found in inventory: ${ingredientName}` });
      }
      if (inventoryItem.quantity < 0.5) {
        return res.status(400).json({ message: `Stock too low for ${ingredientName}, please restock.` });
      }
      if (inventoryItem.quantity < qtyToDeduct) {
        return res.status(400).json({ message: `Sorry, not enough ${ingredientName} for this order.` });
      }
      inventoryItem.quantity -= qtyToDeduct;
      if (inventoryItem.quantity < 3) {
        inventoryItem.restock_disabled = false;
        inventoryItem.stock_level = 'alarm';
      } else if (inventoryItem.quantity < 6) {
        inventoryItem.restock_disabled = false;
        inventoryItem.stock_level = 'warn';
      }
      await inventoryItem.save();
    }    
    res.status(200).json({ message: 'Order processed successfully.', stockToTake });
  } catch (error) {
    console.error('Error processing order:', error);
    res.status(500).json({ message: 'An internal server error occurred.', error: error.message });
  }
});

module.exports = router;