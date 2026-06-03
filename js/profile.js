/* ═══════════════════════════════════════════════
   TEACHER TOOL  —  Profile  +  Class Store
   ───────────────────────────────────────────────
   Provides:
     • window.TTClasses      — localStorage-backed class roster store (max 10)
     • window.TTClassPicker  — reusable "Load Class" dropdown factory
     • The Profile screen UI  (class manager)

   No accounts / login: classes are saved locally on the device via
   localStorage under the "tt-classes" key.
   ═══════════════════════════════════════════════ */
(function ProfileModule() {

  const LS_CLASSES = 'tt-classes';
  const MAX        = 10;

  /* ═══ helpers ═══ */
  const parseNames = txt => txt.split('\n').map(s => s.trim()).filter(Boolean);
  const countLabel = n => `${n} student${n === 1 ? '' : 's'}`;
  const uid = () => 'cls' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  /* ═══════════════════════════════════════════════
     STORE
     ═══════════════════════════════════════════════ */
  let classes = (() => {
    try { const a = JSON.parse(localStorage.getItem(LS_CLASSES)); return Array.isArray(a) ? a : []; }
    catch { return []; }
  })();
  const subs = new Set();

  function persist() { localStorage.setItem(LS_CLASSES, JSON.stringify(classes)); }
  function emit() { persist(); subs.forEach(cb => { try { cb(); } catch (e) { /* ignore */ } }); }
  const find = id => classes.find(c => c.id === id);
  const clone = c => ({ id: c.id, name: c.name, students: [...c.students] });

  const TTClasses = {
    MAX,
    all() { return classes.map(clone); },
    get(id) { const c = find(id); return c ? clone(c) : null; },
    add(name) {
      if (classes.length >= MAX) return null;
      const c = { id: uid(), name: (name || '').trim() || `Class ${classes.length + 1}`, students: [] };
      classes.push(c); emit(); return clone(c);
    },
    rename(id, name) { const c = find(id); if (c) { c.name = name; emit(); } },
    setStudents(id, arr) { const c = find(id); if (c) { c.students = arr.slice(); emit(); } },
    remove(id) { classes = classes.filter(c => c.id !== id); emit(); },
    onChange(cb) { subs.add(cb); return () => subs.delete(cb); },
  };
  window.TTClasses = TTClasses;

  /* Open the Profile panel from anywhere.
     Profile is NOT a tool tab — it's reached via the header avatar button —
     so we deactivate all folder tabs and show #panel-profile directly. */
  function goProfile() {
    document.querySelectorAll('.tabbar .tab').forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    document.querySelectorAll('.content .panel').forEach(p => p.classList.remove('active'));
    const p = document.getElementById('panel-profile');
    if (p) p.classList.add('active');
  }
  window.TTGoProfile = goProfile;

  /* ═══════════════════════════════════════════════
     CLASS PICKER  — reusable "Load Class ▾" dropdown
     opts: { label, variant: 'dark'|undefined, onPick(classObj) }
     Menu is appended to <body> so it never gets clipped by a tool panel.
     ═══════════════════════════════════════════════ */
  const ICON = `<svg viewBox="0 0 20 20" width="15" height="15" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="11" height="13" rx="2" stroke="currentColor" stroke-width="1.6"/>
      <path d="M14 6.5h2.5a1 1 0 0 1 1 1V16a1 1 0 0 1-1 1H8" stroke="currentColor" stroke-width="1.6"/>
      <path d="M6 8h5M6 11h5M6 14h3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    </svg>`;
  const CARET = `<svg class="ttcp-caret" viewBox="0 0 12 12" width="11" height="11" fill="none" aria-hidden="true">
      <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" stroke-width="1.8"
        stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  const TTClassPicker = {
    create(opts = {}) {
      const onPick = opts.onPick || (() => {});
      const wrap = document.createElement('div');
      wrap.className = 'ttcp' + (opts.variant === 'dark' ? ' ttcp--ondark' : '');

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ttcp-btn';
      btn.innerHTML = `${ICON}<span class="ttcp-label"></span>${CARET}`;
      btn.querySelector('.ttcp-label').textContent = opts.label || 'Load Class';
      wrap.appendChild(btn);

      /* menu lives detached; mounted to body on open */
      const menu = document.createElement('div');
      menu.className = 'ttcp-menu' + (opts.variant === 'dark' ? ' ttcp--ondark' : '');

      function renderMenu() {
        const list = TTClasses.all();
        if (!list.length) {
          menu.innerHTML = `<div class="ttcp-empty">No saved classes yet.</div>`;
          const link = document.createElement('button');
          link.type = 'button';
          link.className = 'ttcp-link';
          link.textContent = 'Add a class in Profile →';
          link.addEventListener('click', () => { close(); goProfile(); });
          menu.appendChild(link);
          return;
        }
        menu.innerHTML = '';
        list.forEach(c => {
          const item = document.createElement('button');
          item.type = 'button';
          item.className = 'ttcp-item';
          item.innerHTML = `<span class="ttcp-item-name"></span>
            <span class="ttcp-item-count">${c.students.length}</span>`;
          item.querySelector('.ttcp-item-name').textContent = c.name;
          item.disabled = c.students.length === 0;
          item.addEventListener('click', () => { close(); onPick(TTClasses.get(c.id)); });
          menu.appendChild(item);
        });
      }

      function position() {
        const r = btn.getBoundingClientRect();
        menu.style.top = (r.bottom + 6) + 'px';
        menu.style.left = r.left + 'px';
        menu.style.minWidth = Math.max(210, r.width) + 'px';
      }
      function open() {
        renderMenu();
        document.body.appendChild(menu);
        position();
        wrap.classList.add('open');
        document.addEventListener('mousedown', outside, true);
        window.addEventListener('resize', close);
        window.addEventListener('scroll', close, true);
      }
      function close() {
        wrap.classList.remove('open');
        if (menu.parentNode) menu.parentNode.removeChild(menu);
        document.removeEventListener('mousedown', outside, true);
        window.removeEventListener('resize', close);
        window.removeEventListener('scroll', close, true);
      }
      function outside(e) { if (!wrap.contains(e.target) && !menu.contains(e.target)) close(); }

      btn.addEventListener('click', () => wrap.classList.contains('open') ? close() : open());
      return wrap;
    }
  };
  window.TTClassPicker = TTClassPicker;

  /* ═══════════════════════════════════════════════
     PROFILE TAB UI
     ═══════════════════════════════════════════════ */
  function buildProfile() {
    const panel = document.getElementById('panel-profile');
    if (!panel) return;

    panel.innerHTML = `
      <div class="pf-wrap">
        <div class="pf-inner">

          <section class="pf-card">
            <div class="pf-classes-head">
              <h2 class="pf-h">My Classes <span class="pf-count" id="pfCount"></span></h2>
              <button class="pf-add" id="pfAdd">+ Add Class</button>
            </div>
            <p class="pf-note">
              Add each class once, then you can load classes on certain tools!
            </p>
            <div class="pf-classes" id="pfClasses"></div>
          </section>

        </div>
      </div>`;

    renderClasses();

    document.getElementById('pfAdd').addEventListener('click', () => {
      const c = TTClasses.add('');
      if (!c) return;
      renderClasses();
      requestAnimationFrame(() => {
        const el = document.querySelector(`[data-cls="${c.id}"] .pf-cls-name`);
        if (el) { el.focus(); el.select(); }
      });
    });
  }

  /* ── Classes section ── */
  function renderClasses() {
    const host = document.getElementById('pfClasses');
    if (!host) return;
    const list = TTClasses.all();

    document.getElementById('pfCount').textContent = `(${list.length}/${MAX})`;
    const addBtn = document.getElementById('pfAdd');
    const atMax = list.length >= MAX;
    addBtn.disabled = atMax;
    addBtn.title = atMax ? `You can save up to ${MAX} classes` : '';

    if (!list.length) {
      host.innerHTML = `<div class="pf-empty" style="grid-column: 1 / span 2;">
        No classes yet. Click <strong style="color:#1E88E5">+ Add Class</strong> to create your first roster
        (up to ${MAX}).</div>`;
      return;
    }

    host.innerHTML = list.map(() => `
      <div class="pf-cls">
        <div class="pf-cls-top">
          <input class="pf-cls-name" maxlength="40" placeholder="Class name">
          <button class="pf-cls-del" title="Delete class" aria-label="Delete class">✕</button>
        </div>
        <textarea class="pf-cls-names" spellcheck="false"
          placeholder="One student per line…"></textarea>
        <div class="pf-cls-foot"><span class="pf-cls-num"></span></div>
      </div>`).join('');

    [...host.querySelectorAll('.pf-cls')].forEach((card, i) => {
      const c = list[i];
      card.dataset.cls = c.id;
      const nameI = card.querySelector('.pf-cls-name');
      const ta    = card.querySelector('.pf-cls-names');
      const numEl = card.querySelector('.pf-cls-num');

      nameI.value = c.name;
      ta.value = c.students.join('\n');
      numEl.textContent = countLabel(c.students.length);

      /* edit in place — do NOT re-render the list (would drop focus/cursor) */
      nameI.addEventListener('input', () =>
        TTClasses.rename(c.id, nameI.value.trim() || 'Untitled Class'));
      ta.addEventListener('input', () => {
        const names = parseNames(ta.value);
        TTClasses.setStudents(c.id, names);
        numEl.textContent = countLabel(names.length);
      });
      card.querySelector('.pf-cls-del').addEventListener('click', () => {
        const cur = TTClasses.get(c.id);
        const n = cur ? cur.students.length : 0;
        if (confirm(`Delete “${nameI.value || c.name}”?` +
          (n ? ` This removes its ${n} saved name${n === 1 ? '' : 's'}.` : ''))) {
          TTClasses.remove(c.id);
          renderClasses();
        }
      });
    });
  }

  /* ═══ init ═══ */
  buildProfile();

})();
