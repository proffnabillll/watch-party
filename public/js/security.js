// ============================================================================
// security.js — lapisan "penghalang" (deterrent) supaya tidak sembarang orang
// iseng klik-kanan / buka DevTools.
//
// PENTING (baca ini): ini BUKAN enkripsi atau proteksi sungguhan. Kode HTML/CSS/JS
// yang dikirim ke browser pasti bisa dibaca siapa pun yang cukup niat (lewat
// Ctrl+U, menonaktifkan JS ini duluan, browser extension, dsb) — ini berlaku untuk
// SEMUA aplikasi web, bukan cuma punya kamu. Script ini hanya menambah friksi untuk
// pengguna awam (klik kanan, tombol pintas F12, dsb). Jangan taruh rahasia penting
// (API key privat, dsb) di file JS yang dikirim ke browser — taruh di server.js saja.
// ============================================================================

(function () {
  // Matikan klik kanan (context menu "Inspect")
  document.addEventListener('contextmenu', (e) => e.preventDefault());

  // Matikan shortcut umum untuk buka DevTools / lihat source
  document.addEventListener('keydown', (e) => {
    const k = e.key;
    if (
      k === 'F12' ||
      (e.ctrlKey && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(k)) ||
      (e.ctrlKey && ['U', 'u', 'S', 's'].includes(k)) ||
      (e.metaKey && e.altKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(k))
    ) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  // Deteksi kasar kalau panel DevTools kebuka (dari selisih ukuran window),
  // lalu tampilkan overlay peringatan. Threshold dilonggarkan supaya tidak
  // salah-deteksi di layar kecil/HP biasa.
  let warned = false;
  function showDevtoolsWarning() {
    if (warned || document.getElementById('__dt_warning_overlay')) return;
    warned = true;
    const overlay = document.createElement('div');
    overlay.id = '__dt_warning_overlay';
    overlay.style.cssText =
      'position:fixed;inset:0;z-index:999999;background:rgba(10,10,20,0.96);' +
      'color:#fff;display:flex;align-items:center;justify-content:center;' +
      'flex-direction:column;text-align:center;padding:24px;font-family:sans-serif;';
    overlay.innerHTML =
      '<div style="font-size:40px;margin-bottom:12px;">🔒</div>' +
      '<div style="font-size:16px;max-width:360px;">DevTools terdeteksi terbuka.<br>Tutup DevTools untuk melanjutkan menonton.</div>';
    document.body.appendChild(overlay);
  }
  function hideDevtoolsWarning() {
    warned = false;
    const el = document.getElementById('__dt_warning_overlay');
    if (el) el.remove();
  }
  const threshold = 170;
  setInterval(() => {
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;
    if (widthDiff > threshold || heightDiff > threshold) {
      showDevtoolsWarning();
    } else {
      hideDevtoolsWarning();
    }
  }, 1000);
})();
