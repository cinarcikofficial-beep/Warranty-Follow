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

// 🚀 VERYTECH BEYAZ LOGO (BASE64 OLARAK KODA GÖMÜLDÜ - ASLA KIRILMAZ)
const verytechLogoBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAK8AAAAwCAYAAACi6pBtAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAALRSURBVHgB7Vw7btwwED0pU6bM6SNoK0W69BGiSpUuXfoBcgepU0Y6XfoIkUqVLp069REiZ8qUKb0fIPrfIdgZivvYwS6pEAnwAEPh7OzMvNn9uNxd7vI8L9CIsb6+7g6Hg8vzfOf7vhuPx93xeHw79n3ff6N/U4zreZ5vjO39+Yw636h3UbybN9E7W3mY8A9msh7p7T7D8FjG8BfKj9HclT69Z+G7X7S+TfM2yvof5b8Z889U5tby3Y46u5D6NuUfpf476u5S/v6ivVvK+BntI4bZ8Y7390fUf6a892bO82v7z1fGOf7fGfXeprx9vC8U48G7/K9m8W6K/fWivV2KeGf03WwVb5f8Yxbv7Bbx9ojv/U36Z7X6/g2tI90j6t0U76PZfH9XfPOf76fUvyv+/ZfFvF369mZ2K/H28N6P2XyV7/b9G6NfG6fof6Mylp9t2vE+mY3v74r3fI9X2m2T3v1D/Y9W8T7YxHujr6iI92g2398N6X6b7/atv6XvR7N8f6H+K6V/0vG+Wv3vX9p3RreUv/V7Zor3g3V8W0X8zUv7b4fWkaaka4N7XhfrfGOf31pZzZfFf9v/Y1uFd+f9H02HreM94lVvM828X7S1z8t4t0W7+3ZfP/WvjO6R9X9P6I9uonv74pX6/u7NfHfvn9D+3TivX2f7f/2pf0O9T/Z0vaR4v1kFe+zTbzfbfE+mPnNf3/WvjN6N6vofzH6t9XvO6M9bYpXb+K7vyrer9b3f9L+R7SvdLxPtIn3XbyPZid/32fXvGv/U7S2/3wS7XmbfO/v0/qFie3vVvVp28Vb0X49G9/fFe+p+N9P+W7G8vdP8Z7I38f8fSxf5bsZ6WlXvKfi//Xv/ZtGekf6/p66u2j3lqfG0Yg8F6Z4fX4y9X6h+G6m8pT636mzdym/f6I96v4byv+R6txK6/vX8vdUvI/md4zX7zN6R0S9O6p3N6FzV8TbaX2/U3nXU961NPMuY5zLGOco99mU93vUeWf69K5TfvdT59f635q59ftr69+aPrc/Z6ZPH6L/083wNMr6N9Knd0b9f+w/R3qGv/Pj6Onf6wreH9X5CPr6p/vP/wXf+q9m8c6Evyv+6wre72j72Xf8XbyN5h7E22geRbyN5p8Q/wPshM2Mv6Yf5QAAAABJRU5CYII=";

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
            <img src="${verytechLogoBase64}" alt="Verytech" style="height: 45px; margin-bottom: 2rem; object-fit: contain;">
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
                <td class="text-muted">${urun.garanti_baslangic || ''}</td>
                <td class="fw-semibold">${urun.garanti_bitis || ''}</td>
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
            body { background-color: #f1f5f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
            th { font-weight: 600; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px; }
            .dataTables_filter { margin-bottom: 15px; }
            
            .card-custom-green { border: 1px solid #cbf3d6; border-left: 6px solid #10b981; box-shadow: 0 4px 15px rgba(16,185,129,0.06); background-color: #f0fdf4; border-radius: 12px; }
            .card-custom-blue { border: 1px solid #bae6fd; border-left: 6px solid #0284c7; box-shadow: 0 4px 15px rgba(2,132,199,0.06); background-color: #f0f9ff; border-radius: 12px; }
            .card-custom-purple { border: 1px solid #e9d5ff; border-left: 6px solid #6d28d9; box-shadow: 0 4px 15px rgba(109,40,217,0.06); background-color: #faf5ff; border-radius: 12px; }
            
            .card-custom-blue .table, .card-custom-blue .table tr, .card-custom-blue .table td { background-color: #f0f9ff !important; border-color: #e0f2fe !important; }
            .card-custom-purple .table, .card-custom-purple .table tr, .card-custom-purple .table td { background-color: #faf5ff !important; border-color: #f3e8ff !important; }
            
            .table-light th { background-color: rgba(0, 0, 0, 0.04) !important; color: #334155 !important; border-bottom: 2px solid rgba(0,0,0,0.08) !important; }
            
            .card-custom-purple .table tr.table-warning-custom, .card-custom-purple .table tr.table-warning-custom td { background-color: #fefce8 !important; }
            .card-custom-purple .table tr.table-danger-custom, .card-custom-purple .table tr.table-danger-custom td { background-color: #fef2f2 !important; }
            
            .text-purple { color: #6d28d9; }
            .btn-outline-purple { color: #6d28d9; border-color: #6d28d9; background-color: #ffffff; }
            .btn-outline-purple:hover { color: #fff; background-color: #6d28d9; border-color: #6d28d9; }
            .btn-outline-danger { background-color: #ffffff; }
            
            .btn-flat-blue { color: #0284c7; background-color: #ffffff; border: 1px solid #0284c7; transition: all 0.2s; text-decoration: none; }
            .btn-flat-blue:hover { color: #ffffff; background-color: #0284c7; }
            
            .navbar-custom { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
            .form-control, .form-select { border-color: #cbd5e1; padding: 0.6rem 0.75rem; font-size: 14px; border-radius: 8px; background-color: #ffffff; }
            .form-control:focus, .form-select:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15); }
        </style>
    </head>
    <body>
    
    <nav class="navbar navbar-dark navbar-custom px-4 py-3 mb-4 d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center gap-3">
            <img src="${verytechLogoBase64}" alt="Verytech" style="height: 38px; width: auto; object-fit: contain;" />
            <div style="width: 1px; height: 25px; background: rgba(255,255,255,0.2);"></div>
            <a href="/dashboard" class="navbar-brand fw-bold m-0" style="letter-spacing: 1.5px; font-size: 16px;">GARANTİ TAKİP SİSTEMİ</a>
        </div>
        <span class="text-white small bg-secondary bg-opacity-25 px-3 py-1.5 rounded-pill">🔒 Kullanıcı: <b>${req.session.userName}</b> | <a href="/logout" class="text-warning text-decoration-none fw-bold ms-2">Çıkış</a></span>
    </nav>
    
    <div class="container-fluid px-4">
        <div class="card card-custom-green p-4 mb-4">
            <h5 class="text-success fw-bold mb-4 d-flex align-items-center gap-2">🟢 Yeni Satılan Ürün Kaydı</h5>
            <form action="/urun-ekle" method="POST">
                <div class="row g-3 align-items-end">
                    
                    <div class="col-xl-3 col-md-6">
                        <div class="d-flex align-items-center mb-2">
                            <label class="form-label small fw-bold mb-0 me-3 text-secondary">Müşteri / Şirket</label>
                            <div class="d-flex gap-3">
                                <div class="form-check m-0">
                                  <input class="form-check-input" type="radio" name="musteri_tipi" id="tipMevcut" value="mevcut" checked onclick="musteriFormuDegistir()">
                                  <label class="form-check-label small fw-semibold text-dark" style="cursor:pointer;" for="tipMevcut">Kayıtlı</label>
                                </div>
                                <div class="form-check m-0">
                                  <input class="form-check-input" type="radio" name="musteri_tipi" id="tipYeni" value="yeni" onclick="musteriFormuDegistir()">
                                  <label class="form-check-label small fw-semibold text-dark" style="cursor:pointer;" for="tipYeni">Yeni</label>
                                </div>
                            </div>
                        </div>
                        <div id="mevcutMusteriAlani"><select name="mevcut_musteri" class="form-select"><option value="">-- Şirket Seçin --</option>${mevcutMusteriSecenekleri}</select></div>
                        <div id="yeniMusteriAlani" style="display:none;"><input type="text" name="yeni_musteri" class="form-control" placeholder="Yeni Şirket Adı Girin"></div>
                    </div>
                    
                    <div class="col-xl-2 col-md-6">
                        <div class="d-flex align-items-center mb-2">
                            <label class="form-label small fw-bold mb-0 me-3 text-secondary">Marka</label>
                            <div class="d-flex gap-3">
                                <div class="form-check m-0">
                                  <input class="form-check-input" type="radio" name="marka_tipi" id="markaMevcut" value="mevcut" checked onclick="markaFormuDegistir()">
                                  <label class="form-check-label small fw-semibold text-dark" style="cursor:pointer;" for="markaMevcut">Kayıtlı</label>
                                </div>
                                <div class="form-check m-0">
                                  <input class="form-check-input" type="radio" name="marka_tipi" id="markaYeni" value="yeni" onclick="markaFormuDegistir()">
                                  <label class="form-check-label small fw-semibold text-dark" style="cursor:pointer;" for="markaYeni">Yeni</label>
                                </div>
                            </div>
                        </div>
                        <div id="mevcutMarkaAlani"><select name="mevcut_marka" class="form-select"><option value="">-- Marka Seçin --</option>${mevcutMarkaSecenekleri}</select></div>
                        <div id="yeniMarkaAlani" style="display:none;"><input type="text" name="yeni_marka" class="form-control" placeholder="Örn: Cisco"></div>
                    </div>

                    <div class="col-xl-2 col-md-4 col-sm-6">
                        <label class="form-label small fw-bold text-secondary">Ürün Adı</label>
                        <input type="text" name="urun_adi" class="form-control" placeholder="Örn: Switch" required>
                    </div>

                    <div class="col-xl-1 col-md-4 col-sm-6">
                        <label class="form-label small fw-bold text-secondary">Seri No</label>
                        <input type="text" name="seri_no" class="form-control" placeholder="Örn: SN-55" required>
                    </div>

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
                        <tr>
                            <th>No</th>
                            <th>Şirket Adı</th>
                            <th>Toplam Ürün Miktarı</th>
                            <th class="text-end">İşlem</th>
                        </tr>
                    </thead>
                    <tbody>${musteriSatirlari}</tbody>
                </table>
            </div>
        </div>

        <div class="card card-custom-purple p-4 mb-4">
            <h5 class="fw-bold text-purple mb-4">🟣 Garanti Detay Listesi (Tüm Ürünler)</h5>
            <div class="table-responsive">
                <table id="genelUrunTablosu" class="table align-middle table-hover w-100 m-0">
                    <thead class="table-light">
                        <tr>
                            <th>Müşteri / Şirket</th>
                            <th>Marka</th>
                            <th>Ürün Adı</th>
                            <th>Seri No</th>
                            <th>Başlangıç Tarihi</th>
                            <th>Bitiş Tarihi</th>
                            <th>Garanti Durumu</th>
                            <th class="text-end">İşlemler</th>
                        </tr>
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
            $('#genelUrunTablosu').DataTable({ "language": { "url": "https://cdn.datatables.net/plug-ins/1.13.6/i18n/tr.json" }, "order": [[ 6, "asc" ]], "paging": true, "pageLength": 10, "info": false, "lengthMenu": [10, 25, 50] });
            
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

// 6. DETAY SAYFASI
app.get('/detay', async (req, res) => {
    if (!req.session.userId) return res.redirect('/');
    
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
            <td class="text-muted">${urun.garanti_baslangic}</td>
            <td class="fw-semibold">${urun.garanti_bitis}</td>
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
            .card-detay { border-top: 6px solid #6d28d9; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
            .table-warning-custom, .table-warning-custom td { background-color: #fefce8 !important; }
            .table-danger-custom, .table-danger-custom td { background-color: #fef2f2 !important; }
        </style>
    </head>
    <body>
    <nav class="navbar navbar-dark navbar-custom px-4 py-3 mb-4 d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center gap-3">
            <img src="${verytechLogoBase64}" alt="Verytech" style="height: 38px; width: auto; object-fit: contain;" />
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
                        <tr>
                            <th>Müşteri</th>
                            <th>Marka</th>
                            <th>Ürün Adı</th>
                            <th>Seri No</th>
                            <th>Başlangıç</th>
                            <th>Bitiş</th>
                            <th>Durum</th>
                        </tr>
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

// 7. YENİ ÜRÜN EKLEME
app.post('/urun-ekle', async (req, res) => {
    if (!req.session.userId) return res.redirect('/');

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

// 8. ÜRÜN DÜZENLEME
app.post('/urun-duzenle', async (req, res) => {
    if (!req.session.userId) return res.redirect('/');
    
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

// 9. ÜRÜN SİLME
app.get('/urun-sil/:id', async (req, res) => {
    if (!req.session.userId) return res.redirect('/');
    const id = req.params.id;

    const { error } = await supabase
        .from('urunler')
        .delete()
        .eq('id', id);

    if (error) return res.status(500).send("Silme Hatası: " + error.message);
    res.redirect('/dashboard');
});

// 10. CRON JOB - OTOMATİK MAİL TETİKLEME ROTASI
app.get('/api/cron/garanti-kontrol', async (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ success: false, message: 'Yetkisiz erişim.' });
    }

    try {
        const bugun = new Date();
        const { data: tumUrunler, error } = await supabase.from('urunler').select('*');

        if (error) throw error;

        let mailIcerik = `<h3>Verytech Garanti ve Bakım Raporu</h3><p>Merhaba, system taraması sonucunda durumları kritik olan cihaz listesi aşağıdadır:</p><table border="1" cellpadding="8" style="border-collapse:collapse;"><thead><tr style="background:#f1f5f9;"><th>Müşteri</th><th>Marka/Ürün</th><th>Seri No</th><th>Bitiş Tarihi</th><th>Kalan Gün</th></tr></thead><tbody>`;
        let mailGonderilecekMi = false;

        tumUrunler.forEach((urun) => {
            const bitisTarihi = new Date(urun.garanti_bitis);
            const t1 = Date.UTC(bugun.getFullYear(), bugun.getMonth(), bugun.getDate());
            const t2 = Date.UTC(bitisTarihi.getFullYear(), bitisTarihi.getMonth(), bitisTarihi.getDate());
            const kalanGun = Math.floor((t2 - t1) / (1000 * 60 * 60 * 24));

            if (kalanGun === 60 || kalanGun <= 30) {
                mailGonderilecekMi = true;
                let durumRengi = kalanGun < 0 ? "red" : (kalanGun <= 30 ? "orange" : "blue");
                mailIcerik += `<tr><td><b>${urun.musteri_adi}</b></td><td>${urun.marka} - ${urun.urun_adi}</td><td><code>${urun.seri_no}</code></td><td>${urun.garanti_bitis}</td><td style="color:${durumRengi}; font-weight:bold;">${kalanGun < 0 ? 'Süresi Doldu' : kalanGun + ' Gün'}</td></tr>`;
            }
        });

        mailIcerik += `</tbody></table><br><p>Sisteme erişmek için Vercel panelinizi kullanabilirsiniz.</p>`;

        if (mailGonderilecekMi) {
            await transporter.sendMail({
                from: 'cinarcikofficial@gmail.com',
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

// VERCEL SUNUCU AYARI
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Sunucu yerelde http://localhost:${PORT} adresinde aktif.`);
    });
}

module.exports = app;