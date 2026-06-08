const express = require('express');
const session = require('express-session');
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
const app = express();

// 1. SUPABASE BAĞLANTISI (GÜNCEL VERYTECH BAĞLANTILARI)
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
    cookie: { secure: false } // Vercel'de HTTPS altında çalışırken production'da true yapabilirsin
}));

app.use(express.static('public'));

// 🛡️ GÜVENLİK DUVARI (OTURUM KONTROL MIDDLEWARE)
function oturumKontrolu(req, res, next) {
    if (req.session && req.session.userId) {
        return next(); // Oturum geçerliyse bir sonraki sayfaya/işleme izin ver
    }
    // Oturum yoksa direkt giriş sayfasına yönlendir
    res.redirect('/');
}

// 🚀 HAFIZADAN OKUNAN LOGO DEĞİŞKENİ (Base64 Formatı)
const logoUrl = "data:image/png;base64,iVBORw0KGgoAAA..."; 

// 📅 Tarih Formatlama Fonksiyonu
function tarihFormatla(tarihStr) {
    if (!tarihStr) return '-';
    const parcalar = tarihStr.split('-'); 
    if (parcalar.length !== 3) return tarihStr;
    return `${parcalar[2]}.${parcalar[1]}.${parcalar[0]}`; 
}

// 3. NODEMAILER SMTP AYARI
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
            <img src="${logoUrl}" alt="Verytech" style="height: 40px; width: auto; object-fit: contain; margin-bottom: 2rem;">
            <form action="/login" method="POST">
                <div class="mb-3 text-start">
                    <label class="form-label text-secondary small fw-bold">E-Posta Adresi</label>
                    <input type="email" name="email" class="form-control" placeholder="ornek@verytech.com.tr" required autocomplete="off">
                </div>
                <div class="mb-3 text-start">
                    <label class="form-label text-secondary small fw-bold">Şifre</label>
                    <input type="password" name="password" class="form-control" required>
                </div>
                <div class="text-end mb-4">
                    <a href="/sifremi-unuttum" class="text-warning small text-decoration-none fw-semibold">Şifremi Unuttum?</a>
                </div>
                <button type="submit" class="btn btn-primary w-100 fw-bold py-2 mb-3">Giriş Yap</button>
                <div class="text-center">
                    <a href="/kayit-ol" class="text-info small text-decoration-none fw-semibold">✨ Verytech Çalışanı mısınız? Kayıt Olun</a>
                </div>
            </form>
        </div>
    </body>
    </html>`);
});

// GİRİŞ KONTROLÜ
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const temizEmail = (email || "").trim().toLowerCase();

    const { data: user, error } = await supabase
        .from('kullanicilar')
        .select('*')
        .eq('email', temizEmail)
        .eq('aktif_mi', true)
        .single();

    if (error || !user || user.sifre !== password) {
        return res.send("<script>alert('Hatalı e-posta, şifre veya onaylanmamış hesap!'); window.location.href='/';</script>");
    }

    req.session.userId = user.id;
    const isimParçası = temizEmail.split('@')[0]; 
    req.session.userName = isimParçası.charAt(0).toUpperCase() + isimParçası.slice(1); 
    res.redirect('/dashboard');
});

// ŞİFREMİ UNUTTUM EKRANI
app.get('/sifremi-unuttum', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="tr">
    <head>
        <meta charset="UTF-8">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <title>Verytech - Şifremi Unuttum</title>
        <style>
            body { background-color: #0f172a; height: 100vh; display: flex; align-items: center; justify-content: center; font-family: 'Segoe UI', sans-serif; }
            .login-card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 2.5rem; width: 100%; max-width: 400px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); }
            .form-control { background: #0f172a; border-color: #475569; color: #fff; }
        </style>
    </head>
    <body>
        <div class="login-card text-center">
            <img src="${logoUrl}" alt="Verytech" style="height: 30px; margin-bottom: 2rem;">
            <h5 class="text-white fw-bold mb-3">Şifremi Unuttum</h5>
            <p class="text-secondary small mb-4">Şifrenizi sıfırlamak için @verytech.com.tr uzantılı mail adresinizi girin.</p>
            <form action="/sifremi-unuttum" method="POST">
                <div class="mb-4 text-start">
                    <label class="form-label text-secondary small fw-bold">E-Posta Adresi</label>
                    <input type="email" name="email" class="form-control" placeholder="ad.soyad@verytech.com.tr" required>
                </div>
                <button type="submit" class="btn btn-warning text-dark w-100 fw-bold py-2 mb-3">Şifre Sıfırlama Kodu Gönder ✉️</button>
                <a href="/" class="text-secondary small text-decoration-none">Geri Dön</a>
            </form>
        </div>
    </body>
    </html>`);
});

// ŞİFREMİ UNUTTUM - KOD GÖNDERME İŞLEMİ
app.post('/sifremi-unuttum', async (req, res) => {
    const { email } = req.body;
    const temizEmail = (email || "").trim().toLowerCase();

    if (!temizEmail.endsWith('@verytech.com.tr')) {
        return res.send("<script>alert('Sadece @verytech.com.tr uzantılı e-postalar işlem yapabilir!'); history.back();</script>");
    }

    const { data: mevcut, error: bulmaHatasi } = await supabase
        .from('kullanicilar')
        .select('*')
        .eq('email', temizEmail)
        .single();

    if (bulmaHatasi || !mevcut) {
        return res.send("<script>alert('Bu e-posta adresi sistemde kayıtlı görünmüyor!'); history.back();</script>");
    }

    const dogrulamaKodu = Math.floor(100000 + Math.random() * 900000).toString();

    const { error: guncellemeHatasi } = await supabase
        .from('kullanicilar')
        .update({ dogrulama_kodu: dogrulamaKodu })
        .eq('email', temizEmail);

    if (guncellemeHatasi) return res.status(500).send("Veritabanı Hatası: " + guncellemeHatasi.message);

    try {
        await transporter.sendMail({
            from: '"Verytech Garanti Takip Sistemi" <cinarcikofficial@gmail.com>',
            to: temizEmail,
            subject: '🔒 Verytech Şifre Sıfırlama Onay Kodu',
            html: `<h3>Verytech Garanti Takip Sistemi</h3><p>Şifrenizi güvenli bir şekilde sıfırlamak için kullanacağınız tek kullanımlık onay kodu aşağıdadır:</p><h2 style="color:#f59e0b; letter-spacing:4px;">${dogrulamaKodu}</h2><p>Eğer bu talebi siz yapmadıysanız bu maili dikkate almayınız.</p>`
        });
        
        res.redirect(`/kod-onayla?email=${encodeURIComponent(temizEmail)}`);
    } catch (mailErr) {
        res.send("<script>alert('Mail gönderme hatası oluştu: " + mailErr.message + "'); history.back();</script>");
    }
});

// YENİ KULLANICI KAYIT EKRANI
app.get('/kayit-ol', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="tr">
    <head>
        <meta charset="UTF-8">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <title>Verytech - Yeni Çalışan Kaydı</title>
        <style>
            body { background-color: #0f172a; height: 100vh; display: flex; align-items: center; justify-content: center; font-family: 'Segoe UI', sans-serif; }
            .login-card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 2.5rem; width: 100%; max-width: 400px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); }
            .form-control { background: #0f172a; border-color: #475569; color: #fff; }
        </style>
    </head>
    <body>
        <div class="login-card text-center">
            <img src="${logoUrl}" alt="Verytech" style="height: 30px; margin-bottom: 2rem;">
            <h5 class="text-white fw-bold mb-3">Çalışan Kayıt Paneli</h5>
            <p class="text-secondary small mb-4">Sadece @verytech.com.tr uzantılı mailler ile kayıt yapılabilir. Mailinize bir doğrulama kodu gönderilecektir.</p>
            <form action="/kayit-ol" method="POST">
                <div class="mb-4 text-start">
                    <label class="form-label text-secondary small fw-bold">Kurumsal E-Posta</label>
                    <input type="email" name="email" class="form-control" placeholder="ad.soyad@verytech.com.tr" required>
                </div>
                <button type="submit" class="btn btn-info text-white w-100 fw-bold py-2 mb-3">Doğrulama Kodu Gönder ✉️</button>
                <a href="/" class="text-secondary small text-decoration-none">Geri Dön</a>
            </form>
        </div>
    </body>
    </html>`);
});

app.post('/kayit-ol', async (req, res) => {
    const { email } = req.body;
    const temizEmail = (email || "").trim().toLowerCase();

    if (!temizEmail.endsWith('@verytech.com.tr')) {
        return res.send("<script>alert('Sadece @verytech.com.tr uzantılı e-postalar kayıt olabilir!'); history.back();</script>");
    }

    const dogrulamaKodu = Math.floor(100000 + Math.random() * 900000).toString();
    const userId = Date.now().toString();

    const { data: mevcut } = await supabase.from('kullanicilar').select('*').eq('email', temizEmail).single();

    let dbError;
    if (mevcut) {
        const { error } = await supabase.from('kullanicilar').update({ dogrulama_kodu: dogrulamaKodu }).eq('email', temizEmail);
        dbError = error;
    } else {
        const { error } = await supabase.from('kullanicilar').insert([{ id: userId, email: temizEmail, dogrulama_kodu: dogrulamaKodu, aktif_mi: false }]);
        dbError = error;
    }

    if (dbError) return res.status(500).send("Veritabanı Hatası: " + dbError.message);

    try {
        await transporter.sendMail({
            from: '"Verytech Garanti Takip Sistemi" <cinarcikofficial@gmail.com>',
            to: temizEmail,
            subject: '🔑 Verytech Sistem Giriş Onay Kodu',
            html: `<h3>Verytech Garanti Takip Sistemi</h3><p>Sisteme kayıt olabilmek veya şifrenizi yenilemek için kullanacağınız tek kullanımlık onay kodu aşağıdadır:</p><h2 style="color:#0284c7; letter-spacing:4px;">${dogrulamaKodu}</h2><p>Bu kodu kimseyle paylaşmayınız.</p>`
        });
        res.redirect(`/kod-onayla?email=${encodeURIComponent(temizEmail)}`);
    } catch (mailErr) {
        res.send("<script>alert('Mail gönderme hatası oluştu: " + mailErr.message + "'); history.back();</script>");
    }
});

// KOD ONAY EKRANI
app.get('/kod-onayla', (req, res) => {
    const { email } = req.query;
    res.send(`
    <!DOCTYPE html>
    <html lang="tr">
    <head>
        <meta charset="UTF-8">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <title>Verytech - Kod Onay</title>
        <style>
            body { background-color: #0f172a; height: 100vh; display: flex; align-items: center; justify-content: center; font-family: 'Segoe UI', sans-serif; }
            .login-card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 2.5rem; width: 100%; max-width: 400px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); }
            .form-control { background: #0f172a; border-color: #475569; color: #fff; text-align:center; font-size: 20px; letter-spacing: 5px; }
        </style>
    </head>
    <body>
        <div class="login-card text-center">
            <h5 class="text-white fw-bold mb-3">Onay Kodunu Girin</h5>
            <p class="text-secondary small mb-4"><b>${email}</b> adresine gönderilen 6 haneli kodu yazın.</p>
            <form action="/kod-onayla" method="POST">
                <input type="hidden" name="email" value="${email}">
                <div class="mb-4">
                    <input type="text" name="kod" class="form-control" maxlength="6" required autocomplete="off" placeholder="000000">
                </div>
                <button type="submit" class="btn btn-success w-100 fw-bold py-2">Kodu Doğrula ✅</button>
            </form>
        </div>
    </body>
    </html>`);
});

app.post('/kod-onayla', async (req, res) => {
    const { email, kod } = req.body;
    
    const { data: user, error } = await supabase
        .from('kullanicilar')
        .select('*')
        .eq('email', email)
        .single();

    if (error || !user || user.dogrulama_kodu !== kod.trim()) {
        return res.send("<script>alert('Girdiğiniz onay kodu hatalı!'); history.back();</script>");
    }

    res.redirect(`/sifre-belirle?email=${encodeURIComponent(email)}&token=${kod}`);
});

// YENİ ŞİFRE BELİRLEME EKRANI
app.get('/sifre-belirle', (req, res) => {
    const { email, token } = req.query;
    res.send(`
    <!DOCTYPE html>
    <html lang="tr">
    <head>
        <meta charset="UTF-8">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <title>Verytech - Şifre Belirle</title>
        <style>
            body { background-color: #0f172a; height: 100vh; display: flex; align-items: center; justify-content: center; font-family: 'Segoe UI', sans-serif; }
            .login-card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 2.5rem; width: 100%; max-width: 400px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); }
            .form-control { background: #0f172a; border-color: #475569; color: #fff; }
        </style>
    </head>
    <body>
        <div class="login-card text-center">
            <h5 class="text-white fw-bold mb-3">Yeni Şifre Oluştur</h5>
            <p class="text-secondary small mb-4">Sisteme girerken kullanacağınız güvenli bir şifre belirleyin.</p>
            <form action="/sifre-belirle" method="POST">
                <input type="hidden" name="email" value="${email}">
                <input type="hidden" name="token" value="${token}">
                <div class="mb-4 text-start">
                    <label class="form-label text-secondary small fw-bold">Yeni Şifre</label>
                    <input type="password" name="password" class="form-control" required placeholder="••••••">
                </div>
                <button type="submit" class="btn btn-primary w-100 fw-bold py-2">Şifreyi Kaydet ve Giriş Yap 🚀</button>
            </form>
        </div>
    </body>
    </html>`);
});

app.post('/sifre-belirle', async (req, res) => {
    const { email, token, password } = req.body;

    const { data: user } = await supabase.from('kullanicilar').select('*').eq('email', email).single();

    if (!user || user.dogrulama_kodu !== token) {
        return res.send("<script>alert('Güvenlik doğrulaması başarısız!'); window.location.href='/';</script>");
    }

    const { error } = await supabase
        .from('kullanicilar')
        .update({ sifre: password, aktif_mi: true, dogrulama_kodu: null })
        .eq('email', email);

    if (error) return res.status(500).send("Şifre Kayıt Hatası: " + error.message);

    req.session.userId = user.id;
    const isimParçası = email.split('@')[0]; 
    req.session.userName = isimParçası.charAt(0).toUpperCase() + isimParçası.slice(1); 

    res.send("<script>alert('Şifreniz başarıyla güncellendi! Sisteme giriş yapılıyor...'); window.location.href='/dashboard';</script>");
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});


// 🔒 BU HİZADAN SONRAKİ TÜM YÖNETİM GRUBU ROTARLARI MIDDLEWARE İLE GÜVENDE!

// DASHBOARD EKRANI
app.get('/dashboard', oturumKontrolu, async (req, res) => {
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
                <td><a href="/detay?type=musteri&q=${encodeURIComponent(m)}" class="fw-bold text-dark text-decoration-none" style="cursor: pointer;">🏢 ${m}</a></td>
                <td>
                    <a href="/detay?type=musteri&q=${encodeURIComponent(m)}" class="badge bg-blue shadow-sm text-white px-3 py-2 rounded-pill fw-bold text-decoration-none" style="background-color: #0284c7; display: inline-block;">📊 ${musteriMap[m]} Adet Ürün</a>
                </td>
                <td class="text-end" style="width: 15%;">
                    <a href="/detay?type=musteri&q=${encodeURIComponent(m)}" class="btn btn-sm btn-flat-blue fw-bold shadow-sm">Ayrı Sayfada Gör 📂</a>
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
            const sNo = (urun.seri_no || "").replace(/"/g, '&quot;').replace(/'/g, "&#39;");
            const mAdi = (urun.musteri_adi || "").replace(/"/g, '&quot;').replace(/'/g, "&#39;");

            let markaGosterim = `<span class="text-muted fw-normal">-</span>`;
            if (markaAdi && markaAdi !== "-") {
                markaGosterim = `<a href="/detay?type=marka&q=${encodeURIComponent(markaAdi)}" class="badge shadow-sm text-white px-3 py-1.5 rounded fw-bold text-decoration-none" style="background-color: #6d28d9; display: inline-block;" title="Bu markayı ayrı sayfada gör">${markaAdi}</a>`;
            }

            urunSatirlari += `
            <tr class="${satirSinifi}">
                <td><a href="/detay?type=musteri&q=${encodeURIComponent(urun.musteri_adi || '')}" class="text-dark fw-bold text-decoration-none">🏢 ${urun.musteri_adi || ''}</a></td>
                <td>${markaGosterim}</td>
                <td><b class="text-secondary">${urun.urun_adi || ''}</b></td>
                <td><code class="text-primary fw-semibold">${urun.seri_no || ''}</code></td>
                <td data-order="${urun.garanti_baslangic || ''}" class="text-muted">${tarihFormatla(urun.garanti_baslangic)}</td>
                <td data-order="${urun.garanti_bitis || ''}" class="fw-semibold">${tarihFormatla(urun.garanti_bitis)}</td>
                <td data-order="${kalanGun}">${durumMetni}</td>
                <td class="text-end text-nowrap">
                    <button class="btn btn-sm btn-outline-purple fw-bold me-1 j-duzenle" 
                            data-id="${urun.id}" 
                            data-urun="${uAdi}" 
                            data-marka="${markaAdi}"
                            data-seri="${sNo}" 
                            data-musteri="${mAdi}" 
                            data-baslangic="${urun.garanti_baslangic}" 
                            data-bitis="${urun.garanti_bitis}">✏️ Düzenle</button>
                    <button class="btn btn-sm btn-outline-danger fw-bold j-sil" data-id="${urun.id}">🗑️ Sil</button>
                </td>
            </tr>`;
        });
    }

    res.send(`
    <!DOCTYPE html>
    <html lang="tr">
    <head>
        <meta charset="UTF-8">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <link href="https://cdn.datatables.net/1.13.6/css/dataTables.bootstrap5.min.css" rel="stylesheet">
        <script src="https://code.jquery.com/jquery-3.7.0.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
        <script src="https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js"></script>
        <script src="https://cdn.datatables.net/1.13.6/js/dataTables.bootstrap5.min.js"></script>
        <title>Verytech - Yönetim Paneli</title>
        <style>
            body { background-color: #f1f5f9; font-family: 'Segoe UI', sans-serif; }
            th { font-weight: 600; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px; }
            .card-custom-green { border: 1px solid #cbf3d6; border-left: 6px solid #10b981; background-color: #f0fdf4; border-radius: 12px; }
            .card-custom-blue { border: 1px solid #bae6fd; border-left: 6px solid #0284c7; background-color: #f0f9ff; border-radius: 12px; }
            .card-custom-purple { border: 1px solid #e9d5ff; border-left: 6px solid #6d28d9; background-color: #faf5ff; border-radius: 12px; }
            .card-custom-blue .table, .card-custom-blue .table tr, .card-custom-blue .table td { background-color: #f0f9ff !important; border-color: #e0f2fe !important; }
            .card-custom-purple .table, .card-custom-purple .table tr, .card-custom-purple .table td { background-color: #faf5ff !important; border-color: #f3e8ff !important; }
            .table-light th { background-color: rgba(0, 0, 0, 0.04) !important; color: #334155 !important; border-bottom: 2px solid rgba(0,0,0,0.08) !important; }
            .btn-outline-purple { color: #6d28d9; border-color: #6d28d9; background-color: #ffffff; }
            .btn-outline-purple:hover { color: #fff; background-color: #6d28d9; border-color: #6d28d9; }
            .btn-flat-blue { color: #0284c7; background-color: #ffffff; border: 1px solid #0284c7; }
            .btn-flat-blue:hover { color: #ffffff; background-color: #0284c7; }
            .navbar-custom { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); }
            .form-control, .form-select { border-color: #cbd5e1; padding: 0.6rem 0.75rem; font-size: 14px; border-radius: 8px; }
        </style>
    </head>
    <body>
    
    <nav class="navbar navbar-dark navbar-custom px-4 py-3 mb-4 d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center gap-3">
            <img src="${logoUrl}" alt="Verytech" style="height: 32px; width: auto; object-fit: contain;" />
            <div style="width: 1px; height: 25px; background: rgba(255,255,255,0.2);"></div>
            <a href="/dashboard" class="navbar-brand fw-bold m-0" style="letter-spacing: 1.5px; font-size: 16px;">GARANTİ TAKİP SİSTEMİ</a>
        </div>
        <span class="text-white small bg-secondary bg-opacity-25 px-3 py-1.5 rounded-pill">🔒 Kullanıcı: <b>${req.session.userName}</b> | <a href="/logout" class="text-warning text-decoration-none fw-bold ms-2">Çıkış</a></span>
    </nav>
    
    <div class="container-fluid px-4">
        <div class="card card-custom-green p-4 mb-4">
            <h5 class="text-success fw-bold mb-4">🟢 Yeni Satılan Ürün Kaydı</h5>
            <form action="/urun-ekle" method="POST">
                <div class="row g-3 align-items-end">
                    <div class="col-xl-3 col-md-6">
                        <div class="d-flex align-items-center mb-2">
                            <label class="form-label small fw-bold mb-0 me-3 text-secondary">Müşteri / Şirket</label>
                            <div class="d-flex gap-3">
                                <div class="form-check m-0"><input class="form-check-input" type="radio" name="musteri_tipi" id="tipMevcut" value="mevcut" checked onclick="musteriFormuDegistir()"><label class="form-check-label small fw-semibold text-dark" for="tipMevcut">Kayıtlı</label></div>
                                <div class="form-check m-0"><input class="form-check-input" type="radio" name="musteri_tipi" id="tipYeni" value="yeni" onclick="musteriFormuDegistir()"><label class="form-check-label small fw-semibold text-dark" for="tipYeni">Yeni</label></div>
                            </div>
                        </div>
                        <div id="mevcutMusteriAlani"><select name="mevcut_musteri" class="form-select"><option value="">-- Şirket Seçin --</option>${mevcutMusteriSecenekleri}</select></div>
                        <div id="yeniMusteriAlani" style="display:none;"><input type="text" name="yeni_musteri" class="form-control" placeholder="Yeni Şirket Adı Girin"></div>
                    </div>
                    
                    <div class="col-xl-2 col-md-6">
                        <div class="d-flex align-items-center mb-2">
                            <label class="form-label small fw-bold mb-0 me-3 text-secondary">Marka</label>
                            <div class="d-flex gap-3">
                                <div class="form-check m-0"><input class="form-check-input" type="radio" name="marka_tipi" id="markaMevcut" value="mevcut" checked onclick="markaFormuDegistir()"><label class="form-check-label small fw-semibold text-dark" for="markaMevcut">Kayıtlı</label></div>
                                <div class="form-check m-0"><input class="form-check-input" type="radio" name="marka_tipi" id="markaYeni" value="yeni" onclick="markaFormuDegistir()"><label class="form-check-label small fw-semibold text-dark" for="markaYeni">Yeni</label></div>
                            </div>
                        </div>
                        <div id="mevcutMarkaAlani"><select name="mevcut_marka" class="form-select"><option value="">-- Marka Seçin --</option>${mevcutMarkaSecenekleri}</select></div>
                        <div id="yeniMarkaAlani" style="display:none;"><input type="text" name="yeni_marka" class="form-control" placeholder="Örn: Cisco"></div>
                    </div>

                    <div class="col-xl-2 col-md-4 col-sm-6"><label class="form-label small fw-bold text-secondary">Ürün Adı</label><input type="text" name="urun_adi" class="form-control" placeholder="Örn: Switch" required></div>
                    <div class="col-xl-1 col-md-4 col-sm-6"><label class="form-label small fw-bold text-secondary">Seri No</label><input type="text" name="seri_no" class="form-control" placeholder="Örn: SN-55" required></div>
                    <div class="col-xl-2 col-md-4 col-sm-6"><label class="form-label small fw-bold text-secondary">Garanti Başlangıç</label><input type="date" name="garanti_baslangic" class="form-control" required></div>
                    <div class="col-xl-2 col-md-4 col-sm-6"><label class="form-label small fw-bold text-secondary">Garanti Bitiş</label><input type="date" name="garanti_bitis" class="form-control" required></div>
                    <div class="col-12 text-end mt-4"><button type="submit" class="btn btn-success px-5 fw-bold shadow-sm rounded-3 py-2">Sisteme Kaydet</button></div>
                </div>
            </form>
        </div>

        <div class="card card-custom-blue p-4 mb-4">
            <h5 class="fw-bold mb-4" style="color: #0284c7;">🔵 Kayıtlı Müşteri Özet Listesi</h5>
            <div class="table-responsive">
                <table id="musteriTablosu" class="table align-middle table-hover w-100 m-0">
                    <thead class="table-light">
                        <tr><th>No</th><th>Şirket Adı</th><th>Toplam Ürün Miktarı</th><th class="text-end">İşlem</th></tr>
                    </thead>
                    <tbody>${musteriSatirlari}</tbody>
                </table>
            </div>
        </div>

        <div class="card card-custom-purple p-4 mb-4">
            <h5 class="fw-bold mb-4" style="color:#6d28d9;">🟣 Garanti Detay Listesi (Tüm Ürünler)</h5>
            <div class="table-responsive">
                <table id="genelUrunTablosu" class="table align-middle table-hover w-100 m-0">
                    <thead class="table-light">
                        <tr><th>Müşteri / Şirket</th><th>Marka</th><th>Ürün Adı</th><th>Seri No</th><th>Başlangıç Tarihi</th><th>Bitiş Tarihi</th><th>Garanti Durumu</th><th class="text-end">İşlemler</th></tr>
                    </thead>
                    <tbody>${urunSatirlari}</tbody>
                </table>
            </div>
        </div>
    </div>

    <div class="modal fade" id="duzenleModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <form action="/urun-duzenle" method="POST" class="modal-content style-radius">
          <div class="modal-header navbar-custom text-white py-3"><h5 class="modal-title fw-bold fs-6">✏️ Ürün Düzenle</h5><button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button></div>
          <div class="modal-body p-4">
                <input type="hidden" name="id" id="edit_id">
                <div class="mb-3"><label class="form-label fw-bold small text-secondary">Müşteri / Şirket</label><input type="text" name="musteri_adi" id="edit_musteri_adi" class="form-control" required></div>
                <div class="mb-3"><label class="form-label fw-bold small text-secondary">Marka</label><input type="text" name="edit_marka" id="edit_marka" class="form-control"></div>
                <div class="mb-3"><label class="form-label fw-bold small text-secondary">Ürün Adı</label><input type="text" name="urun_adi" id="edit_urun_adi" class="form-control" required></div>
                <div class="mb-3"><label class="form-label fw-bold small text-secondary">Seri No</label><input type="text" name="seri_no" id="edit_seri_no" class="form-control" required></div>
                <div class="mb-3"><label class="form-label fw-bold small text-secondary">Garanti Başlangıç</label><input type="date" name="garanti_baslangic" id="edit_garanti_baslangic" class="form-control" required></div>
                <div class="mb-3"><label class="form-label fw-bold small text-secondary">Garanti Bitiş</label><input type="date" name="garanti_bitis" id="edit_garanti_bitis" class="form-control" required></div>
          </div>
          <div class="modal-footer bg-light"><button type="button" class="btn btn-sm btn-secondary fw-bold px-3" data-bs-dismiss="modal">Vazgeç</button><button type="submit" class="btn btn-sm btn-primary fw-bold px-4">Kaydet</button></div>
        </form>
      </div>
    </div>

    <script>
        function musteriFormuDegistir() {
            if (document.getElementById('tipMevcut').checked) {
                document.getElementById('mevcutMusteriAlani').style.display = 'block';
                document.getElementById('yeniMusteriAlani').style.display = 'none';
            } else {
                document.getElementById('mevcutMusteriAlani').style.display = 'none';
                document.getElementById('yeniMusteriAlani').style.display = 'block';
            }
        }
        function markaFormuDegistir() {
            if (document.getElementById('markaMevcut').checked) {
                document.getElementById('mevcutMarkaAlani').style.display = 'block';
                document.getElementById('yeniMarkaAlani').style.display = 'none';
            } else {
                document.getElementById('mevcutMarkaAlani').style.display = 'none';
                document.getElementById('yeniMarkaAlani').style.display = 'block';
            }
        }

        $(document).ready(function() {
            $('#musteriTablosu').DataTable({ "language": { "url": "https://cdn.datatables.net/plug-ins/1.13.6/i18n/tr.json" }, "paging": true, "pageLength": 5, "lengthChange": false, "info": false });
            $('#genelUrunTablosu').DataTable({ "language": { "url": "https://cdn.datatables.net/plug-ins/1.13.6/i18n/tr.json" }, "order": [[ 5, "asc" ]], "paging": true, "pageLength": 10, "info": false });
            
            $('#genelUrunTablosu').on('click', '.j-duzenle', function() {
                var btn = $(this);
                document.getElementById('edit_id').value = btn.attr('data-id');
                document.getElementById('edit_musteri_adi').value = btn.attr('data-musteri');
                document.getElementById('edit_marka').value = btn.attr('data-marka');
                document.getElementById('edit_urun_adi').value = btn.attr('data-urun');
                document.getElementById('edit_seri_no').value = btn.attr('data-seri');
                document.getElementById('edit_garanti_baslangic').value = btn.attr('data-baslangic');
                document.getElementById('edit_garanti_bitis').value = btn.attr('data-bitis');
                new bootstrap.Modal(document.getElementById('duzenleModal')).show();
            });
            $('#genelUrunTablosu').on('click', '.j-sil', function() {
                var id = $(this).attr('data-id');
                if (confirm('Bu ürünü silmek istediğinize emin misiniz?')) { window.location.href = '/urun-sil/' + id; }
            });
        });
    </script>
    </body>
    </html>`);
});

// FILTRE DETAY SAYFASI
app.get('/detay', oturumKontrolu, async (req, res) => {
    const { type, q } = req.query;
    if (!type || !q) return res.redirect('/dashboard');

    const bugun = new Date();
    let queryBuilder = supabase.from('urunler').select('*');

    if (type === 'musteri') {
        queryBuilder = queryBuilder.eq('musteri_adi', q);
    } else if (type === 'marka') {
        queryBuilder = queryBuilder.eq('marka', q);
    }

    const { data: filtrelenmisUrunler, error } = await queryBuilder.order('garanti_bitis', { ascending: true });

    if (error) return res.status(500).send("Detay getirme hatası: " + error.message);

    let filtreBaslik = type === 'musteri' ? `🏢 ${q} Şirketine Ait Cihazlar` : `🍇 ${q} Markalı Tüm Cihazlar`;

    let detaySatirlari = "";
    filtrelenmisUrunler.forEach((urun) => {
        const bitisTarihi = new Date(urun.garanti_bitis);
        const t1 = Date.UTC(bugun.getFullYear(), bugun.getMonth(), bugun.getDate());
        const t2 = Date.UTC(bitisTarihi.getFullYear(), bitisTarihi.getMonth(), bitisTarihi.getDate());
        const kalanGun = Math.floor((t2 - t1) / (1000 * 60 * 60 * 24));
        
        let satirSinifi = ""; 
        let durumMetni = `<span class="badge bg-success px-3 py-2 rounded-pill fw-bold" style="background-color: #10b981;">🟢 Güvenli (${kalanGun} Gün)</span>`;
        
        if (kalanGun < 0) { 
            satirSinifi = "table-danger-custom"; 
            durumMetni = `<span class="badge bg-danger px-3 py-2 rounded-pill fw-bold" style="background-color: #ef4444;">🔴 Süre Doldu</span>`; 
        }
        else if (kalanGun <= 30) { 
            satirSinifi = "table-warning-custom"; 
            durumMetni = `<span class="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold" style="background-color: #f59e0b;">⚠️ Kritik! (${kalanGun} Gün)</span>`; 
        }

        detaySatirlari += `
        <tr class="${satirSinifi}">
            <td><b>${urun.musteri_adi}</b></td>
            <td><span class="badge text-white px-3 py-1.5 rounded fw-bold" style="background-color: #6d28d9;">${urun.marka || '-'}</span></td>
            <td>${urun.urun_adi}</td>
            <td><code>${urun.seri_no}</code></td>
            <td data-order="${urun.garanti_baslangic || ''}" class="text-muted">${tarihFormatla(urun.garanti_baslangic)}</td>
            <td data-order="${urun.garanti_bitis || ''}" class="fw-semibold">${tarihFormatla(urun.garanti_bitis)}</td>
            <td>${durumMetni}</td>
        </tr>`;
    });

    res.send(`
    <!DOCTYPE html>
    <html lang="tr">
    <head>
        <meta charset="UTF-8">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <link href="https://cdn.datatables.net/1.13.6/css/dataTables.bootstrap5.min.css" rel="stylesheet">
        <script src="https://code.jquery.com/jquery-3.7.0.min.js"></script>
        <script src="https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js"></script>
        <script src="https://cdn.datatables.net/1.13.6/js/dataTables.bootstrap5.min.js"></script>
        <title>Verytech - Özel Filtre Detay Sayfası</title>
        <style>
            body { background-color: #f1f5f9; font-family: 'Segoe UI', sans-serif; }
            .navbar-custom { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); }
            .card-detay { border-top: 6px solid #6d28d9; border-radius: 12px; }
            .table-warning-custom, .table-warning-custom td { background-color: #fefce8 !important; }
            .table-danger-custom, .table-danger-custom td { background-color: #fef2f2 !important; }
        </style>
    </head>
    <body>
    <nav class="navbar navbar-dark navbar-custom px-4 py-3 mb-4 d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center gap-3">
            <img src="${logoUrl}" alt="Verytech" style="height: 32px; width: auto; object-fit: contain;" />
            <div style="width: 1px; height: 25px; background: rgba(255,255,255,0.2);"></div>
            <span class="navbar-brand fw-bold m-0" style="font-size: 16px;">DETAYLI FİLTRE RAPORU</span>
        </div>
        <a href="/dashboard" class="btn btn-sm btn-light fw-bold px-3 shadow-sm">⬅️ Ana Panele Dön</a>
    </nav>
    <div class="container-fluid px-4">
        <div class="card card-detay bg-white p-4">
            <h4 class="fw-bold mb-4 text-dark">${filtreBaslik}</h4>
            <div class="table-responsive">
                <table id="detayTablo" class="table align-middle table-hover w-100">
                    <thead class="table-light">
                        <tr><th>Müşteri</th><th>Marka</th><th>Ürün Adı</th><th>Seri No</th><th>Başlangıç</th><th>Bitiş</th><th>Durum</th></tr>
                    </thead>
                    <tbody>
                        ${detaySatirlari || '<tr><td colspan="7" class="text-center text-muted">Kayıtlı ürün bulunamadı.</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    <script>
        $(document).ready(function() {
            $('#detayTablo').DataTable({ "language": { "url": "https://cdn.datatables.net/plug-ins/1.13.6/i18n/tr.json" }, "paging": true, "info": false });
        });
    </script>
    </body>
    </html>`);
});

app.post('/urun-ekle', oturumKontrolu, async (req, res) => {
    let musteriAdi = "";
    if (req.body.musteri_tipi === "mevcut") {
        musteriAdi = req.body.mevcut_musteri;
    } else {
        musteriAdi = req.body.yeni_musteri ? req.body.yeni_musteri.trim() : "";
    }

    let markaAdi = "-";
    if (req.body.marka_tipi === "mevcut") {
        markaAdi = req.body.mevcut_marka || "-";
    } else {
        markaAdi = req.body.yeni_marka ? req.body.yeni_marka.trim() : "-";
    }

    const { urun_adi, seri_no, garanti_baslangic, garanti_bitis } = req.body;

    if (!musteriAdi || !urun_adi) {
        return res.send("<script>alert('Lütfen gerekli alanları doldurun!'); history.back();</script>");
    }

    const { error } = await supabase
        .from('urunler')
        .insert([
            { 
                id: Date.now().toString(), 
                musteri_adi: musteriAdi, 
                marka: markaAdi, 
                urun_adi: urun_adi, 
                seri_no: seri_no, 
                garanti_baslangic: garanti_baslangic, 
                garanti_bitis: garanti_bitis 
            }
        ]);

    if (error) return res.status(500).send("Ekleme Hatası: " + error.message);
    res.redirect('/dashboard');
});

app.post('/urun-duzenle', oturumKontrolu, async (req, res) => {
    const { id, musteri_adi, edit_marka, urun_adi, seri_no, garanti_baslangic, garanti_bitis } = req.body;

    const { error } = await supabase
        .from('urunler')
        .update({ 
            musteri_adi: musteri_adi, 
            marka: edit_marka || "-", 
            urun_adi: urun_adi, 
            seri_no: seri_no, 
            garanti_baslangic: garanti_baslangic, 
            garanti_bitis: garanti_bitis 
        })
        .eq('id', id);

    if (error) return res.status(500).send("Güncelleme Hatası: " + error.message);
    res.redirect('/dashboard');
});

app.get('/urun-sil/:id', oturumKontrolu, async (req, res) => {
    const id = req.params.id;

    const { error } = await supabase
        .from('urunler')
        .delete()
        .eq('id', id);

    if (error) return res.status(500).send("Silme Hatası: " + error.message);
    res.redirect('/dashboard');
});

// CRON OTOMASYON RAPORU ROTASI
app.get('/api/cron/garanti-kontrol', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (process.env.NODE_ENV === 'production' && process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ success: false, message: 'Yetkisiz erişim.' });
    }

    try {
        const bugun = new Date();
        const { data: tumUrunler, error } = await supabase.from('urunler').select('*');
        if (error) throw error;

        let mailIcerik = `<h3>Verytech Garanti ve Bakım Raporu</h3><p>Merhaba, sistem taraması sonucunda durumları kritik olan cihaz listesi aşağıdadır:</p><table border="1" cellpadding="8" style="border-collapse:collapse;"><thead><tr style="background:#f1f5f9;"><th>Müşteri</th><th>Marka/Ürün</th><th>Seri No</th><th>Bitiş Tarihi</th><th>Kalan Gün</th></tr></thead><tbody>`;
        let mailGonderilecekMi = false;

        tumUrunler.forEach((urun) => {
            const bitisTarihi = new Date(urun.garanti_bitis);
            const t1 = Date.UTC(bugun.getFullYear(), bugun.getMonth(), bugun.getDate());
            const t2 = Date.UTC(bitisTarihi.getFullYear(), bitisTarihi.getMonth(), bitisTarihi.getDate());
            const kalanGun = Math.floor((t2 - t1) / (1000 * 60 * 60 * 24));

            if (kalanGun === 60 || kalanGun <= 30) {
                mailGonderilecekMi = true;
                let durumRengi = kalanGun < 0 ? "red" : (kalanGun <= 30 ? "orange" : "blue");
                mailIcerik += `<tr><td><b>${urun.musteri_adi}</b></td><td>${urun.marka} - ${urun.urun_adi}</td><td><code>${urun.seri_no}</code></td><td>${tarihFormatla(urun.garanti_bitis)}</td><td style="color:${durumRengi}; font-weight:bold;">${kalanGun < 0 ? 'Süresi Doldu' : kalanGun + ' Gün'}</td></tr>`;
            }
        });

        mailIcerik += `</tbody></table><br><p>Sisteme erişmek için Vercel panelinizi kullanabilirsiniz.</p>`;

        if (mailGonderilecekMi) {
            await transporter.sendMail({
                from: '"Verytech Garanti Takip Sistemi" <cinarcikofficial@gmail.com>',
                to: 'kerim.kaplan@verytech.com.tr',
                subject: '🚨 Verytech Garanti ve Bakım Bildirimi',
                html: mailIcerik
            });
            return res.json({ success: true, message: 'Kritik durumlar tespit edildi, mail gönderildi.' });
        }
        return res.json({ success: true, message: 'Kritik durumda ürün bulunamadı, mail atılmadı.' });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Sunucu yerelde http://localhost:${PORT} adresinde aktif.`);
    });
}

module.exports = app;