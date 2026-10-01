/* ==========================================================================
   Fungsi bantu bersama
   ========================================================================== */

/** 350000 -> "Rp 350.000" */
function formatRupiah(angka) {
  return 'Rp ' + String(Math.round(angka)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function escapeHtml(teks) {
  return String(teks).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function cariProduk(id) {
  return PRODUK.find((p) => p.id === id);
}

function namaKategori(slug) {
  const k = KATEGORI.find((x) => x.slug === slug);
  return k ? k.nama : '';
}

/** Tautan wa.me dengan pesan terisi */
function waLink(pesan) {
  return 'https://wa.me/' + SITE_CONFIG.whatsappNumber + '?text=' + encodeURIComponent(pesan);
}

/** Ikon dari sprite SVG di halaman */
function ikon(nama, kelas) {
  return '<svg class="icon ' + (kelas || '') + '" aria-hidden="true" focusable="false"><use href="#i-' + nama + '"/></svg>';
}

/** HTML kartu produk (dipakai di carousel beranda dan katalog) */
function kartuProdukHTML(p) {
  const nama = escapeHtml(p.nama);
  return (
    '<article class="product-card">' +
      '<div class="product-card__media">' +
        '<img src="' + escapeHtml(p.gambar) + '" alt="' + nama + '" width="600" height="600" loading="lazy" decoding="async">' +
      '</div>' +
      '<div class="product-card__body">' +
        '<p class="product-card__cat">' + escapeHtml(namaKategori(p.kategori)) + '</p>' +
        '<h3 class="product-card__name">' + nama + '</h3>' +
        '<div class="product-card__meta">' +
          '<span class="product-card__price">' + formatRupiah(p.harga) + '</span>' +
          '<span class="rating" aria-label="Rating ' + p.rating + ' dari 5, ' + p.jumlahUlasan + ' ulasan">' +
            ikon('star') + '<span aria-hidden="true">' + p.rating.toFixed(1) + ' <span class="rating__count">(' + p.jumlahUlasan + ')</span></span>' +
          '</span>' +
        '</div>' +
        '<button type="button" class="btn btn--outline btn--block btn--sm" data-add-to-cart="' + escapeHtml(p.id) + '" aria-label="Tambah ' + nama + ' ke keranjang">' +
          ikon('plus') + ' Keranjang' +
        '</button>' +
      '</div>' +
    '</article>'
  );
}
