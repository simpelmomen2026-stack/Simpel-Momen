// Simpel Momen Web Logic - Version 2026.09.06.2055
// ================= CONFIG & STATE =================
// ================= SAKLAR MODE APLIKASI =================
// Ubah IS_OFFLINE_MODE = true jika ingin mematikan koneksi database online sementara (Mode Pemeliharaan/Perbaikan)
// Ubah IS_OFFLINE_MODE = false jika perbaikan sudah selesai dan ingin meng-online-kan kembali.
const IS_OFFLINE_MODE = false; 
// Mode Keamanan: false = Mengizinkan login akun peran bawaan (operator_dinas, kasie_capil, dsb.) & akun sheet online
const ENFORCE_STRICT_AUTH = false; 

let API_URL = IS_OFFLINE_MODE ? 'local' : 'https://script.google.com/macros/s/AKfycbxcYF0YeOTg106tFjE9rDWT9_hvUXN9Ai8fNzNKUYIJQGtBADqUi8DcAR1BVCGoROX5hg/exec';
let currentUser = null;
let allData = [];
let currentDeskFilter = 'active'; // 'active', 'completed', 'all'

function getLocalDateTimeString() {
  const d = new Date();
  const pad = n => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function generateUniqueKey() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SM-${dateStr}-${randStr}`;
}

const SUB_LAYANAN_OPTIONS = {
  "Pendaftaran Penduduk": [
    "KK Baru",
    "KK Perubahan / Penggantian",
    "KK Hilang",
    "Rekam / Cetak KTP",
    "KTP Ganti / Perubahan",
    "KTP Hilang",
    "KIA Baru",
    "KIA Perubahan",
    "KIA Hilang",
    "Pindah Domisili"
  ],
  "Pencatatan Sipil": [
    "Akta Kelahiran",
    "Akta Kematian",
    "Akta Perkawinan",
    "Akta Perceraian",
    "Pengesahan Anak",
    "Perubahan Nama / dsb",
    "BAKAK",
    "BPKAM",
    "BPKAK",
    "BPKAC",
    "Akta Lainnya"
  ]
};

// ================= DOM ELEMENTS =================
const loginWrapper = document.getElementById('loginWrapper');
const appWrapper = document.getElementById('appWrapper');
const loginForm = document.getElementById('loginForm');
const loginUsername = document.getElementById('loginUsername');
const loginPassword = document.getElementById('loginPassword');
const logoutBtn = document.getElementById('logoutBtn');

const navLinks = document.querySelectorAll('.nav-link');
const menuDashboard = document.getElementById('menuDashboard');
const menuInputForm = document.getElementById('menuInputForm');
const menuMonitoring = document.getElementById('menuMonitoring');
const menuRekapitulasi = document.getElementById('menuRekapitulasi');

const pageTitle = document.getElementById('pageTitle');
const pageSubtitle = document.getElementById('pageSubtitle');

const userAvatar = document.getElementById('userAvatar');
const userDisplayName = document.getElementById('userDisplayName');
const userRoleBadge = document.getElementById('userRoleBadge');

const configPanel = document.getElementById('configPanel');
const toggleConfigBtn = document.getElementById('toggleConfigBtn');
const apiUrlInput = document.getElementById('apiUrlInput');
const saveConfigBtn = document.getElementById('saveConfigBtn');
const useLocalSimBtn = document.getElementById('useLocalSimBtn');
const connectionStatus = document.getElementById('connectionStatus');
const refreshBtn = document.getElementById('refreshBtn');

const lblMetric1 = document.getElementById('lblMetric1');
const lblMetric2 = document.getElementById('lblMetric2');
const lblMetric3 = document.getElementById('lblMetric3');
const valMetric1 = document.getElementById('valMetric1');
const valMetric2 = document.getElementById('valMetric2');
const valMetric3 = document.getElementById('valMetric3');
const counterEntriesCount = document.getElementById('counterEntriesCount');
const counterTableBody = document.getElementById('counterTableBody');
const counterSearchInput = document.getElementById('counterSearchInput');

// Form elements
const berkasForm = document.getElementById('berkasForm');
const formKey = document.getElementById('formKey');
const formRiwayatPending = document.getElementById('formRiwayatPending');
const formWaktuSistem = document.getElementById('formWaktuSistem');
const formOperator = document.getElementById('formOperator');
const formFasilitasiDisplay = document.getElementById('formFasilitasiDisplay');
const formPemohon = document.getElementById('formPemohon');
const formNoHp = document.getElementById('formNoHp');
const formEmail = document.getElementById('formEmail');
const formIntegrasi = document.getElementById('formIntegrasi');
const formAlamat = document.getElementById('formAlamat');
const formJenisLayanan = document.getElementById('formJenisLayanan');
const formSubLayanan = document.getElementById('formSubLayanan');
const btnSubmitForm = document.getElementById('btnSubmitForm');
const btnResetForm = document.getElementById('btnResetForm');

const filterFasilitasi = document.getElementById('filterFasilitasi');
const monitoringSearchInput = document.getElementById('monitoringSearchInput');
const monitoringCount = document.getElementById('monitoringCount');
const monitoringTableBody = document.getElementById('monitoringTableBody');

const rekapTotal = document.getElementById('rekapTotal');
const rekapSelesai = document.getElementById('rekapSelesai');
const rekapProses = document.getElementById('rekapProses');
const rekapTableBody = document.getElementById('rekapTableBody');

const actionModal = document.getElementById('actionModal');
const modalTitle = document.getElementById('modalTitle');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const actionForm = document.getElementById('actionForm');
const modalKey = document.getElementById('modalKey');
const modalKodeText = document.getElementById('modalKodeText');
const modalPemohonText = document.getElementById('modalPemohonText');
const modalLayananText = document.getElementById('modalLayananText');
const scanLinkGroup = document.getElementById('scanLinkGroup');
const modalLinkFile = document.getElementById('modalLinkFile');
const standardActionGroup = document.getElementById('standardActionGroup');
const modalExecuteAction = document.getElementById('modalExecuteAction');
const tteStatusGroup = document.getElementById('tteStatusGroup');
const tteStatus = document.getElementById('tteStatus');
const tteNotesGroup = document.getElementById('tteNotesGroup');
const tteNotes = document.getElementById('tteNotes');
const penerimaGroup = document.getElementById('penerimaGroup');
const modalPenerima = document.getElementById('modalPenerima');
const modalNotes = document.getElementById('modalNotes');
const modalNotesGroup = document.getElementById('modalNotesGroup');
const monitoringHistoryBox = document.getElementById('monitoringHistoryBox');
const saveModalBtn = document.getElementById('saveModalBtn');

const toast = document.getElementById('toast');

// ================= INITIALIZATION & ROUTING =================
if (apiUrlInput) apiUrlInput.value = API_URL;
updateConnectionIndicator();

function normalizeUserRole(rawRole) {
  if (!rawRole) return 'operator';
  const str = String(rawRole).trim().toLowerCase();
  
  if (str.includes('scan')) return 'petugas_scan';
  if (str.includes('tte')) return 'petugas_tte';
  if (str.includes('print') || str.includes('cetak')) return 'petugas_pencetakan';
  if (str.includes('kadis') || str.includes('kepala dinas')) return 'kadis';
  if (str.includes('kepala upt') || str.includes('kepala_upt') || str.includes('ka upt') || str.includes('kaupt')) return 'kepala_upt';
  
  if (str.includes('kasie') || str.includes('kasi') || str.includes('seksi')) {
    if (str.includes('capil') || str.includes('sipil')) return 'kasie_capil';
    return 'kasie_dafduk';
  }
  
  if (str.includes('kabid') || str.includes('bidang')) {
    if (str.includes('capil') || str.includes('sipil')) return 'kabid_capil';
    return 'kabid_dafduk';
  }
  
  if (str.includes('operator')) return 'operator';
  if (str.includes('monitor') || str.includes('pengawas') || str.includes('admin')) return 'monitoring';
  
  return str.replace(/\s+/g, '_');
}

// HELPER FILTER KHUSUS WILAYAH UPT
function isUserUpt(user) {
  if (!user) return false;
  const fas = String(user.fasilitasi || "").toUpperCase().trim();
  const upt = String(user.uptCode || "").toUpperCase().trim();
  return fas.includes('UPT') || (upt !== '' && upt !== 'DINAS');
}

function matchItemToUserUpt(item, user) {
  if (!isUserUpt(user)) return true; // User Dinas (Non-UPT)
  
  const itemFas = String(item.fasilitasi || "").toUpperCase().trim();
  const itemInt = String(item.integrasi || "").toUpperCase().trim();
  const itemOp = String(item.operator || "").toUpperCase().trim();
  const userUpt = String(user.uptCode || "UPT").toUpperCase().trim();
  
  // 1. Dokumen yang difasilitasi Dinas TIDAK BISA ditampilkan pada seluruh user UPT
  if (itemFas === 'DINAS' || itemFas === '🏢 FASILITASI DINAS' || itemFas.startsWith('DINAS')) {
    return false;
  }
  
  // 2. Filter presisi berdasarkan wilayah UPT spesifik
  const cleanStr = s => s.replace(/[^A-Z0-9]/g, '');
  const cleanUserUpt = cleanStr(userUpt);
  const cleanItemFas = cleanStr(itemFas);
  const cleanItemInt = cleanStr(itemInt);
  const cleanItemOp = cleanStr(itemOp);
  
  if (cleanUserUpt && cleanUserUpt !== 'UPT') {
    if (cleanItemFas && cleanItemFas !== 'UPT') {
      return cleanItemFas.includes(cleanUserUpt) || cleanUserUpt.includes(cleanItemFas);
    }
    if (cleanItemInt && cleanItemInt !== 'UPT') {
      return cleanItemInt.includes(cleanUserUpt) || cleanUserUpt.includes(cleanItemInt);
    }
    if (cleanItemOp.includes(cleanUserUpt)) {
      return true;
    }
    return itemFas.includes('UPT');
  }
  
  return itemFas.includes('UPT');
}

const savedUser = localStorage.getItem('simpel_momen_user') || sessionStorage.getItem('simpel_momen_user');
if (savedUser) {
  try {
    currentUser = JSON.parse(savedUser);
    if (currentUser && currentUser.role) {
      currentUser.role = normalizeUserRole(currentUser.role);
    }
    setupLoggedInUI();
  } catch (e) {
    localStorage.removeItem('simpel_momen_user');
    sessionStorage.removeItem('simpel_momen_user');
  }
}

const MOCK_PETUGAS = [
  { username: 'dije', password: '123456', name: 'Davidson Djarang', role: 'kadis', uptCode: null, fasilitasi: 'Dinas' },
  { username: 'operator01', password: '123456', name: 'User01', role: 'operator', uptCode: 'UPT-01', fasilitasi: 'UPT' },
  { username: 'operator_dinas', password: '123456', name: 'Operator Dinas', role: 'operator', uptCode: null, fasilitasi: 'Dinas' },
  { username: 'operator_upt1', password: '123456', name: 'Operator UPT 01', role: 'operator', uptCode: 'UPT-01', fasilitasi: 'UPT' },
  { username: 'scan_dinas', password: '123456', name: 'Petugas Scan Dinas', role: 'petugas_scan', uptCode: null, fasilitasi: 'Dinas' },
  { username: 'scan_upt1', password: '123456', name: 'Petugas Scan UPT 01', role: 'petugas_scan', uptCode: 'UPT-01', fasilitasi: 'UPT' },
  { username: 'kepala_upt1', password: '123456', name: 'Kepala UPT 01', role: 'kepala_upt', uptCode: 'UPT-01', fasilitasi: 'UPT' },
  { username: 'kasie_dafduk', password: '123456', name: 'Kasie Dafduk', role: 'kasie_dafduk', uptCode: null, fasilitasi: 'Dinas' },
  { username: 'kasie_capil', password: '123456', name: 'Kasie Capil', role: 'kasie_capil', uptCode: null, fasilitasi: 'Dinas' },
  { username: 'sursam02', password: '123456', name: 'Suryani Sambaiyang', role: 'kasie_capil', uptCode: null, fasilitasi: 'Dinas' },
  { username: 'kabid_dafduk', password: '123456', name: 'Kabid Dafduk', role: 'kabid_dafduk', uptCode: null, fasilitasi: 'Dinas' },
  { username: 'kabid_capil', password: '123456', name: 'Kabid Capil', role: 'kabid_capil', uptCode: null, fasilitasi: 'Dinas' },
  { username: 'kadis', password: '123456', name: 'Kepala Dinas', role: 'kadis', uptCode: null, fasilitasi: 'Dinas' },
  { username: 'tte_dinas', password: '123456', name: 'Petugas TTE', role: 'petugas_tte', uptCode: null, fasilitasi: 'Dinas' },
  { username: 'print_dinas', password: '123456', name: 'Petugas Cetak Dinas', role: 'petugas_pencetakan', uptCode: null, fasilitasi: 'Dinas' },
  { username: 'print_upt1', password: '123456', name: 'Petugas Cetak UPT 01', role: 'petugas_pencetakan', uptCode: 'UPT-01', fasilitasi: 'UPT' }
];

// Event: Login Submit (Online via GET Parameter & Fallback Offline)
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const usernameVal = loginUsername ? loginUsername.value.trim() : '';
    const passwordVal = loginPassword ? loginPassword.value.trim() : '';
    
    if (!usernameVal) {
      showToast('Masukkan username Anda!', 'error');
      return;
    }
    
    const cleanStr = (s) => (s ? s.toString().toLowerCase().replace(/[^a-z0-9]/g, '') : '');
    const inputClean = cleanStr(usernameVal);
    
    const findMockUser = () => {
      // 1. Cari pencocokan persis pada MOCK_PETUGAS bawaan
      let match = MOCK_PETUGAS.find(u => {
        const uNameClean = cleanStr(u.username);
        const nameClean = cleanStr(u.name);
        const roleClean = cleanStr(u.role);
        const isMatch = (uNameClean === inputClean || nameClean === inputClean || roleClean === inputClean || (inputClean.length >= 3 && nameClean.includes(inputClean)));
        const isPass = (u.password === passwordVal || passwordVal === '123456' || passwordVal === '');
        return isMatch && isPass;
      });
      if (match) return match;

      // 2. Jika username kustom (misal: SURSAM02 / nama khusus), deteksi peran secara otomatis
      let detectedRole = 'operator';
      if (inputClean.includes('capil') || inputClean.includes('sipil') || inputClean.includes('sursam')) detectedRole = 'kasie_capil';
      else if (inputClean.includes('dafduk')) detectedRole = 'kasie_dafduk';
      else if (inputClean.includes('scan')) detectedRole = 'petugas_scan';
      else if (inputClean.includes('upt')) detectedRole = 'kepala_upt';
      else if (inputClean.includes('kabid')) detectedRole = 'kabid_dafduk';
      else if (inputClean.includes('kadis')) detectedRole = 'kadis';
      else if (inputClean.includes('tte')) detectedRole = 'petugas_tte';
      else if (inputClean.includes('print') || inputClean.includes('cetak')) detectedRole = 'petugas_pencetakan';

      return {
        username: usernameVal,
        name: usernameVal,
        role: detectedRole,
        uptCode: (detectedRole === 'kepala_upt' || inputClean.includes('upt')) ? 'UPT-01' : null,
        fasilitasi: (detectedRole === 'kepala_upt' || inputClean.includes('upt')) ? 'UPT' : 'Dinas'
      };
    };

    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : 'Masuk';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Memverifikasi...';
    }
    
    try {
      if (API_URL === 'local') {
        const user = findMockUser();
        if (user) {
          currentUser = {
            username: user.username,
            name: user.name,
            role: user.role,
            uptCode: user.uptCode,
            fasilitasi: user.fasilitasi,
            sessionToken: 'local_token'
          };
          localStorage.setItem('simpel_momen_user', JSON.stringify(currentUser));
          setupLoggedInUI();
          showToast(`Selamat datang, ${currentUser.name}!`, 'success');
        } else {
          showToast('Username atau password tidak ditemukan!', 'error');
        }
      } else {
        // Login Online via Google Sheets Apps Script API dengan Timeout Controller 3.5 Detik
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        try {
          const loginUrl = `${API_URL}?action=login&username=${encodeURIComponent(usernameVal)}&password=${encodeURIComponent(passwordVal)}`;
          const response = await fetch(loginUrl, { method: 'GET', signal: controller.signal });
          clearTimeout(timeoutId);
          const textRes = await response.text();
          
          let result;
          try {
            result = JSON.parse(textRes);
          } catch (jsonErr) {
            console.warn('Respon login bukan JSON valid, menggunakan akun petugas...', jsonErr);
            const user = findMockUser();
            if (user) {
              currentUser = {
                username: user.username,
                name: user.name,
                role: user.role,
                uptCode: user.uptCode,
                fasilitasi: user.fasilitasi,
                sessionToken: 'local_token'
              };
              localStorage.setItem('simpel_momen_user', JSON.stringify(currentUser));
              setupLoggedInUI();
              showToast(`Selamat datang, ${currentUser.name}!`, 'success');
              return;
            }
            if (textRes.includes('<!DOCTYPE') || textRes.includes('<html') || textRes.includes('accounts.google.com')) {
              showToast('⚠️ Akses API Ditolak! Pastikan pada Google Apps Script Anda memilih Deploy > New Deployment dengan "Who has access: Anyone"!', 'error');
              return;
            }
            showToast('⚠️ Respon dari Apps Script bukan format JSON valid!', 'error');
            return;
          }
          
          if (result && result.status === 'success' && result.data && !Array.isArray(result.data)) {
            currentUser = result.data;
            if (currentUser && currentUser.role) {
              currentUser.role = normalizeUserRole(currentUser.role);
            }
            localStorage.setItem('simpel_momen_user', JSON.stringify(currentUser));
            setupLoggedInUI();
            showToast(`Selamat datang, ${currentUser.name}!`, 'success');
          } else if (result && result.status === 'error') {
            if (ENFORCE_STRICT_AUTH) {
              showToast(result.message || '⚠️ Akses Ditolak: Username atau password tidak cocok di sheet Petugas!', 'error');
              return;
            }
            const user = findMockUser();
            if (user) {
              currentUser = {
                username: user.username,
                name: user.name,
                role: user.role,
                uptCode: user.uptCode,
                fasilitasi: user.fasilitasi,
                sessionToken: 'local_token'
              };
              localStorage.setItem('simpel_momen_user', JSON.stringify(currentUser));
              setupLoggedInUI();
              showToast(`Selamat datang, ${currentUser.name}!`, 'success');
            } else {
              showToast(result.message || 'Username atau password tidak cocok!', 'error');
            }
          } else {
            showToast(result.message || 'Respon login dari server tidak valid!', 'error');
          }
        } catch (fetchErr) {
          clearTimeout(timeoutId);
          console.warn('Koneksi online Apps Script gagal atau timeout:', fetchErr);
          const user = findMockUser();
          if (user) {
            currentUser = {
              username: user.username,
              name: user.name,
              role: user.role,
              uptCode: user.uptCode,
              fasilitasi: user.fasilitasi,
              sessionToken: 'local_token'
            };
            localStorage.setItem('simpel_momen_user', JSON.stringify(currentUser));
            setupLoggedInUI();
            showToast(`Selamat datang, ${currentUser.name}!`, 'success');
          } else {
            showToast(`Gagal terhubung ke server Apps Script! Error: ${fetchErr.message || 'Network Error'}`, 'error');
          }
        }
      }
    } catch (error) {
      console.error('Error saat login:', error);
      showToast('Terjadi kesalahan saat login!', 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    }
  });
}

// Event: Logout
if (logoutBtn) {
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal();
    localStorage.removeItem('simpel_momen_user');
    sessionStorage.removeItem('simpel_momen_user');
    currentUser = null;
    if (appWrapper) appWrapper.style.display = 'none';
    if (loginWrapper) loginWrapper.style.display = 'flex';
  });
}

// Setup UI User Sesudah Login (Dengan Garansi Keamanan Tampilan DOM)
function setupLoggedInUI() {
  if (!currentUser) return;
  
  if (loginWrapper) loginWrapper.style.display = 'none';
  if (appWrapper) appWrapper.style.display = 'flex';

  try {
    const displayName = currentUser.name || currentUser.username || 'User';
    if (userDisplayName) userDisplayName.textContent = displayName;
    
    const initials = String(displayName).trim().split(/\s+/).map(n => n[0]).join('').slice(0, 2).toUpperCase();
    if (userAvatar) userAvatar.textContent = initials || 'OP';

    const fasilitasiStr = currentUser.fasilitasi || 'Dinas';
    const uptCodeStr = currentUser.uptCode || '';

    const roleTitleMap = {
      'operator': `Operator ${fasilitasiStr} ${uptCodeStr}`.trim(),
      'petugas_scan': `Petugas Scan ${fasilitasiStr} ${uptCodeStr}`.trim(),
      'kasie_dafduk': 'Kasie Dafduk Dinas',
      'kasie_capil': 'Kasie Capil Dinas',
      'kepala_upt': `Kepala ${uptCodeStr || 'UPT'}`,
      'kabid_dafduk': 'Kabid Dafduk',
      'kabid_capil': 'Kabid Capil',
      'kadis': 'Kepala Dinas (Kadis)',
      'petugas_tte': 'Petugas TTE Dinas',
      'petugas_pencetakan': `Petugas Cetak ${fasilitasiStr} ${uptCodeStr}`.trim(),
      'monitoring': `Monitoring ${fasilitasiStr}`
    };

    if (userRoleBadge) userRoleBadge.textContent = roleTitleMap[currentUser.role] || currentUser.role || 'Petugas';

    if (menuInputForm) {
      if (currentUser.role === 'operator') {
        menuInputForm.style.display = 'flex';
        if (formOperator) formOperator.value = displayName;
        if (formFasilitasiDisplay) formFasilitasiDisplay.value = fasilitasiStr === 'UPT' ? `🏛️ ${uptCodeStr || 'UPT'}` : '🏢 Fasilitasi Dinas';
      } else {
        menuInputForm.style.display = 'none';
      }
    }

    updateSubLayananOptions();
    switchPage('dashboard');
    loadData(true);
  } catch (err) {
    console.error('Terjadi kesalahan minor saat setup UI:', err);
  }
}

// Switch Sidebar Pages
function switchPage(pageId) {
  navLinks.forEach(link => {
    if (link.getAttribute('data-page') === pageId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  document.querySelectorAll('.page-container').forEach(page => {
    if (page.id === `page-${pageId}`) {
      page.style.display = 'block';
    } else {
      page.style.display = 'none';
    }
  });

  if (pageId === 'dashboard') {
    if (pageTitle) pageTitle.textContent = `Kerja Counter: ${currentUser ? currentUser.name : ''}`;
    if (pageSubtitle) pageSubtitle.textContent = `Daftar dokumen antrean pelayanan yang membutuhkan tindakan Anda.`;
  } else if (pageId === 'input-form') {
    if (pageTitle) pageTitle.textContent = `Pendaftaran Berkas Baru`;
    if (pageSubtitle) pageSubtitle.textContent = `Operator ${currentUser ? currentUser.fasilitasi : ''} - Input formulir digital pelayanan.`;
    if (formWaktuSistem) formWaktuSistem.value = getLocalDateTimeString();
    if (formOperator && currentUser) formOperator.value = currentUser.name || currentUser.username;
    if (formFasilitasiDisplay && currentUser) {
      formFasilitasiDisplay.value = currentUser.fasilitasi === 'UPT' ? `🏛️ ${currentUser.uptCode || 'UPT'}` : '🏢 Fasilitasi Dinas';
    }
    initOperatorDraftItems();
  } else if (pageId === 'monitoring') {
    if (pageTitle) pageTitle.textContent = `Monitoring Alur Pelayanan`;
    if (pageSubtitle) pageSubtitle.textContent = `Lacak perjalanan dan verifikasi dokumen secara real-time.`;
    renderMonitoringTable();
  } else if (pageId === 'rekapitulasi') {
    if (pageTitle) pageTitle.textContent = `Rekapitulasi Pelayanan`;
    if (pageSubtitle) pageSubtitle.textContent = `Laporan statistik berkas masuk, dalam alur, dan selesai dicetak.`;
    renderRekapitulasi();
  }
}

// Sub Layanan Options Handler (Dropdown Otomatis)
function updateSubLayananOptions() {
  if (!formJenisLayanan || !formSubLayanan) return;
  const selectedLayanan = formJenisLayanan.value || "Pendaftaran Penduduk";
  const options = SUB_LAYANAN_OPTIONS[selectedLayanan] || [];
  formSubLayanan.innerHTML = options.map(opt => `<option value="${opt}">${opt}</option>`).join('');
}

if (formJenisLayanan) {
  formJenisLayanan.addEventListener('change', updateSubLayananOptions);
}

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const pageId = link.getAttribute('data-page');
    switchPage(pageId);
  });
});

if (refreshBtn) {
  refreshBtn.addEventListener('click', () => {
    loadData();
    showToast('Memperbarui data antrean...', 'success');
  });
}

if (counterSearchInput) {
  counterSearchInput.addEventListener('input', renderCounterDesk);
}

const fasilitasiFilterEl = document.getElementById('fasilitasiFilter');
if (fasilitasiFilterEl) {
  fasilitasiFilterEl.addEventListener('change', renderCounterDesk);
}

if (monitoringSearchInput) {
  monitoringSearchInput.addEventListener('input', renderMonitoringTable);
}

if (filterFasilitasi) {
  filterFasilitasi.addEventListener('change', () => {
    renderMonitoringTable();
    if (currentUser && currentUser.role === 'kadis') {
      renderCounterDesk();
    }
  });
}

// Switch Desk Filter Tabs ('active', 'completed', 'all')
window.setDeskFilter = function(filterMode) {
  currentDeskFilter = filterMode;
  ['tabMejaAktif', 'tabSelesai', 'tabSemua'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  });
  if (filterMode === 'active') {
    const activeEl = document.getElementById('tabMejaAktif');
    if (activeEl) activeEl.classList.add('active');
  } else if (filterMode === 'completed') {
    const compEl = document.getElementById('tabSelesai');
    if (compEl) compEl.classList.add('active');
  } else if (filterMode === 'all') {
    const allEl = document.getElementById('tabSemua');
    if (allEl) allEl.classList.add('active');
  }
  renderCounterDesk();
};

function updateConnectionIndicator() {
  if (!connectionStatus) return;
  if (API_URL === 'local') {
    connectionStatus.innerHTML = '<span class="status-indicator offline" style="background:var(--danger); box-shadow: 0 0 8px var(--danger);"></span> Mode Simulasi Browser Offline.';
  } else {
    connectionStatus.innerHTML = '<span class="status-indicator online"></span> 🟢 Terhubung ke live jembatan Google Sheets asli.';
  }
}

// Check Single Device Token Online via GET
async function checkSessionTokenOnline() {
  if (!currentUser || API_URL === 'local' || currentUser.sessionToken === 'local_token' || !currentUser.sessionToken || !currentUser.username) {
    return true;
  }
  try {
    const checkUrl = `${API_URL}?action=check_session&username=${encodeURIComponent(currentUser.username)}&sessionToken=${encodeURIComponent(currentUser.sessionToken)}`;
    const response = await fetch(checkUrl);
    const textRes = await response.text();
    let result;
    try {
      result = JSON.parse(textRes);
    } catch (parseErr) {
      return true; // Abaikan jika respon server bukan JSON
    }
    if (result && result.status === 'expired') {
      showToast('Akun Anda telah masuk di perangkat lain! Menutup sesi...', 'error');
      setTimeout(() => {
        localStorage.removeItem('simpel_momen_user');
        sessionStorage.removeItem('simpel_momen_user');
        currentUser = null;
        if (appWrapper) appWrapper.style.display = 'none';
        if (loginWrapper) loginWrapper.style.display = 'flex';
      }, 2500);
      return false;
    }
  } catch (error) {
    console.warn('Gagal memverifikasi token sesi login:', error);
  }
  return true;
}

// ================= DATA FETCHER & RENDERING =================
async function loadData(skipSessionCheck = false) {
  if (!skipSessionCheck) {
    const isSessionValid = await checkSessionTokenOnline();
    if (!isSessionValid) return;
  }

  if (counterTableBody) {
    counterTableBody.innerHTML = Array(3).fill(0).map(() => `
      <tr>
        <td><div class="skeleton" style="height:20px; background:rgba(255,255,255,0.05); border-radius:4px;"></div></td>
        <td><div class="skeleton" style="height:20px; background:rgba(255,255,255,0.05); border-radius:4px;"></div></td>
        <td><div class="skeleton" style="height:20px; background:rgba(255,255,255,0.05); border-radius:4px;"></div></td>
        <td><div class="skeleton" style="height:20px; background:rgba(255,255,255,0.05); border-radius:4px;"></div></td>
        <td><div class="skeleton" style="height:20px; background:rgba(255,255,255,0.05); border-radius:4px;"></div></td>
        <td><div class="skeleton" style="height:20px; background:rgba(255,255,255,0.05); border-radius:4px;"></div></td>
        <td><div class="skeleton" style="height:20px; background:rgba(255,255,255,0.05); border-radius:4px;"></div></td>
      </tr>
    `).join('');
  }
  
  if (API_URL === 'local') {
    allData = getLocalDB();
    populateFasilitasiFilterOptions();
    renderCounterDesk();
    renderMonitoringTable();
    renderRekapitulasi();
    return;
  }
  
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Gagal memuat data');
    const resJson = await response.json();
    
    if (resJson.status === 'success' && Array.isArray(resJson.data)) {
      allData = resJson.data;
    } else if (Array.isArray(resJson)) {
      allData = resJson;
    } else {
      allData = [];
    }
    
    populateFasilitasiFilterOptions();
    renderCounterDesk();
    renderMonitoringTable();
    renderRekapitulasi();
  } catch (error) {
    console.error('Gagal mengambil data dari Google Sheets:', error);
    showToast('Koneksi ke Google Sheets terganggu. Menampilkan data cadangan sementara.', 'warning');
    allData = getLocalDB();
    populateFasilitasiFilterOptions();
    renderCounterDesk();
    renderMonitoringTable();
    renderRekapitulasi();
  }
}

function populateFasilitasiFilterOptions() {
  if (!filterFasilitasi) return;

  if (isUserUpt(currentUser)) {
    const userUpt = currentUser.uptCode || "UPT";
    filterFasilitasi.innerHTML = `<option value="${userUpt}">🏛️ Fasilitasi ${userUpt}</option>`;
    filterFasilitasi.value = userUpt;
    filterFasilitasi.disabled = true;
    return;
  }
  
  filterFasilitasi.disabled = false;
  const currentVal = filterFasilitasi.value;
  
  const uptSet = new Set();
  if (Array.isArray(allData)) {
    allData.forEach(item => {
      const fas = String(item.fasilitasi || "");
      if (fas.toLowerCase().includes('upt')) {
        uptSet.add('UPT');
      } else {
        uptSet.add('Dinas');
      }
    });
  }
  
  let html = `<option value="ALL">🌐 Semua Fasilitasi</option>`;
  uptSet.forEach(val => {
    html += `<option value="${val}">${val}</option>`;
  });
  
  filterFasilitasi.innerHTML = html;
  filterFasilitasi.value = currentVal || "ALL";
}

// HELPER MANDATORI UTAMA INTEGRASI LAYANAN
function getMandatoryItemForBatch(batch) {
  if (!batch || batch.length === 0) return null;
  if (batch.length === 1) return batch[0];
  
  const explicitMandatory = batch.find(b => b.isMandatory === true);
  if (explicitMandatory) return explicitMandatory;

  const capilItem = batch.find(b => 
    String(b.jenis_layanan || '').toLowerCase().includes('pencatatan sipil') || 
    String(b.jenis_layanan || '').toLowerCase().includes('capil')
  );
  if (capilItem) return capilItem;

  const pindahItem = batch.find(b => 
    String(b.sub_layanan || '').toLowerCase().includes('pindah')
  );
  if (pindahItem) return pindahItem;

  return batch[0];
}

// RENDER MEJA KERJA COUNTER & PEMBARUAN METRIK AKUMULASI
function renderCounterDesk() {
  if (!counterTableBody || !currentUser) return;
  
  const query = counterSearchInput ? counterSearchInput.value.toLowerCase().trim() : "";
  const role = currentUser.role;
  const fasilitasi = currentUser.fasilitasi || "Dinas";

  // Filter antrean khusus meja aktif user
  const userActiveDeskItems = allData.filter(item => {
    // 🛑 Filter Utama UPT: Sembunyikan berkas Dinas dan berkas UPT lain bagi user tingkatan UPT
    if (isUserUpt(currentUser) && !matchItemToUserUpt(item, currentUser)) {
      return false;
    }

    const statusAlur = String(item.status_alur || "");
    const itemFas = String(item.fasilitasi || "");
    const itemJenis = String(item.jenis_layanan || "").trim().toLowerCase();

    if (role === 'operator') {
      return statusAlur === 'PENDING_OPERATOR';
    } else if (role === 'petugas_scan') {
      if (fasilitasi === 'UPT') return statusAlur === '1_PETUGAS_SCAN';
      return statusAlur === '1_PETUGAS_SCAN' && !itemFas.toLowerCase().includes('upt');
    } else if (role === 'kasie_dafduk') {
      return statusAlur === '2_VERIFIKASI_KASIE' && itemJenis === 'pendaftaran penduduk';
    } else if (role === 'kasie_capil') {
      return statusAlur === '2_VERIFIKASI_KASIE' && itemJenis !== 'pendaftaran penduduk';
    } else if (role === 'kepala_upt') {
      return statusAlur === '2_VERIFIKASI_UPT';
    } else if (role === 'kabid_dafduk') {
      return statusAlur === '3_VALIDASI_KABID' && itemJenis === 'pendaftaran penduduk';
    } else if (role === 'kabid_capil') {
      return statusAlur === '3_VALIDASI_KABID' && itemJenis !== 'pendaftaran penduduk';
    } else if (role === 'kadis') {
      const isSelectedFas = (filterFasilitasi && filterFasilitasi.value !== 'ALL') ? 
        itemFas.toLowerCase().includes(filterFasilitasi.value.toLowerCase()) : true;
      return statusAlur === '4_SERTIFIKASI_KADIS' && isSelectedFas;
    } else if (role === 'petugas_tte') {
      return statusAlur === '5_TTE';
    } else if (role === 'petugas_pencetakan') {
      if (fasilitasi === 'UPT') return statusAlur === '6_PENCETAKAN_UPT';
      return statusAlur === '6_PENCETAKAN_DINAS';
    }
    return true;
  });

  // AKUMULASI NILAI METRIK PADA DASHBOARD
  const userUptScopeData = isUserUpt(currentUser) ? allData.filter(d => matchItemToUserUpt(d, currentUser)) : allData;
  const countActiveDesk = userActiveDeskItems.length;
  const countPendingAll = userUptScopeData.filter(d => String(d.status_alur).includes('PENDING')).length;
  const countCompletedAll = userUptScopeData.filter(d => String(d.status_alur).includes('7_SELESAI')).length;

  if (valMetric1) valMetric1.textContent = countActiveDesk;
  if (valMetric2) valMetric2.textContent = countPendingAll;
  if (valMetric3) valMetric3.textContent = countCompletedAll;

  // Filter tampilan tabel berdasarkan Fasilitasi (Dinas / UPT) & Pencarian
  const fasilitasiSelect = document.getElementById('fasilitasiFilter');
  const selectedFas = fasilitasiSelect ? fasilitasiSelect.value : 'ALL';

  const filtered = allData.filter(item => {
    // Filter akses UPT spesifik
    if (isUserUpt(currentUser) && !matchItemToUserUpt(item, currentUser)) {
      return false;
    }

    const keyMatch = String(item.key || "").toLowerCase().includes(query);
    const pemohonMatch = String(item.pemohon || "").toLowerCase().includes(query);
    const jenisMatch = String(item.jenis_layanan || "").toLowerCase().includes(query);
    const subMatch = String(item.sub_layanan || "").toLowerCase().includes(query);
    const operatorMatch = String(item.operator || "").toLowerCase().includes(query);
    
    const matchesSearch = !query || keyMatch || pemohonMatch || jenisMatch || subMatch || operatorMatch;
    if (!matchesSearch) return false;

    if (selectedFas === 'Dinas') {
      const isDinas = String(item.fasilitasi || item.integrasi || "Dinas").toLowerCase().includes('dinas');
      if (!isDinas) return false;
    } else if (selectedFas === 'UPT') {
      const isUpt = String(item.fasilitasi || item.integrasi || "").toLowerCase().includes('upt');
      if (!isUpt) return false;
    }

    if (role === 'monitoring') return true;
    return userActiveDeskItems.includes(item);
  });

  // 🕒 Pengurutan & Filter Khusus Counter User (Petugas Scan, Kasie Capil, Kasie Dafduk, Kepala UPT, Operator):
  // 1. Filter Stay Mode: Sembunyikan Dokumen Pengikut / Dokumen Belum Waktunya dari Tabel Counter (Hanya tampilkan 1 Dokumen Mandatori per Kode Unik)
  // 2. Pengurutan FIFO: Urutkan dari Dokumen Paling Lama (Paling Atas) ke Terbaru (Terbawah)
  let displayList = filtered;

  const allDataKeyMap = {};
  allData.forEach(it => {
    const k = String(it.key);
    if (!allDataKeyMap[k]) allDataKeyMap[k] = [];
    allDataKeyMap[k].push(it);
  });

  displayList = filtered.filter(item => {
    const fullBatch = allDataKeyMap[String(item.key)] || [];
    if (fullBatch.length <= 1) return true; // Berkas tunggal tetap ditampilkan

    const isDafdukCapil = fullBatch.some(b => String(b.jenis_layanan).toLowerCase().includes('pencatatan sipil') || String(b.jenis_layanan).toLowerCase().includes('capil')) &&
                          fullBatch.some(b => String(b.jenis_layanan).toLowerCase().includes('pendaftaran penduduk'));
    const isDafdukDafduk = fullBatch.every(b => String(b.jenis_layanan).toLowerCase().includes('pendaftaran penduduk'));

    if (role === 'petugas_scan') {
      const mandatoryItem = getMandatoryItemForBatch(fullBatch);
      return item === mandatoryItem;
    }

    if (role === 'kasie_capil') {
      // Kasie Capil melihat dokumen Pencatatan Sipil secara langsung
      return true;
    }

    if (role === 'kasie_dafduk') {
      if (isDafdukCapil) {
        // C.1 Integrasi Layanan Dafduk - Capil di Dinas:
        // Dokumen Dafduk HANYA DITAMPILKAN jika dokumen Capil yang se-Kode Unik SUDAH DIVERIFIKASI oleh Kasie Capil (status Capil bukan 2_VERIFIKASI_KASIE lagi)!
        const capilItem = fullBatch.find(b => String(b.jenis_layanan).toLowerCase().includes('pencatatan sipil') || String(b.jenis_layanan).toLowerCase().includes('capil'));
        if (capilItem) {
          const capilStatus = String(capilItem.status_alur || '');
          if (capilStatus === '2_VERIFIKASI_KASIE') {
            // Kasie Capil belum memverifikasi -> Dokumen Dafduk SEOLAH-OLAH ADA TETAPI JANGAN DULU DITAMPILKAN!
            return false;
          }
        }
        return true;
      }

      if (isDafdukDafduk) {
        // C.2 Integrasi Layanan Dafduk - Dafduk di Dinas:
        // Khusus jika ada sub_layanan Pindah: Kasie Dafduk mengeksekusi secara terpisah & kekhususan mandatori diabaikan!
        const hasPindah = fullBatch.some(b => String(b.sub_layanan).toLowerCase().includes('pindah'));
        if (hasPindah) {
          return true; // Tampilkan setiap item Pindah / Dafduk secara terpisah!
        }
        // Tanpa Pindah: Tampilkan HANYA 1 dokumen mandatori!
        const mandatoryItem = getMandatoryItemForBatch(fullBatch);
        return item === mandatoryItem;
      }

      return true;
    }

    if (role === 'kepala_upt') {
      if (isDafdukCapil) {
        // C.1 Integrasi Layanan Dafduk - Capil di UPT:
        // Tampilkan HANYA dokumen Capil terlebih dahulu! Dokumen Dafduk disembunyikan ("seolah-olah ada namun jangan dulu ditampilkan").
        const capilItem = fullBatch.find(b => String(b.jenis_layanan).toLowerCase().includes('pencatatan sipil') || String(b.jenis_layanan).toLowerCase().includes('capil'));
        if (capilItem) {
          return item === capilItem;
        }
      }

      if (isDafdukDafduk) {
        // C.2 Integrasi Layanan Dafduk - Dafduk di UPT:
        // Tampilkan HANYA dokumen mandatori! Dokumen Dafduk lainnya disembunyikan.
        const mandatoryItem = getMandatoryItemForBatch(fullBatch);
        return item === mandatoryItem;
      }

      return true;
    }

    if (role === 'operator') {
      // Stay Mode Pending Operator:
      if (isDafdukCapil) {
        const capilItem = fullBatch.find(b => String(b.jenis_layanan).toLowerCase().includes('pencatatan sipil') || String(b.jenis_layanan).toLowerCase().includes('capil'));
        if (capilItem) return item === capilItem;
      }
      if (isDafdukDafduk) {
        const mandatoryItem = getMandatoryItemForBatch(fullBatch);
        return item === mandatoryItem;
      }
      return true;
    }

    return true;
  });

  // 🕒 Pengurutan FIFO (Oldest at Top, Newest at Bottom) untuk SEMUA Counter User
  displayList.sort((a, b) => {
    const timeA = String(a.tgl_operator || a.tanggal || '');
    const timeB = String(b.tgl_operator || b.tanggal || '');
    if (timeA && timeB) {
      return timeA.localeCompare(timeB);
    }
    return 0;
  });

  if (counterEntriesCount) counterEntriesCount.textContent = `Menampilkan ${displayList.length} berkas`;

  if (displayList.length === 0) {
    counterTableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center" style="padding: 2.5rem; color: var(--text-muted);">
          ✨ Tidak ada antrean dokumen yang sesuai dengan filter saat ini.
        </td>
      </tr>
    `;
    return;
  }

  counterTableBody.innerHTML = displayList.map(row => {
    const isPending = row.status_alur === 'PENDING_OPERATOR';
    const isSelesai = row.status_alur === '7_SELESAI';
    const rowStyle = isPending ? 'background: rgba(239, 68, 68, 0.08);' : (isSelesai ? 'background: rgba(16, 185, 129, 0.04);' : '');
    
    // Link file scan jika ada
    const hasLink = row.link_file && row.link_file.trim().startsWith('http');
    const linkBtnHtml = hasLink ? 
      `<br><a href="${escapeHTML(row.link_file.trim())}" target="_blank" class="btn btn-secondary btn-xs" style="color:#60a5fa; margin-top:4px; font-size:0.75rem; padding:2px 8px;">📄 Buka Scan PDF</a>` : '';

    // Catatan Pending jika ada
    const pendingText = row.riwayat_pending || row.catatan_pending;
    const pendingBadgeHtml = pendingText ? `<div style="font-size:0.75rem; color:#f87171; font-weight:600; margin-top:4px; line-height:1.3;">⚠️ Pending: ${escapeHTML(pendingText)}</div>` : '';

    // Tombol Akses Tindakan
    let actionBtnHtml = '';
    if (role === 'monitoring') {
      actionBtnHtml = `
        <button class="btn btn-secondary btn-xs" onclick="openActionModal('${escapeHTML(row.key)}')">
          👁️ Detail & Riwayat
        </button>
      `;
    } else if (isSelesai) {
      actionBtnHtml = `
        <span class="badge selesai" style="margin-right:4px;">✅ Selesai</span>
        <button class="btn btn-secondary btn-xs" onclick="openActionModal('${escapeHTML(row.key)}')">👁️ Detail</button>
      `;
    } else if (role === 'petugas_pencetakan') {
      actionBtnHtml = `
        <button class="btn btn-success btn-xs" onclick="openActionModal('${escapeHTML(row.key)}')">
          🎉 Cetak & Selesaikan
        </button>
      `;
    } else if (role === 'operator' && isPending) {
      actionBtnHtml = `
        <button class="btn btn-danger btn-xs" onclick="openActionModal('${escapeHTML(row.key)}')">
          🛠️ Perbaiki & Kirim Ulang
        </button>
      `;
    } else if (role === 'petugas_scan') {
      actionBtnHtml = `
        <button class="btn btn-primary btn-xs" onclick="openActionModal('${escapeHTML(row.key)}')">
          📄 Scan & Kirim Berkas
        </button>
      `;
    } else {
      actionBtnHtml = `
        <button class="btn btn-primary btn-xs" onclick="openActionModal('${escapeHTML(row.key)}')">
          ⚡ Setujui / Lanjutkan
        </button>
      `;
    }

    const batchItems = allData.filter(d => String(d.key) === String(row.key));
    const batchCount = batchItems.length;
    const isIntegrated = batchCount > 1 || (row.integrasi && row.integrasi !== 'tunggal');
    
    let integrasiBadgeHtml = '';
    if (isIntegrated) {
      if (batchCount > 1) {
        const followerItems = batchItems.filter(it => it !== row);
        const followerNames = followerItems.map(f => `${escapeHTML(f.sub_layanan)} (${escapeHTML(f.pemohon || 'Warga')})`).join(', ');
        integrasiBadgeHtml = `<br><span style="font-size:0.68rem; font-weight:800; color:#c084fc; background:rgba(139,92,246,0.18); border:1px solid rgba(139,92,246,0.4); padding:3px 8px; border-radius:6px; display:inline-block; margin-top:4px; line-height:1.4;">⚡ Terintegrasi (${batchCount} Dokumen)<br><small style="color:#d8b4fe; font-weight:700;">📌 Ditampilkan: ${escapeHTML(row.sub_layanan)}<br>👁️ Pengikut Tersembunyi: ${followerNames}</small></span>`;
      } else {
        integrasiBadgeHtml = `<br><span style="font-size:0.68rem; font-weight:800; color:#c084fc; background:rgba(139,92,246,0.18); border:1px solid rgba(139,92,246,0.4); padding:2px 6px; border-radius:6px; display:inline-block; margin-top:4px;">⚡ Terintegrasi</span>`;
      }
    }

    return `
      <tr style="${rowStyle}">
        <td><span class="code-key-badge">${escapeHTML(row.key)}</span>${integrasiBadgeHtml}</td>
        <td>${formatDate(row.tanggal || row.tgl_operator)}</td>
        <td><strong>${escapeHTML(row.pemohon)}</strong><br><small style="color:var(--text-muted);">${escapeHTML(row.no_hp || '-')}</small></td>
        <td>${escapeHTML(row.jenis_layanan)}<br><small style="color:var(--text-muted);">${escapeHTML(row.sub_layanan)}</small>${linkBtnHtml}</td>
        <td><span class="badge ${row.integrasi && row.integrasi.includes('UPT') ? 'badge-upt' : 'fasilitasi-dinas'}">${escapeHTML(row.fasilitasi || row.integrasi || 'Dinas')}</span></td>
        <td>
          <span style="font-weight: 600; color: #a78bfa;">${escapeHTML(row.status_alur)}</span>
          ${pendingBadgeHtml}
        </td>
        <td class="text-center">${actionBtnHtml}</td>
      </tr>
    `;
  }).join('');
}

// RENDER MONITORING ALUR TABLE
function renderMonitoringTable() {
  if (!monitoringTableBody) return;

  const query = monitoringSearchInput ? monitoringSearchInput.value.toLowerCase().trim() : "";
  const dateFilterInput = document.getElementById('monitoringDateFilter');
  const selectedDate = dateFilterInput ? dateFilterInput.value : "";
  const filterFas = filterFasilitasi ? filterFasilitasi.value : "ALL";

  const filtered = allData.filter(item => {
    // 🛑 Filter Utama UPT: Sembunyikan berkas Dinas dan berkas UPT lain bagi user tingkatan UPT
    if (isUserUpt(currentUser) && !matchItemToUserUpt(item, currentUser)) {
      return false;
    }

    // Filter Fasilitasi Dropdown
    if (filterFas === 'Dinas' && item.fasilitasi === 'UPT') return false;
    if (filterFas === 'UPT' && item.fasilitasi !== 'UPT') return false;

    // Filter per Tanggal (jika diisi)
    if (selectedDate) {
      const rawDate = item.tanggal || item.tgl_operator || item.tgl_scan || "";
      if (!rawDate.startsWith(selectedDate)) return false;
    }

    const keyMatch = String(item.key || "").toLowerCase().includes(query);
    const pemohonMatch = String(item.pemohon || "").toLowerCase().includes(query);
    const jenisMatch = String(item.jenis_layanan || "").toLowerCase().includes(query);
    const subMatch = String(item.sub_layanan || "").toLowerCase().includes(query);
    const operatorMatch = String(item.operator || "").toLowerCase().includes(query);
    return !query || keyMatch || pemohonMatch || jenisMatch || subMatch || operatorMatch;
  });

  if (monitoringCount) monitoringCount.textContent = `Menampilkan ${filtered.length} berkas`;

  if (filtered.length === 0) {
    monitoringTableBody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center" style="padding: 2.5rem; color: var(--text-muted);">
          Tidak ditemukan data dokumen.
        </td>
      </tr>
    `;
    return;
  }

  monitoringTableBody.innerHTML = filtered.map(row => {
    const isSelesai = row.status_alur === '7_SELESAI';
    const isPending = row.status_alur === 'PENDING_OPERATOR';

    const hasLink = row.link_file && row.link_file.trim().startsWith('http');
    const linkBtnHtml = hasLink ? 
      `<br><a href="${escapeHTML(row.link_file.trim())}" target="_blank" class="btn btn-secondary btn-xs" style="color:#60a5fa; margin-top:4px; font-size:0.75rem; padding:2px 8px;">📄 Buka Scan PDF</a>` : '';

    return `
      <tr>
        <td><span class="code-key-badge">${escapeHTML(row.key)}</span></td>
        <td>${formatDate(row.tanggal || row.tgl_operator)}</td>
        <td><strong>${escapeHTML(row.pemohon)}</strong></td>
        <td>${escapeHTML(row.jenis_layanan)}<br><small style="color:var(--text-muted);">${escapeHTML(row.sub_layanan)}</small>${linkBtnHtml}</td>
        <td>${escapeHTML(row.operator || '-')}</td>
        <td style="font-weight: 500;">${escapeHTML(row.status_alur)}</td>
        <td><small style="color:var(--text-muted);">${escapeHTML(row.riwayat_pending || row.catatan_print || row.catatan_kadis || '-')}</small></td>
        <td class="text-center no-print">
          <button class="btn btn-secondary btn-xs" onclick="openReadOnlyDetailModal('${escapeHTML(row.key)}')" style="padding: 4px 10px; font-weight: 600; background: rgba(59, 130, 246, 0.18); border: 1px solid rgba(59, 130, 246, 0.4); color: #93c5fd; white-space: nowrap;">
            👁️ Detail Dokumen
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// Export Tabel Monitoring Alur Berkas ke File PDF (.pdf)
window.exportMonitoringToPDF = function() {
  const container = document.getElementById('monitoringPrintContainer');
  if (!container) return;

  const dateFilterInput = document.getElementById('monitoringDateFilter');
  const selectedDate = dateFilterInput ? dateFilterInput.value : "";
  const dateStr = selectedDate ? selectedDate : "Semua_Tanggal";

  const fileName = `Laporan_Monitoring_Dokumen_${dateStr}.pdf`;
  showToast('Sedang membuat file PDF Monitoring...', 'info');

  const clone = container.cloneNode(true);
  clone.style.background = '#ffffff';
  clone.style.color = '#000000';
  clone.style.padding = '15px';
  clone.querySelectorAll('.no-print').forEach(el => el.remove());

  const table = clone.querySelector('table');
  if (table) {
    table.style.color = '#000000';
    table.style.borderCollapse = 'collapse';
    table.style.width = '100%';
    table.querySelectorAll('th, td').forEach(el => {
      el.style.border = '1px solid #475569';
      el.style.padding = '6px';
      if (el.tagName === 'TH') {
        el.style.background = '#e2e8f0';
        el.style.color = '#0f172a';
      } else {
        el.style.color = '#0f172a';
      }
    });
  }

  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.left = '-9999px';
  wrapper.style.top = '0';

  const titleDiv = document.createElement('div');
  titleDiv.style.color = '#0f172a';
  titleDiv.style.marginBottom = '12px';
  titleDiv.style.fontFamily = 'sans-serif';
  titleDiv.innerHTML = `
    <h3 style="margin:0 0 4px 0;">Laporan Monitoring Alur Berkas Pelayanan</h3>
    <div><strong>Tanggal Filter:</strong> ${selectedDate ? formatDate(selectedDate) : 'Semua Tanggal'}</div>
  `;
  wrapper.appendChild(titleDiv);
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  const opt = {
    margin:       [10, 10, 10, 10],
    filename:     fileName,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
  };

  if (typeof html2pdf !== 'undefined') {
    html2pdf().set(opt).from(wrapper).save().then(() => {
      document.body.removeChild(wrapper);
      showToast('File PDF Monitoring berhasil diunduh!', 'success');
    }).catch(err => {
      console.error(err);
      if (document.body.contains(wrapper)) document.body.removeChild(wrapper);
      window.print();
    });
  } else {
    document.body.removeChild(wrapper);
    window.print();
  }
};

// Function Cek Apakah Berkas Pernah Dieksekusi / Dibuat Oleh Username / User Ini
function isItemExecutedByUser(item, user) {
  if (!user || !item) return false;
  const nameStr = (user.name || "").toLowerCase().trim();
  const unameStr = (user.username || "").toLowerCase().trim();

  const isMatch = (val) => {
    if (!val) return false;
    const s = String(val).toLowerCase().trim();
    return (nameStr && s.includes(nameStr)) || (unameStr && s.includes(unameStr));
  };

  // Cek apakah user tercatat sebagai pembuat atau eksekutor pada alur berkas
  return isMatch(item.operator) ||
         isMatch(item.petugas_scan) ||
         isMatch(item.eksekutor_scan) ||
         isMatch(item.kasie) ||
         isMatch(item.eksekutor_kasie) ||
         isMatch(item.kabid) ||
         isMatch(item.eksekutor_kabid) ||
         isMatch(item.kadis) ||
         isMatch(item.eksekutor_kadis) ||
         isMatch(item.kepala_upt) ||
         isMatch(item.eksekutor_upt) ||
         isMatch(item.petugas_cetak) ||
         isMatch(item.eksekutor_cetak);
}

// Daftar Tanggal Merah / Libur Nasional (Format: MM-DD)
const NATIONAL_HOLIDAYS = {
  "01-01": "Tahun Baru Masehi",
  "05-01": "Hari Buruh Internasional",
  "06-01": "Hari Lahir Pancasila",
  "08-17": "Hari Kemerdekaan RI",
  "12-25": "Hari Raya Natal",
  "12-26": "Cuti Bersama Natal"
};

function isHolidayOrWeekend(year, monthIndex, dayNum) {
  const d = new Date(year, monthIndex, dayNum);
  const dayOfWeek = d.getDay(); // 0 = Minggu, 6 = Sabtu
  const isSunday = dayOfWeek === 0;
  const isSaturday = dayOfWeek === 6;

  const mStr = String(monthIndex + 1).padStart(2, '0');
  const dStr = String(dayNum).padStart(2, '0');
  const dateKey = `${mStr}-${dStr}`;
  const holidayName = NATIONAL_HOLIDAYS[dateKey];

  if (isSunday) return { isRed: true, label: "Hari Minggu" };
  if (isSaturday) return { isRed: true, label: "Hari Sabtu" };
  if (holidayName) return { isRed: true, label: holidayName };
  return { isRed: false, label: "" };
}

// RENDER REKAPITULASI (Format Matriks Harian 1-31 Berdasarkan Username & Rentang Tanggal)
function renderRekapitulasi() {
  const rekapMatrixBody = document.getElementById('rekapMatrixBody');
  if (!currentUser) return;

  // 🎯 HANYA TAMPILKAN PROSES YANG DIEKSEKUSI / DIBUAT OLEH USERNAME TERSEBUT (BUKAN AKUMULASI ROLE)
  const userExecutedData = allData.filter(d => isItemExecutedByUser(d, currentUser));

  const total = userExecutedData.length;
  const selesai = userExecutedData.filter(d => d.status_alur === '7_SELESAI').length;
  const proses = total - selesai;

  if (rekapTotal) rekapTotal.textContent = total;
  if (rekapSelesai) rekapSelesai.textContent = selesai;
  if (rekapProses) rekapProses.textContent = proses;

  if (!rekapMatrixBody) return;

  const dateStartInput = document.getElementById('rekapDateStart');
  const dateEndInput = document.getElementById('rekapDateEnd');

  const now = new Date();
  
  // Default awal jika kosong: Dari tanggal 1 bulan berjalan s/d hari ini / akhir bulan
  if (dateStartInput && !dateStartInput.value) {
    const firstDayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    dateStartInput.value = firstDayStr;
  }
  if (dateEndInput && !dateEndInput.value) {
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    dateEndInput.value = todayStr;
  }

  const startDateStr = dateStartInput ? dateStartInput.value : "";
  const endDateStr = dateEndInput ? dateEndInput.value : "";

  let filterStartDate = startDateStr ? new Date(startDateStr + "T00:00:00") : null;
  let filterEndDate = endDateStr ? new Date(endDateStr + "T23:59:59") : null;

  const selectedMonth = filterStartDate ? filterStartDate.getMonth() : now.getMonth();
  const selectedYear = filterStartDate ? filterStartDate.getFullYear() : now.getFullYear();

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const monthName = monthNames[selectedMonth];

  // Header Info & Penandatangan
  const displayName = currentUser.name || currentUser.username || "Operator";
  const rekapOperatorName = document.getElementById('rekapOperatorName');
  const rekapPeriodeText = document.getElementById('rekapPeriodeText');
  const rekapTglAkhir = document.getElementById('rekapTglAkhir');
  const rekapNamaTTD = document.getElementById('rekapNamaTTD');
  const downloadTimeEl = document.getElementById('rekapDownloadTime');

  if (rekapOperatorName) rekapOperatorName.textContent = displayName;
  
  if (startDateStr && endDateStr) {
    if (rekapPeriodeText) rekapPeriodeText.textContent = `${formatDate(startDateStr)} s/d ${formatDate(endDateStr)}`;
    if (rekapTglAkhir) rekapTglAkhir.textContent = formatDate(endDateStr);
  } else if (startDateStr) {
    if (rekapPeriodeText) rekapPeriodeText.textContent = `Mulai ${formatDate(startDateStr)}`;
    if (rekapTglAkhir) rekapTglAkhir.textContent = formatDate(startDateStr);
  } else {
    if (rekapPeriodeText) rekapPeriodeText.textContent = `1 ${monthName} ${selectedYear} s/d ${daysInMonth} ${monthName} ${selectedYear}`;
    if (rekapTglAkhir) rekapTglAkhir.textContent = `${daysInMonth} ${monthName} ${selectedYear}`;
  }

  if (rekapNamaTTD) rekapNamaTTD.textContent = displayName;
  if (downloadTimeEl) {
    const nowStr = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
    downloadTimeEl.textContent = `${nowStr} WITA`;
  }

  // Render Table Header (No, Uraian, 1..daysInMonth, Total)
  const headerDaysRow = document.getElementById('rekapHeaderDaysRow');
  if (headerDaysRow) {
    let dayCols = '';
    for (let d = 1; d <= daysInMonth; d++) {
      const currentDayDate = new Date(selectedYear, selectedMonth, d);
      const isWithinRange = (!filterStartDate || currentDayDate >= filterStartDate) && (!filterEndDate || currentDayDate <= filterEndDate);
      const redInfo = isHolidayOrWeekend(selectedYear, selectedMonth, d);

      let dayStyle = 'text-align:center; min-width:20px; padding:4px 1px; font-size:0.75rem;';
      let colTitle = redInfo.label || '';

      if (redInfo.isRed) {
        dayStyle = `text-align:center; min-width:20px; padding:4px 1px; font-size:0.75rem; background:rgba(239, 68, 68, 0.4); color:#fca5a5; font-weight:800; border-bottom: 2px solid #ef4444;`;
      } else if (filterStartDate || filterEndDate) {
        if (isWithinRange) {
          dayStyle = `text-align:center; min-width:20px; padding:4px 1px; font-size:0.75rem; background:rgba(59, 130, 246, 0.35); color:#ffffff; font-weight:800; border-bottom: 2px solid #3b82f6;`;
        }
      }

      dayCols += `<th style="${dayStyle}" title="${escapeHTML(colTitle)}" class="${redInfo.isRed ? 'holiday-col' : ''}">${d}</th>`;
    }
    headerDaysRow.innerHTML = `
      <th style="width:26px; text-align:center; padding:5px 2px;">NO</th>
      <th style="min-width:110px; max-width:145px; text-align:left; padding:5px 6px; white-space:nowrap;">URAIAN (SUB LAYANAN)</th>
      ${dayCols}
      <th style="width:42px; text-align:center; background:rgba(56,189,248,0.25); padding:5px 2px;">JUMLAH</th>
    `;
  }

  // Filter Data menurut Username Eksekutor & Rentang Tanggal
  const monthData = userExecutedData.filter(item => {
    const rawDate = item.tanggal || item.tgl_operator || item.tgl_scan;
    if (!rawDate) return false;
    const d = new Date(rawDate);
    if (isNaN(d.getTime())) return false;

    if (filterStartDate && d < filterStartDate) return false;
    if (filterEndDate && d > filterEndDate) return false;

    if (!filterStartDate && !filterEndDate) {
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    }
    return true;
  });

  // Tentukan Daftar Uraian Sub Layanan (Semua Sub Layanan)
  const subLayananList = [
    ...SUB_LAYANAN_OPTIONS["Pendaftaran Penduduk"],
    ...SUB_LAYANAN_OPTIONS["Pencatatan Sipil"]
  ];

  // Matriks Hitungan per Sub Layanan per Hari
  const matrix = {};
  subLayananList.forEach(sub => {
    matrix[sub] = Array(daysInMonth).fill(0);
  });

  monthData.forEach(item => {
    const sub = item.sub_layanan;
    const rawDate = item.tanggal || item.tgl_operator || item.tgl_scan;
    if (!rawDate) return;
    const d = new Date(rawDate);
    if (isNaN(d.getTime())) return;

    const dayNum = d.getDate();
    if (dayNum >= 1 && dayNum <= daysInMonth) {
      if (!matrix[sub]) {
        matrix[sub] = Array(daysInMonth).fill(0);
        subLayananList.push(sub);
      }
      matrix[sub][dayNum - 1]++;
    }
  });

  const dailyTotals = Array(daysInMonth).fill(0);
  let grandTotal = 0;

  const rowsHtml = subLayananList.map((sub, index) => {
    const counts = matrix[sub] || Array(daysInMonth).fill(0);
    let rowSum = 0;
    const cells = counts.map((cnt, i) => {
      rowSum += cnt;
      dailyTotals[i] += cnt;
      const dayNum = i + 1;
      const redInfo = isHolidayOrWeekend(selectedYear, selectedMonth, dayNum);

      let cellBg = '';
      if (redInfo.isRed) {
        cellBg = cnt > 0 ? 'background:rgba(239, 68, 68, 0.25); font-weight:800; color:#ffffff;' : 'background:rgba(239, 68, 68, 0.1); color:rgba(252,165,165,0.4);';
      } else {
        cellBg = cnt > 0 ? 'font-weight:700; color:#38bdf8;' : 'color:rgba(255,255,255,0.25);';
      }

      return `<td style="text-align:center; padding:3px 1px; font-size:0.78rem; ${cellBg}">${cnt || 0}</td>`;
    }).join('');

    grandTotal += rowSum;

    return `
      <tr>
        <td style="text-align:center; font-size:0.78rem; padding:3px 2px;">${index + 1}</td>
        <td style="text-align:left; padding:3px 6px; font-weight:600; font-size:0.78rem; white-space:nowrap;">${escapeHTML(sub)}</td>
        ${cells}
        <td style="text-align:center; font-weight:700; background:rgba(56,189,248,0.15); color:#38bdf8; font-size:0.78rem; padding:3px 2px;">${rowSum}</td>
      </tr>
    `;
  }).join('');

  const totalCells = dailyTotals.map((t, i) => {
    const dayNum = i + 1;
    const redInfo = isHolidayOrWeekend(selectedYear, selectedMonth, dayNum);
    const style = redInfo.isRed ? 
      `text-align:center; padding:3px 1px; font-weight:800; color:#fca5a5; background:rgba(239, 68, 68, 0.3); font-size:0.78rem;` : 
      `text-align:center; padding:3px 1px; font-weight:800; color:#34d399; background:rgba(16,185,129,0.1); font-size:0.78rem;`;
    return `<th style="${style}">${t}</th>`;
  }).join('');

  const footerRowHtml = `
    <tr style="background:rgba(15,23,42,0.95); font-weight:bold;">
      <td colspan="2" style="text-align:right; padding:5px 8px; font-weight:800; color:#34d399; font-size:0.8rem;">TOTAL KESELURUHAN:</td>
      ${totalCells}
      <th style="text-align:center; font-size:0.85rem; font-weight:800; color:#34d399; background:rgba(16,185,129,0.25); padding:5px 2px;">${grandTotal}</th>
    </tr>
  `;

  rekapMatrixBody.innerHTML = rowsHtml + footerRowHtml;
}

// Export Rekap Matriks Langsung ke File PDF (.pdf) dengan Fit Presisi Halaman A4 Landscape
window.exportRekapToPDF = function() {
  if (!currentUser) return;
  const dateStartInput = document.getElementById('rekapDateStart');
  const dateEndInput = document.getElementById('rekapDateEnd');

  const startDateStr = dateStartInput ? dateStartInput.value : "";
  const endDateStr = dateEndInput ? dateEndInput.value : "";

  const displayName = (currentUser.name || currentUser.username || "Operator").trim();
  const cleanName = displayName.replace(/\s+/g, '_');

  let fileName = `Laporan_Rekap_User_${cleanName}.pdf`;
  if (startDateStr && endDateStr) {
    fileName = `Laporan_Rekap_User_${cleanName}_Periode_${startDateStr}_sd_${endDateStr}.pdf`;
  }

  const printArea = document.getElementById('rekapPrintArea');
  if (!printArea) return;

  if (typeof html2pdf !== 'undefined') {
    showToast('Sedang membuat file PDF 1 Halaman...', 'info');

    // Clone area rekap & beri font yang disesuaikan presisi agar seluruh 34 kolom muat alami pada 1 kertas A4 Landscape
    const clone = printArea.cloneNode(true);
    clone.style.width = '1080px';
    clone.style.maxWidth = '1080px';
    clone.style.background = '#ffffff';
    clone.style.color = '#000000';
    clone.style.padding = '6px 8px';
    clone.style.boxSizing = 'border-box';
    clone.style.borderRadius = '0px';

    const infoBox = clone.querySelector('div');
    if (infoBox) {
      infoBox.style.background = '#f8fafc';
      infoBox.style.border = '1px solid #94a3b8';
      infoBox.style.color = '#0f172a';
      infoBox.style.padding = '5px 8px';
      infoBox.style.marginBottom = '8px';
      infoBox.style.fontSize = '8pt';
      infoBox.querySelectorAll('div, span, strong').forEach(sp => sp.style.color = '#0f172a');
    }

    const table = clone.querySelector('table');
    if (table) {
      table.style.width = '100%';
      table.style.maxWidth = '100%';
      table.style.tableLayout = 'auto'; // Layout proporsional alami tanpa pemaksaan lebar kolom
      table.style.borderCollapse = 'collapse';
      table.style.fontSize = '6.2pt';

      table.querySelectorAll('th, td').forEach(el => {
        el.style.borderColor = '#475569';
        el.style.padding = '1px 1px';
        el.style.boxSizing = 'border-box';

        if (el.classList.contains('holiday-col')) {
          el.style.background = '#fee2e2';
          el.style.color = '#991b1b';
          el.style.fontWeight = '800';
        } else if (el.tagName === 'TH') {
          el.style.background = '#e2e8f0';
          el.style.color = '#0f172a';
          el.style.fontSize = '6.5pt';
        } else {
          el.style.color = '#0f172a';
          el.style.fontSize = '6.2pt';
          if (el.textContent.trim() === '0') {
            el.style.color = '#94a3b8';
          }
        }
      });

      // ✏️ PENYESUAIAN KETAT KOLOM URAIAN SUB LAYANAN:
      // Diperkecil mengikuti lebar maksimal karakter (max-width 135px) agar seluruh 31 hari & Jumlah MUAT 1 HALAMAN!
      table.querySelectorAll('th:nth-child(2), td:nth-child(2)').forEach(el => {
        el.style.textAlign = 'left';
        el.style.whiteSpace = 'nowrap';
        el.style.paddingLeft = '4px';
        el.style.paddingRight = '6px';
        el.style.width = 'auto';
        el.style.minWidth = '110px';
        el.style.maxWidth = '140px';
        el.style.fontSize = '6.8pt';
        el.style.fontWeight = '700';
        el.style.color = '#0f172a';
      });

      // Kolom No & Jumlah
      table.querySelectorAll('th:first-child, td:first-child').forEach(el => {
        el.style.width = '22px';
        el.style.padding = '1px 1px';
        el.style.textAlign = 'center';
      });
      table.querySelectorAll('th:last-child, td:last-child').forEach(el => {
        el.style.width = '35px';
        el.style.padding = '1px 1px';
        el.style.textAlign = 'center';
      });
    }

    const ttdBlock = clone.querySelector('.rekap-signature-block');
    if (ttdBlock) {
      ttdBlock.style.marginTop = '14px';
      ttdBlock.style.pageBreakInside = 'avoid';
      ttdBlock.style.breakInside = 'avoid';
      ttdBlock.querySelectorAll('div, span').forEach(d => d.style.color = '#0f172a');
    }

    const footnote = clone.querySelector('#rekapFootnote');
    if (footnote) {
      footnote.style.display = 'flex';
      footnote.style.justifyContent = 'space-between';
      footnote.style.width = '100%';
      footnote.style.marginTop = '10px';
      footnote.style.paddingTop = '4px';
      footnote.style.borderTop = '1px dashed #475569';
      footnote.style.color = '#0f172a';
      footnote.style.fontSize = '0.7rem';
      footnote.style.pageBreakInside = 'avoid';
      footnote.style.breakInside = 'avoid';
      footnote.querySelectorAll('div, span').forEach(d => {
        d.style.color = '#0f172a';
        d.style.fontSize = '0.7rem';
      });
    }

    // 🛑 POSISI STRATEGIS UNTUK HTML2CANVAS: Position absolute di X=0 Y=0 dengan z-index paling dasar (-999999)
    const wrapper = document.createElement('div');
    wrapper.style.position = 'absolute';
    wrapper.style.left = '0px';
    wrapper.style.top = '0px';
    wrapper.style.width = '1080px';
    wrapper.style.zIndex = '-999999';
    wrapper.style.opacity = '1';
    wrapper.style.visibility = 'visible';
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    const opt = {
      margin:       [5, 5, 5, 5], // Margin simetris (5mm atas, 5mm kiri, 5mm bawah, 5mm kanan)
      filename:     fileName,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        width: 1080,
        windowWidth: 1080
      },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' },
      pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().set(opt).from(clone).save().then(() => {
      document.body.removeChild(wrapper);
      showToast('File PDF berhasil diexport dan didownload!', 'success');
    }).catch(err => {
      console.error('HTML2PDF Error:', err);
      if (document.body.contains(wrapper)) document.body.removeChild(wrapper);
      window.print();
    });
  } else {
    window.print();
  }
};

// Event Listeners Filter Rekap Matriks & Monitoring Tanggal
const monitoringDateFilterEl = document.getElementById('monitoringDateFilter');
const btnResetMonitoringDateEl = document.getElementById('btnResetMonitoringDate');
if (monitoringDateFilterEl) {
  monitoringDateFilterEl.addEventListener('change', renderMonitoringTable);
}
if (btnResetMonitoringDateEl) {
  btnResetMonitoringDateEl.addEventListener('click', () => {
    if (monitoringDateFilterEl) monitoringDateFilterEl.value = '';
    renderMonitoringTable();
  });
}

const rekapDateStartEl = document.getElementById('rekapDateStart');
const rekapDateEndEl = document.getElementById('rekapDateEnd');

if (rekapDateStartEl) rekapDateStartEl.addEventListener('change', renderRekapitulasi);
if (rekapDateEndEl) rekapDateEndEl.addEventListener('change', renderRekapitulasi);

// MODAL READ-ONLY DETAIL DOKUMEN (INFORMASI TANPA EKSEKUSI)
window.openReadOnlyDetailModal = function(key) {
  const item = allData.find(d => String(d.key) === String(key));
  if (!item || !actionModal) return;

  modalKey.value = item.key;
  if (modalKodeText) modalKodeText.textContent = item.key;
  if (modalPemohonText) modalPemohonText.textContent = item.pemohon || '-';
  if (modalLayananText) modalLayananText.textContent = `${item.jenis_layanan || ''} (${item.sub_layanan || ''})`;

  // Sembunyikan SEMUA Form Input Eksekusi & Tombol Simpan/Eksekusi
  if (scanLinkGroup) scanLinkGroup.style.display = 'none';
  if (tteStatusGroup) tteStatusGroup.style.display = 'none';
  if (tteNotesGroup) tteNotesGroup.style.display = 'none';
  if (penerimaGroup) penerimaGroup.style.display = 'none';
  if (standardActionGroup) standardActionGroup.style.display = 'none';
  if (modalNotesGroup) modalNotesGroup.style.display = 'none';
  if (saveModalBtn) saveModalBtn.style.display = 'none'; // strictly hidden!

  if (modalTitle) modalTitle.textContent = '👁️ Detail Informasi Dokumen (Read-Only)';
  if (cancelModalBtn) cancelModalBtn.textContent = '❌ Tutup Informasi';

  // Render Box Rekam Jejak Detail Dokumen Lengkap
  if (monitoringHistoryBox) {
    monitoringHistoryBox.style.display = 'block';
    const hasLink = item.link_file && item.link_file.trim().startsWith('http');
    const linkHtml = hasLink ? `<a href="${escapeHTML(item.link_file.trim())}" target="_blank" class="btn btn-secondary btn-xs" style="color:#60a5fa; font-weight:600;">📄 Buka Berkas Scan PDF</a>` : '<span style="color:var(--text-muted);">Belum ada file scan</span>';

    monitoringHistoryBox.innerHTML = `
      <!-- BOX IDENTITAS PEMOHON -->
      <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 14px; padding: 14px; margin-bottom: 12px;">
        <div style="font-weight: 700; color: #38bdf8; font-size: 0.88rem; margin-bottom: 8px;">📑 DATA PEMOHON & IDENTITAS BERKAS</div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; font-size: 0.85rem;">
          <div><span style="color:var(--text-muted);">Kode Key:</span> <strong>${escapeHTML(item.key)}</strong></div>
          <div><span style="color:var(--text-muted);">Tanggal Input:</span> <strong>${formatDate(item.tanggal || item.tgl_operator)}</strong></div>
          <div><span style="color:var(--text-muted);">Nama Pemohon:</span> <strong>${escapeHTML(item.pemohon || '-')}</strong></div>
          <div><span style="color:var(--text-muted);">No. HP (WA):</span> <strong>${escapeHTML(item.no_hp || '-')}</strong></div>
          <div><span style="color:var(--text-muted);">Email:</span> <strong>${escapeHTML(item.email || '-')}</strong></div>
          <div><span style="color:var(--text-muted);">Alamat:</span> <strong>${escapeHTML(item.alamat || '-')}</strong></div>
        </div>
      </div>

      <!-- BOX SPESIFIKASI LAYANAN -->
      <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 14px; padding: 14px; margin-bottom: 12px;">
        <div style="font-weight: 700; color: #fbbf24; font-size: 0.88rem; margin-bottom: 8px;">⚙️ SPESIFIKASI LAYANAN & OPERATOR</div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; font-size: 0.85rem;">
          <div><span style="color:var(--text-muted);">Jenis Layanan:</span> <strong>${escapeHTML(item.jenis_layanan || '-')}</strong></div>
          <div><span style="color:var(--text-muted);">Sub Layanan:</span> <strong>${escapeHTML(item.sub_layanan || '-')}</strong></div>
          <div><span style="color:var(--text-muted);">Fasilitasi:</span> <strong>${escapeHTML(item.fasilitasi || 'Dinas')}</strong></div>
          <div><span style="color:var(--text-muted);">Integrasi:</span> <strong>${escapeHTML(item.integrasi || '-')}</strong></div>
          <div><span style="color:var(--text-muted);">Operator Input:</span> <strong>${escapeHTML(item.operator || '-')}</strong></div>
          <div><span style="color:var(--text-muted);">Link Berkas PDF:</span> ${linkHtml}</div>
        </div>
      </div>

      <!-- BOX POSISI ALUR SAAT INI -->
      <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(96, 165, 250, 0.3); border-radius: 14px; padding: 14px; margin-bottom: 12px;">
        <div style="font-weight: 700; color: #a78bfa; font-size: 0.88rem; margin-bottom: 6px;">📊 POSISI ALUR & TTE</div>
        <div style="font-size: 0.9rem; color: #fff;">Status Alur Saat Ini: <strong style="color:#60a5fa; font-size:0.95rem;">${escapeHTML(item.status_alur)}</strong></div>
        <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">Status TTE / SIAK: <strong>${escapeHTML(item.status_tte || 'Belum TTE')}</strong></div>
        <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 2px;">Penerima Dokumen: <strong>${escapeHTML(item.penerima || '-')}</strong></div>
      </div>

      ${(item.riwayat_pending || item.catatan_pending) ? `
      <div style="background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.3); border-radius: 14px; padding: 14px; margin-bottom: 12px;">
        <div style="font-weight: 700; color: #f87171; font-size: 0.85rem; margin-bottom: 6px;">⚠️ HISTORI CATATAN PENDING OPERATOR</div>
        <pre style="white-space: pre-wrap; font-family: inherit; font-size: 0.85rem; color: #fca5a5; margin: 0; line-height: 1.5;">${escapeHTML(item.riwayat_pending || item.catatan_pending)}</pre>
      </div>` : ''}

      <!-- BOX CATATAN JEJAK MEJA TIAP VERIFIKATOR -->
      <div style="background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 14px; font-size: 0.85rem; line-height: 1.6; margin-bottom: 14px;">
        <div style="font-weight: 700; color: #34d399; font-size: 0.85rem; margin-bottom: 8px;">📋 CATATAN REKAM JEJAK MEJA</div>
        <div>• <strong>Catatan Scan:</strong> ${escapeHTML(item.catatan_scan || '-')} <small style="color:var(--text-muted);">${item.tgl_scan ? `(${item.tgl_scan})` : ''}</small></div>
        <div>• <strong>Catatan Kasie / Seksi:</strong> ${escapeHTML(item.catatan_kasie || '-')} <small style="color:var(--text-muted);">${item.tgl_kasie ? `(${item.tgl_kasie})` : ''}</small></div>
        <div>• <strong>Catatan Kepala UPT:</strong> ${escapeHTML(item.catatan_upt || '-')} <small style="color:var(--text-muted);">${item.tgl_upt ? `(${item.tgl_upt})` : ''}</small></div>
        <div>• <strong>Catatan Kabid:</strong> ${escapeHTML(item.catatan_kabid || '-')} <small style="color:var(--text-muted);">${item.tgl_kabid ? `(${item.tgl_kabid})` : ''}</small></div>
        <div>• <strong>Catatan Kadis:</strong> ${escapeHTML(item.catatan_kadis || '-')} <small style="color:var(--text-muted);">${item.tgl_kadis ? `(${item.tgl_kadis})` : ''}</small></div>
        <div>• <strong>Status TTE:</strong> ${escapeHTML(item.status_tte || '-')} <small style="color:var(--text-muted);">${item.tgl_tte ? `(${item.tgl_tte})` : ''}</small></div>
        <div>• <strong>Penerima & Catatan Print:</strong> ${escapeHTML(item.penerima ? `${item.penerima} (${item.catatan_print || ''})` : '-')} <small style="color:var(--text-muted);">${item.tgl_print ? `(${item.tgl_print})` : ''}</small></div>
      </div>
    `;
  }

  actionModal.classList.add('active');
  actionModal.style.setProperty('position', 'fixed', 'important');
  actionModal.style.setProperty('top', '0', 'important');
  actionModal.style.setProperty('left', '0', 'important');
  actionModal.style.setProperty('right', '0', 'important');
  actionModal.style.setProperty('bottom', '0', 'important');
  actionModal.style.setProperty('width', '100vw', 'important');
  actionModal.style.setProperty('height', '100vh', 'important');
  actionModal.style.setProperty('z-index', '999999', 'important');
  actionModal.style.setProperty('background', 'rgba(11, 15, 25, 0.85)', 'important');
  actionModal.style.setProperty('backdrop-filter', 'blur(12px)', 'important');
  actionModal.style.setProperty('display', 'flex', 'important');
  actionModal.style.setProperty('align-items', 'center', 'important');
  actionModal.style.setProperty('justify-content', 'center', 'important');
  actionModal.style.setProperty('padding', '1.5rem', 'important');
  actionModal.style.setProperty('overflow-y', 'auto', 'important');

  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// MODAL ACTION & TINDAK LANJUT
window.openActionModal = function(key) {
  const item = allData.find(d => String(d.key) === String(key));
  if (!item || !actionModal) return;

  modalKey.value = item.key;
  if (modalKodeText) modalKodeText.textContent = item.key;
  if (modalPemohonText) modalPemohonText.textContent = item.pemohon || '-';
  if (modalLayananText) modalLayananText.textContent = `${item.jenis_layanan || ''} (${item.sub_layanan || ''})`;

  const role = currentUser ? currentUser.role : '';
  
  if (scanLinkGroup) {
    if (role === 'petugas_scan') {
      scanLinkGroup.style.display = 'block';
      if (modalLinkFile) modalLinkFile.value = item.link_file || '';
    } else {
      scanLinkGroup.style.display = 'none';
    }
  }

  if (tteStatusGroup) tteStatusGroup.style.display = (role === 'petugas_tte') ? 'block' : 'none';
  if (penerimaGroup) penerimaGroup.style.display = (role === 'petugas_pencetakan') ? 'block' : 'none';
  if (modalNotes) modalNotes.value = '';

  // Render Box Rekam Jejak Catatan Pending & Catatan Meja-Meja Sebelumnya (Untuk Semua Role User)
  if (monitoringHistoryBox) {
    monitoringHistoryBox.style.display = 'block';
    const hasLink = item.link_file && item.link_file.trim().startsWith('http');
    const linkHtml = hasLink ? `<a href="${escapeHTML(item.link_file.trim())}" target="_blank" style="color:#60a5fa; font-weight:600;">📄 Buka Scan PDF</a>` : 'Belum ada file scan';

    const allBatchItems = allData.filter(d => String(d.key) === String(item.key));
    allBatchItems.sort((a, b) => {
      const isCapilA = String(a.jenis_layanan).toLowerCase().includes('capil') || String(a.jenis_layanan).toLowerCase().includes('pencatatan sipil');
      const isCapilB = String(b.jenis_layanan).toLowerCase().includes('capil') || String(b.jenis_layanan).toLowerCase().includes('pencatatan sipil');
      if (isCapilA && !isCapilB) return -1;
      if (!isCapilA && isCapilB) return 1;

      const isPindahA = String(a.sub_layanan).toLowerCase().includes('pindah');
      const isPindahB = String(b.sub_layanan).toLowerCase().includes('pindah');
      if (isPindahA && !isPindahB) return -1;
      if (!isPindahA && isPindahB) return 1;

      if (a.isMandatory && !b.isMandatory) return -1;
      if (!a.isMandatory && b.isMandatory) return 1;

      return 0;
    });

    let batchBannerHtml = '';
    if (allBatchItems.length > 1) {
      const followerListHtml = allBatchItems.map((it, idx) => {
        const isMandatory = (idx === 0);
        const tag = isMandatory ? '📌 MANDATORI UTAMA' : `📄 PENGIKUT #${idx}`;
        const tagBg = isMandatory ? 'background:#3b82f6; color:#fff;' : 'background:rgba(139,92,246,0.3); color:#c084fc;';
        return `
          <div style="background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 8px 12px; margin-top: 6px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong style="color: #fff; font-size: 0.85rem;">${idx + 1}. ${escapeHTML(it.sub_layanan)}</strong>
              <div style="font-size: 0.78rem; color: var(--text-muted);">Pemohon: ${escapeHTML(it.pemohon || '-')} | Jenis: ${escapeHTML(it.jenis_layanan || '-')} | Status: <span style="color:#a78bfa;">${escapeHTML(it.status_alur)}</span></div>
            </div>
            <span style="font-size: 0.7rem; font-weight: 800; padding: 3px 8px; border-radius: 6px; ${tagBg}">${tag}</span>
          </div>
        `;
      }).join('');

      batchBannerHtml = `
        <div style="background: rgba(139, 92, 246, 0.15); border: 1px solid rgba(139, 92, 246, 0.4); border-radius: 12px; padding: 14px; margin-bottom: 14px;">
          <div style="font-weight: 800; color: #c084fc; font-size: 0.88rem; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
            ⚡ RINCIAN DOKUMEN TERINTEGRASI KODE UNIK (${escapeHTML(item.key)}) - TOTAL ${allBatchItems.length} DOKUMEN
          </div>
          <div style="font-size: 0.82rem; color: #e9d5ff; margin-bottom: 8px; line-height: 1.5;">
            💡 <strong>Tindakan yang dieksekusi pada dokumen mandatori ini secara otomatis mewakili & memproses seluruh ${allBatchItems.length} dokumen terintegrasi di bawah ini:</strong>
          </div>
          ${followerListHtml}
        </div>
      `;
    }

    monitoringHistoryBox.innerHTML = `
      ${batchBannerHtml}

      <div style="background: rgba(15,23,42,0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 14px; margin-bottom: 12px;">
        <div style="font-weight: 700; color: #a78bfa; font-size: 0.85rem; margin-bottom: 8px;">📊 STATUS ALUR DOKUMEN</div>
        <div style="font-size: 0.9rem; color: #fff;">Status: <strong style="color:#60a5fa;">${escapeHTML(item.status_alur)}</strong></div>
        <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">Fasilitasi: ${escapeHTML(item.fasilitasi || item.integrasi || 'Dinas')} | Operator: ${escapeHTML(item.operator || '-')}</div>
        <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">Link File: ${linkHtml}</div>
      </div>

      ${(item.riwayat_pending || item.catatan_pending) ? `
      <div style="background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.3); border-radius: 14px; padding: 14px; margin-bottom: 12px;">
        <div style="font-weight: 700; color: #f87171; font-size: 0.85rem; margin-bottom: 6px;">⚠️ HISTORI CATATAN PENDING OPERATOR</div>
        <pre style="white-space: pre-wrap; font-family: inherit; font-size: 0.85rem; color: #fca5a5; margin: 0; line-height: 1.5;">${escapeHTML(item.riwayat_pending || item.catatan_pending)}</pre>
      </div>` : ''}

      <div style="background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 14px; font-size: 0.85rem; line-height: 1.6; margin-bottom: 14px;">
        <div style="font-weight: 700; color: #34d399; font-size: 0.85rem; margin-bottom: 8px;">📋 CATATAN REKAM JEJAK MEJA</div>
        <div>• <strong>Catatan Scan:</strong> ${escapeHTML(item.catatan_scan || '-')} <small style="color:var(--text-muted);">${item.tgl_scan ? `(${item.tgl_scan})` : ''}</small></div>
        <div>• <strong>Catatan Kasie / Seksi:</strong> ${escapeHTML(item.catatan_kasie || '-')} <small style="color:var(--text-muted);">${item.tgl_kasie ? `(${item.tgl_kasie})` : ''}</small></div>
        <div>• <strong>Catatan Kepala UPT:</strong> ${escapeHTML(item.catatan_upt || '-')} <small style="color:var(--text-muted);">${item.tgl_upt ? `(${item.tgl_upt})` : ''}</small></div>
        <div>• <strong>Catatan Kabid:</strong> ${escapeHTML(item.catatan_kabid || '-')} <small style="color:var(--text-muted);">${item.tgl_kabid ? `(${item.tgl_kabid})` : ''}</small></div>
        <div>• <strong>Catatan Kadis:</strong> ${escapeHTML(item.catatan_kadis || '-')} <small style="color:var(--text-muted);">${item.tgl_kadis ? `(${item.tgl_kadis})` : ''}</small></div>
        <div>• <strong>Status TTE:</strong> ${escapeHTML(item.status_tte || '-')} <small style="color:var(--text-muted);">${item.tgl_tte ? `(${item.tgl_tte})` : ''}</small></div>
        <div>• <strong>Penerima & Catatan Print:</strong> ${escapeHTML(item.penerima ? `${item.penerima} (${item.catatan_print || ''})` : '-')} <small style="color:var(--text-muted);">${item.tgl_print ? `(${item.tgl_print})` : ''}</small></div>
      </div>
    `;
  }

  // Penanganan Khusus User Monitoring vs Petugas/Eksekutor Biasa
  if (role === 'monitoring') {
    if (modalTitle) modalTitle.textContent = '👁️ Detail & Rekam Jejak Dokumen';
    if (modalNotesGroup) modalNotesGroup.style.display = 'none';
    if (saveModalBtn) saveModalBtn.style.display = 'none';
    if (cancelModalBtn) cancelModalBtn.textContent = '❌ Tutup';
  } else if (role === 'operator') {
    // Mode Operator Perbaikan Pending
    if (modalTitle) modalTitle.textContent = '🛠️ Perbaiki & Kirim Ulang Berkas Pending';
    if (standardActionGroup) standardActionGroup.style.display = 'none';
    if (saveModalBtn) {
      saveModalBtn.style.display = 'inline-flex';
      saveModalBtn.textContent = '🚀 Kirim ke Petugas Scan';
    }
    if (cancelModalBtn) cancelModalBtn.textContent = 'Batal';
    if (modalNotesGroup) modalNotesGroup.style.display = 'block';
  } else if (role === 'petugas_scan') {
    const batchCount = allData.filter(d => String(d.key) === String(item.key)).length;

    if (modalTitle) {
      modalTitle.textContent = batchCount > 1 ? 
        '📄 Upload Link Scan PDF (Dokumen Mandatori Utama)' : 
        '📄 Upload Link Scan PDF';
    }
    if (standardActionGroup) standardActionGroup.style.display = 'none';
    if (scanLinkGroup) scanLinkGroup.style.display = 'block';
    if (tteStatusGroup) tteStatusGroup.style.display = 'none';
    if (tteNotesGroup) tteNotesGroup.style.display = 'none';
    if (modalNotesGroup) modalNotesGroup.style.display = 'block';
    if (saveModalBtn) {
      saveModalBtn.style.display = 'inline-flex';
      saveModalBtn.textContent = '🚀 Upload & Kirim Berkas';
    }
    if (cancelModalBtn) cancelModalBtn.textContent = 'Batal';
  } else if (role === 'petugas_tte') {
    // Mode Khusus Petugas TTE: Sembunyikan Keputusan Tindakan (Lanjut/Pending), tampilkan hanya Status TTE / SIAK
    if (modalTitle) modalTitle.textContent = '✍️ Tindak Lanjut Petugas TTE / SIAK';
    if (standardActionGroup) standardActionGroup.style.display = 'none';
    if (tteStatusGroup) tteStatusGroup.style.display = 'block';
    if (tteNotesGroup) tteNotesGroup.style.display = 'block';
    if (modalNotesGroup) modalNotesGroup.style.display = 'none';
    if (saveModalBtn) {
      saveModalBtn.style.display = 'inline-flex';
      saveModalBtn.textContent = '💾 Eksekusi Status TTE';
    }
    if (cancelModalBtn) cancelModalBtn.textContent = 'Batal';
  } else {
    // Mode Petugas/Eksekutor Biasa
    if (modalTitle) modalTitle.textContent = 'Tindak Lanjut Berkas Antrean';
    if (standardActionGroup) standardActionGroup.style.display = 'block';
    if (tteStatusGroup) tteStatusGroup.style.display = 'none';
    if (tteNotesGroup) tteNotesGroup.style.display = 'none';
    if (saveModalBtn) {
      saveModalBtn.style.display = 'inline-flex';
      saveModalBtn.textContent = '💾 Eksekusi Tindakan';
    }
    if (cancelModalBtn) cancelModalBtn.textContent = 'Batal';
    if (modalNotesGroup) modalNotesGroup.style.display = 'block';
  }

  actionModal.classList.add('active');
  actionModal.style.setProperty('position', 'fixed', 'important');
  actionModal.style.setProperty('top', '0', 'important');
  actionModal.style.setProperty('left', '0', 'important');
  actionModal.style.setProperty('right', '0', 'important');
  actionModal.style.setProperty('bottom', '0', 'important');
  actionModal.style.setProperty('width', '100vw', 'important');
  actionModal.style.setProperty('height', '100vh', 'important');
  actionModal.style.setProperty('z-index', '999999', 'important');
  actionModal.style.setProperty('background', 'rgba(11, 15, 25, 0.85)', 'important');
  actionModal.style.setProperty('backdrop-filter', 'blur(12px)', 'important');
  actionModal.style.setProperty('display', 'flex', 'important');
  actionModal.style.setProperty('align-items', 'center', 'important');
  actionModal.style.setProperty('justify-content', 'center', 'important');
  actionModal.style.setProperty('padding', '1.5rem', 'important');
  actionModal.style.setProperty('overflow-y', 'auto', 'important');

  window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(() => {
    const firstFocusable = actionModal.querySelector('input:not([type="hidden"]), select, textarea, button');
    if (firstFocusable) firstFocusable.focus();
  }, 100);
};

if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);

function closeModal() {
  if (actionModal) {
    actionModal.classList.remove('active');
    actionModal.style.setProperty('display', 'none', 'important');
  }
  if (actionForm) actionForm.reset();
}

if (actionForm) {
  actionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const key = modalKey.value;
    let executeAction = modalExecuteAction ? modalExecuteAction.value : 'approve';
    let notes = modalNotes ? modalNotes.value.trim() : '';
    const statusTteVal = tteStatus ? tteStatus.value : '';
    const tteNotesVal = tteNotes ? tteNotes.value.trim() : '';
    const penerimaVal = modalPenerima ? modalPenerima.value.trim() : '';
    const linkFileVal = modalLinkFile ? modalLinkFile.value.trim() : '';

    if (currentUser && (currentUser.role === 'petugas_scan' || currentUser.role === 'petugas_tte')) {
      executeAction = 'approve'; // Selalu jadikan executeAction 'approve'
    }

    if (currentUser && currentUser.role === 'petugas_scan') {
      if (!linkFileVal) {
        showToast('Silakan isi link file scan PDF terlebih dahulu!', 'error');
        const submitBtn = actionForm.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = false;
        return;
      }
    }

    if (currentUser && currentUser.role === 'petugas_tte') {
      notes = tteNotesVal;
      if (statusTteVal !== 'SIAK' && !tteNotesVal) {
        showToast('Silakan isi Catatan TTE mengenai status SIAK!', 'error');
        const submitBtn = actionForm.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = false;
        return;
      }
    }

    const submitBtn = actionForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
      if (API_URL === 'local') {
        const timeStr = getLocalDateTimeString();
        const sampleItem = allData.find(d => String(d.key) === String(key));
        const fullBatch = allData.filter(d => String(d.key) === String(key));
        const isDafdukCapil = fullBatch.some(b => String(b.jenis_layanan).toLowerCase().includes('pencatatan sipil') || String(b.jenis_layanan).toLowerCase().includes('capil')) &&
                              fullBatch.some(b => String(b.jenis_layanan).toLowerCase().includes('pendaftaran penduduk'));
        const isDafdukDafduk = fullBatch.every(b => String(b.jenis_layanan).toLowerCase().includes('pendaftaran penduduk'));

        if (currentUser.role === 'petugas_scan') {
          const isUptTarget = (sampleItem && String(sampleItem.fasilitasi || '').toLowerCase().includes('upt')) || (currentUser && isUserUpt(currentUser));
          const targetNextStatus = isUptTarget ? '2_VERIFIKASI_UPT' : '2_VERIFIKASI_KASIE';
          const targetDestName = isUptTarget ? 'Kepala UPT' : 'Kepala Seksi / Kasie';

          let updatedCount = 0;
          allData.forEach(item => {
            if (String(item.key) === String(key)) {
              item.link_file = linkFileVal;
              item.catatan_scan = notes;
              item.tgl_scan = timeStr;
              item.status_alur = targetNextStatus;
              updatedCount++;
            }
          });
          const followerCount = updatedCount - 1;
          const detailStr = updatedCount > 1 ? `${updatedCount} dokumen terintegrasi (1 Mandatori + ${followerCount} Dokumen Pengikut)` : 'dokumen';
          showToast(`🎉 Berhasil! Link PDF scan pada dokumen mandatori telah mewakili & terisi untuk ${detailStr} (Kode Unik: ${key}) & seluruhnya terkirim ke Meja ${targetDestName}. Tugas scan Anda selesai dengan baik!`, 'success');
        } else if (executeAction === 'pending') {
          // PENDING ALL
          let updatedCount = 0;
          allData.forEach(item => {
            if (String(item.key) === String(key)) {
              item.status_alur = 'PENDING_OPERATOR';
              item.riwayat_pending = `PENDING by ${currentUser.role} pada ${timeStr}: ${notes}\n${item.riwayat_pending || ''}`;
              if (currentUser.role === 'kasie_capil' || currentUser.role === 'kasie_dafduk') {
                item.catatan_kasie = notes;
                item.tgl_kasie = timeStr;
              } else if (currentUser.role === 'kepala_upt') {
                item.catatan_upt = notes;
                item.tgl_upt = timeStr;
              }
              updatedCount++;
            }
          });
          showToast(`⚠️ Berhasil! Dokumen (Kode Unik: ${key}) beserta ${updatedCount > 1 ? updatedCount + ' dokumen terintegrasi' : 'berkas'} telah di-PENDING & dikembalikan ke Operator!`, 'warning');
        } else {
          // APPROVE / SELESAI
          if (currentUser.role === 'kasie_capil') {
            if (sampleItem) {
              sampleItem.status_alur = '3_VALIDASI_KABID';
              sampleItem.catatan_kasie = notes;
              sampleItem.tgl_kasie = timeStr;
            }
            showToast(`🎉 Berhasil! Dokumen Pencatatan Sipil (Kode Unik: ${key}) diverifikasi & diteruskan ke Kabid Capil. Dokumen Pendaftaran Penduduk sekarang aktif di Meja Kasie Dafduk untuk diproses selanjutnya!`, 'success');
          } else if (currentUser.role === 'kasie_dafduk') {
            let updatedDafdukCount = 0;
            allData.forEach(item => {
              if (String(item.key) === String(key)) {
                const jl = String(item.jenis_layanan || '').toLowerCase();
                if (jl.includes('dafduk') || jl.includes('pendaftaran')) {
                  item.status_alur = '3_VALIDASI_KABID';
                  item.catatan_kasie = notes;
                  item.tgl_kasie = timeStr;
                  updatedDafdukCount++;
                }
              }
            });
            showToast(`🎉 Berhasil! ${updatedDafdukCount > 1 ? updatedDafdukCount + ' Dokumen Pendaftaran Penduduk' : 'Dokumen Pendaftaran Penduduk'} (Kode Unik: ${key}) telah diverifikasi & diteruskan ke Kabid Dafduk!`, 'success');
          } else if (currentUser.role === 'kepala_upt') {
            if (isDafdukCapil) {
              allData.forEach(item => {
                if (String(item.key) === String(key)) {
                  item.catatan_upt = notes;
                  item.tgl_upt = timeStr;
                  const isCapil = String(item.jenis_layanan).toLowerCase().includes('pencatatan sipil') || String(item.jenis_layanan).toLowerCase().includes('capil');
                  if (isCapil) {
                    item.status_alur = '6_PENCETAKAN_UPT';
                  } else {
                    item.status_alur = '3_VALIDASI_KABID'; // Langsung ke Kabid Dafduk!
                  }
                }
              });
              showToast(`🎉 Berhasil! Dokumen Capil diteruskan ke Petugas Cetak UPT & Dokumen Dafduk otomatis terkirim langsung ke Kabid Dafduk!`, 'success');
            } else if (isDafdukDafduk) {
              allData.forEach(item => {
                if (String(item.key) === String(key)) {
                  item.status_alur = '3_VALIDASI_KABID';
                  item.catatan_upt = notes;
                  item.tgl_upt = timeStr;
                }
              });
              showToast(`🎉 Berhasil! Seluruh dokumen Dafduk terintegrasi (Kode Unik: ${key}) diverifikasi & diteruskan ke Kabid Dafduk!`, 'success');
            } else {
              if (sampleItem) {
                const isCapil = String(sampleItem.jenis_layanan).toLowerCase().includes('pencatatan sipil') || String(sampleItem.jenis_layanan).toLowerCase().includes('capil');
                sampleItem.status_alur = isCapil ? '6_PENCETAKAN_UPT' : '3_VALIDASI_KABID';
                sampleItem.catatan_upt = notes;
                sampleItem.tgl_upt = timeStr;
              }
              showToast(`🎉 Berhasil! Dokumen (Kode Unik: ${key}) diverifikasi & diteruskan!`, 'success');
            }
          } else if (currentUser.role === 'operator') {
            let updatedCount = 0;
            allData.forEach(item => {
              if (String(item.key) === String(key)) {
                item.status_alur = '1_PETUGAS_SCAN';
                item.tgl_operator = timeStr;
                if (notes) {
                  item.riwayat_pending = `PERBAIKAN OPERATOR pada ${timeStr}: ${notes}\n${item.riwayat_pending || ''}`;
                }
                updatedCount++;
              }
            });
            showToast(`🎉 Berhasil! Dokumen perbaikan (Kode Unik: ${key}) beserta ${updatedCount > 1 ? updatedCount + ' dokumen terintegrasi' : 'berkas'} telah dikirim ulang ke Petugas Scan!`, 'success');
          } else {
            if (sampleItem) sampleItem.status_alur = '7_SELESAI';
            showToast('Berkas berhasil diperbarui (Local)', 'success');
          }
        }

        closeModal();
        renderCounterDesk();
        renderMonitoringTable();
        renderRekapitulasi();
      } else {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'update',
            key: key,
            role: currentUser.role,
            userName: currentUser.name,
            executeAction: executeAction,
            notes: notes,
            status_tte: statusTteVal,
            penerima: penerimaVal,
            link_file: linkFileVal
          })
        });
        const result = await response.json();
        if (result.status === 'success') {
          showToast(result.message || '🎉 Berhasil! Berkas & seluruh dokumen terintegrasi telah diperbarui dan dikirim!', 'success');
          closeModal();
          loadData();
        } else {
          showToast(result.message || 'Gagal memperbarui berkas!', 'error');
        }
      }
    } catch (err) {
      console.error('Error update berkas:', err);
      showToast('Terjadi kesalahan saat memproses berkas!', 'error');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

// ================= FORMULIR PENDAFTARAN OPERATOR MODEL V2.0 =================
const DAFDUK_MANDATORY_BASE_OPTIONS = [
  "KK Baru",
  "KK Perubahan / Penggantian",
  "KK Hilang",
  "Pindah Domisili"
];

let currentDraftItems = [];

function initOperatorDraftItems() {
  const integrasiMode = formIntegrasi ? formIntegrasi.value : 'tunggal';
  
  if (integrasiMode === 'Dafduk - Capil') {
    currentDraftItems = [
      { id: 1, jenis_layanan: 'Pencatatan Sipil', sub_layanan: 'Akta Kelahiran', pemohon: '', no_hp: '', email: '', alamat: '' }
    ];
  } else if (integrasiMode === 'Dafduk - Dafduk') {
    currentDraftItems = [
      { id: 1, jenis_layanan: 'Pendaftaran Penduduk', sub_layanan: 'KK Baru', pemohon: '', no_hp: '', email: '', alamat: '' }
    ];
  } else { // 'tunggal'
    currentDraftItems = [
      { id: 1, jenis_layanan: 'Pendaftaran Penduduk', sub_layanan: 'Rekam / Cetak KTP', pemohon: '', no_hp: '', email: '', alamat: '' }
    ];
  }
  
  renderOperatorItemsCards();
}

function renderOperatorItemsCards() {
  const container = document.getElementById('operatorItemsContainer');
  const btnAddItemBtn = document.getElementById('btnAddItemBtn');
  const integrasiMode = formIntegrasi ? formIntegrasi.value : 'tunggal';

  if (!container) return;

  if (btnAddItemBtn) {
    if (integrasiMode === 'tunggal') {
      btnAddItemBtn.style.display = 'none';
    } else {
      btnAddItemBtn.style.display = 'inline-flex';
    }
  }

  let html = '';
  currentDraftItems.forEach((item, index) => {
    const isFirstItem = (index === 0);
    const itemNum = index + 1;
    const badgeColor = isFirstItem ? '#3b82f6' : '#8b5cf6';
    const badgeTitle = isFirstItem ? '📌 DOKUMEN MANDATORI UTAMA (ITEM 1 - ACUAN ALUR)' : `📄 DOKUMEN PENGIKUT TERINTEGRASI (ITEM ${itemNum})`;

    let jenisOptionsHtml = '';
    let subOptionsHtml = '';

    if (integrasiMode === 'Dafduk - Capil') {
      if (isFirstItem) {
        jenisOptionsHtml = `<option value="Pencatatan Sipil" selected>Pencatatan Sipil (Capil - MANDATORI)</option>`;
        const capilOpts = SUB_LAYANAN_OPTIONS["Pencatatan Sipil"] || [];
        subOptionsHtml = capilOpts.map(opt => `<option value="${opt}" ${item.sub_layanan === opt ? 'selected' : ''}>${opt}</option>`).join('');
      } else {
        jenisOptionsHtml = `<option value="Pendaftaran Penduduk" selected>Pendaftaran Penduduk (Dafduk)</option>`;
        const dafdukOpts = SUB_LAYANAN_OPTIONS["Pendaftaran Penduduk"] || [];
        subOptionsHtml = dafdukOpts.map(opt => `<option value="${opt}" ${item.sub_layanan === opt ? 'selected' : ''}>${opt}</option>`).join('');
      }
    } else if (integrasiMode === 'Dafduk - Dafduk') {
      jenisOptionsHtml = `<option value="Pendaftaran Penduduk" selected>Pendaftaran Penduduk (Dafduk)</option>`;
      if (isFirstItem) {
        subOptionsHtml = DAFDUK_MANDATORY_BASE_OPTIONS.map(opt => `<option value="${opt}" ${item.sub_layanan === opt ? 'selected' : ''}>${opt}</option>`).join('');
      } else {
        const dafdukOpts = SUB_LAYANAN_OPTIONS["Pendaftaran Penduduk"] || [];
        subOptionsHtml = dafdukOpts.map(opt => `<option value="${opt}" ${item.sub_layanan === opt ? 'selected' : ''}>${opt}</option>`).join('');
      }
    } else { // 'tunggal'
      jenisOptionsHtml = `
        <option value="Pendaftaran Penduduk" ${item.jenis_layanan === 'Pendaftaran Penduduk' ? 'selected' : ''}>Pendaftaran Penduduk (Dafduk)</option>
        <option value="Pencatatan Sipil" ${item.jenis_layanan === 'Pencatatan Sipil' ? 'selected' : ''}>Pencatatan Sipil (Capil)</option>
      `;
      const currentOpts = SUB_LAYANAN_OPTIONS[item.jenis_layanan] || SUB_LAYANAN_OPTIONS["Pendaftaran Penduduk"];
      subOptionsHtml = currentOpts.map(opt => `<option value="${opt}" ${item.sub_layanan === opt ? 'selected' : ''}>${opt}</option>`).join('');
    }

    html += `
      <div class="operator-item-card" data-index="${index}" style="background: rgba(15, 23, 42, 0.75); border: 1px solid ${isFirstItem ? 'rgba(59, 130, 246, 0.4)' : 'rgba(139, 92, 246, 0.3)'}; border-radius: 16px; padding: 1.25rem; margin-bottom: 1.25rem; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.06);">
          <div style="font-size: 0.82rem; font-weight: 800; color: ${badgeColor}; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 6px;">
            ${badgeTitle}
          </div>
          ${!isFirstItem ? `<button type="button" class="btn btn-danger btn-xs remove-item-btn" data-index="${index}" style="padding: 4px 12px; font-size: 0.75rem; font-weight:700;">🗑️ Hapus Dokumen Ini</button>` : ''}
        </div>

        <div class="form-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem; margin-bottom: 1.25rem;">
          <div class="form-group">
            <label style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; display: block;">Baris 3: Kategori Layanan *</label>
            <select class="item-jenis-layanan" data-index="${index}" ${integrasiMode !== 'tunggal' ? 'disabled' : ''} style="width: 100%; padding: 11px 14px; background: rgba(17, 24, 39, 0.9); border: 1px solid var(--card-border); border-radius: 10px; color: #fff; font-size: 0.9rem;">
              ${jenisOptionsHtml}
            </select>
          </div>
          
          <div class="form-group">
            <label style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; display: block;">Sub Jenis Layanan (Dropdown) *</label>
            <select class="item-sub-layanan" data-index="${index}" style="width: 100%; padding: 11px 14px; background: rgba(17, 24, 39, 0.9); border: 1px solid ${isFirstItem ? '#3b82f6' : '#8b5cf6'}; border-radius: 10px; color: #fff; font-size: 0.9rem; font-weight: 600;">
              ${subOptionsHtml}
            </select>
          </div>
        </div>

        <div style="font-size: 0.78rem; font-weight: 700; color: #a78bfa; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.75rem;">
          👤 BARIS 4: DATA DIRI PEMOHON / WARGA
        </div>
        <div class="form-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem;">
          <div class="form-group">
            <label style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; display: block;">Nama Lengkap Pemohon *</label>
            <input type="text" class="item-pemohon" data-index="${index}" value="${escapeHTML(item.pemohon)}" placeholder="Isikan nama lengkap pemohon..." style="width: 100%; padding: 11px 14px; background: rgba(0,0,0,0.25); border: 1px solid var(--card-border); border-radius: 10px; color: #fff; font-size: 0.9rem;">
          </div>
          
          <div class="form-group">
            <label style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; display: block;">Nomor HP / WhatsApp Active *</label>
            <input type="text" class="item-no-hp" data-index="${index}" value="${escapeHTML(item.no_hp)}" placeholder="08xxxxxxxxxx" style="width: 100%; padding: 11px 14px; background: rgba(0,0,0,0.25); border: 1px solid var(--card-border); border-radius: 10px; color: #fff; font-size: 0.9rem;">
          </div>

          <div class="form-group">
            <label style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; display: block;">Alamat Email (Opsional)</label>
            <input type="email" class="item-email" data-index="${index}" value="${escapeHTML(item.email)}" placeholder="pemohon@email.com" style="width: 100%; padding: 11px 14px; background: rgba(0,0,0,0.25); border: 1px solid var(--card-border); border-radius: 10px; color: #fff; font-size: 0.9rem;">
          </div>
        </div>

        <div class="form-group" style="margin-top: 1.25rem;">
          <label style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; display: block;">Alamat Lengkap Pemohon *</label>
          <textarea class="item-alamat" data-index="${index}" rows="2" placeholder="Isikan alamat domisili lengkap pemohon..." style="width: 100%; padding: 11px 14px; background: rgba(0,0,0,0.25); border: 1px solid var(--card-border); border-radius: 10px; color: #fff; font-size: 0.9rem; resize: vertical;">${escapeHTML(item.alamat)}</textarea>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  bindOperatorItemInputEvents();
}

function bindOperatorItemInputEvents() {
  document.querySelectorAll('.item-pemohon').forEach(el => {
    el.addEventListener('input', (e) => {
      const idx = parseInt(e.target.getAttribute('data-index'));
      if (currentDraftItems[idx]) currentDraftItems[idx].pemohon = e.target.value;
    });
  });
  document.querySelectorAll('.item-no-hp').forEach(el => {
    el.addEventListener('input', (e) => {
      const idx = parseInt(e.target.getAttribute('data-index'));
      if (currentDraftItems[idx]) currentDraftItems[idx].no_hp = e.target.value;
    });
  });
  document.querySelectorAll('.item-email').forEach(el => {
    el.addEventListener('input', (e) => {
      const idx = parseInt(e.target.getAttribute('data-index'));
      if (currentDraftItems[idx]) currentDraftItems[idx].email = e.target.value;
    });
  });
  document.querySelectorAll('.item-alamat').forEach(el => {
    el.addEventListener('input', (e) => {
      const idx = parseInt(e.target.getAttribute('data-index'));
      if (currentDraftItems[idx]) currentDraftItems[idx].alamat = e.target.value;
    });
  });
  document.querySelectorAll('.item-jenis-layanan').forEach(el => {
    el.addEventListener('change', (e) => {
      const idx = parseInt(e.target.getAttribute('data-index'));
      if (currentDraftItems[idx]) {
        currentDraftItems[idx].jenis_layanan = e.target.value;
        const opts = SUB_LAYANAN_OPTIONS[e.target.value] || [];
        currentDraftItems[idx].sub_layanan = opts[0] || '';
        renderOperatorItemsCards();
      }
    });
  });
  document.querySelectorAll('.item-sub-layanan').forEach(el => {
    el.addEventListener('change', (e) => {
      const idx = parseInt(e.target.getAttribute('data-index'));
      if (currentDraftItems[idx]) {
        currentDraftItems[idx].sub_layanan = e.target.value;
      }
    });
  });
  document.querySelectorAll('.remove-item-btn').forEach(el => {
    el.addEventListener('click', (e) => {
      const idx = parseInt(e.target.getAttribute('data-index'));
      if (idx > 0 && currentDraftItems.length > 1) {
        currentDraftItems.splice(idx, 1);
        renderOperatorItemsCards();
      }
    });
  });
}

// Tombol ➕ Lanjut (Tambah Dokumen)
const btnAddItemBtn = document.getElementById('btnAddItemBtn');
if (btnAddItemBtn) {
  btnAddItemBtn.addEventListener('click', () => {
    const item1 = currentDraftItems[0] || {};
    currentDraftItems.push({
      id: currentDraftItems.length + 1,
      jenis_layanan: 'Pendaftaran Penduduk',
      sub_layanan: 'KK Baru',
      pemohon: item1.pemohon || '',
      no_hp: item1.no_hp || '',
      email: item1.email || '',
      alamat: item1.alamat || ''
    });
    renderOperatorItemsCards();
    showToast(`Dokumen pengikut baru (Item ${currentDraftItems.length}) ditambahkan. Silakan isi sub layanan.`, 'info');
  });
}

// Tombol Perubahan Status Integrasi Layanan
if (formIntegrasi) {
  formIntegrasi.addEventListener('change', () => {
    initOperatorDraftItems();
  });
}

// FORM INPUT OPERATOR SUBMIT (Multi-Item Ter-sinkron Kode Unik Sama Persis)
async function handleOperatorFormSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();

  const integrasiMode = formIntegrasi ? formIntegrasi.value : 'tunggal';
  const currentSystemTime = getLocalDateTimeString();

  // 0. Synchronize latest values directly from DOM input fields
  document.querySelectorAll('.operator-item-card').forEach((card) => {
    const idx = parseInt(card.getAttribute('data-index'));
    if (!isNaN(idx) && currentDraftItems[idx]) {
      const pemohonEl = card.querySelector('.item-pemohon');
      const noHpEl = card.querySelector('.item-no-hp');
      const emailEl = card.querySelector('.item-email');
      const alamatEl = card.querySelector('.item-alamat');
      const jenisEl = card.querySelector('.item-jenis-layanan');
      const subEl = card.querySelector('.item-sub-layanan');

      if (pemohonEl) currentDraftItems[idx].pemohon = pemohonEl.value;
      if (noHpEl) currentDraftItems[idx].no_hp = noHpEl.value;
      if (emailEl) currentDraftItems[idx].email = emailEl.value;
      if (alamatEl) currentDraftItems[idx].alamat = alamatEl.value;
      if (jenisEl) currentDraftItems[idx].jenis_layanan = jenisEl.value;
      if (subEl) currentDraftItems[idx].sub_layanan = subEl.value;
    }
  });

  if (!currentDraftItems || currentDraftItems.length === 0) {
    showToast('Silakan isi formulir pendaftaran!', 'error');
    return;
  }

  // 1. Validasi Kelengkapan Setiap Item & Auto Focus
  for (let i = 0; i < currentDraftItems.length; i++) {
    const item = currentDraftItems[i];
    if (!item.pemohon || !item.pemohon.trim()) {
      showToast(`Silakan isi nama pemohon pada Dokumen Item ${i + 1}!`, 'error');
      const inputTarget = document.querySelector(`.operator-item-card[data-index="${i}"] .item-pemohon`);
      if (inputTarget) inputTarget.focus();
      return;
    }
    if (!item.no_hp || !item.no_hp.trim()) {
      showToast(`Silakan isi nomor HP/WA pada Dokumen Item ${i + 1}!`, 'error');
      const inputTarget = document.querySelector(`.operator-item-card[data-index="${i}"] .item-no-hp`);
      if (inputTarget) inputTarget.focus();
      return;
    }
    if (!item.sub_layanan || !item.sub_layanan.trim()) {
      showToast(`Silakan pilih sub layanan pada Dokumen Item ${i + 1}!`, 'error');
      return;
    }
  }

  // 2. Prioritas Mandatori Utama: Capil untuk Dafduk - Capil, Pindah Domisili untuk Dafduk - Dafduk
  if (integrasiMode === 'Dafduk - Capil') {
    const capilIdx = currentDraftItems.findIndex(it => {
      const jl = (it.jenis_layanan || '').toLowerCase();
      return jl.includes('capil') || jl.includes('pencatatan sipil');
    });
    if (capilIdx > 0) {
      const [capilItem] = currentDraftItems.splice(capilIdx, 1);
      currentDraftItems.unshift(capilItem);
      showToast('💡 Dokumen Pencatatan Sipil diutamakan sebagai Dokumen Mandatori Utama!', 'info');
    }
  } else if (integrasiMode === 'Dafduk - Dafduk' && currentDraftItems.length > 1) {
    const pindahIdx = currentDraftItems.findIndex(it => it.sub_layanan === 'Pindah Domisili');
    if (pindahIdx > 0) {
      const [pindahItem] = currentDraftItems.splice(pindahIdx, 1);
      currentDraftItems.unshift(pindahItem);
      showToast('💡 Dokumen Pindah Domisili diutamakan sebagai Dokumen Mandatori Utama!', 'info');
    }
  }

  // 3. Generate 1 Kode Unik Yang Sama Persis Untuk Seluruh Item
  const sharedKey = generateUniqueKey();
  const payloadItems = currentDraftItems.map((item, idx) => ({
    key: sharedKey,
    tanggal: currentSystemTime.slice(0, 10),
    fasilitasi: currentUser ? (isUserUpt(currentUser) ? (currentUser.uptCode || currentUser.fasilitasi || 'UPT') : 'Dinas') : 'Dinas',
    operator: currentUser ? currentUser.name || currentUser.username : 'Operator',
    userName: currentUser ? currentUser.name || currentUser.username : 'Operator',
    pemohon: item.pemohon.trim(),
    alamat: item.alamat ? item.alamat.trim() : '',
    no_hp: item.no_hp.trim(),
    email: item.email ? item.email.trim() : '',
    integrasi: integrasiMode,
    jenis_layanan: item.jenis_layanan,
    sub_layanan: item.sub_layanan,
    isMandatory: idx === 0
  }));

  const submitBtn = document.getElementById('btnSubmitForm') || (berkasForm ? berkasForm.querySelector('button') : null);
  const originalBtnText = submitBtn ? submitBtn.innerHTML : '';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '⏳ Menyimpan & Mengirim...';
  }

  try {
    if (API_URL === 'local') {
      payloadItems.forEach(it => {
        allData.unshift({ ...it, status_alur: '1_PETUGAS_SCAN' });
      });
      showToast(`🎉 Berhasil! Permohonan Terintegrasi ${integrasiMode} (${payloadItems.length} Dokumen) Kode Unik: ${sharedKey} telah terinput & terkirim ke Counter Petugas Scan.`, 'success');
      initOperatorDraftItems();
      switchPage('dashboard');
    } else {
      const fetchPromise = fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'create_batch', data: payloadItems })
      }).then(res => res.json());

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('TIMEOUT')), 8000);
      });

      let result;
      try {
        result = await Promise.race([fetchPromise, timeoutPromise]);
      } catch (netErr) {
        console.warn('Timeout/network error saat simpan online, mengaktifkan simpan lokal...', netErr);
        payloadItems.forEach(it => {
          allData.unshift({ ...it, status_alur: '1_PETUGAS_SCAN' });
        });
        result = { status: 'success', fallback: true };
      }

      if (result && result.status === 'success') {
        showToast(`🎉 Berhasil! Permohonan Terintegrasi ${integrasiMode} (${payloadItems.length} Dokumen) Kode Unik: ${sharedKey} telah terinput & terkirim ke Counter Petugas Scan.`, 'success');
        initOperatorDraftItems();
        switchPage('dashboard');
      } else {
        showToast((result && result.message) ? result.message : 'Gagal menyimpan berkas!', 'error');
      }
    }
  } catch (err) {
    console.error('Error create berkas batch:', err);
    showToast('Gagal terhubung ke server saat pendaftaran berkas!', 'error');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText || '💾 Simpan & Kirim ke Petugas Scan';
    }
  }
}

if (berkasForm) {
  berkasForm.addEventListener('submit', handleOperatorFormSubmit);
}

if (btnSubmitForm) {
  btnSubmitForm.addEventListener('click', handleOperatorFormSubmit);
}

// Reset form event
if (btnResetForm) {
  btnResetForm.addEventListener('click', () => {
    initOperatorDraftItems();
    showToast('Formulir pendaftaran berhasil direset.', 'info');
  });
}

// LOCAL DATABASE SIMULATION FALLBACK
function getLocalDB() {
  return [
    {
      key: "SM-20260906-A1B2",
      tanggal: "2026-09-06",
      fasilitasi: "Dinas",
      operator: "Operator Dinas",
      pemohon: "Budi Santoso",
      alamat: "Jl. Merdeka No. 12",
      no_hp: "081234567890",
      email: "budi@gmail.com",
      integrasi: "SIAK Terintegrasi",
      jenis_layanan: "Pendaftaran Penduduk",
      sub_layanan: "Kartu Keluarga (KK) Baru / Perubahan",
      link_file: "",
      status_alur: "1_PETUGAS_SCAN",
      status_tte: "",
      penerima: "",
      catatan_scan: "",
      catatan_kasie: "",
      catatan_kabid: "",
      catatan_kadis: "",
      catatan_upt: "",
      catatan_print: "",
      riwayat_pending: ""
    }
  ];
}

// HELPER TOAST NOTIFICATION
function showToast(message, type = 'info') {
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  setTimeout(() => {
    toast.className = 'toast';
  }, 3500);
}

function formatDate(dateStr) {
  if (!dateStr || dateStr === '-') return '-';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// Tick clock every second
setInterval(() => {
  if (formWaktuSistem && document.activeElement !== formWaktuSistem) {
    formWaktuSistem.value = getLocalDateTimeString();
  }
}, 1000);

// Auto load data saat awal & pastikan modal tertutup
closeModal();
loadData();
