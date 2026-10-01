/* ==========================================================================
   Data kategori & produk.
   - gambar : path relatif dari root situs (folder assets/img/)
              Untuk memakai foto asli, simpan foto dengan nama yang sama lalu
              ubah ekstensinya di sini (mis. .svg -> .jpg).
   - harga  : angka rupiah tanpa titik (350000 = Rp 350.000)
   - unggulan: true = tampil di carousel "Produk Pilihan" di beranda
   ========================================================================== */
const KATEGORI = [
  { slug: 'buket-bunga',      nama: 'Buket Bunga',      gambar: 'assets/img/kategori-buket-bunga.svg' },
  { slug: 'bunga-papan',      nama: 'Bunga Papan',      gambar: 'assets/img/kategori-bunga-papan.svg' },
  { slug: 'standing-flower',  nama: 'Standing Flower',  gambar: 'assets/img/kategori-standing-flower.svg' },
  { slug: 'bunga-meja',       nama: 'Bunga Meja',       gambar: 'assets/img/kategori-bunga-meja.svg' },
  { slug: 'hand-bouquet',     nama: 'Hand Bouquet',     gambar: 'assets/img/kategori-hand-bouquet.svg' },
  { slug: 'bunga-duka-cita',  nama: 'Bunga Duka Cita',  gambar: 'assets/img/kategori-bunga-duka-cita.svg' },
  { slug: 'bunga-artificial', nama: 'Bunga Artificial', gambar: 'assets/img/kategori-bunga-artificial.svg' },
  { slug: 'hadiah-lainnya',   nama: 'Hadiah Lainnya',   gambar: 'assets/img/kategori-hadiah-lainnya.svg' },
];

const PRODUK = [
  // Buket Bunga
  { id: 'buket-mawar-pink',      nama: 'Buket Mawar Pink Elegan',      kategori: 'buket-bunga', harga: 350000, rating: 4.9, jumlahUlasan: 120, gambar: 'assets/img/buket-mawar-pink.svg',      unggulan: true },
  { id: 'buket-mawar-merah',     nama: 'Buket Mawar Merah Premium',    kategori: 'buket-bunga', harga: 500000, rating: 4.9, jumlahUlasan: 98,  gambar: 'assets/img/buket-mawar-merah.svg',     unggulan: true },
  { id: 'buket-pastel-lembut',   nama: 'Buket Pastel Lembut',          kategori: 'buket-bunga', harga: 425000, rating: 4.8, jumlahUlasan: 64,  gambar: 'assets/img/buket-pastel-lembut.svg' },
  { id: 'buket-mawar-putih',     nama: 'Buket Mawar Putih Klasik',     kategori: 'buket-bunga', harga: 450000, rating: 4.7, jumlahUlasan: 41,  gambar: 'assets/img/buket-mawar-putih.svg' },

  // Bunga Papan
  { id: 'papan-congratulations', nama: 'Bunga Papan Congratulations',  kategori: 'bunga-papan', harga: 750000, rating: 4.8, jumlahUlasan: 36,  gambar: 'assets/img/bunga-papan-congratulations.svg', unggulan: true },
  { id: 'papan-selamat-sukses',  nama: 'Bunga Papan Selamat & Sukses', kategori: 'bunga-papan', harga: 850000, rating: 4.8, jumlahUlasan: 29,  gambar: 'assets/img/bunga-papan-selamat-sukses.svg' },

  // Standing Flower
  { id: 'standing-grand-opening', nama: 'Standing Flower Grand Opening', kategori: 'standing-flower', harga: 600000, rating: 4.7, jumlahUlasan: 33, gambar: 'assets/img/standing-flower-grand-opening.svg' },
  { id: 'standing-selamat-menikah', nama: 'Standing Flower Selamat Menikah', kategori: 'standing-flower', harga: 700000, rating: 4.9, jumlahUlasan: 47, gambar: 'assets/img/standing-flower-selamat.svg', unggulan: true },

  // Bunga Meja
  { id: 'meja-cantik',           nama: 'Bunga Meja Cantik',            kategori: 'bunga-meja',  harga: 250000, rating: 4.8, jumlahUlasan: 74,  gambar: 'assets/img/bunga-meja-cantik.svg',     unggulan: true },
  { id: 'meja-putih-segar',      nama: 'Bunga Meja Putih Segar',       kategori: 'bunga-meja',  harga: 275000, rating: 4.7, jumlahUlasan: 52,  gambar: 'assets/img/bunga-meja-putih-segar.svg' },

  // Hand Bouquet
  { id: 'hand-pastel',           nama: 'Hand Bouquet Pastel',          kategori: 'hand-bouquet', harga: 300000, rating: 4.8, jumlahUlasan: 58, gambar: 'assets/img/hand-bouquet-pastel.svg' },
  { id: 'hand-wisuda',           nama: 'Hand Bouquet Wisuda',          kategori: 'hand-bouquet', harga: 275000, rating: 4.9, jumlahUlasan: 83, gambar: 'assets/img/hand-bouquet-wisuda.svg', unggulan: true },

  // Bunga Duka Cita
  { id: 'duka-standing',         nama: 'Standing Flower Duka Cita',    kategori: 'bunga-duka-cita', harga: 650000, rating: 4.8, jumlahUlasan: 52, gambar: 'assets/img/standing-flower-duka-cita.svg', unggulan: true },
  { id: 'duka-putih-anggun',     nama: 'Bunga Duka Cita Putih Anggun', kategori: 'bunga-duka-cita', harga: 800000, rating: 4.9, jumlahUlasan: 38, gambar: 'assets/img/bunga-duka-cita-putih.svg' },

  // Bunga Artificial
  { id: 'anggrek-artificial',    nama: 'Anggrek Bulan Artificial',     kategori: 'bunga-artificial', harga: 300000, rating: 4.9, jumlahUlasan: 41, gambar: 'assets/img/anggrek-bulan-artificial.svg', unggulan: true },
  { id: 'mawar-artificial-vas',  nama: 'Mawar Artificial dalam Vas',   kategori: 'bunga-artificial', harga: 225000, rating: 4.6, jumlahUlasan: 27, gambar: 'assets/img/mawar-artificial-vas.svg' },

  // Hadiah Lainnya
  { id: 'hadiah-teddy',          nama: 'Boneka Teddy & Bunga',         kategori: 'hadiah-lainnya', harga: 320000, rating: 4.8, jumlahUlasan: 66, gambar: 'assets/img/boneka-teddy-bunga.svg', unggulan: true },
  { id: 'hadiah-hampers',        nama: 'Hampers Bunga & Cokelat',      kategori: 'hadiah-lainnya', harga: 400000, rating: 4.7, jumlahUlasan: 35, gambar: 'assets/img/hampers-bunga-cokelat.svg' },
];
