# Generates the per-tool static pages for The Teacher Tools.
# Run:  powershell -ExecutionPolicy Bypass -File _generator\generate.ps1
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$site = 'https://theteachertools.com/'

$nav = @(
  @{ key='home';   slug='';                 label='Home' }
  @{ key='tool-a'; slug='student-picker';   label='Student Picker' }
  @{ key='tool-b'; slug='seating-arranger'; label='Seating Arranger' }
  @{ key='tool-c'; slug='behavior-chart';   label='Behavior Chart' }
  @{ key='tool-d'; slug='good-noodles';     label='Good Noodles' }
  @{ key='timer';  slug='timer';            label='Timer' }
)

$tabShape = @'
<svg class="tab-shape" viewBox="0 0 820 160" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <path class="tab-fill" d="M 0 160 L 0 130 L 40 130 L 85 26 Q 97 0, 135 0 L 685 0 Q 723 0, 735 26 L 780 130 L 820 130 L 820 160 Z"/>
        </svg>
'@

function Get-Tabbar($active) {
  $rows = foreach ($n in $nav) {
    $href = if ($n.key -eq 'home') { '../' } else { '../' + $n.slug + '/' }
    $cls = if ($n.key -eq $active) { 'tab active' } else { 'tab' }
    $sel = if ($n.key -eq $active) { 'true' } else { 'false' }
@"
      <a class="$cls" data-panel="$($n.key)" href="$href" role="tab" aria-selected="$sel">
        $tabShape
        <span class="tape"></span>
        <span class="tab-label">$($n.label)</span>
      </a>
"@
  }
  return ($rows -join "`n`n")
}

$headerBlock = @'
  <!-- =========================== HEADER =========================== -->
  <header class="header" style="font-family: &quot;Verdana&quot;">

    <!-- Left: Brand -->
    <div class="header-col header-left">
      <a class="brand-link" href="../" aria-label="The Teacher Tools home">
        <img src="../Logo.png" alt="The Teacher Tools logo" class="brand-logo" />
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

  </header>
'@

$pickerPanel = @'
    <div class="panel active" id="panel-tool-a" role="tabpanel">
      <div class="picker-wrap">

        <!-- Left: Wheel -->
        <div class="picker-wheel-col">
          <canvas id="spinCanvas" style="border-radius: 0px"></canvas>
        </div>

        <!-- Right: Controls -->
        <div class="picker-right-col">
          <button class="remove-btn" id="removeBtn">Remove Selection</button>

          <div class="names-box-wrap">
            <div class="result-overlay hidden" id="resultOverlay">
              <span class="result-name" id="resultName"></span>
              <button class="result-dismiss" id="resultDismiss">Tap to dismiss</button>
            </div>
            <textarea id="namesInput" placeholder="Put names/groups here, (One per line)..."
              spellcheck="false"></textarea>
          </div>

          <div class="selected-wrap" id="selectedWrap">
            <ol class="selected-list" id="selectedList"></ol>
          </div>
        </div>

      </div>
    </div>
'@

$settingsBlock = @'
  <!-- =========================== SETTINGS PANEL =========================== -->
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
  </aside>
'@

$overrides = @'
<style id="__om-edit-overrides">
#panel-profile .pf-card :is(h1,h2,h3,h4,h5,h6) { font-family: "Playfair Display" !important }
#panel-profile .pf-card >:is(h1,h2,h3,h4,h5,h6,p,li,dt,dd,blockquote,figcaption,label,span,a,em,strong,small,td,th,caption) { font-family: "Playfair Display" !important }
#mainContent >[role="tabpanel"] .pf-card { background-color: rgb(253, 255, 249) !important }
#seatingModal { font-family: "Inter" !important }
#bcHFace-green [cx="46"] { fill: rgb(44, 202, 50) !important }
#bcHFace-red [cx="46"] { fill: rgb(200, 74, 71) !important }
#bcHFace-yellow [cx="46"] { stroke: none !important }
#panel-tool-d :is(h1,h2,h3,h4,h5,h6) { font-family: "Merriweather" !important }
</style>
'@

$headTemplate = @'
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{TITLE}</title>
  <meta name="description" content="{DESC}">
  <link rel="canonical" href="{CANON}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="{TITLE}">
  <meta property="og:description" content="{DESC}">
  <meta property="og:url" content="{CANON}">
  <meta property="og:image" content="{SITE}Logo.png">
  <meta name="twitter:card" content="summary">
  <link rel="icon" href="../Logo.png">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6623585309429140"
    crossorigin="anonymous"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link
    href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Fredoka:wght@600;700&family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap"
    rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/dseg@0.46.0/css/dseg.css">
  <link rel="stylesheet" href="../css/style.css">
  <link id="gfont-Poppins" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&amp;display=swap">
  <link id="gfont-Architects-Daughter" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Architects+Daughter:wght@300;400;500;600;700&amp;display=swap">
  <link id="gfont-Permanent-Marker" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Permanent+Marker:wght@300;400;500;600;700&amp;display=swap">
  <link id="gfont-Montserrat" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&amp;display=swap">
  <link id="gfont-Playfair-Display" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@300;400;500;600;700&amp;display=swap">
  <link id="gfont-Inter" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;display=swap">
  <link id="gfont-Oswald" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&amp;display=swap">
  <link id="gfont-Comfortaa" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@300;400;500;600;700&amp;display=swap">
  <link id="gfont-Merriweather" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;500;600;700&amp;display=swap">
</head>
'@

# Per-tool page definitions
$tools = @(
  @{ key='tool-a'; slug='student-picker';   title='Random Student Picker Wheel &mdash; The Teacher Tools';
     desc='Spin a free random name picker wheel to fairly choose students in class. Paste your roster, spin, and remove names already picked. No sign-up, works on any device.';
     script=''; panel=$pickerPanel; h1='Random Student Picker Wheel';
     body=@'
        <p>The <strong>Random Student Picker</strong> is a free spinning name wheel that helps teachers call on students fairly and keep the classroom engaged. Paste your class roster &mdash; one name or group per line &mdash; give the wheel a spin, and let it choose at random.</p>
        <h2>How to use the student picker</h2>
        <ol>
          <li>Type or paste your students'' names into the box (one per line).</li>
          <li>Click the wheel to spin it.</li>
          <li>The selected student is shown &mdash; remove them so they aren''t picked twice.</li>
        </ol>
        <h2>Why teachers love it</h2>
        <p>No more "pick me!" &mdash; the wheel makes selection feel fair and fun. It works on interactive whiteboards, projectors, tablets and phones, and needs no account or download.</p>
'@ }
  @{ key='tool-b'; slug='seating-arranger'; title='Classroom Seating Chart Maker &mdash; The Teacher Tools';
     desc='Build and rearrange classroom seating charts in seconds. Drag desks, auto-assign students, and randomize seating. Free seating chart maker for teachers, no sign-up.';
     script='../js/seating.js'; panel='    <div class="panel active" id="panel-tool-b" role="tabpanel"></div>'; h1='Classroom Seating Chart Maker';
     body=@'
        <p>The <strong>Seating Arranger</strong> lets you design a classroom layout and place students at desks in minutes. Arrange desks to match your real room, then assign or randomize seats.</p>
        <h2>Features</h2>
        <ul>
          <li>Drag-and-drop desks and furniture to match your classroom.</li>
          <li>Auto-assign or randomly shuffle students into seats.</li>
          <li>Save your layout and reuse it for different classes.</li>
        </ul>
        <h2>Great for new seating plans</h2>
        <p>Refresh your seating chart whenever behavior or group work calls for a change &mdash; it only takes a few clicks, and it''s completely free.</p>
'@ }
  @{ key='tool-c'; slug='behavior-chart';   title='Classroom Behavior Chart &mdash; The Teacher Tools';
     desc='A free clip-up / clip-down classroom behavior chart to track student conduct in real time. Move students between levels and reinforce positive behavior. No sign-up.';
     script='../js/behavior.js'; panel='    <div class="panel active" id="panel-tool-c" role="tabpanel"></div>'; h1='Classroom Behavior Chart';
     body=@'
        <p>The <strong>Behavior Chart</strong> helps you track and reinforce conduct throughout the day. Move students up for positive choices or down when reminders are needed &mdash; all visible to the class on your projector.</p>
        <h2>How it works</h2>
        <ul>
          <li>Add your students and place them on the starting level.</li>
          <li>Tap to move a student up or down as behavior changes.</li>
          <li>Use the color levels to give instant, visual feedback.</li>
        </ul>
        <h2>Encourage positive behavior</h2>
        <p>A clear, visual behavior system helps students self-regulate and makes expectations obvious. Free to use, with nothing to install.</p>
'@ }
  @{ key='tool-d'; slug='good-noodles';     title='Good Noodles Reward Chart &mdash; The Teacher Tools';
     desc='A free Good Noodles reward board to celebrate students who make great choices. Add noodles for positive behavior and motivate your whole class. No sign-up required.';
     script='../js/goodnoodles.js'; panel='    <div class="panel active" id="panel-tool-d" role="tabpanel"></div>'; h1='Good Noodles Reward Chart';
     body=@'
        <p>The <strong>Good Noodles</strong> board is a cheerful reward chart that celebrates students who make great choices. Award a noodle for kindness, effort and good behavior to motivate the whole class.</p>
        <h2>Using the Good Noodles board</h2>
        <ul>
          <li>Add each student to the board.</li>
          <li>Give a "good noodle" when you catch them doing the right thing.</li>
          <li>Watch positive behavior spread as students aim for recognition.</li>
        </ul>
        <h2>Positive reinforcement made fun</h2>
        <p>Visual, playful and instantly rewarding &mdash; a simple way to build a positive classroom culture, completely free.</p>
'@ }
  @{ key='timer';  slug='timer';            title='Classroom Timer &mdash; Free Online Countdown Timer for Teachers';
     desc='A free, large classroom countdown timer for lessons, tests, transitions and brain breaks. Easy to read across the room with a clear alarm. No sign-up required.';
     script='../js/timer.js'; panel='    <div class="panel active" id="panel-timer" role="tabpanel"></div>'; h1='Classroom Timer';
     body=@'
        <p>The <strong>Classroom Timer</strong> is a big, easy-to-read countdown timer for lessons, tests, transitions and brain breaks. Set the time, hit start, and the whole class can see the seconds tick down from across the room.</p>
        <h2>Perfect for</h2>
        <ul>
          <li>Timed tests and writing prompts.</li>
          <li>Smooth transitions between activities.</li>
          <li>Brain breaks, clean-up time and group rotations.</li>
        </ul>
        <h2>Clear and distraction-free</h2>
        <p>A large display and a gentle alarm keep your class on track without fuss. Free, online, and works on any projector or device.</p>
'@ }
)

foreach ($t in $tools) {
  $canon = $site + $t.slug + '/'
  $head = $headTemplate.Replace('{TITLE}', $t.title).Replace('{DESC}', $t.desc).Replace('{CANON}', $canon).Replace('{SITE}', $site)
  $tabbar = Get-Tabbar $t.key

  $scriptTags = "  <script src=""../js/profile.js""></script>`n  <script src=""../js/main.js""></script>`n"
  if ($t.script -ne '') { $scriptTags += "  <script src=""$($t.script)""></script>`n" }
  $scriptTags += "  <script src=""../js/lang.js""></script>"

  $page = @"
$head

<body>

  <template id="__bundler_thumbnail">
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="20" fill="#DFD5C0"/>
      <rect x="30" y="34" width="20" height="34" rx="3" fill="#E8956D"/>
      <rect x="50" y="30" width="20" height="38" rx="3" fill="#4A7EC8"/>
      <rect x="38" y="26" width="14" height="6" rx="2" fill="#C9A97C"/>
    </svg>
  </template>

$headerBlock

  <!-- =========================== TAB BAR =========================== -->
  <div class="tabbar-wrap">
    <div class="tabbar" id="tabBar" role="tablist" aria-label="Tools">

$tabbar

    </div>
  </div>

  <!-- =========================== MAIN CONTENT =========================== -->
  <main class="content" id="mainContent">

$($t.panel)

    <div class="panel" id="panel-profile" role="tabpanel"></div>

  </main>

  <section class="tool-seo">
    <h1>$($t.h1)</h1>
$($t.body)
    <p><a href="../">&larr; Back to all Teacher Tools</a></p>
  </section>

$settingsBlock

$scriptTags
</body>

</html>
$overrides
"@

  $dir = Join-Path $root $t.slug
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  $out = Join-Path $dir 'index.html'
  $page | Out-File -FilePath $out -Encoding utf8
  Write-Host "wrote $($t.slug)/index.html"
}

# sitemap.xml
$urls = foreach ($n in $nav) { $site + $n.slug + $(if ($n.slug) { '/' } else { '' }) }
$sitemap = "<?xml version=""1.0"" encoding=""UTF-8""?>`n<urlset xmlns=""http://www.sitemaps.org/schemas/sitemap/0.9"">`n"
foreach ($u in $urls) { $sitemap += "  <url><loc>$u</loc><changefreq>monthly</changefreq></url>`n" }
$sitemap += "</urlset>`n"
# Write without BOM (strict robots/sitemap parsers dislike a leading BOM).
$noBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText((Join-Path $root 'sitemap.xml'), $sitemap, $noBom)
Write-Host "wrote sitemap.xml"

# robots.txt
[System.IO.File]::WriteAllText((Join-Path $root 'robots.txt'), "User-agent: *`nAllow: /`n`nSitemap: ${site}sitemap.xml`n", $noBom)
Write-Host "wrote robots.txt"
Write-Host "Done."
