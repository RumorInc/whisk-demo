/* sockets/handle.js */
const Chats = require('../schema/chats-schema');
const Inventory = require('../schema/inventory-schema');
const Indexer = require('../utils/indexer');
const { generateResponseStream } = require('../ai/generate');

module.exports = function (io) {
  const changeStream = Inventory.watch();
  changeStream.on('change', async () => {
    try {
      const inv = await Indexer.loadInventory();
      io.emit('inv-change', inv);
    } catch (err) {
      console.error('Error handling inventory change:', err);
    }
  });
  io.on('connection', socket => {
    socket.on('join-chat', chatId => {
      socket.join(chatId);
    });

    socket.on('message', async msg => {
      try {
        const { text, chatId, optionMap } = msg;
        const chat = await Chats.findByIdAndUpdate(
          chatId,
          { $push: { messages: { role: 'user', text } } },
          { new: true }
        );
        const savedUserMsg = chat.messages[chat.messages.length - 1];
        io.to(chatId).emit('new-message', savedUserMsg);
        const botMsg = { role: 'assistant', text: '' };
        io.to(chatId).emit('new-message', botMsg);
        let accumulated = '';
        await generateResponseStream(
          chatId,
          text,
          optionMap,
          chunk => {
            accumulated += chunk;
            io.to(chatId).emit('new-message-chunk', { text: chunk });
          },
          async () => {
            await Chats.findByIdAndUpdate(
              chatId,
              { $push: { messages: { role: 'assistant', text: accumulated } } },
              { new: true }
            );
            io.to(chatId).emit('stream-done');
          }
        );
      } catch (err) {
        console.error('Error handling message:', err);
      }
    });
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });
};