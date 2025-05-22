/**
 * @param {string} text
 * @param {'user'|'assistant'} who
 * @param {boolean} streaming  // new flag: are we about to stream?
 * @returns {HTMLElement|null}  // returns the <p> node for assistant
 */
function appendMessage(text, who = 'assistant', streaming = false) {
    const container = document.querySelector('.chat-container');
    if (!container) {
      console.warn('No .chat-container found');
      return null;
    }
    const msg = document.createElement('div');
    msg.classList.add('message');
    if (who === 'user') msg.classList.add('sender');
  
    // avatar for assistant
    if (who === 'assistant') {
      const avatar = document.createElement('img');
      avatar.classList.add('sender-icon');
      avatar.src = 'https://1000logos.net/wp-content/uploads/2025/01/DeepSeek-Emblem-768x432.png';
      avatar.alt = 'Bot';
      msg.appendChild(avatar);
    }
  
    // message bubble and content wrapper
    const bubble = document.createElement('div');
    bubble.classList.add('message-bubble');
    const content = document.createElement('div');
    content.classList.add('message-content');
  
    // create a <p> with either the full parsed HTML (non-streaming)
    // or an empty <p> for streaming
    const p = document.createElement('p');
    if (!streaming) {
      p.innerHTML = marked.parse(text);
    } else {
      p.textContent = '';      // start blank, will fill via .textContent
      p.dataset.raw = '';      // store raw markdown if we want to re-render later
    }
    content.appendChild(p);
    bubble.appendChild(content);
    if (who === 'assistant') {
      const menu = document.createElement('div');
      menu.classList.add('icons-menu-list');
      ['sync','thumb_up','thumb_down','flag'].forEach(name => {
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
  