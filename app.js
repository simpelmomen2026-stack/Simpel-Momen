// ================= CONFIG & STATE =================
// Hapus cache 'local' atau 'localhost' lama dari browser agar selalu terhubung online ke Google Sheets
if (localStorage.getItem('simpel_momen_api_url') && (localStorage.getItem('simpel_momen_api_url').includes('localhost') || localStorage.getItem('simpel_momen_api_url') === 'local')) {
  localStorage.removeItem('simpel_momen_api_url');
}

let API_URL = 'https://script.google.com/macros/s/AKfycbwb-GMpH8UYImv4np9MDLHgeixCjGbCI4IXUF-8X3KASSZY7MQdv7cSmA-Vyiy5yVXTIg/exec';
let currentUser = null;
let allData = [];

function getLocalDateTimeString() {
  const d = new Date();
  const pad = n => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

const SUB_LAYANAN_OPTIONS = {
  "Pendaftaran Penduduk": [
    "Biodata Penduduk",
    "Kartu Keluarga (KK) Baru / Perubahan",
    "KTP-el Baru / Cetak Ulang",
    "Kartu Identitas Anak (KIA)",
    "Surat Pindah (SKPWNI) / Kedatangan",
    "Identitas Kependudukan Digital (IKD)"
  ],
  "Pencatatan Sipil": [
    "Akta Kelahiran",
    "Akta Kematian",
    "Akta Perkawinan",
    "Akta Perceraian",
    "Akta Pengesahan / Pengakuan Anak",
    "Pembetulan / Pembatalan Akta Pencatatan Sipil"
  ]
};

// ================= DOM ELEMENTS =================
// Layout wrappers
const loginWrapper = document.getElementById('loginWrapper');
const appWrapper = document.getElementById('appWrapper');
const loginForm = document.getElementById('loginForm');
const loginUsername = document.getElementById('loginUsername');
const loginPassword = document.getElementById('loginPassword');
const logoutBtn = document.getElementById('logoutBtn');

// Nav links
const navLinks = document.querySelectorAll('.nav-link');
const menuDashboard = document.getElementById('menuDashboard');
const menuInputForm = document.getElementById('menuInputForm');
const menuMonitoring = document.getElementById('menuMonitoring');
const menuRekapitulasi = document.getElementById('menuRekapitulasi');

// Page Title
const pageTitle = document.getElementById('pageTitle');
const pageSubtitle = document.getElementById('pageSubtitle');

// User details sidebar
const userAvatar = document.getElementById('userAvatar');
const userDisplayName = document.getElementById('userDisplayName');
const userRoleBadge = document.getElementById('userRoleBadge');

// Top action panels
const configPanel = document.getElementById('configPanel');
const toggleConfigBtn = document.getElementById('toggleConfigBtn');
const apiUrlInput = document.getElementById('apiUrlInput');
const saveConfigBtn = document.getElementById('saveConfigBtn');
const useLocalSimBtn = document.getElementById('useLocalSimBtn');
const connectionStatus = document.getElementById('connectionStatus');
const refreshBtn = document.getElementById('refreshBtn');

// Dashboard Page elements
const lblMetric1 = document.getElementById('lblMetric1');
const lblMetric2 = document.getElementById('lblMetric2');
const lblMetric3 = document.getElementById('lblMetric3');
const valMetric1 = document.getElementById('valMetric1');
const valMetric2 = document.getElementById('valMetric2');
const valMetric3 = document.getElementById('valMetric3');
const counterEntriesCount = document.getElementById('counterEntriesCount');
const counterTableBody = document.getElementById('counterTableBody');
const counterSearchInput = document.getElementById('counterSearchInput');

// Form Input Page elements
const berkasForm = document.getElementById('berkasForm');
const formKey = document.getElementById('formKey');
const formRiwayatPending = document.getElementById('formRiwayatPending');
const formTanggal = document.getElementById('formTanggal');
const formOperator = document.getElementById('formOperator');
const formPemohon = document.getElementById('formPemohon');
const formNoHp = document.getElementById('formNoHp');
const formEmail = document.getElementById('formEmail');
const formIntegrasi = document.getElementById('formIntegrasi');
const formAlamat = document.getElementById('formAlamat');
const formJenisLayanan = document.getElementById('formJenisLayanan');
const formSubLayanan = document.getElementById('formSubLayanan');
const formLinkFile = document.getElementById('formLinkFile');
const btnSubmitForm = document.getElementById('btnSubmitForm');
const btnResetForm = document.getElementById('btnResetForm');

// Monitoring Page elements
const filterFasilitasi = document.getElementById('filterFasilitasi');
const monitoringSearchInput = document.getElementById('monitoringSearchInput');
const monitoringCount = document.getElementById('monitoringCount');
const monitoringTableBody = document.getElementById('monitoringTableBody');

// Rekapitulasi Page elements
const rekapTotal = document.getElementById('rekapTotal');
const rekapSelesai = document.getElementById('rekapSelesai');
const rekapProses = document.getElementById('rekapProses');
const rekapTableBody = document.getElementById('rekapTableBody');

// Action Modal elements
const actionModal = document.getElementById('actionModal');
const modalTitle = document.getElementById('modalTitle');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const actionForm = document.getElementById('actionForm');
const modalKey = document.getElementById('modalKey');
const modalKodeText = document.getElementById('modalKodeText');
const modalPemohonText = document.getElementById('modalPemohonText');
const modalLayananText = document.getElementById('modalLayananText');
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

// Toast
const toast = document.getElementById('toast');

// ================= INITIALIZATION & ROUTING =================
if (apiUrlInput) apiUrlInput.value = API_URL;
updateConnectionIndicator();

// Normalisasi Peran (Role) Petugas dari Sheet ke Kode Teknis Sistem
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

// Cek session login dari sessionStorage
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

// Event: Login Submit (Mendukung Login Online & Fallback Offline)
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const usernameVal = loginUsername.value.trim().toLowerCase();
    const passwordVal = loginPassword.value.trim();
    
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : 'Masuk';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Memverifikasi...';
    }
    
    try {
      if (API_URL === 'local') {
        const user = MOCK_PETUGAS.find(u => {
          const uName = u.username.toLowerCase();
          const nameVal = u.name.toLowerCase();
          const roleVal = u.role.toLowerCase();
          return (uName === usernameVal || nameVal === usernameVal || roleVal === usernameVal) && (u.password === passwordVal || passwordVal === '123456');
        });
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
          const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify({
              action: 'login',
              username: usernameVal,
              password: passwordVal
            })
          });
          const result = await response.json();
          if (result.status === 'success') {
            currentUser = result.data;
            if (currentUser && currentUser.role) {
              currentUser.role = normalizeUserRole(currentUser.role);
            }
            sessionStorage.setItem('simpel_momen_user', JSON.stringify(currentUser));
            setupLoggedInUI();
            showToast(`Selamat datang, ${currentUser.name}!`, 'success');
          } else {
            showToast(result.message || 'Username atau password tidak cocok!', 'error');
          }
        } catch (fetchErr) {
          console.warn('Koneksi online Apps Script gagal, menggunakan fallback akun demo...', fetchErr);
          const user = MOCK_PETUGAS.find(u => {
            const uName = u.username.toLowerCase();
            const nameVal = u.name.toLowerCase();
            const roleVal = u.role.toLowerCase();
            return (uName === usernameVal || nameVal === usernameVal || roleVal === usernameVal) && (u.password === passwordVal || passwordVal === '123456');
          });
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
  
  loginWrapper.style.display = 'none';
  appWrapper.style.display = 'flex';
  
  userDisplayName.textContent = currentUser.name;
  
  const initials = currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  userAvatar.textContent = initials || 'OP';

  const roleTitleMap = {
    'operator': `Operator ${currentUser.fasilitasi} ${currentUser.uptCode || ''}`.trim(),
    'petugas_scan': `Petugas Scan ${currentUser.fasilitasi} ${currentUser.uptCode || ''}`.trim(),
    'kasie_dafduk': 'Kasie Dafduk Dinas',
    'kasie_capil': 'Kasie Capil Dinas',
    'kepala_upt': `Kepala ${currentUser.uptCode || 'UPT'}`,
    'kabid_dafduk': 'Kabid Dafduk',
    'kabid_capil': 'Kabid Capil',
    'kadis': 'Kepala Dinas (Kadis)',
    'petugas_tte': 'Petugas TTE Dinas',
    'petugas_pencetakan': `Petugas Cetak ${currentUser.fasilitasi} ${currentUser.uptCode || ''}`.trim(),
    'monitoring': `Monitoring ${currentUser.fasilitasi}`
  };

  userRoleBadge.textContent = roleTitleMap[currentUser.role] || currentUser.role;

  if (currentUser.role === 'operator') {
    menuInputForm.style.display = 'flex';
    formOperator.value = currentUser.name;
  } else {
    menuInputForm.style.display = 'none';
  }

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
    pageTitle.textContent = `Kerja Counter: ${currentUser ? currentUser.name : ''}`;
    pageSubtitle.textContent = `Daftar dokumen antrean pelayanan yang membutuhkan tindakan Anda.`;
  } else if (pageId === 'input-form') {
    pageTitle.textContent = `Pendaftaran Berkas Baru`;
    pageSubtitle.textContent = `Operator ${currentUser ? currentUser.fasilitasi : ''} - Input formulir digital pelayanan.`;
  } else if (pageId === 'monitoring') {
    pageTitle.textContent = `Monitoring Alur Pelayanan`;
    pageSubtitle.textContent = `Lacak perjalanan dan verifikasi dokumen secara real-time.`;
    renderMonitoringTable();
  } else if (pageId === 'rekapitulasi') {
    pageTitle.textContent = `Rekapitulasi Pelayanan`;
    pageSubtitle.textContent = `Laporan statistik berkas masuk, dalam alur, dan selesai dicetak.`;
    renderRekapitulasi();
  }
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

function updateConnectionIndicator() {
  if (!connectionStatus) return;
  if (API_URL === 'local') {
    connectionStatus.innerHTML = '<span class="status-indicator offline" style="background:var(--danger); box-shadow: 0 0 8px var(--danger);"></span> Mode Simulasi Browser Offline.';
  } else {
    connectionStatus.innerHTML = '<span class="status-indicator online"></span> 🟢 Terhubung ke live jembatan Google Sheets asli.';
  }
}

// Check Single Device Token Online
async function checkSessionTokenOnline() {
  if (!currentUser || API_URL === 'local' || !currentUser.sessionToken || !currentUser.username) {
    return true;
  }
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'check_session',
        username: currentUser.username,
        sessionToken: currentUser.sessionToken
      })
    });
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

        </td>
        <td style="font-weight: 600; color: #a78bfa;">${escapeHTML(row.stage)}</td>
        <td>
          <span class="badge ${statusClass}">${escapeHTML(row.status)}</span>
        </td>
        <td style="font-size: 0.9rem; color: var(--text-muted);">${escapeHTML(row.keterangan) || '-'}</td>
        <td class="text-center">
          <button class="btn btn-secondary btn-xs" onclick="openActionModal('${row.key}', '${escapeHTML(row.nama)}', '${escapeHTML(row.noAntrian)}', '${escapeHTML(row.fasilitasi)}', '${escapeHTML(row.stage)}', '${escapeHTML(row.status)}', '${escapeHTML(row.keterangan)}')">
            ✏️ Tindak Lanjut
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// RENDER MONITORING ALUR KANBAN PIPELINE BOARD
function renderAlurBoard(data) {
  const containerOperator = document.getElementById('cardsOperator');
  const containerKasie = document.getElementById('cardsKasie');
  const containerKabid = document.getElementById('cardsKabid');
  const containerKadis = document.getElementById('cardsKadis');
  const containerSelesai = document.getElementById('cardsSelesai');
  
  const countOp = document.getElementById('countStageOperator');
  const countKasie = document.getElementById('countStageKasie');
  const countKabid = document.getElementById('countStageKabid');
  const countKadis = document.getElementById('countStageKadis');
  const countSelesai = document.getElementById('countStageSelesai');

  const groups = {
    Operator: [],
    Kasie: [],
    Kabid: [],
    Kadis: [],
    Selesai: []
  };

  data.forEach(item => {
    const st = String(item.stage).toLowerCase();
    if (st.includes('op')) groups.Operator.push(item);
    else if (st.includes('kasie')) groups.Kasie.push(item);
    else if (st.includes('kabid')) groups.Kabid.push(item);
    else if (st.includes('kadis')) groups.Kadis.push(item);
    else groups.Selesai.push(item);
  });

  countOp.textContent = groups.Operator.length;
  countKasie.textContent = groups.Kasie.length;
  countKabid.textContent = groups.Kabid.length;
  countKadis.textContent = groups.Kadis.length;
  countSelesai.textContent = groups.Selesai.length;

  containerOperator.innerHTML = renderKanbanCardGroup(groups.Operator);
  containerKasie.innerHTML = renderKanbanCardGroup(groups.Kasie);
  containerKabid.innerHTML = renderKanbanCardGroup(groups.Kabid);
  containerKadis.innerHTML = renderKanbanCardGroup(groups.Kadis);
  containerSelesai.innerHTML = renderKanbanCardGroup(groups.Selesai);
}

function renderKanbanCardGroup(items) {
  if (items.length === 0) {
    return `<div style="text-align:center; padding: 1.5rem; color: var(--text-muted); font-size: 0.85rem;">Kosong</div>`;
  }

  return items.map(row => {
    const statusClass = String(row.status).trim().toLowerCase() === 'selesai' ? 'selesai' : 'pending';
    const fasilitasiClass = String(row.fasilitasi).trim().toLowerCase().includes('upt') ? 'badge-upt' : 'fasilitasi-dinas';

    return `
      <div class="kanban-card-item">
        <div class="card-top">
          <span class="card-antrean">${escapeHTML(row.noAntrian)}</span>
          <span class="badge ${fasilitasiClass}">${escapeHTML(row.fasilitasi)}</span>
        </div>
        <div class="card-nama">${escapeHTML(row.nama)}</div>
        <div class="card-layanan">${escapeHTML(row.layanan)}</div>
        <div class="card-footer">
          <span class="badge ${statusClass}">${escapeHTML(row.status)}</span>
          <button class="btn btn-secondary btn-xs" onclick="openActionModal('${row.key}', '${escapeHTML(row.nama)}', '${escapeHTML(row.noAntrian)}', '${escapeHTML(row.fasilitasi)}', '${escapeHTML(row.stage)}', '${escapeHTML(row.status)}', '${escapeHTML(row.keterangan)}')">
            ✏️
          </button>
        </div>
      </div>
    `;
  }).join('');
}

window.openActionModal = function(key, nama, noAntrian, fasilitasi, stage, status, keterangan) {
  modalKey.value = key;
  modalNama.textContent = nama;
  modalNoAntrean.textContent = noAntrian;
  modalFasilitasi.value = fasilitasi || 'Fasilitasi Dinas';
  modalStage.value = stage || 'Kadis';
  modalStatus.value = status || 'Pending';
  modalKeterangan.value = (keterangan === 'undefined' || !keterangan) ? '' : keterangan;
  
  actionModal.style.display = 'flex';
};

function closeModal() {
  actionModal.style.display = 'none';
  actionForm.reset();
}

function formatDate(dateStr) {
  if (!dateStr || dateStr === '-') return '-';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
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

loadData();
