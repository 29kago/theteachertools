/* ═══════════════════════════════════════════════
   BEHAVIOR CHART
   ═══════════════════════════════════════════════ */
(function BehaviorChart() {

  const ZONES     = ['green', 'yellow', 'red'];
  const ZONE_LABEL = { green: 'Outstanding', yellow: 'Getting There', red: 'Needs Work' };
  const ZONE_BG    = { green: '#C8E6C9',    yellow: '#FFF9C4',       red: '#FFCDD2' };
  const FACE_COLOR = { green: '#66BB6A',    yellow: '#FFEE58',       red: '#EF5350' };
  const HEADER_CLR = { green: '#2E7D32',    yellow: '#F57F17',       red: '#B71C1C' };

  let students  = [];
  let selected  = new Set();
  let idN       = 0;
  let dragState = null;  // { ids, ghost, startX, startY, moved, sourceZone }
  let bandState = null;  // { zone, x0, y0, x1, y1 }

  const LS     = 'tt-behavior';
  const uid    = () => 'bc' + (++idN);
  const $      = id => document.getElementById(id);
  const escH   = s  => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  /* ── Persistence ── */
  function save() {
    const data = students.map(s => ({ name: s.name, zone: s.zone }));
    try { localStorage.setItem(LS, JSON.stringify(data)); } catch (e) { /* ignore */ }
  }
  function load() {
    let data = [];
    try { const a = JSON.parse(localStorage.getItem(LS)); if (Array.isArray(a)) data = a; }
    catch (e) { /* ignore */ }
    students = data
      .filter(s => s && s.name)
      .map(s => {
        const zone = ZONES.includes(s.zone) ? s.zone : 'yellow';
        /* already red when loaded → they've had their brows a while */
        return { id: uid(), name: String(s.name), zone, redSince: zone === 'red' ? 0 : undefined };
      });
    const input = $('bcInput');
    if (input) input.value = students.map(s => s.name).join('\n');
    renderAll();
  }

  /* ── Face SVG generators ── */
  /* 4-point sparkle star, wrapped in a <g> so the CSS twinkle transform
     doesn't fight the positioning transform */
  function sparkle(x, y, r, cls) {
    const p = v => v.toFixed(1);
    return `<g transform="translate(${p(x)},${p(y)})">
      <path class="bcf-spark ${cls}" fill="rgba(255,255,255,0.95)"
        d="M0,${p(-r)} L${p(r*0.3)},${p(-r*0.3)} L${p(r)},0 L${p(r*0.3)},${p(r*0.3)} L0,${p(r)} L${p(-r*0.3)},${p(r*0.3)} L${p(-r)},0 L${p(-r*0.3)},${p(-r*0.3)} Z"/>
    </g>`;
  }

  function smileSVG(s, fill) {
    return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg" style="overflow:visible">
      <circle cx="${s/2}" cy="${s/2}" r="${s/2-1}" fill="${fill}" stroke="rgba(0,0,0,0.12)" stroke-width="1.5"/>
      <circle class="bcf-eye" cx="${(s*0.35).toFixed(1)}" cy="${(s*0.38).toFixed(1)}" r="${(s*0.075).toFixed(1)}" fill="rgba(0,0,0,0.7)"/>
      <circle class="bcf-eye e2" cx="${(s*0.65).toFixed(1)}" cy="${(s*0.38).toFixed(1)}" r="${(s*0.075).toFixed(1)}" fill="rgba(0,0,0,0.7)"/>
      <path class="bcf-mouth" d="M${(s*0.27).toFixed(1)},${(s*0.57).toFixed(1)} Q${s/2},${(s*0.77).toFixed(1)} ${(s*0.73).toFixed(1)},${(s*0.57).toFixed(1)}"
        stroke="rgba(0,0,0,0.7)" stroke-width="${(s*0.055).toFixed(1)}" fill="none" stroke-linecap="round"/>
      <circle cx="${(s*0.23).toFixed(1)}" cy="${(s*0.59).toFixed(1)}" r="${(s*0.1).toFixed(1)}" fill="rgba(255,80,80,0.22)"/>
      <circle cx="${(s*0.77).toFixed(1)}" cy="${(s*0.59).toFixed(1)}" r="${(s*0.1).toFixed(1)}" fill="rgba(255,80,80,0.22)"/>
      ${sparkle(s*0.41, s*0.31, s*0.07,  's1')}
      ${sparkle(s*0.71, s*0.31, s*0.07,  's2')}
      ${sparkle(s*0.29, s*0.46, s*0.045, 's3')}
    </svg>`;
  }

  function mehSVG(s, fill) {
    return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${s/2}" cy="${s/2}" r="${s/2-1}" fill="${fill}" stroke="rgba(0,0,0,0.12)" stroke-width="1.5"/>
      <circle cx="${(s*0.35).toFixed(1)}" cy="${(s*0.38).toFixed(1)}" r="${(s*0.075).toFixed(1)}" fill="rgba(0,0,0,0.7)"/>
      <circle cx="${(s*0.65).toFixed(1)}" cy="${(s*0.38).toFixed(1)}" r="${(s*0.075).toFixed(1)}" fill="rgba(0,0,0,0.7)"/>
      <line x1="${(s*0.3).toFixed(1)}"  y1="${(s*0.63).toFixed(1)}"
            x2="${(s*0.7).toFixed(1)}"  y2="${(s*0.63).toFixed(1)}"
        stroke="rgba(0,0,0,0.7)" stroke-width="${(s*0.055).toFixed(1)}" stroke-linecap="round"/>
    </svg>`;
  }

  function frownSVG(s, fill) {
    return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg" style="overflow:visible">
      <circle cx="${s/2}" cy="${s/2}" r="${s/2-1}" fill="${fill}" stroke="rgba(0,0,0,0.12)" stroke-width="1.5"/>
      <g class="bcf-brows">
        <path d="M${(s*0.27).toFixed(1)},${(s*0.3).toFixed(1)} L${(s*0.41).toFixed(1)},${(s*0.34).toFixed(1)}"
          stroke="rgba(0,0,0,0.55)" stroke-width="${(s*0.045).toFixed(1)}" stroke-linecap="round"/>
        <path d="M${(s*0.73).toFixed(1)},${(s*0.3).toFixed(1)} L${(s*0.59).toFixed(1)},${(s*0.34).toFixed(1)}"
          stroke="rgba(0,0,0,0.55)" stroke-width="${(s*0.045).toFixed(1)}" stroke-linecap="round"/>
      </g>
      <circle cx="${(s*0.35).toFixed(1)}" cy="${(s*0.41).toFixed(1)}" r="${(s*0.075).toFixed(1)}" fill="rgba(0,0,0,0.7)"/>
      <circle cx="${(s*0.65).toFixed(1)}" cy="${(s*0.41).toFixed(1)}" r="${(s*0.075).toFixed(1)}" fill="rgba(0,0,0,0.7)"/>
      <path d="M${(s*0.27).toFixed(1)},${(s*0.7).toFixed(1)} Q${s/2},${(s*0.52).toFixed(1)} ${(s*0.73).toFixed(1)},${(s*0.7).toFixed(1)}"
        stroke="rgba(0,0,0,0.7)" stroke-width="${(s*0.055).toFixed(1)}" fill="none" stroke-linecap="round"/>
    </svg>`;
  }

  function faceSVG(zone, size) {
    const c = FACE_COLOR[zone];
    if (zone === 'green')  return smileSVG(size, c);
    if (zone === 'yellow') return mehSVG(size, c);
    return frownSVG(size, c);
  }

  /* ── Build panel ── */
  function buildPanel() {
    const panel = $('panel-tool-c');
    if (!panel) return;

    const zonesHTML = ZONES.map(z => `
      <div class="bc-zone" id="bcZone-${z}" data-zone="${z}" style="background:${ZONE_BG[z]}">
        <div class="bc-zone-head">
          <div class="bc-head-face" id="bcHFace-${z}">${faceSVG(z, 92)}${
            z === 'red' ? '<img class="bcf-fire-gif" src="../images/fire.gif" alt="">' : ''
          }</div>
          <div class="bc-zone-label" style="color:${HEADER_CLR[z]}">${ZONE_LABEL[z]}</div>
        </div>
        <div class="bc-cards-area" id="bcArea-${z}">
          <div class="bc-sel-band hidden" id="bcBand-${z}"></div>
        </div>
      </div>`).join('');

    panel.innerHTML = `
      <div class="bc-wrap">
        <div class="bc-chart" id="bcChart">${zonesHTML}</div>
        <div class="bc-names-section">
          <div class="bc-names-inner">
            <div class="bc-names-hdr">
              <h3 class="bc-names-title">Students</h3>
              <p class="bc-names-sub">One name per line — new students start in <strong>Getting There</strong>. Existing students keep their zone.</p>
            </div>
            <textarea class="bc-names-input" id="bcInput"
              placeholder="Enter names here, one per line…" spellcheck="false"></textarea>
          </div>
        </div>
      </div>`;

    /* Zone mouse events */
    ZONES.forEach(z => $(`bcZone-${z}`).addEventListener('mousedown', e => onZoneDown(e, z)));

    /* Class picker — load a saved roster into the names box */
    if (window.TTClassPicker) {
      const bar = document.createElement('div');
      bar.className = 'tool-classbar';
      bar.appendChild(TTClassPicker.create({
        onPick: (cls) => {
          if (!cls) return;
          $('bcInput').value = cls.students.join('\n');
          $('bcInput').dispatchEvent(new Event('input', { bubbles: true }));
        }
      }));
      panel.querySelector('.bc-names-hdr').appendChild(bar);
    }

    /* Auto-update on textarea input (like Student Picker) */
    $('bcInput').addEventListener('input', updateStudents);

    document.addEventListener('mousemove', onDocMove);
    document.addEventListener('mouseup',   onDocUp);
    document.addEventListener('keydown',   onKey);
  }

  /* ── Students ── */
  function getNames() {
    return ($('bcInput')?.value || '').split('\n').map(s => s.trim()).filter(Boolean);
  }

  function updateStudents() {
    const names    = getNames();
    const existing = new Map(students.map(s => [s.name, s]));
    students = names.map(name =>
      existing.has(name) ? existing.get(name) : { id: uid(), name, zone: 'yellow' }
    );
    selected.clear();
    renderAll();
    save();
  }

  /* ── Render ── */
  function renderAll() {
    ZONES.forEach(z => {
      const area = $(`bcArea-${z}`);
      if (!area) return;
      area.querySelectorAll('.bc-card').forEach(n => n.remove());
      students.filter(s => s.zone === z).forEach(s => area.appendChild(mkCard(s, z)));
    });
    checkAnim();
  }

  const BROW_DELAY = 2200; /* ms a student is red before the brows arrive */

  function mkCard(student, zone) {
    const div = document.createElement('div');
    div.className  = 'bc-card' + (selected.has(student.id) ? ' sel' : '');
    div.dataset.id = student.id;

    /* Red faces: brows arrive BROW_DELAY after entering red, then stick.
       Re-renders keep the remaining delay so the brows never blink away. */
    let faceCls = 'bc-card-face', faceStyle = '', extra = '';
    if (zone === 'red') {
      extra = '<img class="bcf-fire-gif" src="../images/fire.gif" alt="">';
      const elapsed = Date.now() - (student.redSince || 0);
      if (elapsed >= BROW_DELAY) faceCls += ' bcf-browed';
      else faceStyle = ` style="--brow-delay:${BROW_DELAY - elapsed}ms"`;
    }

    div.innerHTML  = `
      <div class="${faceCls}" id="bcCF-${student.id}"${faceStyle}>${faceSVG(zone, 64)}${extra}</div>
      <div class="bc-card-name">${escH(student.name)}</div>`;
    return div;
  }

  /* ── Animations ──
     Faces animate via CSS. JS only tracks two class-wide states:
     .bc-allgreen on the chart  → eye sparkles run (whole class green)
     .bc-allred on the red head → "Needs Work" face earns its eyebrows */
  function checkAnim() {
    const n        = students.length;
    const allGreen = n > 0 && students.every(s => s.zone === 'green');
    const allRed   = n > 0 && students.every(s => s.zone === 'red');
    $('bcChart')?.classList.toggle('bc-allgreen', allGreen);
    const hfRed = $('bcHFace-red');
    if (hfRed) hfRed.classList.toggle('bc-allred', allRed);
  }

  /* ── Zone mousedown ── */
  function onZoneDown(e, zone) {
    if (e.button !== 0) return;
    const card = e.target.closest('.bc-card');

    if (card) {
      const id = card.dataset.id;
      if (!e.shiftKey && !selected.has(id)) { selected.clear(); renderAll(); }
      selected.add(id);
      card.classList.add('sel');

      dragState = {
        ids: [...selected],
        startX: e.clientX, startY: e.clientY,
        moved: false, sourceZone: zone, ghost: null,
      };
      e.preventDefault();
    } else {
      if (!e.shiftKey) { selected.clear(); renderAll(); }
      const area = $(`bcArea-${zone}`);
      const ar   = area.getBoundingClientRect();
      const x    = e.clientX - ar.left;
      const y    = e.clientY - ar.top + area.scrollTop;
      bandState = { zone, x0: x, y0: y, x1: x, y1: y };
      const band = $(`bcBand-${zone}`);
      band.style.cssText = `left:${x}px;top:${y}px;width:0;height:0`;
      band.classList.remove('hidden');
      e.preventDefault();
    }
  }

  /* ── Doc mousemove ── */
  function onDocMove(e) {
    if (dragState) {
      const dx = e.clientX - dragState.startX;
      const dy = e.clientY - dragState.startY;
      if (!dragState.moved && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
        dragState.moved = true;
        const ghost = document.createElement('div');
        ghost.className = 'bc-ghost';
        if (dragState.ids.length === 1) {
          const st = students.find(s => s.id === dragState.ids[0]);
          ghost.innerHTML = `
            <div class="bc-card-face">${faceSVG(dragState.sourceZone, 52)}</div>
            <div class="bc-card-name">${escH(st?.name || '')}</div>`;
        } else {
          ghost.innerHTML = `
            <div class="bc-ghost-count">${dragState.ids.length}</div>
            <div class="bc-card-name">students</div>`;
        }
        ghost.style.cssText = `left:${e.clientX}px;top:${e.clientY}px`;
        document.body.appendChild(ghost);
        dragState.ghost = ghost;
      }

      if (dragState.ghost) {
        dragState.ghost.style.left = e.clientX + 'px';
        dragState.ghost.style.top  = e.clientY + 'px';
      }

      ZONES.forEach(z => {
        const zoneEl = $(`bcZone-${z}`);
        if (!zoneEl) return;
        const r   = zoneEl.getBoundingClientRect();
        const over = e.clientX >= r.left && e.clientX <= r.right
                  && e.clientY >= r.top  && e.clientY <= r.bottom;
        zoneEl.classList.toggle('bc-drop-target', over && dragState.moved);
      });
    }

    if (bandState) {
      const area = $(`bcArea-${bandState.zone}`);
      const ar   = area.getBoundingClientRect();
      bandState.x1 = Math.max(0, Math.min(area.scrollWidth,  e.clientX - ar.left));
      bandState.y1 = Math.max(0, Math.min(area.scrollHeight, e.clientY - ar.top + area.scrollTop));
      const bx = Math.min(bandState.x0, bandState.x1);
      const by = Math.min(bandState.y0, bandState.y1);
      const bw = Math.abs(bandState.x1 - bandState.x0);
      const bh = Math.abs(bandState.y1 - bandState.y0);
      $(`bcBand-${bandState.zone}`).style.cssText = `left:${bx}px;top:${by}px;width:${bw}px;height:${bh}px`;

      area.querySelectorAll('.bc-card').forEach(card => {
        const cr = card.getBoundingClientRect();
        /* convert card viewport coords → area content coords */
        const cx = cr.left - ar.left;
        const cy = cr.top  - ar.top + area.scrollTop;
        const hit = cx < bx + bw && cx + cr.width > bx && cy < by + bh && cy + cr.height > by;
        hit ? selected.add(card.dataset.id) : selected.delete(card.dataset.id);
      });
      document.querySelectorAll('.bc-card').forEach(c =>
        c.classList.toggle('sel', selected.has(c.dataset.id))
      );
    }
  }

  /* ── Doc mouseup ── */
  function onDocUp(e) {
    if (dragState) {
      if (dragState.ghost) { dragState.ghost.remove(); dragState.ghost = null; }

      let targetZone = null;
      ZONES.forEach(z => {
        const zoneEl = $(`bcZone-${z}`);
        if (!zoneEl) return;
        zoneEl.classList.remove('bc-drop-target');
        const r = zoneEl.getBoundingClientRect();
        if (e.clientX >= r.left && e.clientX <= r.right
         && e.clientY >= r.top  && e.clientY <= r.bottom) {
          targetZone = z;
        }
      });

      if (dragState.moved && targetZone) {
        dragState.ids.forEach(id => {
          const st = students.find(s => s.id === id);
          if (!st) return;
          if (targetZone === 'red' && st.zone !== 'red') st.redSince = Date.now();
          if (targetZone !== 'red') delete st.redSince;
          st.zone = targetZone;
        });
        selected.clear();
        renderAll();
        save();
      }
      dragState = null;
    }

    if (bandState) {
      $(`bcBand-${bandState.zone}`)?.classList.add('hidden');
      bandState = null;
    }
  }

  /* ── Keyboard ── */
  function onKey(e) {
    const tag = document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (e.key === 'Escape') { selected.clear(); renderAll(); }
  }

  /* ── Init ── */
  buildPanel();
  load();

})();
