const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

// --- PENGATURAN BOT ---
const NOMOR_ADMINS = ['6281319449299', '6282129499789', '6281267078789']; 

// Lokasi file "database" kita
const LOKASI_FILE_TUGAS_JSON = './tugas.json'; // <-- BERUBAH KE .json
const LOKASI_FILE_KAS = './kas.txt';
const LOKASI_FILE_INFO = './informasi.txt';
const LOKASI_FILE_TODO = './todo.txt';
const LOKASI_FILE_SALDO = './saldo.txt';
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
    // --- PENAMBAHAN BARU UNTUK STABILITAS ---
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

// Teks bantuan yang sudah diperbarui
const teksBantuan = `🤖 *Hey Axa! - Asisten Kelas* 🤖
---------------------------------------------
Hai! Aku Axa, siap membantumu.
Berikut adalah perintah yang bisa kamu gunakan:

📖 *.help / .axa*
   >> Menampilkan daftar perintah ini.

📝 *.tugas*
   >> Melihat daftar tugas terbaru (format baru).

💰 *.kas*
   >> Melihat laporan keuangan & kas kelas.

📢 *.info*
   >> Menampilkan informasi penting.

✅ *.todo*
   >> Melihat agenda atau rencana kelas.
`;

client.on('message', async (msg) => {
    const text = msg.body.toLowerCase() || '';
    const senderNumber = msg.from.replace('@c.us', '');
    const isAdmin = NOMOR_ADMINS.includes(senderNumber);

    // ==================================================
    // === PERINTAH UNTUK SEMUA ORANG ===
    // ==================================================

    if (text === '.help' || text === '.axa') {
        msg.reply(teksBantuan);
    } else if (text === '.tugas') {
        // --- LOGIKA BARU UNTUK MENAMPILKAN TUGAS ---
        try {
            const tugasData = JSON.parse(bacaFile(LOKASI_FILE_TUGAS_JSON) || '[]');
            if (tugasData.length === 0) {
                msg.reply("🎉 Hore! Tidak ada tugas saat ini.");
                return;
            }
    
            let pesanTugas = `📚 *KUMPULAN TUGAS AKTIF* 📚
-----------------------------------------`;
    
            const nomorEmoji = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
    
            tugasData.forEach(matkul => {
                pesanTugas += `\n\n${matkul.nama}`;
                matkul.tugas.forEach((item, index) => {
                    pesanTugas += `\n   ${nomorEmoji[index] || (index + 1) + '️⃣'} Tugas: ${item.deskripsi}`;
                    pesanTugas += `\n       > Deadline: ${item.deadline}`;
                    pesanTugas += `\n       > Catatan: ${item.catatan}`;
                });
            });
    
            pesanTugas += `\n\n-----------------------------------------
_Periksa kembali detail tugas sebelum dikumpulkan._`;
    
            msg.reply(pesanTugas);
        } catch (error) {
            console.error(error);
            msg.reply("Format data tugas sepertinya rusak. Mohon minta admin untuk memperbaikinya dengan `.update_tugas`");
        }

    } else if (text === '.kas') {
        // --- FUNGSI LAPORAN KEUANGAN DIGABUNGKAN DI SINI ---
        const options = { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' };
        const tanggalHariIni = new Date().toLocaleDateString('id-ID', options);
        
        const saldo = bacaFile(LOKASI_FILE_SALDO) || '0';
        const kas = bacaFile(LOKASI_FILE_KAS);
        
        let daftarKas = '👍 _Semua iuran sudah tercatat._';
        if (kas && kas.trim() !== '') {
            daftarKas = kas.split('\n').map(nama => `🔴 ${nama.replace('-', '').trim()}`).join('\n');
        }

        const pesanLaporan = `📊 *LAPORAN KEUANGAN KELAS* 📊
_Data per ${tanggalHariIni}_
-----------------------------------------

*Saldo Akhir :* \`\`\`Rp${saldo}\`\`\`

-----------------------------------------

⚠️ *PERLU KONFIRMASI PEMBAYARAN* ⚠️
Berikut adalah daftar nama yang iurannya belum tercatat di sistem:

${daftarKas}

Untuk pembayaran atau konfirmasi, silakan hubungi Bendahara *Grania 😏 & Fandi 😎*.
Terima kasih untuk semua yang sudah membayar tepat waktu! ✨`;

        msg.reply(pesanLaporan);

    } else if (text === '.info') {
        const data = bacaFile(LOKASI_FILE_INFO);
        msg.reply(data.trim() === '' ? "ℹ️ Belum ada informasi." : `📢 *INFORMASI PENTING*\n\n${data}`);
    } else if (text === '.todo') {
        const data = bacaFile(LOKASI_FILE_TODO);
        msg.reply(data.trim() === '' ? "✅ Semua agenda selesai." : `📋 *TO-DO LIST & AGENDA*\n\n${data}`);
    }

    // ==================================================
    // === PERINTAH KHUSUS ADMIN (Bisa di Grup / Pribadi) ===
    // ==================================================
    if (isAdmin) {
        
        // --- LOGIKA BARU UNTUK UPDATE TUGAS ---
        if (msg.body.startsWith('.update_tugas\n') || msg.body.startsWith('.update_tugas ')) {
            try {
                const dataMentah = msg.body.substring(14).trim();
                const dataFinal = [];

                const blokMatkul = dataMentah.split('///');

                blokMatkul.forEach(blok => {
                    const baris = blok.trim().split('\n');
                    const namaMatkul = baris.shift().trim();
                    const tugasList = baris; // Setiap baris adalah satu tugas

                    const tugasObjek = {
                        nama: namaMatkul,
                        tugas: []
                    };

                    tugasList.forEach(tugasString => {
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
                
                fs.writeFileSync(LOKASI_FILE_TUGAS_JSON, JSON.stringify(dataFinal, null, 2), 'utf-8');
                msg.reply('✅ Seluruh daftar tugas dengan format baru berhasil diperbarui!');
            } catch (error) {
                console.error("Gagal parse tugas:", error);
                msg.reply('❌ Format perintah .update_tugas salah. Pastikan formatnya benar.');
            }
        } 
        
        // --- CRUD KAS ---
        else if (text.startsWith('.update_kas ')) {
            const konten = msg.body.substring(12);
            const format = konten.split(';').map(item => item.trim()).join('\n');
            fs.writeFileSync(LOKASI_FILE_KAS, format, 'utf-8');
            msg.reply('✅ Daftar kas berhasil diperbarui!');
        } else if (text === '.hapus_kas') {
            fs.writeFileSync(LOKASI_FILE_KAS, '', 'utf-8');
            msg.reply('🗑️ Semua data kas berhasil dihapus!');
        }
        
        // --- CRUD INFO ---
        else if (text.startsWith('.update_info ')) {
            const konten = msg.body.substring(13);
            fs.writeFileSync(LOKASI_FILE_INFO, konten, 'utf-8');
            msg.reply('✅ Informasi berhasil diperbarui!');
        } else if (text === '.hapus_info') {
            fs.writeFileSync(LOKASI_FILE_INFO, '', 'utf-8');
            msg.reply('🗑️ Informasi berhasil dihapus!');
        }

        // --- CRUD TODO (LOGIKA BARU) ---
        else if (text.startsWith('.update_todo ')) {
            const konten = msg.body.substring(13); // Mengambil semua teks setelah perintah
            fs.writeFileSync(LOKASI_FILE_TODO, konten, 'utf-8');
            msg.reply('✅ To-do list berhasil diperbarui!');
        } else if (text === '.hapus_todo') {
            fs.writeFileSync(LOKASI_FILE_TODO, '', 'utf-8');
            msg.reply('🗑️ To-do list berhasil dihapus!');
        }
        
        // --- CRUD SALDO ---
        else if (text.startsWith('.update_saldo ')) {
            const konten = msg.body.substring(14);
            fs.writeFileSync(LOKASI_FILE_SALDO, konten, 'utf-8');
            msg.reply(`✅ Saldo berhasil diperbarui menjadi: Rp${konten}`);
        } else if (text === '.hapus_saldo') {
            fs.writeFileSync(LOKASI_FILE_SALDO, '0', 'utf-8');
            msg.reply('🗑️ Saldo berhasil direset menjadi Rp0!');
        } else if (text === '.hapus_semua_tugas') {
            // (Delete) Menghapus semua tugas
            fs.writeFileSync(LOKASI_FILE_TUGAS_JSON, '[]', 'utf-8');
            msg.reply('🗑️ Semua tugas berhasil dihapus!');
        }
    }
});

client.initialize();

