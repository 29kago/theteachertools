/* ═══════════════════════════════════════════════
   TEACHER TOOL  —  Language selector
   ───────────────────────────────────────────────
   A globe dropdown in the header (next to Settings) that switches the
   app chrome between English / Spanish / Turkish. The chosen language is
   saved on the device (localStorage "tt-lang"). Original English copy is
   stashed on each element the first time so switching back is lossless.
   ═══════════════════════════════════════════════ */
(function LanguageModule() {
  const LS = 'tt-lang';

  /* Translations keyed by the original English string. Anything missing
     falls back to English (e.g. the "Good Noodles" proper noun). */
  const DICT = {
    es: {
      'Home': 'Inicio',
      'Student Picker': 'Selector de Alumnos',
      'Seating Arranger': 'Organizador de Asientos',
      'Behavior Chart': 'Tabla de Conducta',
      'Timer': 'Temporizador',
      'Search': 'Buscar',
      'Welcome to The Teacher Tools': 'Bienvenido a The Teacher Tools',
      'Search for Tools or select one in the Tabs above.':
        'Busca herramientas o selecciona una en las pestañas de arriba.',
      'Settings': 'Ajustes',
      'Appearance': 'Apariencia',
      'Dark Mode': 'Modo Oscuro',
      'Deep navy dark theme': 'Tema oscuro azul marino',
      'Large Text': 'Texto Grande',
      'Bigger labels for projectors': 'Etiquetas más grandes para proyectores',
    },
    tr: {
      'Home': 'Ana Sayfa',
      'Student Picker': 'Öğrenci Seçici',
      'Seating Arranger': 'Oturma Düzeni',
      'Behavior Chart': 'Davranış Tablosu',
      'Timer': 'Saat',
      'Search': 'Ara',
      'Welcome to The Teacher Tools': 'The Teacher Tools\'a Hoş Geldiniz',
      'Search for Tools or select one in the Tabs above.':
        'Yukarıdaki sekmelerden bir araç arayın veya seçin.',
      'Settings': 'Ayarlar',
      'Appearance': 'Görünüm',
      'Dark Mode': 'Karanlık Mod',
      'Deep navy dark theme': 'Koyu lacivert tema',
      'Large Text': 'Büyük Yazı',
      'Bigger labels for projectors': 'Projektörler için daha büyük etiketler',
    },
  };

  const TEXT_SEL =
    '.tab-label, .welcome-title, .welcome-sub, .sp-title, .sp-section-label, .sp-row-label, .sp-row-sub';
  const PH_SEL = '#searchInput, #welcomeSearchInput';

  const tr = (lang, en) => (lang === 'en' ? en : ((DICT[lang] && DICT[lang][en]) || en));

  function applyLang(lang) {
    document.querySelectorAll(TEXT_SEL).forEach(el => {
      if (el.dataset.i18nEn === undefined) el.dataset.i18nEn = el.textContent.trim();
      el.textContent = tr(lang, el.dataset.i18nEn);
    });
    document.querySelectorAll(PH_SEL).forEach(el => {
      if (el.dataset.i18nPh === undefined) el.dataset.i18nPh = el.getAttribute('placeholder') || '';
      if (el.dataset.i18nPh) el.setAttribute('placeholder', tr(lang, el.dataset.i18nPh));
    });
    document.documentElement.setAttribute('lang', lang);
    document.querySelectorAll('.lang-item').forEach(b =>
      b.classList.toggle('active', b.dataset.lang === lang));
    localStorage.setItem(LS, lang);
  }

  /* ─── dropdown wiring ─── */
  const wrap = document.getElementById('langWrap');
  const btn  = document.getElementById('langBtn');
  const menu = document.getElementById('langMenu');
  if (!wrap || !btn || !menu) return;

  function open()  { wrap.classList.add('open');  btn.setAttribute('aria-expanded', 'true');  document.addEventListener('mousedown', outside, true); }
  function close() { wrap.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); document.removeEventListener('mousedown', outside, true); }
  function outside(e) { if (!wrap.contains(e.target)) close(); }

  btn.addEventListener('click', () => wrap.classList.contains('open') ? close() : open());
  menu.addEventListener('click', (e) => {
    const item = e.target.closest('.lang-item');
    if (!item) return;
    applyLang(item.dataset.lang);
    close();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && wrap.classList.contains('open')) close();
  });

  /* ─── restore saved language ─── */
  applyLang(localStorage.getItem(LS) || 'en');
})();
