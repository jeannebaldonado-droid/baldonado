// client.js — simple Socket.IO client for the UI
(function(){
  const usernameInput = document.getElementById('username');
  const connectBtn = document.getElementById('connectBtn');
  const statusEl = document.getElementById('status');
  const usersEl = document.getElementById('users');
  const messagesEl = document.getElementById('messages');
  const msgInput = document.getElementById('msgInput');
  const sendBtn = document.getElementById('sendBtn');
  let socket = null;

  function appendMessage({user, text, ts}){
    const el = document.createElement('div'); el.className='message';
    const meta = document.createElement('div'); meta.className='meta';
    meta.textContent = `${user} • ${new Date(ts).toLocaleTimeString()}`;
    const txt = document.createElement('div'); txt.className='text'; txt.textContent = text;
    el.appendChild(meta); el.appendChild(txt);
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function updateUsers(list){
    usersEl.innerHTML = '';
    list.forEach(u => {
      const div = document.createElement('div'); div.className='user';
      const dot = document.createElement('div'); dot.className='dot';
      const name = document.createElement('div'); name.textContent = u;
      div.appendChild(dot); div.appendChild(name);
      usersEl.appendChild(div);
    });
  }

  connectBtn.addEventListener('click', ()=>{
    if(socket && socket.connected){ socket.disconnect(); return; }
    const name = (usernameInput.value||'').trim() || 'Anonymous';
    statusEl.textContent = 'Connecting...';
    socket = io();
    socket.on('connect', ()=>{
      statusEl.textContent = 'Connected';
      connectBtn.textContent = 'Disconnect';
      msgInput.disabled = false; sendBtn.disabled = false;
      socket.emit('join', name);
    });
    socket.on('disconnect', ()=>{
      statusEl.textContent = 'Not connected';
      connectBtn.textContent = 'Connect';
      msgInput.disabled = true; sendBtn.disabled = true;
      updateUsers([]);
    });
    socket.on('users', updateUsers);
    socket.on('chat message', payload => appendMessage(payload));
  });

  sendBtn.addEventListener('click', ()=>{
    const text = (msgInput.value||'').trim();
    if(!text || !socket || !socket.connected) return;
    socket.emit('chat message', text);
    msgInput.value = '';
  });

  msgInput.addEventListener('keydown', e=>{ if(e.key==='Enter') sendBtn.click(); });
})();
