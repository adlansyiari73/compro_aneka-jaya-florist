/* ==========================================================================
   Halaman produk: filter kategori, pencarian nama, urutan.
   Parameter URL: ?kategori=<slug>&q=<kata>&urut=<opsi>
   ========================================================================== */
(function () {
  'use strict';

  const state = { kategori: 'semua', q: '', urut: 'relevan' };
  const URUTAN = ['relevan', 'harga-asc', 'harga-desc', 'rating'];
  const el = {};

  function bacaUrl() {
    const params = new URLSearchParams(window.location.search);
    const k = params.get('kategori');
    if (k && KATEGORI.some((x) => x.slug === k)) state.kategori = k;
    state.q = (params.get('q') || '').trim();
    const u = params.get('urut');
    if (URUTAN.indexOf(u) !== -1) state.urut = u;
  }

  function tulisUrl() {
    const params = new URLSearchParams();
    if (state.kategori !== 'semua') params.set('kategori', state.kategori);
    if (state.q) params.set('q', state.q);
    if (state.urut !== 'relevan') params.set('urut', state.urut);
    const qs = params.toString();
    try { history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : '')); } catch (e) { /* file:// tertentu */ }
  }

  function normal(teks) {
    return teks.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  function hasil() {
    const kata = normal(state.q);
    let daftar = PRODUK.filter((p) =>
      (state.kategori === 'semua' || p.kategori === state.kategori) &&
      (!kata || normal(p.nama).indexOf(kata) !== -1)
    );
    if (state.urut === 'harga-asc') daftar = daftar.slice().sort((a, b) => a.harga - b.harga);
    else if (state.urut === 'harga-desc') daftar = daftar.slice().sort((a, b) => b.harga - a.harga);
    else if (state.urut === 'rating') daftar = daftar.slice().sort((a, b) => b.rating - a.rating || b.jumlahUlasan - a.jumlahUlasan);
    return daftar;
  }

  function renderChip() {
    const semua = [{ slug: 'semua', nama: 'Semua' }].concat(KATEGORI);
    el.chips.innerHTML = semua.map((k) =>
      '<li><button type="button" class="chip" data-kategori="' + k.slug + '" aria-pressed="' + (state.kategori === k.slug) + '">' + escapeHtml(k.nama) + '</button></li>'
    ).join('');
  }

  function render() {
    const daftar = hasil();
    el.grid.innerHTML = daftar.map((p) => '<li>' + kartuProdukHTML(p) + '</li>').join('');
    el.empty.hidden = daftar.length > 0;
    el.grid.hidden = daftar.length === 0;

    const namaK = state.kategori === 'semua' ? 'Semua Produk' : namaKategori(state.kategori);
    el.title.textContent = namaK;
    document.title = namaK + ' — Aneka Jaya Florist';

    let info = daftar.length + ' produk ditemukan';
    if (state.q) info += ' untuk “' + state.q + '”';
    el.count.textContent = info;

    el.chips.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c.getAttribute('data-kategori') === state.kategori)));
    el.search.value = state.q;
    el.sort.value = state.urut;
    tulisUrl();
  }

  function init() {
    el.chips = document.getElementById('filter-chips');
    if (!el.chips) return;
    el.grid = document.getElementById('product-grid');
    el.empty = document.getElementById('empty-state');
    el.count = document.getElementById('result-count');
    el.title = document.getElementById('catalog-title');
    el.search = document.getElementById('catalog-search');
    el.sort = document.getElementById('sort-select');

    bacaUrl();
    renderChip();
    render();

    el.chips.addEventListener('click', (e) => {
      const b = e.target.closest('[data-kategori]');
      if (!b) return;
      state.kategori = b.getAttribute('data-kategori');
      render();
    });
    el.search.addEventListener('input', () => { state.q = el.search.value.trim(); render(); });
    document.getElementById('catalog-search-form').addEventListener('submit', (e) => e.preventDefault());
    el.sort.addEventListener('change', () => { state.urut = el.sort.value; render(); });
    document.getElementById('reset-filters').addEventListener('click', () => {
      state.kategori = 'semua'; state.q = ''; state.urut = 'relevan';
      render();
      el.search.focus();
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
