const socket = io();

// ---------- Ikon SVG (pengganti emoji dasar biar tampilan lebih rapi & konsisten) ----------
const ICONS = {
  play: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>',
  volumeHigh: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 9 3 15 8 15 13 20 13 4 8 9 3 9" fill="currentColor" stroke="none"/><path d="M16 8a5 5 0 0 1 0 8"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>',
  volumeLow: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 9 3 15 8 15 13 20 13 4 8 9 3 9" fill="currentColor" stroke="none"/><path d="M16 8a5 5 0 0 1 0 8"/></svg>',
  volumeMute: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 9 3 15 8 15 13 20 13 4 8 9 3 9" fill="currentColor" stroke="none"/><line x1="16" y1="9" x2="22" y2="15"/><line x1="22" y1="9" x2="16" y2="15"/></svg>',
  settings: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15 1.65 1.65 0 0 0 3.17 14H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.14.32.4.6.73.73.24.1.5.16.77.16H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  fullscreenEnter: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>',
  fullscreenExit: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/></svg>',
  mic: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>',
  micOff: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2"/><path d="M19 10v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>',
  copy: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  link: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>',
  attach: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>',
  send: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
  close: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  chat: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
};
// Terapkan ikon SVG ke tombol-tombol statis (yang gak toggle) begitu halaman siap
document.addEventListener('DOMContentLoaded', () => {
  const map = {
    'btn-copy-code': ICONS.copy,
    'btn-settings': ICONS.settings,
    'btn-attach-media': ICONS.attach,
    'btn-close-chat-mobile': ICONS.close,
    'btn-cancel-attach': ICONS.close,
    'btn-close-modal': ICONS.close,
  };
  Object.entries(map).forEach(([id, svg]) => {
    const node = document.getElementById(id);
    if (node) node.innerHTML = svg + (node.dataset.label ? ` <span>${node.dataset.label}</span>` : '');
  });
  const copyLinkBtn = document.getElementById('btn-copy-link');
  if (copyLinkBtn) copyLinkBtn.innerHTML = `${ICONS.link} Salin Link`;
  const changeSourceBtn = document.getElementById('btn-change-source');
  if (changeSourceBtn) changeSourceBtn.innerHTML = `${ICONS.refresh} Ganti Sumber Video`;
  const sendBtn = document.querySelector('#chat-form button[type="submit"]');
  if (sendBtn) sendBtn.innerHTML = `${ICONS.send} Kirim`;
  const mobileChatBar = document.getElementById('btn-toggle-chat-mobile');
  if (mobileChatBar) mobileChatBar.innerHTML = `${ICONS.chat} <span>Buka Chat</span>`;
  const chatSheetTitle = document.getElementById('chat-sheet-title-text');
  if (chatSheetTitle) chatSheetTitle.innerHTML = `${ICONS.chat} Chat`;
  const playBtn = document.getElementById('btn-playpause');
  if (playBtn) playBtn.innerHTML = ICONS.play;
  const muteBtn = document.getElementById('btn-mute');
  if (muteBtn) muteBtn.innerHTML = ICONS.volumeHigh;
  const fsBtn = document.getElementById('btn-fullscreen');
  if (fsBtn) fsBtn.innerHTML = ICONS.fullscreenEnter;
  const micBtn = document.getElementById('btn-join-voice');
  if (micBtn && !micBtn.classList.contains('mic-active')) micBtn.innerHTML = `${ICONS.mic} <span>Aktifkan Mikrofon</span>`;
});

const urlParams = new URLSearchParams(window.location.search);
const mode = urlParams.get('mode'); // 'create' | 'join' | null
let roomId = (urlParams.get('room') || '').toUpperCase();
const inviteTokenFromUrl = urlParams.get('invite');
const myName = sessionStorage.getItem('pw_name') || 'Guest';
const pendingRoomName = sessionStorage.getItem('pw_roomName') || '';

let isMaster = false;
let currentInviteToken = null; // token acak untuk link undangan (beda dari kode room)
let ytPlayer = null;
let ytReady = false;
let currentSourceType = null; // 'youtube' | 'direct' | 'file' | 'drive' | 'website'
let suppressEvents = false; // hindari loop saat set posisi programatis

const el = {
  roomName: document.getElementById('room-name'),
  roomCode: document.getElementById('room-code-text'),
  userList: document.getElementById('user-list'),
  chatMessages: document.getElementById('chat-messages'),
  chatForm: document.getElementById('chat-form'),
  chatInput: document.getElementById('chat-input'),
  playerContainer: document.getElementById('player-container'),
  noVideoPlaceholder: document.getElementById('no-video-placeholder'),
  html5Player: document.getElementById('html5-player'),
  btnOpenSourceModal: document.getElementById('btn-open-source-modal'),
  btnChangeSource: document.getElementById('btn-change-source'),
  masterBadge: document.getElementById('master-badge'),
  viewerNote: document.getElementById('viewer-note'),
  viewerBlockOverlay: document.getElementById('viewer-block-overlay'),
  playerOverlay: document.getElementById('player-overlay'),
  seekBar: document.getElementById('seek-bar'),
  btnPlayPause: document.getElementById('btn-playpause'),
  pcTime: document.getElementById('pc-time'),
  btnMute: document.getElementById('btn-mute'),
  volumeBar: document.getElementById('volume-bar'),
  btnSettings: document.getElementById('btn-settings'),
  settingsMenu: document.getElementById('settings-menu'),
  settingsSubtitleList: document.getElementById('settings-subtitle-list'),
  settingsQualityList: document.getElementById('settings-quality-list'),
  dtLeft: document.getElementById('dt-left'),
  dtRight: document.getElementById('dt-right'),
  seekFlashLeft: document.getElementById('seek-flash-left'),
  seekFlashRight: document.getElementById('seek-flash-right'),
  masterToast: document.getElementById('master-toast'),
  sourceModal: document.getElementById('source-modal'),
  btnCloseModal: document.getElementById('btn-close-modal'),
  queueBar: document.getElementById('queue-bar'),
  queueItems: document.getElementById('queue-items'),
  btnFullscreen: document.getElementById('btn-fullscreen'),
  chatBubbleLayer: document.getElementById('chat-bubble-layer'),
  btnCenterPlay: document.getElementById('btn-center-play'),
  reactionFloatLayer: document.getElementById('reaction-float-layer'),
  btnJoinVoice: document.getElementById('btn-join-voice'),
  voiceAudioContainer: document.getElementById('voice-audio-container'),
  btnToggleChatMobile: document.getElementById('btn-toggle-chat-mobile'),
  btnCloseChatMobile: document.getElementById('btn-close-chat-mobile'),
  chatBackdrop: document.getElementById('chat-backdrop'),
  chatArea: document.getElementById('chat-area'),
};

// ---------- Mobile chat bottom-sheet (gaya Rave: chat disembunyikan, muncul saat di-tap) ----------
function openMobileChat() {
  document.body.classList.add('chat-sheet-open');
}
function closeMobileChat() {
  document.body.classList.remove('chat-sheet-open');
}
if (el.btnToggleChatMobile) el.btnToggleChatMobile.addEventListener('click', openMobileChat);
if (el.btnCloseChatMobile) el.btnCloseChatMobile.addEventListener('click', closeMobileChat);
if (el.chatBackdrop) el.chatBackdrop.addEventListener('click', closeMobileChat);
// Kirim pesan otomatis nutup sheet-nya biar user langsung lihat video lagi (opsional, terasa lebih natural)
if (el.chatInput) {
  el.chatInput.addEventListener('focus', () => { if (window.innerWidth <= 600) openMobileChat(); });
}

if (mode !== 'create' && !roomId && !inviteTokenFromUrl) {
  alert('Kode room / link tidak valid.');
  window.location.href = '/';
}

function afterEnterRoom(res) {
  isMaster = res.isMaster;
  currentInviteToken = res.state.inviteToken;
  el.roomCode.textContent = roomId;
  el.roomName.textContent = res.state.roomName;
  updateUserList(res.state.users);
  applyMasterUI();
  renderQueue(res.state.queue || []);
  // Voice chat sekarang bebas dipakai siapa saja tanpa perlu diaktifkan Room Master dulu.

  // Selalu tampilkan token undangan di address bar, JANGAN kode room asli —
  // supaya kode room tidak ter-expose lewat URL sekalipun (bukan cuma link yang disalin).
  if (currentInviteToken) {
    window.history.replaceState({}, '', `/room.html?invite=${currentInviteToken}`);
  }

  if (res.state.videoSource) {
    loadSource(res.state.videoSource, false);
    // sesuaikan posisi playback saat join
    setTimeout(() => applyPlaybackState(res.state.playback), 800);
  } else if (mode === 'create') {
    // Room baru dibuat & belum ada video -> langsung buka pemilihan sumber video
    toggleModal(true);
  }
}

function doJoinRoom(targetRoomId) {
  socket.emit('join-room', { roomId: targetRoomId, name: myName }, (res) => {
    if (!res.success) {
      alert(res.message || 'Gagal bergabung ke room.');
      window.location.href = '/';
      return;
    }
    roomId = targetRoomId;
    afterEnterRoom(res);
  });
}

// ---------- Buat room, gabung via kode, ATAU gabung via link undangan ----------
if (mode === 'create') {
  socket.emit('create-room', { name: myName, roomName: pendingRoomName }, (createRes) => {
    if (!createRes.success) {
      alert('Gagal membuat room.');
      window.location.href = '/';
      return;
    }
    roomId = createRes.roomId;
    doJoinRoom(roomId);
  });
} else if (inviteTokenFromUrl) {
  // Link undangan tidak memuat kode room secara langsung, jadi kita perlu
  // menerjemahkannya dulu ke roomId lewat server.
  fetch(`/api/resolve-invite/${inviteTokenFromUrl}`)
    .then((r) => r.json())
    .then((data) => {
      if (!data.roomId) {
        alert(data.error || 'Link undangan tidak valid.');
        window.location.href = '/';
        return;
      }
      doJoinRoom(data.roomId);
    })
    .catch(() => {
      alert('Gagal memuat link undangan.');
      window.location.href = '/';
    });
} else {
  doJoinRoom(roomId);
}

function applyMasterUI() {
  document.querySelectorAll('.master-only').forEach(elm => {
    elm.style.display = isMaster ? 'inline-block' : 'none';
  });
  el.masterBadge.style.display = isMaster ? 'inline-block' : 'none';
  el.viewerNote.style.display = isMaster ? 'none' : 'inline-block';

  // Play/pause & seek bar hanya bisa dipakai Room Master; viewer cuma lihat progresnya.
  el.btnPlayPause.disabled = !isMaster;
  el.seekBar.classList.toggle('viewer-readonly', !isMaster);
  el.seekBar.disabled = false; // tetap bisa di-drag secara visual dicegah lewat pointer-events (viewer-readonly)

  updateViewerBlockOverlay();
}

// Viewer tidak boleh bisa klik langsung ke area video (mencegah toggle play/pause
// lewat klik di badan video/iframe YouTube/HTML5, karena tetap merespons klik
// langsung meskipun native controls disembunyikan). Berlaku untuk semua sumber,
// termasuk Google Drive, karena sekarang Drive juga diputar sebagai <video> biasa
// lewat proxy server (full sync), bukan iframe preview lagi.
function updateViewerBlockOverlay() {
  el.viewerBlockOverlay.style.display = isMaster ? 'none' : 'block';
}

// Kalau viewer coba double-tap/double-click area video, kasih tahu kalau itu hak Room Master
el.viewerBlockOverlay.addEventListener('dblclick', () => {
  showMasterToast('Hanya Room Master yang bisa maju/mundur video.');
});

function updateUserList(users) {
  el.userList.innerHTML = users.map(u => `<span class="user-chip">${escapeHtml(u.name)}</span>`).join('');
}

socket.on('user-list', updateUserList);

socket.on('user-joined', ({ name }) => addSystemMessage(`${name} bergabung ke room.`));
socket.on('user-left', ({ name }) => addSystemMessage(`${name} meninggalkan room.`));
socket.on('master-changed', ({ newMasterName }) => {
  addSystemMessage(`${newMasterName} sekarang menjadi Room Master.`);
  // Re-check status master untuk diri sendiri
  if (newMasterName === myName) {
    isMaster = true;
    applyMasterUI();
    renderQueue(currentQueue); // tombol kontrol antrian baru muncul setelah jadi master
  }
});

// ---------- Antrian video ----------
let currentQueue = [];

function renderQueue(queue) {
  currentQueue = queue || [];
  el.queueBar.style.display = currentQueue.length ? 'flex' : 'none';
  el.queueItems.innerHTML = currentQueue
    .map((item, idx) => `
      <div class="queue-chip">
        <span>${idx + 1}. ${escapeHtml(item.title || item.type)}</span>
        ${isMaster ? `
          <button type="button" data-action="play" data-idx="${idx}" title="Putar sekarang">▶</button>
          <button type="button" data-action="remove" data-idx="${idx}" title="Hapus dari antrian">✕</button>
        ` : ''}
      </div>
    `)
    .join('');

  if (isMaster) {
    el.queueItems.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx, 10);
        if (btn.dataset.action === 'remove') {
          socket.emit('queue-remove', { roomId, index: idx });
        } else if (btn.dataset.action === 'play') {
          socket.emit('queue-play-now', { roomId, index: idx });
        }
      });
    });
  }
}

socket.on('queue-updated', renderQueue);

// ---------- Copy code / link ----------
document.getElementById('btn-copy-code').addEventListener('click', () => {
  navigator.clipboard.writeText(roomId);
});
document.getElementById('btn-copy-link').addEventListener('click', () => {
  if (!currentInviteToken) {
    alert('Link undangan belum siap, coba beberapa saat lagi.');
    return;
  }
  const link = `${window.location.origin}/room.html?invite=${currentInviteToken}`;
  navigator.clipboard.writeText(link);
  alert('Link undangan disalin: ' + link);
});

// ---------- Chat ----------
let pendingAttachment = null; // { file, type }
const chatAttachInput = document.getElementById('chat-media-input');
const chatAttachPreview = document.getElementById('chat-attach-preview');
const chatAttachName = document.getElementById('chat-attach-name');

document.getElementById('btn-attach-media').addEventListener('click', () => chatAttachInput.click());

chatAttachInput.addEventListener('change', () => {
  const file = chatAttachInput.files[0];
  if (!file) return;
  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');
  if (!isImage && !isVideo) {
    alert('Hanya file gambar atau video yang diperbolehkan.');
    chatAttachInput.value = '';
    return;
  }
  pendingAttachment = { file, type: isImage ? 'image' : 'video' };
  chatAttachName.textContent = `📎 ${file.name}`;
  chatAttachPreview.style.display = 'flex';
});

document.getElementById('btn-cancel-attach').addEventListener('click', () => {
  pendingAttachment = null;
  chatAttachInput.value = '';
  chatAttachPreview.style.display = 'none';
});

el.chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = el.chatInput.value.trim();

  if (!pendingAttachment) {
    if (!message) return;
    socket.emit('chat-message', { roomId, message });
    el.chatInput.value = '';
    return;
  }

  // Ada lampiran: upload dulu ke server, baru kirim pesan besertanya
  const formData = new FormData();
  formData.append('media', pendingAttachment.file);
  chatAttachName.textContent = 'Mengupload...';

  try {
    const res = await fetch('/api/chat-upload', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.error) {
      alert(data.error);
    } else {
      socket.emit('chat-message', {
        roomId,
        message,
        attachment: { url: data.url, type: data.type }
      });
      el.chatInput.value = '';
    }
  } catch (err) {
    alert('Gagal mengupload lampiran.');
  }

  pendingAttachment = null;
  chatAttachInput.value = '';
  chatAttachPreview.style.display = 'none';
});

socket.on('chat-message', ({ name, message, isMaster: senderIsMaster, attachment }) => {
  const div = document.createElement('div');
  div.className = 'chat-msg';
  let html = `<span class="name${senderIsMaster ? ' master' : ''}">${escapeHtml(name)}:</span>`;
  if (message) html += ` ${escapeHtml(message)}`;
  if (attachment) {
    if (attachment.type === 'image') {
      html += `<div class="attachment"><img src="${attachment.url}" alt="lampiran" onclick="window.open('${attachment.url}', '_blank')" /></div>`;
    } else if (attachment.type === 'video') {
      html += `<div class="attachment"><video src="${attachment.url}" controls></video></div>`;
    }
  }
  div.innerHTML = html;
  el.chatMessages.appendChild(div);
  el.chatMessages.scrollTop = el.chatMessages.scrollHeight;

  // Tampilkan juga sebagai bubble notifikasi pojok layar saat lagi fullscreen
  const preview = message || (attachment ? (attachment.type === 'image' ? '[Foto]' : '[Video]') : '');
  showChatBubble(name, preview);
});

function addSystemMessage(text) {
  const div = document.createElement('div');
  div.className = 'chat-msg system';
  div.textContent = text;
  el.chatMessages.appendChild(div);
  el.chatMessages.scrollTop = el.chatMessages.scrollHeight;
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

// ---------- Modal sumber video ----------
el.btnOpenSourceModal.addEventListener('click', () => toggleModal(true));
el.btnChangeSource.addEventListener('click', () => toggleModal(true));
el.btnCloseModal.addEventListener('click', () => toggleModal(false));

function toggleModal(show) {
  el.sourceModal.style.display = show ? 'flex' : 'none';
  // Tab "YouTube" aktif secara default, jadi begitu modal pertama kali dibuka
  // langsung tampilkan video populer (efek "buka web YouTube").
  if (show && !ytBrowseLoadedOnce) {
    ytBrowseLoadedOnce = true;
    loadYoutubePopular();
  }
}

document.querySelectorAll('.source-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.source-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.source-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.querySelector(`.source-panel[data-panel="${btn.dataset.source}"]`).classList.add('active');
  });
});

// ----- YouTube: browsing & pencarian (seperti buka web YouTube langsung) -----
const ytStatusEl = document.getElementById('youtube-status');
const ytGridEl = document.getElementById('youtube-results-grid');
let ytBrowseLoadedOnce = false;

function renderYoutubeResults(items) {
  if (!items || items.length === 0) {
    ytGridEl.innerHTML = '';
    ytStatusEl.style.color = '#999';
    ytStatusEl.textContent = 'Tidak ada hasil ditemukan.';
    return;
  }
  ytStatusEl.textContent = '';
  ytGridEl.innerHTML = items.map(item => `
    <div class="yt-result-card" data-video-id="${item.videoId}" data-title="${escapeHtml(item.title)}">
      <img src="${item.thumbnail}" alt="${escapeHtml(item.title)}" loading="lazy" />
      <div class="yt-result-info">
        <p class="yt-result-title">${escapeHtml(item.title)}</p>
        <p class="yt-result-channel">${escapeHtml(item.channelTitle)}</p>
      </div>
    </div>
  `).join('');

  ytGridEl.querySelectorAll('.yt-result-card').forEach(card => {
    card.addEventListener('click', () => {
      socket.emit('set-video-source', {
        roomId,
        source: { type: 'youtube', videoId: card.dataset.videoId, title: card.dataset.title }
      });
      toggleModal(false);
    });
  });
}

async function loadYoutubePopular() {
  ytStatusEl.style.color = '#999';
  ytStatusEl.textContent = 'Memuat video populer...';
  try {
    const res = await fetch('/api/youtube/popular');
    const data = await res.json();
    if (data.error) {
      ytStatusEl.style.color = '#ff6b6b';
      ytStatusEl.textContent = data.error;
      return;
    }
    renderYoutubeResults(data.items);
  } catch (e) {
    ytStatusEl.style.color = '#ff6b6b';
    ytStatusEl.textContent = 'Gagal memuat video populer.';
  }
}

async function searchYoutube(query) {
  ytStatusEl.style.color = '#999';
  ytStatusEl.textContent = 'Mencari...';
  try {
    const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    if (data.error) {
      ytStatusEl.style.color = '#ff6b6b';
      ytStatusEl.textContent = data.error;
      return;
    }
    renderYoutubeResults(data.items);
  } catch (e) {
    ytStatusEl.style.color = '#ff6b6b';
    ytStatusEl.textContent = 'Gagal mencari video.';
  }
}

document.getElementById('youtube-search-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const q = document.getElementById('youtube-search-input').value.trim();
  if (!q) return;
  searchYoutube(q);
});

// Saat tab "YouTube" pertama kali dibuka, langsung tampilkan video populer (efek "buka web YouTube")
document.querySelector('.source-tab-btn[data-source="youtube"]').addEventListener('click', () => {
  if (!ytBrowseLoadedOnce) {
    ytBrowseLoadedOnce = true;
    loadYoutubePopular();
  }
});

// ----- Google Drive -----
let pickerInited = false;
let gisInited = false;
let accessToken = null;

function maybeEnableDrivePicker() {
  const hasConfig = DRIVE_CONFIG.CLIENT_ID && DRIVE_CONFIG.API_KEY;
  document.getElementById('drive-config-warning').style.display = hasConfig ? 'none' : 'block';
  document.getElementById('btn-drive-login').disabled = !hasConfig;
}
maybeEnableDrivePicker();

document.getElementById('btn-drive-login').addEventListener('click', () => {
  if (!DRIVE_CONFIG.CLIENT_ID) return;
  loadGoogleScripts(() => {
    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: DRIVE_CONFIG.CLIENT_ID,
      // drive.file: memberi akses baca/tulis (termasuk ubah izin share) khusus
      // untuk file yang dipilih lewat Picker ini saja — bukan seluruh Drive user.
      scope: 'https://www.googleapis.com/auth/drive.file',
      callback: (resp) => {
        accessToken = resp.access_token;
        createDrivePicker();
      }
    });
    tokenClient.requestAccessToken();
  });
});

function loadGoogleScripts(cb) {
  if (window.google && window.google.accounts && window.google.picker) return cb();
  const s1 = document.createElement('script');
  s1.src = 'https://accounts.google.com/gsi/client';
  s1.onload = () => {
    const s2 = document.createElement('script');
    s2.src = 'https://apis.google.com/js/api.js';
    s2.onload = () => gapi.load('picker', cb);
    document.body.appendChild(s2);
  };
  document.body.appendChild(s1);
}

function createDrivePicker() {
  const view = new google.picker.View(google.picker.ViewId.DOCS_VIDEOS);
  const picker = new google.picker.PickerBuilder()
    .addView(view)
    .setOAuthToken(accessToken)
    .setDeveloperKey(DRIVE_CONFIG.API_KEY)
    .setCallback(pickerCallback)
    .build();
  picker.setVisible(true);
}

function pickerCallback(data) {
  if (data.action === google.picker.Action.PICKED) {
    const file = data.docs[0];
    const statusEl = document.getElementById('drive-config-warning');
    statusEl.style.display = 'block';
    statusEl.style.color = '#999';
    statusEl.textContent = 'Menyiapkan akses untuk semua peserta...';

    attemptDriveAutoShare(file.id, accessToken).then((shared) => {
      if (shared) {
        statusEl.style.display = 'none';
      } else {
        statusEl.style.color = '#ffb84d';
        statusEl.textContent = '⚠️ Gagal membagikan file secara otomatis. Silakan buka file ini di Google Drive dan ubah akses share menjadi "Anyone with the link", agar peserta lain juga bisa menontonnya.';
      }
      socket.emit('set-video-source', {
        roomId,
        source: { type: 'drive', fileId: file.id, title: file.name }
      });
      toggleModal(false);
    });
  }
}

// Coba ubah izin file yang dipilih menjadi "siapa saja dengan link bisa melihat",
// supaya viewer lain tidak melihat layar kosong akibat file masih privat.
async function attemptDriveAutoShare(fileId, token) {
  try {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ role: 'reader', type: 'anyone' })
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

// ----- Website lain (auto-detect) -----
document.getElementById('btn-detect-website').addEventListener('click', async () => {
  const url = document.getElementById('website-url-input').value.trim();
  const statusEl = document.getElementById('website-detect-status');
  if (!url) return;
  statusEl.style.color = '#999';
  statusEl.textContent = 'Mendeteksi video...';
  try {
    const res = await fetch('/api/extract-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    const data = await res.json();
    if (data.found) {
      socket.emit('set-video-source', {
        roomId,
        source: { type: 'direct', url: data.videoUrl, title: data.title || url }
      });
      toggleModal(false);
    } else {
      statusEl.style.color = '#ff6b6b';
      statusEl.textContent = data.message;
    }
  } catch (e) {
    statusEl.style.color = '#ff6b6b';
    statusEl.textContent = 'Terjadi kesalahan saat mendeteksi video.';
  }
});

// ----- File lokal -----
let ffmpegCheckDone = false;
const ffmpegStatusHint = document.getElementById('ffmpeg-status-hint');

async function checkFfmpegOnce() {
  if (ffmpegCheckDone) return;
  ffmpegCheckDone = true;
  try {
    const res = await fetch('/api/check-ffmpeg');
    const data = await res.json();
    if (!data.available) {
      ffmpegStatusHint.style.display = 'block';
      ffmpegStatusHint.textContent = '⚠️ ffmpeg belum terpasang di server, subtitle otomatis dari file (mkv, dll) tidak akan berfungsi. Lihat README bagian "Subtitle Otomatis".';
    }
  } catch (e) {
    // Abaikan, tidak kritikal
  }
}

document.querySelector('.source-tab-btn[data-source="file"]').addEventListener('click', checkFfmpegOnce);

document.getElementById('btn-upload-file').addEventListener('click', async () => {
  const fileInput = document.getElementById('file-input');
  const file = fileInput.files[0];
  if (!file) return alert('Pilih file terlebih dahulu.');

  const subtitleFileInput = document.getElementById('subtitle-file-input');
  const manualSubtitleFile = subtitleFileInput.files[0] || null;

  const progressWrapper = document.getElementById('upload-progress-wrapper');
  const progressBar = document.getElementById('upload-progress-bar');
  const btnUpload = document.getElementById('btn-upload-file');
  const btnUploadDefaultHTML = btnUpload.innerHTML; // simpan HTML asli (ikon+teks) biar bisa dikembalikan lagi
  progressWrapper.style.display = 'block';

  const formData = new FormData();
  formData.append('video', file);

  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/api/upload');
  xhr.upload.onprogress = (e) => {
    if (e.lengthComputable) {
      const pct = (e.loaded / e.total) * 100;
      progressBar.style.width = `${pct}%`;
      // Setelah upload 100%, server mungkin masih memproses (deteksi subtitle mkv, dll)
      if (pct >= 100) btnUpload.innerHTML = '⏳ Memproses video...';
    }
  };
  xhr.onload = async () => {
    if (xhr.status !== 200) {
      btnUpload.innerHTML = btnUploadDefaultHTML;
      alert('Upload gagal.');
      return;
    }
    const data = JSON.parse(xhr.responseText);
    let subtitles = data.subtitles || [];

    // Kalau user juga upload file subtitle manual, upload & gabungkan ke daftar subtitle
    if (manualSubtitleFile) {
      btnUpload.innerHTML = '⏳ Memproses subtitle...';
      try {
        const subForm = new FormData();
        subForm.append('subtitle', manualSubtitleFile);
        const subRes = await fetch('/api/upload-subtitle', { method: 'POST', body: subForm });
        const subData = await subRes.json();
        if (subData.error) {
          addSystemMessage(`⚠️ Gagal memproses subtitle manual: ${subData.error}`);
        } else {
          subtitles = [...subtitles, { url: subData.url, lang: 'und', label: subData.label }];
        }
      } catch (e) {
        addSystemMessage('⚠️ Gagal mengupload subtitle manual.');
      }
    }

    btnUpload.innerHTML = btnUploadDefaultHTML;
    socket.emit('set-video-source', {
      roomId,
      source: { type: 'file', url: data.url, title: data.title, subtitles }
    });
    toggleModal(false);
    progressWrapper.style.display = 'none';
    progressBar.style.width = '0%';
    fileInput.value = '';
    subtitleFileInput.value = '';

    if (data.ffmpegAvailable === false && !manualSubtitleFile) {
      addSystemMessage('⚠️ ffmpeg belum terpasang di server, subtitle otomatis tidak aktif untuk video ini. Kamu bisa upload file subtitle (.srt/.vtt) secara manual lain kali.');
    } else if (data.streamsFound === 0 && subtitles.length === 0) {
      addSystemMessage('Video ini tidak memiliki track subtitle tertanam yang bisa dideteksi.');
    } else if (subtitles.length > 0) {
      addSystemMessage(`Ditemukan/terpasang ${subtitles.length} track subtitle, pilih lewat menu subtitle di bawah video.`);
    }
  };
  xhr.send(formData);
});

// ---------- Video source loading ----------
socket.on('video-source-changed', (source) => loadSource(source, true));

function loadSource(source, announce) {
  currentSourceType = source.type;
  el.noVideoPlaceholder.style.display = 'none';
  updateViewerBlockOverlay();
  activeQuality = 'auto';

  document.getElementById('youtube-player').style.display = 'none';
  el.html5Player.style.display = 'none';
  el.html5Player.pause();

  if (source.type === 'youtube') {
    clearSubtitleTracks();
    document.getElementById('youtube-player').style.display = 'block';
    if (ytPlayer) {
      try { ytPlayer.destroy(); } catch (e) {}
      ytPlayer = null;
      ytReady = false;
    }
    if (window.YT && window.YT.Player) {
      initYoutubePlayer(source.videoId);
    } else {
      window.onYouTubeIframeAPIReady = () => initYoutubePlayer(source.videoId);
    }
  } else {
    // 'direct' (website lain), 'file' (upload lokal), atau 'drive' (di-proxy server
    // sebagai <video> biasa) — semuanya diputar & disinkron dengan cara yang sama.
    if (ytPlayer) { try { ytPlayer.destroy(); } catch (e) {} ytPlayer = null; ytReady = false; }
    el.html5Player.style.display = 'block';

    let videoUrl = source.url;
    if (source.type === 'drive') {
      videoUrl = `/api/drive-stream/${source.fileId}`;
    }
    el.html5Player.src = videoUrl;
    bindHtml5Events();
    applySubtitles(source.subtitles);
  }

  renderQualitySettingsList();
  updatePlayPauseIcon(false);

  if (announce) addSystemMessage(`Video diganti: ${source.title || source.type}`);
}

// ---------- Subtitle (khusus file upload MKV/dll yang punya track subtitle) ----------
function clearSubtitleTracks() {
  Array.from(el.html5Player.querySelectorAll('track')).forEach((t) => t.remove());
  renderSubtitleSettingsList(null);
}

function applySubtitles(subtitles) {
  clearSubtitleTracks();

  if (!subtitles || subtitles.length === 0) {
    renderSubtitleSettingsList([]);
    return;
  }

  subtitles.forEach((sub) => {
    const track = document.createElement('track');
    track.kind = 'subtitles';
    track.label = sub.label;
    track.srclang = sub.lang || 'und';
    track.src = sub.url;
    el.html5Player.appendChild(track);
  });

  renderSubtitleSettingsList(subtitles);
}

// Render pilihan subtitle di dalam menu ⚙️ Pengaturan (di bagian bawah video player).
// Ini setting lokal per-orang, jadi setiap peserta bebas pilih/matikan subtitle sendiri.
let activeSubtitleIdx = -1;
function renderSubtitleSettingsList(subtitles) {
  activeSubtitleIdx = -1;
  if (subtitles === null) {
    el.settingsSubtitleList.innerHTML = '<div class="settings-option-empty">Tidak ada video aktif</div>';
    return;
  }
  if (subtitles.length === 0) {
    el.settingsSubtitleList.innerHTML = '<div class="settings-option-empty">Subtitle tidak tersedia untuk video ini</div>';
    return;
  }
  const options = [{ label: 'Nonaktif', idx: -1 }, ...subtitles.map((s, idx) => ({ label: s.label, idx }))];
  renderSettingsOptions(el.settingsSubtitleList, options, activeSubtitleIdx, (idx) => {
    activeSubtitleIdx = idx;
    Array.from(el.html5Player.textTracks).forEach((tt, i) => { tt.mode = i === idx ? 'showing' : 'disabled'; });
    renderSubtitleSettingsList(subtitles);
  });
}

// Helper generik untuk render daftar opsi radio-style di dalam menu pengaturan.
// `onPick` menerima value ASLI dari option.idx (bisa berupa number index subtitle
// ataupun string kode kualitas YouTube seperti 'hd720').
function renderSettingsOptions(container, options, activeIdx, onPick) {
  container.innerHTML = options.map((opt, i) =>
    `<button type="button" class="settings-option${opt.idx === activeIdx ? ' active' : ''}" data-i="${i}">${escapeHtml(opt.label)}</button>`
  ).join('');
  container.querySelectorAll('.settings-option').forEach((btn) => {
    btn.addEventListener('click', () => onPick(options[parseInt(btn.dataset.i, 10)].idx));
  });
}

// ---------- Kualitas video (khusus YouTube — file/website/drive cuma 1 rendition) ----------
// CATATAN JUJUR: sejak YouTube mengubah sistem player-nya (iframe API), YouTube SERING
// mengabaikan permintaan kualitas manual dan tetap memilih otomatis berdasarkan kecepatan
// koneksi masing-masing viewer — ini pembatasan dari pihak YouTube sendiri, bukan bug di
// aplikasi ini. Tombol ini tetap dikirim sebagai "permintaan" ke YouTube (kadang berhasil,
// terutama kalau video sedang di-pause/baru dimuat), tapi tidak selalu dijamin berubah.
const YT_QUALITY_LABELS = { auto: 'Otomatis', highres: 'Tertinggi', hd2160: '2160p 4K', hd1440: '1440p', hd1080: '1080p', hd720: '720p', large: '480p', medium: '360p', small: '240p', tiny: '144p' };
let activeQuality = 'auto';

function renderQualitySettingsList() {
  if (currentSourceType !== 'youtube' || !ytPlayer || !ytReady) {
    el.settingsQualityList.innerHTML = currentSourceType
      ? '<div class="settings-option-empty">Kualitas mengikuti video sumber (otomatis)</div>'
      : '<div class="settings-option-empty">Tidak ada video aktif</div>';
    return;
  }
  let levels = [];
  try { levels = ytPlayer.getAvailableQualityLevels(); } catch (e) { levels = []; }
  const note = '<div class="settings-note">⚠️ YouTube kadang tetap memilih otomatis meski kualitas diganti manual — ini pembatasan dari YouTube, bukan bug aplikasi.</div>';
  if (!levels || levels.length === 0) {
    el.settingsQualityList.innerHTML = '<div class="settings-option-empty">Kualitas belum tersedia (coba lagi setelah video mulai diputar)</div>' + note;
    return;
  }
  const options = ['auto', ...levels.filter((l) => l !== 'auto')].map((lvl) => ({ label: YT_QUALITY_LABELS[lvl] || lvl, idx: lvl }));
  renderSettingsOptions(el.settingsQualityList, options, activeQuality, (lvl) => {
    activeQuality = lvl;
    try { ytPlayer.setPlaybackQuality(lvl); } catch (e) {}
    renderQualitySettingsList();
  });
  el.settingsQualityList.insertAdjacentHTML('beforeend', note);
}

function formatTime(sec) {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ---------- Update progress bar + waktu (jalan untuk Room Master maupun viewer) ----------
let seekBarDragging = false;

function getCurrentPlaybackTimes() {
  if (currentSourceType === 'youtube' && ytPlayer && ytReady && typeof ytPlayer.getCurrentTime === 'function') {
    return { current: ytPlayer.getCurrentTime() || 0, duration: ytPlayer.getDuration() || 0 };
  } else if (el.html5Player.src) {
    return { current: el.html5Player.currentTime || 0, duration: el.html5Player.duration || 0 };
  }
  return null;
}

setInterval(() => {
  if (seekBarDragging) return;
  const t = getCurrentPlaybackTimes();
  if (!t) return;
  el.pcTime.textContent = `${formatTime(t.current)} / ${formatTime(t.duration)}`;
  if (t.duration > 0) {
    el.seekBar.max = 1000;
    el.seekBar.value = (t.current / t.duration) * 1000;
  }
}, 500);

function updatePlayPauseIcon(isPlaying) {
  el.btnPlayPause.innerHTML = isPlaying ? ICONS.pause : ICONS.play;
}

function initYoutubePlayer(videoId) {
  // controls & keyboard bawaan YouTube selalu dimatikan untuk semua orang — pemutaran
  // sekarang sepenuhnya lewat custom player controls kita sendiri (lebih rapi & konsisten,
  // sekaligus supaya double-tap seek & spasi play/pause bisa kita atur sendiri hak aksesnya).
  ytPlayer = new YT.Player('youtube-player', {
    videoId,
    playerVars: { autoplay: 0, controls: 0, disablekb: 1, rel: 0, modestbranding: 1 },
    events: {
      onReady: () => { ytReady = true; renderQualitySettingsList(); },
      onStateChange: onYoutubeStateChange
    }
  });
}

function onYoutubeStateChange(event) {
  updatePlayPauseIcon(event.data === YT.PlayerState.PLAYING);
  if (!isMaster || suppressEvents) return;
  const time = ytPlayer.getCurrentTime();
  if (event.data === YT.PlayerState.PLAYING) {
    socket.emit('playback-control', { roomId, action: 'play', time });
  } else if (event.data === YT.PlayerState.PAUSED) {
    socket.emit('playback-control', { roomId, action: 'pause', time });
  } else if (event.data === YT.PlayerState.ENDED) {
    // Video selesai -> otomatis lanjut ke antrian berikutnya (kalau ada)
    socket.emit('video-ended', { roomId });
  }
}

function bindHtml5Events() {
  el.html5Player.onplay = () => {
    updatePlayPauseIcon(true);
    if (!isMaster || suppressEvents) return;
    socket.emit('playback-control', { roomId, action: 'play', time: el.html5Player.currentTime });
  };
  el.html5Player.onpause = () => {
    updatePlayPauseIcon(false);
    if (!isMaster || suppressEvents) return;
    socket.emit('playback-control', { roomId, action: 'pause', time: el.html5Player.currentTime });
  };
  el.html5Player.onseeked = () => {
    if (!isMaster || suppressEvents) return;
    socket.emit('playback-control', { roomId, action: 'seek', time: el.html5Player.currentTime });
  };
  el.html5Player.onended = () => {
    // Video (file/website/drive) selesai -> otomatis lanjut ke antrian berikutnya
    if (isMaster) socket.emit('video-ended', { roomId });
  };
  // Video element sendiri tidak dipakai untuk interaksi langsung sama sekali (baik master
  // maupun viewer) — semua kontrol play/pause/seek/volume lewat custom player-overlay kita.
  // Ini juga otomatis mencegah viewer klik/keyboard langsung ke video untuk mem-bypass sync.
  el.html5Player.style.pointerEvents = 'none';
  el.html5Player.tabIndex = -1;
  if (!isMaster) {
    // Jika viewer somehow memicu play (misal autoplay browser), langsung pause lagi
    // kecuali memang sedang menerapkan state dari Room Master (suppressEvents).
    el.html5Player.addEventListener('play', () => {
      if (!suppressEvents) el.html5Player.pause();
    });
  }
}

// ---------- Menerima update playback dari master ----------
socket.on('playback-update', ({ action, time }) => applyPlaybackAction(action, time));
socket.on('playback-sync', (playback) => applyPlaybackState(playback));

function applyPlaybackAction(action, time) {
  suppressEvents = true;
  if (currentSourceType === 'youtube' && ytPlayer && ytReady) {
    if (Math.abs(ytPlayer.getCurrentTime() - time) > 1.5) ytPlayer.seekTo(time, true);
    if (action === 'play') ytPlayer.playVideo();
    if (action === 'pause') ytPlayer.pauseVideo();
  } else if (el.html5Player && el.html5Player.src && el.html5Player.style.display !== 'none') {
    if (Math.abs(el.html5Player.currentTime - time) > 1.5) el.html5Player.currentTime = time;
    if (action === 'play') el.html5Player.play().catch(() => {});
    if (action === 'pause') el.html5Player.pause();
  }
  setTimeout(() => { suppressEvents = false; }, 300);
}

function applyPlaybackState(playback) {
  if (!playback) return;
  applyPlaybackAction(playback.isPlaying ? 'play' : 'pause', playback.currentTime);
}

// ============================================================================
// CUSTOM PLAYER CONTROLS — play/pause, seek bar, volume, gear (subtitle+kualitas),
// double-tap maju/mundur 10 detik, dan spasi play/pause (khusus PC/browser)
// ============================================================================

function hasActiveVideo() {
  return (currentSourceType === 'youtube' && ytPlayer && ytReady) ||
         (currentSourceType && currentSourceType !== 'youtube' && el.html5Player.src);
}

function masterPlay() {
  if (currentSourceType === 'youtube' && ytPlayer && ytReady) ytPlayer.playVideo();
  else if (el.html5Player.src) el.html5Player.play().catch(() => {});
}
function masterPause() {
  if (currentSourceType === 'youtube' && ytPlayer && ytReady) ytPlayer.pauseVideo();
  else if (el.html5Player.src) el.html5Player.pause();
}
function masterIsPlaying() {
  if (currentSourceType === 'youtube' && ytPlayer && ytReady) return ytPlayer.getPlayerState() === YT.PlayerState.PLAYING;
  if (el.html5Player.src) return !el.html5Player.paused;
  return false;
}
function masterSeekTo(seconds, duration) {
  const clamped = Math.max(0, Math.min(seconds, duration || seconds));
  if (currentSourceType === 'youtube' && ytPlayer && ytReady) {
    ytPlayer.seekTo(clamped, true);
    // seekTo tidak selalu memicu onStateChange, jadi kirim event 'seek' manual ke viewer lain
    socket.emit('playback-control', { roomId, action: 'seek', time: clamped });
  } else if (el.html5Player.src) {
    el.html5Player.currentTime = clamped; // ini akan memicu 'onseeked' -> auto emit ke server
  }
}

// ---------- Tombol Play/Pause ----------
el.btnPlayPause.addEventListener('click', () => {
  if (!isMaster || !hasActiveVideo()) return;
  if (masterIsPlaying()) masterPause(); else masterPlay();
});
if (el.btnCenterPlay) {
  el.btnCenterPlay.addEventListener('click', () => {
    if (!isMaster || !hasActiveVideo()) return;
    if (masterIsPlaying()) masterPause(); else masterPlay();
  });
}
function updateCenterPlayVisibility() {
  if (!el.btnCenterPlay) return;
  const playing = hasActiveVideo() && masterIsPlaying();
  el.btnCenterPlay.innerHTML = playing ? '' : ICONS.play;
  el.btnCenterPlay.classList.toggle('show', !playing && hasActiveVideo());
}
setInterval(updateCenterPlayVisibility, 400);

// ---------- Seek bar (drag hanya untuk Room Master) ----------
el.seekBar.addEventListener('pointerdown', () => { if (isMaster) seekBarDragging = true; });
el.seekBar.addEventListener('input', () => {
  if (!isMaster || !hasActiveVideo()) return;
  const t = getCurrentPlaybackTimes();
  if (!t || !t.duration) return;
  const preview = (el.seekBar.value / 1000) * t.duration;
  el.pcTime.textContent = `${formatTime(preview)} / ${formatTime(t.duration)}`;
});
el.seekBar.addEventListener('change', () => {
  seekBarDragging = false;
  if (!isMaster || !hasActiveVideo()) return;
  const t = getCurrentPlaybackTimes();
  if (!t || !t.duration) return;
  masterSeekTo((el.seekBar.value / 1000) * t.duration, t.duration);
});

// ---------- Volume (lokal per-orang, tidak disinkron ke peserta lain) ----------
let lastVolume = 1;
el.volumeBar.addEventListener('input', () => {
  const v = el.volumeBar.value / 100;
  el.html5Player.volume = v;
  if (ytPlayer && ytReady) { try { ytPlayer.setVolume(v * 100); if (v > 0) ytPlayer.unMute(); } catch (e) {} }
  el.btnMute.innerHTML = v === 0 ? ICONS.volumeMute : v < 0.5 ? ICONS.volumeLow : ICONS.volumeHigh;
  if (v > 0) lastVolume = v;
});
el.btnMute.addEventListener('click', () => {
  const isMuted = parseFloat(el.volumeBar.value) === 0;
  el.volumeBar.value = isMuted ? Math.round(lastVolume * 100) : 0;
  el.volumeBar.dispatchEvent(new Event('input'));
});

// ---------- Menu Pengaturan (⚙️): gabungan Subtitle + Kualitas Video ----------
el.btnSettings.addEventListener('click', (e) => {
  e.stopPropagation();
  const show = el.settingsMenu.style.display === 'none';
  el.settingsMenu.style.display = show ? 'block' : 'none';
  if (show) renderQualitySettingsList();
});
document.addEventListener('click', (e) => {
  if (el.settingsMenu.style.display !== 'none' && !el.settingsMenu.contains(e.target) && e.target !== el.btnSettings) {
    el.settingsMenu.style.display = 'none';
  }
});

// ---------- Double-tap kanan = maju 10 detik, kiri = mundur 10 detik (Room Master saja) ----------
function flashSeek(el2) {
  el2.classList.add('show');
  clearTimeout(el2._t);
  el2._t = setTimeout(() => el2.classList.remove('show'), 550);
}

function showMasterToast(text) {
  el.masterToast.textContent = text;
  el.masterToast.classList.add('show');
  clearTimeout(el.masterToast._t);
  el.masterToast._t = setTimeout(() => el.masterToast.classList.remove('show'), 1800);
}

function handleDoubleTapSeek(direction) {
  if (!isMaster) { showMasterToast('Hanya Room Master yang bisa maju/mundur video.'); return; }
  if (!hasActiveVideo()) return;
  const t = getCurrentPlaybackTimes();
  const duration = t ? t.duration : 0;
  const current = t ? t.current : 0;
  masterSeekTo(current + direction * 10, duration);
  flashSeek(direction > 0 ? el.seekFlashRight : el.seekFlashLeft);
}

function handleSingleTapPlayPause() {
  showPlayerOverlayTemporarily();
  if (!isMaster || !hasActiveVideo()) return;
  if (masterIsPlaying()) masterPause(); else masterPlay();
}

// Ketuk/klik SATU KALI di mana pun pada video (kiri atau kanan) = toggle play/pause
// (jadi area video berfungsi seperti "tombol pause besar di tengah"). Ketuk/klik DUA KALI
// (double tap) di sisi kanan = maju 10 detik, sisi kiri = mundur 10 detik. Dibedakan pakai
// jeda singkat supaya single click tidak ikut ke-trigger saat sedang double click.
function bindTapZone(zoneEl, direction) {
  let singleTapTimer = null;
  zoneEl.addEventListener('click', () => {
    if (singleTapTimer) return;
    singleTapTimer = setTimeout(() => {
      singleTapTimer = null;
      handleSingleTapPlayPause();
    }, 260);
  });
  zoneEl.addEventListener('dblclick', () => {
    clearTimeout(singleTapTimer);
    singleTapTimer = null;
    handleDoubleTapSeek(direction);
  });
}

bindTapZone(el.dtLeft, -1);
bindTapZone(el.dtRight, 1);

// ---------- Spasi = play/pause, khusus buka lewat PC/browser (Room Master saja) ----------
document.addEventListener('keydown', (e) => {
  if (e.code !== 'Space') return;
  const tag = (e.target && e.target.tagName || '').toLowerCase();
  if (tag === 'input' || tag === 'textarea' || (e.target && e.target.isContentEditable)) return; // jangan ganggu ketik chat
  if (el.sourceModal.style.display === 'flex') return; // jangan ganggu saat modal sumber video terbuka
  e.preventDefault();
  if (!isMaster) { showMasterToast('Hanya Room Master yang bisa mengontrol pemutaran.'); return; }
  if (!hasActiveVideo()) return;
  if (masterIsPlaying()) masterPause(); else masterPlay();
});

// ---------- Auto-hide overlay kontrol player saat idle (gaya YouTube/Netflix) ----------
let idleHideTimer = null;
function showPlayerOverlayTemporarily() {
  el.playerOverlay.classList.remove('hidden-idle');
  clearTimeout(idleHideTimer);
  idleHideTimer = setTimeout(() => {
    if (el.settingsMenu.style.display === 'none') el.playerOverlay.classList.add('hidden-idle');
  }, 3000);
}
['mousemove', 'touchstart', 'click'].forEach((evt) => {
  el.playerContainer.addEventListener(evt, showPlayerOverlayTemporarily);
});
showPlayerOverlayTemporarily();

// Master mengirim heartbeat setiap beberapa detik agar viewer tetap tersinkron
setInterval(() => {
  if (!isMaster) return;
  let time = 0, isPlaying = false;
  if (currentSourceType === 'youtube' && ytPlayer && ytReady) {
    time = ytPlayer.getCurrentTime();
    isPlaying = ytPlayer.getPlayerState() === YT.PlayerState.PLAYING;
  } else if (el.html5Player && el.html5Player.src) {
    time = el.html5Player.currentTime;
    isPlaying = !el.html5Player.paused;
  } else {
    return;
  }
  socket.emit('playback-heartbeat', { roomId, time, isPlaying });
}, 4000);

// ---------- Fullscreen kustom (supaya notifikasi chat tetap kelihatan lewat bubble pojok layar) ----------
// Tombol fullscreen bawaan <video> sengaja dimatikan (controlsList="nofullscreen")
// karena itu cuma fullscreen elemen <video>-nya saja (tidak bisa ditambahi overlay apa pun,
// termasuk bubble notifikasi chat). Tombol ini fullscreen-kan #player-container sebagai gantinya.
el.btnFullscreen.addEventListener('click', () => {
  const container = el.playerContainer;
  if (isPlayerFullscreen()) {
    const exit = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen;
    if (exit) exit.call(document);
  } else {
    const req = container.requestFullscreen || container.webkitRequestFullscreen || container.mozRequestFullScreen;
    if (req) req.call(container);
  }
});

let isFullscreenNow = false;
function isPlayerFullscreen() {
  const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement;
  return fsEl === el.playerContainer;
}

function handleFullscreenChange() {
  isFullscreenNow = isPlayerFullscreen();
  el.btnFullscreen.innerHTML = isFullscreenNow ? ICONS.fullscreenExit : ICONS.fullscreenEnter;
  el.btnFullscreen.title = isFullscreenNow ? 'Keluar Fullscreen' : 'Fullscreen';
}
document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
document.addEventListener('mozfullscreenchange', handleFullscreenChange);

// ---------- Bubble notifikasi chat (muncul di pojok layar saat fullscreen, gantinya running text) ----------
// Nada notifikasi dibuat langsung lewat Web Audio API (2 nada pendek naik), jadi gak perlu file audio eksternal.
let notifAudioCtx = null;
function playChatNotifSound() {
  try {
    if (!notifAudioCtx) notifAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (notifAudioCtx.state === 'suspended') notifAudioCtx.resume();
    const now = notifAudioCtx.currentTime;
    [[880, 0], [1174.66, 0.09]].forEach(([freq, delay]) => {
      const osc = notifAudioCtx.createOscillator();
      const gain = notifAudioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(0.18, now + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.22);
      osc.connect(gain).connect(notifAudioCtx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + 0.24);
    });
  } catch (e) { /* browser gak support Web Audio API, abaikan diam-diam */ }
}
function showChatBubble(name, preview) {
  if (!isFullscreenNow || !el.chatBubbleLayer) return;
  playChatNotifSound();
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble-notif';
  bubble.innerHTML = `${ICONS.chat}<div class="chat-bubble-text"><strong>${escapeHtml(name)}</strong><span>${escapeHtml(preview)}</span></div>`;
  el.chatBubbleLayer.appendChild(bubble);
  // Batasi maksimal 4 bubble sekaligus biar gak menumpuk penuh layar
  while (el.chatBubbleLayer.children.length > 4) {
    el.chatBubbleLayer.removeChild(el.chatBubbleLayer.firstChild);
  }
  requestAnimationFrame(() => bubble.classList.add('show'));
  setTimeout(() => {
    bubble.classList.remove('show');
    bubble.classList.add('hide');
    setTimeout(() => bubble.remove(), 350);
  }, 4200);
}

// ---------- Reaksi emoji ----------
document.querySelectorAll('#reaction-bar button').forEach((btn) => {
  btn.addEventListener('click', () => {
    socket.emit('reaction', { roomId, emoji: btn.dataset.emoji });
  });
});

socket.on('reaction', ({ emoji }) => {
  const span = document.createElement('span');
  span.className = 'floating-reaction';
  span.textContent = emoji;
  span.style.left = `${10 + Math.random() * 70}%`;
  el.reactionFloatLayer.appendChild(span);
  span.addEventListener('animationend', () => span.remove());
});

// ---------- Voice Chat (mesh WebRTC sederhana) — siapa pun bebas aktifkan mikrofon sendiri ----------
let voiceJoined = false;
let localAudioStream = null;
const peerConnections = {}; // socketId -> RTCPeerConnection
// STUN saja sering gagal kalau kedua peserta beda jaringan (mis. HP data seluler vs WiFi),
// karena banyak jaringan mobile/CGNAT di Indonesia pakai NAT simetris yang butuh relay TURN.
// TURN server publik gratis (openrelay.metered.ca) ditambahkan sebagai fallback.
const rtcConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
    { urls: 'turn:openrelay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' },
    { urls: 'turn:openrelay.metered.ca:443?transport=tcp', username: 'openrelayproject', credential: 'openrelayproject' }
  ]
};

el.btnJoinVoice.addEventListener('click', async () => {
  if (voiceJoined) {
    leaveVoiceChat();
  } else {
    await joinVoiceChat();
  }
});

async function joinVoiceChat() {
  try {
    localAudioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
  } catch (e) {
    alert('Tidak bisa mengakses mikrofon. Pastikan izin mikrofon diaktifkan di browser.');
    return;
  }
  voiceJoined = true;
  el.btnJoinVoice.innerHTML = `${ICONS.micOff} <span>Matikan Mikrofon</span>`;
  el.btnJoinVoice.classList.add('mic-active');
  socket.emit('voice-join', { roomId });
}

function leaveVoiceChat() {
  if (localAudioStream) {
    localAudioStream.getTracks().forEach((t) => t.stop());
    localAudioStream = null;
  }
  Object.keys(peerConnections).forEach(closePeerConnection);
  voiceJoined = false;
  el.btnJoinVoice.innerHTML = `${ICONS.mic} <span>Aktifkan Mikrofon</span>`;
  el.btnJoinVoice.classList.remove('mic-active');
  if (roomId) socket.emit('voice-leave', { roomId });
}

function closePeerConnection(socketId) {
  const pc = peerConnections[socketId];
  if (pc) {
    pc.close();
    delete peerConnections[socketId];
  }
  const audioEl = document.getElementById(`voice-audio-${socketId}`);
  if (audioEl) audioEl.remove();
}

function createPeerConnection(remoteSocketId) {
  const pc = new RTCPeerConnection(rtcConfig);
  if (localAudioStream) {
    localAudioStream.getTracks().forEach((track) => pc.addTrack(track, localAudioStream));
  }
  pc.onicecandidate = (e) => {
    if (e.candidate) {
      socket.emit('voice-signal', { targetSocketId: remoteSocketId, data: { type: 'ice-candidate', candidate: e.candidate } });
    }
  };
  // Debug bantuan: kalau koneksi voice chat gagal, ini akan kelihatan di console browser (F12)
  pc.oniceconnectionstatechange = () => {
    console.log(`[voice] ICE state dengan ${remoteSocketId}:`, pc.iceConnectionState);
    if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
      console.warn(`[voice] Koneksi ke ${remoteSocketId} gagal/putus. Coba matikan lalu nyalakan lagi mikrofon.`);
    }
  };
  pc.ontrack = (e) => {
    let audioEl = document.getElementById(`voice-audio-${remoteSocketId}`);
    if (!audioEl) {
      audioEl = document.createElement('audio');
      audioEl.id = `voice-audio-${remoteSocketId}`;
      audioEl.autoplay = true;
      audioEl.playsInline = true;
      el.voiceAudioContainer.appendChild(audioEl);
    }
    audioEl.srcObject = e.streams[0];
    // Beberapa browser mobile memblokir autoplay audio; coba paksa play() dan beri fallback.
    const playPromise = audioEl.play();
    if (playPromise && playPromise.catch) {
      playPromise.catch(() => {
        console.warn('[voice] Autoplay audio diblokir browser, menunggu interaksi pengguna berikutnya.');
        const resumeAudio = () => { audioEl.play().catch(() => {}); document.removeEventListener('click', resumeAudio); };
        document.addEventListener('click', resumeAudio, { once: true });
      });
    }
  };
  peerConnections[remoteSocketId] = pc;
  return pc;
}

// Peserta voice yang SUDAH ADA di room akan menerima ini saat orang baru gabung —
// mereka yang berinisiatif membuat 'offer' ke orang baru tersebut.
socket.on('voice-peer-joined', async ({ socketId }) => {
  if (!voiceJoined) return;
  const pc = createPeerConnection(socketId);
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  socket.emit('voice-signal', { targetSocketId: socketId, data: { type: 'offer', sdp: offer } });
});

// Diterima oleh peserta yang BARU gabung — daftar orang yang sudah ada di voice chat
socket.on('voice-existing-participants', ({ participants }) => {
  participants.forEach((socketId) => {
    if (!peerConnections[socketId]) createPeerConnection(socketId);
  });
});

socket.on('voice-signal', async ({ fromSocketId, data }) => {
  if (!voiceJoined) return;
  let pc = peerConnections[fromSocketId];
  if (!pc) pc = createPeerConnection(fromSocketId);

  if (data.type === 'offer') {
    await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit('voice-signal', { targetSocketId: fromSocketId, data: { type: 'answer', sdp: answer } });
  } else if (data.type === 'answer') {
    await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
  } else if (data.type === 'ice-candidate') {
    try { await pc.addIceCandidate(new RTCIceCandidate(data.candidate)); } catch (e) {}
  }
});

socket.on('voice-peer-left', ({ socketId }) => closePeerConnection(socketId));

// Kalau room master keluar dari voice chat lewat cara apapun, bereskan koneksi lokal juga
window.addEventListener('beforeunload', () => {
  if (voiceJoined) socket.emit('voice-leave', { roomId });
});
