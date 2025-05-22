// public/scripts/script.js

let socket;
const chatId = window.__CHAT_ID__;
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

if (chatId && objectIdRegex.test(chatId)) {
  let currentStreamP = null; 
  document.querySelector('.new-chat').style.display = 'none';
  document.querySelector('.input-area').style.visibility = 'visible';
  socket = io();
  socket.emit('join-chat', chatId);

  socket.on('new-message', msg => {
    if (msg.role === 'assistant' && msg.text === '') {
      // Start a new streaming paragraph
      currentStreamP = appendMessage('', 'assistant', true);
    } else {
      appendMessage(msg.text, msg.role, false);
    }
  });

  socket.on('new-message-chunk', ({ text }) => {
    if (!currentStreamP) return;
    currentStreamP.dataset.raw += text;
    currentStreamP.textContent += text;
  });

  socket.on('stream-done', () => {
    if (!currentStreamP) return;
    const raw = currentStreamP.dataset.raw;
    currentStreamP.innerHTML = marked.parse(raw);
    currentStreamP = null;
  });
}

// Send messages with chatId attached
document.getElementById('chat-field').addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    const text = e.target.value.trim();
    if (!text) return;
    socket.emit('message', { chatId, text });
    e.target.value = '';
  }
});