const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js'); // <-- Pastikan MessageMedia ada
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path'); // <-- Modul baru untuk menangani path file

// --- PENGATURAN BOT ---
const NOMOR_ADMINS = ['6281319449299', '6282129499789', '6281267078789']; 

// Lokasi file "database" kita
const LOKASI_FILE_TUGAS_JSON = './tugas.json';
const LOKASI_FILE_KAS = './kas.txt';
const LOKASI_FILE_INFO = './informasi.txt';
const LOKASI_FILE_TODO = './todo.txt';
const LOKASI_FILE_SALDO = './saldo.txt';
const LOKASI_FILE_KALENDER_LOKAL = './kalender.jpeg'; // <-- PATH BARU KE FILE LOKAL
// -------------------

console.log("🤖 Memulai Bot...");

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ],
    },
    restartOnAuthFail: true,
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
    }
});

client.on('qr', (qr) => {
    console.log("==================================================");
    console.log("↓↓↓ SALIN SEMUA TEKS DI BAWAH INI ↓↓↓");
    console.log(qr);
    console.log("↑↑↑ SALIN SEMUA TEKS DI ATAS INI ↑↑↑");
    console.log("==================================================");
    console.log("Lalu paste di website QR Code Generator.");
});

client.on('ready', () => {
    console.log('✅ Bot WhatsApp berhasil terhubung dan siap digunakan!');
});

client.on('auth_failure', msg => {
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);
    client.destroy();
    client.initialize();
});


// Fungsi bantuan untuk membaca file
function bacaFile(path) {
    try {
        if (fs.existsSync(path)) {
            return fs.readFileSync(path, 'utf-8');
        }
        return '';
    } catch (error) {
        console.error(`Gagal membaca file: ${path}`, error);
        return null;
    }
}

// Fungsi bantuan untuk menulis file
function tulisFile(path, konten) {
    try {
        fs.writeFileSync(path, konten, 'utf-8');
        return true;
    } catch (error) {
        console.error(`Gagal menulis file: ${path}`, error);
        return false;
    }
}

const teksJadwal = `── .✦ JADWAL MATA KULIAH ⊹₊⟡⋆
---------------------------------------------
🖥️ SENIN
➪ Sistem Berkas  (10:30-12:10)
Samsoni S.Kom., M.Kom
085929854648

🖥️ SELASA
➪ Jaringan Komputer  (07:10-08:50)
Hidayatullah Al Islami S.Kom., M.Kom
082113214440
➪ Matematika Diskrit (08:50-10:30)
Yolen Perdana Sari S.T,. M.T
081321509820
➪ Graph Terapan  (10:30-12:10)
Abdullah Muhajir S.Kom., M.Ko 
089616434884
➪ Struktur Data  (14:40-16:20)
Farida Nurlaila S.Kom., M.Kom
085885928025

🖥️ RABU
➪ Algoritma dan Pemrograman II  (07:10-08:50)
Fitri Yanti K.Kom., M.Kom 
085218562646
➪ Aljabar Linier dan Matriks  (08:50-10:30)
Widyah Novania S.Pd., M.Pd
081387946856
➪ Statiska dan Probabilitas  (10:30-12:10)
Yeskarwani Gulo S.Kom., M.Kom
082388891691
`

// Teks bantuan yang diperbarui (perintah admin kalender dihapus)
const teksBantuan = `🤖 *HEXABOT - Asisten Kelas* 🤖
---------------------------------------------
Hai! Aku Hexabot, siap membantumu.
Berikut adalah perintah yang bisa kamu gunakan:

📖 *.help / .axa*
   > Menampilkan daftar perintah ini.

🗃️ *.jadwal* (in progress)
   > Menampilkan jadwal perkuliahan.

📝 *.tugas*
   > Melihat daftar tugas terstruktur.

💰 *.kas*
   > Menampilkan laporan keuangan & kas kelas.

📢 *.info*
   > Menampilkan informasi penting.

✅ *.todo*
   > Melihat agenda atau rencana kegiatan kelas.

🗓️ *.kalender*
   > Menampilkan gambar kalender perkuliahan.
   
---------------------------------------------`;


client.on('message', async (msg) => {
    const text = msg.body.toLowerCase() || '';
    const senderNumber = msg.from.replace('@c.us', '');
    const isAdmin = NOMOR_ADMINS.includes(senderNumber);

    // ==================================================
    // === PERINTAH UNTUK SEMUA ORANG ===
    // ==================================================
    if (text === '.help' || text === '.axa') {
        msg.reply(teksBantuan);
    }

    if (text === '.jadwal') {
        msg.reply(teksJadwal);
    }
    
    else if (text === '.tugas') {
        const dataTugas = bacaFile(LOKASI_FILE_TUGAS_JSON);
        if (dataTugas) {
            try {
                const tugasJson = JSON.parse(dataTugas);
                if (tugasJson.length === 0) {
                    msg.reply("🎉 Hore! Tidak ada tugas saat ini.");
                    return;
                }
                let pesanTugas = "📚 *KUMPULAN TUGAS AKTIF* 📚\n";
                pesanTugas += "-----------------------------------------\n\n";
                tugasJson.forEach(matkul => {
                    pesanTugas += `${matkul.nama}\n`; 
                    matkul.tugas.forEach((t, index) => {
                        const nomorEmoji = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
                        pesanTugas += `   ${nomorEmoji[index] || (index + 1) + '️⃣'} Tugas: ${t.deskripsi}\n`;
                        pesanTugas += `       > Deadline: ${t.deadline}\n`;
                        pesanTugas += `       > Catatan: ${t.catatan}\n\n`;
                    });
                });
                pesanTugas += "-----------------------------------------\n";
                pesanTugas += "_Periksa kembali detail tugas sebelum dikumpulkan._";
                msg.reply(pesanTugas);
            } catch (error) {
                console.error("Error parsing tugas.json:", error);
                msg.reply("Format data tugas sepertinya rusak. Mohon minta admin untuk memperbaikinya dengan `.update_tugas`");
            }
        } else {
             msg.reply("🎉 Hore! Tidak ada tugas saat ini.");
        }
    } 
    
    else if (text === '.kas') {
        const saldo = bacaFile(LOKASI_FILE_SALDO);
        const daftarKas = bacaFile(LOKASI_FILE_KAS);
        const tanggalHariIni = new Date().toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
        const saldoTampilan = saldo.trim() === '' ? '0' : saldo;
        const kasTampilan = daftarKas.trim() === '' ? '👍 _Semua iuran sudah tercatat._' : daftarKas.split('\n').map(nama => `🔴 ${nama.replace('-', '').trim()}`).join('\n');
        const pesanLaporan = `📊 *LAPORAN KEUANGAN KELAS* 📊
_Data per ${tanggalHariIni}_
---------------------------------------------

*Saldo Akhir :* \`\`\`Rp${saldoTampilan}\`\`\`

---------------------------------------------

⚠️ *PERLU KONFIRMASI PEMBAYARAN* ⚠️
Berikut adalah daftar nama yang iurannya belum tercatat di sistem:

${kasTampilan}

Untuk pembayaran atau konfirmasi, silakan hubungi Bendahara (*Grania*😏 & *Fandi*😎).
Terima kasih untuk semua yang sudah membayar tepat waktu! ✨`;
        msg.reply(pesanLaporan);
    } 
    
    else if (text === '.info') {
        const data = bacaFile(LOKASI_FILE_INFO);
        msg.reply(data.trim() === '' ? "ℹ️ Belum ada informasi." : `📢 *INFORMASI PENTING*\n\n${data}`);
    } 
    
    else if (text === '.todo') {
        const data = bacaFile(LOKASI_FILE_TODO);
        msg.reply(data.trim() === '' ? "✅ Semua agenda selesai." : `📋 *TO-DO LIST & AGENDA*\n\n${data}`);
    }

    // --- PERINTAH .KALENDER (VERSI STATIS) ---
    else if (text === '.kalender') {
        try {
            // Cek apakah file ada
            if (fs.existsSync(LOKASI_FILE_KALENDER_LOKAL)) {
                const media = MessageMedia.fromFilePath(LOKASI_FILE_KALENDER_LOKAL);
                client.sendMessage(msg.from, media, { caption: 'Ini dia kalender perkuliahannya. 🗓️' });
            } else {
                msg.reply("❌ File `kalender.jpeg` tidak ditemukan di server bot. Mohon hubungi admin.");
            }
        } catch (error) {
            console.error("Gagal mengirim media lokal:", error);
            msg.reply("❌ Maaf, terjadi kesalahan saat mencoba mengirim gambar kalender.");
        }
    }

    // ==================================================
    // === PERINTAH KHUSUS ADMIN ===
    // ==================================================
    if (isAdmin) {
        
        if (msg.body.startsWith('.update_tugas\n') || msg.body.startsWith('.update_tugas ')) {
            try {
                const dataMentah = msg.body.substring(msg.body.indexOf(' ')).trim(); 
                const dataFinal = [];
                const blokMatkul = dataMentah.split('///');
                blokMatkul.forEach(blok => {
                    const baris = blok.trim().split('\n');
                    const namaMatkul = baris.shift().trim(); 
                    let tugasStrings = baris.join('\n').split(';;'); 
                    const tugasObjek = {
                        nama: namaMatkul,
                        tugas: []
                    };
                    tugasStrings.forEach(tugasString => {
                        const detail = tugasString.trim().split('|');
                        if (detail.length === 3) {
                            tugasObjek.tugas.push({
                                deskripsi: detail[0].trim(),
                                deadline: detail[1].trim(),
                                catatan: detail[2].trim()
                            });
                        }
                    });
                    if (tugasObjek.tugas.length > 0) {
                       dataFinal.push(tugasObjek);
                    }
                });
                if (tulisFile(LOKASI_FILE_TUGAS_JSON, JSON.stringify(dataFinal, null, 2))) {
                    msg.reply('✅ Seluruh daftar tugas dengan format baru berhasil diperbarui!');
                } else {
                     msg.reply('❌ Gagal menyimpan data tugas.');
                }
            } catch (e) {
                console.error("Gagal parse tugas:", e);
                msg.reply('❌ Terjadi kesalahan format. Pastikan format input benar.\nContoh:\n.update_tugas\n[Matkul]\n[Tugas 1]|[Deadline]|[Catatan]\n;;\n[Tugas 2]|[Deadline]|[Catatan]\n///\n[Matkul 2]\n...');
            }
        } 
        
        else if (text === '.hapus_semua_tugas') {
            if (tulisFile(LOKASI_FILE_TUGAS_JSON, '[]')) {
                msg.reply('🗑️ Semua tugas berhasil dihapus!');
            }
        }
        
        else if (text.startsWith('.update_kas ')) {
            const konten = msg.body.substring(12);
            const format = konten.split(';').map(item => item.trim()).join('\n');
            if (tulisFile(LOKASI_FILE_KAS, format)) {
                msg.reply('✅ Daftar kas berhasil diperbarui!');
            }
        } 
        
        else if (text === '.hapus_kas') {
            if (tulisFile(LOKASI_FILE_KAS, '')) {
                msg.reply('🗑️ Semua data kas berhasil dihapus!');
            }
        }

        else if (text.startsWith('.update_saldo ')) {
            const saldo = msg.body.substring(14);
            if (tulisFile(LOKASI_FILE_SALDO, saldo)) {
                msg.reply(`✅ Saldo berhasil diperbarui menjadi Rp${saldo}`);
            }
        } 
        
        else if (text === '.hapus_saldo') {
            if (tulisFile(LOKASI_FILE_SALDO, '0')) {
                msg.reply('🗑️ Saldo berhasil direset menjadi Rp0.');
            }
        }
        
        else if (text.startsWith('.update_info ')) {
            const konten = msg.body.substring(13);
            if (tulisFile(LOKASI_FILE_INFO, konten)) {
                msg.reply('✅ Informasi berhasil diperbarui!');
            }
        } 
        
        else if (text === '.hapus_info') {
            if (tulisFile(LOKASI_FILE_INFO, '')) {
                msg.reply('🗑️ Informasi berhasil dihapus!');
            }
        }

        else if (text.startsWith('.update_todo ')) {
            const konten = msg.body.substring(12);
            if(tulisFile(LOKASI_FILE_TODO, konten)) {
                msg.reply('✅ To-do list berhasil diperbarui!');
            }
        } 
        
        else if (text === '.hapus_todo') {
            if(tulisFile(LOKASI_FILE_TODO, '')) {
                msg.reply('🗑️ To-do list berhasil dihapus!');
            }
        }

    }
});

client.initialize();