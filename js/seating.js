/* ═══════════════════════════════════════════════
   CLASSROOM SEATING ARRANGER
   ═══════════════════════════════════════════════ */
(function SeatingArranger() {

  const COLORS = {
    grey:      { fill: '#9E9E9E', stroke: '#616161', text: '#fff' },
    red:       { fill: '#EF5350', stroke: '#C62828', text: '#fff' },
    orange:    { fill: '#FF9800', stroke: '#E65100', text: '#fff' },
    yellow:    { fill: '#FFD600', stroke: '#F9A825', text: '#333' },
    green:     { fill: '#43A047', stroke: '#1B5E20', text: '#fff' },
    blue:      { fill: '#1E88E5', stroke: '#0D47A1', text: '#fff' },
    purple:    { fill: '#8E24AA', stroke: '#4A148C', text: '#fff' },
    pink:      { fill: '#F48FB1', stroke: '#AD1457', text: '#333' },
    turquoise: { fill: '#00ACC1', stroke: '#006064', text: '#fff' },
    brown:     { fill: '#6D4C41', stroke: '#3E2723', text: '#fff' },
    black:     { fill: '#212121', stroke: '#000',    text: '#fff' },
    white:     { fill: '#FFFFFF', stroke: '#333',    text: '#333' },
  };

  const COLOR_NAMES = {
    grey:'Grey', red:'Red', orange:'Orange', yellow:'Yellow',
    green:'Green', blue:'Blue', purple:'Purple', pink:'Pink',
    turquoise:'Turquoise', brown:'Brown', black:'Black', white:'White'
  };

  let elements = [], selected = new Set(), idN = 0;
  let ghostDrag = null, moveDrag = null, bandState = null, modalOpen = false;
  let roster = [];   // student names from the loaded class (for autocomplete + auto-fill)
  const LS_SEAT = 'tt-seating';

  const uid    = () => 'e' + (++idN);
  const $      = id => document.getElementById(id);
  const esc    = s  => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const trunc  = (s, n) => s.length > n ? s.slice(0, n - 1) + '…' : s;
  const svgW   = (w, h, body) =>
    `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
  const svgTxt = (x, y, fs, fill, s, italic) =>
    `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle"
      fill="${fill}" font-size="${fs}" font-weight="600"
      font-style="${italic ? 'italic' : 'normal'}"
      font-family="Inter,sans-serif">${esc(s)}</text>`;

  /* ── Dimensions ── */
  function dims(el) {
    if (el.type === 'desk')         return { w: 72,  h: 66 };
    if (el.type === 'teacher-desk') return { w: 150, h: 88 };
    if (el.type === 'whiteboard')   return el.rotation ? { w: 36, h: 300 } : { w: 300, h: 36 };

    if (el.type === 'rect-table') {
      const perRow  = Math.ceil((el.studentCount || 2) / 2);
      /* each seat slot 72 wide, 4-gap between, 8 side-pad each side */
      const mainLen = 16 + perRow * 72 + Math.max(0, perRow - 1) * 4;
      /* cross dimension: 8+17+3+28+4+28+12 = 100 */
      return el.rotation ? { w: 100, h: mainLen } : { w: mainLen, h: 100 };
    }

    if (el.type === 'circle-table') {
      const tr = Math.max(60, (el.studentCount || 4) * 18);
      const s  = (tr + 14) * 2;
      return { w: s, h: s };
    }
    return { w: 80, h: 60 };
  }

  /* ── SVG renderers ── */
  function elHTML(el) {
    const c = COLORS[el.color] || COLORS.grey;
    const d = dims(el);
    switch (el.type) {
      case 'desk':         return deskSVG(el, d, c);
      case 'rect-table':   return rectSVG(el, d, c);
      case 'circle-table': return circleSVG(el, d, c);
      case 'teacher-desk': return teacherSVG(el, d, c);
      case 'whiteboard':   return wbSVG(d);
    }
    return '';
  }

  function deskSVG(el, { w, h }, c) {
    const name  = el.students[0] || '';
    const fs    = Math.max(9, Math.min(13, w / 6));
    const bodyH = h - 12;
    return svgW(w, h, `
      <rect x="2" y="2" width="${w-4}" height="${bodyH}" rx="5"
        fill="${c.fill}" stroke="${c.stroke}" stroke-width="2"/>
      <rect x="${w/2-13}" y="${h-11}" width="26" height="8" rx="3"
        fill="${c.stroke}" opacity="0.45"/>
      ${name ? svgTxt(w/2, bodyH/2+2, fs, c.text, trunc(name,9)) : ''}
    `);
  }

  function rectSVG(el, { w, h }, c) {
    const n      = el.studentCount || 2;
    const southN = Math.ceil(n / 2);   /* facing board (priority) */
    const northN = Math.floor(n / 2);  /* back */
    const perRow = southN;
    const tname  = el.tableName || '';
    const rot    = el.rotation || 0;
    const slotFill = 'rgba(0,0,0,0.11)';

    if (!rot) {
      /* ── horizontal ──
         h = 100  (8 top + 17 name + 3 gap + 28 north + 4 gap + 28 south + 12 bot)
         w = 16 + perRow*72 + (perRow-1)*4                                         */
      const slotW  = 72, slotGap = 4, padX = 8;
      const nameY  = 8,  nameH = 17;
      const northY = nameY + nameH + 3;   /* 28 */
      const southY = northY + 28 + 4;     /* +4 gap */

      let inner = '';

      /* table name */
      if (tname) {
        inner += svgTxt(w/2, nameY + nameH/2, 10, c.text, trunc(tname, 28), true);
      }
      /* separator under name */
      inner += `<line x1="${padX}" y1="${nameY+nameH+1}" x2="${w-padX}" y2="${nameY+nameH+1}"
        stroke="${c.stroke}" stroke-width="1" opacity="0.25"/>`;

      /* middle divider */
      inner += `<line x1="${padX}" y1="${northY+28+2}" x2="${w-padX}" y2="${northY+28+2}"
        stroke="${c.stroke}" stroke-width="1.5" opacity="0.35"/>`;

      /* north seats (back) */
      for (let i = 0; i < northN; i++) {
        const sx   = padX + i * (slotW + slotGap);
        const name = el.students[southN + i] || '';
        inner += `<rect x="${sx}" y="${northY}" width="${slotW}" height="28" rx="3" fill="${slotFill}"/>`;
        if (name) inner += svgTxt(sx + slotW/2, northY + 14, 10, c.text, trunc(name, 9));
      }
      /* south seats (facing) */
      for (let i = 0; i < southN; i++) {
        const sx   = padX + i * (slotW + slotGap);
        const name = el.students[i] || '';
        inner += `<rect x="${sx}" y="${southY}" width="${slotW}" height="28" rx="3" fill="${slotFill}"/>`;
        if (name) inner += svgTxt(sx + slotW/2, southY + 14, 10, c.text, trunc(name, 9));
      }

      return svgW(w, h, `
        <rect x="0" y="0" width="${w}" height="${h}" rx="7"
          fill="${c.fill}" stroke="${c.stroke}" stroke-width="2.5"/>
        ${inner}`);

    } else {
      /* ── vertical ──
         w = 100  (name strip at top 17px, then two seat columns: 0..46 | div | 54..100)
         h = 16 + perRow*72 + (perRow-1)*4                                              */
      const nameH  = 17;
      const seatsY = nameH + 3;           /* seats start here */
      const slotH  = 72, slotGap = 4;
      const padY   = 8;
      const leftX  = 0, leftW = 46;
      const rightX = 54, rightW = 46;

      let inner = '';

      /* table name strip */
      if (tname) {
        inner += svgTxt(w/2, nameH/2 + 1, 10, c.text, trunc(tname, 20), true);
      }
      inner += `<line x1="0" y1="${nameH+1}" x2="${w}" y2="${nameH+1}"
        stroke="${c.stroke}" stroke-width="1" opacity="0.25"/>`;

      /* vertical middle divider */
      inner += `<line x1="50" y1="${seatsY+padY}" x2="50" y2="${h-padY}"
        stroke="${c.stroke}" stroke-width="1.5" opacity="0.35"/>`;

      /* west (facing) */
      for (let i = 0; i < southN; i++) {
        const sy   = seatsY + padY + i * (slotH + slotGap);
        const name = el.students[i] || '';
        inner += `<rect x="${leftX+3}" y="${sy}" width="${leftW-6}" height="${slotH}" rx="3" fill="${slotFill}"/>`;
        if (name) inner += svgTxt(leftX + leftW/2, sy + slotH/2, 10, c.text, trunc(name, 6));
      }
      /* east (back) */
      for (let i = 0; i < northN; i++) {
        const sy   = seatsY + padY + i * (slotH + slotGap);
        const name = el.students[southN + i] || '';
        inner += `<rect x="${rightX+3}" y="${sy}" width="${rightW-6}" height="${slotH}" rx="3" fill="${slotFill}"/>`;
        if (name) inner += svgTxt(rightX + rightW/2, sy + slotH/2, 10, c.text, trunc(name, 6));
      }

      return svgW(w, h, `
        <rect x="0" y="0" width="${w}" height="${h}" rx="7"
          fill="${c.fill}" stroke="${c.stroke}" stroke-width="2.5"/>
        ${inner}`);
    }
  }

  function circleSVG(el, { w, h }, c) {
    const n     = el.studentCount || 4;
    const cx    = w / 2, cy = h / 2;
    const tr    = (w - 28) / 2;              /* table radius */
    const dist  = tr - 18;                   /* seat-center distance from table center */
    const tname = el.tableName || '';
    const sw    = Math.min(60, (2 * Math.PI * dist / n) - 6); /* seat slot width */
    const sh    = 22;
    const slotFill = 'rgba(0,0,0,0.11)';

    let seats = '';
    for (let i = 0; i < n; i++) {
      const ang  = Math.PI / 2 + (2 * Math.PI * i) / n;
      const sx   = cx + dist * Math.cos(ang);
      const sy   = cy + dist * Math.sin(ang);
      const name = el.students[i] || '';
      seats += `<rect x="${(sx - sw/2).toFixed(1)}" y="${(sy - sh/2).toFixed(1)}"
        width="${sw.toFixed(1)}" height="${sh}" rx="3" fill="${slotFill}"/>`;
      if (name) seats += svgTxt(sx.toFixed(1), sy.toFixed(1), 9, c.text, trunc(name, 7));
    }

    /* table name centered */
    const nameEl = tname ? svgTxt(cx, cy, 11, c.text, trunc(tname, 14), true) : '';

    return svgW(w, h, `
      <circle cx="${cx}" cy="${cy}" r="${tr}"
        fill="${c.fill}" stroke="${c.stroke}" stroke-width="2.5"/>
      ${seats}
      ${nameEl}
    `);
  }

  function teacherSVG(el, { w, h }, c) {
    const name = el.students[0] || '';
    const fs   = Math.max(9, Math.min(13, w / 12));
    return svgW(w, h, `
      <rect x="2" y="2" width="${w-4}" height="${h-4}" rx="7"
        fill="${c.fill}" stroke="${c.stroke}" stroke-width="2.5"/>
      <rect x="10"       y="${h-18}" width="14" height="16" rx="3"
        fill="${c.stroke}" opacity="0.5"/>
      <rect x="${w-24}" y="${h-18}" width="14" height="16" rx="3"
        fill="${c.stroke}" opacity="0.5"/>
      ${appleSVG(w*0.78, h/2, 12)}
      ${name ? svgTxt(w*0.36, h/2, fs, c.text, trunc(name,12)) : ''}
    `);
  }

  function appleSVG(cx, cy, s) {
    return `<g transform="translate(${cx},${cy})">
      <ellipse cx="-${(s*.38).toFixed(1)}" cy="${(s*.1).toFixed(1)}"
        rx="${(s*.55).toFixed(1)}" ry="${(s*.68).toFixed(1)}" fill="#E53935"/>
      <ellipse cx="${(s*.38).toFixed(1)}"  cy="${(s*.1).toFixed(1)}"
        rx="${(s*.55).toFixed(1)}" ry="${(s*.68).toFixed(1)}" fill="#E53935"/>
      <ellipse cx="0" cy="${(s*.12).toFixed(1)}"
        rx="${(s*.28).toFixed(1)}" ry="${(s*.64).toFixed(1)}" fill="#E53935"/>
      <line x1="0" y1="-${(s*.52).toFixed(1)}" x2="0" y2="-${s}"
        stroke="#558B2F" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M0,-${(s*.72).toFixed(1)} Q${(s*.65).toFixed(1)},-${(s*1.1).toFixed(1)} ${(s*.5).toFixed(1)},-${(s*.55).toFixed(1)}"
        stroke="#558B2F" stroke-width="1.3" fill="none" stroke-linecap="round"/>
    </g>`;
  }

  function wbSVG({ w, h }) {
    if (h > w) {
      /* vertical */
      return svgW(w, h, `
        <rect x="0" y="0" width="${w}" height="${h}" rx="4"
          fill="#F0F0F0" stroke="#BDBDBD" stroke-width="2"/>
        <rect x="3" y="3" width="${w-13}" height="${h-6}" rx="2"
          fill="#FFFFFF" stroke="#E0E0E0" stroke-width="1"/>
        <rect x="${w-10}" y="2" width="8" height="${h-4}" rx="2" fill="#9E9E9E"/>
      `);
    }
    /* horizontal */
    return svgW(w, h, `
      <rect x="0" y="0" width="${w}" height="${h}" rx="4"
        fill="#F0F0F0" stroke="#BDBDBD" stroke-width="2"/>
      <rect x="3" y="3" width="${w-6}" height="${h-13}" rx="2"
        fill="#FFFFFF" stroke="#E0E0E0" stroke-width="1"/>
      <rect x="2" y="${h-10}" width="${w-4}" height="8" rx="2" fill="#9E9E9E"/>
      <text x="${w/2}" y="${h-5}" text-anchor="middle" dominant-baseline="middle"
        fill="#EEE" font-size="7" font-weight="700" letter-spacing="0.8"
        font-family="Inter,sans-serif">WHITEBOARD / PROJECTOR</text>
    `);
  }

  /* ── Palette icon SVGs ── */
  function buildPaletteSVGs() {
    const deskPal = svgW(46, 40, `
      <rect x="2" y="2" width="42" height="30" rx="4" fill="#9E9E9E" stroke="#616161" stroke-width="1.5"/>
      <rect x="15" y="33" width="16" height="5" rx="2" fill="#616161" opacity="0.6"/>
    `);

    /* rect-table: compact rectangle with internal seat slots */
    const rectPal = svgW(64, 42, `
      <rect x="0" y="0" width="64" height="42" rx="5" fill="#9E9E9E" stroke="#616161" stroke-width="1.5"/>
      <line x1="4" y1="13" x2="60" y2="13" stroke="#616161" stroke-width="1" opacity="0.35"/>
      <line x1="4" y1="29" x2="60" y2="29" stroke="#616161" stroke-width="1" opacity="0.35"/>
      <rect x="5"  y="15" width="24" height="12" rx="2" fill="rgba(0,0,0,0.14)"/>
      <rect x="34" y="15" width="24" height="12" rx="2" fill="rgba(0,0,0,0.14)"/>
    `);

    /* circle-table: circle with seat slots inside */
    const cirPal = svgW(60, 60, `
      <circle cx="30" cy="30" r="28" fill="#9E9E9E" stroke="#616161" stroke-width="1.5"/>
      <rect x="14" y="23" width="14" height="14" rx="2" fill="rgba(0,0,0,0.14)"/>
      <rect x="32" y="23" width="14" height="14" rx="2" fill="rgba(0,0,0,0.14)"/>
      <rect x="18" y="8"  width="24" height="11" rx="2" fill="rgba(0,0,0,0.14)"/>
      <rect x="18" y="41" width="24" height="11" rx="2" fill="rgba(0,0,0,0.14)"/>
    `);

    const tchPal = svgW(58, 42, `
      <rect x="2" y="2" width="54" height="38" rx="5" fill="#9E9E9E" stroke="#616161" stroke-width="1.5"/>
      ${appleSVG(44, 21, 10)}
    `);

    const wbPal = svgW(62, 28, `
      <rect x="0" y="0"  width="62" height="28" rx="3" fill="#F5F5F5" stroke="#BDBDBD" stroke-width="2"/>
      <rect x="3" y="3"  width="56" height="15" rx="2" fill="#FFF"    stroke="#E0E0E0" stroke-width="1"/>
      <rect x="2" y="20" width="58" height="6"  rx="2" fill="#9E9E9E"/>
    `);

    return { desk: deskPal, 'rect-table': rectPal, 'circle-table': cirPal,
             'teacher-desk': tchPal, whiteboard: wbPal };
  }

  /* ── Build panel HTML ── */
  function buildPanel() {
    const panel = $('panel-tool-b');
    if (!panel) return;
    const ps = buildPaletteSVGs();

    panel.innerHTML = `
      <div class="seating-wrap">
        <div class="seating-toolbar" id="seatingToolbar">
          <div class="palette-section">
            <span class="palette-label">Drag to place:</span>
            <div class="palette-items">
              <div class="palette-item" data-type="desk"         title="Student Desk">
                ${ps.desk}<span>Desk</span></div>
              <div class="palette-item" data-type="rect-table"   title="Rectangular Table">
                ${ps['rect-table']}<span>Rect Table</span></div>
              <div class="palette-item" data-type="circle-table" title="Circular Table">
                ${ps['circle-table']}<span>Round Table</span></div>
              <div class="palette-item" data-type="teacher-desk" title="Teacher's Desk">
                ${ps['teacher-desk']}<span>Teacher's Desk</span></div>
              <div class="palette-item" data-type="whiteboard"   title="Whiteboard / Projector">
                ${ps.whiteboard}<span>Whiteboard</span></div>
            </div>
          </div>
          <div class="seating-actions">
            <label class="sa-countwrap" title="How many copies one drag creates">
              <span class="sa-count-label">Count:</span>
              <input type="number" id="saCount" class="si sa-count sm-no-spin" min="1" max="12" value="1">
            </label>
            <span class="sa-classmount" id="saClassMount"></span>
            <button class="sa-btn"           id="saAutoFill" title="Place the loaded class into empty seats">Auto-fill Seats</button>
            <button class="sa-btn"           id="saAlign" title="Line up the selected items into level, evenly spaced rows and columns">Align Selected</button>
            <button class="sa-btn"           id="saDelete">Delete Selected</button>
            <button class="sa-btn sa-danger" id="saClear">Clear All</button>
          </div>
        </div>
        <div class="classroom" id="classroom">
          <div class="sel-band hidden" id="selBand"></div>
          <div class="room-hint" id="roomHint">Drag items from the toolbar to arrange your classroom</div>
        </div>
      </div>`;

    panel.querySelectorAll('.palette-item').forEach(item =>
      item.addEventListener('mousedown', e => { e.preventDefault(); startGhost(e, item.dataset.type); })
    );

    /* Class roster — powers name autocomplete + Auto-fill */
    if (window.TTClassPicker) {
      $('saClassMount').appendChild(TTClassPicker.create({
        label: 'Class Roster',
        onPick: (cls) => { setRoster(cls); },
      }));
      $('saAutoFill').addEventListener('click', autoFill);
    } else {
      $('saAutoFill').remove();
    }

    $('saAlign').addEventListener('click', alignSelected);
    $('saDelete').addEventListener('click', deleteSelected);
    $('saClear').addEventListener('click', () => {
      if (!elements.length) return;
      if (confirm('Clear all seats and tables?')) { elements = []; selected.clear(); renderAll(); }
    });
    $('classroom').addEventListener('mousedown', onRoomDown);
    document.addEventListener('mousemove', onDocMove);
    document.addEventListener('mouseup',   onDocUp);
    document.addEventListener('keydown',   onKey);
  }

  /* ── DOM helpers ── */
  function mkDom(el) {
    const d   = dims(el);
    const div = document.createElement('div');
    div.className  = 'seat-el' + (selected.has(el.id) ? ' sel' : '');
    div.dataset.id = el.id;
    div.style.cssText = `left:${el.x}px;top:${el.y}px;width:${d.w}px;height:${d.h}px`;
    div.innerHTML = elHTML(el);
    return div;
  }

  function renderAll() {
    const room = $('classroom');
    if (!room) return;
    room.querySelectorAll('.seat-el').forEach(n => n.remove());
    elements.forEach(el => room.appendChild(mkDom(el)));
    const hint = $('roomHint');
    if (hint) hint.style.display = elements.length ? 'none' : '';
    persist();
  }

  function rerenderOne(id) {
    const el  = elements.find(e => e.id === id);
    if (!el) return;
    const room = $('classroom');
    const old  = room.querySelector(`[data-id="${id}"]`);
    const neo  = mkDom(el);
    if (old) room.replaceChild(neo, old); else room.appendChild(neo);
    persist();
  }

  /* ── Persistence ── (named persist() to avoid clashing with the
     local save() used inside openModal) */
  function persist() {
    try { localStorage.setItem(LS_SEAT, JSON.stringify(elements)); } catch (e) { /* ignore */ }
  }
  function load() {
    let data = [];
    try { const a = JSON.parse(localStorage.getItem(LS_SEAT)); if (Array.isArray(a)) data = a; }
    catch (e) { /* ignore */ }
    if (!data.length) return;
    idN = data.reduce((m, el) => Math.max(m, parseInt(String(el.id).replace(/\D/g, '')) || 0), 0);
    elements = data.map(el => ({
      id: el.id || uid(),
      type: el.type,
      color: el.color || 'grey',
      rotation: el.rotation || 0,
      tableName: el.tableName || '',
      studentCount: el.studentCount || (Array.isArray(el.students) ? el.students.length : 1),
      students: Array.isArray(el.students) ? el.students.slice() : [],
      x: +el.x || 0,
      y: +el.y || 0,
    }));
    renderAll();
  }

  /* ── Placement count (the "Count:" box in the toolbar) ── */
  function placeCount() {
    const n = parseInt($('saCount')?.value, 10);
    return Math.max(1, Math.min(12, isNaN(n) ? 1 : n));
  }

  /* ── Ghost drag ── */
  function startGhost(e, type) {
    const tmp  = { type, color: 'grey', tableName: '', students: [], studentCount: 4, rotation: 0 };
    const d    = dims(tmp);
    const ghost = document.createElement('div');
    ghost.className   = 'seat-ghost';
    ghost.style.cssText = `width:${d.w}px;height:${d.h}px;left:${e.clientX-d.w/2}px;top:${e.clientY-d.h/2}px`;
    const n = placeCount();
    ghost.innerHTML   = elHTML(tmp) + (n > 1 ? `<span class="ghost-mult">&times;${n}</span>` : '');
    document.body.appendChild(ghost);
    ghostDrag = { type, ghost, d };
  }

  /* ── Classroom mousedown ── */
  function onRoomDown(e) {
    if (e.button !== 0 || modalOpen) return;
    const target = e.target.closest('[data-id]');

    if (target) {
      const id = target.dataset.id;
      if (!e.shiftKey && !selected.has(id)) { selected.clear(); renderAll(); }
      selected.add(id);
      $('classroom').querySelector(`[data-id="${id}"]`)?.classList.add('sel');
      const startPos = {};
      selected.forEach(sid => {
        const el = elements.find(e => e.id === sid);
        if (el) startPos[sid] = { x: el.x, y: el.y };
      });
      moveDrag = { startX: e.clientX, startY: e.clientY, startPos, moved: false, clickId: id };
      e.preventDefault();
    } else {
      if (!e.shiftKey) { selected.clear(); renderAll(); }
      const r = $('classroom').getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      bandState = { x0: x, y0: y, x1: x, y1: y };
      const band = $('selBand');
      band.style.cssText = `left:${x}px;top:${y}px;width:0;height:0`;
      band.classList.remove('hidden');
      e.preventDefault();
    }
  }

  /* ── Doc mousemove ── */
  function onDocMove(e) {
    if (ghostDrag) {
      const { ghost, d } = ghostDrag;
      ghost.style.left = (e.clientX - d.w/2) + 'px';
      ghost.style.top  = (e.clientY - d.h/2) + 'px';
    }
    if (moveDrag) {
      const dx = e.clientX - moveDrag.startX;
      const dy = e.clientY - moveDrag.startY;
      if (!moveDrag.moved && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) moveDrag.moved = true;
      if (moveDrag.moved) {
        const room = $('classroom'), r = room.getBoundingClientRect();
        selected.forEach(sid => {
          const el = elements.find(e => e.id === sid);
          if (!el) return;
          const sp = moveDrag.startPos[sid], d = dims(el);
          el.x = Math.max(0, Math.min(r.width  - d.w, sp.x + dx));
          el.y = Math.max(0, Math.min(r.height - d.h, sp.y + dy));
          const dom = room.querySelector(`[data-id="${sid}"]`);
          if (dom) { dom.style.left = el.x + 'px'; dom.style.top = el.y + 'px'; }
        });
      }
    }
    if (bandState) {
      const r = $('classroom').getBoundingClientRect();
      bandState.x1 = Math.max(0, Math.min(r.width,  e.clientX - r.left));
      bandState.y1 = Math.max(0, Math.min(r.height, e.clientY - r.top));
      const bx = Math.min(bandState.x0, bandState.x1);
      const by = Math.min(bandState.y0, bandState.y1);
      const bw = Math.abs(bandState.x1 - bandState.x0);
      const bh = Math.abs(bandState.y1 - bandState.y0);
      $('selBand').style.cssText = `left:${bx}px;top:${by}px;width:${bw}px;height:${bh}px`;
      elements.forEach(el => {
        const d   = dims(el);
        const hit = el.x < bx+bw && el.x+d.w > bx && el.y < by+bh && el.y+d.h > by;
        hit ? selected.add(el.id) : selected.delete(el.id);
      });
      $('classroom').querySelectorAll('.seat-el').forEach(dom =>
        dom.classList.toggle('sel', selected.has(dom.dataset.id))
      );
    }
  }

  /* ── Doc mouseup ── */
  function onDocUp(e) {
    if (ghostDrag) {
      const { type, ghost, d } = ghostDrag;
      const room = $('classroom'), r = room.getBoundingClientRect();
      const cx = e.clientX - r.left, cy = e.clientY - r.top;
      if (cx >= 0 && cy >= 0 && cx <= r.width && cy <= r.height) {
        const isTable = type === 'rect-table' || type === 'circle-table';
        const sc    = isTable ? 4 : 1;
        const count = placeCount();
        const GAP   = 14;

        /* lay the copies out in rows starting at the drop point,
           wrapping when they would run off the right edge */
        const x0 = Math.max(0, Math.min(r.width  - d.w, cx - d.w/2));
        const y0 = Math.max(0, Math.min(r.height - d.h, cy - d.h/2));
        const perRow = Math.max(1, Math.floor((r.width - x0 + GAP) / (d.w + GAP)));

        let firstId = null;
        for (let i = 0; i < count; i++) {
          const col = i % perRow, row = Math.floor(i / perRow);
          const newEl = {
            id: uid(), type, color: 'grey', rotation: 0,
            tableName: '', studentCount: sc,
            students: Array(sc).fill(''),
            x: Math.max(0, Math.min(r.width  - d.w, x0 + col * (d.w + GAP))),
            y: Math.max(0, Math.min(r.height - d.h, y0 + row * (d.h + GAP))),
          };
          elements.push(newEl);
          if (!firstId) firstId = newEl.id;
        }
        renderAll();
        /* only auto-open the editor when placing a single item */
        if (count === 1 && firstId) openModal(firstId);
      }
      ghost.remove(); ghostDrag = null;
    }
    if (moveDrag) {
      if (!moveDrag.moved) openModal(moveDrag.clickId);
      else persist();   /* positions changed */
      moveDrag = null;
    }
    if (bandState) { $('selBand').classList.add('hidden'); bandState = null; }
  }

  /* ── Keyboard ── */
  function onKey(e) {
    if (modalOpen) return;
    const tag = document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if ((e.key === 'Delete' || e.key === 'Backspace') && selected.size) {
      deleteSelected(); e.preventDefault();
    }
    if (e.key === 'Escape') { selected.clear(); renderAll(); }
  }

  function deleteSelected() {
    elements = elements.filter(el => !selected.has(el.id));
    selected.clear(); renderAll();
  }

  /* ── Align Selected ──
     Tidies the selected items into level, evenly spaced rows and
     columns based on where they roughly are already:
       1. cluster items into rows by vertical proximity
       2. level each row (tops aligned) and spread items evenly
       3. space the rows themselves evenly
       4. if the rows form a grid (or a single column), line the
          columns up on shared x positions too                       */
  function alignSelected() {
    const items = elements
      .filter(el => selected.has(el.id))
      .map(el => ({ el, d: dims(el) }));
    if (items.length < 2) {
      alert('Select two or more items first (drag a box around them or shift-click), then press Align Selected.');
      return;
    }

    /* 1 ── cluster into rows by vertical center proximity */
    items.sort((a, b) => (a.el.y + a.d.h / 2) - (b.el.y + b.d.h / 2));
    const rows = [];
    items.forEach(it => {
      const cy  = it.el.y + it.d.h / 2;
      const row = rows.find(rw => Math.abs(rw.cy - cy) < Math.max(40, rw.maxH * 0.6));
      if (row) {
        row.items.push(it);
        row.cy   = row.items.reduce((s, i) => s + i.el.y + i.d.h / 2, 0) / row.items.length;
        row.maxH = Math.max(row.maxH, it.d.h);
      } else {
        rows.push({ cy, maxH: it.d.h, items: [it] });
      }
    });

    /* 2 ── per row: level tops, spread evenly between current extremes */
    rows.forEach(rw => {
      rw.items.sort((a, b) => a.el.x - b.el.x);
      rw.top = Math.min(...rw.items.map(i => i.el.y));
      if (rw.items.length > 1) {
        const left   = rw.items[0].el.x;
        const right  = Math.max(...rw.items.map(i => i.el.x + i.d.w));
        const totalW = rw.items.reduce((s, i) => s + i.d.w, 0);
        const gap    = Math.max(10, (right - left - totalW) / (rw.items.length - 1));
        let x = left;
        rw.items.forEach(i => { i.el.x = x; x += i.d.w + gap; });
      }
      rw.items.forEach(i => { i.el.y = rw.top; });
    });

    /* 3 ── space the rows evenly between the first and last row */
    rows.sort((a, b) => a.top - b.top);
    if (rows.length > 1) {
      const firstTop   = rows[0].top;
      const lastBottom = Math.max(...rows[rows.length - 1].items.map(i => i.el.y + i.d.h));
      const totalH     = rows.reduce((s, rw) => s + rw.maxH, 0);
      const vgap       = Math.max(12, (lastBottom - firstTop - totalH) / (rows.length - 1));
      let y = firstTop;
      rows.forEach(rw => {
        rw.items.forEach(i => { i.el.y = y; });
        y += rw.maxH + vgap;
      });
    }

    /* 4 ── line columns up when the shape allows it */
    if (rows.length > 1 && rows.every(rw => rw.items.length === 1)) {
      /* pure column → share one x */
      const left = Math.min(...items.map(i => i.el.x));
      items.forEach(i => { i.el.x = left; });
    } else if (rows.length > 1 && rows.every(rw => rw.items.length === rows[0].items.length)) {
      /* even grid → each column shares the leftmost x of that column */
      for (let c = 0; c < rows[0].items.length; c++) {
        const colX = Math.min(...rows.map(rw => rw.items[c].el.x));
        rows.forEach(rw => { rw.items[c].el.x = colX; });
      }
    }

    items.forEach(({ el }) => clampPos(el));
    renderAll();
  }

  /* ── Modal ── */
  function openModal(id) {
    if (modalOpen) return;
    const el = elements.find(e => e.id === id);
    if (!el) return;
    modalOpen = true;

    const isTable = el.type === 'rect-table' || el.type === 'circle-table';
    const isWB    = el.type === 'whiteboard';

    /* ensure students array */
    if (!isWB) {
      const needed = isTable ? (el.studentCount || 4) : 1;
      while (el.students.length < needed) el.students.push('');
      el.students = el.students.slice(0, needed);
    }

    const overlay = document.createElement('div');
    overlay.className = 'sm-overlay';
    overlay.id = 'seatingModal';

    const swatches = Object.entries(COLORS).map(([k, v]) =>
      `<div class="cswatch${el.color===k?' active':''}"
        data-c="${k}" style="background:${v.fill};border:2px solid ${v.stroke}"
        title="${COLOR_NAMES[k]}"></div>`
    ).join('');

    /* ── whiteboard modal (simple) ── */
    if (isWB) {
      overlay.innerHTML = `
        <div class="sm-box">
          <div class="sm-head">
            <span class="sm-title">Whiteboard / Projector</span>
            <button class="sm-close" id="smX">&#x2715;</button>
          </div>
          <div class="sm-body">
            <p style="font-size:13px;color:#999;text-align:center;padding:8px 0">
              Rotate to place on a side wall.</p>
          </div>
          <div class="sm-foot">
            <button class="sm-btn sm-sec" id="smRot">&#x21BB; Rotate 90&deg;</button>
            <button class="sm-btn sm-del" id="smDel">Delete</button>
            <button class="sm-btn sm-ok"  id="smOk">Done</button>
          </div>
        </div>`;
      document.body.appendChild(overlay);

      $('smRot').addEventListener('click', () => {
        el.rotation = el.rotation ? 0 : 90;
        clampPos(el); rerenderOne(id);
      });
      $('smDel').addEventListener('click', () => {
        elements = elements.filter(e => e.id !== id); selected.delete(id);
        closeModal(); renderAll();
      });
      const closeWB = () => closeModal();
      $('smOk').addEventListener('click', closeWB);
      $('smX').addEventListener('click',  closeWB);
      overlay.addEventListener('click', e => { if (e.target === overlay) closeWB(); });
      return;
    }

    /* ── table / desk modal ── */
    overlay.innerHTML = `
      <div class="sm-box">
        <div class="sm-head">
          <span class="sm-title">${typeName(el.type)}</span>
          <button class="sm-close" id="smX">&#x2715;</button>
        </div>
        <div class="sm-body" id="smBody">
          ${isTable ? `
            <div class="sf">
              <label>Table</label>
              <div class="sm-table-row">
                <input type="text"   id="smTableName" value="${esc(el.tableName||'')}"
                  class="si sm-tname-input" placeholder="Table name (optional)"/>
                <input type="number" id="smCount" min="1" max="16"
                  value="${el.studentCount}" class="si si-sm sm-no-spin"/>
              </div>
            </div>
            <div id="smNames">${buildNamesHTML(el)}</div>
          ` : `
            <div class="sf">
              <label>${el.type==='teacher-desk'?"Teacher's name":"Student's name"}</label>
              <input type="text" id="smName0" value="${esc(el.students[0]||'')}"
                class="si" placeholder="${el.type==='teacher-desk'?'Teacher':'Student name'}"
                ${el.type==='desk'?'list="saRoster"':''}/>
            </div>
          `}
          <div class="sf">
            <label>Color</label>
            <div class="cswrap">${swatches}</div>
          </div>
        </div>
        <div class="sm-foot">
          ${el.type==='rect-table'
            ? `<button class="sm-btn sm-sec" id="smRot">&#x21BB; Rotate 90&deg;</button>` : ''}
          <button class="sm-btn sm-del" id="smDel">Delete</button>
          <button class="sm-btn sm-ok"  id="smOk">Done</button>
        </div>
      </div>`;

    document.body.appendChild(overlay);

    /* student count live rebuild */
    if (isTable) {
      $('smCount').addEventListener('input', function () {
        overlay.querySelectorAll('.sn-input').forEach(inp => {
          el.students[parseInt(inp.dataset.i)] = inp.value;
        });
        const n = Math.max(1, Math.min(16, parseInt(this.value) || 1));
        el.studentCount = n;
        while (el.students.length < n) el.students.push('');
        el.students = el.students.slice(0, n);
        $('smNames').innerHTML = buildNamesHTML(el);
      });
    }

    /* color swatches */
    overlay.querySelectorAll('.cswatch').forEach(sw =>
      sw.addEventListener('click', () => {
        overlay.querySelectorAll('.cswatch').forEach(s => s.classList.remove('active'));
        sw.classList.add('active'); el.color = sw.dataset.c; rerenderOne(id);
      })
    );

    /* rotate */
    $('smRot')?.addEventListener('click', () => {
      el.rotation = el.rotation ? 0 : 90;
      clampPos(el); rerenderOne(id);
    });

    const save = () => {
      if (isTable) {
        const tn = $('smTableName');
        if (tn) el.tableName = tn.value.trim();
        overlay.querySelectorAll('.sn-input').forEach(inp => {
          el.students[parseInt(inp.dataset.i)] = inp.value.trim();
        });
      } else {
        const inp = $('smName0');
        if (inp) el.students[0] = inp.value.trim();
      }
      rerenderOne(id); closeModal();
    };

    $('smOk').addEventListener('click', save);
    $('smX').addEventListener('click',  save);
    overlay.addEventListener('click', e => { if (e.target === overlay) save(); });

    $('smDel').addEventListener('click', () => {
      elements = elements.filter(e => e.id !== id); selected.delete(id);
      closeModal(); renderAll();
    });

    setTimeout(() => overlay.querySelector('input')?.focus(), 80);
  }

  function clampPos(el) {
    const room = $('classroom');
    if (!room) return;
    const r = room.getBoundingClientRect(), d = dims(el);
    el.x = Math.max(0, Math.min(r.width  - d.w, el.x));
    el.y = Math.max(0, Math.min(r.height - d.h, el.y));
  }

  function buildNamesHTML(el) {
    const n      = el.studentCount || 4;
    const southN = Math.ceil(n / 2);
    return Array.from({ length: n }, (_, i) => {
      const side = el.type === 'rect-table'
        ? (i < southN ? ' <span class="face-lbl">facing</span>' : ' <span class="face-lbl">back</span>')
        : '';
      return `
        <div class="sf compact">
          <label>Student ${i+1}${side}</label>
          <input type="text" class="si sn-input" data-i="${i}" list="saRoster"
            value="${esc(el.students[i]||'')}" placeholder="Name (optional)"/>
        </div>`;
    }).join('');
  }

  function closeModal() { $('seatingModal')?.remove(); modalOpen = false; }

  /* ── Class roster ── */
  function setRoster(cls) {
    roster = cls ? cls.students.slice() : [];
    let dl = document.getElementById('saRoster');
    if (!dl) { dl = document.createElement('datalist'); dl.id = 'saRoster'; document.body.appendChild(dl); }
    dl.innerHTML = roster.map(n =>
      `<option value="${String(n).replace(/"/g, '&quot;')}"></option>`).join('');
  }

  /* Fill empty student seats (in placement order) from the roster.
     Skips teacher desks and whiteboards; never duplicates an already-placed name. */
  function autoFill() {
    if (!roster.length) { alert('Load a class roster first (use the “Class Roster” button).'); return; }

    const placed = new Set();
    elements.forEach(el => {
      if (el.type === 'whiteboard' || el.type === 'teacher-desk') return;
      el.students.forEach(s => { if (s) placed.add(s); });
    });

    const queue = roster.filter(n => !placed.has(n));
    let qi = 0;
    elements.forEach(el => {
      if (el.type === 'whiteboard' || el.type === 'teacher-desk') return;
      const slots = el.type === 'desk' ? 1 : (el.studentCount || el.students.length || 1);
      for (let i = 0; i < slots && qi < queue.length; i++) {
        if (!el.students[i]) el.students[i] = queue[qi++];
      }
    });

    renderAll();
    if (qi < queue.length) {
      alert(`Placed ${qi} student${qi === 1 ? '' : 's'}. ` +
        `${queue.length - qi} couldn't fit — add more desks or seats.`);
    }
  }

  const typeName = t => ({
    desk: 'Student Desk', 'rect-table': 'Rectangular Table',
    'circle-table': 'Circular Table', 'teacher-desk': "Teacher's Desk",
    whiteboard: 'Whiteboard',
  }[t] || t);

  /* ── Init ── */
  buildPanel();
  load();

})();
