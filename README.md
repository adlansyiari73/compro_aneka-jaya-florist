# Aneka Jaya Florist

Website company profile + katalog toko bunga **Aneka Jaya Florist**. 100% statis (HTML, CSS, JavaScript vanilla), tanpa framework dan tanpa build step, sehingga bisa langsung di-hosting di GitHub Pages.

- Beranda: hero, kategori populer, carousel produk pilihan, tentang kami, testimoni
- Katalog produk dengan filter kategori, pencarian nama, dan pengurutan
- Keranjang (drawer) yang tersimpan di `localStorage`, checkout lewat pesan WhatsApp
- Responsif (mobile, tablet, desktop) dengan menu hamburger di mobile

## Struktur folder

```
index.html          Beranda
produk.html         Katalog produk (?kategori=<slug>&q=<kata>&urut=<opsi>)
artikel.html        Halaman "segera hadir"
kebijakan.html      Kebijakan Privasi + Syarat & Ketentuan (draf, mohon ditinjau)
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

## Mengubah isi menu, header, dan footer

Karena situs tanpa build step, header dan footer tertulis di setiap file HTML (diberi komentar `HEADER` dan `FOOTER`). Jika mengubah menu atau footer, salin perubahannya ke keempat file: `index.html`, `produk.html`, `artikel.html`, `kebijakan.html`.

## Mengaktifkan GitHub Pages

1. Pastikan semua perubahan sudah di-merge ke branch `main` (atau branch yang akan dipublikasikan).
2. Di GitHub, buka repo → **Settings** → **Pages**.
3. Pada **Build and deployment**, pilih **Source: Deploy from a branch**.
4. Pilih **Branch: `main`** dan folder **`/ (root)`**, lalu klik **Save**.
5. Tunggu 1–2 menit. Situs tersedia di `https://<username>.github.io/<nama-repo>/`
   (untuk repo ini: `https://adlansyiari73.github.io/compro_aneka-jaya-florist/`).

Semua path di situs ini relatif, jadi berjalan baik di subfolder repo. File `.nojekyll` sudah disertakan.

Jika alamat situs Anda berbeda (mis. domain sendiri), ubah URL `canonical`, `og:url`, dan `og:image` di bagian `<head>` keempat file HTML.

## Cara kerja checkout WhatsApp

Tombol **Pesan via WhatsApp** di keranjang membuka `https://wa.me/<nomor>?text=...` dengan pesan berisi daftar item, jumlah, subtotal, dan total, misalnya:

```
Halo Aneka Jaya Florist, saya ingin memesan:

1. Buket Mawar Pink Elegan x2 = Rp 700.000
2. Buket Mawar Merah Premium x1 = Rp 500.000

Total: Rp 1.200.000
```

Tidak ada pembayaran online; pembayaran dan ongkos kirim disepakati lewat chat.

## Teknologi

HTML5, CSS3 (CSS variables), JavaScript vanilla. Font dari Google Fonts: Lora, Poppins, Dancing Script. Ikon berupa SVG inline.
