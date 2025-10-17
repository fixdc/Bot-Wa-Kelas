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
const LOKASI_FILE_INFO = './informasi.txt';
const LOKASI_FILE_TODO = './todo.txt';
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

// Teks bantuan
const teksBantuan = `
📖 *DAFTAR PERINTAH BOT* 📖

*Check This Out:*
- *.help* : Menampilkan pesan ini.
- *.tugas* : Melihat daftar tugas kelas.
- *.kas* : Melihat info uang kas.
- *.info* : Melihat informasi penting.
- *.todo* : Melihat to-do list atau agenda.

`;

client.on('message', async (msg) => {
    const text = msg.body.toLowerCase() || '';
    const senderNumber = msg.from.replace('@c.us', '');
    const isAdmin = NOMOR_ADMINS.includes(senderNumber);

    // ==================================================
    // === PERINTAH UNTUK SEMUA ORANG ===
    // ==================================================

    if (text === '.help') {
        msg.reply(teksBantuan);
    }

    if (text === '.tugas') {
        const data = bacaFile(LOKASI_FILE_TUGAS);
        msg.reply(data.trim() === '' ? "🎉 Hore! Tidak ada tugas." : `📚 *DAFTAR TUGAS*\n\n${data}`);
    }

    if (text === '.kas') {
        const data = bacaFile(LOKASI_FILE_KAS);
        msg.reply(data.trim() === '' ? "👍 Mantap! Semua sudah lunas." : `💰 *INFO UANG KAS*\n\nYang belum lunas:\n${data}`);
    }

    if (text === '.info') {
        const data = bacaFile(LOKASI_FILE_INFO);
        msg.reply(data.trim() === '' ? "ℹ️ Belum ada informasi." : `📢 *INFORMASI PENTING*\n\n${data}`);
    }

    if (text === '.todo') {
        const data = bacaFile(LOKASI_FILE_TODO);
        msg.reply(data.trim() === '' ? "✅ Semua agenda selesai." : `📋 *TO-DO LIST & AGENDA*\n\n${data}`);
    }


    // ==================================================
    // === PERINTAH KHUSUS ADMIN ===
    // ==================================================
    if (isAdmin) {
        
        // --- CRUD TUGAS ---
        if (text.startsWith('.tambah_tugas ')) {
            const tugasBaru = msg.body.substring(13);
            const tugasLama = bacaFile(LOKASI_FILE_TUGAS);
            const kontenBaru = `${tugasLama}\n- ${tugasBaru}`.trim();
            fs.writeFileSync(LOKASI_FILE_TUGAS, kontenBaru, 'utf-8');
            msg.reply(`✅ Tugas baru ditambahkan:\n- ${tugasBaru}`);
        }
        if (text.startsWith('.update_tugas ')) {
            const konten = msg.body.substring(14);
            const format = '- ' + konten.split(';').map(item => item.trim()).join('\n- ');
            fs.writeFileSync(LOKASI_FILE_TUGAS, format, 'utf-8');
            msg.reply('✅ Seluruh daftar tugas berhasil diperbarui!');
        }
        if (text === '.hapus_semua_tugas') {
            fs.writeFileSync(LOKASI_FILE_TUGAS, '', 'utf-8');
            msg.reply('🗑️ Semua tugas berhasil dihapus!');
        }

        // --- CRUD KAS ---
        if (text.startsWith('.update_kas ')) {
            const konten = msg.body.substring(12);
            const format = '- ' + konten.split(';').map(item => item.trim()).join('\n- ');
            fs.writeFileSync(LOKASI_FILE_KAS, format, 'utf-8');
            msg.reply('✅ Daftar kas berhasil diperbarui!');
        }
        if (text === '.hapus_kas') {
            fs.writeFileSync(LOKASI_FILE_KAS, '', 'utf-8');
            msg.reply('🗑️ Semua data kas berhasil dihapus!');
        }
        
        // --- CRUD INFO ---
        if (text.startsWith('.update_info ')) {
            const konten = msg.body.substring(13);
            fs.writeFileSync(LOKASI_FILE_INFO, konten, 'utf-8');
            msg.reply('✅ Informasi berhasil diperbarui!');
        }
        if (text === '.hapus_info') {
            fs.writeFileSync(LOKASI_FILE_INFO, '', 'utf-8');
            msg.reply('🗑️ Informasi berhasil dihapus!');
        }

        // --- CRUD TODO ---
        if (text.startsWith('.update_todo ')) {
            const konten = msg.body.substring(13);
            const format = '- ' + konten.split(';').map(item => item.trim()).join('\n- ');
            fs.writeFileSync(LOKASI_FILE_TODO, format, 'utf-8');
            msg.reply('✅ To-do list berhasil diperbarui!');
        }
        if (text === '.hapus_todo') {
            fs.writeFileSync(LOKASI_FILE_TODO, '', 'utf-8');
            msg.reply('🗑️ To-do list berhasil dihapus!');
        }
    }
});

client.initialize();

