// ================= CONFIG & STATE =================
// Hapus cache API_URL lama dari localStorage agar selalu terhubung 100% ONLINE ke Google Sheets
localStorage.removeItem('simpel_momen_api_url');

let API_URL = 'https://script.google.com/macros/s/AKfycby-RoYMJq-lFarD4KWcOTrCfTj93xze8ljDhvjGBT2faQ8WsYW0BSdqyPlpWxxg6ieqBg/exec';
let currentUser = null;
let allData = [];
let currentDeskFilter = 'active'; // 'active', 'completed', 'all'

function getLocalDateTimeString() {
  const d = new Date();
  const pad = n => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
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

const savedUser = sessionStorage.getItem('simpel_momen_user');
if (savedUser) {
  try {
    currentUser = JSON.parse(savedUser);
    if (currentUser && currentUser.role) {
      currentUser.role = normalizeUserRole(currentUser.role);
    }
    setupLoggedInUI();
  } catch (e) {
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
          sessionStorage.setItem('simpel_momen_user', JSON.stringify(currentUser));
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
            sessionStorage.setItem('simpel_momen_user', JSON.stringify(currentUser));
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
            sessionStorage.setItem('simpel_momen_user', JSON.stringify(currentUser));
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
  logoutBtn.addEventListener('click', () => {
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
    if (pageTitle) pageTitle.textContent = `Pendaftaran Berkas Baru`;
    if (pageSubtitle) pageSubtitle.textContent = `Operator ${currentUser ? currentUser.fasilitasi : ''} - Input formulir digital pelayanan.`;
    if (formWaktuSistem) formWaktuSistem.value = getLocalDateTimeString();
    if (formOperator && currentUser) formOperator.value = currentUser.name || currentUser.username;
    if (formFasilitasiDisplay && currentUser) {
      formFasilitasiDisplay.value = currentUser.fasilitasi === 'UPT' ? `🏛️ ${currentUser.uptCode || 'UPT'}` : '🏢 Fasilitasi Dinas';
    }
    updateSubLayananOptions();
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

// RENDER MEJA KERJA COUNTER & PEMBARUAN METRIK AKUMULASI
function renderCounterDesk() {
  if (!counterTableBody || !currentUser) return;
  
  const query = counterSearchInput ? counterSearchInput.value.toLowerCase().trim() : "";
  const role = currentUser.role;
  const fasilitasi = currentUser.fasilitasi || "Dinas";

  // Filter antrean khusus meja aktif user
  const userActiveDeskItems = allData.filter(item => {
    const statusAlur = String(item.status_alur || "");
    const itemFas = String(item.fasilitasi || "");
    const itemJenis = String(item.jenis_layanan || "").trim().toLowerCase();

    if (role === 'operator') {
      return statusAlur === 'PENDING_OPERATOR';
    } else if (role === 'petugas_scan') {
      if (fasilitasi === 'UPT') return statusAlur === '1_PETUGAS_SCAN' && itemFas.toLowerCase().includes('upt');
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
  const countActiveDesk = userActiveDeskItems.length;
  const countPendingAll = allData.filter(d => String(d.status_alur).includes('PENDING')).length;
  const countCompletedAll = allData.filter(d => String(d.status_alur).includes('7_SELESAI')).length;

  if (valMetric1) valMetric1.textContent = countActiveDesk;
  if (valMetric2) valMetric2.textContent = countPendingAll;
  if (valMetric3) valMetric3.textContent = countCompletedAll;

  // Filter tampilan tabel berdasarkan Tab (Active, Completed, All) & Pencarian
  const filtered = allData.filter(item => {
    const keyMatch = String(item.key || "").toLowerCase().includes(query);
    const pemohonMatch = String(item.pemohon || "").toLowerCase().includes(query);
    const jenisMatch = String(item.jenis_layanan || "").toLowerCase().includes(query);
    const subMatch = String(item.sub_layanan || "").toLowerCase().includes(query);
    
    const matchesSearch = !query || keyMatch || pemohonMatch || jenisMatch || subMatch;
    if (!matchesSearch) return false;

    if (currentDeskFilter === 'active') {
      return userActiveDeskItems.includes(item);
    } else if (currentDeskFilter === 'completed') {
      return String(item.status_alur) === '7_SELESAI';
    } else if (currentDeskFilter === 'all') {
      return true;
    }
    return true;
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

    // Tombol Akses Tindakan
    let actionBtnHtml = '';
    if (isSelesai) {
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

    return `
      <tr style="${rowStyle}">
        <td><span class="code-key-badge">${escapeHTML(row.key)}</span></td>
        <td>${formatDate(row.tanggal || row.tgl_operator)}</td>
        <td><strong>${escapeHTML(row.pemohon)}</strong><br><small style="color:var(--text-muted);">${escapeHTML(row.no_hp || '-')}</small></td>
        <td>${escapeHTML(row.jenis_layanan)}<br><small style="color:var(--text-muted);">${escapeHTML(row.sub_layanan)}</small>${linkBtnHtml}</td>
        <td><span class="badge ${row.integrasi && row.integrasi.includes('Non') ? 'badge-upt' : 'fasilitasi-dinas'}">${escapeHTML(row.integrasi || 'SIAK')}</span></td>
        <td style="font-weight: 600; color: #a78bfa;">${escapeHTML(row.status_alur)}</td>
        <td class="text-center">${actionBtnHtml}</td>
      </tr>
    `;
  }).join('');
}

// RENDER MONITORING ALUR TABLE
function renderMonitoringTable() {
  if (!monitoringTableBody) return;
  
  const query = monitoringSearchInput ? monitoringSearchInput.value.toLowerCase().trim() : "";
  const filterFas = filterFasilitasi ? filterFasilitasi.value : "ALL";

  const filtered = allData.filter(item => {
    const keyMatch = String(item.key || "").toLowerCase().includes(query);
    const pemohonMatch = String(item.pemohon || "").toLowerCase().includes(query);
    const jenisMatch = String(item.jenis_layanan || "").toLowerCase().includes(query);
    const subMatch = String(item.sub_layanan || "").toLowerCase().includes(query);
    const matchesSearch = !query || keyMatch || pemohonMatch || jenisMatch || subMatch;
    
    let matchesFas = true;
    if (filterFas !== 'ALL') {
      matchesFas = String(item.fasilitasi || "").toLowerCase().includes(filterFas.toLowerCase());
    }
    
    return matchesSearch && matchesFas;
  });

  if (monitoringCount) monitoringCount.textContent = `Menampilkan ${filtered.length} berkas`;

  if (filtered.length === 0) {
    monitoringTableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center" style="padding: 2.5rem; color: var(--text-muted);">
          Tidak ditemukan data dokumen.
        </td>
      </tr>
    `;
    return;
  }

  monitoringTableBody.innerHTML = filtered.map(row => {
    const isSelesai = row.status_alur === '7_SELESAI';
    const isPending = row.status_alur === 'PENDING_OPERATOR';
    const statusBadge = isSelesai ? '<span class="badge selesai">✅ Selesai</span>' : 
                        isPending ? '<span class="badge pending">⚠️ Pending Operator</span>' : 
                        '<span class="badge" style="background:rgba(59,130,246,0.2); color:#60a5fa;">⏳ Dalam Alur</span>';

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
      </tr>
    `;
  }).join('');
}

// RENDER REKAPITULASI
function renderRekapitulasi() {
  if (!rekapTableBody) return;

  const total = allData.length;
  const selesai = allData.filter(d => d.status_alur === '7_SELESAI').length;
  const proses = total - selesai;

  if (rekapTotal) rekapTotal.textContent = total;
  if (rekapSelesai) rekapSelesai.textContent = selesai;
  if (rekapProses) rekapProses.textContent = proses;

  const statsByLayanan = {};
  allData.forEach(item => {
    const lay = item.jenis_layanan || "Lainnya";
    if (!statsByLayanan[lay]) statsByLayanan[lay] = { total: 0, selesai: 0, proses: 0 };
    statsByLayanan[lay].total++;
    if (item.status_alur === '7_SELESAI') statsByLayanan[lay].selesai++;
    else statsByLayanan[lay].proses++;
  });

  const keys = Object.keys(statsByLayanan);
  if (keys.length === 0) {
    rekapTableBody.innerHTML = `<tr><td colspan="5" class="text-center" style="padding:2rem;">Belum ada data rekapitulasi</td></tr>`;
    return;
  }

  rekapTableBody.innerHTML = keys.map(k => {
    const s = statsByLayanan[k];
    const percentage = s.total > 0 ? Math.round((s.selesai / s.total) * 100) : 0;
    return `
      <tr>
        <td><strong>${escapeHTML(k)}</strong></td>
        <td class="text-center"><span class="badge" style="background:rgba(255,255,255,0.1);">${s.total}</span></td>
        <td class="text-center"><span class="badge selesai">${s.selesai}</span></td>
        <td class="text-center"><span class="badge" style="background:rgba(59,130,246,0.2); color:#60a5fa;">${s.proses}</span></td>
        <td class="text-center"><strong>${percentage}%</strong></td>
      </tr>
    `;
  }).join('');
}

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

  // Dinamiskan nama tombol eksekusi
  if (saveModalBtn) {
    if (role === 'petugas_scan') {
      saveModalBtn.textContent = '📄 Simpan Link & Kirim ke Verifikasi';
      saveModalBtn.className = 'btn btn-primary';
    } else if (role === 'petugas_pencetakan') {
      saveModalBtn.textContent = '🎉 Simpan & Selesaikan Cetak Dokumen';
      saveModalBtn.className = 'btn btn-success';
    } else if (role === 'operator') {
      saveModalBtn.textContent = '🚀 Simpan & Kirim Ulang Berkas';
      saveModalBtn.className = 'btn btn-primary';
    } else {
      saveModalBtn.textContent = '💾 Simpan & Setujui Verifikasi';
      saveModalBtn.className = 'btn btn-primary';
    }
  }

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
  if (actionModal) actionModal.style.display = 'none';
  if (actionForm) actionForm.reset();
}

if (actionForm) {
  actionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const key = modalKey.value;
    const executeAction = modalExecuteAction ? modalExecuteAction.value : 'approve';
    const notes = modalNotes ? modalNotes.value.trim() : '';
    const statusTteVal = tteStatus ? tteStatus.value : '';
    const penerimaVal = modalPenerima ? modalPenerima.value.trim() : '';
    const linkFileVal = modalLinkFile ? modalLinkFile.value.trim() : '';

    const submitBtn = actionForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
      if (API_URL === 'local') {
        const item = allData.find(d => String(d.key) === String(key));
        if (item) {
          if (currentUser.role === 'petugas_scan') {
            item.link_file = linkFileVal;
          }
          if (executeAction === 'pending') {
            item.status_alur = 'PENDING_OPERATOR';
            item.riwayat_pending = `PENDING by ${currentUser.role}: ${notes}\n${item.riwayat_pending || ''}`;
          } else {
            item.status_alur = '7_SELESAI';
          }
        }
        showToast('Berkas berhasil diperbarui (Local)', 'success');
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

// FORM INPUT OPERATOR SUBMIT (Ter-sinkron Waktu Sistem Presisi)
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

    const payloadData = {
      tanggal: currentSystemTime.slice(0, 10),
      fasilitasi: currentUser ? currentUser.fasilitasi || 'Dinas' : 'Dinas',
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

    const submitBtn = berkasForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
      if (API_URL === 'local') {
        const newKey = `SM-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.random().toString(36).substr(2,4).toUpperCase()}`;
        allData.unshift({ key: newKey, ...payloadData, status_alur: '1_PETUGAS_SCAN' });
        showToast(`Berkas berhasil dibuat dengan Key: ${newKey}`, 'success');
        berkasForm.reset();
        if (formWaktuSistem) formWaktuSistem.value = getLocalDateTimeString();
        switchPage('dashboard');
      } else {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'create', data: payloadData })
        });
        const result = await response.json();
        if (result.status === 'success') {
          showToast(`Berkas berhasil dibuat dengan Key: ${result.data.key}`, 'success');
          berkasForm.reset();
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
    if (formWaktuSistem) formWaktuSistem.value = getLocalDateTimeString();
    if (formOperator && currentUser) formOperator.value = currentUser.name || currentUser.username;
    if (formFasilitasiDisplay && currentUser) {
      formFasilitasiDisplay.value = currentUser.fasilitasi === 'UPT' ? `🏛️ ${currentUser.uptCode || 'UPT'}` : '🏢 Fasilitasi Dinas';
    }
    updateSubLayananOptions();
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

// Auto load data saat awal
loadData();
