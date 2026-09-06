/**
 * Google Apps Script - Jembatan Database (Simpel Momen)
 * 
 * PETUNJUK DEPLOYMENT:
 * 1. Buka Google Sheet baru atau yang sudah ada.
 * 2. Buat header pada baris pertama (Row 1) dari kolom A sampai AD:
 *    A: Key | B: Tanggal | C: Fasilitasi | D: Operator | E: Pemohon | F: Alamat | G: No HP | H: Email |
 *    I: Integrasi | J: Jenis Layanan | K: Sub Layanan | L: Link File | M: Status Alur | N: Status TTE |
 *    O: Penerima | P: Catatan Scan | Q: Catatan Kasie | R: Catatan Kabid | S: Catatan Kadis | T: Catatan UPT |
 *    U: Catatan Print | V: Riwayat Pending | W: Tgl Operator | X: Tgl Scan | Y: Tgl Kasie | Z: Tgl UPT |
 *    AA: Tgl Kabid | AB: Tgl Kadis | AC: Tgl TTE | AD: Tgl Print
 * 3. Masuk ke menu "Extensions" > "Apps Script".
 * 4. Hapus seluruh isi kode bawaan, lalu tempelkan (paste) seluruh kode di bawah ini.
 * 5. Klik ikon Simpan (Save).
 * 6. Klik tombol "Deploy" > "New deployment".
 * 7. Pilih type: "Web app".
 * 8. Konfigurasi:
 *    - Description: Simpel Momen Database API (Dengan WA Gateway Fonnte Enhanced)
 *    - Execute as: Me (email Anda)
 *    - Who has access: Anyone
 * 9. Klik "Deploy" / "New Version". Salin Web app URL yang muncul.
 */

// CONFIGURASI DATABASE & NOTIFIKASI WHATSAPP (Via Fonnte Gateway)
var SPREADSHEET_ID = ""; // Diisi otomatis / opsional jika skrip terpisah
var FONNTE_TOKEN = "miMYecGgHMbMw3kZPmCM"; 
var WA_GROUP_DINAS = "120363417098026103@g.us"; // Group JID Resmi Grup Dinas ("TEKNIS PELAYANAN DOKUMEN")
var WA_GROUP_UPT = "120363409941075173@g.us"; // Group JID Resmi Grup UPT
var WA_ADMIN_NUMBER = "082397724667"; // Nomor WA Admin (Ter-format ke 6282397724667)

// FUNGSI KHUSUS UNTUK MEMICU POPUP OTORISASI IZIN GOOGLE
function authorizePermissions() {
  try {
    var options = {
      method: "post",
      headers: { "Authorization": FONNTE_TOKEN },
      muteHttpExceptions: true
    };
    var res = UrlFetchApp.fetch("https://api.fonnte.com/device", options);
    Logger.log("✅ OTORISASI GOOGLE APPS SCRIPT BERHASIL!");
    Logger.log("Respon Status Fonnte Device: " + res.getContentText());
  } catch (e) {
    Logger.log("Pemicu Otorisasi: " + e.toString());
  }
}

// FUNGSI UTAMA AKSES SPREADSHEET (Otomatis Deteksi Active Spreadsheet)
function getSpreadsheet() {
  var ss = null;
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {
    ss = null;
  }
  if (ss) return ss;
  
  if (typeof SPREADSHEET_ID !== "undefined" && SPREADSHEET_ID && SPREADSHEET_ID.trim() !== "") {
    var cleanId = SPREADSHEET_ID.trim();
    try {
      if (cleanId.indexOf("docs.google.com") !== -1) {
        return SpreadsheetApp.openByUrl(cleanId);
      }
      return SpreadsheetApp.openById(cleanId);
    } catch (errId) {
      Logger.log("Gagal openById: " + errId.toString());
    }
  }
  
  throw new Error("Spreadsheet tidak terhubung! Silakan buka Apps Script dari menu Extensions > Apps Script pada file Google Sheet Anda.");
}

// FUNGSI UJI COBA WA GATEWAY LANGSUNG DARI APPS SCRIPT EDITOR
function testSendWA() {
  var testMsgDinas = "🧪 *[SIMPEL MOMEN - TEST WA GATEWAY DINAS]*\n" +
                     "Halo! Notifikasi WhatsApp dari Simpel Momen Dukcapil terhubung ke Grup Dinas (120363417098026103@g.us) & Admin (082397724667).";
  var testMsgUpt = "🧪 *[SIMPEL MOMEN - TEST WA GATEWAY UPT]*\n" +
                   "Halo! Notifikasi WhatsApp dari Simpel Momen Dukcapil terhubung ke Grup UPT (120363409941075173@g.us) & Admin (082397724667).";
  
  sendWhatsAppNotification(testMsgDinas, "Dinas");
  sendWhatsAppNotification(testMsgUpt, "UPT");
}

// FUNGSI CEK DAFTAR NAMA & ID GRUP WA DARI FONNTE
function getFonnteGroups() {
  var url = "https://api.fonnte.com/get-whatsapp-group";
  var options = {
    method: "post",
    headers: {
      "Authorization": FONNTE_TOKEN
    },
    muteHttpExceptions: true
  };
  try {
    var response = UrlFetchApp.fetch(url, options);
    Logger.log("=== DAFTAR GRUP WHATSAPP TERHUBUNG DI FONNTE ===");
    Logger.log(response.getContentText());
  } catch (e) {
    Logger.log("Gagal mengambil grup dari Fonnte: " + e.toString());
  }
}

function sendWhatsAppNotification(waMsg, fasilitasi) {
  if (!FONNTE_TOKEN) return;
  
  var isUpt = false;
  if (fasilitasi) {
    isUpt = fasilitasi.toString().toUpperCase().indexOf("UPT") !== -1;
  } else if (waMsg) {
    isUpt = waMsg.indexOf("Fasilitasi: *UPT*") !== -1 || waMsg.indexOf("Fasilitasi: UPT") !== -1 || waMsg.indexOf("UPT") !== -1;
  }
  
  var targetGroup = isUpt ? WA_GROUP_UPT : WA_GROUP_DINAS;
  
  if (targetGroup) sendWhatsAppMessage(targetGroup, waMsg);
  if (WA_ADMIN_NUMBER) sendWhatsAppMessage(WA_ADMIN_NUMBER, waMsg);
}

// Menangani permintaan GET (Membaca seluruh data dari spreadsheet OR Autentikasi Login/CheckSession via GET query string)
function doGet(e) {
  try {
    var params = (e && e.parameter) ? e.parameter : {};
    var action = params.action || "";
    
    // Autentikasi via GET URL Parameters (Bebas dari masalah 302 POST CORS cross-origin redirect browser)
    if (action === 'login') {
      return handleLogin(params.username, params.password);
    }
    
    if (action === 'check_session') {
      return handleCheckSession(params.username, params.sessionToken);
    }

    var sheet = getSpreadsheet().getActiveSheet();
    ensureColumns(sheet, 30); // Pastikan memiliki minimal 30 kolom
    var lastRow = sheet.getLastRow();
    
    // Jika sheet kosong (hanya ada header atau kosong sama sekali)
    if (lastRow <= 1) {
      return ContentService.createTextOutput(JSON.stringify({ status: "success", data: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Baca 30 kolom dari A sampai AD
    var dataRange = sheet.getRange(2, 1, lastRow - 1, 30);
    var values = dataRange.getValues();
    var records = [];
    
    for (var i = 0; i < values.length; i++) {
      var row = values[i];
      // Pastikan baris memiliki data Key
      if (row[0]) {
        records.push({
          key: row[0].toString(),
          tanggal: formatDate(row[1]),
          fasilitasi: row[2].toString(),
          operator: row[3].toString(),
          pemohon: row[4].toString(),
          alamat: row[5].toString(),
          no_hp: row[6].toString(),
          email: row[7].toString(),
          integrasi: row[8].toString(),
          jenis_layanan: row[9].toString(),
          sub_layanan: row[10].toString(),
          link_file: row[11].toString(),
          status_alur: row[12].toString(),
          status_tte: row[13].toString(),
          penerima: row[14].toString(),
          catatan_scan: row[15].toString(),
          catatan_kasie: row[16].toString(),
          catatan_kabid: row[17].toString(),
          catatan_kadis: row[18].toString(),
          catatan_upt: row[19].toString(),
          catatan_print: row[20].toString(),
          riwayat_pending: row[21].toString(),
          tgl_operator: row[22] ? row[22].toString() : "",
          tgl_scan: row[23] ? row[23].toString() : "",
          tgl_kasie: row[24] ? row[24].toString() : "",
          tgl_upt: row[25] ? row[25].toString() : "",
          tgl_kabid: row[26] ? row[26].toString() : "",
          tgl_kadis: row[27] ? row[27].toString() : "",
          tgl_tte: row[28] ? row[28].toString() : "",
          tgl_print: row[29] ? row[29].toString() : ""
        });
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", data: records }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Menangani permintaan POST (Menyimpan data baru & memperbarui status/meja alur berkas)
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Pengujian doPost langsung dari editor memerlukan data payload JSON. Silakan uji coba melalui aplikasi web atau jalankan fungsi testSendWA." }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var payload = JSON.parse(e.postData.contents);
    
    // 0. AUTENTIKASI PETUGAS
    if (payload.action === 'login') {
      return handleLogin(payload.username, payload.password);
    }
    
    // 0.5 CHECK SESSION LOGIN (PREVENT MULTI DEVICE LOGIN)
    if (payload.action === 'check_session') {
      return handleCheckSession(payload.username, payload.sessionToken);
    }
    
    var sheet = getSpreadsheet().getActiveSheet();
    ensureColumns(sheet, 30); // Pastikan memiliki minimal 30 kolom
    
    // 1. TAMBAH BARU (OPERATOR INPUT)
    if (payload.action === 'create') {
      var data = payload.data;
      var key = data.key || generateUniqueKey();
      var tanggal = data.tanggal || new Date().toISOString().slice(0, 10);
      var timeStr = getLocalDateTimeString();
      
      var values = [
        key,
        tanggal,
        data.fasilitasi,
        data.operator,
        data.pemohon,
        data.alamat,
        data.no_hp,
        data.email,
        data.integrasi,
        data.jenis_layanan,
        data.sub_layanan,
        "", // link_file (kosong awal)
        "1_PETUGAS_SCAN", // status_alur
        "", // status_tte
        "", // penerima
        "", // catatan_scan
        "", // catatan_kasie
        "", // catatan_kabid
        "", // catatan_kadis
        "", // catatan_upt
        "", // catatan_print
        data.riwayat_pending || "", // riwayat_pending
        timeStr, // tgl_operator (W)
        "", // tgl_scan (X)
        "", // tgl_kasie (Y)
        "", // tgl_upt (Z)
        "", // tgl_kabid (AA)
        "", // tgl_kadis (AB)
        "", // tgl_tte (AC)
        ""  // tgl_print (AD)
      ];
      
      // Cari jika data key sudah ada (mengupdate berkas pending yang diperbaiki operator)
      var foundRow = findRowByKey(sheet, key);
      if (foundRow !== -1) {
        sheet.getRange(foundRow, 1, 1, 30).setValues([values]);
      } else {
        sheet.insertRowBefore(2);
        sheet.getRange(2, 1, 1, 30).setValues([values]);
      }
      
      // Kirim Notifikasi WA HANYA ke Grup Khusus Target
      try {
        var ss = getSpreadsheet();
        var userDetails = getUserDetailsFromPetugasSheet(ss, data.operator || data.userName);
        var namaLengkap = userDetails.name || data.operator || data.userName || "Operator";
        var roleTitle = userDetails.role || "Operator";
        var fasTag = (data.fasilitasi && data.fasilitasi.indexOf("UPT") !== -1) ? "Fasilitasi: *UPT*" : "Fasilitasi: *Dinas*";
        
        var waMsg = "Saya *" + namaLengkap + "* selaku *" + roleTitle + "* menyampaikan bahwa dokumen *" + data.sub_layanan + "* (" + fasTag + ") atas nama *" + data.pemohon + "* telah di input.\n" +
                    "Selanjutnya mohon petugas scan proses lanjut.\n\n" +
                    "Terima Kasih";
        
        // Kirim Notifikasi WA ke Grup Target (Dinas/UPT) & Admin 082397724667
        sendWhatsAppNotification(waMsg, data.fasilitasi);
      } catch(waErr) {
        Logger.log("WA Error saat create: " + waErr.toString());
      }
      
      return ContentService.createTextOutput(JSON.stringify({ status: "success", data: { key: key } }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // 2. TINDAK LANJUT BERKAS (UPDATE BERJENJANG DARI MEJA KE MEJA)
    else if (payload.action === 'update') {
      var key = payload.key;
      var role = payload.role;
      var executeAction = payload.executeAction; // 'approve' atau 'pending'
      var notes = payload.notes || "";
      var timeStr = getLocalDateTimeString();
      
      var foundRow = findRowByKey(sheet, key);
      if (foundRow === -1) {
        throw new Error("Berkas dengan Key " + key + " tidak ditemukan.");
      }
      
      // Ambil data baris yang sekarang untuk memproses keputusan alur
      var currentStatus = sheet.getRange(foundRow, 13).getValue().toString(); // Column M (Status Alur)
      var currentLayanan = sheet.getRange(foundRow, 10).getValue().toString(); // Column J (Jenis Layanan)
      var currentFasilitasi = sheet.getRange(foundRow, 3).getValue().toString(); // Column C (Fasilitasi)
      var riwayatPending = sheet.getRange(foundRow, 22).getValue().toString(); // Column V (Riwayat Pending)
      var pemohonNoHp = sheet.getRange(foundRow, 7).getValue().toString().trim(); // Column G (No HP)
      
      var nextStatus = "";
      
      if (executeAction === 'pending' && role !== 'petugas_tte') {
        // Alur Pending: Kembalikan berkas ke operator
        nextStatus = "PENDING_OPERATOR";
        var logMsg = "PENDING by " + role + " pada " + timeStr + ": " + notes;
        var newRiwayat = riwayatPending ? logMsg + "\n---\n" + riwayatPending : logMsg;
        sheet.getRange(foundRow, 22).setValue(newRiwayat); // Col V
        
        if (role === 'kasie_dafduk' || role === 'kasie_capil') {
          sheet.getRange(foundRow, 17).setValue(notes); // Col Q
          sheet.getRange(foundRow, 25).setValue(timeStr); // Col Y (tgl_kasie)
        } else if (role === 'kepala_upt') {
          sheet.getRange(foundRow, 20).setValue(notes); // Col T
          sheet.getRange(foundRow, 26).setValue(timeStr); // Col Z (tgl_upt)
        } else if (role === 'kabid_dafduk' || role === 'kabid_capil') {
          sheet.getRange(foundRow, 18).setValue(notes); // Col R
          sheet.getRange(foundRow, 27).setValue(timeStr); // Col AA (tgl_kabid)
        } else if (role === 'kadis') {
          sheet.getRange(foundRow, 19).setValue(notes); // Col S
          sheet.getRange(foundRow, 28).setValue(timeStr); // Col AB (tgl_kadis)
        }
      } 
      
      else {
        // Alur Approve / Setuju Berjenjang
        if (role === 'petugas_scan') {
          var linkFile = payload.link_file || "";
          sheet.getRange(foundRow, 12).setValue(linkFile); // Col L (Link File)
          sheet.getRange(foundRow, 16).setValue(notes); // Col P (Catatan Scan)
          sheet.getRange(foundRow, 24).setValue(timeStr); // Col X (tgl_scan)
          nextStatus = (currentFasilitasi === "UPT" || currentFasilitasi.indexOf("UPT") !== -1) ? "2_VERIFIKASI_UPT" : "2_VERIFIKASI_KASIE";
        } 
        
        else if (role === 'kasie_dafduk' || role === 'kasie_capil') {
          sheet.getRange(foundRow, 17).setValue(notes); // Col Q (Catatan Kasie)
          sheet.getRange(foundRow, 25).setValue(timeStr); // Col Y (tgl_kasie)
          nextStatus = "3_VALIDASI_KABID";
        } 
        
        else if (role === 'kepala_upt') {
          sheet.getRange(foundRow, 20).setValue(notes); // Col T (Catatan UPT)
          sheet.getRange(foundRow, 26).setValue(timeStr); // Col Z (tgl_upt)
          if (currentLayanan.trim().toLowerCase() === "pendaftaran penduduk") {
            nextStatus = "3_VALIDASI_KABID";
          } else {
            nextStatus = "6_PENCETAKAN_UPT";
          }
        } 
        
        else if (role === 'kabid_dafduk' || role === 'kabid_capil') {
          sheet.getRange(foundRow, 18).setValue(notes); // Col R (Catatan Kabid)
          sheet.getRange(foundRow, 27).setValue(timeStr); // Col AA (tgl_kabid)
          
          var currentTteStatus = sheet.getRange(foundRow, 14).getValue().toString().trim().toLowerCase(); // Column N (Status TTE)
          if (currentTteStatus === "belum diajukan siak" || currentTteStatus === "belum verifikasi siak" || currentTteStatus.indexOf("belum") !== -1) {
            nextStatus = "5_TTE";
          } else {
            nextStatus = "4_SERTIFIKASI_KADIS";
          }
        } 
        
        else if (role === 'kadis') {
          sheet.getRange(foundRow, 19).setValue(notes); // Col S (Catatan Kadis)
          sheet.getRange(foundRow, 28).setValue(timeStr); // Col AB (tgl_kadis)
          nextStatus = "5_TTE";
        } 
        
        else if (role === 'petugas_tte') {
          var statusTteVal = payload.status_tte;
          sheet.getRange(foundRow, 14).setValue(statusTteVal); // Col N (Status TTE)
          sheet.getRange(foundRow, 29).setValue(timeStr); // Col AC (tgl_tte)
          
          var isUptFas = (currentFasilitasi === "UPT" || currentFasilitasi.indexOf("UPT") !== -1);
          var isPendaftaran = (currentLayanan.trim().toLowerCase() === "pendaftaran penduduk");
          
          if (statusTteVal === 'Belum diajukan SIAK') {
            if (isUptFas && isPendaftaran) {
              nextStatus = "2_VERIFIKASI_UPT"; // Kembali ke Kepala UPT (khusus Fasilitasi UPT Pendaftaran Penduduk)
            } else {
              nextStatus = "2_VERIFIKASI_KASIE"; // Kembali ke Kasie (Fasilitasi Dinas semua jenis layanan & UPT non-pendaftaran)
            }
            var logMsg = "BELUM DIAJUKAN SIAK by TTE pada " + timeStr + ": " + (notes || "Belum diajukan SIAK");
            var newRiwayat = riwayatPending ? logMsg + "\n---\n" + riwayatPending : logMsg;
            sheet.getRange(foundRow, 22).setValue(newRiwayat); // Col V (riwayat pending)
          } else if (statusTteVal === 'Belum Verifikasi SIAK') {
            nextStatus = "3_VALIDASI_KABID";
            var logMsg = "BELUM VERIFIKASI SIAK by TTE pada " + timeStr + ": " + (notes || "Belum Verifikasi SIAK");
            var newRiwayat = riwayatPending ? logMsg + "\n---\n" + riwayatPending : logMsg;
            sheet.getRange(foundRow, 22).setValue(newRiwayat); // Col V (riwayat pending)
          } else {
            nextStatus = (isUptFas) ? "6_PENCETAKAN_UPT" : "6_PENCETAKAN_DINAS";
          }
        } 
        
        else if (role === 'operator') {
          sheet.getRange(foundRow, 23).setValue(timeStr); // Col W (tgl_operator)
          if (notes) {
            var logMsg = "PERBAIKAN OPERATOR pada " + timeStr + ": " + notes;
            var newRiwayat = riwayatPending ? logMsg + "\n---\n" + riwayatPending : logMsg;
            sheet.getRange(foundRow, 22).setValue(newRiwayat); // Col V (riwayat_pending)
          }
          nextStatus = "1_PETUGAS_SCAN";
        }
        
        else if (role === 'petugas_pencetakan') {
          var penerimaVal = payload.penerima || "";
          sheet.getRange(foundRow, 15).setValue(penerimaVal); // Col O (Penerima)
          sheet.getRange(foundRow, 21).setValue(notes); // Col U (Catatan Print)
          sheet.getRange(foundRow, 30).setValue(timeStr); // Col AD (tgl_print)
          nextStatus = "7_SELESAI";
        }
      }
      
      // Update Status Alur Dokumen di Spreadsheet
      if (nextStatus) {
        sheet.getRange(foundRow, 13).setValue(nextStatus); // Col M
      }
      
      // Kirim Notifikasi WA Berdasarkan Tingkatan User (Role Templates)
      try {
        var ss = getSpreadsheet();
        var userDetails = getUserDetailsFromPetugasSheet(ss, payload.userName);
        var namaLengkap = userDetails.name || payload.userName || getRoleDisplayName(role);
        var roleTitle = userDetails.role || getRoleDisplayName(role);
        
        var pemohonName = sheet.getRange(foundRow, 5).getValue().toString().trim();
        var subLayanan = sheet.getRange(foundRow, 11).getValue().toString().trim();
        var currentFasilitasi = sheet.getRange(foundRow, 3).getValue().toString().trim();
        var fasTag = (currentFasilitasi && currentFasilitasi.indexOf("UPT") !== -1) ? "Fasilitasi: *UPT*" : "Fasilitasi: *Dinas*";
        var waMsg = "";
        
        if (role === 'operator') {
          waMsg = "Saya *" + namaLengkap + "* selaku *" + roleTitle + "* menyampaikan bahwa dokumen *" + subLayanan + "* (" + fasTag + ") atas nama *" + pemohonName + "* yang sebelumnya dipending telah kami PERBAIKI (" + (notes || "perbaikan berkas") + ").\n" +
                  "Selanjutnya mohon Petugas Scan dapat memproses berkas ke alur berikutnya.\n\n" +
                  "Terima Kasih.";
        }
        else if (role === 'petugas_scan') {
          var targetVerifikasi = (currentFasilitasi && currentFasilitasi.indexOf("UPT") !== -1) ? "Kepala UPT" : "Kepala Seksi";
          waMsg = "Saya *" + namaLengkap + "* selaku *" + roleTitle + "* menyampaikan bahwa dokumen *" + subLayanan + "* (" + fasTag + ") atas nama *" + pemohonName + "* telah kami tambahkan link filenya.\n" +
                  "Mohon " + targetVerifikasi + " dapat melakukan verifikasi dokumen.\n\n" +
                  "Terima Kasih";
        } 
        else if (role === 'kasie_dafduk' || role === 'kasie_capil' || role === 'kepala_upt') {
          if (executeAction === 'pending') {
            waMsg = "Saya *" + namaLengkap + "* selaku *" + roleTitle + "* menyampaikan bahwa dokumen *" + subLayanan + "* (" + fasTag + ") atas nama *" + pemohonName + "* telah kami verifikasi dan dokumen tersebut harus di PENDING untuk melengkapi *" + (notes || "kelengkapan berkas") + "*.\n" +
                    "Operator tolong disesuaikan kembali\n\n" +
                    "Terima Kasih.";
          } else {
            waMsg = "Saya *" + namaLengkap + "* selaku *" + roleTitle + "* menyampaikan bahwa dokumen *" + subLayanan + "* (" + fasTag + ") atas nama *" + pemohonName + "* telah kami verifikasi.\n" +
                    "Mohon selanjutnya Kepala Bidang dapat memvalidasi dokumen tersebut.\n\n" +
                    "Terima Kasih.";
          }
        } 
        else if (role === 'kabid_dafduk' || role === 'kabid_capil') {
          var currentTteStatus = sheet.getRange(foundRow, 14).getValue().toString().trim().toLowerCase();
          if (executeAction === 'pending') {
            waMsg = "Saya *" + namaLengkap + "* selaku *" + roleTitle + "* menyampaikan bahwa dokumen *" + subLayanan + "* (" + fasTag + ") atas nama *" + pemohonName + "* telah kami validasi dan dokumen tersebut harus di PENDING untuk melengkapi *" + (notes || "kelengkapan berkas") + "*.\n" +
                    "Operator tolong disesuaikan kembali\n\n" +
                    "Terima Kasih.";
          } else if (currentTteStatus === "belum diajukan siak" || currentTteStatus === "belum verifikasi siak" || currentTteStatus.indexOf("belum") !== -1) {
            waMsg = "Saya *" + namaLengkap + "* selaku *" + roleTitle + "* menyampaikan bahwa perbaikan berkas SIAK dokumen *" + subLayanan + "* (" + fasTag + ") atas nama *" + pemohonName + "* telah kami validasi.\n" +
                    "Petugas TTE, dokumen *" + subLayanan + "* (" + fasTag + ") atas nama *" + pemohonName + "* silahkan di TTE.\n\n" +
                    "Terima Kasih.";
          } else {
            waMsg = "Saya *" + namaLengkap + "* selaku *" + roleTitle + "* menyampaikan bahwa dokumen *" + subLayanan + "* (" + fasTag + ") atas nama *" + pemohonName + "* telah kami verifikasi.\n" +
                    "Mohon selanjutnya Kepala Dinas dapat melakukan sertifikasi dokumen tersebut.\n\n" +
                    "Terima Kasih.";
          }
        } 
        else if (role === 'kadis') {
          if (executeAction === 'pending') {
            waMsg = "Saya selaku *" + roleTitle + "* menyampaikan bahwa dokumen *" + subLayanan + "* (" + fasTag + ") atas nama *" + pemohonName + "* telah kami uji petik dan dokumen tersebut harus di PENDING untuk melengkapi *" + (notes || "kelengkapan berkas") + "*.\n" +
                    "Operator tolong disesuaikan.\n\n" +
                    "Terima Kasih.";
          } else {
            waMsg = "Petugas TTE, dokumen *" + subLayanan + "* (" + fasTag + ") atas nama *" + pemohonName + "* silahkan di TTE.\n\n" +
                    "Terima Kasih.";
          }
        } 
        else if (role === 'petugas_tte') {
          var statusTteVal = payload.status_tte;
          if (statusTteVal === 'Belum diajukan SIAK') {
            waMsg = "dokumen *" + subLayanan + "* (" + fasTag + ") atas nama *" + pemohonName + "* BELUM DIAJUKAN SIAK.\n\n" +
                    "Terima Kasih";
          } else if (statusTteVal === 'Belum Verifikasi SIAK') {
            waMsg = "Mohon izin pimpinan, dokumen *" + subLayanan + "* (" + fasTag + ") atas nama *" + pemohonName + "* BELUM DIAJUKAN SIAK.\n\n" +
                    "Terima Kasih";
          } else {
            waMsg = "Saya *" + namaLengkap + "* selaku *" + roleTitle + "* menyampaikan bahwa dokumen *" + subLayanan + "* (" + fasTag + ") atas nama *" + pemohonName + "* telah di TTE.\n" +
                    "Silahkan petugas pencetakan mencetak dokumen tersebut.\n\n" +
                    "Terima Kasih.";
          }
        } 
        else if (role === 'petugas_pencetakan') {
          var penerimaVal = payload.penerima || notes || "-";
          waMsg = "Mohon Izin Pimpinan. Dokumen *" + subLayanan + "* (" + fasTag + ") atas nama *" + pemohonName + "* telah dicetak dan diserahkan kepada *" + penerimaVal + "*\n\n" +
                  "Terima Kasih";
        } 
        else {
          waMsg = "Saya *" + namaLengkap + "* selaku *" + roleTitle + "* menyampaikan bahwa dokumen *" + subLayanan + "* (" + fasTag + ") atas nama *" + pemohonName + "* telah diproses.\n\n" +
                  "Terima Kasih";
        }
        
        // Kirim Notifikasi WA ke Grup Target (Dinas/UPT) & Admin 082397724667
        sendWhatsAppNotification(waMsg, currentFasilitasi);
      } catch (waErr) {
        Logger.log("WA Error saat update: " + waErr.toString());
      }
      
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Berkas berhasil diperbarui" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    throw new Error("Action tidak valid.");
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// FUNGSI PEMBANTU AUTENTIKASI UTAMA
function handleLogin(usernameInput, passwordInput) {
  usernameInput = usernameInput ? usernameInput.toString().trim() : "";
  passwordInput = passwordInput ? passwordInput.toString().trim() : "";
  
  var ss = getSpreadsheet();
  var petugasSheet = getOrCreatePetugasSheet(ss);
  var lastRow = petugasSheet.getLastRow();
  var lastCol = Math.max(petugasSheet.getLastColumn(), 6);
  var colMap = getPetugasColumnMap(petugasSheet);
  
  var cleanStr = function(s) { return s ? s.toString().toLowerCase().replace(/[^a-z0-9]/g, '') : ''; };
  var inputClean = cleanStr(usernameInput);
  
  var userMatchedButWrongPass = false;
  var matchedAccountName = "";
  var foundUser = null;
  
  if (lastRow > 1) {
    var userRange = petugasSheet.getRange(2, 1, lastRow - 1, lastCol);
    var userValues = userRange.getValues();
    
    for (var i = 0; i < userValues.length; i++) {
      var userRow = userValues[i];
      var username = userRow[colMap.username] ? userRow[colMap.username].toString().trim() : "";
      var password = userRow[colMap.password] ? userRow[colMap.password].toString().trim() : "";
      var rawRole = userRow[colMap.role] ? userRow[colMap.role].toString().trim() : "";
      var uptCode = userRow[colMap.upt] ? userRow[colMap.upt].toString().trim() : "";
      var name = userRow[colMap.name] ? userRow[colMap.name].toString().trim() : "";
      
      var normRole = normalizeUserRole(rawRole);
      
      var uClean = cleanStr(username);
      var nClean = cleanStr(name);
      var rClean = cleanStr(rawRole);
      var nrClean = cleanStr(normRole);
      
      var isUserMatch = (uClean === inputClean) || 
                        (nClean === inputClean) || 
                        (rClean === inputClean) ||
                        (nrClean === inputClean) ||
                        (inputClean.length >= 3 && nClean.indexOf(inputClean) !== -1);
      
      if (isUserMatch) {
        userMatchedButWrongPass = true;
        matchedAccountName = username || name || rawRole;
        
        var cleanPass = password.replace(/\.0$/, '');
        var isPassMatch = (password === passwordInput) || 
                          (cleanPass === passwordInput) ||
                          (password === "" && passwordInput === "123456");
        
        if (isPassMatch) {
          var sessionToken = Utilities.getUuid() || Math.random().toString(36).substr(2, 9);
          petugasSheet.getRange(i + 2, colMap.token + 1).setValue(sessionToken);
          SpreadsheetApp.flush();
          
          foundUser = {
            username: username || usernameInput,
            name: name || usernameInput,
            role: normRole,
            uptCode: (uptCode === "Dinas" || !uptCode) ? null : uptCode,
            fasilitasi: (uptCode === "Dinas" || !uptCode) ? "Dinas" : "UPT",
            sessionToken: sessionToken
          };
          break;
        }
      }
    }
  }
  
  if (foundUser) {
    return ContentService.createTextOutput(JSON.stringify({ status: "success", data: foundUser }))
      .setMimeType(ContentService.MimeType.JSON);
  } else if (userMatchedButWrongPass) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Password salah untuk akun '" + matchedAccountName + "'!" }))
      .setMimeType(ContentService.MimeType.JSON);
  } else {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Username / Akun '" + usernameInput + "' belum terdaftar di sheet Petugas! Silakan daftarkan akun pada sheet Petugas terlebih dahulu." }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// FUNGSI PEMBANTU CEK SESI LOGIN SINGLE DEVICE
function handleCheckSession(usernameInput, tokenInput) {
  var ss = getSpreadsheet();
  var petugasSheet = getOrCreatePetugasSheet(ss);
  var lastRow = petugasSheet.getLastRow();
  var lastCol = Math.max(petugasSheet.getLastColumn(), 6);
  var colMap = getPetugasColumnMap(petugasSheet);
  
  tokenInput = tokenInput ? tokenInput.toString().trim() : "";
  
  var isValid = false;
  if (lastRow > 1 && tokenInput !== "") {
    var userRange = petugasSheet.getRange(2, 1, lastRow - 1, lastCol);
    var userValues = userRange.getValues();
    
    for (var i = 0; i < userValues.length; i++) {
      var userRow = userValues[i];
      var token = userRow[colMap.token] ? userRow[colMap.token].toString().trim() : "";
      
      if (token === tokenInput) {
        isValid = true;
        break;
      }
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({ status: isValid ? "success" : "expired" }))
    .setMimeType(ContentService.MimeType.JSON);
}

// FUNGSI PEMBANTU MENGAMBIL NAMA LENGKAP & ROLE DARI SHEET PETUGAS
function getUserDetailsFromPetugasSheet(ss, searchUser) {
  var result = { name: "", role: "" };
  if (!searchUser) return result;
  
  try {
    var petugasSheet = getOrCreatePetugasSheet(ss);
    var lastRow = petugasSheet.getLastRow();
    var lastCol = Math.max(petugasSheet.getLastColumn(), 6);
    var colMap = getPetugasColumnMap(petugasSheet);
    
    var searchClean = searchUser.toString().toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (lastRow > 1) {
      var values = petugasSheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
      for (var i = 0; i < values.length; i++) {
        var row = values[i];
        var uName = row[colMap.username] ? row[colMap.username].toString().trim() : "";
        var name = row[colMap.name] ? row[colMap.name].toString().trim() : "";
        var role = row[colMap.role] ? row[colMap.role].toString().trim() : "";
        
        var uClean = uName.toLowerCase().replace(/[^a-z0-9]/g, '');
        var nClean = name.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        if (uClean === searchClean || nClean === searchClean || (searchClean.length >= 3 && nClean.indexOf(searchClean) !== -1)) {
          result.name = name || uName;
          result.role = role;
          return result;
        }
      }
    }
  } catch(e) {
    Logger.log("Error lookup petugas: " + e.toString());
  }
  
  return result;
}

// Fungsi Pembantu: Cari nomor baris berdasarkan nilai Key
function findRowByKey(sheet, key) {
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return -1;
  
  var keys = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < keys.length; i++) {
    if (keys[i][0].toString() === key) {
      return i + 2;
    }
  }
  return -1;
}

// Fungsi Pembantu: Generate Key Unik Acak
function generateUniqueKey() {
  var dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  var randStr = Math.random().toString(36).substr(2, 4).toUpperCase();
  return "SM-" + dateStr + "-" + randStr;
}

// Fungsi Pembantu: Formatting Tanggal
function formatDate(dateVal) {
  if (!dateVal) return "";
  if (dateVal instanceof Date) {
    var year = dateVal.getFullYear();
    var month = ("0" + (dateVal.getMonth() + 1)).slice(-2);
    var day = ("0" + dateVal.getDate()).slice(-2);
    return year + "-" + month + "-" + day;
  }
  return dateVal.toString();
}

// Fungsi Pembantu: Mendapatkan waktu lokal presisi YYYY-MM-DD HH:mm:ss
function getLocalDateTimeString() {
  var d = new Date();
  var pad = function(n) { return n.toString().padStart(2, '0'); };
  return d.getFullYear() + "-" + pad(d.getMonth()+1) + "-" + pad(d.getDate()) + " " + pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
}

// Fungsi Pembantu: Memastikan sheet memiliki kolom minimum yang cukup
function ensureColumns(sheet, minCols) {
  var maxCols = sheet.getMaxColumns();
  if (maxCols < minCols) {
    sheet.insertColumnsAfter(maxCols, minCols - maxCols);
  }
}

// Fungsi Pembantu: Mendapatkan atau membuat sheet Petugas untuk Autentikasi
function getOrCreatePetugasSheet(ss) {
  var sheets = ss.getSheets();
  var petugasSheet = null;
  
  for (var i = 0; i < sheets.length; i++) {
    var sName = sheets[i].getName().toString().trim().toLowerCase();
    if (sName === "petugas" || sName === "data petugas" || sName === "user" || sName === "users") {
      petugasSheet = sheets[i];
      break;
    }
  }
  
  if (!petugasSheet) {
    petugasSheet = ss.insertSheet("Petugas");
  }
  ensureColumns(petugasSheet, 6);
  
  if (petugasSheet.getLastRow() <= 1) {
    petugasSheet.clear();
    petugasSheet.getRange(1, 1, 1, 6).setValues([["Username", "Password", "Role", "UPT_Code", "Nama_Lengkap", "Session_Token"]]);
    var defaultAccounts = [
      ["operator_dinas", "123456", "operator", "Dinas", "Operator Dinas", ""],
      ["operator_upt1", "123456", "operator", "UPT-01", "Operator UPT 01", ""],
      ["scan_dinas", "123456", "petugas_scan", "Dinas", "Petugas Scan Dinas", ""],
      ["scan_upt1", "123456", "petugas_scan", "UPT-01", "Petugas Scan UPT 01", ""],
      ["kepala_upt1", "123456", "kepala_upt", "UPT-01", "Kepala UPT 01", ""],
      ["kasie_dafduk", "123456", "kasie_dafduk", "Dinas", "Kasie Dafduk", ""],
      ["kasie_capil", "123456", "kasie_capil", "Dinas", "Kasie Capil", ""],
      ["kabid_dafduk", "123456", "kabid_dafduk", "Dinas", "Kabid Dafduk", ""],
      ["kabid_capil", "123456", "kabid_capil", "Dinas", "Kabid Capil", ""],
      ["kadis", "123456", "kadis", "Dinas", "Kepala Dinas (Kadis)", ""],
      ["tte_dinas", "123456", "petugas_tte", "Dinas", "Petugas TTE Dinas", ""],
      ["print_dinas", "123456", "petugas_pencetakan", "Dinas", "Petugas Cetak Dinas", ""],
      ["print_upt1", "123456", "petugas_pencetakan", "UPT-01", "Petugas Cetak UPT 01", ""]
    ];
    petugasSheet.getRange(2, 1, defaultAccounts.length, 6).setValues(defaultAccounts);
  }
  return petugasSheet;
}

// Fungsi Pembantu: Deteksi Posisi Kolom pada Sheet Petugas Secara Dinamis Berdasarkan Header
function getPetugasColumnMap(petugasSheet) {
  var lastCol = Math.max(petugasSheet.getLastColumn(), 6);
  var headers = petugasSheet.getRange(1, 1, 1, lastCol).getValues()[0];
  
  var map = { username: 0, password: 1, role: 2, upt: 3, name: 4, token: 5 };
  var found = { username: false, password: false, role: false, upt: false, name: false, token: false };
  
  for (var c = 0; c < headers.length; c++) {
    var h = headers[c] ? headers[c].toString().trim().toLowerCase() : "";
    if (h === 'username' || h === 'user' || h === 'nama pengguna' || h === 'id_user' || h === 'id user') { map.username = c; found.username = true; }
    else if (h === 'password' || h === 'pass' || h === 'kata sandi' || h === 'sandi') { map.password = c; found.password = true; }
    else if (h === 'role' || h === 'peran' || h === 'jabatan') { map.role = c; found.role = true; }
    else if (h === 'upt_code' || h === 'upt' || h === 'kode_upt' || h === 'fasilitasi' || h === 'kode upt') { map.upt = c; found.upt = true; }
    else if (h === 'nama' || h === 'nama_lengkap' || h === 'nama lengkap' || h === 'nama petugas') { map.name = c; found.name = true; }
    else if (h === 'session_token' || h === 'session' || h === 'token' || h === 'token_sesi' || h === 'session token') { map.token = c; found.token = true; }
  }
  
  for (var c = 0; c < headers.length; c++) {
    var h = headers[c] ? headers[c].toString().trim().toLowerCase() : "";
    if (!found.username && h.indexOf('user') !== -1 && h.indexOf('nama') === -1) { map.username = c; found.username = true; }
    else if (!found.password && (h.indexOf('pass') !== -1 || h.indexOf('sandi') !== -1)) { map.password = c; found.password = true; }
    else if (!found.role && (h.indexOf('role') !== -1 || h.indexOf('peran') !== -1)) { map.role = c; found.role = true; }
    else if (!found.upt && (h.indexOf('upt') !== -1 || h.indexOf('fasilitasi') !== -1)) { map.upt = c; found.upt = true; }
    else if (!found.name && h.indexOf('nama') !== -1) { map.name = c; found.name = true; }
    else if (!found.token && (h.indexOf('token') !== -1 || h.indexOf('session') !== -1)) { map.token = c; found.token = true; }
  }
  
  return map;
}

// Fungsi Pembantu: Normalisasi Peran (Role) Petugas dari Sheet ke Kode Teknis Sistem
function normalizeUserRole(rawRole) {
  if (!rawRole) return 'operator';
  var str = rawRole.toString().trim().toLowerCase();
  
  if (str.indexOf('scan') !== -1) return 'petugas_scan';
  if (str.indexOf('tte') !== -1) return 'petugas_tte';
  if (str.indexOf('print') !== -1 || str.indexOf('cetak') !== -1) return 'petugas_pencetakan';
  if (str.indexOf('kadis') !== -1 || str.indexOf('kepala dinas') !== -1) return 'kadis';
  if (str.indexOf('kepala upt') !== -1 || str.indexOf('kepala_upt') !== -1 || str.indexOf('ka upt') !== -1 || str.indexOf('kaupt') !== -1) return 'kepala_upt';
  
  if (str.indexOf('kasie') !== -1 || str.indexOf('kasi') !== -1 || str.indexOf('seksi') !== -1) {
    if (str.indexOf('capil') !== -1 || str.indexOf('sipil') !== -1) return 'kasie_capil';
    return 'kasie_dafduk';
  }
  
  if (str.indexOf('kabid') !== -1 || str.indexOf('bidang') !== -1) {
    if (str.indexOf('capil') !== -1 || str.indexOf('sipil') !== -1) return 'kabid_capil';
    return 'kabid_dafduk';
  }
  
  if (str.indexOf('operator') !== -1) return 'operator';
  if (str.indexOf('monitor') !== -1 || str.indexOf('pengawas') !== -1 || str.indexOf('admin') !== -1) return 'monitoring';
  
  return str.replace(/\s+/g, '_');
}

// FUNGSI UTAMA PENGIRIMAN WA VIA FONNTE API (Dengan Logging Respon Lengkap & Resolusi Otomatis ID Grup)
function sendWhatsAppMessage(target, message) {
  if (!FONNTE_TOKEN || !target) {
    Logger.log("Gagal WA: Token Fonnte atau Target kosong.");
    return "Token/Target Kosong";
  }
  
  var cleanTarget = resolveTargetGroupId(target);
  
  var url = "https://api.fonnte.com/send";
  var payload = {
    target: cleanTarget,
    message: message,
    countryCode: "62"
  };
  
  var options = {
    method: "post",
    headers: {
      "Authorization": FONNTE_TOKEN
    },
    payload: payload,
    muteHttpExceptions: true
  };
  
  try {
    var response = UrlFetchApp.fetch(url, options);
    var resText = response.getContentText();
    Logger.log("Fonnte API Response untuk target (" + cleanTarget + "): " + resText);
    return resText;
  } catch (e) {
    Logger.log("Gagal HTTP Fetch ke Fonnte: " + e.toString());
    return e.toString();
  }
}

// FUNGSI PEMBANTU UNTUK MENGUBAH NAMA GRUP TEKS MENJADI GROUP ID WA OTOMATIS
function resolveTargetGroupId(target) {
  if (!target) return "";
  var cleanTarget = target.toString().trim();
  
  if (cleanTarget.substr(0, 2) === "08") {
    return "628" + cleanTarget.substr(2);
  }
  
  if (cleanTarget.indexOf("@g.us") !== -1 || /^[0-9+]+$/.test(cleanTarget)) {
    return cleanTarget;
  }
  
  // Pemetaan langsung ke Group ID JID resmi Fonnte untuk grup "TEKNIS PELAYANAN DOKUMEN"
  return "120363417098026103@g.us";
}

function getRoleDisplayName(role) {
  var mapping = {
    "operator": "Operator",
    "petugas_scan": "Petugas Scan",
    "kasie_dafduk": "Kasie Dafduk",
    "kasie_capil": "Kasie Capil",
    "kepala_upt": "Kepala UPT",
    "kabid_dafduk": "Kabid Dafduk",
    "kabid_capil": "Kabid Capil",
    "kadis": "Kepala Dinas (Kadis)",
    "petugas_tte": "Petugas TTE",
    "petugas_pencetakan": "Petugas Pencetakan"
  };
  return mapping[role] || role;
}

function getStatusDeskDisplayName(status) {
  var mapping = {
    "1_PETUGAS_SCAN": "Petugas Scan",
    "2_VERIFIKASI_KASIE": "Kasie Pemeriksa",
    "2_VERIFIKASI_UPT": "Kepala UPT",
    "3_VALIDASI_KABID": "Kabid Bidang",
    "4_SERTIFIKASI_KADIS": "Kepala Dinas (Kadis)",
    "5_TTE": "Petugas TTE",
    "6_PENCETAKAN_DINAS": "Pencetakan Dinas",
    "6_PENCETAKAN_UPT": "Pencetakan UPT",
    "7_SELESAI": "Selesai Cetak",
    "PENDING_OPERATOR": "Operator Perbaikan"
  };
  return mapping[status] || status;
}
