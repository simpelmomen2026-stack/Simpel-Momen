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
 *    - Description: Simpel Momen Database API (Dengan Auto-Expand Kolom)
 *    - Execute as: Me (email Anda)
 *    - Who has access: Anyone
 * 9. Klik "Deploy". Salin (copy) "Web app URL" yang muncul dan tempelkan ke panel konfigurasi API di aplikasi web.
 */



// CONFIGURASI NOTIFIKASI WHATSAPP GRUP (Opsional via Fonnte Gateway)
// Isi FONNTE_TOKEN dan WA_GROUP_TARGET untuk mengaktifkan notifikasi grup otomatis
var FONNTE_TOKEN = "miMYecGgHMbMw3kZPmCM"; // Salin Token API Fonnte Anda di sini (misal: "8x9aBC...")
var WA_GROUP_TARGET = "TEKNIS PELAYANAN DOKUMEN"; // Nama Grup WA atau ID Grup (misal: "Grup Pelayanan Dukcapil" atau "1203630xxx@g.us")

// Menangani permintaan GET (Membaca seluruh data dari spreadsheet)
function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
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
    var payload = JSON.parse(e.postData.contents);
    
    // 0. AUTENTIKASI PETUGAS (Ultra-Flexible Matching: Username, Role, Nama Lengkap, Partial Name & Dynamic Columns)
    if (payload.action === 'login') {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var petugasSheet = getOrCreatePetugasSheet(ss);
      var lastRow = petugasSheet.getLastRow();
      var lastCol = Math.max(petugasSheet.getLastColumn(), 6);
      var colMap = getPetugasColumnMap(petugasSheet);
      
      var usernameInput = payload.username ? payload.username.toString().trim() : "";
      var passwordInput = payload.password ? payload.password.toString().trim() : "";
      
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
          
          // Ultra-Flexible user matching (Username, Name, Raw Role, Normalized Role, or Partial Name)
          var isUserMatch = (uClean === inputClean) || 
                            (nClean === inputClean) || 
                            (rClean === inputClean) ||
                            (nrClean === inputClean) ||
                            (inputClean.length >= 3 && nClean.indexOf(inputClean) !== -1);
          
          if (isUserMatch) {
            userMatchedButWrongPass = true;
            matchedAccountName = username || name || rawRole;
            
            // Password matching: exact, clean decimal, or empty password in sheet defaults to 123456
            var cleanPass = password.replace(/\.0$/, '');
            var isPassMatch = (password === passwordInput) || 
                              (cleanPass === passwordInput) ||
                              (password === "" && passwordInput === "123456");
            
            if (isPassMatch) {
              var sessionToken = Utilities.getUuid() || Math.random().toString(36).substr(2, 9);
              petugasSheet.getRange(i + 2, colMap.token + 1).setValue(sessionToken);
              SpreadsheetApp.flush(); // Pastikan token sesi langsung tersimpan ke spreadsheet
              
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
      
      if (!foundUser && !userMatchedButWrongPass) {
        // Auto-provision standard accounts if missing from the user's Petugas sheet
        var defaultAccounts = [
          { username: "operator_dinas", password: "123456", role: "operator", uptCode: "Dinas", name: "Operator Dinas" },
          { username: "operator_upt1", password: "123456", role: "operator", uptCode: "UPT-01", name: "Operator UPT 01" },
          { username: "scan_dinas", password: "123456", role: "petugas_scan", uptCode: "Dinas", name: "Petugas Scan Dinas" },
          { username: "scan_upt1", password: "123456", role: "petugas_scan", uptCode: "UPT-01", name: "Petugas Scan UPT 01" },
          { username: "kepala_upt1", password: "123456", role: "kepala_upt", uptCode: "UPT-01", name: "Kepala UPT 01" },
          { username: "kasie_dafduk", password: "123456", role: "kasie_dafduk", uptCode: "Dinas", name: "Kasie Dafduk" },
          { username: "kasie_capil", password: "123456", role: "kasie_capil", uptCode: "Dinas", name: "Kasie Capil" },
          { username: "kabid_dafduk", password: "123456", role: "kabid_dafduk", uptCode: "Dinas", name: "Kabid Dafduk" },
          { username: "kabid_capil", password: "123456", role: "kabid_capil", uptCode: "Dinas", name: "Kabid Capil" },
          { username: "kadis", password: "123456", role: "kadis", uptCode: "Dinas", name: "Kepala Dinas (Kadis)" },
          { username: "tte_dinas", password: "123456", role: "petugas_tte", uptCode: "Dinas", name: "Petugas TTE Dinas" },
          { username: "print_dinas", password: "123456", role: "petugas_pencetakan", uptCode: "Dinas", name: "Petugas Cetak Dinas" },
          { username: "print_upt1", password: "123456", role: "petugas_pencetakan", uptCode: "UPT-01", name: "Petugas Cetak UPT 01" }
        ];

        for (var d = 0; d < defaultAccounts.length; d++) {
          var acc = defaultAccounts[d];
          var uClean = cleanStr(acc.username);
          var nClean = cleanStr(acc.name);
          var rClean = cleanStr(acc.role);

          if (uClean === inputClean || nClean === inputClean || rClean === inputClean || (inputClean.length >= 3 && (uClean.indexOf(inputClean) !== -1 || inputClean.indexOf(uClean) !== -1))) {
            if (passwordInput === acc.password || passwordInput === '123456' || passwordInput === '') {
              var sessionToken = Utilities.getUuid() || Math.random().toString(36).substr(2, 9);
              var normRole = normalizeUserRole(acc.role);

              // Auto-append missing account row to Petugas sheet so it exists in Google Sheets
              petugasSheet.appendRow([acc.username, acc.password, acc.role, acc.uptCode, acc.name, sessionToken]);
              SpreadsheetApp.flush();

              foundUser = {
                username: acc.username,
                name: acc.name,
                role: normRole,
                uptCode: (acc.uptCode === "Dinas" || !acc.uptCode) ? null : acc.uptCode,
                fasilitasi: (acc.uptCode === "Dinas" || !acc.uptCode) ? "Dinas" : "UPT",
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
        return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Username / Peran '" + usernameInput + "' tidak ditemukan di sheet Petugas! Silakan periksa daftar akun di sheet Petugas." }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // 0.5 CHECK SESSION LOGIN (PREVENT MULTI DEVICE LOGIN)
    if (payload.action === 'check_session') {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var petugasSheet = getOrCreatePetugasSheet(ss);
      var lastRow = petugasSheet.getLastRow();
      var lastCol = Math.max(petugasSheet.getLastColumn(), 6);
      var colMap = getPetugasColumnMap(petugasSheet);
      
      var tokenInput = payload.sessionToken ? payload.sessionToken.toString().trim() : "";
      
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
    
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
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
        // Update baris yang sudah ada dan reset alur kembali ke Scan
        sheet.getRange(foundRow, 1, 1, 30).setValues([values]);
      } else {
        // Masukkan data baru di baris ke-2 (di bawah header agar urutan terbaru di atas)
        sheet.insertRowBefore(2);
        sheet.getRange(2, 1, 1, 30).setValues([values]);
      }
      
      // Kirim Notifikasi WA Grup jika terkonfigurasi
      try {
        var waMsg = "🔔 *[SIMPEL MOMEN - BERKAS BARU]*\n" +
                    "• *Nomor Antrean*: `" + key + "`\n" +
                    "• *Pemohon*: " + data.pemohon + "\n" +
                    "• *Layanan*: " + data.jenis_layanan + " (" + data.sub_layanan + ")\n" +
                    "• *Operator*: " + data.operator + " (" + data.fasilitasi + ")\n" +
                    "• *Status*: Menunggu Scan Berkas";
        sendWhatsAppGroup(waMsg);
      } catch(waErr) {}
      
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
      
      var nextStatus = "";
      
      if (executeAction === 'pending') {
        // Alur Pending: Kembalikan berkas ke operator
        nextStatus = "PENDING_OPERATOR";
        var logMsg = "PENDING by " + role + " pada " + timeStr + ": " + notes;
        var newRiwayat = riwayatPending ? logMsg + "\n---\n" + riwayatPending : logMsg;
        sheet.getRange(foundRow, 22).setValue(newRiwayat); // Col V
        
        // Simpan catatan ke kolom verifikator terkait dan rekam timestamp
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
          nextStatus = (currentFasilitasi === "Dinas") ? "2_VERIFIKASI_KASIE" : "2_VERIFIKASI_UPT";
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
            // Layanan Pencatatan Sipil di UPT langsung ke Pencetakan UPT (Lompat Kabid, Kadis, TTE)
            nextStatus = "6_PENCETAKAN_UPT";
          }
        } 
        
        else if (role === 'kabid_dafduk' || role === 'kabid_capil') {
          sheet.getRange(foundRow, 18).setValue(notes); // Col R (Catatan Kabid)
          sheet.getRange(foundRow, 27).setValue(timeStr); // Col AA (tgl_kabid)
          
          var currentTteStatus = sheet.getRange(foundRow, 14).getValue().toString().trim().toLowerCase(); // Column N (Status TTE)
          if (currentTteStatus === "belum diajukan siak" || currentTteStatus === "belum verifikasi siak") {
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
          
          if (statusTteVal === 'Belum diajukan SIAK') {
            nextStatus = (currentFasilitasi === "UPT") ? "2_VERIFIKASI_UPT" : "2_VERIFIKASI_KASIE";
            var logMsg = "PENDING by TTE pada " + timeStr + ": " + notes;
            var newRiwayat = riwayatPending ? logMsg + "\n---\n" + riwayatPending : logMsg;
            sheet.getRange(foundRow, 22).setValue(newRiwayat); // Col V (riwayat pending)
          } else if (statusTteVal === 'Belum Verifikasi SIAK') {
            nextStatus = "3_VALIDASI_KABID";
            var logMsg = "PENDING by TTE pada " + timeStr + ": " + notes;
            var newRiwayat = riwayatPending ? logMsg + "\n---\n" + riwayatPending : logMsg;
            sheet.getRange(foundRow, 22).setValue(newRiwayat); // Col V (riwayat pending)
          } else {
            nextStatus = (currentFasilitasi === "UPT") ? "6_PENCETAKAN_UPT" : "6_PENCETAKAN_DINAS";
          }
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
      
      // Kirim Notifikasi WA Grup jika terkonfigurasi
      try {
        var pemohonName = sheet.getRange(foundRow, 5).getValue().toString().trim();
        var subLayanan = sheet.getRange(foundRow, 11).getValue().toString().trim();
        var execUserName = payload.userName ? payload.userName : getRoleDisplayName(role);
        var waMsg = "";
        
        if (executeAction === 'pending') {
          waMsg = "⚠️ *[SIMPEL MOMEN - BERKAS PENDING]*\n" +
                  "• *Nomor Antrean*: `" + key + "`\n" +
                  "• *Pemohon*: " + pemohonName + "\n" +
                  "• *Ditunda Oleh*: " + getRoleDisplayName(role) + "\n" +
                  "• *Alasan*: " + notes + "\n" +
                  "• *Petugas*: " + execUserName;
        } else {
          if (role === 'petugas_pencetakan') {
            var penerimaVal = payload.penerima || "-";
            waMsg = "🎉 *[SIMPEL MOMEN - SELESAI DICETAK]*\n" +
                    "• *Nomor Antrean*: `" + key + "`\n" +
                    "• *Pemohon*: " + pemohonName + "\n" +
                    "• *Layanan*: " + subLayanan + "\n" +
                    "• *Status*: SELESAI DICETAK & SIAP DIAMBIL\n" +
                    "• *Penerima*: " + penerimaVal + "\n" +
                    "• *Petugas*: " + execUserName;
          } else {
            var nextDeskName = getStatusDeskDisplayName(nextStatus);
            waMsg = "🔔 *[SIMPEL MOMEN - UPDATE ALUR]*\n" +
                    "• *Nomor Antrean*: `" + key + "`\n" +
                    "• *Pemohon*: " + pemohonName + "\n" +
                    "• *Dari Meja*: " + getRoleDisplayName(role) + "\n" +
                    "• *Ke Meja*: " + nextDeskName + "\n" +
                    "• *Catatan*: " + (notes || "Disetujui") + "\n" +
                    "• *Petugas*: " + execUserName;
          }
        }
        sendWhatsAppGroup(waMsg);
      } catch (waErr) {}
      
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Berkas berhasil diperbarui" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    throw new Error("Action tidak valid.");
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Fungsi Pembantu: Cari nomor baris berdasarkan nilai Key
function findRowByKey(sheet, key) {
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return -1;
  
  var keys = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < keys.length; i++) {
    if (keys[i][0].toString() === key) {
      return i + 2; // Index baris spreadsheet (+2 karena 1-based index dan melewati header)
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
  
  // Jika sheet kosong atau hanya ada 1 baris header saja
  if (petugasSheet.getLastRow() <= 1) {
    petugasSheet.clear();
    // Write headers: Username, Password, Role, UPT_Code, Nama_Lengkap, Session_Token
    petugasSheet.getRange(1, 1, 1, 6).setValues([["Username", "Password", "Role", "UPT_Code", "Nama_Lengkap", "Session_Token"]]);
    // Write default accounts
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
  
  // 1. Pass Pertama: Pencocokan Eksak (Exact Match)
  for (var c = 0; c < headers.length; c++) {
    var h = headers[c] ? headers[c].toString().trim().toLowerCase() : "";
    if (h === 'username' || h === 'user' || h === 'nama pengguna' || h === 'id_user' || h === 'id user') { map.username = c; found.username = true; }
    else if (h === 'password' || h === 'pass' || h === 'kata sandi' || h === 'sandi') { map.password = c; found.password = true; }
    else if (h === 'role' || h === 'peran' || h === 'jabatan') { map.role = c; found.role = true; }
    else if (h === 'upt_code' || h === 'upt' || h === 'kode_upt' || h === 'fasilitasi' || h === 'kode upt') { map.upt = c; found.upt = true; }
    else if (h === 'nama' || h === 'nama_lengkap' || h === 'nama lengkap' || h === 'nama petugas') { map.name = c; found.name = true; }
    else if (h === 'session_token' || h === 'session' || h === 'token' || h === 'token_sesi' || h === 'session token') { map.token = c; found.token = true; }
  }
  
  // 2. Pass Kedua: Fallback Substring jika belum terpetakan
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

// Fungsi Pembantu: Mengirim Pesan ke Grup WhatsApp via Fonnte API
function sendWhatsAppGroup(message) {
  if (!FONNTE_TOKEN || !WA_GROUP_TARGET) return; // Abaikan jika token/grup belum dikonfigurasi
  
  var url = "https://api.fonnte.com/send";
  var payload = {
    target: WA_GROUP_TARGET,
    message: message
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
    UrlFetchApp.fetch(url, options);
  } catch (e) {
    Logger.log("Gagal mengirim WA Grup: " + e.toString());
  }
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


