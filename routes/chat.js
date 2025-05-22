// routes/chat.js
const express = require('express');
const router = express.Router();
const Chats = require('../schema/chats-schema');
const Indexer = require('../utils/indexer');

// 2. Otherwise we only match either “create‑new” or a 24‑char hex ObjectId
router.get('/:id(create-new|[a-fA-F0-9]{24})', async (req, res, next) => {
  const { id } = req.params;
  try {
    if (id === 'create-new') {
      const newChat = await Chats.create({
        title: 'New Conversation',
        messages: []
      });
      return res.redirect(`/chat/${newChat._id}`);
    }

    const chat = await Chats.findById(id).lean();
    if (!chat) {
      const newChat = await Chats.create({
        title: 'New Conversation',
        messages: []
      });
      return res.redirect(`/chat/${newChat._id}`);
    }

    const [tabs, inventory] = await Promise.all([
      Indexer.loadNav(),
      Indexer.loadInventory()
    ]);
    return res.render('index', { chatId: chat._id, chat, tabs, inventory });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;