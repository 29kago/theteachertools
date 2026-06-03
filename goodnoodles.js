/* ═══════════════════════════════════════════════
   GOOD NOODLES
   ═══════════════════════════════════════════════ */
(function GoodNoodles() {

  const MAX = 30;
  const LS  = 'tt-goodnoodles';
  let students = [];
  let idN = 0;
  const uid = () => 'gn' + (++idN);
  const $   = id => document.getElementById(id);

  const byStars = () => [...students].sort((a, b) => b.stars - a.stars);

  /* ── Persistence ── */
  function save() {
    const data = students
      .filter(s => s.name)               /* skip blank, still-being-typed rows */
      .map(s => ({ id: s.id, name: s.name, stars: s.stars }));
    try { localStorage.setItem(LS, JSON.stringify(data)); } catch (e) { /* ignore */ }
  }
  function load() {
    try {
      const a = JSON.parse(localStorage.getItem(LS));
      if (!Array.isArray(a)) return;
      idN = a.reduce((m, s) => Math.max(m, parseInt(String(s.id).replace(/\D/g, '')) || 0), 0);
      students = a.map(s => ({
        id: s.id || uid(),
        name: String(s.name || ''),
        stars: Math.max(0, Math.min(MAX, parseInt(s.stars) || 0)),
        isNew: false,
      }));
    } catch (e) { /* ignore */ }
  }

  /* ── Build panel ── */
  function buildPanel() {
    const panel = $('panel-tool-d');
    if (!panel) return;

    panel.innerHTML = `
      <div class="gn-wrap">
        <div class="gn-header">
          <div class="gn-classbar" id="gnClassbar"></div>
          <div class="gn-hstars" aria-hidden="true">★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★</div>
          <h1 class="gn-title">GOOD NOODLES</h1>
          <div class="gn-hstars" aria-hidden="true">★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★</div>
        </div>
        <div class="gn-board" id="gnBoard">
          <div id="gnRows"></div>
          <div class="gn-add-wrap">
            <button class="gn-add-btn" id="gnAddBtn" title="Add student">＋</button>
          </div>
        </div>
      </div>`;

    $('gnAddBtn').addEventListener('click', addStudent);

    /* Class picker — load a saved roster as fresh rows */
    if (window.TTClassPicker) {
      $('gnClassbar').appendChild(TTClassPicker.create({
        variant: 'dark',
        onPick: loadFromClass,
      }));
    }
  }

  /* Replace the board with a class roster (stars reset to 0) */
  function loadFromClass(cls) {
    if (!cls || !cls.students.length) return;
    if (students.some(s => s.stars > 0) &&
        !confirm('Load this class? Current students and their star counts will be replaced.')) return;
    students = cls.students.map(name => ({ id: uid(), name, stars: 0, isNew: false }));
    renderAll();
    save();
  }

  /* ── Add / remove ── */
  function addStudent() {
    const s = { id: uid(), name: '', stars: 0, isNew: true };
    students.push(s);
    renderAll();
    setTimeout(() => {
      const board = $('gnBoard');
      board.scrollTop = board.scrollHeight;
      $(`gnInp-${s.id}`)?.focus();
    }, 30);
  }

  function removeStudent(id) {
    students = students.filter(s => s.id !== id);
    document.querySelector(`[data-gn="${id}"]`)?.remove();
    reorderDOM();
    save();
  }

  /* ── Render ── */
  function renderAll() {
    const rows = $('gnRows');
    if (!rows) return;
    rows.innerHTML = '';
    byStars().forEach((s, i) => rows.appendChild(mkRow(s, i + 1)));
  }

  function reorderDOM() {
    const rowsEl = $('gnRows');
    if (!rowsEl) return;
    byStars().forEach((st, i) => {
      const row = rowsEl.querySelector(`[data-gn="${st.id}"]`);
      if (!row) return;
      const ctr = row.querySelector('.gn-counter');
      if (ctr) ctr.textContent = i + 1;
      rowsEl.appendChild(row);
    });
  }

  /* ── Row builder ── */
  function mkRow(s, rank) {
    const row = document.createElement('div');
    row.className  = 'gn-row';
    row.dataset.gn = s.id;

    const counter = document.createElement('span');
    counter.className   = 'gn-counter';
    counter.textContent = rank;

    const nameCell = document.createElement('div');
    nameCell.className = 'gn-name-cell';
    nameCell.appendChild(s.isNew ? mkInput(s) : mkSpan(s));

    const starsCell = document.createElement('div');
    starsCell.className = 'gn-stars-cell';
    starsCell.id = `gnStars-${s.id}`;
    fillStars(s, starsCell);

    const rmBtn = document.createElement('button');
    rmBtn.className   = 'gn-rm-btn';
    rmBtn.textContent = '×';
    rmBtn.title       = 'Remove';
    rmBtn.addEventListener('click', () => removeStudent(s.id));

    row.appendChild(counter);
    row.appendChild(nameCell);
    row.appendChild(starsCell);
    row.appendChild(mkCountBox(s));
    row.appendChild(rmBtn);
    return row;
  }

  /* ── Count box ── */
  function mkCountBox(s) {
    const box = document.createElement('div');
    box.className   = 'gn-count-box';
    box.id          = `gnCount-${s.id}`;
    box.textContent = s.stars;
    box.title       = `Click to set star count (0 – ${MAX})`;
    box.addEventListener('click', () => editCount(s.id));
    return box;
  }

  function editCount(id) {
    const s = students.find(x => x.id === id);
    if (!s) return;
    const box = $(`gnCount-${id}`);
    if (!box || box.querySelector('input')) return; /* already editing */

    let done = false;

    const inp = document.createElement('input');
    inp.type      = 'number';
    inp.className = 'gn-count-input';
    inp.min       = '0';
    inp.max       = String(MAX);
    inp.value     = s.stars;

    box.textContent = '';
    box.appendChild(inp);
    inp.focus();
    inp.select();

    const commit = () => {
      if (done) return;
      done = true;
      const val = Math.max(0, Math.min(MAX, parseInt(inp.value) || 0));
      s.stars = val;
      box.textContent = s.stars;
      const container = $(`gnStars-${id}`);
      if (container) fillStars(s, container);
      reorderDOM();
      save();
    };

    const cancel = () => {
      done = true;
      box.textContent = s.stars; /* restores without changing value */
    };

    inp.addEventListener('blur', commit);
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter')  inp.blur();
      if (e.key === 'Escape') cancel();
    });
  }

  /* ── Name elements ── */
  function mkSpan(s) {
    const span = document.createElement('span');
    span.className   = 'gn-name';
    span.textContent = s.name || 'New Student';
    span.title       = 'Double-click to rename';
    span.addEventListener('dblclick', () => beginEdit(s.id));
    return span;
  }

  function mkInput(s) {
    const inp = document.createElement('input');
    inp.type        = 'text';
    inp.className   = 'gn-name-input';
    inp.id          = `gnInp-${s.id}`;
    inp.value       = s.name;
    inp.placeholder = 'Student name…';
    inp.maxLength   = 40;

    const commit = () => {
      s.name  = inp.value.trim();
      s.isNew = false;
      const cell = inp.closest('.gn-name-cell');
      if (cell) { cell.innerHTML = ''; cell.appendChild(mkSpan(s)); }
      save();
    };

    inp.addEventListener('blur', commit);
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter') inp.blur();
      if (e.key === 'Escape') {
        if (!s.name) removeStudent(s.id);
        else { s.isNew = false; inp.blur(); }
      }
    });
    return inp;
  }

  function beginEdit(id) {
    const s = students.find(x => x.id === id);
    if (!s) return;
    const cell = document.querySelector(`[data-gn="${id}"] .gn-name-cell`);
    if (!cell) return;
    const inp = mkInput(s);
    inp.value = s.name;
    cell.innerHTML = '';
    cell.appendChild(inp);
    inp.focus();
    inp.select();
  }

  /* ── Stars ── */
  function fillStars(s, container) {
    container.innerHTML = '';
    for (let i = 0; i < s.stars; i++) {
      const star = document.createElement('span');
      star.className   = 'gn-star-gold';
      star.textContent = '★';
      container.appendChild(star);
    }
    if (s.stars < MAX) {
      container.appendChild(mkGreyStar(s));
    } else {
      const badge = document.createElement('span');
      badge.className   = 'gn-max-badge';
      badge.textContent = 'MAX!';
      container.appendChild(badge);
    }
  }

  function mkGreyStar(s) {
    const btn = document.createElement('button');
    btn.className   = 'gn-star-grey';
    btn.textContent = '★';
    btn.title       = `Award a star  (${s.stars} / ${MAX})`;
    btn.addEventListener('click', () => addStar(s.id));
    return btn;
  }

  function addStar(id) {
    const s = students.find(x => x.id === id);
    if (!s || s.stars >= MAX) return;
    s.stars++;

    const container = $(`gnStars-${id}`);
    if (container) {
      container.querySelector('.gn-star-grey, .gn-max-badge')?.remove();
      const gold = document.createElement('span');
      gold.className   = 'gn-star-gold';
      gold.textContent = '★';
      container.appendChild(gold);
      if (s.stars < MAX) {
        container.appendChild(mkGreyStar(s));
      } else {
        const b = document.createElement('span');
        b.className   = 'gn-max-badge';
        b.textContent = 'MAX!';
        container.appendChild(b);
      }
    }

    /* update count box */
    const box = $(`gnCount-${id}`);
    if (box && !box.querySelector('input')) box.textContent = s.stars;

    reorderDOM();
    save();
  }

  /* ── Init ── */
  buildPanel();
  load();
  renderAll();

})();
