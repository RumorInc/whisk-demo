/* sockets/handle.js */
const Chats = require('../schema/chats-schema');
const { generateResponseStream } = require('../ai/generate');

module.exports = function(io) {
  io.on('connection', socket => {
    console.log('a user connected');

    socket.on('join-chat', chatId => {
      socket.join(chatId);
      console.log(`user joined chat ${chatId}`);
    });

    socket.on('message', async msg => {
      try {
        const { text, chatId } = msg;
        const chat = await Chats.findByIdAndUpdate(
          chatId,
          { $push: { messages: { role: 'user', text } } },
          { new: true }
        );

        const savedUserMsg = chat.messages[chat.messages.length - 1];
        io.to(chatId).emit('new-message', savedUserMsg);

        // Add placeholder bot message
        const botMsg = { role: 'assistant', text: '' };
        io.to(chatId).emit('new-message', botMsg);
        // const botMsgId = updatedChatWithBot.messages[updatedChatWithBot.messages.length - 1]._id;
        let accumulated = '';

        await generateResponseStream(
          chatId,
          text,
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