/**
 * PROFFNABILL WATCH PARTY - Server
 * ---------------------------------
 * Express + Socket.io untuk:
 * - Membuat & bergabung room (kode room / link)
 * - Sinkronisasi playback video (play/pause/seek) yang dikontrol oleh Room Master
 * - Chat real-time per room
 * - Upload file video lokal (disajikan sebagai sumber "file")
 * - Auto-detect video dari sebuah URL website (best-effort, lihat catatan di README)
 */

const path = require('path');
const fs = require('fs');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const axios = require('axios');
const cheerio = require('cheerio');
const { v4: uuidv4 } = require('uuid');
const { execFile } = require('child_process');
const util = require('util');
const execFileAsync = util.promisify(execFile);
const youtubeConfig = require('./youtube-config');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(UPLOAD_DIR));

// ---------- Upload file video lokal ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 } // 2GB, sesuaikan sesuai kebutuhan
});

// ---------- Ekstraksi subtitle dari file video (mkv, dll) via ffmpeg/ffprobe ----------
// Catatan: hanya mendukung subtitle berbasis teks (SRT/ASS/SSA). Subtitle berbasis
// gambar (PGS/bitmap, sering ada di rip Blu-ray) tidak bisa dikonversi otomatis.
// Membutuhkan ffmpeg & ffprobe terpasang di server (lihat README).
async function extractSubtitles(videoPath, uploadDir, baseName) {
  let streams = [];
  try {
    const { stdout } = await execFileAsync('ffprobe', [
      '-v', 'error',
      '-print_format', 'json',
      '-show_streams',
      '-select_streams', 's',
      videoPath
    ]);
    const info = JSON.parse(stdout);
    streams = info.streams || [];
  } catch (e) {
    if (e.code === 'ENOENT') {
      console.warn('[subtitle] ffprobe tidak ditemukan di server. Install ffmpeg agar fitur subtitle otomatis aktif (lihat README).');
    } else {
      console.warn('[subtitle] Gagal menjalankan ffprobe:', e.message);
    }
    return { subtitles: [], ffmpegAvailable: false, streamsFound: 0 };
  }

  const subtitles = [];
  for (const stream of streams) {
    const outName = `${baseName}.sub${stream.index}.vtt`;
    const outPath = path.join(uploadDir, outName);
    try {
      await execFileAsync('ffmpeg', [
        '-y',
        '-i', videoPath,
        '-map', `0:${stream.index}`,
        '-c:s', 'webvtt',
        outPath
      ]);
      const lang = stream.tags?.language || 'und';
      const title = stream.tags?.title;
      subtitles.push({
        url: `/uploads/${outName}`,
        lang,
        label: title || lang || `Subtitle ${subtitles.length + 1}`
      });
    } catch (e) {
      // Kemungkinan besar subtitle berbasis GAMBAR (PGS/VobSub/DVD), bukan teks (SRT/ASS),
      // sehingga tidak bisa dikonversi ke WebVTT oleh ffmpeg tanpa OCR.
      console.warn(`[subtitle] Gagal mengonversi stream #${stream.index} codec=${stream.codec_name} (kemungkinan format gambar seperti PGS):`, e.message);
    }
  }
  return { subtitles, ffmpegAvailable: true, streamsFound: streams.length };
}

app.post('/api/upload', upload.single('video'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Tidak ada file yang diupload' });
  const ext = path.extname(req.file.filename);
  const baseName = path.basename(req.file.filename, ext);
  const { subtitles, ffmpegAvailable, streamsFound } = await extractSubtitles(req.file.path, UPLOAD_DIR, baseName);
  res.json({
    url: `/uploads/${req.file.filename}`,
    title: req.file.originalname,
    subtitles,
    streamsFound,
    ffmpegAvailable
  });
});

// ---------- Upload subtitle manual (fallback yang PASTI berfungsi) ----------
// Ekstraksi otomatis dari mkv bergantung pada ffmpeg terpasang & format subtitle
// berbasis teks. Kalau itu gagal/tidak ada, user bisa upload file subtitle-nya
// sendiri (biasanya sudah ada terpisah sebagai .srt/.vtt/.ass) dan tetap berfungsi
// tanpa perlu ffmpeg sama sekali untuk kasus .srt/.vtt (dikonversi murni pakai JS).
function srtToVtt(srtContent) {
  return (
    'WEBVTT\n\n' +
    srtContent
      .replace(/\r+/g, '')
      .replace(/^\d+\s*$/gm, '') // buang nomor urutan cue ala SRT
      .replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2') // koma -> titik pada timestamp
      .trim()
  );
}

const subtitleUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB, subtitle selalu kecil
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.srt', '.vtt', '.ass', '.ssa'].includes(ext)) cb(null, true);
    else cb(new Error('Format subtitle harus .srt, .vtt, .ass, atau .ssa'));
  }
});

app.post('/api/upload-subtitle', (req, res) => {
  subtitleUpload.single('subtitle')(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'Tidak ada file subtitle yang diupload' });

    const ext = path.extname(req.file.originalname).toLowerCase();
    const outName = `${path.basename(req.file.filename, path.extname(req.file.filename))}.vtt`;
    const outPath = path.join(UPLOAD_DIR, outName);

    try {
      if (ext === '.vtt') {
        fs.copyFileSync(req.file.path, outPath);
      } else if (ext === '.srt') {
        const raw = fs.readFileSync(req.file.path, 'utf-8');
        fs.writeFileSync(outPath, srtToVtt(raw));
      } else {
        // .ass / .ssa butuh ffmpeg untuk dikonversi (styling teks kompleks)
        await execFileAsync('ffmpeg', ['-y', '-i', req.file.path, '-c:s', 'webvtt', outPath]);
      }
      res.json({
        url: `/uploads/${outName}`,
        label: path.basename(req.file.originalname, ext)
      });
    } catch (e) {
      res.status(500).json({
        error: 'Gagal mengonversi file subtitle ini (format .ass/.ssa butuh ffmpeg terpasang di server).'
      });
    } finally {
      if (ext !== '.vtt') fs.unlink(req.file.path, () => {}); // simpan hasil .vtt saja
    }
  });
});

// ---------- Upload lampiran chat (foto/video) ----------
const chatUpload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB, cukup untuk foto & video pendek
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file gambar atau video yang diperbolehkan di chat'));
    }
  }
});

app.post('/api/chat-upload', (req, res) => {
  chatUpload.single('media')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'Tidak ada file yang diupload' });
    res.json({
      url: `/uploads/${req.file.filename}`,
      type: req.file.mimetype.startsWith('image/') ? 'image' : 'video',
      name: req.file.originalname
    });
  });
});

// ---------- Auto-detect video dari website lain (best-effort) ----------
app.post('/api/extract-video', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL wajib diisi' });

  try {
    const { data: html } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ProffnabillWatchParty/1.0)' },
      timeout: 10000
    });
    const $ = cheerio.load(html);

    // 1. Cek meta og:video
    let videoUrl =
      $('meta[property="og:video:url"]').attr('content') ||
      $('meta[property="og:video"]').attr('content');

    // 2. Cek tag <video src> atau <source src>
    if (!videoUrl) {
      videoUrl = $('video').attr('src') || $('video source').first().attr('src');
    }

    // 3. Cek kemungkinan link .m3u8 / .mp4 langsung di HTML (heuristik sederhana)
    if (!videoUrl) {
      const match = html.match(/https?:\/\/[^"'\s]+\.(mp4|m3u8|webm)(\?[^"'\s]*)?/i);
      if (match) videoUrl = match[0];
    }

    if (!videoUrl) {
      return res.json({
        found: false,
        message:
          'Video tidak dapat dideteksi otomatis dari halaman ini. Kemungkinan situs memakai proteksi/DRM atau video dimuat lewat script khusus. Coba gunakan opsi link video manual, atau gunakan fitur share tab/layar.'
      });
    }

    // Jika URL relatif, jadikan absolut
    if (videoUrl.startsWith('//')) videoUrl = 'https:' + videoUrl;
    else if (videoUrl.startsWith('/')) {
      const u = new URL(url);
      videoUrl = `${u.protocol}//${u.host}${videoUrl}`;
    }

    res.json({
      found: true,
      videoUrl,
      title: $('title').first().text() || url
    });
  } catch (err) {
    res.json({
      found: false,
      message:
        'Gagal mengakses halaman tersebut (mungkin diblokir CORS/robot, butuh login, atau situs down). Gunakan opsi link video manual atau fitur share tab/layar sebagai alternatif.'
    });
  }
});

// ---------- YouTube: browsing/pencarian video (seperti buka web YouTube) ----------
function mapYoutubeItems(items) {
  return items
    .map((item) => {
      const videoId = typeof item.id === 'string' ? item.id : item.id?.videoId;
      if (!videoId) return null;
      const snippet = item.snippet || {};
      const thumb =
        snippet.thumbnails?.medium?.url ||
        snippet.thumbnails?.high?.url ||
        snippet.thumbnails?.default?.url ||
        '';
      return {
        videoId,
        title: snippet.title || '(Tanpa judul)',
        channelTitle: snippet.channelTitle || '',
        thumbnail: thumb
      };
    })
    .filter(Boolean);
}

app.get('/api/youtube/search', async (req, res) => {
  if (!youtubeConfig.API_KEY) {
    return res.status(400).json({ error: 'YouTube Data API key belum diisi di youtube-config.js. Lihat README.' });
  }
  const q = (req.query.q || '').trim();
  if (!q) return res.status(400).json({ error: 'Query pencarian kosong.' });

  try {
    const { data } = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        key: youtubeConfig.API_KEY,
        part: 'snippet',
        type: 'video',
        maxResults: 16,
        q
      }
    });
    res.json({ items: mapYoutubeItems(data.items || []) });
  } catch (err) {
    const msg = err.response?.data?.error?.message || 'Gagal mencari video di YouTube.';
    res.status(500).json({ error: msg });
  }
});

app.get('/api/youtube/popular', async (req, res) => {
  if (!youtubeConfig.API_KEY) {
    return res.status(400).json({ error: 'YouTube Data API key belum diisi di youtube-config.js. Lihat README.' });
  }
  try {
    const { data } = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        key: youtubeConfig.API_KEY,
        part: 'snippet',
        chart: 'mostPopular',
        maxResults: 16,
        regionCode: req.query.region || 'ID'
      }
    });
    res.json({ items: mapYoutubeItems(data.items || []) });
  } catch (err) {
    const msg = err.response?.data?.error?.message || 'Gagal memuat video populer.';
    res.status(500).json({ error: msg });
  }
});

app.get('/api/check-ffmpeg', async (req, res) => {
  try {
    await execFileAsync('ffmpeg', ['-version']);
    await execFileAsync('ffprobe', ['-version']);
    res.json({ available: true });
  } catch (e) {
    res.json({ available: false });
  }
});

// ---------- Proxy streaming Google Drive ----------
// Supaya video Drive bisa disinkron persis seperti sumber "File Perangkat"
// (play/pause/seek Room Master ikut ke semua viewer), kita alirkan bytes video
// lewat server kita sendiri sebagai <video> biasa — bukan lewat iframe preview
// Google yang memang tidak punya API kontrol sama sekali.
//
// CATATAN TRADE-OFF: karena videonya di-relay lewat server kita, bandwidth
// server akan terpakai untuk setiap viewer yang menonton (bukan cuma Room Master).
// Untuk file yang sangat besar/banyak viewer, ini bisa cukup berat untuk server.
async function fetchDriveStream(fileId, range) {
  const baseUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
  const headers = {};
  if (range) headers.Range = range;

  const first = await axios.get(baseUrl, {
    responseType: 'stream',
    maxRedirects: 5,
    headers
  });

  const contentType = first.headers['content-type'] || '';
  if (!contentType.includes('text/html')) {
    return first; // File langsung ke-stream (biasanya file berukuran kecil)
  }

  // File besar -> Google mengirim halaman peringatan "virus scan", bukan videonya.
  // Ambil token konfirmasi dari HTML tersebut lalu ulangi request dengan token itu.
  let html = '';
  for await (const chunk of first.data) html += chunk.toString();

  const confirmMatch = html.match(/confirm=([0-9A-Za-z_-]+)/);
  const uuidMatch = html.match(/name="uuid" value="([0-9A-Za-z_-]+)"/);

  if (!confirmMatch) {
    throw new Error(
      'Video Drive tidak bisa diakses. Pastikan file sudah dibagikan sebagai "Anyone with the link can view".'
    );
  }

  let confirmUrl = `${baseUrl}&confirm=${confirmMatch[1]}`;
  if (uuidMatch) confirmUrl += `&uuid=${uuidMatch[1]}`;

  const setCookie = first.headers['set-cookie'];
  const cookieHeader = setCookie ? setCookie.map((c) => c.split(';')[0]).join('; ') : '';

  return axios.get(confirmUrl, {
    responseType: 'stream',
    maxRedirects: 5,
    headers: { ...headers, Cookie: cookieHeader }
  });
}

app.get('/api/drive-stream/:fileId', async (req, res) => {
  try {
    const driveRes = await fetchDriveStream(req.params.fileId, req.headers.range);
    res.status(driveRes.status === 206 ? 206 : 200);
    ['content-type', 'content-length', 'content-range', 'accept-ranges'].forEach((h) => {
      if (driveRes.headers[h]) res.setHeader(h, driveRes.headers[h]);
    });
    if (!driveRes.headers['accept-ranges']) res.setHeader('Accept-Ranges', 'bytes');
    driveRes.data.pipe(res);
  } catch (err) {
    res.status(502).json({
      error: err.message || 'Gagal mengambil video dari Google Drive.'
    });
  }
});

// ---------- Room management (in-memory) ----------
/**
 * rooms = {
 *   [roomId]: {
 *     roomName,
 *     masterSocketId,
 *     users: { [socketId]: { name } },
 *     videoSource: null | { type, url|videoId, title },
 *     playback: { isPlaying, currentTime, updatedAt },
 *     createdAt
 *   }
 * }
 */
const rooms = {};
const inviteTokens = {}; // token acak (untuk link undangan) -> roomId

function generateRoomId() {
  // Kode room pendek & mudah diketik, misal "AB12CD" (dipakai untuk join manual)
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateInviteToken() {
  // Token pendek acak khusus untuk link undangan (BEDA dari kode room),
  // supaya kode room tidak ikut ter-expose lewat URL yang dibagikan.
  return (Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 6)).toUpperCase();
}

function getPublicRoomState(room) {
  return {
    roomName: room.roomName,
    users: Object.values(room.users),
    videoSource: room.videoSource,
    playback: room.playback,
    inviteToken: room.inviteToken,
    queue: room.queue,
    voiceChatEnabled: room.voiceChatEnabled,
    voiceParticipants: Array.from(room.voiceParticipants || [])
  };
}

// ---------- Resolusi link undangan ----------
// Link undangan TIDAK memuat kode room secara langsung, melainkan token acak
// terpisah (uuid), supaya kode room tidak mudah ditebak/dibagikan tanpa sengaja
// lewat URL. Kode room pendek tetap ada khusus untuk yang mau join manual.
app.get('/api/resolve-invite/:token', (req, res) => {
  const roomId = inviteTokens[req.params.token];
  if (!roomId || !rooms[roomId]) {
    return res.status(404).json({ error: 'Link undangan tidak valid atau room sudah tidak aktif.' });
  }
  res.json({ roomId });
});

io.on('connection', (socket) => {
  let currentRoomId = null;

  socket.on('create-room', ({ name, roomName }, callback) => {
    const roomId = generateRoomId();
    let inviteToken = generateInviteToken();
    while (inviteTokens[inviteToken]) inviteToken = generateInviteToken(); // hindari tabrakan
    rooms[roomId] = {
      roomName: roomName || `Room ${roomId}`,
      masterSocketId: socket.id,
      users: { [socket.id]: { name: name || 'Room Master' } },
      videoSource: null,
      queue: [],
      playback: { isPlaying: false, currentTime: 0, updatedAt: Date.now() },
      createdAt: Date.now(),
      inviteToken,
      voiceChatEnabled: true,
      voiceParticipants: new Set()
    };
    inviteTokens[inviteToken] = roomId;
    currentRoomId = roomId;
    socket.join(roomId);
    callback({ success: true, roomId });
  });

  socket.on('join-room', ({ roomId, name }, callback) => {
    roomId = (roomId || '').toUpperCase().trim();
    const room = rooms[roomId];
    if (!room) {
      return callback({ success: false, message: 'Room tidak ditemukan. Cek kembali kode room.' });
    }
    currentRoomId = roomId;
    room.users[socket.id] = { name: name || 'Guest' };
    socket.join(roomId);

    callback({
      success: true,
      roomId,
      isMaster: room.masterSocketId === socket.id,
      state: getPublicRoomState(room)
    });

    socket.to(roomId).emit('user-joined', { name: room.users[socket.id].name });
    io.to(roomId).emit('user-list', Object.values(room.users));
  });

  // Kalau sedang ada video berjalan, video baru yang dipilih Room Master masuk
  // ANTRIAN dulu (tidak langsung ganti) — baru diputar otomatis setelah video
  // yang sekarang selesai (lihat event 'video-ended').
  socket.on('set-video-source', ({ roomId, source }) => {
    const room = rooms[roomId];
    if (!room || room.masterSocketId !== socket.id) return; // hanya master
    if (room.videoSource) {
      room.queue.push(source);
      io.to(roomId).emit('queue-updated', room.queue);
    } else {
      room.videoSource = source;
      room.playback = { isPlaying: false, currentTime: 0, updatedAt: Date.now() };
      io.to(roomId).emit('video-source-changed', room.videoSource);
    }
  });

  function advanceQueue(room, roomId) {
    if (room.queue.length > 0) {
      room.videoSource = room.queue.shift();
      room.playback = { isPlaying: false, currentTime: 0, updatedAt: Date.now() };
      io.to(roomId).emit('video-source-changed', room.videoSource);
      io.to(roomId).emit('queue-updated', room.queue);
    } else {
      room.videoSource = null;
      room.playback = { isPlaying: false, currentTime: 0, updatedAt: Date.now() };
      io.to(roomId).emit('video-source-changed', null);
    }
  }

  // Dikirim oleh client Room Master saat video yang sedang diputar benar-benar
  // selesai (event 'ended'), untuk memicu lanjut ke antrian berikutnya.
  socket.on('video-ended', ({ roomId }) => {
    const room = rooms[roomId];
    if (!room || room.masterSocketId !== socket.id) return;
    advanceQueue(room, roomId);
  });

  // Master menghapus salah satu item di antrian
  socket.on('queue-remove', ({ roomId, index }) => {
    const room = rooms[roomId];
    if (!room || room.masterSocketId !== socket.id) return;
    if (index >= 0 && index < room.queue.length) {
      room.queue.splice(index, 1);
      io.to(roomId).emit('queue-updated', room.queue);
    }
  });

  // Master memutar salah satu item antrian sekarang juga, melewati antrian (skip video berjalan)
  socket.on('queue-play-now', ({ roomId, index }) => {
    const room = rooms[roomId];
    if (!room || room.masterSocketId !== socket.id) return;
    if (index >= 0 && index < room.queue.length) {
      const [chosen] = room.queue.splice(index, 1);
      room.videoSource = chosen;
      room.playback = { isPlaying: false, currentTime: 0, updatedAt: Date.now() };
      io.to(roomId).emit('video-source-changed', room.videoSource);
      io.to(roomId).emit('queue-updated', room.queue);
    }
  });

  socket.on('playback-control', ({ roomId, action, time }) => {
    const room = rooms[roomId];
    if (!room || room.masterSocketId !== socket.id) return; // hanya master boleh kontrol
    if (action === 'play') {
      room.playback = { isPlaying: true, currentTime: time, updatedAt: Date.now() };
    } else if (action === 'pause') {
      room.playback = { isPlaying: false, currentTime: time, updatedAt: Date.now() };
    } else if (action === 'seek') {
      room.playback = { ...room.playback, currentTime: time, updatedAt: Date.now() };
    }
    socket.to(roomId).emit('playback-update', { action, time, updatedAt: room.playback.updatedAt });
  });

  // Heartbeat sinkronisasi berkala dari master, agar viewer yang drift bisa dikoreksi
  socket.on('playback-heartbeat', ({ roomId, time, isPlaying }) => {
    const room = rooms[roomId];
    if (!room || room.masterSocketId !== socket.id) return;
    room.playback = { isPlaying, currentTime: time, updatedAt: Date.now() };
    socket.to(roomId).emit('playback-sync', room.playback);
  });

  // ---------- Reaksi emoji ----------
  socket.on('reaction', ({ roomId, emoji }) => {
    const room = rooms[roomId];
    if (!room) return;
    const user = room.users[socket.id];
    if (!user) return;
    const allowedEmojis = ['👍', '❤️', '😂', '😮', '🔥'];
    if (!allowedEmojis.includes(emoji)) return;
    io.to(roomId).emit('reaction', { emoji, name: user.name });
  });

  // ---------- Voice chat (mesh WebRTC, Room Master bisa aktif/nonaktifkan) ----------
  socket.on('toggle-voice-chat', ({ roomId, enabled }) => {
    const room = rooms[roomId];
    if (!room || room.masterSocketId !== socket.id) return;
    room.voiceChatEnabled = !!enabled;
    if (!room.voiceChatEnabled) {
      // Voice chat dimatikan -> keluarkan semua partisipan voice yang sedang aktif
      room.voiceParticipants.clear();
    }
    io.to(roomId).emit('voice-chat-toggled', {
      enabled: room.voiceChatEnabled,
      participants: Array.from(room.voiceParticipants)
    });
  });

  socket.on('voice-join', ({ roomId }) => {
    const room = rooms[roomId];
    if (!room || !room.voiceChatEnabled) return;
    const user = room.users[socket.id];
    if (!user) return;

    // Beri tahu partisipan voice yang sudah ada supaya mereka membuat koneksi baru ke socket ini
    room.voiceParticipants.forEach((existingId) => {
      io.to(existingId).emit('voice-peer-joined', { socketId: socket.id, name: user.name });
    });

    room.voiceParticipants.add(socket.id);
    socket.emit('voice-existing-participants', {
      participants: Array.from(room.voiceParticipants).filter((id) => id !== socket.id)
    });
    io.to(roomId).emit('voice-participants-updated', Array.from(room.voiceParticipants));
  });

  socket.on('voice-leave', ({ roomId }) => {
    const room = rooms[roomId];
    if (!room) return;
    room.voiceParticipants.delete(socket.id);
    io.to(roomId).emit('voice-peer-left', { socketId: socket.id });
    io.to(roomId).emit('voice-participants-updated', Array.from(room.voiceParticipants));
  });

  // Relay sinyal WebRTC (offer/answer/ICE candidate) apa adanya ke socket tujuan
  socket.on('voice-signal', ({ targetSocketId, data }) => {
    io.to(targetSocketId).emit('voice-signal', { fromSocketId: socket.id, data });
  });

  socket.on('chat-message', ({ roomId, message, attachment }) => {
    const room = rooms[roomId];
    if (!room) return;
    const user = room.users[socket.id];
    if (!user) return;

    let safeAttachment = null;
    if (attachment && typeof attachment.url === 'string' && ['image', 'video'].includes(attachment.type)) {
      // Hanya izinkan URL lampiran yang berasal dari folder upload kita sendiri
      if (attachment.url.startsWith('/uploads/')) {
        safeAttachment = { url: attachment.url, type: attachment.type };
      }
    }

    if (!String(message || '').trim() && !safeAttachment) return; // jangan kirim pesan kosong

    io.to(roomId).emit('chat-message', {
      name: user.name,
      message: String(message || '').slice(0, 1000),
      attachment: safeAttachment,
      isMaster: room.masterSocketId === socket.id,
      time: Date.now()
    });
  });

  socket.on('disconnect', () => {
    if (!currentRoomId) return;
    const room = rooms[currentRoomId];
    if (!room) return;

    if (room.voiceParticipants.delete(socket.id)) {
      io.to(currentRoomId).emit('voice-peer-left', { socketId: socket.id });
      io.to(currentRoomId).emit('voice-participants-updated', Array.from(room.voiceParticipants));
    }

    const leavingUser = room.users[socket.id];
    delete room.users[socket.id];

    if (Object.keys(room.users).length === 0) {
      // Room kosong, hapus room beserta token undangannya
      delete inviteTokens[room.inviteToken];
      delete rooms[currentRoomId];
      return;
    }

    if (room.masterSocketId === socket.id) {
      // Master keluar -> limpahkan ke user berikutnya yang tersisa
      const nextMasterId = Object.keys(room.users)[0];
      room.masterSocketId = nextMasterId;
      io.to(currentRoomId).emit('master-changed', {
        newMasterName: room.users[nextMasterId].name
      });
    }

    if (leavingUser) {
      io.to(currentRoomId).emit('user-left', { name: leavingUser.name });
    }
    io.to(currentRoomId).emit('user-list', Object.values(room.users));
  });
});

server.listen(PORT, () => {
  console.log(`PROFFNABILL WATCH PARTY berjalan di http://localhost:${PORT}`);
});
