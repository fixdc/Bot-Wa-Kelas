const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

// --- PENGATURAN BOT ---

// ❗ PENTING: Daftar nomor admin. Anda bisa menambah nomor lain di sini.
// Format harus 62... dan dalam tanda kutip. Pisahkan dengan koma.
const NOMOR_ADMINS = ['6281319449299', '6281234567890']; 

// Lokasi file "database" kita
const LOKASI_FILE_TUGAS = './tugas.txt';
const LOKASI_FILE_KAS = './kas.txt';
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
        return ''; // Kembalikan string kosong jika file tidak ada
    } catch (error) {
        console.error("Gagal membaca file:", error);
        return null;
    }
}

client.on('message', async (msg) => {
    const text = msg.body.toLowerCase() || '';
    const senderNumber = msg.from.replace('@c.us', '');
    const isAdmin = NOMOR_ADMINS.includes(senderNumber);

    // ==================================================
    // === PERINTAH UNTUK SEMUA ORANG ===
    // ==================================================

    // Melihat daftar tugas
    if (text === '.tugas') {
        const daftarTugas = bacaFile(LOKASI_FILE_TUGAS);
        msg.reply(daftarTugas.trim() === '' ? "🎉 Hore! Tidak ada tugas." : `📚 *DAFTAR TUGAS*\n\n${daftarTugas}`);
    }

    // Melihat daftar yang belum bayar kas
    if (text === '.kas') {
        const daftarKas = bacaFile(LOKASI_FILE_KAS);
        msg.reply(daftarKas.trim() === '' ? "👍 Mantap! Semua sudah lunas." : `💰 *INFO UANG KAS*\n\nYang belum lunas:\n${daftarKas}`);
    }

    // ==================================================
    // === PERINTAH KHUSUS ADMIN ===
    // ==================================================
    if (isAdmin) {
        
        // --- CRUD TUGAS ---

        // (Create) Menambah satu tugas baru
        if (text.startsWith('.tambah_tugas ')) {
            const tugasBaru = msg.body.substring(13);
            const tugasLama = bacaFile(LOKASI_FILE_TUGAS);
            const kontenBaru = `${tugasLama}\n- ${tugasBaru}`.trim();
            fs.writeFileSync(LOKASI_FILE_TUGAS, kontenBaru, 'utf-8');
            msg.reply(`✅ Tugas baru ditambahkan:\n- ${tugasBaru}`);
        }

        // (Update) Mengganti seluruh daftar tugas
        if (text.startsWith('.update_tugas ')) {
            const kontenTugasBaru = msg.body.substring(14);
            const tugasTerformat = '- ' + kontenTugasBaru.split(';').map(item => item.trim()).join('\n- ');
            fs.writeFileSync(LOKASI_FILE_TUGAS, tugasTerformat, 'utf-8');
            msg.reply('✅ Seluruh daftar tugas berhasil diperbarui!');
        }

        // (Delete) Menghapus semua tugas
        if (text === '.hapus_semua_tugas') {
            fs.writeFileSync(LOKASI_FILE_TUGAS, '', 'utf-8');
            msg.reply('🗑️ Semua tugas berhasil dihapus!');
        }


        // --- CRUD KAS ---

        // (Create/Update) Mengganti seluruh daftar kas
        if (text.startsWith('.update_kas ')) {
            const kontenKasBaru = msg.body.substring(12);
            const kasTerformat = '- ' + kontenKasBaru.split(';').map(item => item.trim()).join('\n- ');
            fs.writeFileSync(LOKASI_FILE_KAS, kasTerformat, 'utf-8');
            msg.reply('✅ Daftar kas berhasil diperbarui!');
        }

        // (Delete) Menghapus semua data kas
        if (text === '.hapus_kas') {
            fs.writeFileSync(LOKASI_FILE_KAS, '', 'utf-8');
            msg.reply('🗑️ Semua data kas berhasil dihapus!');
        }
    }
});

client.initialize();
