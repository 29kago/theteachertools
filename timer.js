/* ═══════════════════════════════════════════════
   TEACHER TOOL  —  Countdown Timer
   Digital LCD watch. The countdown sits where the time is,
   with the live time of day above it. A line flush with the
   screen depletes clockwise (white → red); when it finishes,
   "PENCILS DOWN" scrolls letter-by-letter across the display
   and an alarm beeps.
   ═══════════════════════════════════════════════ */
(function TimerTool() {

  const $ = id => document.getElementById(id);
  const pad = n => String(n).padStart(2, '0');
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

  const DANGER = 0.12;                 // frame turns red in the final 12%

  /* Rounded-rect path that sits OUTSIDE the screen (coords extend past the
     0–190 / 0–100 viewBox; shown via overflow:visible). Starts at the top
     centre and runs clockwise back to the top centre, forming a closed loop. */
  const FRAME_PATH =
    'M95,-9 H187 A12,12 0 0 1 199,3 V97 A12,12 0 0 1 187,109 H3 A12,12 0 0 1 -9,97 V3 A12,12 0 0 1 3,-9 H95 Z';

  /* "PENCILS DOWN" alarm message. The display has a FIXED set of cells that
     never move; the message is revealed split-flap style — each cell flickers
     through glyphs then locks onto its letter, left to right, then the next
     page does the same. Nothing slides. */
  const MSG = 'PENCILS DOWN';
  const CELLS = 8;                     // fixed character cells (matches the HH:MM:SS clock width)
  const SCRAMBLE = 'PENCILSDOWABRTUVXYZ0123456789';  // glyphs the cells flicker through while settling

  let durationMs = 5 * 60 * 1000;
  let remainingMs = durationMs;
  let running = false;
  let state = 'set';             // 'set' | 'running' | 'paused' | 'done'
  let targetEnd = 0;

  let audioCtx = null;
  let alarmTimer = null;
  let marqueeTimer = null;

  /* ═══ panel ═══ */
  function buildPanel() {
    const panel = $('panel-timer');
    if (!panel) return;

    panel.innerHTML = `
      <div class="tm-wrap">
        <div class="tm-watch" id="tmWatch">
          <div class="tm-display">
            <svg class="tm-frame" viewBox="0 0 190 100" aria-hidden="true">
              <path class="tm-frame-track" pathLength="100" d="${FRAME_PATH}"/>
              <path class="tm-frame-prog" id="tmRing" pathLength="100" d="${FRAME_PATH}"/>
            </svg>
            <div class="tm-screen" id="tmScreen">
              <div class="tm-top">
                <span class="tm-badge">TIMER</span>
                <span class="tm-now" id="tmNow">00:00:00</span>
              </div>
              <div class="tm-mid">
                <span class="tm-ghost" id="tmGhost">88:88:88</span>
                <span class="tm-main"  id="tmMain">00:05:00</span>
                <div class="tm-marquee" id="tmMarquee"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="tm-panel">
          <div class="tm-setrow" id="tmSetRow">
            <div class="tm-setfields">
              <label>Hr<input  type="number" id="tmHr"  class="tm-num" min="0" max="23" value="0"></label>
              <span class="tm-colon">:</span>
              <label>Min<input type="number" id="tmMin" class="tm-num" min="0" max="59" value="5"></label>
              <span class="tm-colon">:</span>
              <label>Sec<input type="number" id="tmSec" class="tm-num" min="0" max="59" value="0"></label>
            </div>
            <div class="tm-presets">
              <button class="tm-chip" data-min="1">1 min</button>
              <button class="tm-chip" data-min="3">3 min</button>
              <button class="tm-chip" data-min="5">5 min</button>
              <button class="tm-chip" data-min="10">10 min</button>
            </div>
          </div>

          <div class="tm-buttons">
            <button class="tm-btn tm-primary" id="tmStart">Start</button>
            <button class="tm-btn" id="tmReset">Reset</button>
          </div>
        </div>
      </div>`;

    panel.querySelectorAll('.tm-chip').forEach(c =>
      c.addEventListener('click', () => {
        $('tmHr').value = 0; $('tmMin').value = c.dataset.min; $('tmSec').value = 0;
        readFields();
        reset();
        start();
      }));
    ['tmHr', 'tmMin', 'tmSec'].forEach(id => $(id).addEventListener('input', readFields));
    $('tmStart').addEventListener('click', onStartBtn);
    $('tmReset').addEventListener('click', reset);
  }

  /* ═══ duration fields ═══ */
  function readFields() {
    const h = clamp(parseInt($('tmHr').value) || 0, 0, 23);
    const m = clamp(parseInt($('tmMin').value) || 0, 0, 59);
    const s = clamp(parseInt($('tmSec').value) || 0, 0, 59);
    durationMs = (h * 3600 + m * 60 + s) * 1000;
    if (state === 'set') { remainingMs = durationMs; renderMain(); renderRing(1); }
  }

  /* ═══ controls ═══ */
  function onStartBtn() {
    if (state === 'done') { reset(); start(); return; }
    running ? pause() : start();
  }

  function start() {
    ensureAudio();
    if (remainingMs <= 0) remainingMs = durationMs;
    if (remainingMs <= 0) return;
    targetEnd = Date.now() + remainingMs;
    running = true;
    state = 'running';
    stopMarquee();
    $('tmScreen').classList.remove('tm-alarm');
    $('tmWatch').classList.remove('tm-done');
    applyChrome();
  }

  function pause() {
    remainingMs = Math.max(0, targetEnd - Date.now());
    running = false;
    state = 'paused';
    applyChrome();
  }

  function reset() {
    stopAlarm();
    stopMarquee();
    running = false;
    state = 'set';
    remainingMs = durationMs;
    $('tmWatch').classList.remove('tm-done', 'tm-danger');
    $('tmScreen').classList.remove('tm-alarm');
    renderMain();
    renderRing(1);
    applyChrome();
  }

  function finish() {
    running = false;
    state = 'done';
    remainingMs = 0;
    renderMain();
    renderRing(1);                 // ring reappears full…
    $('tmWatch').classList.add('tm-done', 'tm-danger');   // …and red
    $('tmScreen').classList.add('tm-alarm');
    applyChrome();
    ensureAudio();
    startAlarm();
    startMarquee();
  }

  function applyChrome() {
    const b = $('tmStart');
    b.textContent = running ? 'Pause' : (state === 'paused' ? 'Resume' : 'Start');
    b.classList.toggle('tm-running', running);
    $('tmSetRow').style.display = (state === 'set') ? '' : 'none';
  }

  /* ═══ rendering ═══ */
  function fmt(ms) {                    // always HH:MM:SS
    const t = Math.max(0, Math.ceil(ms / 1000));
    const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }
  const ghostFor = txt => txt.replace(/[0-9]/g, '8');

  function renderMain() {
    const txt = fmt(remainingMs);
    $('tmMain').textContent = txt;
    $('tmGhost').textContent = ghostFor(txt);
  }

  function renderRing(frac) {
    const r = $('tmRing');
    if (!r) return;
    frac = clamp(frac, 0, 1);
    /* visible portion = last `frac` of the path, ending at the top centre;
       the gap opens at the top and grows CLOCKWISE as time runs out */
    r.style.strokeDasharray = `${frac * 100} 100`;
    r.style.strokeDashoffset = `${-(1 - frac) * 100}`;
    if (state !== 'done') $('tmWatch').classList.toggle('tm-danger', frac > 0 && frac <= DANGER);
  }

  function renderNow() {
    const d = new Date();
    $('tmNow').textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  /* ═══ master loop (setInterval keeps running when the tab is unfocused) ═══ */
  function tick() {
    renderNow();
    if (running) {
      remainingMs = targetEnd - Date.now();
      if (remainingMs <= 0) finish();
      else { renderMain(); renderRing(remainingMs / durationMs); }
    }
  }

  /* ═══ "PENCILS DOWN" — the LCD cells stay put. Each page of the message is
     centred in the fixed cell row; on every page the cells flicker through
     glyphs and lock onto their letters left-to-right (split-flap), hold, then
     the next page reveals the same way. The row never shifts sideways. ═══ */
  const centre = s => {                // pad a chunk to CELLS, centred
    const gap = CELLS - s.length, l = Math.floor(gap / 2);
    return ' '.repeat(l) + s + ' '.repeat(gap - l);
  };
  const PAGES = MSG.split(' ').flatMap(w => {
    const out = [];
    for (let i = 0; i < w.length; i += CELLS) out.push(centre(w.slice(i, i + CELLS)));
    return out;
  });

  function startMarquee() {
    stopMarquee();
    const LOCK = 2;                    // frames between each cell locking
    const HOLD = 14;                   // frames a completed page stays put
    let page = 0, f = 0;
    const step = () => {
      const target = PAGES[page];
      const locked = Math.floor(f / LOCK);   // cells settled so far (left → right)
      let s = '';
      for (let i = 0; i < CELLS; i++) {
        const ch = target[i];
        s += (ch === ' ' || i < locked) ? ch : SCRAMBLE[(f + i) % SCRAMBLE.length];
      }
      $('tmMarquee').textContent = s;
      f++;
      if (locked >= CELLS && f >= CELLS * LOCK + HOLD) { page = (page + 1) % PAGES.length; f = 0; }
    };
    step();
    marqueeTimer = setInterval(step, 55);
  }
  function stopMarquee() {
    if (marqueeTimer) { clearInterval(marqueeTimer); marqueeTimer = null; }
    const m = $('tmMarquee');
    if (m) m.textContent = '';
  }

  /* ═══ audio (Web Audio API) ═══ */
  function ensureAudio() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) { try { audioCtx = new AC(); } catch (e) { /* ignore */ } }
    }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  }
  function toneAt(start, dur, freq) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.22, start + 0.006);
    gain.gain.setValueAtTime(0.22, start + dur - 0.01);
    gain.gain.linearRampToValueAtTime(0, start + dur);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  }
  function playBurst() {
    if (!audioCtx) return;
    const t0 = audioCtx.currentTime + 0.02;
    [0, 0.18, 0.36].forEach(dt => toneAt(t0 + dt, 0.12, 2700));
  }
  function startAlarm() {
    stopAlarm();
    let bursts = 0;
    const fire = () => { playBurst(); if (++bursts >= 20) stopAlarm(); };
    fire();
    alarmTimer = setInterval(fire, 1300);
  }
  function stopAlarm() {
    if (alarmTimer) { clearInterval(alarmTimer); alarmTimer = null; }
  }

  /* ═══ init ═══ */
  buildPanel();
  readFields();
  renderMain();
  renderRing(1);
  applyChrome();
  renderNow();
  setInterval(tick, 200);

})();
