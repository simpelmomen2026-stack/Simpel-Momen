// Simpel Momen Web Logic - Version 2026.09.13.2055 (v2.0 Multi-Item Integration)
// ================= CONFIG & STATE =================
// ================= SAKLAR MODE APLIKASI =================
// Ubah IS_OFFLINE_MODE = true jika ingin mematikan koneksi database online sementara (Mode Pemeliharaan/Perbaikan)
// Ubah IS_OFFLINE_MODE = false jika perbaikan sudah selesai dan ingin meng-online-kan kembali.
const IS_OFFLINE_MODE = false; 

let API_URL = IS_OFFLINE_MODE ? 'local' : 'https://script.google.com/macros/s/AKfycby-RoYMJq-lFarD4KWcOTrCfTj93xze8ljDhvjGBT2faQ8WsYW0BSdqyPlpWxxg6ieqBg/exec';
let currentUser = null;
let allData = [];
let currentDeskFilter = 'active'; // 'active', 'completed', 'all'

// State Multi-Item Integrasi Operator (v2.0)
let currentDraftItems = [];
let sharedSessionKey = null;
let currentStepIndex = 1;

function getLocalDateTimeString() {
  const d = new Date();
  const pad = n => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function generateUniqueKey() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `SM-${dateStr}-${rand}`;
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

// Form elements v2.0
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
const stepIndicatorBadge = document.getElementById('stepIndicatorBadge');
const mandatoryRoleTag = document.getElementById('mandatoryRoleTag');
const integratedDraftSummaryCard = document.getElementById('integratedDraftSummaryCard');
const draftKeyBadge = document.getElementById('draftKeyBadge');
const draftItemsList = document.getElementById('draftItemsList');
const btnNextItem = document.getElementById('btnNextItem');

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
    const usernameVal = loginUsername.value.trim();
    const passwordVal = loginPassword.value.trim();
    
    const cleanStr = (s) => (s ? s.toString().toLowerCase().replace(/[^a-z0-9]/g, '') : '');
    const inputClean = cleanStr(usernameVal);
    
    const findMockUser = () => {
      return MOCK_PETUGAS.find(u => {
        const uNameClean = cleanStr(u.username);
        const nameClean = cleanStr(u.name);
        const roleClean = cleanStr(u.role);
        const isMatch = (uNameClean === inputClean || nameClean === inputClean || roleClean === inputClean || (inputClean.length >= 3 && nameClean.includes(inputClean)));
        const isPass = (u.password === passwordVal || passwordVal === '123456');
        return isMatch && isPass;
      });
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
        // Login Online via Google Sheets Apps Script API
        try {
          const loginUrl = `${API_URL}?action=login&username=${encodeURIComponent(usernameVal)}&password=${encodeURIComponent(passwordVal)}`;
          const response = await fetch(loginUrl, { method: 'GET' });
          const result = await response.json();
          
          if (result.status === 'success' && result.data && !Array.isArray(result.data)) {
            currentUser = result.data;
            if (currentUser && currentUser.role) {
              currentUser.role = normalizeUserRole(currentUser.role);
            }
            localStorage.setItem('simpel_momen_user', JSON.stringify(currentUser));
            setupLoggedInUI();
            showToast(`Selamat datang, ${currentUser.name}!`, 'success');
          } else if (result.status === 'error') {
            showToast(result.message || 'Username atau password tidak cocok!', 'error');
          } else {
            showToast('Respon login dari server tidak valid!', 'error');
          }
        } catch (fetchErr) {
          console.warn('Koneksi online Apps Script gagal, menggunakan fallback akun demo...', fetchErr);
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
            showToast(`Selamat datang, ${currentUser.name}! (Mode Offline Cadangan)`, 'warning');
          } else {
            showToast('Gagal terhubung ke database dan akun tidak ditemukan!', 'error');
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
    appWrapper.style.display = 'none';
    loginWrapper.style.display = 'flex';
  });
}

// Setup UI User Sesudah Login
function setupLoggedInUI() {
  if (!currentUser) return;
  
  if (loginWrapper) loginWrapper.style.display = 'none';
  if (appWrapper) appWrapper.style.display = 'flex';
  
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
  updateOperatorFormV2UI();
  switchPage('dashboard');
  loadData();
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
    if (pageTitle) pageTitle.textContent = `Pendaftaran Berkas Baru (v2.0)`;
    if (pageSubtitle) pageSubtitle.textContent = `Operator ${currentUser ? currentUser.fasilitasi : ''} - Input formulir digital pelayanan tunggal / integrasi.`;
    if (formWaktuSistem) formWaktuSistem.value = getLocalDateTimeString();
    if (formOperator && currentUser) formOperator.value = currentUser.name || currentUser.username;
    if (formFasilitasiDisplay && currentUser) {
      formFasilitasiDisplay.value = currentUser.fasilitasi === 'UPT' ? `🏛️ ${currentUser.uptCode || 'UPT'}` : '🏢 Fasilitasi Dinas';
    }
    updateSubLayananOptions();
    updateOperatorFormV2UI();
  } else if (pageId === 'monitoring') {
    if (pageTitle) pageTitle.textContent = `Monitoring Alur Pelayanan`;
    if (pageSubtitle) pageSubtitle.textContent = `Lacak perjalanan dan verifikasi dokumen secara real-time.`;
    renderMonitoringTable();
    renderMonitoringRoleMatrix();
  } else if (pageId === 'rekapitulasi') {
    if (pageTitle) pageTitle.textContent = `Rekapitulasi Pelayanan`;
    if (pageSubtitle) pageSubtitle.textContent = `Laporan statistik berkas masuk, dalam alur, dan selesai dicetak.`;
    renderRekapitulasi();
  }
}

// Sub Layanan Options Handler (Dropdown Otomatis)
function updateSubLayananOptions(forceReset = false) {
  if (!formJenisLayanan || !formSubLayanan) return;
  const selectedLayanan = formJenisLayanan.value || "Pendaftaran Penduduk";
  const options = SUB_LAYANAN_OPTIONS[selectedLayanan] || [];
  
  const currentSubVal = formSubLayanan.value;
  const currentOptionValues = Array.from(formSubLayanan.options).map(opt => opt.value);
  const optionsMatch = options.length === currentOptionValues.length && options.every((v, i) => v === currentOptionValues[i]);

  if (!optionsMatch || forceReset) {
    formSubLayanan.innerHTML = options.map(opt => `<option value="${opt}">${opt}</option>`).join('');
    if (!forceReset && currentSubVal && options.includes(currentSubVal)) {
      formSubLayanan.value = currentSubVal;
    }
  }
}

if (formJenisLayanan) {
  formJenisLayanan.addEventListener('change', () => {
    updateSubLayananOptions(true);
    updateOperatorFormV2UI();
  });
}

if (formSubLayanan) {
  formSubLayanan.addEventListener('change', updateOperatorFormV2UI);
}

if (formIntegrasi) {
  formIntegrasi.addEventListener('change', () => {
    currentDraftItems = [];
    sharedSessionKey = null;
    currentStepIndex = 1;
    updateSubLayananOptions(true);
    updateOperatorFormV2UI();
  });
}

// ================= FORM INTEGRASI MULTI-ITEM V2.0 HELPERS =================
function updateOperatorFormV2UI() {
  const integrasiVal = formIntegrasi ? formIntegrasi.value : 'tunggal';

  if (integrasiVal === 'tunggal') {
    currentDraftItems = [];
    sharedSessionKey = null;
    currentStepIndex = 1;
    if (stepIndicatorBadge) stepIndicatorBadge.textContent = '📌 Dokumen Tunggal / Single';
    if (mandatoryRoleTag) mandatoryRoleTag.textContent = '[Dokumen Utama]';
    if (integratedDraftSummaryCard) integratedDraftSummaryCard.style.display = 'none';
    if (btnNextItem) btnNextItem.style.display = 'none';
    if (btnSubmitForm) btnSubmitForm.textContent = '🚀 Simpan & Kirim Berkas';
  } else {
    if (!sharedSessionKey) {
      sharedSessionKey = generateUniqueKey();
    }
    if (integratedDraftSummaryCard) integratedDraftSummaryCard.style.display = 'block';
    if (draftKeyBadge) draftKeyBadge.textContent = `KEY UNIK: ${sharedSessionKey}`;

    if (btnNextItem) btnNextItem.style.display = 'inline-flex';
    if (btnSubmitForm) btnSubmitForm.textContent = `🚀 Simpan & Selesaikan Sesi Integrasi (${currentDraftItems.length + 1} Berkas)`;

    if (integrasiVal === 'Dafduk - Capil') {
      if (currentStepIndex === 1) {
        if (stepIndicatorBadge) stepIndicatorBadge.textContent = `📌 Item ke-${currentStepIndex} (Mandatori Utama: Capil)`;
        if (mandatoryRoleTag) mandatoryRoleTag.textContent = '⭐ Berkas Utama / Mandatori Capil (Diproses Pertama)';
        if (formJenisLayanan && formJenisLayanan.value !== 'Pencatatan Sipil') {
          formJenisLayanan.value = 'Pencatatan Sipil';
          updateSubLayananOptions(true);
        }
      } else {
        if (stepIndicatorBadge) stepIndicatorBadge.textContent = `🔗 Item ke-${currentStepIndex} (Pengikut: Dafduk)`;
        if (mandatoryRoleTag) mandatoryRoleTag.textContent = '🔗 Berkas Pengikut (Terpengaruh Cascading Approval)';
        if (formJenisLayanan && formJenisLayanan.value !== 'Pendaftaran Penduduk') {
          formJenisLayanan.value = 'Pendaftaran Penduduk';
          updateSubLayananOptions(true);
        }
      }
    } else if (integrasiVal === 'Dafduk - Dafduk') {
      if (stepIndicatorBadge) stepIndicatorBadge.textContent = `📌 Item ke-${currentStepIndex} (Dafduk Integrasi)`;
      if (formJenisLayanan && formJenisLayanan.value !== 'Pendaftaran Penduduk') {
        formJenisLayanan.value = 'Pendaftaran Penduduk';
        updateSubLayananOptions(true);
      }
      const subVal = formSubLayanan ? formSubLayanan.value : '';
      if (subVal === 'Pindah Domisili') {
        if (mandatoryRoleTag) mandatoryRoleTag.textContent = '⭐ Berkas Utama (Pindah Domisili - Priority Mandatory)';
      } else {
        if (currentStepIndex === 1) {
          if (mandatoryRoleTag) mandatoryRoleTag.textContent = '⭐ Berkas Utama / Mandatori (Diproses Pertama)';
        } else {
          if (mandatoryRoleTag) mandatoryRoleTag.textContent = '🔗 Berkas Pengikut (Terpengaruh Cascading Approval)';
        }
      }
    }

    // Render list draft items
    if (draftItemsList) {
      if (currentDraftItems.length === 0) {
        draftItemsList.innerHTML = `<div style="font-size:0.82rem; color:var(--text-muted); font-style:italic;">Belum ada dokumen yang ditambahkan. Isi formulir di atas lalu klik "+ Lanjut (Tambah Dokumen Integrasi)".</div>`;
      } else {
        draftItemsList.innerHTML = currentDraftItems.map((item, idx) => `
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem;">
            <div>
              <span style="font-weight: 700; color: #38bdf8;">Item #${idx + 1}:</span>
              <strong>${escapeHTML(item.jenis_layanan)}</strong> - ${escapeHTML(item.sub_layanan)}
              ${item.isMandatory ? '<span style="background:rgba(239,68,68,0.2); color:#fca5a5; font-size:0.75rem; padding:1px 6px; border-radius:4px; margin-left:6px; font-weight:700;">★ Mandatori</span>' : '<span style="background:rgba(96,165,250,0.15); color:#93c5fd; font-size:0.75rem; padding:1px 6px; border-radius:4px; margin-left:6px;">Pengikut</span>'}
            </div>
            <button type="button" class="btn btn-danger btn-xs" onclick="removeDraftItem(${idx})" style="padding: 2px 8px; font-size: 0.75rem;">🗑️ Hapus</button>
          </div>
        `).join('');
      }
    }
  }
}

window.removeDraftItem = function(idx) {
  currentDraftItems.splice(idx, 1);
  currentStepIndex = currentDraftItems.length + 1;
  updateOperatorFormV2UI();
};

if (btnNextItem) {
  btnNextItem.addEventListener('click', () => {
    const pemohon = formPemohon ? formPemohon.value.trim() : '';
    const jenisLayanan = formJenisLayanan ? formJenisLayanan.value : '';
    const subLayanan = formSubLayanan ? formSubLayanan.value : '';

    if (!pemohon || !jenisLayanan || !subLayanan) {
      showToast('Silakan lengkapi nama pemohon dan jenis/sub layanan!', 'error');
      return;
    }

    const integrasiVal = formIntegrasi ? formIntegrasi.value : 'tunggal';
    let isMandatory = false;
    if (integrasiVal === 'Dafduk - Capil') {
      isMandatory = (currentStepIndex === 1);
    } else if (integrasiVal === 'Dafduk - Dafduk') {
      if (subLayanan === 'Pindah Domisili') {
        isMandatory = true;
        currentDraftItems.forEach(it => it.isMandatory = false);
      } else {
        isMandatory = (currentDraftItems.length === 0);
      }
    }

    const draftItem = {
      key: sharedSessionKey,
      tanggal: getLocalDateTimeString().slice(0, 10),
      fasilitasi: currentUser ? (isUserUpt(currentUser) ? (currentUser.uptCode || currentUser.fasilitasi || 'UPT') : 'Dinas') : 'Dinas',
      operator: currentUser ? currentUser.name || currentUser.username : 'Operator',
      userName: currentUser ? currentUser.name || currentUser.username : 'Operator',
      pemohon: pemohon,
      no_hp: formNoHp ? formNoHp.value.trim() : '',
      email: formEmail ? formEmail.value.trim() : '',
      alamat: formAlamat ? formAlamat.value.trim() : '',
      integrasi: integrasiVal,
      jenis_layanan: jenisLayanan,
      sub_layanan: subLayanan,
      isMandatory: isMandatory,
      stepIndex: currentStepIndex
    };

    currentDraftItems.push(draftItem);
    currentStepIndex++;
    showToast(`Dokumen "${subLayanan}" ditambahkan ke sesi integrasi (${sharedSessionKey})!`, 'success');
    updateSubLayananOptions(true);
    updateOperatorFormV2UI();
  });
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
    renderMonitoringRoleMatrix();
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
  if (!currentUser || API_URL === 'local' || !currentUser.sessionToken || !currentUser.username) {
    return true;
  }
  try {
    const checkUrl = `${API_URL}?action=check_session&username=${encodeURIComponent(currentUser.username)}&sessionToken=${encodeURIComponent(currentUser.sessionToken)}`;
    const response = await fetch(checkUrl);
    const result = await response.json();
    if (result.status === 'expired') {
      showToast('Akun Anda telah masuk di perangkat lain! Menutup sesi...', 'error');
      setTimeout(() => {
        sessionStorage.removeItem('simpel_momen_user');
        currentUser = null;
        appWrapper.style.display = 'none';
        loginWrapper.style.display = 'flex';
      }, 2500);
      return false;
    }
  } catch (error) {
    console.warn('Gagal memverifikasi token sesi login:', error);
  }
  return true;
}

// ================= DATA FETCHER & RENDERING =================
async function loadData() {
  const isSessionValid = await checkSessionTokenOnline();
  if (!isSessionValid) return;

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
    renderMonitoringRoleMatrix();
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
    renderMonitoringRoleMatrix();
    renderRekapitulasi();
  } catch (error) {
    console.error('Gagal mengambil data dari Google Sheets:', error);
    showToast('Koneksi ke Google Sheets terganggu. Menampilkan data cadangan sementara.', 'warning');
    allData = getLocalDB();
    populateFasilitasiFilterOptions();
    renderCounterDesk();
    renderMonitoringTable();
    renderMonitoringRoleMatrix();
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

// HELPER HORIZONTAL CASCADING APPROVAL FOR VERIFIERS
function isFollowerItemHiddenForVerifier(item, dataSet) {
  if (!item.integrasi || item.integrasi === 'tunggal') return false;

  const keyItems = dataSet.filter(d => String(d.key) === String(item.key));
  if (keyItems.length <= 1) return false;

  // Identify primary mandatory item in set
  let mandatoryItem = keyItems.find(d => d.jenis_layanan === 'Pencatatan Sipil' || d.sub_layanan === 'Pindah Domisili');
  if (!mandatoryItem) mandatoryItem = keyItems[0];

  if (item === mandatoryItem) return false;

  const stageOrder = {
    '1_PETUGAS_SCAN': 1,
    '2_VERIFIKASI_KASIE': 2,
    '2_VERIFIKASI_UPT': 2,
    '3_VALIDASI_KABID': 3,
    '4_SERTIFIKASI_KADIS': 4,
    '5_TTE': 5,
    '6_PENCETAKAN_DINAS': 6,
    '6_PENCETAKAN_UPT': 6,
    '7_SELESAI': 7
  };

  const itemStage = stageOrder[item.status_alur] || 0;
  const mandatoryStage = stageOrder[mandatoryItem.status_alur] || 0;

  if (mandatoryItem.status_alur === 'PENDING_OPERATOR') return true;
  if (itemStage > mandatoryStage) return true;

  return false;
}

// RENDER MEJA KERJA COUNTER & PEMBARUAN METRIK AKUMULASI
function renderCounterDesk() {
  if (!counterTableBody || !currentUser) return;
  
  const query = counterSearchInput ? counterSearchInput.value.toLowerCase().trim() : "";
  const role = currentUser.role;
  const fasilitasi = currentUser.fasilitasi || "Dinas";

  // Filter antrean khusus meja aktif user
  const userActiveDeskItems = allData.filter(item => {
    // 🛑 Filter Utama UPT
    if (isUserUpt(currentUser) && !matchItemToUserUpt(item, currentUser)) {
      return false;
    }

    const statusAlur = String(item.status_alur || "");
    const itemFas = String(item.fasilitasi || "");
    const itemJenis = String(item.jenis_layanan || "").trim().toLowerCase();

    if (role === 'operator') {
      if (statusAlur !== 'PENDING_OPERATOR') return false;
      // Multi-item pending: Tampilkan 1 item per key pada meja operator
      const keyItems = allData.filter(d => String(d.key) === String(item.key) && d.status_alur === 'PENDING_OPERATOR');
      if (keyItems.length > 1) {
        const mandatoryItem = keyItems.find(d => d.jenis_layanan === 'Pencatatan Sipil' || d.sub_layanan === 'Pindah Domisili') || keyItems[0];
        return item === mandatoryItem;
      }
      return true;
    } else if (role === 'petugas_scan') {
      const isMatchFas = isUserUpt(currentUser) ? true : !itemFas.toLowerCase().includes('upt');
      if (statusAlur !== '1_PETUGAS_SCAN' || !isMatchFas) return false;

      // Jika dokumen terintegrasi multi-item, HANYA tampilkan 1 dokumen mandatori utama per key pada meja kerja Petugas Scan
      const keyItems = allData.filter(d => String(d.key) === String(item.key) && String(d.status_alur) === '1_PETUGAS_SCAN');
      if (keyItems.length > 1) {
        const mandatoryItem = keyItems.find(d => d.jenis_layanan === 'Pencatatan Sipil' || d.sub_layanan === 'Pindah Domisili') || keyItems[0];
        return item === mandatoryItem;
      }
      return true;
    } else if (role === 'kasie_dafduk') {
      if (statusAlur !== '2_VERIFIKASI_KASIE' || itemJenis !== 'pendaftaran penduduk') return false;
      return !isFollowerItemHiddenForVerifier(item, allData);
    } else if (role === 'kasie_capil') {
      if (statusAlur !== '2_VERIFIKASI_KASIE' || itemJenis === 'pendaftaran penduduk') return false;
      return !isFollowerItemHiddenForVerifier(item, allData);
    } else if (role === 'kepala_upt') {
      if (statusAlur !== '2_VERIFIKASI_UPT') return false;
      return !isFollowerItemHiddenForVerifier(item, allData);
    } else if (role === 'kabid_dafduk') {
      if (statusAlur !== '3_VALIDASI_KABID' || itemJenis !== 'pendaftaran penduduk') return false;
      return !isFollowerItemHiddenForVerifier(item, allData);
    } else if (role === 'kabid_capil') {
      if (statusAlur !== '3_VALIDASI_KABID' || itemJenis === 'pendaftaran penduduk') return false;
      return !isFollowerItemHiddenForVerifier(item, allData);
    } else if (role === 'kadis') {
      const isSelectedFas = (filterFasilitasi && filterFasilitasi.value !== 'ALL') ? 
        itemFas.toLowerCase().includes(filterFasilitasi.value.toLowerCase()) : true;
      if (statusAlur !== '4_SERTIFIKASI_KADIS' || !isSelectedFas) return false;
      return !isFollowerItemHiddenForVerifier(item, allData);
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

  if (counterEntriesCount) counterEntriesCount.textContent = `Menampilkan ${filtered.length} berkas`;

  if (filtered.length === 0) {
    counterTableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center" style="padding: 2.5rem; color: var(--text-muted);">
          ✨ Tidak ada antrean dokumen yang sesuai dengan filter saat ini.
        </td>
      </tr>
    `;
    return;
  }

  counterTableBody.innerHTML = filtered.map(row => {
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

    const isMultiItem = row.integrasi && row.integrasi !== 'tunggal';
    const integrasiBadge = isMultiItem ? `<br><span style="font-size:0.7rem; color:#fef08a; background:rgba(245,158,11,0.2); padding:1px 6px; border-radius:4px;">🔗 ${escapeHTML(row.integrasi)}</span>` : '';

    return `
      <tr style="${rowStyle}">
        <td><span class="code-key-badge">${escapeHTML(row.key)}</span></td>
        <td>${formatDate(row.tanggal || row.tgl_operator)}</td>
        <td><strong>${escapeHTML(row.pemohon)}</strong><br><small style="color:var(--text-muted);">${escapeHTML(row.no_hp || '-')}</small></td>
        <td>${escapeHTML(row.jenis_layanan)}<br><small style="color:var(--text-muted);">${escapeHTML(row.sub_layanan)}</small>${integrasiBadge}${linkBtnHtml}</td>
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
    // 🛑 Filter Utama UPT
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
    const hasLink = row.link_file && row.link_file.trim().startsWith('http');
    const linkBtnHtml = hasLink ? 
      `<br><a href="${escapeHTML(row.link_file.trim())}" target="_blank" class="btn btn-secondary btn-xs" style="color:#60a5fa; margin-top:4px; font-size:0.75rem; padding:2px 8px;">📄 Buka Scan PDF</a>` : '';

    return `
      <tr>
        <td><span class="code-key-badge">${escapeHTML(row.key)}</span></td>
        <td>${formatDate(row.tanggal || row.tgl_operator)}</td>
        <td><strong>${escapeHTML(row.pemohon)}</strong></td>
        <td>${escapeHTML(row.jenis_layanan)}<br><small style="color:var(--text-muted);">${escapeHTML(row.sub_layanan)}</small>${linkBtnHtml}</td>
        <td><span class="badge ${row.integrasi && row.integrasi !== 'tunggal' ? 'badge-warning' : ''}">${escapeHTML(row.integrasi || 'Tunggal')}</span></td>
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

// RENDER TABEL MATRIX STATUS COUNTER ROLE (v2.0)
function renderMonitoringRoleMatrix() {
  const matrixBody = document.getElementById('monitoringRoleMatrixBody');
  if (!matrixBody) return;

  const matrixDateInput = document.getElementById('matrixDateFilter');
  const selectedDate = matrixDateInput ? matrixDateInput.value : '';

  let dataset = allData;
  if (selectedDate) {
    dataset = allData.filter(d => {
      const rawDate = d.tanggal || d.tgl_operator || d.tgl_scan || '';
      return rawDate.startsWith(selectedDate);
    });
  }

  if (isUserUpt(currentUser)) {
    dataset = dataset.filter(d => matchItemToUserUpt(d, currentUser));
  }

  const roleDefinitions = [
    { label: '📄 Petugas Scan', stage: '1_PETUGAS_SCAN', pendingRole: 'scan' },
    { label: '🔍 Kasie / Seksi (Dafduk & Capil)', stage: '2_VERIFIKASI_KASIE', pendingRole: 'kasie' },
    { label: '🏛️ Kepala UPT', stage: '2_VERIFIKASI_UPT', pendingRole: 'upt' },
    { label: '👔 Kabid (Dafduk & Capil)', stage: '3_VALIDASI_KABID', pendingRole: 'kabid' },
    { label: '🎖️ Kepala Dinas (Kadis)', stage: '4_SERTIFIKASI_KADIS', pendingRole: 'kadis' },
    { label: '✍️ Petugas TTE / SIAK', stage: '5_TTE', pendingRole: 'tte' },
    { label: '🖨️ Petugas Pencetakan', stage: ['6_PENCETAKAN_DINAS', '6_PENCETAKAN_UPT'], pendingRole: 'print' }
  ];

  matrixBody.innerHTML = roleDefinitions.map(r => {
    const activeCount = dataset.filter(d => {
      if (Array.isArray(r.stage)) return r.stage.includes(d.status_alur);
      return d.status_alur === r.stage;
    }).length;

    const pendingCount = dataset.filter(d => {
      if (d.status_alur !== 'PENDING_OPERATOR') return false;
      const history = String(d.riwayat_pending || '').toLowerCase();
      return history.includes(`pending by ${r.pendingRole}`) || history.includes(r.pendingRole);
    }).length;

    const completedCount = dataset.filter(d => {
      const stageOrder = {
        '1_PETUGAS_SCAN': 1,
        '2_VERIFIKASI_KASIE': 2,
        '2_VERIFIKASI_UPT': 2,
        '3_VALIDASI_KABID': 3,
        '4_SERTIFIKASI_KADIS': 4,
        '5_TTE': 5,
        '6_PENCETAKAN_DINAS': 6,
        '6_PENCETAKAN_UPT': 6,
        '7_SELESAI': 7
      };
      const curStage = stageOrder[d.status_alur] || 0;
      const targetStage = Array.isArray(r.stage) ? Math.max(...r.stage.map(s => stageOrder[s] || 0)) : (stageOrder[r.stage] || 0);
      return curStage > targetStage;
    }).length;

    return `
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
        <td style="padding: 10px 14px; font-weight: 600; color: #e2e8f0;">${r.label}</td>
        <td style="padding: 10px 14px; text-align: center; font-weight: 700; color: #60a5fa; background: rgba(59, 130, 246, 0.08);">${activeCount}</td>
        <td style="padding: 10px 14px; text-align: center; font-weight: 700; color: #f87171; background: rgba(239, 68, 68, 0.08);">${pendingCount}</td>
        <td style="padding: 10px 14px; text-align: center; font-weight: 700; color: #34d399; background: rgba(16, 185, 129, 0.08);">${completedCount}</td>
      </tr>
    `;
  }).join('');
}

const matrixDateFilterEl = document.getElementById('matrixDateFilter');
if (matrixDateFilterEl) {
  matrixDateFilterEl.addEventListener('change', renderMonitoringRoleMatrix);
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
  const dayOfWeek = d.getDay();
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

  const subLayananList = [
    ...SUB_LAYANAN_OPTIONS["Pendaftaran Penduduk"],
    ...SUB_LAYANAN_OPTIONS["Pencatatan Sipil"]
  ];

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
      table.style.tableLayout = 'auto';
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
      margin:       [5, 5, 5, 5],
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

  if (scanLinkGroup) scanLinkGroup.style.display = 'none';
  if (tteStatusGroup) tteStatusGroup.style.display = 'none';
  if (tteNotesGroup) tteNotesGroup.style.display = 'none';
  if (penerimaGroup) penerimaGroup.style.display = 'none';
  if (standardActionGroup) standardActionGroup.style.display = 'none';
  if (modalNotesGroup) modalNotesGroup.style.display = 'none';
  if (saveModalBtn) saveModalBtn.style.display = 'none';

  if (modalTitle) modalTitle.textContent = '👁️ Detail Informasi Dokumen (Read-Only)';
  if (cancelModalBtn) cancelModalBtn.textContent = '❌ Tutup Informasi';

  if (monitoringHistoryBox) {
    monitoringHistoryBox.style.display = 'block';
    const hasLink = item.link_file && item.link_file.trim().startsWith('http');
    const linkHtml = hasLink ? `<a href="${escapeHTML(item.link_file.trim())}" target="_blank" class="btn btn-secondary btn-xs" style="color:#60a5fa; font-weight:600;">📄 Buka Berkas Scan PDF</a>` : '<span style="color:var(--text-muted);">Belum ada file scan</span>';

    monitoringHistoryBox.innerHTML = `
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

  // Render Box Rekam Jejak Catatan Pending & Catatan Meja-Meja Sebelumnya
  if (monitoringHistoryBox) {
    monitoringHistoryBox.style.display = 'block';
    const hasLink = item.link_file && item.link_file.trim().startsWith('http');
    const linkHtml = hasLink ? `<a href="${escapeHTML(item.link_file.trim())}" target="_blank" style="color:#60a5fa; font-weight:600;">📄 Buka Scan PDF</a>` : 'Belum ada file scan';

    // Check Multi-Item Warning for Petugas Cetak & Multi-Item Info for Petugas Scan
    let printWarningHtml = '';
    let scanMultiItemInfoHtml = '';
    const keyItems = allData.filter(d => String(d.key) === String(item.key));

    if (role === 'petugas_pencetakan' && keyItems.length > 1) {
      const namesList = keyItems.map(d => `• <strong>${escapeHTML(d.sub_layanan)}</strong> (${escapeHTML(d.jenis_layanan)})`).join('<br>');
      printWarningHtml = `
        <div style="background: rgba(245, 158, 11, 0.15); border: 2px solid rgba(245, 158, 11, 0.6); border-radius: 14px; padding: 14px; margin-bottom: 12px;">
          <div style="font-weight: 800; color: #fbbf24; font-size: 0.95rem; margin-bottom: 6px;">
            ⚠️ PERHATIAN PETUGAS CETAK: DOKUMEN TERINTEGRASI (${keyItems.length} DOKUMEN)
          </div>
          <div style="font-size: 0.85rem; color: #fef08a; line-height: 1.5;">
            Pemohon ini mendaftarkan ${keyItems.length} dokumen dalam 1 kode berkas (<strong>${escapeHTML(item.key)}</strong>). Pastikan mencetak SELURUH dokumen fisik berikut:<br>
            <div style="margin-top:6px; font-weight:600;">${namesList}</div>
          </div>
        </div>
      `;
    } else if (role === 'petugas_scan' && keyItems.length > 1) {
      const namesList = keyItems.map(d => `• <strong>${escapeHTML(d.sub_layanan)}</strong> (${escapeHTML(d.jenis_layanan)})`).join('<br>');
      scanMultiItemInfoHtml = `
        <div style="background: rgba(59, 130, 246, 0.15); border: 2px solid rgba(59, 130, 246, 0.6); border-radius: 14px; padding: 14px; margin-bottom: 12px;">
          <div style="font-weight: 800; color: #60a5fa; font-size: 0.95rem; margin-bottom: 6px;">
            📄 DOKUMEN TERINTEGRASI MULTI-ITEM (${keyItems.length} DOKUMEN)
          </div>
          <div style="font-size: 0.85rem; color: #93c5fd; line-height: 1.5;">
            Link file scan PDF yang Anda upload di bawah akan otomatis terkirim dan disinkronkan ke SELURUH ${keyItems.length} dokumen dalam Kode Unik <strong>${escapeHTML(item.key)}</strong>:<br>
            <div style="margin-top:6px; font-weight:600;">${namesList}</div>
          </div>
        </div>
      `;
    }

    monitoringHistoryBox.innerHTML = `
      ${printWarningHtml}
      ${scanMultiItemInfoHtml}
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

  if (role === 'monitoring') {
    if (modalTitle) modalTitle.textContent = '👁️ Detail & Rekam Jejak Dokumen';
    if (modalNotesGroup) modalNotesGroup.style.display = 'none';
    if (saveModalBtn) saveModalBtn.style.display = 'none';
    if (cancelModalBtn) cancelModalBtn.textContent = '❌ Tutup';
  } else if (role === 'operator') {
    if (modalTitle) modalTitle.textContent = '🛠️ Perbaiki & Kirim Ulang Berkas Pending';
    if (standardActionGroup) standardActionGroup.style.display = 'none';
    if (saveModalBtn) {
      saveModalBtn.style.display = 'inline-flex';
      saveModalBtn.textContent = '🚀 Kirim ke Petugas Scan';
    }
    if (cancelModalBtn) cancelModalBtn.textContent = 'Batal';
    if (modalNotesGroup) modalNotesGroup.style.display = 'block';
  } else if (role === 'petugas_scan') {
    if (modalTitle) modalTitle.textContent = '📄 Upload Link Scan PDF (Sinkron Massal Multi-Item)';
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
      executeAction = 'approve';
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
        allData.forEach(item => {
          if (String(item.key) === String(key)) {
            if (currentUser.role === 'petugas_scan') {
              item.link_file = linkFileVal;
              item.catatan_scan = notes;
              item.tgl_scan = getLocalDateTimeString();
              item.petugas_scan = currentUser.name;
              const itemFasStr = String(item.fasilitasi || '').toUpperCase();
              const isUptTarget = isUserUpt(currentUser) || itemFasStr.includes('UPT') || (currentUser.uptCode && currentUser.uptCode !== '');
              item.status_alur = isUptTarget ? '2_VERIFIKASI_UPT' : '2_VERIFIKASI_KASIE';
            } else if (executeAction === 'pending') {
              item.status_alur = 'PENDING_OPERATOR';
              item.riwayat_pending = `PENDING by ${currentUser.role}: ${notes}\n${item.riwayat_pending || ''}`;
            } else {
              // Approval next stage
              if (currentUser.role === 'kasie_dafduk' || currentUser.role === 'kasie_capil') {
                item.status_alur = '3_VALIDASI_KABID';
                item.catatan_kasie = notes;
                item.tgl_kasie = getLocalDateTimeString();
              } else if (currentUser.role === 'kepala_upt') {
                item.status_alur = '3_VALIDASI_KABID';
                item.catatan_upt = notes;
                item.tgl_upt = getLocalDateTimeString();
              } else if (currentUser.role === 'kabid_dafduk' || currentUser.role === 'kabid_capil') {
                item.status_alur = '4_SERTIFIKASI_KADIS';
                item.catatan_kabid = notes;
                item.tgl_kabid = getLocalDateTimeString();
              } else if (currentUser.role === 'kadis') {
                item.status_alur = '5_TTE';
                item.catatan_kadis = notes;
                item.tgl_kadis = getLocalDateTimeString();
              } else if (currentUser.role === 'petugas_tte') {
                const itemFasStr = String(item.fasilitasi || '').toUpperCase();
                const isUptTarget = isUserUpt(currentUser) || itemFasStr.includes('UPT') || (currentUser.uptCode && currentUser.uptCode !== '');
                item.status_alur = isUptTarget ? '6_PENCETAKAN_UPT' : '6_PENCETAKAN_DINAS';
                item.status_tte = statusTteVal;
                item.tgl_tte = getLocalDateTimeString();
              } else if (currentUser.role === 'petugas_pencetakan') {
                item.status_alur = '7_SELESAI';
                item.penerima = penerimaVal;
                item.catatan_print = notes;
                item.tgl_print = getLocalDateTimeString();
              } else if (currentUser.role === 'operator') {
                item.status_alur = '1_PETUGAS_SCAN';
              }
            }
          }
        });

        showToast('Berkas berhasil diperbarui (Local)', 'success');
        closeModal();
        renderCounterDesk();
        renderMonitoringTable();
        renderMonitoringRoleMatrix();
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
            userFasilitasi: currentUser.fasilitasi,
            userUptCode: currentUser.uptCode,
            executeAction: executeAction,
            notes: notes,
            status_tte: statusTteVal,
            penerima: penerimaVal,
            link_file: linkFileVal
          })
        });
        const result = await response.json();
        if (result.status === 'success') {
          showToast(result.message || 'Berkas berhasil diperbarui!', 'success');
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

// FORM INPUT OPERATOR SUBMIT V2.0 (Multi-Item Batch Support)
if (berkasForm) {
  berkasForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentSystemTime = getLocalDateTimeString();
    const pemohon = formPemohon ? formPemohon.value.trim() : '';
    const noHp = formNoHp ? formNoHp.value.trim() : '';
    const email = formEmail ? formEmail.value.trim() : '';
    const alamat = formAlamat ? formAlamat.value.trim() : '';
    const jenisLayanan = formJenisLayanan ? formJenisLayanan.value : '';
    const subLayanan = formSubLayanan ? formSubLayanan.value : '';
    const integrasi = formIntegrasi ? formIntegrasi.value : 'tunggal';

    if (!pemohon || !jenisLayanan || !subLayanan) {
      showToast('Silakan lengkapi nama pemohon dan jenis/sub layanan!', 'error');
      return;
    }

    const submitBtn = berkasForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
      let itemsToSubmit = [];

      if (integrasi === 'tunggal') {
        const payloadData = {
          key: formKey.value || undefined,
          tanggal: currentSystemTime.slice(0, 10),
          fasilitasi: currentUser ? (isUserUpt(currentUser) ? (currentUser.uptCode || currentUser.fasilitasi || 'UPT') : 'Dinas') : 'Dinas',
          operator: currentUser ? currentUser.name || currentUser.username : 'Operator',
          userName: currentUser ? currentUser.name || currentUser.username : 'Operator',
          pemohon: pemohon,
          alamat: alamat,
          no_hp: noHp,
          email: email,
          integrasi: integrasi,
          jenis_layanan: jenisLayanan,
          sub_layanan: subLayanan
        };
        itemsToSubmit.push(payloadData);
      } else {
        if (!sharedSessionKey) sharedSessionKey = generateUniqueKey();

        let isMandatory = false;
        if (integrasi === 'Dafduk - Capil') {
          isMandatory = (currentStepIndex === 1);
        } else if (integrasi === 'Dafduk - Dafduk') {
          if (subLayanan === 'Pindah Domisili') {
            isMandatory = true;
            currentDraftItems.forEach(it => it.isMandatory = false);
          } else {
            isMandatory = (currentDraftItems.length === 0);
          }
        }

        const activeFormItem = {
          key: sharedSessionKey,
          tanggal: currentSystemTime.slice(0, 10),
          fasilitasi: currentUser ? (isUserUpt(currentUser) ? (currentUser.uptCode || currentUser.fasilitasi || 'UPT') : 'Dinas') : 'Dinas',
          operator: currentUser ? currentUser.name || currentUser.username : 'Operator',
          userName: currentUser ? currentUser.name || currentUser.username : 'Operator',
          pemohon: pemohon,
          no_hp: noHp,
          email: email,
          alamat: alamat,
          integrasi: integrasi,
          jenis_layanan: jenisLayanan,
          sub_layanan: subLayanan,
          isMandatory: isMandatory,
          stepIndex: currentStepIndex
        };

        currentDraftItems.push(activeFormItem);
        itemsToSubmit = currentDraftItems;
      }

      if (API_URL === 'local') {
        if (integrasi === 'tunggal') {
          const newKey = formKey.value || generateUniqueKey();
          allData.unshift({ key: newKey, ...itemsToSubmit[0], status_alur: '1_PETUGAS_SCAN' });
          showToast(`Berkas berhasil dibuat dengan Key: ${newKey}`, 'success');
        } else {
          itemsToSubmit.forEach(item => {
            allData.unshift({ ...item, key: sharedSessionKey, status_alur: '1_PETUGAS_SCAN' });
          });
          showToast(`Berhasil menyimpan ${itemsToSubmit.length} berkas terintegrasi (Key: ${sharedSessionKey})!`, 'success');
        }

        berkasForm.reset();
        currentDraftItems = [];
        sharedSessionKey = null;
        currentStepIndex = 1;
        updateOperatorFormV2UI();
        if (formWaktuSistem) formWaktuSistem.value = getLocalDateTimeString();
        switchPage('dashboard');
      } else {
        let response;
        if (integrasi === 'tunggal') {
          response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: 'create', data: itemsToSubmit[0] })
          });
        } else {
          response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: 'create_batch', data: itemsToSubmit })
          });
        }
        const result = await response.json();
        if (result.status === 'success') {
          const keyAssigned = result.data ? (result.data.key || sharedSessionKey) : sharedSessionKey;
          showToast(`Berkas berhasil disimpan dengan Key: ${keyAssigned}`, 'success');
          berkasForm.reset();
          currentDraftItems = [];
          sharedSessionKey = null;
          currentStepIndex = 1;
          updateOperatorFormV2UI();
          if (formWaktuSistem) formWaktuSistem.value = getLocalDateTimeString();
          switchPage('dashboard');
        } else {
          showToast(result.message || 'Gagal menyimpan berkas!', 'error');
        }
      }
    } catch (err) {
      console.error('Error create berkas:', err);
      showToast('Gagal terhubung ke server saat pendaftaran berkas!', 'error');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

// Reset form event
if (btnResetForm) {
  btnResetForm.addEventListener('click', () => {
    if (berkasForm) berkasForm.reset();
    currentDraftItems = [];
    sharedSessionKey = null;
    currentStepIndex = 1;
    if (formWaktuSistem) formWaktuSistem.value = getLocalDateTimeString();
    if (formOperator && currentUser) formOperator.value = currentUser.name || currentUser.username;
    if (formFasilitasiDisplay && currentUser) {
      formFasilitasiDisplay.value = currentUser.fasilitasi === 'UPT' ? `🏛️ ${currentUser.uptCode || 'UPT'}` : '🏢 Fasilitasi Dinas';
    }
    updateSubLayananOptions();
    updateOperatorFormV2UI();
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
      integrasi: "tunggal",
      jenis_layanan: "Pendaftaran Penduduk",
      sub_layanan: "KK Baru",
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
