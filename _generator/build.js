/* ════════════════════════════════════════════════════════════════
   THE TEACHER TOOLS — static page generator
   ----------------------------------------------------------------
   Run:  node _generator/build.js
   Produces one folder-per-tool (clean URLs), a sitemap.xml and
   a robots.txt — all PLAIN STATIC HTML.
   NOTE: the home page (index.html in the site root) is now a
   hand-maintained standalone page and is NOT regenerated here.
   You do NOT need this to deploy; only re-run it if you edit the
   shared shell (header / tab bar / settings / scripts) below.
   ════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://theteachertools.com/'; // trailing slash

/* ─── The tools, in tab order ─── */
const NAV = [
  { key: 'home',   panel: 'panel-home',   label: 'Home',             slug: '' },
  { key: 'tool-a', panel: 'panel-tool-a', label: 'Student Picker',   slug: 'student-picker' },
  { key: 'tool-b', panel: 'panel-tool-b', label: 'Seating Arranger', slug: 'seating-arranger' },
  { key: 'tool-c', panel: 'panel-tool-c', label: 'Behavior Chart',   slug: 'behavior-chart' },
  { key: 'tool-d', panel: 'panel-tool-d', label: 'Good Noodles',     slug: 'good-noodles' },
  { key: 'timer',  panel: 'panel-timer',  label: 'Timer',            slug: 'timer' },
];
const navByKey = Object.fromEntries(NAV.map(n => [n.key, n]));

/* ─── Per-page SEO + content config ─── */
const PAGES = {
  home: {
    nav: 'home',
    title: 'The Teacher Tools — Free Online Classroom Tools for Teachers',
    description: 'Free classroom tools for teachers: a random student picker wheel, seating chart maker, behavior chart, Good Noodles reward chart and a classroom timer. No sign-up required.',
    extraScripts: [],
  },
  'student-picker': {
    nav: 'tool-a',
    title: 'Random Student Picker Wheel — The Teacher Tools',
    description: 'A random name picker wheel that calls on students fairly. Paste your class list, spin, and remove names already chosen.',
    extraScripts: [],
    seo: {
      h1: 'Random Student Picker Wheel',
      body: `
        <p>The <strong>Random Student Picker</strong> is a spinning name wheel that helps you call on
        students fairly instead of always hearing from the same few hands.</p>
        <h2>How to use it</h2>
        <ol>
          <li>Paste your class list into the box, one name per line.</li>
          <li>Click the wheel to spin.</li>
          <li>Remove the chosen name so nobody gets picked twice.</li>
        </ol>
        <p>It works on interactive whiteboards, tablets and phones, with nothing to install.</p>`,
    },
  },
  'seating-arranger': {
    nav: 'tool-b',
    title: 'Classroom Seating Chart Maker — The Teacher Tools',
    description: 'Design a classroom seating chart by dragging desks into place, then assign or shuffle students into seats.',
    extraScripts: ['js/seating.js'],
    seo: {
      h1: 'Classroom Seating Chart Maker',
      body: `
        <p>The <strong>Seating Arranger</strong> lets you map your classroom and place students at desks
        in a few minutes. Arrange furniture to match your real room, then assign or shuffle seats.</p>
        <h2>What you can do</h2>
        <ul>
          <li>Drag desks and tables into any layout.</li>
          <li>Auto-assign students or shuffle them at random.</li>
          <li>Save a layout and reuse it for each class.</li>
        </ul>
        <p>Rearranging for group work or a fresh start takes only a few clicks.</p>`,
    },
  },
  'behavior-chart': {
    nav: 'tool-c',
    title: 'Classroom Behavior Chart — The Teacher Tools',
    description: 'A clip-up, clip-down behavior chart for tracking student conduct through the school day.',
    extraScripts: ['js/behavior.js'],
    seo: {
      h1: 'Classroom Behavior Chart',
      body: `
        <p>The <strong>Behavior Chart</strong> is a digital clip chart for tracking conduct through the
        day. Move students up for positive choices or down when a reminder is needed, with every level
        visible on the board.</p>
        <h2>How it works</h2>
        <ul>
          <li>Add your students to the starting level.</li>
          <li>Tap to move a student up or down as behavior changes.</li>
          <li>Use the colored levels for instant, visual feedback.</li>
        </ul>
        <p>A clear, shared system helps students notice and manage their own behavior.</p>`,
    },
  },
  'good-noodles': {
    nav: 'tool-d',
    title: 'Good Noodles Reward Chart — The Teacher Tools',
    description: 'A playful Good Noodles reward board for recognizing students who make positive choices.',
    extraScripts: ['js/goodnoodles.js'],
    seo: {
      h1: 'Good Noodles Reward Chart',
      body: `
        <p>The <strong>Good Noodles</strong> board is a reward chart that celebrates students who make
        great choices. Hand out a noodle for kindness, effort or focus to motivate the whole class.</p>
        <h2>How to use it</h2>
        <ul>
          <li>Add each student to the board.</li>
          <li>Award a good noodle when you catch them doing the right thing.</li>
          <li>Watch positive behavior spread as others join in.</li>
        </ul>
        <p>It turns positive reinforcement into something students can see and aim for.</p>`,
    },
  },
  timer: {
    nav: 'timer',
    title: 'Classroom Timer — Online Countdown Timer for Teachers',
    description: 'A large, easy-to-read classroom countdown timer for lessons, tests, transitions and brain breaks.',
    extraScripts: ['js/timer.js'],
    seo: {
      h1: 'Classroom Timer',
      body: `
        <p>The <strong>Classroom Timer</strong> is a big, high-contrast countdown the whole class can
        read from across the room. Set the time, press start, and watch the seconds tick down.</p>
        <h2>Good for</h2>
        <ul>
          <li>Timed tests and writing prompts.</li>
          <li>Transitions between activities.</li>
          <li>Brain breaks, clean-up and group rotations.</li>
        </ul>
        <p>A gentle alarm signals time is up without disrupting the room.</p>`,
    },
  },
};

/* ════════════════════ shared shell pieces ════════════════════ */

function head(page, base) {
  const canonical = SITE + (navByKey[page.nav].slug ? navByKey[page.nav].slug + '/' : '');
  return `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.title}</title>
  <meta name="description" content="${page.description}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${page.title}">
  <meta property="og:description" content="${page.description}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${SITE}Logo.png">
  <meta name="twitter:card" content="summary">
  <link rel="icon" href="${base}Logo.png">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6623585309429140"
    crossorigin="anonymous"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link
    href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Fredoka:wght@600;700&family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap"
    rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/dseg@0.46.0/css/dseg.css">
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Fraunces:opsz,wght@9..144,400;9..144,700;9..144,900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${base}css/style.css">
  <link rel="stylesheet" href="${base}css/theme.css">
  <link id="gfont-Poppins" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&amp;display=swap">
  <link id="gfont-Architects-Daughter" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Architects+Daughter:wght@300;400;500;600;700&amp;display=swap">
  <link id="gfont-Permanent-Marker" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Permanent+Marker:wght@300;400;500;600;700&amp;display=swap">
  <link id="gfont-Montserrat" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&amp;display=swap">
  <link id="gfont-Playfair-Display" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@300;400;500;600;700&amp;display=swap">
  <link id="gfont-Inter" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;display=swap">
  <link id="gfont-Oswald" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&amp;display=swap">
  <link id="gfont-Comfortaa" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@300;400;500;600;700&amp;display=swap">
  <link id="gfont-Merriweather" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;500;600;700&amp;display=swap">
</head>`;
}

function header(base, homeHref) {
  return `  <!-- ═══════════════════════════ HEADER ═══════════════════════════ -->
  <header class="header" style="font-family: &quot;Verdana&quot;">

    <!-- Left: Brand -->
    <div class="header-col header-left">
      <a class="brand-link" href="${homeHref}" aria-label="The Teacher Tools home">
        <img src="${base}Logo.png" alt="The Teacher Tools logo" class="brand-logo" />
        <span class="brand-text">The Teacher Tools</span>
      </a>
    </div>

    <!-- Center: Search -->
    <div class="header-col header-center">
      <div class="search-bar" id="searchBar">
        <div class="search-icon-wrap">
          <svg class="search-icon" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="9.5" cy="9.5" r="6.5" stroke="#999999" stroke-width="2.2" />
            <path d="M14.5 14.5L19.5 19.5" stroke="#999999" stroke-width="2.2" stroke-linecap="round" />
          </svg>
        </div>
        <input type="text" class="search-input" id="searchInput" placeholder="Search" autocomplete="off"
          spellcheck="false">
        <div class="search-dropdown" id="searchDropdown" aria-live="polite"></div>
      </div>
    </div>

    <!-- Right: Support + Language + Settings + Avatar -->
    <div class="header-col header-right">
      <a class="kofi-btn" href="https://ko-fi.com/kago1" target="_blank" rel="noopener" title="Support Education">
        <img src="https://storage.ko-fi.com/cdn/cup-border.png" alt="" class="kofi-cup" />
        <span>Support Education</span>
      </a>

      <div class="lang-wrap" id="langWrap">
        <button class="hdr-btn" id="langBtn" title="Language" aria-label="Language" aria-haspopup="true" aria-expanded="false">
          <svg class="globe-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="9" stroke="#BBBBBB" stroke-width="2" />
            <path d="M3 12h18M12 3c2.5 2.5 2.5 15.5 0 18M12 3c-2.5 2.5-2.5 15.5 0 18M4.5 7.5c4.5 2.5 10.5 2.5 15 0M4.5 16.5c4.5-2.5 10.5-2.5 15 0" stroke="#BBBBBB" stroke-width="1.6" stroke-linecap="round" />
          </svg>
        </button>
        <div class="lang-menu" id="langMenu" role="menu" aria-label="Language">
          <button class="lang-item" data-lang="en" role="menuitemradio">English</button>
          <button class="lang-item" data-lang="es" role="menuitemradio">Spanish</button>
          <button class="lang-item" data-lang="tr" role="menuitemradio">Turkish</button>
        </div>
      </div>

      <button class="hdr-btn" id="settingsBtn" title="Settings" aria-label="Settings">
        <svg class="gear-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="3" stroke="#BBBBBB" stroke-width="2" />
          <path
            d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
            stroke="#BBBBBB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>

      <button class="hdr-btn avatar-btn" id="avatarBtn" title="My Account" aria-label="Account">
        <svg class="avatar-icon" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="20" fill="#4E4E4E" />
          <circle cx="20" cy="15.5" r="7.5" fill="#D2D2D2" />
          <path d="M2 40 Q2 26.5 20 26.5 Q38 26.5 38 40Z" fill="#D2D2D2" />
        </svg>
      </button>
    </div>

  </header>`;
}

const TAB_SHAPE = `<svg class="tab-shape" viewBox="0 0 820 160" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <path class="tab-fill" d="M 0 160 L 0 130 L 40 130 L 85 26 Q 97 0, 135 0 L 685 0 Q 723 0, 735 26 L 780 130 L 820 130 L 820 160 Z"/>
        </svg>`;

function tabbar(activeKey, base) {
  const tabs = NAV.map(n => {
    const href = n.key === 'home' ? (base || './') : base + n.slug + '/';
    const active = n.key === activeKey;
    return `      <a class="tab${active ? ' active' : ''}" data-panel="${n.key}" href="${href}" role="tab" aria-selected="${active}">
        ${TAB_SHAPE}
        <span class="tape"></span>
        <span class="tab-label">${n.label}</span>
      </a>`;
  }).join('\n\n');
  return `  <!-- ═══════════════════════════ TAB BAR ═══════════════════════════ -->
  <div class="tabbar-wrap">
    <div class="tabbar" id="tabBar" role="tablist" aria-label="Tools">

${tabs}

    </div>
  </div>`;
}

const HOME_PANEL = `    <div class="panel active" id="panel-home" role="tabpanel">
      <div class="welcome" style="font-family: &quot;Montserrat&quot;; font-size: 6px; font-weight: 500">
        <div class="welcome-inner">
          <div class="welcome-text">
            <h1 class="welcome-title" style="margin: 0px; width: 780px">Welcome to The Teacher Tools</h1>
            <p class="welcome-sub" style="font-weight: 100; font-size: 20px">Search for Tools or select one in the Tabs above.</p>
          </div>
          <div class="welcome-search-section" id="welcomeSearchSection">
            <div class="search-bar" id="welcomeSearchBarEl">
              <div class="search-icon-wrap">
                <svg class="search-icon" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="9.5" cy="9.5" r="6.5" stroke="#999999" stroke-width="2.2" />
                  <path d="M14.5 14.5L19.5 19.5" stroke="#999999" stroke-width="2.2" stroke-linecap="round" />
                </svg>
              </div>
              <input type="text" class="search-input" id="welcomeSearchInput" placeholder="" autocomplete="off"
                spellcheck="false" style="margin: 0px">
              <div class="search-dropdown" id="welcomeSearchDropdown" aria-live="polite"></div>
            </div>
          </div>

          <!-- Main Ad -->
          <div class="home-ad">
            <ins class="adsbygoogle"
                 style="display:block"
                 data-ad-client="ca-pub-6623585309429140"
                 data-ad-slot="2577114334"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
            <script>
              (adsbygoogle = window.adsbygoogle || []).push({});
            </script>
          </div>
        </div>
      </div>
    </div>`;

const PICKER_PANEL = `    <div class="panel active" id="panel-tool-a" role="tabpanel">
      <div class="picker-wrap">

        <!-- ── Left: Wheel ── -->
        <div class="picker-wheel-col">
          <canvas id="spinCanvas" style="border-radius: 0px"></canvas>
        </div>

        <!-- ── Right: Controls ── -->
        <div class="picker-right-col">
          <button class="remove-btn" id="removeBtn">Remove Selection</button>

          <!-- Names input + result overlay share the same box -->
          <div class="names-box-wrap">
            <div class="result-overlay hidden" id="resultOverlay">
              <span class="result-name" id="resultName"></span>
              <button class="result-dismiss" id="resultDismiss">Tap to dismiss</button>
            </div>
            <textarea id="namesInput" placeholder="Put names/groups here, (One per line)..."
              spellcheck="false"></textarea>
          </div>

          <!-- Selected list -->
          <div class="selected-wrap" id="selectedWrap">
            <ol class="selected-list" id="selectedList"></ol>
          </div>
        </div>

      </div>
    </div>`;

function jsPanel(panelId) {
  return `    <div class="panel active" id="${panelId}" role="tabpanel"></div>`;
}

function mainContent(pageKey) {
  let panel;
  if (pageKey === 'home') panel = HOME_PANEL;
  else if (pageKey === 'student-picker') panel = PICKER_PANEL;
  else panel = jsPanel(navByKey[PAGES[pageKey].nav].panel);
  return `  <!-- ═══════════════════════════ MAIN CONTENT ═══════════════════════════ -->
  <main class="content" id="mainContent">

${panel}

    <div class="panel" id="panel-profile" role="tabpanel"></div>

  </main>`;
}

function seoSection(page) {
  if (!page.seo) {
    // Home: a crawlable, linked overview of every tool.
    const cards = NAV.filter(n => n.key !== 'home').map(n => {
      const p = Object.values(PAGES).find(pp => pp.nav === n.key);
      return `      <a class="seo-card" href="${n.slug}/">
        <h2>${n.label}</h2>
        <p>${p.description}</p>
      </a>`;
    }).join('\n');
    return `  <section class="tool-seo">
    <h1>Free Classroom Tools for Teachers</h1>
    <p>The Teacher Tools is a free collection of simple, projector-friendly classroom apps — no sign-up,
    no download. Pick a tool to get started:</p>
    <div class="seo-cards">
${cards}
    </div>
  </section>`;
  }
  return `  <section class="tool-seo">
    <h1>${page.seo.h1}</h1>
${page.seo.body.trim().split('\n').map(l => '    ' + l.trim()).join('\n')}
    <p><a href="../">← Back to all Teacher Tools</a></p>
  </section>`;
}

const SETTINGS = `  <!-- ═══════════════════════════ SETTINGS PANEL ═══════════════════════════ -->
  <div class="sp-overlay" id="spOverlay"></div>
  <aside class="sp-panel" id="spPanel" role="dialog" aria-label="Settings">
    <div class="sp-head">
      <span class="sp-title">Settings</span>
      <button class="sp-close" id="spClose" aria-label="Close settings">&#x2715;</button>
    </div>
    <div class="sp-body">
      <div class="sp-section">
        <div class="sp-section-label">Appearance</div>
        <div class="sp-row">
          <div class="sp-row-text">
            <span class="sp-row-label">Dark Mode</span>
            <span class="sp-row-sub">Deep navy dark theme</span>
          </div>
          <button class="sp-toggle" id="darkToggle" role="switch" aria-checked="false" aria-label="Toggle dark mode">
            <span class="sp-thumb"></span>
          </button>
        </div>
        <div class="sp-row">
          <div class="sp-row-text">
            <span class="sp-row-label">Large Text</span>
            <span class="sp-row-sub">Bigger labels for projectors</span>
          </div>
          <button class="sp-toggle" id="largeTextToggle" role="switch" aria-checked="false" aria-label="Toggle large text">
            <span class="sp-thumb"></span>
          </button>
        </div>
      </div>
    </div>
  </aside>`;

function scripts(page, base) {
  const list = ['js/profile.js', 'js/main.js', ...(page.extraScripts || []), 'js/lang.js'];
  return list.map(s => `  <script src="${base}${s}"></script>`).join('\n');
}

const OVERRIDES = `<style id="__om-edit-overrides">
#panel-profile .pf-card :is(h1,h2,h3,h4,h5,h6) { font-family: "Playfair Display" !important }
#panel-profile .pf-card >:is(h1,h2,h3,h4,h5,h6,p,li,dt,dd,blockquote,figcaption,label,span,a,em,strong,small,td,th,caption) { font-family: "Playfair Display" !important }
#mainContent >[role="tabpanel"] .pf-card { background-color: rgb(253, 255, 249) !important }
#seatingModal { font-family: "Inter" !important }
#bcHFace-green [cx="46"] { fill: rgb(44, 202, 50) !important }
#bcHFace-red [cx="46"] { fill: rgb(200, 74, 71) !important }
#bcHFace-yellow [cx="46"] { stroke: none !important }
#panel-tool-d :is(h1,h2,h3,h4,h5,h6) { font-family: "Merriweather" !important }
</style>`;

function renderPage(pageKey) {
  const page = PAGES[pageKey];
  const base = pageKey === 'home' ? '' : '../';
  const homeHref = pageKey === 'home' ? './' : '../';
  return [
    head(page, base),
    '',
    '<body>',
    '',
    '  <template id="__bundler_thumbnail">',
    '    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">',
    '      <rect width="100" height="100" rx="20" fill="#DFD5C0"/>',
    '      <rect x="30" y="34" width="20" height="34" rx="3" fill="#E8956D"/>',
    '      <rect x="50" y="30" width="20" height="38" rx="3" fill="#4A7EC8"/>',
    '      <rect x="38" y="26" width="14" height="6" rx="2" fill="#C9A97C"/>',
    '    </svg>',
    '  </template>',
    '',
    header(base, homeHref),
    '',
    tabbar(page.nav, base),
    '',
    mainContent(pageKey),
    '',
    seoSection(page),
    '',
    SETTINGS,
    '',
    scripts(page, base),
    '</body>',
    '',
    '</html>',
    OVERRIDES,
    '',
  ].join('\n');
}

/* ─── write everything ─── */
function writeFile(rel, content) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('wrote', rel);
}

for (const pageKey of Object.keys(PAGES)) {
  if (pageKey === 'home') continue; // home page is hand-maintained — do not overwrite index.html
  const slug = navByKey[PAGES[pageKey].nav].slug;
  const rel = path.join(slug, 'index.html');
  writeFile(rel, renderPage(pageKey));
}

/* sitemap.xml */
const urls = NAV.map(n => SITE + (n.slug ? n.slug + '/' : ''));
writeFile('sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map(u => `  <url><loc>${u}</loc><changefreq>monthly</changefreq></url>`).join('\n') +
  `\n</urlset>\n`);

/* robots.txt */
writeFile('robots.txt',
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE}sitemap.xml\n`);

console.log('\nDone. Re-run with:  node _generator/build.js');
