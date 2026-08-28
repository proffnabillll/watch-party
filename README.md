# 🎬 PROFFNABILL WATCH PARTY

Website nonton bareng (watch party) dengan dukungan sumber video dari:
- **YouTube** (tempel link, langsung diputar dengan YouTube IFrame API)
- **Google Drive** (login via Google Picker, atau tempel link manual)
- **Website lain** (auto-detect sumber video dari halaman)
- **File dari perangkat** (upload langsung ke server)

Fitur lain: Room Master & sistem kode/link room, chat real-time, sinkronisasi play/pause/seek antar peserta.

---

## 🚀 Cara Menjalankan

```bash
npm install
npm start
```

Lalu buka `http://localhost:3000` di browser.

> **Opsional**: untuk fitur subtitle otomatis dari file MKV, install `ffmpeg` di server terlebih dahulu (lihat bagian "Subtitle Otomatis" di bawah). Tanpa ffmpeg, semua fitur lain tetap berjalan normal.

Untuk mode development (auto-restart saat ada perubahan kode):
```bash
npm run dev
```

---

## 📁 Struktur Folder

```
web PROFFNABILL WATCH PARTY/
├── server.js              # Server Express + Socket.io
├── package.json
├── uploads/                # Tempat file video hasil upload user disimpan
└── public/
    ├── index.html          # Halaman buat/gabung room
    ├── room.html           # Halaman room (player + chat)
    ├── css/style.css
    └── js/
        ├── landing.js      # Logika halaman awal
        ├── room.js         # Logika utama room (player, sync, chat)
        └── drive-config.js # Kredensial Google Drive (isi sendiri)
```

---

## 👑 Cara Kerja Room Master

- Orang yang membuat room otomatis menjadi **Room Master**.
- Room Master satu-satunya yang bisa: memilih/mengganti sumber video, serta mengontrol play/pause/seek.
- User lain (**viewer**) join dengan memasukkan **kode room** (6 karakter) atau membuka **link undangan** yang bisa disalin dari dalam room. Link undangan memakai **token acak terpisah** (bukan kode room itu sendiri), supaya kode room tidak ikut ter-expose ke siapa pun yang mendapat link tersebut.
- Video & posisi playback viewer otomatis mengikuti Room Master (real-time via Socket.io), termasuk "heartbeat" sinkronisasi tiap beberapa detik untuk mengoreksi jika ada video yang mulai ngelag/drift.
- **Hanya Room Master yang bisa play/pause/maju-mundur (seek) video.** Ini ditegakkan di dua lapis:
  1. **Server**: event `playback-control` ditolak kalau pengirimnya bukan `masterSocketId` room tersebut — jadi meskipun ada yang mencoba mengirim event lewat cara lain (misal lewat console browser), servernya tetap menolak.
  2. **Tampilan viewer**: kontrol player (tombol play/pause/scrubber) disembunyikan/dinonaktifkan untuk viewer, baik di player YouTube (`controls: 0` saat bukan master) maupun player file/HTML5 (`controls` di-nonaktifkan saat bukan master).
  - Contoh: kalau Room Master maju ke menit ke-3, server broadcast posisi tersebut ke semua viewer, dan video semua peserta ikut lompat ke menit ke-3 secara otomatis.
- Jika Room Master keluar dari room, kontrol otomatis dilimpahkan ke user berikutnya yang masih ada di room.

---

## ▶️ Sumber Video: YouTube (perlu setup API)

Pemilihan video didesain seperti membuka website YouTube langsung di dalam room: ada kolom pencarian dan grid thumbnail video (otomatis menampilkan video populer saat modal pertama dibuka). Room Master tinggal klik salah satu video untuk menjadikannya tontonan bersama — bukan tempel link manual.

Fitur ini butuh **YouTube Data API v3 key** (gratis, kuota harian cukup besar untuk pemakaian normal).

**Langkah setup:**
1. Buka [Google Cloud Console](https://console.cloud.google.com/), pakai project yang sama seperti Google Drive (atau buat baru).
2. Di menu "APIs & Services > Library", aktifkan **YouTube Data API v3**.
3. Di menu "APIs & Services > Credentials", buat **API Key** baru.
4. (Opsional tapi disarankan) Batasi API key tersebut agar hanya bisa dipakai untuk **YouTube Data API v3**, supaya lebih aman.
5. Isi key tersebut di file `youtube-config.js` (di root folder project, sejajar dengan `server.js`):
   ```js
   module.exports = {
     API_KEY: 'AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
   };
   ```
6. Restart server (`npm start`). Pencarian & video populer akan langsung aktif.

**Catatan:** Karena request ke YouTube Data API dilakukan dari **server** (bukan dari browser), API key kamu tidak pernah terekspos ke pengguna/klien.

---

## 🗂️ Sumber Video: Google Drive (perlu setup API)

Fitur "Login & Pilih dari Google Drive" (Google Picker) memerlukan kredensial dari Google Cloud Console milikmu sendiri karena ini menyangkut akses ke akun Google user.

**Langkah setup:**
1. Buka [Google Cloud Console](https://console.cloud.google.com/), buat project baru (atau pakai yang sudah ada).
2. Aktifkan **Google Drive API** dan **Google Picker API** di menu "APIs & Services > Library".
3. Buat **OAuth Client ID** (tipe "Web application") di menu "APIs & Services > Credentials". Tambahkan domain website kamu (misal `http://localhost:3000`) ke "Authorized JavaScript origins".
4. Buat juga **API Key** di halaman Credentials yang sama.
5. Isi ketiganya di file `public/js/drive-config.js`:
   ```js
   const DRIVE_CONFIG = {
     CLIENT_ID: 'xxxxx.apps.googleusercontent.com',
     API_KEY: 'AIzaSyXXXXXXXXXXXX',
     APP_ID: 'nomor-project-google-cloud'
   };
   ```
6. Restart server. Tombol "Login & Pilih dari Google Drive" akan aktif.

**Cara kerja & sinkronisasi:**
- Saat file dipilih lewat Picker, sistem otomatis mencoba mengubah izin file menjadi **"Anyone with the link can view"**, supaya peserta lain bisa mengaksesnya tanpa perlu ubah setting manual.
- Video Drive **di-proxy lewat server kita sendiri** (endpoint `/api/drive-stream/:fileId`) dan diputar sebagai `<video>` HTML5 biasa — persis seperti sumber "File Perangkat". Karena itu, **play/pause/seek Room Master ikut tersinkron penuh ke semua viewer**, sama seperti sumber lainnya.
- **Trade-off yang perlu disadari**: karena videonya di-relay lewat server (bukan langsung dari Google ke masing-masing user), bandwidth server kamu akan terpakai untuk setiap viewer yang menonton. Untuk file besar dengan banyak viewer, pertimbangkan kapasitas server/hosting kamu.
- Kalau memasukkan link Drive secara **manual** (bukan lewat Picker), auto-share TIDAK berjalan (sistem tidak tahu apakah kamu pemilik file itu) — pastikan file sudah di-share sebagai "Anyone with the link can view" sendiri sebelum dibagikan ke room.

---

## 🌐 Sumber Video: Website Lain (Auto-detect)

Server akan mencoba mengambil HTML dari URL yang diberikan, lalu mencari:
1. Meta tag `og:video`
2. Tag `<video src>` / `<source src>`
3. Pola link `.mp4` / `.m3u8` / `.webm` di dalam HTML

**Keterbatasan yang perlu dipahami:**
- Banyak situs streaming memakai proteksi (DRM, token URL yang kadaluarsa, cek referrer, atau video dimuat lewat JavaScript kompleks) sehingga **tidak semua situs bisa terdeteksi**, dan ini adalah batasan teknis/hukum, bukan bug.
- Jika auto-detect gagal, user akan diberi pesan untuk mencoba link manual atau menggunakan alternatif berbagi layar.

**Alternatif yang lebih universal (opsional untuk dikembangkan):** fitur *screen/tab share* via WebRTC, di mana Room Master membagikan tab browser-nya (termasuk audio) dan peserta lain menonton stream tersebut. Ini bekerja untuk situs apa pun tanpa perlu extractor khusus, namun kualitas bergantung pada kecepatan upload Room Master.

---

## 💻 Sumber Video: File dari Perangkat

User memilih file video dari perangkatnya, lalu file diupload ke server (folder `uploads/`) dan disajikan sebagai sumber video untuk semua peserta room. Progress upload ditampilkan sebagai progress bar.

**Catatan produksi:**
- Batas ukuran file saat ini diset 2GB (`server.js`, bagian `multer`), sesuaikan sesuai kapasitas server.
- Untuk penggunaan jangka panjang/banyak user, pertimbangkan pindah penyimpanan ke layanan cloud storage (S3, GCS, dsb.) alih-alih disk lokal server.
- Folder `uploads/` sebaiknya dibersihkan secara berkala (file lama dihapus) agar tidak memenuhi disk.

---

## 💬 Subtitle Otomatis (khusus file MKV/dll yang punya track subtitle)

Kalau file video yang diupload (misal `.mkv`) punya subtitle tertanam (soft-sub), server akan otomatis mendeteksi dan mengekstraknya jadi file `.vtt`, lalu menampilkan pilihan subtitle di dalam menu ⚙️ Pengaturan pada player (tersedia untuk Room Master maupun viewer, masing-masing bisa pilih bahasa sendiri secara independen — pilihan ini lokal per-orang, tidak disinkronkan).

**Prasyarat: `ffmpeg` dan `ffprobe` harus terpasang di server** (bukan npm package, tapi binary sistem). Cara install:
- **Ubuntu/Debian**: `sudo apt install ffmpeg`
- **macOS (Homebrew)**: `brew install ffmpeg`
- **Windows**: unduh dari [ffmpeg.org](https://ffmpeg.org/download.html) dan tambahkan ke PATH.

**Keterbatasan:**
- Hanya subtitle **berbasis teks** (SRT/ASS/SSA) yang bisa diekstrak otomatis. Subtitle **berbasis gambar** (PGS/bitmap, umum di rip Blu-ray) tidak bisa dikonversi otomatis dan akan dilewati.
- Kalau `ffmpeg`/`ffprobe` belum terpasang di server, fitur ini otomatis nonaktif (tidak error, dropdown subtitle cuma tidak muncul) — sumber video lain tetap berjalan normal.
- Fitur ini hanya berlaku untuk sumber **"File Perangkat"** (upload lokal), karena butuh file fisik di server untuk diproses `ffmpeg`. Tidak berlaku untuk YouTube (captions sudah ditangani YouTube sendiri) atau website lain/Drive.
- Proses ekstraksi berjalan sebelum video siap diputar, jadi untuk file besar/subtitle banyak mungkin ada jeda beberapa detik setelah upload selesai (ditandai teks "⏳ Memproses video...").

---

## 🔧 Pengembangan Lanjutan yang Disarankan

- **Autentikasi user** (saat ini nama hanya disimpan sementara di `sessionStorage`, room disimpan in-memory di server sehingga akan hilang jika server restart).
- **Database** (misal Redis/MongoDB) untuk menyimpan data room agar tahan restart & bisa scaling multi-server.
- **Kontrol tambahan Room Master**: kick/mute user, transfer kontrol master ke user lain secara manual.
- **Reaction/emoji** saat menonton, dan riwayat chat yang lebih tahan lama.
- **WebRTC screen-share** sebagai sumber video universal (lihat catatan di bagian "Website Lain" di atas).

---

## 📋 Antrian Video

Kalau Room Master memilih video baru **saat video lain sedang berjalan**, video itu tidak langsung menggantikan yang sedang diputar — melainkan masuk ke **antrian**. Video berikutnya otomatis mulai diputar begitu video yang sedang berjalan benar-benar **selesai** (event "ended"), berlaku untuk semua jenis sumber (YouTube, file, website, Drive).

Room Master bisa:
- Melihat daftar antrian di bagian bawah video.
- **✕ Hapus** salah satu item dari antrian.
- **▶ Putar sekarang** untuk langsung memutar item tertentu dari antrian, melewati (skip) video yang sedang berjalan.

Kalau belum ada video yang sedang diputar, video yang dipilih langsung diputar seperti biasa (tidak masuk antrian). Room baru yang dibuat juga langsung membuka modal pemilihan sumber video untuk Room Master.

---

## 🎤 Voice Chat

Room Master bisa mengaktifkan/menonaktifkan voice chat untuk seluruh room lewat tombol **🎙️ Voice Chat**. Saat aktif, semua peserta (termasuk Room Master) bisa klik **🎤 Gabung Voice** untuk bicara lewat mikrofon.

**Cara kerja teknis:** WebRTC mesh (koneksi peer-to-peer langsung antar browser, disinyal lewat server Socket.io), tanpa server media tambahan. Cukup baik untuk room kecil (sekitar 6-8 orang); untuk room jauh lebih besar pertimbangkan arsitektur SFU (mediasoup/LiveKit) karena mesh makin berat di sisi tiap client seiring jumlah peserta bertambah.

Browser mewajibkan koneksi **HTTPS** untuk akses mikrofon di production (kecuali diakses lewat `localhost` saat development).

---

## 😄 Reaksi Emoji

Tombol reaksi cepat (👍 ❤️ 😂 😮 🔥) di bawah video — begitu diklik, emoji muncul melayang di atas video untuk semua peserta room.

---

## 🎛️ Player Kustom, Double-Tap Seek, Spasi, & Menu ⚙️ Pengaturan

- Semua kontrol video (play/pause, progress bar, volume, subtitle, kualitas, fullscreen) sekarang pakai UI kustom sendiri, bukan controls bawaan browser/YouTube lagi.
- Subtitle dan kualitas video digabung jadi satu menu **⚙️ Pengaturan** di pojok kanan bawah player.
- Kualitas video ("Otomatis", 1080p, 720p, dst.) hanya tersedia untuk sumber **YouTube** (sesuai level yang disediakan YouTube untuk video tsb). Untuk sumber file/website/Google Drive, kualitas mengikuti file aslinya (single rendition), jadi menunya menampilkan info bahwa kualitas otomatis mengikuti sumber.
- **Double-tap/double-click** di area video: sisi **kanan** = maju 10 detik, sisi **kiri** = mundur 10 detik. Tetap **hanya Room Master** yang punya hak ini — kalau viewer coba, akan muncul notifikasi kecil.
- Tombol **Spasi** di keyboard (browser PC) = play/pause, juga khusus Room Master.
- Volume adalah pengaturan lokal per-perangkat (tidak disinkronkan ke peserta lain).
- Kontrol player otomatis menyembunyikan diri setelah 3 detik idle (gaya YouTube/Netflix), muncul lagi saat mouse digerakkan/disentuh.

## 🔒 Proteksi Dasar dari Klik-Kanan / Inspect Element

File `public/js/security.js` menonaktifkan klik-kanan dan shortcut umum (F12, Ctrl+Shift+I/J/C, Ctrl+U), plus deteksi kasar kalau panel DevTools kebuka. **Catatan penting**: ini hanya penghalang untuk pengguna awam, bukan proteksi sungguhan — kode HTML/CSS/JS yang dikirim ke browser pada dasarnya selalu bisa dibaca orang yang cukup niat (ini berlaku untuk semua aplikasi web, bukan cuma project ini). Jangan taruh data rahasia (API key privat, dsb.) di file JS sisi klien — taruh di `server.js` yang tidak pernah dikirim ke browser.

## 🖼️ Logo & Icon

Taruh file `logo.png` dan `icon.png` (favicon) kamu di folder `public/assets/`. Kalau file belum ada, logo otomatis disembunyikan (tidak tampil sebagai gambar rusak). Lihat `public/assets/README.txt` untuk detail ukuran yang disarankan.

## 📺 Running Text Chat saat Fullscreen

Tombol fullscreen bawaan video sengaja dimatikan (`controlsList="nofullscreen"`), diganti tombol **⛶ Fullscreen** kustom yang mem-fullscreen-kan seluruh area video (bukan cuma elemen `<video>`), supaya overlay chat tetap bisa ditampilkan. Setiap pesan chat baru yang masuk saat fullscreen akan muncul sebagai teks berjalan (running text) di bagian bawah video.

---

## 💬 Subtitle: Otomatis + Manual

Selain ekstraksi otomatis dari file mkv (butuh `ffmpeg`, lihat bagian sebelumnya), sekarang tersedia juga **upload subtitle manual** (.srt/.vtt/.ass/.ssa) di panel "File Perangkat" — berguna sebagai cadangan kalau ekstraksi otomatis gagal, atau kalau video memang tidak punya subtitle tertanam. Konversi `.srt` → `.vtt` dilakukan murni dengan JavaScript (tidak butuh ffmpeg sama sekali), sementara `.ass`/`.ssa` tetap butuh ffmpeg untuk dikonversi.
