/* ═══════════════════════════════════════════════
   TEACHER TOOL  —  Main Script
   ═══════════════════════════════════════════════ */

/* ─── Tab switching ─── */
(function initTabs() {
  const tabBar = document.getElementById('tabBar');
  const content = document.getElementById('mainContent');

  tabBar.addEventListener('click', (e) => {
    const tab = e.target.closest('.tab');
    if (!tab) return;

    tabBar.querySelectorAll('.tab').forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    content.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));

    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    const panel = document.getElementById('panel-' + tab.dataset.panel);
    if (panel) panel.classList.add('active');
  });

  /* Arrow-key navigation within tab bar */
  tabBar.addEventListener('keydown', (e) => {
    const tabs = [...tabBar.querySelectorAll('.tab')];
    const idx = tabs.indexOf(document.activeElement);
    if (idx === -1) return;
    if (e.key === 'ArrowRight' && idx < tabs.length - 1) {
      tabs[idx + 1].focus(); tabs[idx + 1].click(); e.preventDefault();
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      tabs[idx - 1].focus(); tabs[idx - 1].click(); e.preventDefault();
    }
  });
})();


/* ═══════════════════════════════════════════════
   SEARCH  — shared factory used by header + welcome
   ═══════════════════════════════════════════════ */
function escHtml(str) {
  return str.replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}

function highlightMatch(text, q) {
  const idx = text.toLowerCase().indexOf(q);
  if (idx === -1) return escHtml(text);
  return (
    escHtml(text.slice(0, idx)) +
    '<mark style="background:rgba(74,126,200,0.18);border-radius:2px;padding:0 1px">' +
    escHtml(text.slice(idx, idx + q.length)) +
    '</mark>' +
    escHtml(text.slice(idx + q.length))
  );
}

function buildSearchItems() {
  const items = [...document.querySelectorAll('.tab')].map(tab => ({
    label: tab.querySelector('.tab-label').textContent.trim(),
    type: 'Tool',
    action: () => tab.click(),
  }));
  items.push(
    {
      label: 'My Classes',
      type: 'Profile',
      keywords: 'profile classes roster account periods',
      action: () => { if (window.TTGoProfile) window.TTGoProfile(); },
    },
    {
      label: 'Settings',
      type: 'Settings',
      keywords: 'settings dark mode large text appearance preferences',
      action: () => { const b = document.getElementById('settingsBtn'); if (b) b.click(); },
    }
  );
  return items;
}

function makeSearch(inputEl, dropdownEl, { onSelect } = {}) {
  const items = buildSearchItems();
  let focusedIdx = -1;

  function render(query) {
    const q = query.trim().toLowerCase();
    dropdownEl.innerHTML = '';
    focusedIdx = -1;
    if (!q) { dropdownEl.classList.remove('open'); return; }

    const matches = items.filter(item =>
      (item.label + ' ' + (item.keywords || '')).toLowerCase().includes(q));

    if (!matches.length) {
      dropdownEl.innerHTML = `<div class="search-item" style="color:#AAAAAA;cursor:default">
        No results for &ldquo;<strong>${escHtml(query)}</strong>&rdquo;
      </div>`;
      dropdownEl.classList.add('open');
      return;
    }

    matches.forEach(item => {
      const el = document.createElement('div');
      el.className = 'search-item';
      el.setAttribute('role', 'option');
      el.innerHTML = `
        <svg class="search-item-icon" viewBox="0 0 20 20" fill="none">
          <rect x="3" y="4" width="10" height="13" rx="1.5" stroke="#888" stroke-width="1.5"/>
          <rect x="7" y="2" width="10" height="13" rx="1.5" stroke="#888" stroke-width="1.5" fill="white"/>
        </svg>
        <span class="search-item-label">${highlightMatch(item.label, q)}</span>
        <span class="search-item-type">${item.type}</span>
      `;
      el.addEventListener('mousedown', (e) => {
        e.preventDefault();
        item.action();
        clear();
        if (onSelect) onSelect();
      });
      dropdownEl.appendChild(el);
    });

    dropdownEl.classList.add('open');
  }

  function clear() {
    inputEl.value = '';
    dropdownEl.classList.remove('open');
    dropdownEl.innerHTML = '';
    focusedIdx = -1;
  }

  function moveFocus(dir) {
    const rows = [...dropdownEl.querySelectorAll('.search-item')];
    if (!rows.length) return;
    rows.forEach(r => r.classList.remove('focused'));
    focusedIdx = Math.max(0, Math.min(rows.length - 1, focusedIdx + dir));
    rows[focusedIdx].classList.add('focused');
    rows[focusedIdx].scrollIntoView({ block: 'nearest' });
  }

  inputEl.addEventListener('input', () => render(inputEl.value));
  inputEl.addEventListener('focus', () => { if (inputEl.value) render(inputEl.value); });
  inputEl.addEventListener('blur', () => setTimeout(() => dropdownEl.classList.remove('open'), 150));
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { moveFocus(+1); e.preventDefault(); }
    if (e.key === 'ArrowUp') { moveFocus(-1); e.preventDefault(); }
    if (e.key === 'Escape') { clear(); inputEl.blur(); }
    if (e.key === 'Enter') {
      const focused = dropdownEl.querySelector('.search-item.focused');
      if (focused) focused.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    }
  });

  return { clear };
}

/* Header search */
makeSearch(
  document.getElementById('searchInput'),
  document.getElementById('searchDropdown')
);

/* Welcome search — with upward shift animation */
(function initWelcomeSearch() {
  const inputEl = document.getElementById('welcomeSearchInput');
  const dropdownEl = document.getElementById('welcomeSearchDropdown');
  const section = document.getElementById('welcomeSearchSection');

  function activate() { section.classList.add('search-active'); }
  function deactivate() {
    if (!inputEl.value.trim()) section.classList.remove('search-active');
  }

  inputEl.addEventListener('focus', activate);
  inputEl.addEventListener('blur', () => setTimeout(deactivate, 160));
  inputEl.addEventListener('input', () => {
    if (inputEl.value.trim()) activate();
  });

  makeSearch(inputEl, dropdownEl, {
    onSelect: () => section.classList.remove('search-active'),
  });
})();


/* ─── Settings panel ─── */
(function initSettings() {
  const btn           = document.getElementById('settingsBtn');
  const overlay       = document.getElementById('spOverlay');
  const panel         = document.getElementById('spPanel');
  const closeBtn      = document.getElementById('spClose');
  const darkToggle    = document.getElementById('darkToggle');
  const largeToggle   = document.getElementById('largeTextToggle');

  function open()  { panel.classList.add('open');  overlay.classList.add('open');  }
  function close() { panel.classList.remove('open'); overlay.classList.remove('open'); }

  function applyDark(on) {
    document.body.classList.toggle('dark', on);
    darkToggle.setAttribute('aria-checked', String(on));
    darkToggle.classList.toggle('on', on);
    localStorage.setItem('tt-dark', on ? '1' : '');
  }

  function applyLargeText(on) {
    document.body.classList.toggle('large-text', on);
    largeToggle.setAttribute('aria-checked', String(on));
    largeToggle.classList.toggle('on', on);
    localStorage.setItem('tt-large', on ? '1' : '');
  }

  /* restore saved preferences */
  if (localStorage.getItem('tt-dark'))  applyDark(true);
  if (localStorage.getItem('tt-large')) applyLargeText(true);

  btn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', close);
  darkToggle.addEventListener('click',  () => applyDark(!darkToggle.classList.contains('on')));
  largeToggle.addEventListener('click', () => applyLargeText(!largeToggle.classList.contains('on')));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && panel.classList.contains('open')) close();
  });
})();


/* ─── Avatar button → Profile (account screen, not a tool tab) ─── */
document.getElementById('avatarBtn').addEventListener('click', () => {
  if (window.TTGoProfile) window.TTGoProfile();
});

/* ─── Logo → Home (logo removed; guard if present) ─── */
(function initLogo() {
  const logoBtn = document.getElementById('logoBtn');
  if (!logoBtn) return;
  logoBtn.addEventListener('click', () => {
    const homeTab = document.querySelector('.tab[data-panel="home"]');
    if (homeTab) homeTab.click();
  });
  logoBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      logoBtn.click();
    }
  });
})();


/* ═══════════════════════════════════════════════
   STUDENT PICKER  —  Spinning Wheel
   ═══════════════════════════════════════════════ */
(function initStudentPicker() {
  const canvas = document.getElementById('spinCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const COLORS = ['#36CFF5', '#8F2727', '#DBB407', '#4FD446'];
  const SPIN_MS = 6000 + Math.random() * 3000;

  /* ── state ── */
  let wheelAngle = 0;   // radians; increases = clockwise
  let spinning = false;
  let spinStart = 0;   // performance.now() at spin begin
  let angleFrom = 0;   // wheelAngle at spin begin
  let angleTo = 0;   // target wheelAngle
  let animId = null;
  let lastT = 0;

  let winnerIdx = -1;
  let lastWinner = '';
  let showWinner = false;
  let selected = [];

  /* arrow physics */
  let aPhi = 0;   // deflection (radians; + = clockwise / rightward)
  let aVel = 0;
  let lastSeg = -1;

  const SPRING = 360;
  const DAMP = 15;
  const IMPULSE_K = 32;

  /* ── DOM ── */
  const namesInput = document.getElementById('namesInput');
  const selList = document.getElementById('selectedList');
  const overlay = document.getElementById('resultOverlay');
  const overlayName = document.getElementById('resultName');
  document.getElementById('resultDismiss'); // dismiss handled by overlay click
  const removeBtn = document.getElementById('removeBtn');

  /* ═══ helpers ═══ */

  function getNames() {
    return namesInput.value
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);
  }
  function assignColors(n, palette) {
    const result = [];
    for (let i = 0; i < n; i++) {
      const prev = i > 0 ? result[i - 1] : null;
      const isLast = (i === n - 1);
      const first = result[0] || null;

      // Find a color that doesn't match prev, and (if last) doesn't match first
      let chosen = null;
      for (let k = 0; k < palette.length; k++) {
        const c = palette[(i + k) % palette.length];
        if (c === prev) continue;
        if (isLast && c === first) continue;
        chosen = c;
        break;
      }

      // Fallback: if no valid color exists (e.g., n is odd and palette has 2),
      // just pick something different from prev — the last/first collision is unavoidable
      if (!chosen) {
        chosen = palette.find(c => c !== prev) || palette[0];
      }

      result.push(chosen);
    }
    return result;
  }


  /* Which segment index is currently under the arrow (12-o'clock)? */
  function segAtArrow(angle, n) {
    if (n < 1) return -1;
    const seg = (2 * Math.PI) / n;
    /* Arrow is at top = −π/2 in canvas coords.
       Segment i occupies [angle + i·seg − π/2, angle + (i+1)·seg − π/2].
       Segment at top when floor(−angle / seg) mod n == i */
    const raw = Math.floor(-angle / seg);
    return ((raw % n) + n) % n;
  }

  /* ─── ease quintic functions ─── */
  function easeExp(t) { return t >= 1 ? 1 : 1 - Math.pow(1 - t, 5); }
  function easeExpVel(t) { return t >= 1 ? 0 : 5 * Math.pow(1 - t, 4); }

  /* ═══ size sync ═══ */
  function syncSize() {
    const size = 750;
    if (canvas.width !== size || canvas.height !== size) {
      canvas.width = size;
      canvas.height = size;
      draw();
    }
  }

  /* ═══ draw ═══ */
  function draw() {
    const names = getNames();
    const n = names.length;
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    const R = Math.min(cx, cy) * 0.87;

    ctx.clearRect(0, 0, W, H);

    if (n === 0) {
      drawEmpty(cx, cy, R);
    } else {
      drawSegments(cx, cy, R, names, n);
    }
    drawCenter(cx, cy, R);
    drawArrow(cx, cy, R);
  }

  function drawEmpty(cx, cy, R) {
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = '#D8D0C4';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  function drawSegments(cx, cy, R, names, n) {
    const seg = (2 * Math.PI) / n;
    const wedgeColors = assignColors(n, COLORS);

    for (let i = 0; i < n; i++) {
      const a0 = wheelAngle + i * seg - Math.PI / 2;
      const a1 = a0 + seg;
      const amid = (a0 + a1) / 2;

      const winner = showWinner && i === winnerIdx;
      const dx = 0;
      const dy = 0;
      const r = R;

      /* segment fill */
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx + dx, cy + dy);
      ctx.arc(cx + dx, cy + dy, r, a0, a1);
      ctx.closePath();
      ctx.fillStyle = wedgeColors[i];
      ctx.fill();

      if (showWinner && !winner) {
        ctx.fillStyle = 'rgba(0,0,0,0.44)';
        ctx.fill();
      }

      ctx.strokeStyle = 'rgba(255,255,255,0.32)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      /* label */
      const textR = (r * 0.62);
      ctx.save();
      ctx.translate(cx + dx + Math.cos(amid) * textR,
        cy + dy + Math.sin(amid) * textR);
      ctx.rotate(amid + Math.PI / 2);

      const fs = Math.max(9, Math.min(16, R * 0.082));
      ctx.font = `bold ${fs}px Inter, sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 3;

      const maxW = r * 0.46;
      let label = names[i];
      if (ctx.measureText(label).width > maxW) {
        while (label.length > 1 && ctx.measureText(label + '…').width > maxW)
          label = label.slice(0, -1);
        label += '…';
      }
      ctx.fillText(label, 0, 0);
      ctx.restore();
    }

    /* outer ring */
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  function drawCenter(cx, cy, R) {
    const cr = R * 0.155;
    ctx.beginPath();
    ctx.arc(cx, cy, cr, 0, Math.PI * 2);
    ctx.fillStyle = '#111';
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = 'white';
    ctx.font = `bold ${Math.floor(R * 0.088)}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SPIN', cx, cy);
  }

  function drawArrow(cx, cy, R) {
    const pivX = cx;
    const pivY = cy - R - 17;
    const len = Math.min(46, R * 0.16);

    ctx.save();
    ctx.translate(pivX, pivY);
    ctx.rotate(-aPhi);

    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 2;

    /* triangle: tip points DOWN into wheel */
    ctx.beginPath();
    ctx.moveTo(0, len);          // tip
    ctx.lineTo(-10, -len * 0.28);
    ctx.lineTo(10, -len * 0.28);
    ctx.closePath();
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = '#1A1A1A';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    /* pivot pin */
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#3A3A3A';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }

  /* ═══ spin logic ═══ */

  function pickTarget() {
    const names = getNames();
    const n = names.length;
    winnerIdx = Math.floor(Math.random() * n);
    const seg = (2 * Math.PI) / n;

    /* target: winner segment at arrow (top).
       segAtArrow(T, n) == winnerIdx  when  floor(−T/seg) ≡ winnerIdx (mod n)
       i.e. −T is in [winnerIdx·seg + k·2π, (winnerIdx+1)·seg + k·2π)
       So T is in (−(winnerIdx+1)·seg − k·2π, −winnerIdx·seg − k·2π]      */
    const frac = 0.08 + Math.random() * 0.86;   // avoid landing on edges
    const base = -(winnerIdx + frac) * seg;
    const extraTurn = 3 + Math.random() * 4;
    const minT = wheelAngle + extraTurn * 2 * Math.PI; // at least 5 full rotations
    const k = Math.ceil((minT - base) / (2 * Math.PI));
    return base + k * 2 * Math.PI;
  }

  function startSpin() {
    const names = getNames();
    if (names.length < 2) return;

    showWinner = false;
    overlay.classList.add('hidden');
    angleFrom = wheelAngle;
    angleTo = pickTarget();
    spinStart = performance.now();
    lastT = spinStart;
    spinning = true;
    lastSeg = segAtArrow(wheelAngle, names.length);

    if (animId) cancelAnimationFrame(animId);
    animId = requestAnimationFrame(frame);
  }

  function frame(now) {
    const dt = Math.min((now - lastT) / 1000, 0.05);
    lastT = now;
    const elapsed = now - spinStart;
    const prog = Math.min(elapsed / SPIN_MS, 1);

    wheelAngle = angleFrom + (angleTo - angleFrom) * easeExp(prog);

    /* ── arrow physics ── */
    const names = getNames();
    const n = names.length;
    if (n > 0) {
      const cur = segAtArrow(wheelAngle, n);
      if (cur !== lastSeg) {
        /* segment boundary crossed — impulse proportional to current speed */
        const totalDelta = angleTo - angleFrom;
        const velNorm = easeExpVel(prog);                           // d(easeExp)/dt
        const radPerSec = totalDelta * velNorm / (SPIN_MS / 1000);   // rad/s
        aVel += Math.min(radPerSec * IMPULSE_K, 70.5);
        lastSeg = cur;
      }
    }

    aVel += (-SPRING * aPhi - DAMP * aVel) * dt;
    aPhi += aVel * dt;
    aPhi = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, aPhi));

    draw();

    if (prog < 1) {
      animId = requestAnimationFrame(frame);
    } else {
      wheelAngle = angleTo;
      spinning = false;
      arrowSettle();
      onComplete();
    }
  }

  /* let arrow naturally oscillate to rest after spin ends */
  function arrowSettle() {
    function tick() {
      const dt = 0.016;
      aVel += (-SPRING * aPhi - DAMP * aVel) * dt;
      aPhi += aVel * dt;
      aPhi = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, aPhi));
      draw();
      if (Math.abs(aPhi) > 0.003 || Math.abs(aVel) > 0.01) {
        requestAnimationFrame(tick);
      } else {
        aPhi = 0; aVel = 0; draw();
      }
    }
    requestAnimationFrame(tick);
  }

  function onComplete() {
    const names = getNames();
    if (!names.length) return;

    lastWinner = names[winnerIdx];

    /* brief pause then reveal */
    setTimeout(() => {
      showWinner = true;
      draw();
      setTimeout(() => {
        overlayName.textContent = lastWinner;
        overlay.classList.remove('hidden');
      }, 280);
    }, 180);
  }

  /* ═══ instant-finish on click while spinning ═══ */
  function finishInstantly() {
    if (animId) cancelAnimationFrame(animId);
    wheelAngle = angleTo;
    spinning = false;
    aPhi = 0; aVel = 0;
    onComplete();
    draw();
  }

  /* ═══ events ═══ */

  canvas.addEventListener('click', () => {
    if (spinning) { finishInstantly(); return; }
    startSpin();
  });

  overlay.addEventListener('click', () => {
    overlay.classList.add('hidden');
  });

  removeBtn.addEventListener('click', () => {
    if (!lastWinner) return;

    /* remove from textarea */
    const lines = namesInput.value
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);
    const idx = lines.indexOf(lastWinner);
    if (idx !== -1) lines.splice(idx, 1);
    namesInput.value = lines.join('\n');

    /* add to selected list */
    selected.push(lastWinner);
    renderSelected();

    /* reset */
    lastWinner = '';
    winnerIdx = -1;
    showWinner = false;
    overlay.classList.add('hidden');
    draw();
  });

  namesInput.addEventListener('input', () => {
    if (!spinning) { showWinner = false; winnerIdx = -1; draw(); }
  });

  function renderSelected() {
    selList.innerHTML = selected
      .map((name, i) =>
        `<li><span class="sel-num">${i + 1}</span>${name}</li>`)
      .join('');
  }

  /* ═══ class picker ═══ */
  if (window.TTClassPicker) {
    const bar = document.createElement('div');
    bar.className = 'tool-classbar';
    bar.innerHTML = '<span class="tool-classbar-label">Load a class/period:</span>';
    bar.appendChild(TTClassPicker.create({
      onPick: (cls) => {
        if (!cls) return;
        namesInput.value = cls.students.join('\n');
        namesInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }));
    const box = document.querySelector('.names-box-wrap');
    if (box && box.parentNode) box.parentNode.insertBefore(bar, box);
  }

  /* ═══ init ═══ */
  window.addEventListener('resize', syncSize);
  syncSize();
  draw();

})();
