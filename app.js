// Hapus cache lokal lama dari browser agar selalu terhubung ke server Google Sheets online
if (localStorage.getItem('simpel_momen_api_url') && (localStorage.getItem('simpel_momen_api_url').includes('localhost') || localStorage.getItem('simpel_momen_api_url') === 'local')) {
  localStorage.removeItem('simpel_momen_api_url');
}

let API_URL = 'https://script.google.com/macros/s/AKfycbwb-GMpH8UYImv4np9MDLHgeixCjGbCI4IXUF-8X3KASSZY7MQdv7cSmA-Vyiy5yVXTIg/exec';
let allData = [];
let activeTab = 'tabel'; // 'tabel' or 'alur'

// DOM Elements
const configPanel = document.getElementById('configPanel');
const toggleConfigBtn = document.getElementById('toggleConfigBtn');
const apiUrlInput = document.getElementById('apiUrlInput');
const saveConfigBtn = document.getElementById('saveConfigBtn');
const connectionStatus = document.getElementById('connectionStatus');
const refreshBtn = document.getElementById('refreshBtn');

// Nav Tabs
const tabTabelBtn = document.getElementById('tabTabelBtn');
const tabAlurBtn = document.getElementById('tabAlurBtn');
const viewTabel = document.getElementById('viewTabel');
const viewAlur = document.getElementById('viewAlur');

const valTotal = document.getElementById('valTotal');
const valPending = document.getElementById('valPending');
const valSelesai = document.getElementById('valSelesai');

const searchInput = document.getElementById('searchInput');
const filterFasilitasi = document.getElementById('filterFasilitasi');
const filterLayanan = document.getElementById('filterLayanan');
const filterStatus = document.getElementById('filterStatus');
const entriesCount = document.getElementById('entriesCount');
const tableBody = document.getElementById('tableBody');

// Modal Elements
const actionModal = document.getElementById('actionModal');
const modalKey = document.getElementById('modalKey');
const modalNama = document.getElementById('modalNama');
const modalNoAntrean = document.getElementById('modalNoAntrean');
const modalFasilitasi = document.getElementById('modalFasilitasi');
const modalStage = document.getElementById('modalStage');
const modalStatus = document.getElementById('modalStatus');
const modalKeterangan = document.getElementById('modalKeterangan');
const actionForm = document.getElementById('actionForm');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const saveModalBtn = document.getElementById('saveModalBtn');

// Initialize Config
apiUrlInput.value = API_URL;
updateConnectionStatusText();

// Tab Switcher Handler
tabTabelBtn.addEventListener('click', () => switchTab('tabel'));
tabAlurBtn.addEventListener('click', () => switchTab('alur'));

function switchTab(tab) {
  activeTab = tab;
  if (tab === 'tabel') {
    tabTabelBtn.classList.add('active');
    tabAlurBtn.classList.remove('active');
    viewTabel.style.display = 'block';
    viewAlur.style.display = 'none';
  } else {
    tabAlurBtn.classList.add('active');
    tabTabelBtn.classList.remove('active');
    viewTabel.style.display = 'none';
    viewAlur.style.display = 'block';
    renderAlurBoard(allData);
  }
}

// Config Panel Listeners
toggleConfigBtn.addEventListener('click', () => {
  const isHidden = configPanel.style.display === 'none';
  configPanel.style.display = isHidden ? 'block' : 'none';
});

saveConfigBtn.addEventListener('click', () => {
  const url = apiUrlInput.value.trim();
  if (!url) {
    showToast('Silakan masukkan URL API yang valid!', 'error');
    return;
  }
  
  localStorage.setItem('simpel_momen_api_url', url);
  API_URL = url;
  updateConnectionStatusText();
  showToast('Konfigurasi API diperbarui!', 'success');
  loadData();
});

refreshBtn.addEventListener('click', () => {
  loadData();
  showToast('Memperbarui data...', 'success');
});

// Filter & Search Events
searchInput.addEventListener('input', applyFilters);
filterFasilitasi.addEventListener('change', applyFilters);
filterLayanan.addEventListener('change', applyFilters);
filterStatus.addEventListener('change', applyFilters);

// Modal Close Events
closeModalBtn.addEventListener('click', closeModal);
cancelModalBtn.addEventListener('click', closeModal);
window.addEventListener('click', (e) => {
  if (e.target === actionModal) closeModal();
});

// Form Submit (Update Status, Fasilitasi, Stage & Keterangan)
actionForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const key = modalKey.value;
  const fasilitasi = modalFasilitasi.value;
  const stage = modalStage.value;
  const status = modalStatus.value;
  const keterangan = modalKeterangan.value;
  
  saveModalBtn.disabled = true;
  saveModalBtn.textContent = 'Menyimpan...';
  
  const payload = {
    action: 'update',
    key: key,
    fasilitasi: fasilitasi,
    stage: stage,
    status: status,
    keterangan: keterangan
  };
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) throw new Error('Gagal memperbarui status di server.');
    
    const result = await response.json();
    if (result.status === 'success') {
      showToast('Status & Tahap Alur berhasil diperbarui!', 'success');
      closeModal();
      loadData();
    } else {
      throw new Error(result.message || 'Gagal memperbarui data.');
    }
  } catch (error) {
    console.error(error);
    showToast('Permintaan dikirim! Memperbarui dasbor...', 'success');
    closeModal();
    setTimeout(loadData, 1500);
  } finally {
    saveModalBtn.disabled = false;
    saveModalBtn.textContent = 'Simpan Ke Spreadsheet';
  }
});

function updateConnectionStatusText() {
  const isMock = API_URL.includes('localhost') || API_URL.includes('127.0.0.1');
  const indicator = connectionStatus.querySelector('.status-indicator');
  
  if (isMock) {
    indicator.className = 'status-indicator offline';
    connectionStatus.innerHTML = '<span class="status-indicator offline"></span> Menghubungkan ke server simulasi lokal.';
  } else {
    indicator.className = 'status-indicator online';
    connectionStatus.innerHTML = '<span class="status-indicator online"></span> Terhubung ke jembatan Google Sheets asli.';
  }
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  
  setTimeout(() => {
    toast.className = 'toast';
  }, 3000);
}

// Fetch Data
async function loadData() {
  tableBody.innerHTML = Array(5).fill(0).map(() => `
    <tr>
      <td><div class="skeleton"></div></td>
      <td><div class="skeleton"></div></td>
      <td><div class="skeleton"></div></td>
      <td><div class="skeleton"></div></td>
      <td><div class="skeleton"></div></td>
      <td><div class="skeleton"></div></td>
      <td><div class="skeleton"></div></td>
      <td><div class="skeleton"></div></td>
      <td><div class="skeleton"></div></td>
    </tr>
  `).join('');
  
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Gagal mengambil data.');
    
    const resJson = await response.json();
    let rawRows = [];
    
    if (resJson.status === 'success' && Array.isArray(resJson.data)) {
      rawRows = resJson.data;
    } else if (Array.isArray(resJson)) {
      rawRows = resJson;
    }
    
    allData = rawRows.map((row, idx) => {
      const noAntrian = row.no_antrian || row['No. Antrean'] || row['No Antrean'] || row.no || row.antrean || idx + 1;
      const tanggal = row.tanggal || row.waktu || row.Tanggal || row.Timestamp || '-';
      const nama = row.nama || row['Nama Pemohon'] || row.nama_pemohon || '-';
      const layanan = row.layanan || row['Jenis Layanan'] || row.layanan_id || '-';
      const fasilitasi = row.fasilitasi || row.lokasi || row['Fasilitasi / Lokasi'] || 'Fasilitasi Dinas';
      const stage = row.stage || row.posisi_alur || row.tahap || 'Kadis';
      const status = row.status || row.Status || 'Pending';
      const keterangan = row.keterangan || row.Catatan || row['Catatan / Keterangan'] || '';
      
      const key = `${noAntrian}_${nama}_${tanggal}`.replace(/\s+/g, '_');
      
      return { noAntrian, tanggal, nama, layanan, fasilitasi, stage, status, keterangan, key };
    });
    
    calculateMetrics(allData);
    populateFasilitasiFilterOptions();
    applyFilters();
    if (activeTab === 'alur') renderAlurBoard(allData);
  } catch (error) {
    console.error(error);
    tableBody.innerHTML = `
      <tr>
        <td colspan="9" class="text-center text-muted" style="color: var(--danger); padding: 2rem;">
          ❌ Gagal memuat data antrean. Pastikan URL API dikonfigurasi dengan benar.
        </td>
      </tr>
    `;
    valTotal.textContent = '-';
    valPending.textContent = '-';
    valSelesai.textContent = '-';
  }
}

function calculateMetrics(data) {
  valTotal.textContent = data.length;
  valPending.textContent = data.filter(item => String(item.status).trim().toLowerCase() === 'pending').length;
  valSelesai.textContent = data.filter(item => String(item.status).trim().toLowerCase() === 'selesai').length;
}function populateFasilitasiFilterOptions() {
  if (!filterFasilitasi) return;
  const currentVal = filterFasilitasi.value;
  
  const uptSet = new Set();
  if (Array.isArray(allData)) {
    allData.forEach(item => {
      const op = String(item.operator || "");
      const fas = String(item.fasilitasi || "");
      const match = op.match(/UPT[-\s]?\d+/i) || fas.match(/UPT[-\s]?\d+/i);
      if (match) {
        uptSet.add(match[0].toUpperCase().replace(/\s+/, '-'));
      }
    });
  }
  
  let html = `
    <option value="ALL">🌐 Semua Fasilitasi (Dinas & UPT)</option>
    <option value="Dinas">🏢 Khusus Fasilitasi Dinas</option>
    <option value="UPT">🏛️ Khusus Semua UPT</option>
  `;
  
  uptSet.forEach(upt => {
    html += `<option value="${upt}">📍 Khusus ${upt}</option>`;
  });
  
  filterFasilitasi.innerHTML = html;
  filterFasilitasi.value = currentVal || "ALL";
}

function applyFilters() {
  const searchVal = searchInput.value.toLowerCase().trim();
  const fasilitasiVal = filterFasilitasi.value;
  const layananVal = filterLayanan.value;
  const statusVal = filterStatus.value;
  
  const filtered = allData.filter(item => {
    const matchSearch = String(item.nama || item.pemohon || "").toLowerCase().includes(searchVal) || 
                        String(item.noAntrian || item.key || "").toLowerCase().includes(searchVal);
                        
    let matchFasilitasi = true;
    if (fasilitasiVal !== 'ALL') {
      const itemFas = String(item.fasilitasi || "").toLowerCase();
      const itemOp = String(item.operator || "").toLowerCase();
      const filterLow = fasilitasiVal.toLowerCase();
      
      if (filterLow === 'dinas' || filterLow === 'fasilitasi dinas') {
        matchFasilitasi = itemFas.includes('dinas') || (!itemFas.includes('upt') && !itemOp.includes('upt'));
      } else if (filterLow === 'upt') {
        matchFasilitasi = itemFas.includes('upt') || itemOp.includes('upt');
      } else {
        const cleanFilter = filterLow.replace(/[^a-z0-9]/g, '');
        const cleanItemFas = itemFas.replace(/[^a-z0-9]/g, '');
        const cleanItemOp = itemOp.replace(/[^a-z0-9]/g, '');
        matchFasilitasi = cleanItemFas.includes(cleanFilter) || cleanItemOp.includes(cleanFilter);
      }
    }

    const matchLayanan = layananVal === 'ALL' || String(item.layanan || item.jenis_layanan || "").toLowerCase().includes(layananVal.toLowerCase());
    const matchStatus = statusVal === 'ALL' || String(item.status || item.status_alur || "").trim().toLowerCase().includes(statusVal.toLowerCase());
    
    return matchSearch && matchFasilitasi && matchLayanan && matchStatus;
  });
  
  entriesCount.textContent = `Menampilkan ${filtered.length} dari ${allData.length} data`;
  renderTable(filtered);
}

function renderTable(rows) {
  if (rows.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="9" class="text-center text-muted" style="padding: 2rem;">
          Tidak ada data antrean yang cocok dengan filter pencarian.
        </td>
      </tr>
    `;
    return;
  }
  
  tableBody.innerHTML = rows.map((row) => {
    const statusClass = String(row.status).trim().toLowerCase() === 'selesai' ? 'selesai' : 'pending';
    const fasilitasiClass = String(row.fasilitasi).trim().toLowerCase().includes('upt') ? 'badge-upt' : 'fasilitasi-dinas';
    
    return `
      <tr>
        <td style="font-weight: 700; font-family: var(--font-title); color: #3b82f6;">${escapeHTML(row.noAntrian)}</td>
        <td style="white-space: nowrap; font-size: 0.85rem; color: var(--text-muted);">${formatDate(row.tanggal)}</td>
        <td style="font-weight: 500; color: #fff;">${escapeHTML(row.nama)}</td>
        <td>${escapeHTML(row.layanan)}</td>
        <td>
          <span class="badge ${fasilitasiClass}">${escapeHTML(row.fasilitasi)}</span>
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
