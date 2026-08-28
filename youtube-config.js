/**
 * Isi API_KEY dengan YouTube Data API v3 key dari Google Cloud Console
 * agar fitur "cari & pilih video" (seperti membuka YouTube langsung di dalam room)
 * bisa berfungsi. Panduan lengkap ada di README.md bagian "Setup YouTube Data API".
 *
 * File ini di-require langsung oleh server.js (BUKAN dikirim ke browser),
 * jadi API key kamu tetap aman di sisi server.
 */
module.exports = {
  API_KEY: 'AIzaSyCWBEEHop-U_frcKgn31dwKpDWrCST8ju4' // contoh: 'AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
};
