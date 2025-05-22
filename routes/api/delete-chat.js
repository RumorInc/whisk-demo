const Chats = require('../../schema/chats-schema');
const express = require('express');
const router = express.Router();

router.delete('/:id', async (req, res) => {
  try {
    const result = await Chats.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.sendStatus(404);
    }
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;