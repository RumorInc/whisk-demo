// routes/chat.js
const express = require('express');
const router = express.Router();
const Indexer = require('../utils/indexer');

router.get('/', async (req, res, next) => {
  return res.render('order');
});

module.exports = router;