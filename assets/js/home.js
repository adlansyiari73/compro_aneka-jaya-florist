/* ==========================================================================
   Beranda: kartu kategori + carousel produk pilihan
   ========================================================================== */
(function () {
  'use strict';

  function renderKategori() {
    const grid = document.getElementById('category-grid');
    if (!grid) return;
    grid.innerHTML = KATEGORI.map((k) =>
      '<li><a class="category-card" href="produk.html?kategori=' + encodeURIComponent(k.slug) + '">' +
        '<img src="' + escapeHtml(k.gambar) + '" alt="" width="600" height="480" loading="lazy" decoding="async">' +
        '<span class="category-card__label">' + escapeHtml(k.nama) + '</span>' +
      '</a></li>'
    ).join('');
  }

  function renderCarousel() {
    const track = document.getElementById('featured-track');
    if (!track) return;
    track.innerHTML = PRODUK.filter((p) => p.unggulan)
      .map((p) => '<li class="carousel__item">' + kartuProdukHTML(p) + '</li>')
      .join('');

    const prev = document.getElementById('featured-prev');
    const next = document.getElementById('featured-next');
    const kurangiGerak = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const geser = (arah) => {
      const item = track.querySelector('.carousel__item');
      const lebar = item ? item.getBoundingClientRect().width + 20 : track.clientWidth * 0.8;
      const jumlah = Math.max(1, Math.floor(track.clientWidth / lebar));
      track.scrollBy({ left: arah * lebar * jumlah, behavior: kurangiGerak ? 'auto' : 'smooth' });
    };
    const status = () => {
      const maks = track.scrollWidth - track.clientWidth - 2;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= maks;
    };

    prev.addEventListener('click', () => geser(-1));
    next.addEventListener('click', () => geser(1));
    track.addEventListener('scroll', status, { passive: true });
    window.addEventListener('resize', status);
    status();
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderKategori();
    renderCarousel();
  });
})();
