const express = require('express');
const router = express.Router();
const Indexer = require('../utils/indexer');

router.get('/', async (req, res) => {
  try {
    const [tabs, inventory] = await Promise.all([
      Indexer.loadNav(),
      Indexer.loadInventory()
    ]);
    res.render('index', { chatId: null, tabs, chat: null , inventory});
  } catch (error) {
    console.error('Error loading data for index page:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
