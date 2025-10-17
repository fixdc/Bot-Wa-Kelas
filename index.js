const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

// --- KONFIGURASI ---
// ❗ PENTING: Ganti dengan nomor admin Anda, format 62...
const NOMOR_ADMIN = '6281319449299'; 
const LOKASI_FILE_TUGAS = './tugas.txt';
// -------------------

console.log("🤖 Memulai Bot...");

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        // Argumen ini penting agar bisa berjalan di server Linux (Render)
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
    console.log("Silakan Scan QR Code di bawah ini dengan WhatsApp di HP bot Anda:");
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ Bot WhatsApp berhasil terhubung dan siap digunakan!');
});

client.on('message', async (msg) => {
    const text = msg.body.toLowerCase() || '';
    const senderNumber = msg.from.replace('@c.us', '');

    if (text === '.tugas') {
        try {
            const daftarTugas = fs.readFileSync(LOKASI_FILE_TUGAS, 'utf-8');
            msg.reply(daftarTugas.trim() === '' ? "🎉 Hore! Tidak ada tugas." : `📚 *DAFTAR TUGAS*\n\n${daftarTugas}`);
        } catch (error) {
            msg.reply("❌ Gagal mengambil daftar tugas.");
        }
    }

    if (senderNumber === NOMOR_ADMIN && text.startsWith('.update_tugas ')) {
        const kontenTugasBaru = msg.body.substring(14);
        const tugasTerformat = '- ' + kontenTugasBaru.split(';').map(item => item.trim()).join('\n- ');
        try {
            fs.writeFileSync(LOKASI_FILE_TUGAS, tugasTerformat, 'utf-8');
            msg.reply('✅ Daftar tugas berhasil diperbarui!');
        } catch (error) {
            msg.reply('❌ Gagal memperbarui tugas.');
        }
    }
});

client.initialize();