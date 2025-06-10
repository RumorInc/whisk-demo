const express = require('express');
const Inventory = require('../../schema/inventory-schema');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    await Inventory.updateMany({}, {
      $set: {
        quantity: 10,
        stock_level: 'normal',
        restock_disabled: true,
      }
    });
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;
