function appendMessage(text, who = 'assistant', streaming = false) {
  const container = document.querySelector('.chat-container');
  if (!container) {
    console.warn('No .chat-container found');
    return null;
  }
  const msg = document.createElement('div');
  msg.classList.add('message');
  if (who === 'user') msg.classList.add('sender');

  // assistant avatar
  if (who === 'assistant') {
    const avatar = document.createElement('img');
    avatar.classList.add('sender-icon');
    avatar.src = 'https://1000logos.net/wp-content/uploads/2025/01/DeepSeek-Emblem-768x432.png';
    avatar.alt = 'Bot';
    msg.appendChild(avatar);
  }

  // bubble & content
  const bubble = document.createElement('div');
  bubble.classList.add('message-bubble');
  const content = document.createElement('div');
  content.classList.add('message-content');

  // the <p> where text goes
  const p = document.createElement('p');
  if (!streaming) {
    p.innerHTML = marked.parse(text);
  } else {
    p.textContent = '';
    p.dataset.raw = '';
    // **inject loader** right beside the empty <p>
    const loader = document.createElement('div');
    loader.classList.add('loader');
    loader.dataset.loader = 'true';
    content.append(loader);
  }
  content.appendChild(p);
  bubble.appendChild(content);

  // assistant menu icons
  if (who === 'assistant') {
    const menu = document.createElement('div');
    menu.classList.add('icons-menu-list');
    ['sync', 'thumb_up', 'thumb_down', 'flag'].forEach(name => {
      const i = document.createElement('i');
      i.classList.add('material-symbols-outlined');
      i.textContent = name;
      menu.appendChild(i);
    });
    bubble.appendChild(menu);
  }

  msg.appendChild(bubble);
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;

  return who === 'assistant' && streaming ? p : null;
}