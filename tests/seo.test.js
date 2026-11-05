/* ==========================================================================
   Self-check SEO & menu (tanpa browser).
   Jalankan dari folder repo:  node tests/seo.test.js
   Memeriksa JSON-LD vs config.js, sitemap.xml & robots.txt, daftar produk
   <noscript> di produk.html vs products.js, dan menu Artikel vs noindex.
   ========================================================================== */
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const AKAR = path.join(__dirname, '..');
const baca = (f) => fs.readFileSync(path.join(AKAR, f), 'utf8');
const HTML = ['index.html', 'produk.html', 'artikel.html', 'kebijakan.html'];

// Data asli situs (JSON bolak-balik agar objeknya biasa, bukan milik konteks vm)
const konteks = vm.createContext({});
['assets/js/config.js', 'assets/js/products.js', 'assets/js/utils.js'].forEach((f) => vm.runInContext(baca(f), konteks, { filename: f }));
const { SITE_CONFIG, KATEGORI, PRODUK } = JSON.parse(vm.runInContext('JSON.stringify({ SITE_CONFIG, KATEGORI, PRODUK })', konteks));
const formatRupiah = vm.runInContext('formatRupiah', konteks);

const atribut = (html, pola, f) => {
  const m = html.match(pola);
  assert.ok(m, f + ': ' + pola + ' tidak ditemukan');
  return m[1];
};
const canonical = (f) => atribut(baca(f), /<link rel="canonical" href="([^"]+)">/, f);
const noindex = (f) => /<meta name="robots" content="[^"]*noindex/.test(baca(f));
const BASE = canonical('index.html');

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

console.log('seo.test.js');

uji('JSON-LD Florist di index.html: JSON valid, struktur lengkap, sama dengan config.js', () => {
  const index = baca('index.html');
  const blok = index.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g) || [];
  assert.strictEqual(blok.length, 1, 'harus ada tepat satu blok JSON-LD');
  const ld = JSON.parse(blok[0].replace(/^<script[^>]*>|<\/script>$/g, '')); // gagal di sini = JSON tidak valid

  assert.strictEqual(ld['@context'], 'https://schema.org');
  assert.strictEqual(ld['@type'], 'Florist');
  assert.strictEqual(ld.name, SITE_CONFIG.namaToko, 'name vs config.namaToko');
  assert.strictEqual(ld.url, BASE, 'url vs canonical index.html');
  assert.strictEqual(ld.image, atribut(index, /<meta property="og:image" content="([^"]+)">/, 'index.html'), 'image vs og:image');
  assert.strictEqual(ld.telephone, '+' + SITE_CONFIG.whatsappNumber, 'telephone vs config.whatsappNumber');
  assert.strictEqual(ld.email, SITE_CONFIG.email, 'email vs config.email');

  assert.strictEqual(ld.address['@type'], 'PostalAddress');
  assert.ok(SITE_CONFIG.alamat.includes(ld.address.addressLocality), 'addressLocality "' + ld.address.addressLocality + '" tidak ada di config.alamat');
  assert.strictEqual(ld.address.addressCountry, 'ID');

  const jam = SITE_CONFIG.jamBuka.match(/(\d{2})[.:](\d{2})\s*-\s*(\d{2})[.:](\d{2})/);
  assert.ok(jam, 'format config.jamBuka tidak dikenali; periksa openingHoursSpecification secara manual');
  const HARI = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const spek = ld.openingHoursSpecification;
  assert.ok(Array.isArray(spek) && spek.length > 0, 'openingHoursSpecification kosong');
  const hariBuka = new Set();
  spek.forEach((s) => {
    assert.strictEqual(s['@type'], 'OpeningHoursSpecification');
    assert.strictEqual(s.opens, jam[1] + ':' + jam[2], 'opens vs config.jamBuka');
    assert.strictEqual(s.closes, jam[3] + ':' + jam[4], 'closes vs config.jamBuka');
    s.dayOfWeek.forEach((d) => { assert.ok(HARI.includes(d), 'dayOfWeek tidak dikenal: ' + d); hariBuka.add(d); });
  });
  if (/Senin\s*-\s*Minggu/.test(SITE_CONFIG.jamBuka)) assert.strictEqual(hariBuka.size, 7, 'jamBuka "Senin - Minggu" = 7 hari');
});

uji('sitemap.xml memuat semua halaman tanpa noindex (dan hanya itu); robots.txt menunjuk ke sitemap', () => {
  const sitemap = baca('sitemap.xml');
  assert.ok(sitemap.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
  assert.ok(sitemap.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'));
  const loc = Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g), (m) => m[1]);
  assert.strictEqual(new Set(loc).size, loc.length, 'ada URL ganda');
  loc.forEach((u) => assert.ok(HTML.some((f) => canonical(f) === u), u + ' bukan URL canonical halaman mana pun'));
  HTML.forEach((f) => {
    const ada = loc.includes(canonical(f));
    if (noindex(f)) assert.ok(!ada, f + ' ber-noindex tetapi ada di sitemap.xml');
    else assert.ok(ada, f + ' belum ada di sitemap.xml');
  });
  assert.ok(baca('robots.txt').split('\n').includes('Sitemap: ' + BASE + 'sitemap.xml'), 'baris Sitemap di robots.txt');
});

uji('artikel.html: selama noindex, tidak ditautkan dari navbar/footer (dan sebaliknya)', () => {
  HTML.forEach((f) => {
    const tanpaKomentar = baca(f).replace(/<!--[\s\S]*?-->/g, '');
    const tautan = (tanpaKomentar.match(/href="artikel\.html"/g) || []).length;
    if (noindex('artikel.html')) assert.strictEqual(tautan, 0, f + ' masih menautkan artikel.html');
    else assert.ok(tautan >= 2, f + ': menu Artikel belum dimunculkan lagi di navbar dan footer');
  });
});

uji('daftar <noscript> di produk.html sama dengan products.js', () => {
  const m = baca('produk.html').match(/<div class="noscript noscript-katalog">([\s\S]*?)<\/div>\s*<\/noscript>/);
  assert.ok(m, 'blok <noscript> katalog tidak ditemukan');
  const teks = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').trim();
  const statis = Array.from(m[1].matchAll(/<h2>([\s\S]*?)<\/h2>\s*<ul>([\s\S]*?)<\/ul>/g), (g) => ({
    kategori: teks(g[1]),
    produk: Array.from(g[2].matchAll(/<li>([\s\S]*?)<\/li>/g), (li) => teks(li[1])),
  }));
  const harapan = KATEGORI.map((k) => ({
    kategori: k.nama,
    produk: PRODUK.filter((p) => p.kategori === k.slug).map((p) => p.nama + ' — ' + formatRupiah(p.harga)),
  }));
  assert.deepStrictEqual(statis, harapan, 'perbarui <noscript> di produk.html agar sama dengan products.js');
});

if (gagal) {
  console.log('\n' + gagal + ' pengujian gagal');
  process.exitCode = 1;
} else {
  console.log('\nSemua lulus');
}
