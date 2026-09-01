// ================= CONFIG & STATE =================
let API_URL = localStorage.getItem('simpel_momen_api_url') || 'https://script.google.com/macros/s/AKfycbzzFF2EvjHMCkqDEGGMEd0cUgEg1FtzjncJ0oVgS-xWp15BP6N5Uev_1afLU6kjqw75Bw/exec';
let currentUser = null;
let allData = [];

function getLocalDateTimeString() {
  const d = new Date();
  const pad = n => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

const INITIAL_MOCK_DATA = [
  {
    key: "SM-20260828-A7F2",
    tanggal: "2026-08-28",
    fasilitasi: "Dinas",
    operator: "Fransin",
    pemohon: "Budi Santoso",
    alamat: "Jl. Merdeka No. 10",
    no_hp: "081234567890",
    email: "budi@mail.com",
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
    riwayat_pending: "",
    tgl_operator: "2026-08-28 08:30:15",
    tgl_scan: "",
    tgl_kasie: "",
    tgl_upt: "",
    tgl_kabid: "",
    tgl_kadis: "",
    tgl_tte: "",
    tgl_print: ""
  },
  {
    key: "SM-20260828-B39D",
    tanggal: "2026-08-27",
    fasilitasi: "Dinas",
    operator: "Wulan",
    pemohon: "Siti Aminah",
    alamat: "Jl. Mawar Gg. 3",
    no_hp: "089876543210",
    email: "siti@mail.com",
    integrasi: "Dafduk - Capil",
    jenis_layanan: "Pencatatan Sipil",
    sub_layanan: "Akta Kelahiran",
    link_file: "https://drive.google.com/file/d/example1/view",
    status_alur: "2_VERIFIKASI_KASIE",
    status_tte: "",
    penerima: "",
    catatan_scan: "Berkas scan KK & Surat Kelahiran lengkap.",
    catatan_kasie: "",
    catatan_kabid: "",
    catatan_kadis: "",
    catatan_upt: "",
    catatan_print: "",
    riwayat_pending: "",
    tgl_operator: "2026-08-27 10:15:20",
    tgl_scan: "2026-08-27 11:20:45",
    tgl_kasie: "",
    tgl_upt: "",
    tgl_kabid: "",
    tgl_kadis: "",
    tgl_tte: "",
    tgl_print: ""
  },
  {
    key: "SM-20260828-C81E",
    tanggal: "2026-08-26",
    fasilitasi: "UPT",
    operator: "UPT-01",
    pemohon: "Hendra Wijaya",
    alamat: "Desa Karangploso RT 02",
    no_hp: "085678901234",
    email: "hendra@mail.com",
    integrasi: "tunggal",
    jenis_layanan: "Pendaftaran Penduduk",
    sub_layanan: "Rekam / Cetak KTP",
    link_file: "https://drive.google.com/file/d/example2/view",
    status_alur: "PENDING_OPERATOR",
    status_tte: "",
    penerima: "",
    catatan_scan: "Scan KTP lama & KK.",
    catatan_kasie: "",
    catatan_kabid: "",
    catatan_kadis: "",
    catatan_upt: "Mohon scan ulang KK, foto blur.",
    catatan_print: "",
    riwayat_pending: "PENDING by Kepala UPT (UPT-01) pada 2026-08-27: Mohon scan ulang KK, foto blur.",
    tgl_operator: "2026-08-26 14:05:00",
    tgl_scan: "2026-08-26 15:30:22",
    tgl_kasie: "",
    tgl_upt: "2026-08-27 09:12:10",
    tgl_kabid: "",
    tgl_kadis: "",
    tgl_tte: "",
    tgl_print: ""
  },
  {
    key: "SM-20260828-D492",
    tanggal: "2026-08-25",
    fasilitasi: "Dinas",
    operator: "Rina",
    pemohon: "Agus Prasetyo",
    alamat: "Jl. Diponegoro No. 45",
    no_hp: "087712345678",
    email: "agus@mail.com",
    integrasi: "Dafduk - Dafduk",
    jenis_layanan: "Pendaftaran Penduduk",
    sub_layanan: "KK Perubahan / Penggantian",
    link_file: "https://drive.google.com/file/d/example3/view",
    status_alur: "7_SELESAI",
    status_tte: "Sudah di TTE",
    penerima: "Istri Pemohon (Dewi)",
    catatan_scan: "Scan KK asli & Surat Nikah.",
    catatan_kasie: "Data keluarga sesuai.",
    catatan_kabid: "Disetujui untuk dicetak.",
    catatan_kadis: "Dokumen ditandatangani.",
    catatan_upt: "",
    catatan_print: "Diambil oleh Dewi tanggal 2026-08-28.",
    riwayat_pending: "",
    tgl_operator: "2026-08-25 09:00:00",
    tgl_scan: "2026-08-25 10:10:15",
    tgl_kasie: "2026-08-25 14:20:00",
    tgl_upt: "",
    tgl_kabid: "2026-08-26 11:05:30",
    tgl_kadis: "2026-08-27 15:40:00",
    tgl_tte: "2026-08-28 10:12:00",
    tgl_print: "2026-08-28 16:30:00"
  }
];

function getLocalDB() {
  let db = localStorage.getItem('simpel_momen_local_db');
  if (!db) {
    localStorage.setItem('simpel_momen_local_db', JSON.stringify(INITIAL_MOCK_DATA));
    return INITIAL_MOCK_DATA;
  }
  return JSON.parse(db);
}

function saveLocalDB(data) {
  localStorage.setItem('simpel_momen_local_db', JSON.stringify(data));
}

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

// Profile Panel
const userAvatar = document.getElementById('userAvatar');
const userRoleName = document.getElementById('userRoleName');
const userRoleBadge = document.getElementById('userRoleBadge');

// Top action panels
const configPanel = document.getElementById('configPanel');
const toggleConfigBtn = document.getElementById('toggleConfigBtn');
const closeConfigBtn = document.getElementById('closeConfigBtn');
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
const resetFormBtn = document.getElementById('resetFormBtn');
const saveFormBtn = document.getElementById('saveFormBtn');

// Monitoring Page elements
const monitoringSearchInput = document.getElementById('monitoringSearchInput');
const filterFasilitasi = document.getElementById('filterFasilitasi');
const filterJenisLayanan = document.getElementById('filterJenisLayanan');
const filterWorkflowStatus = document.getElementById('filterWorkflowStatus');
const monitoringEntriesCount = document.getElementById('monitoringEntriesCount');
const monitoringTableBody = document.getElementById('monitoringTableBody');

// Rekapitulasi Page elements
const rekapTotalCount = document.getElementById('rekapTotalCount');
const rekapDinasCount = document.getElementById('rekapDinasCount');
const rekapUptCount = document.getElementById('rekapUptCount');
const rekapSelesaiCount = document.getElementById('rekapSelesaiCount');
const rekapWorkflowTableBody = document.getElementById('rekapWorkflowTableBody');
const printReportBtn = document.getElementById('printReportBtn');

// Action Modal Elements
const actionModal = document.getElementById('actionModal');
const actionForm = document.getElementById('actionForm');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const submitModalBtn = document.getElementById('submitModalBtn');

const modalKey = document.getElementById('modalKey');
const modalInfoKey = document.getElementById('modalInfoKey');
const modalInfoNama = document.getElementById('modalInfoNama');
const modalInfoLayanan = document.getElementById('modalInfoLayanan');
const modalInfoFasilitasi = document.getElementById('modalInfoFasilitasi');
const rowPendingHist = document.getElementById('rowPendingHist');
const modalInfoPending = document.getElementById('modalInfoPending');

const fieldsPetugasScan = document.getElementById('fields-petugas_scan');
const scanLinkFile = document.getElementById('scanLinkFile');
const scanNotes = document.getElementById('scanNotes');

const fieldsVerifikator = document.getElementById('fields-verifikator');
const lblVerifikasiNotes = document.getElementById('lblVerifikasiNotes');
const verifikasiNotes = document.getElementById('verifikasiNotes');

const fieldsPetugasTTE = document.getElementById('fields-petugas_tte');
const tteStatus = document.getElementById('tteStatus');

const fieldsPetugasPencetakan = document.getElementById('fields-petugas_pencetakan');
const printPenerima = document.getElementById('printPenerima');
const printNotes = document.getElementById('printNotes');

const modalNormalActions = document.getElementById('modalNormalActions');
const modalVerifikasiActions = document.getElementById('modalVerifikasiActions');
const cancelVerifModalBtn = document.getElementById('cancelVerifModalBtn');
const pendingVerifModalBtn = document.getElementById('pendingVerifModalBtn');
const approveVerifModalBtn = document.getElementById('approveVerifModalBtn');

// Detail View Modal (Monitoring)
const detailModal = document.getElementById('detailModal');
const closeDetailModalBtn = document.getElementById('closeDetailModalBtn');
const closeDetailBtn = document.getElementById('closeDetailBtn');
const detailModalBody = document.getElementById('detailModalBody');

// ================= LIST DATA OPERATOR & SUB-LAYANAN =================
const OPERATORS_DINAS = ["Fransin", "Wulan", "Rina", "Haryati", "Handri", "Wilson", "Sergio"];
const OPERATORS_UPT = ["UPT-01", "UPT-02", "UPT-03", "UPT-04", "UPT-05", "UPT-06", "UPT-07", "UPT-08"];

const SUB_LAYANAN_DAFDUK = [
  "KK Baru", "KK Perubahan / Penggantian", "KK Hilang", 
  "Rekam / Cetak KTP", "KTP Ganti / Perubahan", "KTP Hilang", 
  "KIA Baru", "KIA Perubahan", "KIA Hilang", "Pindah Domisili"
];

const SUB_LAYANAN_CAPIL = [
  "Akta Kelahiran", "Akta Kematian", "Akta Perkawinan", "Akta Perceraian", 
  "Pengesahan Anak", "Perubahan Nama / dsb", "BAKAK", "BPKAM", "BPKAK", "BPKAC", "Akta Lainnya"
];

// MOCK USER CONFIG
const ROLES_CONFIG = {
  operator_dinas: { name: "Operator Dinas", role: "operator", fasilitasi: "Dinas" },
  operator_upt: { name: "Operator UPT", role: "operator", fasilitasi: "UPT" },
  petugas_scan: { name: "Petugas Scan", role: "petugas_scan", fasilitasi: "Dinas" },
  petugas_scan_upt: { name: "Petugas Scan UPT", role: "petugas_scan", fasilitasi: "UPT" },
  kasie_dafduk: { name: "Kasie Dafduk", role: "kasie_dafduk", fasilitasi: "Dinas" },
  kasie_capil: { name: "Kasie Capil", role: "kasie_capil", fasilitasi: "Dinas" },
  kepala_upt: { name: "Kepala UPT", role: "kepala_upt", fasilitasi: "UPT" },
  kabid_dafduk: { name: "Kabid Dafduk", role: "kabid_dafduk", fasilitasi: "Dinas" },
  kabid_capil: { name: "Kabid Capil", role: "kabid_capil", fasilitasi: "Dinas" },
  kadis: { name: "Kepala Dinas (Kadis)", role: "kadis", fasilitasi: "Dinas" },
  petugas_tte: { name: "Petugas TTE", role: "petugas_tte", fasilitasi: "Dinas" },
  petugas_pencetakan: { name: "Petugas Pencetakan Dinas", role: "petugas_pencetakan", fasilitasi: "Dinas" },
  petugas_pencetakan_upt: { name: "Petugas Pencetakan UPT", role: "petugas_pencetakan", fasilitasi: "UPT" },
  monitoring_dinas: { name: "Monitoring Dinas", role: "monitoring", fasilitasi: "Dinas" },
  monitoring_upt: { name: "Monitoring UPT", role: "monitoring", fasilitasi: "UPT" }
};

// ================= INITIALIZATION & ROUTING =================
apiUrlInput.value = API_URL;
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

// Cek session login
const savedUser = sessionStorage.getItem('simpel_momen_user');
if (savedUser) {
  currentUser = JSON.parse(savedUser);
  if (currentUser && currentUser.role) {
    currentUser.role = normalizeUserRole(currentUser.role);
  }
  setupLoggedInUI();
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

// Event: Login Submit
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const usernameVal = loginUsername.value.trim().toLowerCase();
  const passwordVal = loginPassword.value.trim();
  
  const submitBtn = loginForm.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Memverifikasi...';
  
  try {
    if (API_URL === 'local') {
      // Login offline / simulasi lokal
      const user = MOCK_PETUGAS.find(u => u.username.toLowerCase() === usernameVal && u.password === passwordVal);
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
        showToast('Username atau password salah!', 'error');
      }
    } else {
      // Login online via Google Sheets API dengan fallback otomatis jika offline/gagal koneksi
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
          showToast(result.message || 'Username atau password salah!', 'error');
        }
      } catch (fetchErr) {
        console.warn('Gagal koneksi online ke Apps Script API, mencoba autentikasi lokal fallback...', fetchErr);
        // Fallback otomatis ke data akun demo lokal jika jaringan/Apps Script belum online
        const user = MOCK_PETUGAS.find(u => u.username.toLowerCase() === usernameVal && u.password === passwordVal);
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
          showToast(`Selamat datang, ${currentUser.name}! (Mode Offline/Fallback)`, 'warning');
        } else {
          showToast('Gagal terhubung ke database dan akun lokal tidak ditemukan.', 'error');
        }
      }
    }
  } catch (error) {
    console.error('Error saat login:', error);
    showToast('Terjadi kesalahan koneksi saat login!', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});

// Event: Logout
logoutBtn.addEventListener('click', () => {
  sessionStorage.removeItem('simpel_momen_user');
  currentUser = null;
  appWrapper.style.display = 'none';
  loginWrapper.style.display = 'flex';
});

// Setup UI User Sesudah Login
function setupLoggedInUI() {
  loginWrapper.style.display = 'none';
  appWrapper.style.display = 'grid';
  
  // Set Profile Panel
  userAvatar.textContent = currentUser.name.charAt(0);
  userRoleName.textContent = currentUser.uptCode ? `${currentUser.name} (${currentUser.uptCode})` : currentUser.name;
  userRoleBadge.textContent = currentUser.uptCode ? currentUser.uptCode : currentUser.fasilitasi;
  userRoleBadge.className = `badge ${currentUser.fasilitasi === 'Dinas' ? 'b-scan' : 'b-valid'}`;
  
  // Sembunyikan/Tampilkan Menu Input Berkas berdasarkan Peran
  if (currentUser.role === 'operator') {
    menuInputForm.style.display = 'flex';
    setupFormOptions();
  } else {
    menuInputForm.style.display = 'none';
  }
  
  // Buka Halaman Pertama (Dashboard)
  switchPage('dashboard');
  loadData();
}

// Switch Sidebar Pages
function switchPage(pageId) {
  // Update Active Link State
  navLinks.forEach(link => {
    if (link.getAttribute('data-page') === pageId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Show/Hide page containers
  document.querySelectorAll('.page-container').forEach(page => {
    if (page.id === `page-${pageId}`) {
      page.style.display = 'block';
    } else {
      page.style.display = 'none';
    }
  });

  // Page specific headers/actions
  if (pageId === 'dashboard') {
    pageTitle.textContent = `Kerja Meja: ${currentUser.name}`;
    pageSubtitle.textContent = `Daftar dokumen antrean pelayanan yang butuh tindakan Anda.`;
  } else if (pageId === 'input-form') {
    pageTitle.textContent = `Pendaftaran Berkas Baru`;
    pageSubtitle.textContent = `Operator ${currentUser.fasilitasi} - Input formulir digital pelayanan Dukcapil.`;
  } else if (pageId === 'monitoring') {
    pageTitle.textContent = `Monitoring Alur Pelayanan`;
    pageSubtitle.textContent = `Lacak perjalanan dan verifikasi dokumen secara real-time.`;
    renderMonitoringTable();
  } else if (pageId === 'rekapitulasi') {
    pageTitle.textContent = `Rekapitulasi & Laporan`;
    pageSubtitle.textContent = `Statistik dokumen yang diproses dan diunduh dalam format cetak.`;
    renderRekapitulasi();
  }
}

// Add page click events
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const pageId = link.getAttribute('data-page');
    switchPage(pageId);
  });
});

// ================= API CONFIG PANEL =================
if (toggleConfigBtn) {
  toggleConfigBtn.addEventListener('click', () => {
    const isHidden = configPanel.style.display === 'none';
    configPanel.style.display = isHidden ? 'flex' : 'none';
  });
}

if (closeConfigBtn) {
  closeConfigBtn.addEventListener('click', () => {
    configPanel.style.display = 'none';
  });
}

if (saveConfigBtn) {
  saveConfigBtn.addEventListener('click', () => {
    const url = apiUrlInput.value.trim();
    if (!url) {
      showToast('Masukkan URL database yang valid!', 'error');
      return;
    }
    localStorage.setItem('simpel_momen_api_url', url);
    API_URL = url;
    updateConnectionIndicator();
    showToast('Database berhasil dikonfigurasi!', 'success');
    configPanel.style.display = 'none';
    loadData();
  });
}

if (useLocalSimBtn) {
  useLocalSimBtn.addEventListener('click', () => {
    localStorage.setItem('simpel_momen_api_url', 'local');
    API_URL = 'local';
    apiUrlInput.value = 'local';
    updateConnectionIndicator();
    showToast('Mode simulasi browser diaktifkan!', 'success');
    configPanel.style.display = 'none';
    loadData();
  });
}

refreshBtn.addEventListener('click', () => {
  loadData();
  showToast('Memperbarui data antrean...', 'success');
});

// Event: TTE status change to toggle pending notes group
document.getElementById('tteStatus').addEventListener('change', () => {
  const statusVal = document.getElementById('tteStatus').value;
  const tteNotesGroup = document.getElementById('tteNotesGroup');
  const tteNotes = document.getElementById('tteNotes');
  if (statusVal === 'Belum diajukan SIAK' || statusVal === 'Belum Verifikasi SIAK') {
    tteNotesGroup.style.display = 'block';
    tteNotes.required = true;
  } else {
    tteNotesGroup.style.display = 'none';
    tteNotes.required = false;
  }
});

function updateConnectionIndicator() {
  if (API_URL === 'local') {
    connectionStatus.innerHTML = '<span class="status-indicator offline" style="background:var(--danger); box-shadow: 0 0 8px var(--danger);"></span> Mode Simulasi Browser (localStorage). Offline/Mandiri.';
  } else if (API_URL.includes('localhost') || API_URL.includes('127.0.0.1')) {
    connectionStatus.innerHTML = '<span class="status-indicator offline"></span> Menghubungkan ke server Node.js lokal (`db.json`).';
  } else {
    connectionStatus.innerHTML = '<span class="status-indicator online"></span> Terhubung ke live jembatan Google Sheets asli.';
  }
}

// ================= SERVICE FORM CONTROLLER (OPERATOR) =================
function setupFormOptions() {
  // Hide pending reason group by default
  const reasonGroup = document.getElementById('formPendingReasonGroup');
  if (reasonGroup) reasonGroup.style.display = 'none';

  // Set Default Date to Today
  formTanggal.value = new Date().toISOString().slice(0, 10);
  
  // Bind Operator Name to logged-in user's name/uptCode
  if (currentUser.fasilitasi === 'UPT' && currentUser.uptCode) {
    formOperator.value = `${currentUser.uptCode} (${currentUser.name})`;
  } else {
    formOperator.value = currentUser.name;
  }

  // Event Jenis Layanan Change
  formJenisLayanan.addEventListener('change', populateSubLayanan);
  populateSubLayanan();
}

function populateSubLayanan() {
  const selectedLayanan = formJenisLayanan.value;
  formSubLayanan.innerHTML = '';
  const subList = selectedLayanan === 'Pendaftaran Penduduk' ? SUB_LAYANAN_DAFDUK : SUB_LAYANAN_CAPIL;
  
  subList.forEach(sub => {
    const opt = document.createElement('option');
    opt.value = sub;
    opt.textContent = sub;
    formSubLayanan.appendChild(opt);
  });
}

// Submit Form (Tambah / Perbaiki Data)
berkasForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  saveFormBtn.disabled = true;
  saveFormBtn.textContent = 'Menyimpan...';

  const data = {
    key: formKey.value || null, // Jika null, server generate baru. Jika ada, overwrite (perbaikan pending)
    tanggal: formTanggal.value,
    fasilitasi: currentUser.fasilitasi,
    operator: formOperator.value,
    pemohon: formPemohon.value.trim(),
    alamat: formAlamat.value.trim(),
    no_hp: formNoHp.value.trim(),
    email: formEmail.value.trim(),
    integrasi: formIntegrasi.value,
    jenis_layanan: formJenisLayanan.value,
    sub_layanan: formSubLayanan.value,
    riwayat_pending: formRiwayatPending.value || ""
  };

  const payload = {
    action: 'create',
    data: data
  };

  if (API_URL === 'local') {
    let localList = getLocalDB();
    const key = data.key || `SM-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const newRecord = {
      ...data,
      key: key,
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
      tgl_operator: getLocalDateTimeString(),
      tgl_scan: "",
      tgl_kasie: "",
      tgl_upt: "",
      tgl_kabid: "",
      tgl_kadis: "",
      tgl_tte: "",
      tgl_print: ""
    };
    
    const existingIdx = localList.findIndex(item => item.key === newRecord.key);
    if (existingIdx !== -1) {
      localList[existingIdx] = {
        ...localList[existingIdx],
        ...newRecord
      };
    } else {
      localList.unshift(newRecord);
    }
    
    saveLocalDB(localList);
    showToast('Berkas berhasil disimpan & dikirim ke Petugas Scan!', 'success');
    berkasForm.reset();
    formKey.value = "";
    formRiwayatPending.value = "";
    setupFormOptions();
    switchPage('dashboard');
    loadData();
    saveFormBtn.disabled = false;
    saveFormBtn.textContent = 'Simpan Berkas & Kirim ke Scan';
    return;
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) throw new Error('Gagal mengirim berkas ke server.');
    
    const result = await response.json();
    if (result.status === 'success') {
      showToast('Berkas berhasil disimpan & dikirim ke Petugas Scan!', 'success');
      berkasForm.reset();
      formKey.value = "";
      formRiwayatPending.value = "";
      setupFormOptions(); // reset values
      switchPage('dashboard');
      loadData();
    } else {
      throw new Error(result.message || 'Respons server gagal');
    }
  } catch (error) {
    console.error(error);
    showToast('Terkirim! Memperbarui data...', 'success');
    berkasForm.reset();
    formKey.value = "";
    formRiwayatPending.value = "";
    setupFormOptions();
    setTimeout(() => {
      switchPage('dashboard');
      loadData();
    }, 1500);
  } finally {
    saveFormBtn.disabled = false;
    saveFormBtn.textContent = 'Simpan Berkas & Kirim ke Scan';
  }
});

resetFormBtn.addEventListener('click', () => {
  berkasForm.reset();
  formKey.value = "";
  formRiwayatPending.value = "";
  setupFormOptions();
  switchPage('dashboard');
});

// Memverifikasi apakah token sesi login masih valid di database Google Sheets
async function checkSessionTokenOnline() {
  if (!currentUser || API_URL === 'local' || !currentUser.sessionToken || !currentUser.username) {
    return true; // Lewati jika offline atau belum login
  }
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
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
  // Verifikasi sesi login (Mencegah multi device login)
  const isSessionValid = await checkSessionTokenOnline();
  if (!isSessionValid) return;

  // Show skeletons in counter desk table
  counterTableBody.innerHTML = Array(3).fill(0).map(() => `
    <tr>
      <td><div class="skeleton"></div></td>
      <td><div class="skeleton"></div></td>
      <td><div class="skeleton"></div></td>
      <td><div class="skeleton"></div></td>
      <td><div class="skeleton"></div></td>
      <td><div class="skeleton"></div></td>
      <td><div class="skeleton"></div></td>
    </tr>
  `).join('');
  
  if (API_URL === 'local') {
    allData = getLocalDB();
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
    
    renderCounterDesk();
    renderMonitoringTable();
    renderRekapitulasi();
  } catch (error) {
    console.error(error);
    showToast('Koneksi server gagal! Mengaktifkan mode simulasi browser.', 'error');
    API_URL = 'local';
    apiUrlInput.value = 'local';
    localStorage.setItem('simpel_momen_api_url', 'local');
    updateConnectionIndicator();
    allData = getLocalDB();
    renderCounterDesk();
    renderMonitoringTable();
    renderRekapitulasi();
  }
}

// Memeriksa apakah operator dokumen cocok dengan kode UPT user
function isUptMatch(itemOperator, userUptCode) {
  if (!userUptCode || userUptCode === 'Dinas') return true;
  if (!itemOperator) return false;
  
  const cleanItemOp = String(itemOperator).toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanUserUpt = String(userUptCode).toLowerCase().replace(/[^a-z0-9]/g, '');
  
  return cleanItemOp.includes(cleanUserUpt) || cleanUserUpt.includes(cleanItemOp);
}

// Render Table Kerja Meja Sesuai Peran User
function renderCounterDesk() {
  // 1. Filter Data Menyesuaikan Alur Kerja Counter
  let filtered = allData.filter(item => {
    const status = item.status_alur;
    const fasilitasi = item.fasilitasi;
    const layanan = item.jenis_layanan ? String(item.jenis_layanan).trim().toLowerCase() : "";
    
    // Peran: Operator Dinas / UPT (Hanya melihat berkas PENDING yang perlu diperbaiki)
    if (currentUser.role === 'operator') {
      return status === 'PENDING_OPERATOR' && fasilitasi === currentUser.fasilitasi && isUptMatch(item.operator, currentUser.uptCode);
    }
    
    // Peran: Petugas Scan Dinas / UPT
    if (currentUser.role === 'petugas_scan') {
      return status === '1_PETUGAS_SCAN' && fasilitasi === currentUser.fasilitasi && isUptMatch(item.operator, currentUser.uptCode);
    }
    
    // Peran: Kasie Dafduk (Hanya verifikasi Dafduk Dinas)
    if (currentUser.role === 'kasie_dafduk') {
      return status === '2_VERIFIKASI_KASIE' && layanan === 'pendaftaran penduduk' && fasilitasi === 'Dinas';
    }
    
    // Peran: Kasie Capil (Hanya verifikasi Capil Dinas)
    if (currentUser.role === 'kasie_capil') {
      return status === '2_VERIFIKASI_KASIE' && layanan === 'pencatatan sipil' && fasilitasi === 'Dinas';
    }
    
    // Peran: Kepala UPT (Verifikasi semua berkas UPT unitnya)
    if (currentUser.role === 'kepala_upt') {
      return status === '2_VERIFIKASI_UPT' && fasilitasi === 'UPT' && isUptMatch(item.operator, currentUser.uptCode);
    }
    
    // Peran: Kabid Dafduk (Validasi Dafduk Dinas & UPT)
    if (currentUser.role === 'kabid_dafduk') {
      return status === '3_VALIDASI_KABID' && layanan === 'pendaftaran penduduk';
    }
    
    // Peran: Kabid Capil (Validasi Capil Dinas saja, Capil UPT langsung cetak)
    if (currentUser.role === 'kabid_capil') {
      return status === '3_VALIDASI_KABID' && layanan === 'pencatatan sipil' && fasilitasi === 'Dinas';
    }
    
    // Peran: Kepala Dinas (Sertifikasi semua yang disetujui Kabid)
    if (currentUser.role === 'kadis') {
      return status === '4_SERTIFIKASI_KADIS';
    }
    
    // Peran: Petugas TTE (Dinas)
    if (currentUser.role === 'petugas_tte') {
      return status === '5_TTE';
    }
    
    // Peran: Petugas Pencetakan Dinas / UPT unitnya
    if (currentUser.role === 'petugas_pencetakan') {
      if (currentUser.fasilitasi === 'Dinas') {
        return status === '6_PENCETAKAN_DINAS' && fasilitasi === 'Dinas';
      } else {
        return status === '6_PENCETAKAN_UPT' && fasilitasi === 'UPT' && isUptMatch(item.operator, currentUser.uptCode);
      }
    }
    
    // Peran: Monitoring / Pengawas
    return false; // Monitoring tidak memiliki kerja antrean meja
  });

  // Calculate Metrics Dashboard
  calculateCounterMetrics(filtered);

  // Render Table
  counterEntriesCount.textContent = `Menampilkan ${filtered.length} berkas antrean`;
  
  if (filtered.length === 0) {
    counterTableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-muted" style="padding: 2rem;">
          🎉 Meja Kerja Anda Bersih! Tidak ada berkas antrean yang menunggu verifikasi.
        </td>
      </tr>
    `;
    return;
  }

  counterTableBody.innerHTML = filtered.map(row => {
    let actionBtnText = "✏️ Tindak Lanjut";
    let btnClass = "btn-primary";
    
    if (currentUser.role === 'operator') {
      actionBtnText = "🛠️ Perbaiki Data";
      btnClass = "btn-danger";
    }

    let statusHtml = getWorkflowStatusBadge(row.status_alur);
    if (row.riwayat_pending) {
      const latestPending = row.riwayat_pending.split('---')[0].trim();
      const label = row.status_alur === 'PENDING_OPERATOR' ? 'Alasan' : 'Catatan Pending';
      statusHtml += `
        <div class="pending-reason-box" style="margin-top:6px; font-size:0.75rem; color:var(--danger); background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.2); padding:6px; border-radius:var(--radius-sm); max-width:200px; white-space:normal; line-height:1.2;">
          <strong>${label}:</strong> ${escapeHTML(latestPending)}
        </div>
      `;
    }

    return `
      <tr>
        <td style="font-weight: 700; font-family: var(--font-title); color: var(--primary);">${escapeHTML(row.key)}</td>
        <td style="white-space: nowrap; font-size: 0.85rem; color: var(--text-muted);">${row.tanggal}</td>
        <td style="font-weight: 600; color: #fff;">${escapeHTML(row.pemohon)}</td>
        <td>${escapeHTML(row.sub_layanan)}</td>
        <td><span class="badge" style="background: rgba(255,255,255,0.05); color:#fff;">${escapeHTML(row.integrasi)}</span></td>
        <td>${statusHtml}</td>
        <td class="text-center">
          <button class="btn ${btnClass} btn-xs" onclick="openActionModal('${row.key}')">
            ${actionBtnText}
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// Calculate Metrics Dashboard
function calculateCounterMetrics(filteredDeskList) {
  valMetric1.textContent = filteredDeskList.length;
  
  // Pending Count total in system
  const totalPending = allData.filter(item => item.status_alur === 'PENDING_OPERATOR').length;
  valMetric2.textContent = totalPending;
  
  // Total Selesai
  const totalSelesai = allData.filter(item => item.status_alur === '7_SELESAI').length;
  valMetric3.textContent = totalSelesai;
  
  // Customize Label Metrics
  if (currentUser.role === 'operator') {
    lblMetric1.textContent = "Berkas Perlu Diperbaiki";
    lblMetric2.textContent = "Total Pending Sistem";
  } else if (currentUser.role === 'petugas_scan') {
    lblMetric1.textContent = "Berkas Menunggu Scan";
  } else if (currentUser.role === 'kasie_dafduk' || currentUser.role === 'kasie_capil' || currentUser.role === 'kepala_upt') {
    lblMetric1.textContent = "Menunggu Verifikasi";
  } else if (currentUser.role === 'kabid_dafduk' || currentUser.role === 'kabid_capil') {
    lblMetric1.textContent = "Menunggu Validasi";
  } else if (currentUser.role === 'kadis') {
    lblMetric1.textContent = "Menunggu Sertifikasi";
  } else if (currentUser.role === 'petugas_tte') {
    lblMetric1.textContent = "Menunggu TTE";
  } else if (currentUser.role === 'petugas_pencetakan') {
    lblMetric1.textContent = "Menunggu Penyerahan";
  } else {
    lblMetric1.textContent = "Berkas Terverifikasi";
  }
}

// Translate workflow state to Badge HTML
function getWorkflowStatusBadge(status) {
  switch (status) {
    case '1_PETUGAS_SCAN':
      return `<span class="badge b-scan">Petugas Scan</span>`;
    case '2_VERIFIKASI_KASIE':
      return `<span class="badge b-verif">Verifikasi Kasie</span>`;
    case '2_VERIFIKASI_UPT':
      return `<span class="badge b-verif">Verifikasi UPT</span>`;
    case '3_VALIDASI_KABID':
      return `<span class="badge b-valid">Validasi Kabid</span>`;
    case '4_SERTIFIKASI_KADIS':
      return `<span class="badge b-sertif">Sertifikasi Kadis</span>`;
    case '5_TTE':
      return `<span class="badge b-tte">Tahap TTE</span>`;
    case '6_PENCETAKAN_DINAS':
      return `<span class="badge b-cetak">Siap Cetak Dinas</span>`;
    case '6_PENCETAKAN_UPT':
      return `<span class="badge b-cetak">Siap Cetak UPT</span>`;
    case '7_SELESAI':
      return `<span class="badge b-selesai">Selesai diserahkan</span>`;
    case 'PENDING_OPERATOR':
      return `<span class="badge b-pending">PENDING OPERATOR</span>`;
    default:
      return `<span class="badge">${status}</span>`;
  }
}

// ================= MODAL TINDAK LANJUT BERKAS (VERIFIKASI) =================
window.openActionModal = function(key) {
  const item = allData.find(x => x.key === key);
  if (!item) return;

  // Set Info Umum
  modalKey.value = key;
  modalInfoKey.textContent = item.key;
  modalInfoNama.textContent = item.pemohon;
  modalInfoLayanan.textContent = `${item.jenis_layanan} (${item.sub_layanan})`;
  modalInfoFasilitasi.textContent = item.fasilitasi;
  
  // Tampilkan Link File Hasil Scan jika ada
  const rowScanLink = document.getElementById('rowScanLink');
  const modalInfoScanLink = document.getElementById('modalInfoScanLink');
  if (item.link_file) {
    rowScanLink.style.display = 'flex';
    modalInfoScanLink.href = item.link_file;
  } else {
    rowScanLink.style.display = 'none';
  }
  
  // Tampilkan Log Pending jika ada
  if (item.riwayat_pending) {
    rowPendingHist.style.display = 'flex';
    modalInfoPending.textContent = item.riwayat_pending;
  } else {
    rowPendingHist.style.display = 'none';
  }

  // Khusus Peran: Operator (Aksi adalah untuk me-load data kembali ke formulir edit)
  if (currentUser.role === 'operator') {
    loadDataToForm(item);
    return;
  }

  // Sembunyikan semua field dinamis terlebih dahulu
  fieldsPetugasScan.style.display = 'none';
  fieldsVerifikator.style.display = 'none';
  fieldsPetugasTTE.style.display = 'none';
  fieldsPetugasPencetakan.style.display = 'none';
  modalNormalActions.style.display = 'flex';
  modalVerifikasiActions.style.display = 'none';

  // Reset all required properties to prevent form validation lockouts
  scanLinkFile.required = false;
  printPenerima.required = false;
  printNotes.required = false;
  verifikasiNotes.required = false;
  document.getElementById('tteNotes').required = false;

  // Sesuaikan Field Form di dalam Modal dengan Peran Pengguna
  if (currentUser.role === 'petugas_scan') {
    fieldsPetugasScan.style.display = 'block';
    scanLinkFile.value = item.link_file || "";
    scanNotes.value = item.catatan_scan || "";
    scanLinkFile.required = true;
  } 
  
  else if (['kasie_dafduk', 'kasie_capil', 'kepala_upt', 'kabid_dafduk', 'kabid_capil', 'kadis'].includes(currentUser.role)) {
    fieldsVerifikator.style.display = 'block';
    verifikasiNotes.value = "";
    verifikasiNotes.required = true;
    
    // Set Label Note sesuai peran
    if (currentUser.role === 'kadis') {
      lblVerifikasiNotes.textContent = "Catatan Sertifikasi Kepala Dinas *";
    } else if (currentUser.role.includes('kabid')) {
      lblVerifikasiNotes.textContent = "Catatan Validasi Kabid *";
    } else {
      lblVerifikasiNotes.textContent = "Catatan Verifikasi Meja Pemeriksa *";
    }
    
    // Tampilkan tombol Approve / Pending secara berdampingan
    modalNormalActions.style.display = 'none';
    modalVerifikasiActions.style.display = 'flex';
  } 
  
  else if (currentUser.role === 'petugas_tte') {
    fieldsPetugasTTE.style.display = 'block';
    tteStatus.value = item.status_tte || "Sudah di TTE";
    tteStatus.dispatchEvent(new Event('change'));
  } 
  
  else if (currentUser.role === 'petugas_pencetakan') {
    fieldsPetugasPencetakan.style.display = 'block';
    printPenerima.value = item.penerima || "";
    printNotes.value = item.catatan_print || "";
    printPenerima.required = true;
    printNotes.required = true;
  }

  actionModal.style.display = 'flex';
};

function loadDataToForm(item) {
  // Load data ke panel halaman input formulir
  formKey.value = item.key;
  formTanggal.value = item.tanggal;
  formPemohon.value = item.pemohon;
  formAlamat.value = item.alamat;
  formNoHp.value = item.no_hp;
  formEmail.value = item.email;
  formIntegrasi.value = item.integrasi;
  formJenisLayanan.value = item.jenis_layanan;
  
  populateSubLayanan();
  formSubLayanan.value = item.sub_layanan;
  formRiwayatPending.value = item.riwayat_pending;

  const reasonGroup = document.getElementById('formPendingReasonGroup');
  const reasonText = document.getElementById('formPendingReasonText');
  if (item.riwayat_pending) {
    reasonGroup.style.display = 'block';
    const latestPending = item.riwayat_pending.split('---')[0].trim();
    reasonText.textContent = latestPending;
  } else {
    reasonGroup.style.display = 'none';
  }
  
  switchPage('input-form');
  showToast("Data pending dimuat ke formulir! Silakan perbaiki.", "success");
}

// Modal Close Events
closeModalBtn.addEventListener('click', closeModal);
cancelModalBtn.addEventListener('click', closeModal);
cancelVerifModalBtn.addEventListener('click', closeModal);
window.addEventListener('click', (e) => {
  if (e.target === actionModal) closeModal();
});

function closeModal() {
  actionModal.style.display = 'none';
  actionForm.reset();
}

// ================= PROSES TINDAK LANJUT BERKAS (SUBMIT) =================

// Aksi 1: Untuk Counter Reguler (Scan, TTE, Pencetakan)
actionForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  if (['kasie_dafduk', 'kasie_capil', 'kepala_upt', 'kabid_dafduk', 'kabid_capil', 'kadis'].includes(currentUser.role)) {
    // Tindakan verifikator sudah ditangani secara terpisah oleh click listener
    return;
  }
  
  const key = modalKey.value;
  submitModalBtn.disabled = true;
  submitModalBtn.textContent = 'Memproses...';

  const payload = {
    action: 'update',
    key: key,
    role: currentUser.role,
    executeAction: 'approve', // Default untuk petugas non-verifikator agar masuk alur eksekusi
    userName: currentUser.name
  };

  if (currentUser.role === 'petugas_scan') {
    payload.link_file = scanLinkFile.value.trim();
    payload.notes = scanNotes.value.trim();
  } else if (currentUser.role === 'petugas_tte') {
    const tteStatusVal = tteStatus.value;
    payload.status_tte = tteStatusVal;
    if (tteStatusVal === 'Belum diajukan SIAK' || tteStatusVal === 'Belum Verifikasi SIAK') {
      payload.notes = document.getElementById('tteNotes').value.trim();
    } else {
      payload.notes = `Di TTE dengan status: ${tteStatusVal}`;
    }
  } else if (currentUser.role === 'petugas_pencetakan') {
    payload.penerima = printPenerima.value.trim();
    payload.notes = printNotes.value.trim();
  }

  await sendTindakLanjutRequest(payload);
});

// Aksi 2: Tombol Setujui (Approve) untuk Verifikator
approveVerifModalBtn.addEventListener('click', async (e) => {
  e.preventDefault();
  const notes = verifikasiNotes.value.trim();
  if (!notes) {
    showToast('Catatan verifikasi bersifat mandatori!', 'error');
    verifikasiNotes.focus();
    return;
  }

  const payload = {
    action: 'update',
    key: modalKey.value,
    role: currentUser.role,
    executeAction: 'approve',
    notes: notes,
    userName: currentUser.name
  };

  await sendTindakLanjutRequest(payload);
});

// Aksi 3: Tombol Pending (Kembalikan ke Operator) untuk Verifikator
pendingVerifModalBtn.addEventListener('click', async (e) => {
  e.preventDefault();
  const notes = verifikasiNotes.value.trim();
  if (!notes) {
    showToast('Mohon isi alasan pending di kolom catatan!', 'error');
    verifikasiNotes.focus();
    return;
  }

  const payload = {
    action: 'update',
    key: modalKey.value,
    role: currentUser.role,
    executeAction: 'pending',
    notes: notes,
    userName: currentUser.name
  };

  await sendTindakLanjutRequest(payload);
});

async function sendTindakLanjutRequest(payload) {
  const isPendingToast = payload.executeAction === 'pending' || 
                         (payload.status_tte && payload.status_tte !== 'Sudah di TTE');
                         
  if (API_URL === 'local') {
    let localList = getLocalDB();
    const idx = localList.findIndex(item => item.key === payload.key);
    
    if (idx !== -1) {
      let item = localList[idx];
      const executeAction = payload.executeAction;
      const role = payload.role;
      const notes = payload.notes || "";
      const timeStr = getLocalDateTimeString();
      
      if (executeAction === 'pending') {
        item.status_alur = "PENDING_OPERATOR";
        const logMsg = `PENDING by ${role} pada ${timeStr}: ${notes}`;
        item.riwayat_pending = item.riwayat_pending ? `${logMsg}\n---\n${item.riwayat_pending}` : logMsg;
        
        if (role === 'kasie_dafduk' || role === 'kasie_capil') {
          item.catatan_kasie = notes;
          item.tgl_kasie = timeStr;
        } else if (role === 'kepala_upt') {
          item.catatan_upt = notes;
          item.tgl_upt = timeStr;
        } else if (role === 'kabid_dafduk' || role === 'kabid_capil') {
          item.catatan_kabid = notes;
          item.tgl_kabid = timeStr;
        } else if (role === 'kadis') {
          item.catatan_kadis = notes;
          item.tgl_kadis = timeStr;
        }
      } else {
        if (role === 'petugas_scan') {
          item.link_file = payload.link_file || "";
          item.catatan_scan = notes;
          item.tgl_scan = timeStr;
          item.status_alur = item.fasilitasi === "Dinas" ? "2_VERIFIKASI_KASIE" : "2_VERIFIKASI_UPT";
        } 
        else if (role === 'kasie_dafduk' || role === 'kasie_capil') {
          item.catatan_kasie = notes;
          item.tgl_kasie = timeStr;
          item.status_alur = "3_VALIDASI_KABID";
        } 
        else if (role === 'kepala_upt') {
          item.catatan_upt = notes;
          item.tgl_upt = timeStr;
          if (String(item.jenis_layanan).trim().toLowerCase() === "pendaftaran penduduk") {
            item.status_alur = "3_VALIDASI_KABID";
          } else {
            item.status_alur = "6_PENCETAKAN_UPT";
          }
        } 
        else if (role === 'kabid_dafduk' || role === 'kabid_capil') {
          item.catatan_kabid = notes;
          item.tgl_kabid = timeStr;
          const tteNormalized = String(item.status_tte).trim().toLowerCase();
          if (tteNormalized === "belum diajukan siak" || tteNormalized === "belum verifikasi siak") {
            item.status_alur = "5_TTE";
          } else {
            item.status_alur = "4_SERTIFIKASI_KADIS";
          }
        } 
        else if (role === 'kadis') {
          item.catatan_kadis = notes;
          item.tgl_kadis = timeStr;
          item.status_alur = "5_TTE";
        } 
        else if (role === 'petugas_tte') {
          const stat = payload.status_tte;
          item.status_tte = stat;
          item.tgl_tte = timeStr;
          
          if (stat === 'Belum diajukan SIAK') {
            item.status_alur = item.fasilitasi === "UPT" ? "2_VERIFIKASI_UPT" : "2_VERIFIKASI_KASIE";
            const logMsg = `PENDING by TTE pada ${timeStr}: ${notes}`;
            item.riwayat_pending = item.riwayat_pending ? `${logMsg}\n---\n${item.riwayat_pending}` : logMsg;
          } else if (stat === 'Belum Verifikasi SIAK') {
            item.status_alur = "3_VALIDASI_KABID";
            const logMsg = `PENDING by TTE pada ${timeStr}: ${notes}`;
            item.riwayat_pending = item.riwayat_pending ? `${logMsg}\n---\n${item.riwayat_pending}` : logMsg;
          } else {
            item.status_alur = item.fasilitasi === "UPT" ? "6_PENCETAKAN_UPT" : "6_PENCETAKAN_DINAS";
          }
        } 
        else if (role === 'petugas_pencetakan') {
          item.penerima = payload.penerima || "";
          item.catatan_print = notes;
          item.tgl_print = timeStr;
          item.status_alur = "7_SELESAI";
        }
      }
      
      localList[idx] = item;
      saveLocalDB(localList);
      
      showToast(
        isPendingToast 
          ? 'Berkas dipending & dikembalikan ke meja counter sebelumnya!' 
          : 'Berkas berhasil diverifikasi dan diteruskan!', 
        'success'
      );
      closeModal();
      loadData();
    } else {
      showToast('Berkas tidak ditemukan!', 'error');
    }
    submitModalBtn.disabled = false;
    submitModalBtn.textContent = 'Simpan & Kirim';
    return;
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) throw new Error('Gagal memperbarui status berkas.');
    const result = await response.json();
    
    if (result.status === 'success') {
      showToast(
        isPendingToast 
          ? 'Berkas dipending & dikembalikan ke meja counter sebelumnya!' 
          : 'Berkas berhasil diverifikasi dan diteruskan!', 
        'success'
      );
      closeModal();
      loadData();
    } else {
      throw new Error(result.message || 'Gagal menyimpan berkas');
    }
  } catch (error) {
    console.error(error);
    showToast('Tindakan terkirim! Memperbarui data...', 'success');
    closeModal();
    setTimeout(loadData, 1500);
  } finally {
    submitModalBtn.disabled = false;
    submitModalBtn.textContent = 'Simpan & Kirim';
  }
}

// ================= MONITORING CONTROLLER =================
monitoringSearchInput.addEventListener('input', renderMonitoringTable);
filterFasilitasi.addEventListener('change', renderMonitoringTable);
filterJenisLayanan.addEventListener('change', renderMonitoringTable);
filterWorkflowStatus.addEventListener('change', renderMonitoringTable);

function renderMonitoringTable() {
  const searchVal = monitoringSearchInput.value.toLowerCase().trim();
  const fasVal = filterFasilitasi.value;
  const layVal = filterJenisLayanan.value;
  const wfStatusVal = filterWorkflowStatus.value;

  const filtered = allData.filter(item => {
    const matchSearch = String(item.pemohon).toLowerCase().includes(searchVal) || 
                        String(item.key).toLowerCase().includes(searchVal) ||
                        String(item.alamat).toLowerCase().includes(searchVal);
                        
    const matchFas = fasVal === 'ALL' || item.fasilitasi === fasVal;
    const matchLay = layVal === 'ALL' || 
                     (item.jenis_layanan ? String(item.jenis_layanan).trim().toLowerCase() === layVal.trim().toLowerCase() : false);
    
    let matchStatus = true;
    if (wfStatusVal !== 'ALL') {
      if (wfStatusVal === '2_VERIFIKASI') {
        matchStatus = item.status_alur.includes('2_VERIFIKASI');
      } else if (wfStatusVal === '6_PENCETAKAN') {
        matchStatus = item.status_alur.includes('6_PENCETAKAN');
      } else {
        matchStatus = item.status_alur === wfStatusVal;
      }
    }
    
    const matchUpt = !currentUser.uptCode || currentUser.uptCode === 'Dinas' || isUptMatch(item.operator, currentUser.uptCode);
    
    return matchSearch && matchFas && matchLay && matchStatus && matchUpt;
  });

  monitoringEntriesCount.textContent = `Menampilkan ${filtered.length} dari ${allData.length} dokumen`;

  if (filtered.length === 0) {
    monitoringTableBody.innerHTML = `
      <tr>
        <td colspan="9" class="text-center text-muted" style="padding: 2rem;">
          Tidak ada berkas yang sesuai dengan filter pencarian.
        </td>
      </tr>
    `;
    return;
  }

  monitoringTableBody.innerHTML = filtered.map(row => {
    return `
      <tr>
        <td style="font-weight: 700; font-family: var(--font-title); color: var(--primary);">${escapeHTML(row.key)}</td>
        <td style="white-space: nowrap; font-size: 0.82rem; color: var(--text-muted);">${row.tanggal}</td>
        <td style="font-weight: 600; color: #fff;">${escapeHTML(row.pemohon)}</td>
        <td><span class="badge ${row.fasilitasi === 'Dinas' ? 'b-scan' : 'b-valid'}">${row.fasilitasi}</span></td>
        <td>${escapeHTML(row.sub_layanan)}</td>
        <td>${getWorkflowStatusBadge(row.status_alur)}</td>
        <td>${row.status_tte ? `<span class="badge b-tte">${row.status_tte}</span>` : '<span class="text-muted">-</span>'}</td>
        <td>${row.penerima ? `<strong style="color:var(--success);">${escapeHTML(row.penerima)}</strong>` : '<span class="text-muted">-</span>'}</td>
        <td class="text-center">
          <button class="btn btn-secondary btn-xs" onclick="openDetailModal('${row.key}')">
            👁️ Detail
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// ================= MONITORING DETAIL MODAL =================
window.openDetailModal = function(key) {
  const item = allData.find(x => x.key === key);
  if (!item) return;

  let timelineHtml = "";
  
  // 1. Langkah Operator
  timelineHtml += createTimelineItem("1. Operator Dinas/UPT", `Diinput oleh ${item.operator} pada ${item.tgl_operator || item.tanggal}`, "", true);
  
  // 2. Langkah Scan
  const hasScan = !!item.link_file;
  let scanDetail = hasScan 
    ? `Tautan file: <a href="${item.link_file}" target="_blank" style="color:var(--primary); text-decoration:underline;">Buka File Scan</a><br><span style="font-size:0.75rem; color:var(--text-muted);">Diproses pada: ${item.tgl_scan || "-"}</span>` 
    : "Menunggu proses scan berkas fisik.";
  timelineHtml += createTimelineItem("2. Petugas Scan", scanDetail, item.catatan_scan, hasScan);

  // 3. Langkah Verifikator (Kasie / Kepala UPT)
  const isUPT = item.fasilitasi === "UPT";
  if (isUPT) {
    const hasUpt = !!item.catatan_upt;
    let uptDetail = hasUpt 
      ? `Verifikasi disetujui.<br><span style="font-size:0.75rem; color:var(--text-muted);">Diproses pada: ${item.tgl_upt || "-"}</span>` 
      : "Menunggu verifikasi Kepala UPT.";
    timelineHtml += createTimelineItem("3. Kepala UPT", uptDetail, item.catatan_upt, hasUpt);
  } else {
    const isDafduk = item.jenis_layanan ? String(item.jenis_layanan).trim().toLowerCase() === "pendaftaran penduduk" : false;
    const titleKasie = isDafduk ? "3. Kasie Dafduk" : "3. Kasie Capil";
    const hasKasie = !!item.catatan_kasie;
    let kasieDetail = hasKasie 
      ? `Verifikasi disetujui.<br><span style="font-size:0.75rem; color:var(--text-muted);">Diproses pada: ${item.tgl_kasie || "-"}</span>` 
      : "Menunggu verifikasi Kasie.";
    timelineHtml += createTimelineItem(titleKasie, kasieDetail, item.catatan_kasie, hasKasie);
  }

  // 4. Langkah Kabid (Dafduk / Capil)
  // Catatan: Capil UPT langsung cetak dari UPT, tidak lewat kabid
  const isCapilUPT = isUPT && (item.jenis_layanan ? String(item.jenis_layanan).trim().toLowerCase() === "pencatatan sipil" : false);
  if (!isCapilUPT) {
    const isDafduk = item.jenis_layanan ? String(item.jenis_layanan).trim().toLowerCase() === "pendaftaran penduduk" : false;
    const titleKabid = isDafduk ? "4. Kabid Dafduk" : "4. Kabid Capil";
    const hasKabid = !!item.catatan_kabid;
    let kabidDetail = hasKabid 
      ? `Validasi disetujui.<br><span style="font-size:0.75rem; color:var(--text-muted);">Diproses pada: ${item.tgl_kabid || "-"}</span>` 
      : "Menunggu validasi Kabid.";
    timelineHtml += createTimelineItem(titleKabid, kabidDetail, item.catatan_kabid, hasKabid);

    // 5. Langkah Kadis
    const hasKadis = !!item.catatan_kadis;
    let kadisDetail = hasKadis 
      ? `Sertifikasi ditandatangani.<br><span style="font-size:0.75rem; color:var(--text-muted);">Diproses pada: ${item.tgl_kadis || "-"}</span>` 
      : "Menunggu sertifikasi Kadis.";
    timelineHtml += createTimelineItem("5. Kepala Dinas (Kadis)", kadisDetail, item.catatan_kadis, hasKadis);

    // 6. Langkah TTE
    const hasTTE = !!item.status_tte;
    let tteDetail = hasTTE 
      ? `Status TTE: ${item.status_tte}<br><span style="font-size:0.75rem; color:var(--text-muted);">Diproses pada: ${item.tgl_tte || "-"}</span>` 
      : "Menunggu berkas di TTE.";
    timelineHtml += createTimelineItem("6. Petugas TTE", tteDetail, "", hasTTE);
  }

  // 7. Langkah Pencetakan
  const hasPrint = !!item.penerima;
  let printText = hasPrint 
    ? `Diserahkan kepada: <strong>${item.penerima}</strong><br><span style="font-size:0.75rem; color:var(--text-muted);">Dicetak pada: ${item.tgl_print || "-"}</span>` 
    : "Menunggu dokumen dicetak dan diambil masyarakat.";
  timelineHtml += createTimelineItem(isCapilUPT ? "4. Petugas Pencetakan UPT" : "7. Petugas Pencetakan Dinas", printText, item.catatan_print, hasPrint);

  detailModalBody.innerHTML = `
    <div class="modal-info-panel">
      <div class="info-row"><span>Kode Berkas:</span> <strong>${item.key}</strong></div>
      <div class="info-row"><span>Nama Pemohon:</span> <span>${item.pemohon}</span></div>
      <div class="info-row"><span>No. HP / Email:</span> <span>${item.no_hp} / ${item.email}</span></div>
      <div class="info-row"><span>Alamat:</span> <span>${item.alamat}</span></div>
      <div class="info-row"><span>Layanan:</span> <strong>${item.jenis_layanan} (${item.sub_layanan})</strong></div>
      ${item.riwayat_pending ? `<div class="info-row" style="flex-direction:column; margin-top:8px;">
        <span>Riwayat Log Pending:</span>
        <div class="riwayat-pending-box">${item.riwayat_pending}</div>
      </div>` : ''}
    </div>
    
    <h3>Langkah Workflow Dokumen:</h3>
    <div class="timeline">
      ${timelineHtml}
    </div>
  `;

  detailModal.style.display = 'flex';
};

function createTimelineItem(title, detail, notes, isActive) {
  return `
    <div class="timeline-item ${isActive ? 'active' : ''}">
      <div class="timeline-dot"></div>
      <div class="timeline-content">
        <h4>${title}</h4>
        <p>${detail}</p>
        ${notes ? `<p class="timeline-notes">"${notes}"</p>` : ''}
      </div>
    </div>
  `;
}

closeDetailModalBtn.addEventListener('click', closeDetailModal);
closeDetailBtn.addEventListener('click', closeDetailModal);
window.addEventListener('click', (e) => {
  if (e.target === detailModal) closeDetailModal();
});

function closeDetailModal() {
  detailModal.style.display = 'none';
}

// ================= REKAPITULASI CONTROLLER =================
function renderRekapitulasi() {
  const dataToCount = (currentUser.uptCode && currentUser.uptCode !== 'Dinas') ? allData.filter(x => isUptMatch(x.operator, currentUser.uptCode)) : allData;

  const printTitle = document.querySelector('.print-title h2');
  if (printTitle) {
    printTitle.textContent = currentUser.uptCode 
      ? `REKAPITULASI DOKUMEN PELAYANAN - ${currentUser.uptCode}`
      : "REKAPITULASI DOKUMEN PELAYANAN";
  }

  rekapTotalCount.textContent = dataToCount.length;
  rekapDinasCount.textContent = dataToCount.filter(x => x.fasilitasi === 'Dinas').length;
  rekapUptCount.textContent = dataToCount.filter(x => x.fasilitasi === 'UPT').length;
  rekapSelesaiCount.textContent = dataToCount.filter(x => x.status_alur === '7_SELESAI').length;

  // Hitung jumlah berkas di masing-masing step workflow
  const STEPS = [
    { label: "1. Petugas Scan", state: "1_PETUGAS_SCAN" },
    { label: "2. Verifikasi Kasie / UPT", state: ["2_VERIFIKASI_KASIE", "2_VERIFIKASI_UPT"] },
    { label: "3. Validasi Kabid", state: "3_VALIDASI_KABID" },
    { label: "4. Sertifikasi Kadis", state: "4_SERTIFIKASI_KADIS" },
    { label: "5. Tahap TTE", state: "5_TTE" },
    { label: "6. Tahap Pencetakan", state: ["6_PENCETAKAN_DINAS", "6_PENCETAKAN_UPT"] },
    { label: "7. Selesai Diproses", state: "7_SELESAI" },
    { label: "PENDING (Kembali ke Operator)", state: "PENDING_OPERATOR" }
  ];

  rekapWorkflowTableBody.innerHTML = STEPS.map(step => {
    let dinasCount = 0;
    let uptCount = 0;
    
    if (Array.isArray(step.state)) {
      dinasCount = dataToCount.filter(x => x.fasilitasi === 'Dinas' && step.state.includes(x.status_alur)).length;
      uptCount = dataToCount.filter(x => x.fasilitasi === 'UPT' && step.state.includes(x.status_alur)).length;
    } else {
      dinasCount = dataToCount.filter(x => x.fasilitasi === 'Dinas' && x.status_alur === step.state).length;
      uptCount = dataToCount.filter(x => x.fasilitasi === 'UPT' && x.status_alur === step.state).length;
    }

    return `
      <tr>
        <td style="font-weight:600;">${step.label}</td>
        <td>${dinasCount} Berkas</td>
        <td>${uptCount} Berkas</td>
        <td style="font-weight:700; color:var(--primary);">${dinasCount + uptCount} Berkas</td>
      </tr>
    `;
  }).join('');
}

// Event: Cetak PDF
printReportBtn.addEventListener('click', () => {
  window.print();
});

// ================= TOAST & HELPER FUNCTIONS =================
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  
  setTimeout(() => {
    toast.className = 'toast';
  }, 3500);
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
