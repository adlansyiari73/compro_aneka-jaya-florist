# Aneka Jaya Florist

Website company profile + katalog toko bunga **Aneka Jaya Florist**. 100% statis (HTML, CSS, JavaScript vanilla), tanpa framework dan tanpa build step, sehingga bisa langsung di-hosting di GitHub Pages.

- Beranda: hero, kategori populer, carousel produk pilihan, tentang kami, testimoni
- Katalog produk dengan filter kategori, pencarian nama, dan pengurutan
- Keranjang (drawer) yang tersimpan di `localStorage`, checkout lewat pesan WhatsApp beserta data pengiriman (opsional)
- Responsif (mobile, tablet, desktop) dengan menu hamburger di mobile
- SEO dasar: JSON-LD `Florist`, `sitemap.xml`, `robots.txt`, dan daftar produk yang terbaca tanpa JavaScript

## Struktur folder

```
index.html          Beranda (+ JSON-LD data toko di <head>)
produk.html         Katalog produk (?kategori=<slug>&q=<kata>&urut=<opsi>)
artikel.html        Halaman "segera hadir" (noindex, menunya disembunyikan)
kebijakan.html      Kebijakan Privasi + Syarat & Ketentuan (draf, mohon ditinjau)
robots.txt          Aturan untuk mesin pencari + lokasi sitemap
sitemap.xml         Daftar halaman untuk mesin pencari
tests/              Self-check tanpa browser (lihat "Self-check")
assets/
  css/style.css     Semua gaya, dibagi per section + CSS variables di bagian atas
  js/config.js      Nomor WhatsApp, telepon, alamat, jam buka, link sosmed
  js/products.js    Data kategori dan produk
  js/utils.js       Format Rupiah dan template kartu produk
  js/cart.js        Logika keranjang dan checkout WhatsApp
  js/main.js        Navbar, pencarian, tombol kembali ke atas
  js/home.js        Kategori dan carousel di beranda
  js/catalog.js     Filter dan pencarian di halaman produk
  img/              Gambar (saat ini placeholder SVG)
docs/
  PLAN.md           Rencana pembangunan
  mockup.webp       Mockup acuan
```

## Menjalankan di komputer sendiri

Cara paling mudah: klik dua kali `index.html` (langsung bisa dibuka dari folder). Namun, lebih baik memakai server lokal agar perilakunya sama dengan GitHub Pages:

```bash
# Pilih salah satu
python3 -m http.server 8000
npx serve .
```

Lalu buka <http://localhost:8000>.

## Mengganti nomor WhatsApp dan data toko

Buka `assets/js/config.js`, lalu ubah di satu tempat saja:

```js
whatsappNumber: '6281234567890',   // format internasional, tanpa +, spasi, atau 0 di depan
teleponTampil: '0812 3456 7890',   // teks yang tampil di website
email: 'anekajayaflorist@gmail.com',
alamat: 'Bekasi, Indonesia',
jamBuka: 'Senin - Minggu 07.00 - 21.00',
sosmed: { instagram: '#', tiktok: '#', facebook: '#', youtube: '#' },   // isi URL akun
```

Semua tombol WhatsApp, tautan telepon/email, dan teks kontak di semua halaman otomatis mengikuti file ini. Contoh: nomor `0812-3456-7890` ditulis `6281234567890`.

Catatan: teks nomor/email yang tertulis di file HTML hanya cadangan jika JavaScript mati; yang tampil adalah isi `config.js`.

**Penting, data untuk Google:** `index.html` juga memuat data toko untuk mesin pencari (blok `<script type="application/ld+json">` di `<head>`, ada komentar di atasnya). Blok ini **tidak** otomatis mengikuti `config.js`, jadi setiap kali nama toko, nomor WhatsApp, email, kota, atau jam buka diubah, samakan juga nilainya di sana:

| `config.js` | JSON-LD di `index.html` |
|---|---|
| `namaToko` | `"name"` |
| `whatsappNumber` | `"telephone"` (diawali `+`, mis. `"+6281234567890"`) |
| `email` | `"email"` |
| `alamat` | `"addressLocality"` (nama kota, mis. `"Bekasi"`) |
| `jamBuka` | `"opens"`, `"closes"` (format 24 jam `"07:00"`) dan `"dayOfWeek"` (nama hari dalam bahasa Inggris) |

Setelah itu jalankan `node tests/seo.test.js` (lihat "Self-check") untuk memastikan keduanya sudah sama.

## Mengganti gambar dengan foto asli

Semua gambar ada di `assets/img/` dan saat ini berupa ilustrasi placeholder SVG.

1. Siapkan foto (disarankan JPG/WebP, produk rasio 1:1 sekitar 800×800 px, kategori rasio 5:4, ukuran di bawah 200 KB per foto).
2. Simpan foto dengan **nama yang sama** seperti placeholder, mis. `assets/img/buket-mawar-pink.jpg`.
3. Ubah ekstensi di `assets/js/products.js`:
   ```js
   gambar: 'assets/img/buket-mawar-pink.jpg',
   ```
4. Untuk gambar non-produk, edit atribut `src` di HTML:

| File | Dipakai di |
|---|---|
| `hero-bouquet.svg` | Gambar buket di hero (`index.html`) |
| `hero-bg.svg` | Latar hero, dipanggil dari `assets/css/style.css` (`.hero`). Boleh diganti foto, overlay gelap sebaiknya dipertahankan agar teks putih terbaca |
| `about-florist.svg` | Foto di section "Tentang Kami" |
| `kategori-*.svg` | Gambar 8 kartu kategori (dipanggil dari `products.js`, array `KATEGORI`) |
| `avatar-*.svg` | Foto pelanggan di testimoni |
| `favicon.svg` | Ikon tab browser |
| `og-image.png` | Gambar pratinjau saat link dibagikan (1200×630 px) |

## Menambah produk

Buka `assets/js/products.js`, lalu tambahkan satu objek di array `PRODUK`:

```js
{
  id: 'buket-lily-putih',            // unik, tanpa spasi
  nama: 'Buket Lily Putih',
  kategori: 'buket-bunga',           // salah satu slug di array KATEGORI
  harga: 380000,                     // angka tanpa titik -> tampil Rp 380.000
  rating: 4.8,
  jumlahUlasan: 22,
  gambar: 'assets/img/buket-lily-putih.jpg',
  unggulan: true,                    // opsional: true = tampil di carousel beranda
},
```

Slug kategori yang tersedia: `buket-bunga`, `bunga-papan`, `standing-flower`, `bunga-meja`, `hand-bouquet`, `bunga-duka-cita`, `bunga-artificial`, `hadiah-lainnya`. Untuk menambah kategori, tambahkan objek baru di `KATEGORI` (gambar kategori diambil dari properti `gambar`). Perlu juga menambah tautannya di submenu "Produk" pada navbar (di tiap file HTML).

> `id` produk dipakai oleh keranjang. Mengubah `id` produk akan mengosongkan item itu dari keranjang pengunjung yang sudah menyimpannya.

Setelah menambah, menghapus, atau mengubah nama/harga produk, perbarui juga **daftar produk tanpa JavaScript** di `produk.html` (blok `<noscript>` di bawah `<ul id="product-grid">`). Formatnya satu baris per produk, dikelompokkan per kategori sesuai urutan di `products.js`:

```html
<h2>Buket Bunga</h2>
<ul>
  <li>Buket Mawar Pink Elegan — Rp 350.000</li>
</ul>
```

Daftar ini hanya dibaca mesin pencari dan browser yang JavaScript-nya mati; pengunjung biasa tetap melihat katalog dari `products.js`. Jalankan `node tests/seo.test.js` untuk mengecek apakah daftarnya sudah sama dengan `products.js`.

## Mengubah isi menu, header, dan footer

Karena situs tanpa build step, header dan footer tertulis di setiap file HTML (diberi komentar `HEADER` dan `FOOTER`). Blok `FOOTER` juga berisi drawer keranjang dan form data pengiriman. Jika mengubah menu, footer, atau form, salin perubahannya ke keempat file: `index.html`, `produk.html`, `artikel.html`, `kebijakan.html`.

## Menampilkan lagi menu Artikel

Menu **Artikel** sengaja disembunyikan selama `artikel.html` masih "Segera Hadir". Filenya tetap ada dan diberi `<meta name="robots" content="noindex">` agar tidak muncul di Google. Saat artikel sudah siap:

1. Di keempat file HTML, cari teks `MENU ARTIKEL` (ada 2 per file: di navbar dan di footer). Hapus pembuka komentar `<!-- MENU ARTIKEL disembunyikan ... (lihat README): ` dan penutup ` -->`, sehingga yang tersisa hanya baris `<li>…</li>`. Di `artikel.html`, baris navbar sudah berisi `aria-current="page"`, jadi biarkan.
2. Di `artikel.html`, hapus baris `<meta name="robots" content="noindex">` beserta komentar di atasnya.
3. Di `sitemap.xml`, tambahkan:
   ```xml
   <url>
     <loc>https://adlansyiari73.github.io/compro_aneka-jaya-florist/artikel.html</loc>
   </url>
   ```
4. Jalankan `node tests/seo.test.js`. Pengujian ini gagal bila langkah 1–3 belum lengkap (mis. noindex sudah dihapus tetapi menu atau sitemap belum).

## Mengaktifkan GitHub Pages

1. Pastikan semua perubahan sudah di-merge ke branch `main` (atau branch yang akan dipublikasikan).
2. Di GitHub, buka repo → **Settings** → **Pages**.
3. Pada **Build and deployment**, pilih **Source: Deploy from a branch**.
4. Pilih **Branch: `main`** dan folder **`/ (root)`**, lalu klik **Save**.
5. Tunggu 1–2 menit. Situs tersedia di `https://<username>.github.io/<nama-repo>/`
   (untuk repo ini: `https://adlansyiari73.github.io/compro_aneka-jaya-florist/`).

Semua path di situs ini relatif, jadi berjalan baik di subfolder repo. File `.nojekyll` sudah disertakan.

Jika alamat situs Anda berbeda (mis. domain sendiri), ubah URL `canonical`, `og:url`, dan `og:image` di bagian `<head>` keempat file HTML, URL `"url"` dan `"image"` di JSON-LD `index.html`, semua `<loc>` di `sitemap.xml`, dan baris `Sitemap:` di `robots.txt`.

## SEO (mesin pencari)

- **JSON-LD** di `index.html` memberi tahu Google bahwa situs ini toko bunga di Bekasi beserta kontak dan jam bukanya. Bisa dicek di <https://search.google.com/test/rich-results> atau <https://validator.schema.org/> dengan memasukkan URL situs. Ingat untuk menyamakannya dengan `config.js` (lihat "Mengganti nomor WhatsApp dan data toko").
- **`sitemap.xml`** berisi halaman yang boleh diindeks (`artikel.html` tidak dimasukkan selama masih "Segera Hadir"). Daftarkan di [Google Search Console](https://search.google.com/search-console): tambahkan properti jenis *Awalan URL* `https://adlansyiari73.github.io/compro_aneka-jaya-florist/`, lalu menu **Sitemap**, isi `sitemap.xml`.
- **`robots.txt`**: mesin pencari hanya membaca `robots.txt` di akar domain (`https://adlansyiari73.github.io/robots.txt`), bukan di subfolder repo. Selama situs berada di `…github.io/compro_aneka-jaya-florist/`, file ini belum dibaca, jadi daftarkan sitemap lewat Search Console seperti di atas. File ini baru berlaku otomatis jika situs dipindah ke domain sendiri.
- **Daftar produk tanpa JavaScript** di `produk.html` (blok `<noscript>`) membuat nama, kategori, dan harga produk terbaca oleh perayap yang tidak menjalankan JavaScript. Kategori juga sudah tertulis langsung di submenu "Produk" pada navbar setiap halaman.
- Untuk pencarian lokal ("toko bunga Bekasi"), profil **Google Business Profile** dengan alamat yang sama biasanya jauh lebih berpengaruh daripada perubahan di situs.

## Cara kerja checkout WhatsApp

Tombol **Pesan via WhatsApp** di keranjang membuka `https://wa.me/<nomor>?text=...` dengan pesan berisi daftar item, jumlah, subtotal, dan total. Di bawah daftar item, keranjang juga punya form **Data pengiriman** (semua opsional): tanggal kirim, jam/sesi kirim, nama penerima, alamat pengiriman, teks kartu/papan ucapan, dan nama pengirim. Hanya isian yang terisi yang ikut ke pesan, sebagai blok "Data pengiriman" setelah total, misalnya:

```
Halo Aneka Jaya Florist, saya ingin memesan:

1. Buket Mawar Pink Elegan x2 = Rp 700.000
2. Buket Mawar Merah Premium x1 = Rp 500.000

Total: Rp 1.200.000

Data pengiriman:
- Tanggal kirim: Sabtu, 7 November 2026
- Jam/sesi kirim: Pagi, sebelum 10.00
- Nama penerima: Ibu Sari
- Alamat pengiriman: Jl. Melati No. 5, Bekasi Timur
- Teks kartu/papan ucapan: Selamat ulang tahun, Ma! Semoga selalu sehat.
- Nama pengirim: Rina

Mohon info ketersediaan, ongkos kirim, dan cara pembayarannya. Terima kasih!
```

- Isian disimpan sebagai draf di `localStorage` browser pengunjung (kunci `ajf_kirim_v1`), jadi tidak hilang saat pindah halaman. Draf dihapus saat **Kosongkan keranjang** ditekan; tanggal kirim yang sudah lewat dibuang otomatis.
- Setiap isian punya `maxlength` (mis. alamat 250, teks ucapan 200 karakter) supaya link WhatsApp tidak terlalu panjang.
- Untuk mengganti urutan atau label baris di pesan, ubah `FIELD_KIRIM` di `assets/js/cart.js`. Atribut `name` di form harus sama dengan `kunci` di sana.

Tidak ada pembayaran online; pembayaran dan ongkos kirim disepakati lewat chat.

## Self-check

Butuh [Node.js](https://nodejs.org/) (tanpa `npm install`). Dari folder repo:

```bash
node tests/pesan.test.js
```

```bash
node tests/seo.test.js
```

- `pesan.test.js` mengecek penyusunan pesan WhatsApp: isian kosong tidak muncul, isian terisi muncul berurutan, total benar, form sama di keempat HTML, dan panjang link tetap wajar.
- `seo.test.js` mengecek JSON-LD (struktur valid dan sama dengan `config.js`), `sitemap.xml`/`robots.txt`, daftar `<noscript>` di `produk.html` (sama dengan `products.js`), dan menu Artikel.

Setiap baris `ok` berarti lulus; baris `GAGAL` menjelaskan apa yang perlu disamakan.

## Teknologi

HTML5, CSS3 (CSS variables), JavaScript vanilla. Font dari Google Fonts: Lora, Poppins, Dancing Script. Ikon berupa SVG inline.
