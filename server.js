const express = require('express');
const session = require('express-session');
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
const app = express();

// 1. SUPABASE BAĞLANTISI
const supabaseUrl = process.env.SUPABASE_URL || 'https://ravamzdhieateguwcofd.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_HB3Y0BHBJuFar1v8UY0ZbQ_7R0Iv7c8';
const supabase = createClient(supabaseUrl, supabaseKey);

// 2. MIDDLEWARE VE OTURUM AYARLARI
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: 'verytech_gizli_anahtar_123',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(express.static('public'));

// 3. HAZIR GMAIL SMTP ENTEGRASYONU
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, 
    auth: {
        user: 'cinarcikofficial@gmail.com',
        pass: 'twwm cine falf uttx' 
    }
});

// 4. GİRİŞ SAYFASI (LOGIN)
app.get('/', (req, res) => {
    if (req.session.userId) return res.redirect('/dashboard');
    res.send(`
    <!DOCTYPE html>
    <html lang="tr">
    <head>
        <meta charset="UTF-8">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <title>Verytech - Giriş</title>
        <style>
            body { background-color: #0f172a; height: 100vh; display: flex; align-items: center; justify-content: center; font-family: 'Segoe UI', sans-serif; }
            .login-card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 2.5rem; width: 100%; max-width: 400px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); }
            .form-control { background: #0f172a; border-color: #475569; color: #fff; }
            .form-control:focus { background: #0f172a; color: #fff; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.25); }
        </style>
    </head>
    <body>
        <div class="login-card text-center">
            <img src="/verytech_beyaz.png" alt="Verytech" style="height: 45px; margin-bottom: 2rem; object-fit: contain;">
            <form action="/login" method="POST">
                <div class="mb-3 text-start">
                    <label class="form-label text-secondary small fw-bold">Kullanıcı Adı</label>
                    <input type="text" name="username" class="form-control" required autocomplete="off">
                </div>
                <div class="mb-4 text-start">
                    <label class="form-label text-secondary small fw-bold">Şifre</label>
                    <input type="password" name="password" class="form-control" required>
                </div>
                <button type="submit" class="btn btn-primary w-100 fw-bold py-2">Giriş Yap</button>
            </form>
        </div>
    </body>
    </html>`);
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'verytech123') {
        req.session.userId = '1';
        req.session.userName = 'Verytech Yönetici';
        return res.redirect('/dashboard');
    }
    res.send("<script>alert('Hatalı kullanıcı adı veya şifre!'); window.location.href='/';</script>");
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// 5. PANELE GİRİŞ (DASHBOARD)
app.get('/dashboard', async (req, res) => {
    if (!req.session.userId) return res.redirect('/');
    
    const bugun = new Date();

    const { data: tumUrunler, error } = await supabase
        .from('urunler')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return res.status(500).send("Veritabanı hatası: " + error.message);
    }

    const musteriMap = {};
    const memorandaMarka = new Set();
    
    tumUrunler.forEach(u => {
        if(u.musteri_adi) musteriMap[u.musteri_adi] = (musteriMap[u.musteri_adi] || 0) + 1;
        if(u.marka && u.marka.trim() !== "" && u.marka.trim() !== "-") {
            memorandaMarka.add(u.marka.trim());
        }
    });

    let mevcutMusteriSecenekleri = "";
    Object.keys(musteriMap).sort().forEach(m => {
        mevcutMusteriSecenekleri += `<option value="${m}">${m}</option>`;
    });

    let mevcutMarkaSecenekleri = "";
    Array.from(memorandaMarka).sort().forEach(marka => {
        mevcutMarkaSecenekleri += `<option value="${marka}">${marka}</option>`;
    });

    let musteriSatirlari = "";
    const musteriListesi = Object.keys(musteriMap);
    if (musteriListesi.length > 0) {
        musteriListesi.forEach((m, idx) => {
            musteriSatirlari += `
            <tr>
                <td class="fw-bold text-secondary" style="width: 5%;">${idx + 1}</td>
                <td><span class="fw-bold text-dark filter-musteri-btn" style="cursor: pointer;" data-musteri="${m}">🏢 ${m}</span></td>
                <td>
                    <span class="badge bg-blue shadow-sm text-white px-3 py-2 rounded-pill fw-bold filter-musteri-btn" style="background-color: #0284c7; cursor: pointer;" data-musteri="${m}">📊 ${musteriMap[m]} Adet Ürün</span>
                </td>
                <td class="text-end" style="width: 15%;">
                    <span class="btn btn-sm btn-flat-blue fw-bold shadow-sm filter-musteri-btn" data-musteri="${m}">Ürünleri Süz 🔍</span>
                </td>
            </tr>`;
        });
    }

    let urunSatirlari = "";
    if (tumUrunler && tumUrunler.length > 0) {
        tumUrunler.forEach((urun) => {
            const bitisTarihi = new Date(urun.garanti_bitis);
            const t1 = Date.UTC(bugun.getFullYear(), bugun.getMonth(), bugun.getDate());
            const t2 = Date.UTC(bitisTarihi.getFullYear(), bitisTarihi.getMonth(), bitisTarihi.getDate());
            const kalanGun = Math.floor((t2 - t1) / (1000 * 60 * 60 * 24));
            
            let satirSinifi = ""; 
            let durumMetni = `<span class="badge bg-success shadow-sm text-white px-3 py-2 rounded-pill fw-bold" style="background-color: #10b981;">🟢 Güvenli (${kalanGun} Gün)</span>`;
            
            if (kalanGun < 0) { 
                satirSinifi = "table-danger-custom"; 
                durumMetni = `<span class="badge bg-danger shadow-sm text-white px-3 py-2 rounded-pill fw-bold" style="background-color: #ef4444;">🔴 Süre Doldu</span>`; 
            }
            else if (kalanGun <= 30) { 
                satirSinifi = "table-warning-custom"; 
                durumMetni = `<span class="badge bg-warning shadow-sm text-dark px-3 py-2 rounded-pill fw-bold" style="background-color: #f59e0b;">⚠️ Kritik! (${kalanGun} Gün)</span>`; 
            }

            const uAdi = (urun.urun_adi || "").replace(/"/g, '&quot;').replace(/'/g, "&#39;");
            const markaAdi = (urun.marka || "").trim();
            const sNo = (urun.seri_no ||