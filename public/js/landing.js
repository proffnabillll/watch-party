// Halaman ini TIDAK membuat koneksi socket sendiri.
// Pembuatan/gabung room dilakukan sepenuhnya di room.html agar memakai
// satu koneksi socket yang sama dari awal sampai akhir (menghindari
// masalah "Room Master" hilang akibat socket lama terputus saat pindah halaman).

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`${btn.dataset.tab}-panel`).classList.add('active');
  });
});

function showError(msg) {
  document.getElementById('error-msg').textContent = msg;
}

document.getElementById('btn-create-room').addEventListener('click', () => {
  const name = document.getElementById('create-name').value.trim();
  const roomName = document.getElementById('create-roomname').value.trim();
  if (!name) return showError('Nama kamu wajib diisi.');

  sessionStorage.setItem('pw_name', name);
  sessionStorage.setItem('pw_roomName', roomName);
  window.location.href = `/room.html?mode=create`;
});

document.getElementById('btn-join-room').addEventListener('click', () => {
  const name = document.getElementById('join-name').value.trim();
  const roomId = document.getElementById('join-roomid').value.trim().toUpperCase();
  if (!name) return showError('Nama kamu wajib diisi.');
  if (!roomId) return showError('Kode room wajib diisi.');

  sessionStorage.setItem('pw_name', name);
  window.location.href = `/room.html?mode=join&room=${roomId}`;
});

// Jika buka link undangan berformat /room.html?room=XXXX langsung, biarkan room.js yang urus.
