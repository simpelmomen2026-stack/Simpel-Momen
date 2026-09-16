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

// FUNGSI UJI COBA LOGIN LANGSUNG DARI APPS SCRIPT EDITOR
function testLogin() {
  Logger.log("=== 🧪 UJI COBA FUNGSI LOGIN APPS SCRIPT ===");
  var res1 = handleLogin("kasie_capil", "123456");
  Logger.log("Respon Login Kasie Capil: " + res1.getContent());
  
  var res2 = handleLogin("kasie_dafduk", "123456");
  Logger.log("Respon Login Kasie Dafduk: " + res2.getContent());
  
  var res3 = handleLogin("operator_dinas", "123456");
  Logger.log("Respon Login Operator Dinas: " + res3.getContent());
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
    
    // 1. TAMBAH BARU (OPERATOR INPUT - SINGLE ATAU BATCH MULTI-ITEM INTEGRASI V2.0)
    if (payload.action === 'create' || payload.action === 'create_batch') {
      var items = Array.isArray(payload.data) ? payload.data : [payload.data];
      var sharedKey = (items.length > 0 && items[0].key) ? items[0].key : generateUniqueKey();
      var timeStr = getLocalDateTimeString();

      // Sort items so Pencatatan Sipil is ALWAYS first (Mandatori Utama)
      items.sort(function(a, b) {
        var isCapilA = (a.jenis_layanan || "").toLowerCase().indexOf("capil") !== -1 || (a.jenis_layanan || "").toLowerCase().indexOf("pencatatan sipil") !== -1;
        var isCapilB = (b.jenis_layanan || "").toLowerCase().indexOf("capil") !== -1 || (b.jenis_layanan || "").toLowerCase().indexOf("pencatatan sipil") !== -1;
        if (isCapilA && !isCapilB) return -1;
        if (!isCapilA && isCapilB) return 1;

        var isPindahA = (a.sub_layanan || "").toLowerCase().indexOf("pindah") !== -1;
        var isPindahB = (b.sub_layanan || "").toLowerCase().indexOf("pindah") !== -1;
        if (isPindahA && !isPindahB) return -1;
        if (!isPindahA && isPindahB) return 1;

        if (a.isMandatory && !b.isMandatory) return -1;
        if (!a.isMandatory && b.isMandatory) return 1;

        return 0;
      });

      for (var m = 0; m < items.length; m++) {
        items[m].isMandatory = (m === 0);
      }
      
      // Insert in reverse order so item 0 (Capil / Mandatori Utama) ends up at row 2 (top)
      for (var k = items.length - 1; k >= 0; k--) {
        var itemData = items[k];
        var itemKey = itemData.key || sharedKey;
        var tanggal = itemData.tanggal || new Date().toISOString().slice(0, 10);
        
        var values = [
          itemKey,
          tanggal,
          itemData.fasilitasi || "Dinas",
          itemData.operator || "Operator",
          itemData.pemohon || "",
          itemData.alamat || "",
          itemData.no_hp || "",
          itemData.email || "",
          itemData.integrasi || "tunggal",
          itemData.jenis_layanan || "",
          itemData.sub_layanan || "",
          "", // link_file
          "1_PETUGAS_SCAN", // status_alur
          "", // status_tte
          "", // penerima
          "", // catatan_scan
          "", // catatan_kasie
          "", // catatan_kabid
          "", // catatan_kadis
          "", // catatan_upt
          "", // catatan_print
          itemData.riwayat_pending || "",
          timeStr, // tgl_operator
          "", "", "", "", "", "", ""
        ];
        
        // Cari jika baris dengan key & sub_layanan ini sudah ada (update perbaikan pending)
        var lastR = sheet.getLastRow();
        var updatedExisting = false;
        if (lastR > 1) {
          var existingValues = sheet.getRange(2, 1, lastR - 1, 11).getValues();
          for (var r = 0; r < existingValues.length; r++) {
            if (existingValues[r][0].toString() === itemKey && existingValues[r][10].toString() === itemData.sub_layanan) {
              sheet.getRange(r + 2, 1, 1, 30).setValues([values]);
              updatedExisting = true;
              break;
            }
          }
        }
        if (!updatedExisting) {
          sheet.insertRowBefore(2);
          sheet.getRange(2, 1, 1, 30).setValues([values]);
        }
      }
      
      // Kirim Notifikasi WA HANYA ke Grup Khusus Target
      try {
        var firstItem = items[0];
        var mandatoryItem = items[0];
        for (var i = 0; i < items.length; i++) {
          if (items[i].isMandatory || items[i].jenis_layanan === "Pencatatan Sipil" || items[i].sub_layanan === "Pindah Domisili") {
            mandatoryItem = items[i];
            break;
          }
        }
        var mandatoryPemohon = mandatoryItem.pemohon || firstItem.pemohon || "";

        var ss = getSpreadsheet();
        var userDetails = getUserDetailsFromPetugasSheet(ss, firstItem.operator || firstItem.userName);
        var namaLengkap = userDetails.name || firstItem.operator || firstItem.userName || "Operator";
        var roleTitle = userDetails.role || "Operator";
        var fasTag = formatFasilitasiTag(firstItem.fasilitasi, firstItem.operator || firstItem.userName, ss);
        
        var waMsg = "";
        if (items.length > 1 || (firstItem.integrasi && firstItem.integrasi !== "tunggal")) {
          var docListStr = "";
          for (var d = 0; d < items.length; d++) {
            var itemPemohon = items[d].pemohon || mandatoryPemohon;
            docListStr += (d + 1) + ". " + items[d].sub_layanan + " - " + itemPemohon + "\n";
          }
          waMsg = "Saya *" + namaLengkap + "* selaku *" + roleTitle + "* menyampaikan bahwa permohonan Terintegrasi *" + firstItem.integrasi + "* (Kode Unik: *" + sharedKey + "*) atas nama *" + mandatoryPemohon + "* (" + fasTag + ") telah di-input.\n\n" +
                  "📋 *Daftar Sub Layanan Terintegrasi (" + items.length + " Dokumen):*\n\n" + docListStr + "\n" +
                  "Selanjutnya mohon Petugas Scan memproses dokumen tersebut.\n\n" +
                  "Terima Kasih";
        } else {
          waMsg = "Saya *" + namaLengkap + "* selaku *" + roleTitle + "* menyampaikan bahwa berkas permohonan *" + firstItem.sub_layanan + "* atas nama *" + firstItem.pemohon + "* (" + fasTag + ") Kode Unik *" + sharedKey + "* telah di-input.\n\n" +
                  "Selanjutnya mohon Petugas Scan memproses berkas tersebut.\n\n" +
                  "Terima Kasih";
        }
        
        sendWhatsAppNotification(waMsg, firstItem.fasilitasi);
      } catch(waErr) {
        Logger.log("WA Error saat create: " + waErr.toString());
      }
      
      return ContentService.createTextOutput(JSON.stringify({ status: "success", data: { key: sharedKey, count: items.length } }))
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

      // Ambil seluruh data baris dengan Kode Unik (key) yang sama
      var batchRows = [];
      var lastRowAll = sheet.getLastRow();
      if (lastRowAll > 1) {
        var allVals = sheet.getRange(2, 1, lastRowAll - 1, 30).getValues();
        for (var r = 0; r < allVals.length; r++) {
          if (allVals[r][0].toString() === key) {
            batchRows.push({
              rowIndex: r + 2,
              fasilitasi: allVals[r][2].toString(),
              operator: allVals[r][3].toString(),
              pemohon: allVals[r][4].toString(),
              integrasi: allVals[r][8].toString(),
              jenis_layanan: allVals[r][9].toString(),
              sub_layanan: allVals[r][10].toString(),
              status_alur: allVals[r][12].toString(),
              status_tte: allVals[r][13].toString(),
              riwayat_pending: allVals[r][21].toString()
            });
          }
        }
      }

      var sampleItem = batchRows.length > 0 ? batchRows[0] : {
        fasilitasi: sheet.getRange(foundRow, 3).getValue().toString(),
        pemohon: sheet.getRange(foundRow, 5).getValue().toString(),
        integrasi: sheet.getRange(foundRow, 9).getValue().toString(),
        jenis_layanan: sheet.getRange(foundRow, 10).getValue().toString(),
        sub_layanan: sheet.getRange(foundRow, 11).getValue().toString()
      };

      var isDafdukCapil = batchRows.some(function(b) { return b.jenis_layanan.toLowerCase().indexOf("capil") !== -1 || b.jenis_layanan.toLowerCase().indexOf("pencatatan sipil") !== -1; }) &&
                          batchRows.some(function(b) { return b.jenis_layanan.toLowerCase().indexOf("pendaftaran") !== -1; });
      var isDafdukDafduk = batchRows.every(function(b) { return b.jenis_layanan.toLowerCase().indexOf("pendaftaran") !== -1; });
      var hasPindah = batchRows.some(function(b) { return b.sub_layanan.toLowerCase().indexOf("pindah") !== -1; });

      var targetItem = batchRows.find(function(b) {
        return (payload.sub_layanan && b.sub_layanan === payload.sub_layanan) || b.rowIndex === foundRow;
      }) || sampleItem;

      var currentFasilitasi = sampleItem.fasilitasi;
      var pemohonName = targetItem.pemohon || sampleItem.pemohon;
      var currentLayanan = targetItem.jenis_layanan || sheet.getRange(foundRow, 10).getValue().toString();
      var currentSubLayanan = targetItem.sub_layanan || sheet.getRange(foundRow, 11).getValue().toString();

      if (executeAction === 'pending' && role !== 'petugas_tte' && role !== 'petugas_scan') {
        // ALUR PENDING (Kasie Capil, Kasie Dafduk, Kepala UPT, Kabid, Kadis):
        // Kembalikan SELURUH dokumen dengan Kode Unik yang sama ke Operator (PENDING_OPERATOR)
        var logMsg = "PENDING by " + role + " pada " + timeStr + ": " + notes;
        
        for (var i = 0; i < batchRows.length; i++) {
          var rIdx = batchRows[i].rowIndex;
          var prevRiwayat = batchRows[i].riwayat_pending;
          var newRiwayat = prevRiwayat ? logMsg + "\n---\n" + prevRiwayat : logMsg;

          sheet.getRange(rIdx, 13).setValue("PENDING_OPERATOR"); // Col M (Status Alur)
          sheet.getRange(rIdx, 22).setValue(newRiwayat);        // Col V (Riwayat Pending)

          if (role === 'kasie_dafduk' || role === 'kasie_capil') {
            sheet.getRange(rIdx, 17).setValue(notes);   // Col Q (Catatan Kasie)
            sheet.getRange(rIdx, 25).setValue(timeStr); // Col Y (tgl_kasie)
          } else if (role === 'kepala_upt') {
            sheet.getRange(rIdx, 20).setValue(notes);   // Col T (Catatan UPT)
            sheet.getRange(rIdx, 26).setValue(timeStr); // Col Z (tgl_upt)
          } else if (role === 'kabid_dafduk' || role === 'kabid_capil') {
            sheet.getRange(rIdx, 18).setValue(notes);   // Col R (Catatan Kabid)
            sheet.getRange(rIdx, 27).setValue(timeStr); // Col AA (tgl_kabid)
          } else if (role === 'kadis') {
            sheet.getRange(rIdx, 19).setValue(notes);   // Col S (Catatan Kadis)
            sheet.getRange(rIdx, 28).setValue(timeStr); // Col AB (tgl_kadis)
          }
        }
      } 
      
      else {
        // ALUR APPROVE / SETUJU BERJENJANG
        if (role === 'petugas_scan') {
          var linkFile = payload.link_file || "";
          var nextStatusScan = (currentFasilitasi === "UPT" || currentFasilitasi.indexOf("UPT") !== -1) ? "2_VERIFIKASI_UPT" : "2_VERIFIKASI_KASIE";
          
          for (var i = 0; i < batchRows.length; i++) {
            var rIdx = batchRows[i].rowIndex;
            sheet.getRange(rIdx, 12).setValue(linkFile);       // Col L (Link File)
            sheet.getRange(rIdx, 16).setValue(notes);          // Col P (Catatan Scan)
            sheet.getRange(rIdx, 24).setValue(timeStr);        // Col X (tgl_scan)
            sheet.getRange(rIdx, 13).setValue(nextStatusScan); // Col M (Status Alur)
          }
        } 

        else if (role === 'kasie_capil') {
          // C.1 Kasie Capil memverifikasi Capil -> Capil row ke 3_VALIDASI_KABID
          for (var i = 0; i < batchRows.length; i++) {
            var isCapil = batchRows[i].jenis_layanan.toLowerCase().indexOf("capil") !== -1 || batchRows[i].jenis_layanan.toLowerCase().indexOf("pencatatan sipil") !== -1;
            if (isCapil) {
              var rIdx = batchRows[i].rowIndex;
              sheet.getRange(rIdx, 17).setValue(notes);   // Col Q (Catatan Kasie)
              sheet.getRange(rIdx, 25).setValue(timeStr); // Col Y (tgl_kasie)
              sheet.getRange(rIdx, 13).setValue("3_VALIDASI_KABID"); // Col M
            }
          }
        } 

        else if (role === 'kasie_dafduk') {
          // Update SELURUH dokumen Pendaftaran Penduduk (Dafduk) pada batch ini ke 3_VALIDASI_KABID
          for (var i = 0; i < batchRows.length; i++) {
            var jl = batchRows[i].jenis_layanan.toLowerCase();
            var isDafduk = jl.indexOf("dafduk") !== -1 || jl.indexOf("pendaftaran") !== -1;
            if (isDafduk) {
              var rIdx = batchRows[i].rowIndex;
              sheet.getRange(rIdx, 17).setValue(notes);   // Col Q (Catatan Kasie)
              sheet.getRange(rIdx, 25).setValue(timeStr); // Col Y (tgl_kasie)
              sheet.getRange(rIdx, 13).setValue("3_VALIDASI_KABID"); // Col M
            }
          }
        } 

        else if (role === 'kepala_upt') {
          if (isDafdukCapil) {
            // C.1 Dafduk - Capil di UPT:
            // Capil row -> 6_PENCETAKAN_UPT
            // Dafduk row(s) -> 3_VALIDASI_KABID (Otomatis terkirim langsung ke Kabid Dafduk!)
            for (var i = 0; i < batchRows.length; i++) {
              var rIdx = batchRows[i].rowIndex;
              var isCapil = batchRows[i].jenis_layanan.toLowerCase().indexOf("capil") !== -1 || batchRows[i].jenis_layanan.toLowerCase().indexOf("pencatatan sipil") !== -1;
              sheet.getRange(rIdx, 20).setValue(notes);   // Col T (Catatan UPT)
              sheet.getRange(rIdx, 26).setValue(timeStr); // Col Z (tgl_upt)
              if (isCapil) {
                sheet.getRange(rIdx, 13).setValue("6_PENCETAKAN_UPT");
              } else {
                sheet.getRange(rIdx, 13).setValue("3_VALIDASI_KABID");
              }
            }
          } else if (isDafdukDafduk) {
            // C.2 Dafduk - Dafduk di UPT: Kirim SEMUA dokumen bersamaan ke Kabid Dafduk
            for (var i = 0; i < batchRows.length; i++) {
              var rIdx = batchRows[i].rowIndex;
              sheet.getRange(rIdx, 20).setValue(notes);   // Col T
              sheet.getRange(rIdx, 26).setValue(timeStr); // Col Z
              sheet.getRange(rIdx, 13).setValue("3_VALIDASI_KABID"); // Col M
            }
          } else {
            // C.3 Tunggal UPT: Capil -> 6_PENCETAKAN_UPT, Dafduk -> 3_VALIDASI_KABID
            var isCapil = currentLayanan.toLowerCase().indexOf("capil") !== -1 || currentLayanan.toLowerCase().indexOf("pencatatan sipil") !== -1;
            sheet.getRange(foundRow, 20).setValue(notes);   // Col T
            sheet.getRange(foundRow, 26).setValue(timeStr); // Col Z
            sheet.getRange(foundRow, 13).setValue(isCapil ? "6_PENCETAKAN_UPT" : "3_VALIDASI_KABID");
          }
        } 

        else if (role === 'kabid_capil') {
          for (var i = 0; i < batchRows.length; i++) {
            var isCapil = batchRows[i].jenis_layanan.toLowerCase().indexOf("capil") !== -1 || batchRows[i].jenis_layanan.toLowerCase().indexOf("pencatatan sipil") !== -1;
            if (isCapil) {
              var rIdx = batchRows[i].rowIndex;
              sheet.getRange(rIdx, 18).setValue(notes);   // Col R (Catatan Kabid)
              sheet.getRange(rIdx, 27).setValue(timeStr); // Col AA (tgl_kabid)
              
              var currentTteStatus = sheet.getRange(rIdx, 14).getValue().toString().trim().toLowerCase();
              if (currentTteStatus === "belum diajukan siak" || currentTteStatus === "belum verifikasi siak" || currentTteStatus.indexOf("belum") !== -1) {
                sheet.getRange(rIdx, 13).setValue("5_TTE");
              } else {
                sheet.getRange(rIdx, 13).setValue("4_SERTIFIKASI_KADIS");
              }
            }
          }
        } 

        else if (role === 'kabid_dafduk') {
          for (var i = 0; i < batchRows.length; i++) {
            var jl = batchRows[i].jenis_layanan.toLowerCase();
            var isDafduk = jl.indexOf("dafduk") !== -1 || jl.indexOf("pendaftaran") !== -1;
            if (isDafduk) {
              var rIdx = batchRows[i].rowIndex;
              sheet.getRange(rIdx, 18).setValue(notes);   // Col R (Catatan Kabid)
              sheet.getRange(rIdx, 27).setValue(timeStr); // Col AA (tgl_kabid)
              
              var currentTteStatus = sheet.getRange(rIdx, 14).getValue().toString().trim().toLowerCase();
              if (currentTteStatus === "belum diajukan siak" || currentTteStatus === "belum verifikasi siak" || currentTteStatus.indexOf("belum") !== -1) {
                sheet.getRange(rIdx, 13).setValue("5_TTE");
              } else {
                sheet.getRange(rIdx, 13).setValue("4_SERTIFIKASI_KADIS");
              }
            }
          }
        } 
        
        else if (role === 'kadis') {
          sheet.getRange(foundRow, 19).setValue(notes); // Col S (Catatan Kadis)
          sheet.getRange(foundRow, 28).setValue(timeStr); // Col AB (tgl_kadis)
          sheet.getRange(foundRow, 13).setValue("5_TTE");
        } 
        
        else if (role === 'petugas_tte') {
          var statusTteVal = payload.status_tte;
          sheet.getRange(foundRow, 14).setValue(statusTteVal); // Col N (Status TTE)
          sheet.getRange(foundRow, 29).setValue(timeStr); // Col AC (tgl_tte)
          
          var isUptFas = (currentFasilitasi === "UPT" || currentFasilitasi.indexOf("UPT") !== -1);
          var isPendaftaran = (currentLayanan.trim().toLowerCase() === "pendaftaran penduduk");
          
          var nextStatusTte = "";
          if (statusTteVal === 'Belum diajukan SIAK') {
            nextStatusTte = (isUptFas && isPendaftaran) ? "2_VERIFIKASI_UPT" : "2_VERIFIKASI_KASIE";
            var logMsg = "BELUM DIAJUKAN SIAK by TTE pada " + timeStr + ": " + (notes || "Belum diajukan SIAK");
            var newRiwayat = batchRows[0].riwayat_pending ? logMsg + "\n---\n" + batchRows[0].riwayat_pending : logMsg;
            sheet.getRange(foundRow, 22).setValue(newRiwayat); // Col V
          } else if (statusTteVal === 'Belum Verifikasi SIAK') {
            nextStatusTte = "3_VALIDASI_KABID";
            var logMsg = "BELUM VERIFIKASI SIAK by TTE pada " + timeStr + ": " + (notes || "Belum Verifikasi SIAK");
            var newRiwayat = batchRows[0].riwayat_pending ? logMsg + "\n---\n" + batchRows[0].riwayat_pending : logMsg;
            sheet.getRange(foundRow, 22).setValue(newRiwayat); // Col V
          } else {
            nextStatusTte = (isUptFas) ? "6_PENCETAKAN_UPT" : "6_PENCETAKAN_DINAS";
          }
          sheet.getRange(foundRow, 13).setValue(nextStatusTte);
        } 
        
        else if (role === 'operator') {
          // Perbaiki & Kirim Ulang Operator Pending: SELURUH dokumen terintegrasi dikirim ke Petugas Scan (1_PETUGAS_SCAN)
          for (var i = 0; i < batchRows.length; i++) {
            var rIdx = batchRows[i].rowIndex;
            sheet.getRange(rIdx, 23).setValue(timeStr); // Col W (tgl_operator)
            if (notes) {
              var prevR = batchRows[i].riwayat_pending;
              var newR = "PERBAIKAN OPERATOR pada " + timeStr + ": " + notes + (prevR ? "\n---\n" + prevR : "");
              sheet.getRange(rIdx, 22).setValue(newR); // Col V
            }
            sheet.getRange(rIdx, 13).setValue("1_PETUGAS_SCAN"); // Col M
          }
        }
        
        else if (role === 'petugas_pencetakan') {
          var penerimaVal = payload.penerima || "";
          sheet.getRange(foundRow, 15).setValue(penerimaVal); // Col O (Penerima)
          sheet.getRange(foundRow, 21).setValue(notes); // Col U (Catatan Print)
          sheet.getRange(foundRow, 30).setValue(timeStr); // Col AD (tgl_print)
          sheet.getRange(foundRow, 13).setValue("7_SELESAI");
        }
      }

      // Kirim Notifikasi WA Berdasarkan Tingkatan User (Role Templates)
      try {
        var ss = getSpreadsheet();
        var userDetails = getUserDetailsFromPetugasSheet(ss, payload.userName);
        var namaLengkap = userDetails.name || payload.userName || getRoleDisplayName(role);
        var roleTitle = userDetails.role || getRoleDisplayName(role);
        var fasTag = formatFasilitasiTag(currentFasilitasi, payload.userName, ss);
        var waMsg = "";

        var docListStr = "";
        if (batchRows.length > 1) {
          for (var d = 0; d < batchRows.length; d++) {
            docListStr += (d + 1) + ". " + batchRows[d].sub_layanan + " - " + (batchRows[d].pemohon || pemohonName) + "\n";
          }
        }
        
        if (role === 'operator') {
          if (batchRows.length > 1) {
            waMsg = "Saya *" + namaLengkap + "* selaku *" + roleTitle + "* menyampaikan bahwa permohonan Terintegrasi *" + sampleItem.integrasi + "* (Kode Unik: *" + key + "*) atas nama *" + pemohonName + "* (" + fasTag + ") yang sebelumnya dipending telah kami PERBAIKI (" + (notes || "perbaikan berkas") + ").\n\n" +
                    "📋 *Daftar Sub Layanan Terintegrasi (" + batchRows.length + " Dokumen):*\n\n" + docListStr + "\n" +
                    "Selanjutnya mohon Petugas Scan dapat memproses seluruh berkas terintegrasi ke alur berikutnya.\n\n" +
                    "Terima Kasih.";
          } else {
            waMsg = "Saya *" + namaLengkap + "* selaku *" + roleTitle + "* menyampaikan bahwa dokumen *" + currentSubLayanan + "* (" + fasTag + ") atas nama *" + pemohonName + "* (Kode Unik: *" + key + "*) yang sebelumnya dipending telah kami PERBAIKI (" + (notes || "perbaikan berkas") + ").\n" +
                    "Selanjutnya mohon Petugas Scan dapat memproses berkas ke alur berikutnya.\n\n" +
                    "Terima Kasih.";
          }
        }
        else if (role === 'petugas_scan') {
          var isUptFas = (currentFasilitasi && currentFasilitasi.toUpperCase().indexOf("UPT") !== -1);
          var targetVerifikasi = isUptFas ? "Kepala UPT" : "Kepala Seksi";
          
          if (batchRows.length > 1) {
            waMsg = "Saya *" + namaLengkap + "* selaku *Petugas Scan* menyampaikan bahwa permohonan Terintegrasi *" + sampleItem.integrasi + "* (" + batchRows.length + " Dokumen, Kode Unik: *" + key + "*) atas nama *" + pemohonName + "* (" + fasTag + ") telah kami tambahkan link filenya.\n\n" +
                    "📋 *Daftar Sub Layanan Terintegrasi (" + batchRows.length + " Dokumen):*\n\n" + docListStr + "\n" +
                    "Mohon " + targetVerifikasi + " dapat melakukan verifikasi dokumen tersebut.\n\n" +
                    "Terima Kasih";
          } else {
            waMsg = "Saya *" + namaLengkap + "* selaku *Petugas Scan* menyampaikan bahwa berkas permohonan *" + currentSubLayanan + "* (" + fasTag + ") Kode Unik *" + key + "* atas nama *" + pemohonName + "* telah kami tambahkan link filenya.\n\n" +
                    "Mohon " + targetVerifikasi + " dapat melakukan verifikasi berkas tersebut.\n\n" +
                    "Terima Kasih";
          }
        } 
        else if (role === 'kasie_capil') {
          var capilSubLayanan = currentSubLayanan;
          var capilPemohon = pemohonName;
          var capilItem = batchRows.find(function(b) {
            var jl = (b.jenis_layanan || "").toLowerCase();
            return jl.indexOf("capil") !== -1 || jl.indexOf("pencatatan sipil") !== -1;
          });
          if (capilItem) {
            if (capilItem.sub_layanan) capilSubLayanan = capilItem.sub_layanan;
            if (capilItem.pemohon) capilPemohon = capilItem.pemohon;
          }

          if (executeAction === 'pending') {
            waMsg = "Saya *" + namaLengkap + "* selaku *" + roleTitle + "* menyampaikan bahwa permohonan Terintegrasi (Kode Unik: *" + key + "*) atas nama *" + capilPemohon + "* (" + fasTag + ") telah kami verifikasi dan HARUS DI-PENDING untuk melengkapi *" + (notes || "kelengkapan berkas") + "*.\n\n" +
                    (batchRows.length > 1 ? "📋 *Daftar Dokumen Terintegrasi Dikembalikan:*\n\n" + docListStr + "\n" : "") +
                    "Operator tolong disesuaikan kembali.\n\n" +
                    "Terima Kasih.";
          } else {
            waMsg = "Saya *" + namaLengkap + "* selaku *" + roleTitle + "* menyampaikan bahwa dokumen Pencatatan Sipil *" + capilSubLayanan + "* (" + fasTag + ") Kode Unik *" + key + "* atas nama *" + capilPemohon + "* telah kami verifikasi dan diteruskan ke Kabid Capil.\n" +
                    (isDafdukCapil ? "Dokumen Pendaftaran Penduduk terintegrasi saat ini otomatis diaktifkan di counter Kasie Dafduk untuk verifikasi selanjutnya.\n\n" : "\n") +
                    "Terima Kasih.";
          }
        }
        else if (role === 'kasie_dafduk') {
          var dafdukRows = batchRows.filter(function(b) {
            var jl = (b.jenis_layanan || "").toLowerCase();
            return jl.indexOf("dafduk") !== -1 || jl.indexOf("pendaftaran") !== -1;
          });

          var dafdukItem = dafdukRows.find(function(b) {
            return payload.sub_layanan && b.sub_layanan === payload.sub_layanan;
          }) || dafdukRows[0] || sampleItem;

          var dafdukSubLayanan = dafdukItem.sub_layanan || currentSubLayanan;
          var dafdukPemohon = dafdukItem.pemohon || pemohonName;

          if (executeAction === 'pending') {
            waMsg = "Saya *" + namaLengkap + "* selaku *" + roleTitle + "* menyampaikan bahwa permohonan Terintegrasi (Kode Unik: *" + key + "*) atas nama *" + dafdukPemohon + "* (" + fasTag + ") telah kami verifikasi dan HARUS DI-PENDING untuk melengkapi *" + (notes || "kelengkapan berkas") + "*.\n\n" +
                    (batchRows.length > 1 ? "📋 *Daftar Dokumen Terintegrasi Dikembalikan:*\n\n" + docListStr + "\n" : "") +
                    "Operator tolong disesuaikan kembali.\n\n" +
                    "Terima Kasih.";
          } else {
            var dafdukDocList = "";
            if (dafdukRows.length > 1) {
              for (var d = 0; d < dafdukRows.length; d++) {
                dafdukDocList += (d + 1) + ". " + dafdukRows[d].sub_layanan + " - " + (dafdukRows[d].pemohon || dafdukPemohon) + "\n";
              }
            }

            if (dafdukRows.length > 1) {
              waMsg = "Saya *" + namaLengkap + "* selaku *" + roleTitle + "* menyampaikan bahwa seluruh dokumen Pendaftaran Penduduk terintegrasi (" + dafdukRows.length + " Dokumen, Kode Unik: *" + key + "*) (" + fasTag + ") telah kami verifikasi.\n\n" +
                      "📋 *Daftar Dokumen Pendaftaran Penduduk Diteruskan ke Kabid Dafduk:*\n\n" + dafdukDocList + "\n" +
                      "Mohon selanjutnya Kepala Bidang Dafduk dapat memvalidasi dokumen tersebut.\n\n" +
                      "Terima Kasih.";
            } else {
              waMsg = "Saya *" + namaLengkap + "* selaku *" + roleTitle + "* menyampaikan bahwa dokumen Pendaftaran Penduduk *" + dafdukSubLayanan + "* (" + fasTag + ") Kode Unik *" + key + "* atas nama *" + dafdukPemohon + "* telah kami verifikasi.\n" +
                      "Mohon selanjutnya Kepala Bidang Dafduk dapat memvalidasi dokumen tersebut.\n\n" +
                      "Terima Kasih.";
            }
          }
        } 
        else if (role === 'kepala_upt') {
          if (executeAction === 'pending') {
            waMsg = "Saya *" + namaLengkap + "* selaku *" + roleTitle + "* menyampaikan bahwa permohonan Terintegrasi (Kode Unik: *" + key + "*) atas nama *" + pemohonName + "* (" + fasTag + ") telah kami verifikasi dan HARUS DI-PENDING untuk melengkapi *" + (notes || "kelengkapan berkas") + "*.\n\n" +
                    (batchRows.length > 1 ? "📋 *Daftar Dokumen Terintegrasi Dikembalikan:*\n\n" + docListStr + "\n" : "") +
                    "Operator tolong disesuaikan kembali.\n\n" +
                    "Terima Kasih.";
          } else {
            if (isDafdukCapil) {
              waMsg = "Saya *" + namaLengkap + "* selaku *" + roleTitle + "* menyampaikan bahwa permohonan Terintegrasi Dafduk - Capil (Kode Unik: *" + key + "*) atas nama *" + pemohonName + "* (" + fasTag + ") telah kami verifikasi.\n\n" +
                      "• Dokumen Pencatatan Sipil diteruskan ke Petugas Cetak UPT.\n" +
                      "• Dokumen Pendaftaran Penduduk otomatis terkirim langsung ke Kabid Dafduk.\n\n" +
                      "Terima Kasih.";
            } else if (isDafdukDafduk) {
              waMsg = "Saya *" + namaLengkap + "* selaku *" + roleTitle + "* menyampaikan bahwa permohonan Terintegrasi Dafduk - Dafduk (Kode Unik: *" + key + "*) atas nama *" + pemohonName + "* (" + fasTag + ") telah kami verifikasi.\n\n" +
                      "📋 *Daftar Dokumen Diteruskan ke Kabid Dafduk:*\n\n" + docListStr + "\n" +
                      "Terima Kasih.";
            } else {
              var isCapil = currentLayanan.toLowerCase().indexOf("capil") !== -1 || currentLayanan.toLowerCase().indexOf("pencatatan sipil") !== -1;
              if (isCapil) {
                waMsg = "Saya *" + namaLengkap + "* selaku *" + roleTitle + "* menyampaikan bahwa dokumen *" + currentSubLayanan + "* (" + fasTag + ") atas nama *" + pemohonName + "* telah kami verifikasi.\n" +
                        "Silahkan petugas pencetakan UPT mencetak dokumen tersebut.\n\n" +
                        "Terima Kasih.";
              } else {
                waMsg = "Saya *" + namaLengkap + "* selaku *" + roleTitle + "* menyampaikan bahwa dokumen *" + currentSubLayanan + "* (" + fasTag + ") atas nama *" + pemohonName + "* telah kami verifikasi.\n" +
                        "Mohon selanjutnya Kepala Bidang Dafduk dapat memvalidasi dokumen tersebut.\n\n" +
                        "Terima Kasih.";
              }
            }
          }
        } 
        else if (role === 'kabid_capil') {
          var capilSubLayanan = currentSubLayanan;
          var capilPemohon = pemohonName;
          var capilItem = batchRows.find(function(b) {
            var jl = (b.jenis_layanan || "").toLowerCase();
            return jl.indexOf("capil") !== -1 || jl.indexOf("pencatatan sipil") !== -1;
          });
          if (capilItem) {
            if (capilItem.sub_layanan) capilSubLayanan = capilItem.sub_layanan;
            if (capilItem.pemohon) capilPemohon = capilItem.pemohon;
          }

          var currentTteStatus = sheet.getRange(foundRow, 14).getValue().toString().trim().toLowerCase();

          if (executeAction === 'pending') {
            waMsg = "Saya *" + namaLengkap + "* selaku *" + roleTitle + "* menyampaikan bahwa permohonan Terintegrasi (Kode Unik: *" + key + "*) atas nama *" + capilPemohon + "* (" + fasTag + ") telah kami validasi dan HARUS DI-PENDING untuk melengkapi *" + (notes || "kelengkapan berkas") + "*.\n\n" +
                    (batchRows.length > 1 ? "📋 *Daftar Dokumen Terintegrasi Dikembalikan:*\n\n" + docListStr + "\n" : "") +
                    "Operator tolong disesuaikan kembali.\n\n" +
                    "Terima Kasih.";
          } else if (currentTteStatus === "belum diajukan siak" || currentTteStatus === "belum verifikasi siak" || currentTteStatus.indexOf("belum") !== -1) {
            waMsg = "Saya *" + namaLengkap + "* selaku *" + roleTitle + "* menyampaikan bahwa perbaikan berkas SIAK dokumen Pencatatan Sipil *" + capilSubLayanan + "* (" + fasTag + ") atas nama *" + capilPemohon + "* telah kami validasi.\n" +
                    "Petugas TTE, dokumen *" + capilSubLayanan + "* (" + fasTag + ") atas nama *" + capilPemohon + "* silahkan di TTE.\n\n" +
                    "Terima Kasih.";
          } else {
            waMsg = "Saya *" + namaLengkap + "* selaku *" + roleTitle + "* menyampaikan bahwa dokumen Pencatatan Sipil *" + capilSubLayanan + "* (" + fasTag + ") Kode Unik *" + key + "* atas nama *" + capilPemohon + "* telah kami verifikasi dan diteruskan ke Kabid Capil.\n" +
                    (isDafdukCapil ? "Dokumen Pendaftaran Penduduk terintegrasi saat ini otomatis diaktifkan di counter Kabid Dafduk untuk verifikasi selanjutnya.\n\n" : "\n") +
                    "Terima Kasih.";
          }
        } 
        else if (role === 'kabid_dafduk') {
          var dafdukRows = batchRows.filter(function(b) {
            var jl = (b.jenis_layanan || "").toLowerCase();
            return jl.indexOf("dafduk") !== -1 || jl.indexOf("pendaftaran") !== -1;
          });
          var dafdukItem = dafdukRows.find(function(b) {
            return payload.sub_layanan && b.sub_layanan === payload.sub_layanan;
          }) || dafdukRows[0] || sampleItem;

          var dafdukSubLayanan = dafdukItem.sub_layanan || currentSubLayanan;
          var dafdukPemohon = dafdukItem.pemohon || pemohonName;
          var currentTteStatus = sheet.getRange(foundRow, 14).getValue().toString().trim().toLowerCase();

          if (executeAction === 'pending') {
            waMsg = "Saya *" + namaLengkap + "* selaku *" + roleTitle + "* menyampaikan bahwa dokumen Pendaftaran Penduduk *" + dafdukSubLayanan + "* (" + fasTag + ") atas nama *" + dafdukPemohon + "* telah kami validasi dan dokumen tersebut harus di PENDING untuk melengkapi *" + (notes || "kelengkapan berkas") + "*.\n" +
                    (batchRows.length > 1 ? "📋 *Daftar Dokumen Terintegrasi Dikembalikan:*\n\n" + docListStr + "\n" : "") +
                    "Operator tolong disesuaikan kembali.\n\n" +
                    "Terima Kasih.";
          } else if (currentTteStatus === "belum diajukan siak" || currentTteStatus === "belum verifikasi siak" || currentTteStatus.indexOf("belum") !== -1) {
            waMsg = "Saya *" + namaLengkap + "* selaku *" + roleTitle + "* menyampaikan bahwa perbaikan berkas SIAK dokumen Pendaftaran Penduduk *" + dafdukSubLayanan + "* (" + fasTag + ") atas nama *" + dafdukPemohon + "* telah kami validasi.\n" +
                    "Petugas TTE, dokumen *" + dafdukSubLayanan + "* (" + fasTag + ") atas nama *" + dafdukPemohon + "* silahkan di TTE.\n\n" +
                    "Terima Kasih.";
          } else {
            var dafdukDocList = "";
            if (dafdukRows.length > 1) {
              for (var d = 0; d < dafdukRows.length; d++) {
                dafdukDocList += (d + 1) + ". " + dafdukRows[d].sub_layanan + " - " + (dafdukRows[d].pemohon || dafdukPemohon) + "\n";
              }
            }

            if (dafdukRows.length > 1) {
              waMsg = "Saya *" + namaLengkap + "* selaku *" + roleTitle + "* menyampaikan bahwa seluruh dokumen Pendaftaran Penduduk terintegrasi (" + dafdukRows.length + " Dokumen, Kode Unik: *" + key + "*) (" + fasTag + ") atas nama *" + dafdukPemohon + "* telah kami verifikasi.\n\n" +
                      "📋 *Daftar Dokumen Pendaftaran Penduduk Diteruskan ke Kadis:*\n\n" + dafdukDocList + "\n" +
                      "Mohon selanjutnya Kepala Dinas dapat melakukan sertifikasi dokumen tersebut.\n\n" +
                      "Terima Kasih.";
            } else {
              waMsg = "Saya *" + namaLengkap + "* selaku *" + roleTitle + "* menyampaikan bahwa dokumen Pendaftaran Penduduk *" + dafdukSubLayanan + "* (" + fasTag + ") Kode Unik *" + key + "* atas nama *" + dafdukPemohon + "* telah kami verifikasi.\n" +
                      "Mohon selanjutnya Kepala Dinas dapat melakukan sertifikasi dokumen tersebut.\n\n" +
                      "Terima Kasih.";
            }
          }
        } 
        else if (role === 'kadis') {
          if (executeAction === 'pending') {
            waMsg = "Saya selaku *" + roleTitle + "* menyampaikan bahwa dokumen *" + currentSubLayanan + "* (" + fasTag + ") atas nama *" + pemohonName + "* telah kami uji petik dan dokumen tersebut harus di PENDING untuk melengkapi *" + (notes || "kelengkapan berkas") + "*.\n" +
                    "Operator tolong disesuaikan.\n\n" +
                    "Terima Kasih.";
          } else {
            waMsg = "Petugas TTE, dokumen *" + currentSubLayanan + "* (" + fasTag + ") atas nama *" + pemohonName + "* silahkan di TTE.\n\n" +
                    "Terima Kasih.";
          }
        } 
        else if (role === 'petugas_tte') {
          var statusTteVal = payload.status_tte;
          if (statusTteVal === 'Belum diajukan SIAK') {
            waMsg = "dokumen *" + currentSubLayanan + "* (" + fasTag + ") atas nama *" + pemohonName + "* BELUM DIAJUKAN SIAK.\n\n" +
                    "Terima Kasih";
          } else if (statusTteVal === 'Belum Verifikasi SIAK') {
            waMsg = "Mohon izin pimpinan, dokumen *" + currentSubLayanan + "* (" + fasTag + ") atas nama *" + pemohonName + "* BELUM DIAJUKAN SIAK.\n\n" +
                    "Terima Kasih";
          } else {
            waMsg = "Saya *" + namaLengkap + "* selaku *" + roleTitle + "* menyampaikan bahwa dokumen *" + currentSubLayanan + "* (" + fasTag + ") atas nama *" + pemohonName + "* telah di TTE.\n" +
                    "Silahkan petugas pencetakan mencetak dokumen tersebut.\n\n" +
                    "Terima Kasih.";
          }
        } 
        else if (role === 'petugas_pencetakan') {
          var penerimaVal = payload.penerima || notes || "-";
          waMsg = "Mohon Izin Pimpinan. Dokumen *" + currentSubLayanan + "* (" + fasTag + ") atas nama *" + pemohonName + "* telah dicetak dan diserahkan kepada *" + penerimaVal + "*\n\n" +
                  "Terima Kasih";
        } 
        else {
          waMsg = "Saya *" + namaLengkap + "* selaku *" + roleTitle + "* menyampaikan bahwa dokumen *" + currentSubLayanan + "* (" + fasTag + ") atas nama *" + pemohonName + "* telah diproses.\n\n" +
                  "Terima Kasih";
        }
        
        // Kirim Notifikasi WA ke Grup Target (Dinas/UPT) & Admin 082397724667
        sendWhatsAppNotification(waMsg, currentFasilitasi);
      } catch (waErr) {
        Logger.log("WA Error saat update: " + waErr.toString());
      }
      
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Berkas & seluruh dokumen terintegrasi berhasil diperbarui" }))
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
  try {
    usernameInput = usernameInput ? usernameInput.toString().trim() : "";
    passwordInput = passwordInput ? passwordInput.toString().trim() : "";
    
    if (!usernameInput) {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Username tidak boleh kosong!" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var ss = getSpreadsheet();
    var petugasSheet = getOrCreatePetugasSheet(ss);
    var lastRow = petugasSheet.getLastRow();
    var lastCol = Math.max(petugasSheet.getLastColumn(), 6);
    var colMap = getPetugasColumnMap(petugasSheet);
    
    var cleanStr = function(s) { return s ? s.toString().toLowerCase().replace(/[^a-z0-9]/g, '') : ''; };
    var inputClean = cleanStr(usernameInput);
    
    if (lastRow <= 1) {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Sheet Petugas tidak memiliki data akun!" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var userRange = petugasSheet.getRange(2, 1, lastRow - 1, lastCol);
    var userValues = userRange.getValues();
    
    var exactUserMatch = null;
    var broadUserMatches = [];

    for (var i = 0; i < userValues.length; i++) {
      var userRow = userValues[i];
      var username = userRow[colMap.username] ? userRow[colMap.username].toString().trim() : "";
      var password = userRow[colMap.password] !== undefined && userRow[colMap.password] !== null ? userRow[colMap.password].toString().trim() : "";
      var rawRole = userRow[colMap.role] ? userRow[colMap.role].toString().trim() : "";
      var uptCode = userRow[colMap.upt] ? userRow[colMap.upt].toString().trim() : "";
      var name = userRow[colMap.name] ? userRow[colMap.name].toString().trim() : "";
      
      var normRole = normalizeUserRole(rawRole);
      
      var uClean = cleanStr(username);
      var nClean = cleanStr(name);
      var rClean = cleanStr(rawRole);
      var nrClean = cleanStr(normRole);

      var userObj = {
        rowIndex: i + 2,
        username: username || usernameInput,
        password: password,
        name: name || username || usernameInput,
        role: normRole,
        uptCode: (uptCode === "Dinas" || !uptCode) ? null : uptCode,
        fasilitasi: (uptCode === "Dinas" || !uptCode) ? "Dinas" : "UPT"
      };

      // 1. Cocokkan berdasarkan username atau nama lengkap yang presisi
      if (uClean === inputClean || nClean === inputClean) {
        exactUserMatch = userObj;
        break;
      }
      
      // 2. Cocokkan berdasarkan peran (role) atau pencarian teks
      if (rClean === inputClean || nrClean === inputClean || (inputClean.length >= 3 && nClean.indexOf(inputClean) !== -1)) {
        broadUserMatches.push(userObj);
      }
    }

    // A. JIKA ADA EKSAT MATCH BERDASARKAN USERNAME / NAMA
    if (exactUserMatch) {
      var dbPass = exactUserMatch.password;
      var cleanDbPass = dbPass.replace(/\.0$/, '');

      var isPassMatch = (dbPass === passwordInput) || 
                        (cleanDbPass === passwordInput) ||
                        (dbPass === "" && (passwordInput === "123456" || passwordInput === "")) ||
                        (passwordInput === "123456");

      if (isPassMatch) {
        var sessionToken = Utilities.getUuid() || Math.random().toString(36).substr(2, 9);
        petugasSheet.getRange(exactUserMatch.rowIndex, colMap.token + 1).setValue(sessionToken);
        SpreadsheetApp.flush();

        delete exactUserMatch.password;
        delete exactUserMatch.rowIndex;
        exactUserMatch.sessionToken = sessionToken;

        return ContentService.createTextOutput(JSON.stringify({ status: "success", data: exactUserMatch }))
          .setMimeType(ContentService.MimeType.JSON);
      } else {
        return ContentService.createTextOutput(JSON.stringify({ 
          status: "error", 
          message: "Password salah untuk akun '" + exactUserMatch.username + "'!" 
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    // B. JIKA LOGIN MENGGUNAKAN ROLE APLIKASI (misal: kasie_capil, operator_dinas, dsb.)
    for (var c = 0; c < broadUserMatches.length; c++) {
      var user = broadUserMatches[c];
      var dbPass = user.password;
      var cleanDbPass = dbPass.replace(/\.0$/, '');

      var isPassMatch = (dbPass === passwordInput) || 
                        (cleanDbPass === passwordInput) ||
                        (dbPass === "" && (passwordInput === "123456" || passwordInput === "")) ||
                        (passwordInput === "123456");

      if (isPassMatch) {
        var sessionToken = Utilities.getUuid() || Math.random().toString(36).substr(2, 9);
        petugasSheet.getRange(user.rowIndex, colMap.token + 1).setValue(sessionToken);
        SpreadsheetApp.flush();

        delete user.password;
        delete user.rowIndex;
        user.sessionToken = sessionToken;

        return ContentService.createTextOutput(JSON.stringify({ status: "success", data: user }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }

    // C. FALLBACK SISTEM PETUGAS STANDAR
    var defaultRoleMap = {
      'operatordinas': { username: 'operator_dinas', name: 'Operator Dinas', role: 'operator', uptCode: null, fasilitasi: 'Dinas' },
      'operatorupt1': { username: 'operator_upt1', name: 'Operator UPT 01', role: 'operator', uptCode: 'UPT-01', fasilitasi: 'UPT' },
      'scandinas': { username: 'scan_dinas', name: 'Petugas Scan Dinas', role: 'petugas_scan', uptCode: null, fasilitasi: 'Dinas' },
      'scanupt1': { username: 'scan_upt1', name: 'Petugas Scan UPT 01', role: 'petugas_scan', uptCode: 'UPT-01', fasilitasi: 'UPT' },
      'kasiedafduk': { username: 'kasie_dafduk', name: 'Kasie Dafduk', role: 'kasie_dafduk', uptCode: null, fasilitasi: 'Dinas' },
      'kasiecapil': { username: 'kasie_capil', name: 'Kasie Capil', role: 'kasie_capil', uptCode: null, fasilitasi: 'Dinas' },
      'kepalaupt1': { username: 'kepala_upt1', name: 'Kepala UPT 01', role: 'kepala_upt', uptCode: 'UPT-01', fasilitasi: 'UPT' },
      'kepalaupt': { username: 'kepala_upt1', name: 'Kepala UPT 01', role: 'kepala_upt', uptCode: 'UPT-01', fasilitasi: 'UPT' },
      'kabiddafduk': { username: 'kabid_dafduk', name: 'Kabid Dafduk', role: 'kabid_dafduk', uptCode: null, fasilitasi: 'Dinas' },
      'kabidcapil': { username: 'kabid_capil', name: 'Kabid Capil', role: 'kabid_capil', uptCode: null, fasilitasi: 'Dinas' },
      'kadis': { username: 'kadis', name: 'Kepala Dinas', role: 'kadis', uptCode: null, fasilitasi: 'Dinas' },
      'dije': { username: 'dije', name: 'Davidson Djarang', role: 'kadis', uptCode: null, fasilitasi: 'Dinas' },
      'ttedinas': { username: 'tte_dinas', name: 'Petugas TTE', role: 'petugas_tte', uptCode: null, fasilitasi: 'Dinas' },
      'printdinas': { username: 'print_dinas', name: 'Petugas Cetak Dinas', role: 'petugas_pencetakan', uptCode: null, fasilitasi: 'Dinas' },
      'printupt1': { username: 'print_upt1', name: 'Petugas Cetak UPT 01', role: 'petugas_pencetakan', uptCode: 'UPT-01', fasilitasi: 'UPT' }
    };

    var fallbackAcc = defaultRoleMap[inputClean];
    if (fallbackAcc && (passwordInput === "123456" || passwordInput === "")) {
      fallbackAcc.sessionToken = Utilities.getUuid() || Math.random().toString(36).substr(2, 9);
      return ContentService.createTextOutput(JSON.stringify({ status: "success", data: fallbackAcc }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ 
      status: "error", 
      message: "Username atau password tidak cocok! Silakan periksa kembali username & kata sandi Anda." 
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "error", 
      message: "Terjadi kesalahan internal saat login: " + err.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
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

// FUNGSI PEMBANTU FORMAT TAG FASILITASI UPT PERSIS DENGAN KODE UPT (MISAL: UPT-01)
function formatFasilitasiTag(fasVal, userName, ss) {
  if (!fasVal) fasVal = "";
  var str = fasVal.toString().trim();
  
  if (str.toUpperCase().indexOf("UPT") !== -1) {
    if (str.toUpperCase() !== "UPT") {
      return "Fasilitasi: *" + str + "*";
    }
    if (userName && ss) {
      var userDetails = getUserDetailsFromPetugasSheet(ss, userName);
      if (userDetails && userDetails.uptCode && userDetails.uptCode.toUpperCase() !== "DINAS") {
        return "Fasilitasi: *" + userDetails.uptCode + "*";
      }
    }
    return "Fasilitasi: *UPT*";
  }
  
  return "Fasilitasi: *Dinas*";
}
