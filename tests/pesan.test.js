/* ==========================================================================
   Self-check penyusun pesan WhatsApp keranjang (tanpa browser).
   Jalankan dari folder repo:  node tests/pesan.test.js
   utils.js + cart.js dimuat apa adanya dengan data produk contoh, jadi
   tidak ikut gagal saat harga di products.js / data di config.js diubah.
   ========================================================================== */
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const AKAR = path.join(__dirname, '..');
const baca = (f) => fs.readFileSync(path.join(AKAR, f), 'utf8');

const konteks = vm.createContext({
  SITE_CONFIG: { namaToko: 'Toko Uji', whatsappNumber: '6280000000000' },
  KATEGORI: [],
  PRODUK: [
    { id: 'a', nama: 'Buket A', harga: 350000 },
    { id: 'b', nama: 'Papan B', harga: 1250000 },
    { id: 'c', nama: 'Meja C', harga: 99500 },
  ],
  document: { addEventListener() {} }, // cart.js mendaftarkan init ke DOMContentLoaded
});
['assets/js/utils.js', 'assets/js/cart.js'].forEach((f) => vm.runInContext(baca(f), konteks, { filename: f }));
const Cart = vm.runInContext('Cart', konteks);
const waLink = vm.runInContext('waLink', konteks);

const KERANJANG = [{ id: 'a', qty: 2 }, { id: 'b', qty: 1 }];
const PENUTUP = 'Mohon info ketersediaan, ongkos kirim, dan cara pembayarannya. Terima kasih!';
const HTML = ['index.html', 'produk.html', 'artikel.html', 'kebijakan.html'];

let gagal = 0;
function uji(nama, fn) {
  try {
    fn();
    console.log('  ok     ' + nama);
  } catch (e) {
    gagal++;
    console.log('  GAGAL  ' + nama + '\n         ' + String(e.message).split('\n').join('\n         '));
  }
}

console.log('pesan.test.js');

uji('tanpa data pengiriman: daftar item dan total benar', () => {
  assert.strictEqual(Cart.susunPesan(KERANJANG, {}), [
    'Halo Toko Uji, saya ingin memesan:',
    '',
    '1. Buket A x2 = Rp 700.000',
    '2. Papan B x1 = Rp 1.250.000',
    '',
    'Total: Rp 1.950.000',
    '',
    PENUTUP,
  ].join('\n'));
});

uji('total dihitung dari daftar yang diberikan (3 item, harga tidak bulat)', () => {
  const pesan = Cart.susunPesan([{ id: 'a', qty: 1 }, { id: 'b', qty: 2 }, { id: 'c', qty: 3 }], { penerima: 'Sari' });
  assert.ok(pesan.includes('\n3. Meja C x3 = Rp 298.500\n'), pesan);
  assert.ok(pesan.includes('\nTotal: Rp 3.148.500\n'), pesan);
});

uji('isian kosong, spasi saja, atau bukan teks tidak memunculkan blok', () => {
  const dasar = Cart.susunPesan(KERANJANG, {});
  assert.ok(!dasar.includes('Data pengiriman'));
  [
    undefined,
    null,
    { tanggal: '', jam: '   ', penerima: '\n \n', alamat: null, ucapan: 123, pengirim: undefined },
    { kunciLain: 'diabaikan' },
  ].forEach((kirim) => assert.strictEqual(Cart.susunPesan(KERANJANG, kirim), dasar, JSON.stringify(kirim)));
});

uji('semua isian muncul berurutan setelah total, sebelum kalimat penutup', () => {
  // Kunci sengaja diisi dengan urutan terbalik: urutan pesan tetap mengikuti form
  const pesan = Cart.susunPesan(KERANJANG, {
    pengirim: 'Andi',
    ucapan: 'Selamat & Sukses',
    alamat: 'Jl. Melati No. 5, Bekasi',
    penerima: 'Ibu Sari',
    jam: 'pagi',
    tanggal: '2026-11-07',
  });
  const baris = pesan.split('\n');
  assert.deepStrictEqual(baris.slice(baris.indexOf('Total: Rp 1.950.000')), [
    'Total: Rp 1.950.000',
    '',
    'Data pengiriman:',
    '- Tanggal kirim: Sabtu, 7 November 2026',
    '- Jam/sesi kirim: pagi',
    '- Nama penerima: Ibu Sari',
    '- Alamat pengiriman: Jl. Melati No. 5, Bekasi',
    '- Teks kartu/papan ucapan: Selamat & Sukses',
    '- Nama pengirim: Andi',
    '',
    PENUTUP,
  ]);
});

uji('sebagian isian: hanya yang terisi yang muncul, urutan tetap', () => {
  const pesan = Cart.susunPesan(KERANJANG, { pengirim: 'Andi', jam: '', penerima: 'Ibu Sari' });
  assert.ok(pesan.endsWith('Total: Rp 1.950.000\n\nData pengiriman:\n- Nama penerima: Ibu Sari\n- Nama pengirim: Andi\n\n' + PENUTUP), pesan);
  ['Tanggal kirim', 'Jam/sesi kirim', 'Alamat pengiriman', 'Teks kartu/papan ucapan']
    .forEach((label) => assert.ok(!pesan.includes(label), label + ' seharusnya tidak muncul'));
});

uji('teks dirapikan: spasi tepi & baris kosong dibuang, baris baru dipertahankan', () => {
  const pesan = Cart.susunPesan(KERANJANG, {
    penerima: '  Ibu Sari ',
    ucapan: '  Turut Berduka Cita  \r\n\r\n  Keluarga Besar PT Maju  \n',
  });
  assert.ok(pesan.includes('- Nama penerima: Ibu Sari\n- Teks kartu/papan ucapan: Turut Berduka Cita\nKeluarga Besar PT Maju\n\n' + PENUTUP), pesan);
});

uji('tanggal ditulis dalam bahasa Indonesia; teks lain dikirim apa adanya', () => {
  const tanggal = (t) => Cart.susunPesan(KERANJANG, { tanggal: t }).match(/- Tanggal kirim: (.*)/)[1];
  assert.strictEqual(tanggal('2026-11-07'), 'Sabtu, 7 November 2026');
  assert.strictEqual(tanggal('2027-01-01'), 'Jumat, 1 Januari 2027');
  assert.strictEqual(tanggal('2026-02-30'), '2026-02-30'); // tanggal tidak ada
  assert.strictEqual(tanggal('7/11/2026'), '7/11/2026');   // browser tanpa pemilih tanggal
});

// Form di HTML harus cocok dengan FIELD_KIRIM, kalau tidak isiannya diam-diam hilang dari pesan
const formDi = (f) => {
  const m = baca(f).match(/<form class="cart-form" id="cart-kirim"[\s\S]*?<\/form>/);
  assert.ok(m, f + ': form #cart-kirim tidak ditemukan');
  return m[0];
};

uji('form #cart-kirim identik di keempat HTML dan name-nya sesuai FIELD_KIRIM', () => {
  const acuan = formDi('index.html');
  HTML.forEach((f) => assert.ok(formDi(f) === acuan, f + ': form berbeda dari index.html, salin ulang'));
  const nama = Array.from(acuan.matchAll(/name="([^"]+)"/g), (m) => m[1]);
  assert.deepStrictEqual(nama, Array.from(Cart.FIELD_KIRIM, (f) => f.kunci));
});

uji('URL wa.me (3 produk + semua isian sepanjang maxlength) di bawah 2.000 karakter', () => {
  const acuan = formDi('index.html');
  const maks = {};
  for (const m of acuan.matchAll(/name="([^"]+)"[^>]*?maxlength="(\d+)"/g)) maks[m[1]] = Number(m[2]);
  Cart.FIELD_KIRIM.forEach((f) => {
    if (f.kunci !== 'tanggal') assert.ok(maks[f.kunci] > 0, f.kunci + ' belum punya maxlength');
  });
  const isi = (n) => 'Kata '.repeat(Math.ceil(n / 5)).slice(0, n);
  const kirim = { tanggal: '2026-11-07' };
  Object.keys(maks).forEach((k) => { kirim[k] = isi(maks[k]); });
  const url = waLink(Cart.susunPesan([{ id: 'a', qty: 1 }, { id: 'b', qty: 1 }, { id: 'c', qty: 1 }], kirim));
  assert.ok(url.length < 2000, 'panjang URL ' + url.length);
  console.log('         (panjang URL: ' + url.length + ' karakter)');
});

if (gagal) {
  console.log('\n' + gagal + ' pengujian gagal');
  process.exitCode = 1;
} else {
  console.log('\nSemua lulus');
}
