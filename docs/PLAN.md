# Rencana Pembangunan — Aneka Jaya Florist

Acuan visual: `docs/mockup.webp` (salinan mockup yang dikirim lewat chat; file `docs/mockup.png` belum ada di repo).

## 1. Struktur folder & daftar file

```
/
├── index.html            Beranda (semua section sesuai mockup)
├── produk.html           Katalog produk + filter kategori + pencarian
├── artikel.html          Halaman "segera hadir" (agar menu Artikel tidak mati)
├── kebijakan.html        Kebijakan Privasi + Syarat & Ketentuan (satu halaman, dua anchor)
├── .nojekyll             Mematikan Jekyll di GitHub Pages
├── README.md             Panduan berbahasa Indonesia
├── docs/
│   ├── PLAN.md           Dokumen ini
│   └── mockup.webp       Mockup acuan
└── assets/
    ├── css/style.css     Satu stylesheet, dibagi per section + CSS variables
    ├── js/
    │   ├── config.js     Nomor WhatsApp, telepon, alamat, jam buka (satu tempat)
    │   ├── products.js   Data kategori + minimal 16 produk
    │   ├── utils.js      formatRupiah, escapeHtml, template kartu produk
    │   ├── cart.js       Keranjang (drawer, localStorage, checkout WhatsApp)
    │   ├── main.js       Navbar/hamburger, search, back-to-top, isi data dari config
    │   ├── home.js       Render kategori + carousel produk pilihan
    │   └── catalog.js    Filter kategori, pencarian, urutan di produk.html
    └── img/              Placeholder SVG (produk, kategori, hero, about, avatar, logo, favicon)
```

Semua path relatif, script memakai `<script defer>` biasa (bukan ES module) supaya juga jalan saat `index.html` dibuka langsung dari disk (`file://`).

## 2. Section & komponen yang teridentifikasi

**Global (semua halaman)**
- Top bar: lokasi, telepon, jam buka, "Ikuti kami" + 4 ikon sosmed (Instagram, TikTok, Facebook, YouTube)
- Navbar sticky: logo (ikon bunga SVG + tulisan script "Aneka Jaya / FLORIST"), menu (Beranda, Produk ▾ dengan submenu kategori, Tentang Kami, Testimoni, Artikel, Kontak), ikon search (panel pencarian yang membuka `produk.html?q=`), ikon keranjang + badge, tombol "Pesan Sekarang"; hamburger di mobile
- Drawer keranjang (+ overlay, toast "ditambahkan")
- Footer maroon: logo + slogan, menu, kontak, sosmed, tombol WhatsApp besar, copyright, link legal
- Tombol kembali ke atas

**index.html**
1. Hero (kicker, H1 serif, deskripsi, 2 tombol, ilustrasi buket, teks script "Flowers Brighter Lives ♡")
2. Kategori populer — 8 kartu (gambar + label), link "Lihat Semua Kategori"; tiap kartu → `produk.html?kategori=<slug>`
3. Produk pilihan — carousel scroll-snap + tombol prev/next; kartu: gambar, nama, harga, rating, "+ Keranjang"
4. Tentang kami — split: gambar kiri, panel pink kanan, teks script "Good Flowers Happier People", 3 keunggulan
5. Testimoni — 3 kartu (avatar, kutipan, nama, 5 bintang)

**produk.html**: header halaman, chip kategori, kolom cari, urutan (relevansi/harga/rating), jumlah hasil (aria-live), grid kartu, empty state.

## 3. Palet warna & font

| Token | Hex | Pemakaian |
|---|---|---|
| `--rose` | `#C9304F` | Tombol utama, aksen (putih di atasnya kontras 5,2:1) |
| `--rose-dark` | `#B02744` | Hover, teks kecil di atas latar pink (5,5:1) |
| `--pink-50` | `#FFF6F8` | Latar halus |
| `--pink-100` | `#FDE8EC` | Latar section (tentang kami) |
| `--pink-200` | `#FBD5DD` | Top bar, border, placeholder |
| `--maroon` | `#8A2B43` | Footer |
| `--maroon-dark` | `#6B1F33` | Hero overlay, footer bawah |
| `--ink` | `#2D1F24` | Teks utama |
| `--muted` | `#6B5A60` | Teks sekunder |
| `--star` | `#F5A524` | Bintang rating |
| `--wa` | `#25D366` | Hanya untuk ikon WhatsApp bila perlu |

Font (Google Fonts): **Lora** (judul, serif), **Poppins** (teks), **Dancing Script** (logo & teks dekoratif script seperti di mockup).

## 4. Asumsi

1. Mockup dipakai dari lampiran chat; disimpan sebagai `docs/mockup.webp`.
2. Foto di mockup (hero, kategori, produk, tim) diganti **ilustrasi SVG placeholder** karena dilarang memakai gambar internet. Hero tetap berlatar gelap-maroon agar teks putih terbaca; saat foto asli dipasang cukup ganti file dengan nama sama.
3. Menu **Artikel** dan link **Kebijakan Privasi / Syarat & Ketentuan** tidak ada di daftar halaman, jadi dibuatkan halaman minimal (`artikel.html`, `kebijakan.html`) supaya tidak ada link mati. Isinya draf generik yang perlu Anda tinjau.
4. Ikon sosmed mengarah ke `#` yang bisa diganti di `config.js` (URL akun), bukan akun asli.
5. Nomor WhatsApp `6281234567890` (sesuai instruksi) sebagai contoh; teks nomor tampil `0812 3456 7890` dan email `anekajayaflorist@gmail.com` diambil dari mockup.
6. Rating tiap produk ditampilkan sebagai satu bintang + angka + jumlah ulasan (lebih mudah dibaca screen reader daripada 5 ikon sebagian terisi).
7. Keranjang tidak punya fitur kuantitas lebih dari 99 per item; data tersimpan di `localStorage` (kunci `ajf_cart_v1`) dan hanya menyimpan `id` + jumlah, harga selalu dibaca ulang dari `products.js`.
8. URL produksi diasumsikan `https://adlansyiari73.github.io/compro_aneka-jaya-florist/` untuk tag Open Graph; ubah bila berbeda.
9. Tahun hak cipta mengikuti mockup (2025) lewat teks statis; dapat diganti.
