/* ==========================================================================
   Perilaku umum: data dari config, navbar, pencarian, back-to-top
   ========================================================================== */
(function () {
  'use strict';

  const kurangiGerak = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----- Isi data toko dari SITE_CONFIG ----- */
  function isiConfig() {
    document.querySelectorAll('[data-config]').forEach((n) => {
      const nilai = SITE_CONFIG[n.getAttribute('data-config')];
      if (typeof nilai === 'string') n.textContent = nilai;
    });
    document.querySelectorAll('[data-wa-link]').forEach((a) => {
      a.href = waLink(a.getAttribute('data-wa-message') || SITE_CONFIG.pesanUmum);
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    });
    document.querySelectorAll('[data-tel-link]').forEach((a) => { a.href = 'tel:+' + SITE_CONFIG.whatsappNumber; });
    document.querySelectorAll('[data-mail-link]').forEach((a) => { a.href = 'mailto:' + SITE_CONFIG.email; });
    document.querySelectorAll('[data-social]').forEach((a) => {
      const url = SITE_CONFIG.sosmed[a.getAttribute('data-social')];
      if (url && url !== '#') { a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer'; }
    });
  }

  /* ----- Navbar: hamburger + submenu ----- */
  function navbar() {
    const header = document.querySelector('.site-header');
    const toggle = document.getElementById('nav-toggle');
    const nav = document.getElementById('primary-nav');
    if (!header || !toggle || !nav) return;

    const tutupMenu = () => {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Buka menu');
    };

    toggle.addEventListener('click', () => {
      const buka = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', buka);
      toggle.setAttribute('aria-expanded', String(buka));
      toggle.setAttribute('aria-label', buka ? 'Tutup menu' : 'Buka menu');
    });

    nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', tutupMenu));

    const subs = nav.querySelectorAll('.nav__item--has-sub');
    const tutupSub = () => subs.forEach((s) => {
      s.classList.remove('is-open');
      s.querySelector('.nav__sub-toggle').setAttribute('aria-expanded', 'false');
    });
    subs.forEach((s) => {
      const btn = s.querySelector('.nav__sub-toggle');
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const buka = !s.classList.contains('is-open');
        tutupSub();
        s.classList.toggle('is-open', buka);
        btn.setAttribute('aria-expanded', String(buka));
      });
    });
    document.addEventListener('click', (e) => { if (!e.target.closest('.nav__item--has-sub')) tutupSub(); });
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      tutupSub();
      if (nav.classList.contains('is-open')) { tutupMenu(); toggle.focus(); }
    });
    window.addEventListener('resize', () => { if (window.innerWidth > 1024) tutupMenu(); });

    const bayangan = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    window.addEventListener('scroll', bayangan, { passive: true });
    bayangan();
  }

  /* ----- Panel pencarian (mengarah ke produk.html?q=) ----- */
  function pencarian() {
    const tombol = document.getElementById('search-toggle');
    const panel = document.getElementById('search-panel');
    if (!tombol || !panel) return;
    const input = panel.querySelector('input');

    const set = (buka) => {
      panel.hidden = !buka;
      tombol.setAttribute('aria-expanded', String(buka));
      if (buka) input.focus();
    };
    tombol.addEventListener('click', () => set(panel.hidden));
    panel.addEventListener('keydown', (e) => { if (e.key === 'Escape') { set(false); tombol.focus(); } });
  }

  /* ----- Tombol kembali ke atas ----- */
  function kembaliKeAtas() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
    const cek = () => btn.classList.toggle('is-visible', window.scrollY > 500);
    window.addEventListener('scroll', cek, { passive: true });
    cek();
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: kurangiGerak ? 'auto' : 'smooth' }));
  }

  document.addEventListener('DOMContentLoaded', () => {
    isiConfig();
    navbar();
    pencarian();
    kembaliKeAtas();
  });
})();
