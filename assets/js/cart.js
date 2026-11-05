/* ==========================================================================
   Keranjang belanja: state + localStorage + drawer + checkout WhatsApp
   Hanya menyimpan { id, qty }; nama & harga selalu dibaca dari products.js.
   Data pengiriman (opsional) disimpan terpisah sebagai draf teks.
   ========================================================================== */
const Cart = (function () {
  const STORAGE_KEY = 'ajf_cart_v1';
  const KIRIM_KEY = 'ajf_kirim_v1';
  const MAX_QTY = 99;
  // Urutan & label blok "Data pengiriman" di pesan WhatsApp.
  // `kunci` = atribut name di form #cart-kirim (ada di keempat file HTML).
  const FIELD_KIRIM = [
    { kunci: 'tanggal',  label: 'Tanggal kirim' },
    { kunci: 'jam',      label: 'Jam/sesi kirim' },
    { kunci: 'penerima', label: 'Nama penerima' },
    { kunci: 'alamat',   label: 'Alamat pengiriman' },
    { kunci: 'ucapan',   label: 'Teks kartu/papan ucapan' },
    { kunci: 'pengirim', label: 'Nama pengirim' },
  ];
  const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  let items = muat();
  let kirim = muatKirim();
  let fokusSebelumnya = null;

  /* ----- State ----- */
  function muat() {
    try {
      const mentah = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!Array.isArray(mentah)) return [];
      return mentah
        .filter((i) => i && cariProduk(i.id) && Number.isInteger(i.qty) && i.qty > 0)
        .map((i) => ({ id: i.id, qty: Math.min(i.qty, MAX_QTY) }));
    } catch (e) {
      return [];
    }
  }

  function simpan() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch (e) { /* mode privat / penuh: abaikan */ }
  }

  /** Draf data pengiriman: hanya teks untuk kunci yang dikenal */
  function muatKirim() {
    try {
      const mentah = JSON.parse(localStorage.getItem(KIRIM_KEY));
      const hasil = {};
      FIELD_KIRIM.forEach((f) => {
        if (mentah && typeof mentah[f.kunci] === 'string') hasil[f.kunci] = mentah[f.kunci];
      });
      return hasil;
    } catch (e) {
      return {};
    }
  }

  function simpanKirim() {
    try {
      if (Object.keys(kirim).length) localStorage.setItem(KIRIM_KEY, JSON.stringify(kirim));
      else localStorage.removeItem(KIRIM_KEY);
    } catch (e) { /* mode privat / penuh: abaikan */ }
  }

  function jumlahTotal() { return items.reduce((n, i) => n + i.qty, 0); }
  function hitungTotal(daftar) { return daftar.reduce((n, i) => n + cariProduk(i.id).harga * i.qty, 0); }
  function hargaTotal() { return hitungTotal(items); }

  function tambah(id) {
    const ada = items.find((i) => i.id === id);
    if (ada) ada.qty = Math.min(ada.qty + 1, MAX_QTY);
    else items.push({ id: id, qty: 1 });
    perbarui();
  }

  function ubahJumlah(id, selisih) {
    const ada = items.find((i) => i.id === id);
    if (!ada) return;
    ada.qty = Math.max(1, Math.min(ada.qty + selisih, MAX_QTY));
    perbarui();
  }

  function hapus(id) {
    items = items.filter((i) => i.id !== id);
    perbarui();
  }

  function kosongkan() {
    items = [];
    kirim = {};
    simpanKirim();
    isiForm();
    perbarui();
  }

  /* ----- Pesan WhatsApp ----- */
  // Tanpa DOM & localStorage agar bisa diuji: node tests/pesan.test.js
  function susunPesan(daftar, dataKirim) {
    const baris = daftar.map((i, n) => {
      const p = cariProduk(i.id);
      return (n + 1) + '. ' + p.nama + ' x' + i.qty + ' = ' + formatRupiah(p.harga * i.qty);
    });
    const bagian = [
      'Halo ' + SITE_CONFIG.namaToko + ', saya ingin memesan:',
      '',
      baris.join('\n'),
      '',
      'Total: ' + formatRupiah(hitungTotal(daftar)),
    ];
    const pengiriman = barisPengiriman(dataKirim);
    if (pengiriman.length) bagian.push('', 'Data pengiriman:', pengiriman.join('\n'));
    bagian.push('', 'Mohon info ketersediaan, ongkos kirim, dan cara pembayarannya. Terima kasih!');
    return bagian.join('\n');
  }

  /** Hanya isian yang terisi, urut sesuai FIELD_KIRIM */
  function barisPengiriman(dataKirim) {
    const hasil = [];
    FIELD_KIRIM.forEach((f) => {
      const nilai = rapikan(dataKirim && dataKirim[f.kunci]);
      if (nilai) hasil.push('- ' + f.label + ': ' + (f.kunci === 'tanggal' ? formatTanggal(nilai) : nilai));
    });
    return hasil;
  }

  /** Buang spasi di tepi tiap baris dan baris kosong; selain teks dianggap kosong */
  function rapikan(nilai) {
    if (typeof nilai !== 'string') return '';
    return nilai.split(/\r\n?|\n/).map((s) => s.trim()).filter(Boolean).join('\n');
  }

  /** "2026-11-07" -> "Sabtu, 7 November 2026"; format lain dikirim apa adanya */
  function formatTanggal(teks) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(teks);
    if (!m) return teks;
    const d = new Date(+m[1], m[2] - 1, +m[3]);
    if (d.getFullYear() !== +m[1] || d.getMonth() !== m[2] - 1 || d.getDate() !== +m[3]) return teks;
    return HARI[d.getDay()] + ', ' + d.getDate() + ' ' + BULAN[d.getMonth()] + ' ' + d.getFullYear();
  }

  function buatPesan() { return susunPesan(items, kirim); }

  /* ----- UI ----- */
  const el = {};

  function ambilElemen() {
    el.drawer = document.getElementById('cart-drawer');
    if (!el.drawer) return false;
    el.overlay = document.getElementById('cart-overlay');
    el.list = document.getElementById('cart-items');
    el.empty = document.getElementById('cart-empty');
    el.footer = document.getElementById('cart-footer');
    el.total = document.getElementById('cart-total');
    el.checkout = document.getElementById('cart-checkout');
    el.form = document.getElementById('cart-kirim');
    el.toast = document.getElementById('toast');
    el.badges = document.querySelectorAll('[data-cart-count]');
    return true;
  }

  function perbarui() {
    simpan();
    if (!el.drawer) return;
    const n = jumlahTotal();
    el.badges.forEach((b) => {
      b.textContent = n > 99 ? '99+' : String(n);
    });
    document.querySelectorAll('[data-cart-open]').forEach((t) => {
      t.setAttribute('aria-label', 'Buka keranjang, ' + n + ' item');
    });

    el.empty.hidden = n > 0;
    el.footer.hidden = n === 0;
    if (el.form) el.form.hidden = n === 0;
    el.list.innerHTML = items.map(barisHTML).join('');
    el.total.textContent = formatRupiah(hargaTotal());
    perbaruiCheckout();
  }

  function perbaruiCheckout() {
    if (jumlahTotal() > 0) {
      el.checkout.href = waLink(buatPesan());
      el.checkout.removeAttribute('aria-disabled');
    } else {
      el.checkout.removeAttribute('href');
      el.checkout.setAttribute('aria-disabled', 'true');
    }
  }

  /* ----- Form data pengiriman ----- */
  function hariIni() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  /** Tulis draf ke form (saat awal, sinkron antar tab, dan saat dikosongkan) */
  function isiForm() {
    if (!el.form) return;
    FIELD_KIRIM.forEach((f) => {
      const input = el.form.elements[f.kunci];
      if (!input) return;
      const nilai = kirim[f.kunci] || '';
      input.value = input.maxLength > 0 ? nilai.slice(0, input.maxLength) : nilai;
    });
  }

  /** Baca isian form -> draf, lalu perbarui link checkout */
  function bacaForm() {
    if (!el.form) return;
    kirim = {};
    FIELD_KIRIM.forEach((f) => {
      const input = el.form.elements[f.kunci];
      if (input && input.value) kirim[f.kunci] = input.value;
    });
    simpanKirim();
    perbaruiCheckout();
  }

  function barisHTML(i) {
    const p = cariProduk(i.id);
    const nama = escapeHtml(p.nama);
    return (
      '<li class="cart-item" data-id="' + escapeHtml(p.id) + '">' +
        '<img class="cart-item__img" src="' + escapeHtml(p.gambar) + '" alt="" width="72" height="72" loading="lazy">' +
        '<div class="cart-item__info">' +
          '<p class="cart-item__name">' + nama + '</p>' +
          '<p class="cart-item__price">' + formatRupiah(p.harga) + '</p>' +
          '<div class="qty">' +
            '<button type="button" class="qty__btn" data-cart-dec aria-label="Kurangi jumlah ' + nama + '"' + (i.qty <= 1 ? ' disabled' : '') + '>' + ikon('minus') + '</button>' +
            '<span class="qty__value" aria-label="Jumlah ' + i.qty + '">' + i.qty + '</span>' +
            '<button type="button" class="qty__btn" data-cart-inc aria-label="Tambah jumlah ' + nama + '"' + (i.qty >= MAX_QTY ? ' disabled' : '') + '>' + ikon('plus') + '</button>' +
          '</div>' +
        '</div>' +
        '<div class="cart-item__side">' +
          '<button type="button" class="icon-btn icon-btn--sm" data-cart-remove aria-label="Hapus ' + nama + ' dari keranjang">' + ikon('trash') + '</button>' +
          '<p class="cart-item__subtotal">' + formatRupiah(p.harga * i.qty) + '</p>' +
        '</div>' +
      '</li>'
    );
  }

  function tampilkanToast(pesan) {
    if (!el.toast) return;
    el.toast.textContent = pesan;
    el.toast.classList.add('is-visible');
    clearTimeout(tampilkanToast.t);
    tampilkanToast.t = setTimeout(() => el.toast.classList.remove('is-visible'), 2200);
  }

  function elemenFokus() {
    const semua = el.drawer.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
    // Lewati yang tersembunyi (mis. form & tombol bawah saat keranjang kosong)
    return Array.prototype.filter.call(semua, (n) => n.getClientRects().length > 0);
  }

  function buka() {
    fokusSebelumnya = document.activeElement;
    el.drawer.classList.add('is-open');
    el.overlay.classList.add('is-open');
    el.drawer.removeAttribute('inert');
    el.drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    document.querySelectorAll('[data-cart-open]').forEach((t) => t.setAttribute('aria-expanded', 'true'));
    const tutup = el.drawer.querySelector('[data-cart-close]');
    if (tutup) tutup.focus();
  }

  function tutup() {
    if (!el.drawer.classList.contains('is-open')) return;
    el.drawer.classList.remove('is-open');
    el.overlay.classList.remove('is-open');
    el.drawer.setAttribute('inert', '');
    el.drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    document.querySelectorAll('[data-cart-open]').forEach((t) => t.setAttribute('aria-expanded', 'false'));
    if (fokusSebelumnya && document.contains(fokusSebelumnya)) fokusSebelumnya.focus();
  }

  function pasangEvent() {
    document.addEventListener('click', (e) => {
      const tambahBtn = e.target.closest('[data-add-to-cart]');
      if (tambahBtn) {
        const p = cariProduk(tambahBtn.getAttribute('data-add-to-cart'));
        if (!p) return;
        tambah(p.id);
        tampilkanToast(p.nama + ' ditambahkan ke keranjang');
        return;
      }
      if (e.target.closest('[data-cart-open]')) { buka(); return; }
      if (e.target.closest('[data-cart-close]') || e.target === el.overlay) { tutup(); return; }

      const baris = e.target.closest('.cart-item');
      if (baris && el.drawer.contains(baris)) {
        const id = baris.getAttribute('data-id');
        if (e.target.closest('[data-cart-inc]')) ubahJumlah(id, 1);
        else if (e.target.closest('[data-cart-dec]')) ubahJumlah(id, -1);
        else if (e.target.closest('[data-cart-remove]')) hapus(id);
        return;
      }
      if (e.target.closest('#cart-clear')) kosongkan();
    });

    el.checkout.addEventListener('click', (e) => {
      if (el.checkout.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      bacaForm(); // jaga-jaga: isian terakhir pasti ikut sebelum link dibuka
    });

    if (el.form) {
      el.form.addEventListener('input', bacaForm);
      el.form.addEventListener('change', bacaForm);
      el.form.addEventListener('submit', (e) => e.preventDefault()); // Enter tidak memuat ulang halaman
    }

    document.addEventListener('keydown', (e) => {
      if (!el.drawer.classList.contains('is-open')) return;
      if (e.key === 'Escape') { tutup(); return; }
      if (e.key === 'Tab') { // fokus tidak keluar dari drawer
        const f = elemenFokus();
        if (!f.length) return;
        const awal = f[0], akhir = f[f.length - 1];
        if (e.shiftKey && document.activeElement === awal) { e.preventDefault(); akhir.focus(); }
        else if (!e.shiftKey && document.activeElement === akhir) { e.preventDefault(); awal.focus(); }
      }
    });

    // Sinkron antar tab browser
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY) { items = muat(); perbarui(); }
      if (e.key === KIRIM_KEY) { kirim = muatKirim(); isiForm(); perbaruiCheckout(); }
    });
  }

  function init() {
    if (!ambilElemen()) return;
    el.drawer.setAttribute('inert', '');
    const tanggal = el.form && el.form.elements.tanggal;
    if (tanggal) {
      tanggal.min = hariIni();
      // Draf lama dengan tanggal yang sudah lewat tidak dipakai lagi
      if (/^\d{4}-\d{2}-\d{2}$/.test(kirim.tanggal || '') && kirim.tanggal < tanggal.min) {
        delete kirim.tanggal;
        simpanKirim();
      }
    }
    isiForm();
    pasangEvent();
    perbarui();
  }

  return {
    init: init, tambah: tambah, hapus: hapus, kosongkan: kosongkan, jumlah: jumlahTotal, total: hargaTotal,
    buatPesan: buatPesan, susunPesan: susunPesan, FIELD_KIRIM: FIELD_KIRIM,
  };
})();

document.addEventListener('DOMContentLoaded', Cart.init);
