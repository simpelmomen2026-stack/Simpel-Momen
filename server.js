const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DB_FILE = path.join(__dirname, 'db.json');

// Inisialisasi Mock Data Antrean & Monitoring Alur
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([
    {
      no_antrian: "A-01",
      tanggal: new Date(Date.now() - 7200000).toISOString(),
      nama: "Ahmad Subarjo",
      layanan: "Pendaftaran Penduduk (KTP-el Baru)",
      fasilitasi: "Fasilitasi Dinas",
      stage: "TTE / Pencetakan",
      status: "Selesai",
      keterangan: "Berkas lengkap, KTP telah dicetak."
    },
    {
      no_antrian: "A-02",
      tanggal: new Date(Date.now() - 3600000).toISOString(),
      nama: "Rina Kartika",
      layanan: "Pendaftaran Penduduk (Pindah Domisili)",
      fasilitasi: "UPT",
      stage: "Kasie",
      status: "Pending",
      keterangan: "Kurang fotokopi Surat Pengantar RT/RW."
    },
    {
      no_antrian: "B-05",
      tanggal: new Date().toISOString(),
      nama: "Hendra Wijaya",
      layanan: "Pencatatan Sipil (Akta Kelahiran)",
      fasilitasi: "Fasilitasi Dinas",
      stage: "Kadis",
      status: "Pending",
      keterangan: "Menunggu tanda tangan digital Kepala Dinas."
    },
    {
      no_antrian: "A-03",
      tanggal: new Date().toISOString(),
      nama: "Siti Rahmawati",
      layanan: "KTP-el / KIA (Cetak Ulang Rusak)",
      fasilitasi: "UPT",
      stage: "Kabid",
      status: "Pending",
      keterangan: "Verifikasi dokumen oleh Kabid."
    },
    {
      no_antrian: "B-08",
      tanggal: new Date().toISOString(),
      nama: "Budi Pratama",
      layanan: "Pendaftaran Penduduk (Kartu Keluarga)",
      fasilitasi: "Fasilitasi Dinas",
      stage: "Operator",
      status: "Pending",
      keterangan: "Baru saja diinput oleh Operator."
    }
  ], null, 2));
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  if (pathname === '/api/guests') {
    if (req.method === 'GET') {
      fs.readFile(DB_FILE, 'utf8', (err, data) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'error', message: 'Gagal membaca database' }));
          return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'success', data: JSON.parse(data) }));
      });
    } else if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body);
          
          if (payload.action === 'update') {
            fs.readFile(DB_FILE, 'utf8', (err, fileData) => {
              if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'error', message: 'Gagal membaca database' }));
                return;
              }
              
              let list = JSON.parse(fileData);
              const targetKey = payload.key;
              
              let foundIndex = -1;
              for (let i = 0; i < list.length; i++) {
                const item = list[i];
                const key = `${item.no_antrian}_${item.nama}_${item.tanggal}`.replace(/\s+/g, '_');
                if (key === targetKey) {
                  foundIndex = i;
                  break;
                }
              }
              
              if (foundIndex !== -1) {
                list[foundIndex].fasilitasi = payload.fasilitasi || list[foundIndex].fasilitasi;
                list[foundIndex].stage = payload.stage || list[foundIndex].stage;
                list[foundIndex].status = payload.status || list[foundIndex].status;
                list[foundIndex].keterangan = payload.keterangan !== undefined ? payload.keterangan : list[foundIndex].keterangan;
                
                fs.writeFile(DB_FILE, JSON.stringify(list, null, 2), 'utf8', (writeErr) => {
                  if (writeErr) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ status: 'error', message: 'Gagal menyimpan update' }));
                    return;
                  }
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ status: 'success', message: 'Data, Fasilitasi & Alur berhasil diperbarui!' }));
                });
              } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'error', message: 'Data antrean tidak ditemukan' }));
              }
            });
          } else {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'error', message: 'Aksi tidak didukung' }));
          }
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'error', message: 'Format data tidak valid' }));
        }
      });
    }
    return;
  }

  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
  
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Akses Ditolak');
    return;
  }

  const extname = path.extname(filePath);
  let contentType = 'text/html';
  switch (extname) {
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.css':
      contentType = 'text/css';
      break;
    case '.json':
      contentType = 'application/json';
      break;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('Berkas tidak ditemukan');
      } else {
        res.writeHead(500);
        res.end(`Kesalahan Server: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server simulasi Simpel Momen berjalan di http://localhost:${PORT}`);
});
