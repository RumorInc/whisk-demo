const express = require('express');
const mongoose = require('mongoose');
const Dish = require('../../schema/dishes-schema');
const Inventory = require('../../schema/inventory-schema');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { orderItems } = req.body;

    // 1. Validate order items
    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ message: 'Invalid or empty orderItems array.' });
    }

    // 2. Fetch all dishes & map them for fast access
    const allDishes = await Dish.find({}).lean();
    const dishMap = new Map(allDishes.map(dish => [dish._id.toString(), dish]));

    // 3. Calculate total ingredients required for the order
    const stockToTake = {};
    for (const item of orderItems) {
      const dish = dishMap.get(item.id);
      if (dish && dish.ingredients) {
        for (const [ingredientName, qtyPerServing] of Object.entries(dish.ingredients)) {
          const totalQty = qtyPerServing * item.quantity;
          stockToTake[ingredientName] = (stockToTake[ingredientName] || 0) + totalQty;
        }
      }
    }

    // 4. Check inventory for each required ingredient
    for (const [ingredientName, requiredQty] of Object.entries(stockToTake)) {
      const inventoryItem = await Inventory.findOne({ name: ingredientName });

      if (!inventoryItem) {
        return res.status(500).json({ message: `Ingredient not found in inventory: ${ingredientName}` });
      }

      if (inventoryItem.quantity < requiredQty) {
        const affectedDishIds = allDishes
          .filter(d => d.ingredients && d.ingredients[ingredientName])
          .map(d => d._id);

        await Dish.updateMany(
          { _id: { $in: affectedDishIds } },
          { available: false }
        );

        return res.status(400).json({
          message: `Insufficient stock for '${ingredientName}'. Affected dishes are now marked as sold out.`
        });
      }

      inventoryItem.quantity -= requiredQty;
      if (inventoryItem.quantity < 3) {
        inventoryItem.restock_disabled = false;
        inventoryItem.stock_level = 'alarm';
      } else if (inventoryItem.quantity < 6) {
        inventoryItem.restock_disabled = false;
        inventoryItem.stock_level = 'warn';
      }
      await inventoryItem.save();
    }

    return res.status(200).json({
      message: 'Order processed successfully.',
      usedStock: stockToTake
    });

  } catch (error) {
    console.error('Error processing order:', error);
    return res.status(500).json({
      message: 'An internal server error occurred.',
      error: error.message
    });
  }
});

module.exports = router;
