// routes/chat.js
const express = require('express');
const router = express.Router();
const Indexer = require('../utils/indexer');

router.get('/', async (req, res, next) => {
  const dishes = await Indexer.loadDishes();
  return res.render('order', { dishes });
});

module.exports = router;