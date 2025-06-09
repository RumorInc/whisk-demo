const Dish = require('../../schema/dishes-schema');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { orderItems } = req.body;
    console.log(orderItems)

    // Validate incoming order
    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ message: 'Invalid or empty orderItems array.' });
    }

    // 1. Fetch all dishes from the database.
    const allDishes = await Dish.find({}).lean();

    // 2. Create a Map for quick lookups using the dish ID as the key.
    // This is much more efficient than repeatedly searching the array.
    const dishMap = new Map(allDishes.map(dish => [dish._id.toString(), dish]));

    // 3. Initialize an object to hold the aggregated ingredient totals.
    const stockToTake = {};

    // 4. Loop through each item in the customer's order.
    for (const item of orderItems) {
      // Find the full dish details from our map.
      const fullDish = dishMap.get(item.id);

      if (fullDish && fullDish.ingredients) {
        // Loop through the ingredients of the matched dish.
        for (const ingredientName in fullDish.ingredients) {

          // Get the amount of the ingredient needed for ONE serving.
          const amountPerServing = fullDish.ingredients[ingredientName];

          // Calculate the total needed for the quantity ordered.
          const amountForOrder = amountPerServing * item.quantity;

          // Add it to our main stockToTake object.
          // If the ingredient is already in the list, add to it. Otherwise, initialize it.
          if (stockToTake[ingredientName]) {
            stockToTake[ingredientName] += amountForOrder;
          } else {
            stockToTake[ingredientName] = amountForOrder;
          }
        }
      }
    }

    console.log('Total stock to take for this order:', stockToTake);

    // 5. Send a success response with the calculated stock requirements.
    res.status(200).json({
      message: 'Order processed successfully.',
      stockToTake
    });

  } catch (error) {
    console.error('Error processing order:', error); // Log the actual error on the server
    res.status(500).json({ message: 'An internal server error occurred.', error: error.message });
  }
});

module.exports = router;