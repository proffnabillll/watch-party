/**
 * Isi CLIENT_ID dan API_KEY dengan kredensial dari Google Cloud Console kamu
 * agar fitur "Login & Pilih dari Google Drive" (Google Picker) aktif.
 * Panduan lengkap ada di README.md bagian "Setup Google Drive".
 *
 * Jika dikosongkan, fitur login Drive Picker akan nonaktif, tapi
 * user tetap bisa memakai opsi "Muat dari Link Manual".
 */
const DRIVE_CONFIG = {
  CLIENT_ID: '550107704679-l209jtpeqdr2por0h41vkvht6a462442.apps.googleusercontent.com', // contoh: ''
  API_KEY: 'AIzaSyAF-qJk_qeRn7FouvapXcT6HZL_OKZKX4A',   // contoh: ''
  APP_ID: 'gen-lang-client-0773510756'     // Project number dari Google Cloud Console
};
