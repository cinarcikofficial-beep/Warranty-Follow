const express = require('express');
const session = require('express-session');
const { createClient } = require('@supabase/supabase-js');
const app = express();

// 1. SUPABASE BAĞLANTISI
// Yerelde çalışırken bu URL ve KEY'leri buraya yazabilirsin. 
// Vercel'e yüklediğinde ise bunları Vercel Environment Variables (Çevre Değişkenleri) olarak ekleyeceğiz.
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
    cookie: { secure: false } // Vercel'de standart HTTP/HTTPS uyumu için false kalabilir
}));

// Statik dosyalar için (Logonuz vb. için)
app.use(express.static('public'));

// 3. GİRİŞ SAYFASI (LOGIN)
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

// GİRİŞ POST İŞLEMİ
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Sabit kullanıcı adı ve şifre koruması (İsteğe göre değiştirebilirsin)
    if (username === 'admin' && password === 'verytech123') {
        req.session.userId = '1';
        req.session.userName = 'Verytech Yönetici';
        return res.redirect('/dashboard');
    }
    res.send("<script>alert('Hatalı kullanıcı adı veya şifre!'); window.location.href='/';</script>");
});

// ÇIKIŞ İŞLEMİ
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// 4. PANELE GİRİŞ (DASHBOARD) - SUPABASE ENTEGRELİ SÜRÜM
app.get('/dashboard', async (req, res) => {
    if (!req.session.userId) return res.redirect('/');
    
    const bugun = new Date();

    // 🌟 JSON dosyasından okumak yerine verileri Supabase'den çekiyoruz
    const { data: tumUrunler, error } = await supabase
        .from('urunler')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return res.status(500).send("Veritabanı hatası: " + error.message);
    }

    // Müşteri ve Marka Listelerini Toplama Mantığı
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
    if (musteriListesi.length === 0) {
    musteriSatirlari = `<tr><td colspan="4" class="text-center text-muted py-3">Henüz kayıtlı müşteri yok.</td></tr>`;
}else {
        musteriListesi.forEach((m, idx) => {
            musteriSatirlari += `
            <tr>
                <td class="fw-bold text-secondary" style="width: 5%;">${idx + 1}</td>
                <td><span class="fw-bold text-dark filter-musteri-btn" style="cursor: pointer;" data-musteri="${m}">🏢 ${m}</span></td>
                <td>
                    <span class="badge bg-blue shadow-sm text-white px-3 py-2 rounded-pill fw-bold filter-musteri-btn" style="background-color: #0284c7; cursor: pointer;" data-musteri="${m}">📊 ${musteriMap[m]} Adet Ürün</span>
                </td>
                <td class="text-end" style="width: 15%;"><span class="btn btn-sm btn-flat-blue fw-bold shadow-sm filter-musteri-btn" data-musteri="${m}">Ürünleri Süz 🔍</span></td>
            </tr>`;
        });
    }

    let urunSatirlari = "";
    if (tumUrunler.length === 0) {
        urunSatirlari = `<tr><td colspan="8" class="text-center text-muted py-3">Henüz sisteme girilmiş ürün bulunmamaktadır.</td></tr>`;
    } else {
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
                markaGosterim = `<span class="badge filter-marka-btn shadow-sm text-white px-3 py-1.5 rounded fw-bold" style="background-color: #6d28d9; cursor: pointer; font-size: 13px;" title="Bu markayı süz">${markaAdi}</span>`;
            }

            urunSatirlari += `
            <tr class="${satirSinifi}">
                <td data-search="${urun.musteri_adi || ''}"><span class="text-dark fw-bold filter-musteri-alt-btn" style="cursor: pointer;" data-musteri="${urun.musteri_adi || ''}">🏢 ${urun.musteri_adi || ''}</span></td>
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
            th { cursor: pointer; font-weight: 600; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px; }
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
            
            .filter-marka-btn:hover, .filter-musteri-btn:hover, .filter-musteri-alt-btn:hover { opacity: 0.8; transform: scale(1.02); transition: all 0.1s ease; text-decoration: underline; }
            
            .btn-flat-blue { color: #0284c7; background-color: #ffffff; border: 1px solid #0284c7; transition: all 0.2s; }
            .btn-flat-blue:hover { color: #ffffff; background-color: #0284c7; }
            
            .navbar-custom { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
            .form-control, .form-select { border-color: #cbd5e1; padding: 0.6rem 0.75rem; font-size: 14px; border-radius: 8px; background-color: #ffffff; }
            .form-control:focus, .form-select:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15); }
        </style>
    </head>
    <body>
    
    <nav class="navbar navbar-dark navbar-custom px-4 py-3 mb-4 d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center gap-3">
            <img src="/verytech_beyaz.png" alt="Verytech" style="height: 38px; width: auto; object-fit: contain;" />
            <div style="width: 1px; height: 25px; background: rgba(255,255,255,0.2);"></div>
            <a class="navbar-brand fw-bold m-0" style="letter-spacing: 1.5px; font-size: 16px;">GARANTİ TAKİP SİSTEMİ</a>
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
                    <thead class="table-light"><tr><th>No</th><th>Şirket Adı</th><th>Toplam Ürün Miktarı</th><th class="text-end">İşlem</th></tr></thead>
                    <tbody>${musteriSatirlari}</tbody>
                </table>
            </div>
        </div>

        <div class="card card-custom-purple p-4 mb-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="fw-bold text-purple m-0">🟣 Garanti Detay Listesi</h5>
                <button id="clearFilterBtn" class="btn btn-sm btn-danger fw-bold px-3 rounded-pill shadow-sm" style="display:none;" onclick="filtreleriTemizle()">❌ Uygulanan Filtreyi Kaldır (Hepsini Göster)</button>
            </div>
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
        var urunTable;
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
        function filtreleriTemizle() {
            if (urunTable) {
                urunTable.columns().search('').draw();
                document.getElementById('clearFilterBtn').style.display = 'none';
            }
        }

        $(document).ready(function() {
            $('#musteriTablosu').DataTable({ "language": { "url": "https://cdn.datatables.net/plug-ins/1.13.6/i18n/tr.json" }, "paging": true, "pageLength": 5, "lengthChange": false, "info": false });
            urunTable = $('#genelUrunTablosu').DataTable({ "language": { "url": "https://cdn.datatables.net/plug-ins/1.13.6/i18n/tr.json" }, "order": [[ 6, "asc" ]], "paging": true, "pageLength": 10, "info": false, "lengthMenu": [10, 25, 50] });
            
            $('#musteriTablosu').on('click', '.filter-musteri-btn', function() {
                var mName = $(this).attr('data-musteri');
                if(urunTable && mName) {
                    filtreleriTemizle();
                    urunTable.column(0).search('^'+mName+'$', true, false).draw();
                    document.getElementById('clearFilterBtn').style.display = 'inline-block';
                    $('html, body').animate({ scrollTop: $(".card-custom-purple").offset().top - 20 }, 400);
                }
            });
            $('#genelUrunTablosu').on('click', '.filter-musteri-alt-btn', function() {
                var mName = $(this).attr('data-musteri');
                if(urunTable && mName) {
                    filtreleriTemizle();
                    urunTable.column(0).search('^'+mName+'$', true, false).draw();
                    document.getElementById('clearFilterBtn').style.display = 'inline-block';
                }
            });
            $('#genelUrunTablosu').on('click', '.filter-marka-btn', function() {
                var secilenMarka = $(this).text().trim();
                if(urunTable && secilenMarka) {
                    filtreleriTemizle();
                    urunTable.column(1).search('^'+secilenMarka+'$', true, false).draw();
                    document.getElementById('clearFilterBtn').style.display = 'inline-block';
                }
            });

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

// 5. YENİ ÜRÜN EKLEME (SUPABASE ENTEGRELİ)
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

    // Supabase'e Satır Ekleme
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

// 6. ÜRÜN DÜZENLEME (SUPABASE ENTEGRELİ)
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

// 7. ÜRÜN SİLME (SUPABASE ENTEGRELİ)
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

// 8. VERCEL UYUMLU SUNUCU AYAĞA KALDIRMA MANTIĞI
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Sunucu yerelde http://localhost:${PORT} adresinde aktif.`);
    });
}

module.exports = app; // Vercel için kritik satır

