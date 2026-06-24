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
        <p>The <strong>Random Student Picker</strong> is a free spinning name wheel that helps you call
        on students fairly, instead of always hearing from the same eager few. Type or paste your class
        list, give the wheel a spin, and let chance decide who answers next. Because every name has an
        equal shot, the wheel takes the pressure off you and keeps the whole class paying attention —
        anyone could be next.</p>
        <p>Teachers reach for a random name picker to cold-call during discussions, choose a line leader,
        hand out classroom jobs, build surprise groups, or simply add a moment of fun and suspense to a
        quiet lesson. It runs in any web browser on an interactive whiteboard, laptop, tablet or phone,
        with no app to install and no account to create.</p>

        <h2>How to use the student picker wheel</h2>
        <ol>
          <li>Type or paste your students' names into the box, one name per line.</li>
          <li>Click or tap the wheel to spin it — it slows down naturally and lands on one name.</li>
          <li>Read out the chosen name, which appears in large text so the back row can see it too.</li>
          <li>Tap "Remove Selection" to take that student off the wheel so nobody is picked twice in a row.</li>
        </ol>

        <h2>Ways to use it in your classroom</h2>
        <ul>
          <li><strong>Cold-calling:</strong> pick a student to answer so participation does not depend on raised hands.</li>
          <li><strong>Random groups:</strong> spin repeatedly to sort students into fair pairs or teams.</li>
          <li><strong>Classroom jobs:</strong> choose who leads the line, hands out books or waters the plants.</li>
          <li><strong>Order of turns:</strong> decide who presents first, reads next or picks the class read-aloud.</li>
          <li><strong>Games and review:</strong> add suspense to quizzes, vocabulary races and brain breaks.</li>
        </ul>

        <h2>Why a random picker helps</h2>
        <p>Calling on students at random spreads participation more evenly and gently nudges quieter
        students into the conversation. Because the choice is clearly out of your hands, it also feels
        fairer to students — there are no accusations of favouritism, and the suspense of the spin keeps
        everyone engaged and ready to respond. Used regularly, a name wheel helps build a classroom
        culture where every voice is expected and valued.</p>

        <h2>Tips for fair picking</h2>
        <ul>
          <li>Keep every name on the wheel for a true random chance, or remove names as you go so each student is picked once before anyone repeats.</li>
          <li>Pair the picker with a few seconds of "think time" so students rehearse an answer before a name is called.</li>
          <li>Offer a "phone a friend" or pass option to keep cold-calling supportive and low-stress.</li>
          <li>Save your class list so you can reopen the wheel each day without retyping names.</li>
        </ul>

        <h2>Common mistakes to avoid</h2>
        <ul>
          <li><strong>Naming before thinking.</strong> If you spin and read the name before posing the question, the rest of the class switches off. Ask the question, give think time, then spin.</li>
          <li><strong>Never removing names.</strong> Left on its own, randomness will pick some students twice before others get a turn. Use Remove Selection to cycle fairly through everyone.</li>
          <li><strong>Turning it into a "gotcha".</strong> Spinning to catch a daydreaming student makes the wheel feel like a punishment. Keep it warm and predictable.</li>
          <li><strong>No safety net.</strong> Allow a pass or a "phone a friend" so being chosen never feels like a trap.</li>
        </ul>

        <h2>Variations to try</h2>
        <ul>
          <li><strong>Group maker:</strong> spin repeatedly, removing each name, to build random pairs or teams.</li>
          <li><strong>Job assigner:</strong> paste classroom jobs or roles instead of names and spin to hand them out.</li>
          <li><strong>Turn order:</strong> spin to decide who presents, reads or answers first.</li>
          <li><strong>Table picker:</strong> put group names (Table 1, Red Team) on the wheel to choose a whole table at once.</li>
          <li><strong>Double spin:</strong> spin once for a student and once for a question number to add an extra layer of suspense to review games.</li>
        </ul>

        <h2>Frequently asked questions</h2>
        <h3>Is the student picker really random?</h3>
        <p>Yes. Each spin selects a name independently, so every student on the wheel has the same chance
        of being chosen on any given spin. If you would rather guarantee everyone is picked once before
        anyone repeats, use the Remove Selection button after each spin.</p>
        <h3>How many names can I add?</h3>
        <p>You can add a whole class and more — the wheel resizes its segments automatically as you add or
        remove names. For very long lists the labels become smaller, but the spin and selection work the
        same way.</p>
        <h3>Do I need an account or have to pay?</h3>
        <p>No. The Teacher Tools student picker is completely free, with no sign-up, no download and no ads
        interrupting the wheel. Just open the page and start spinning.</p>
        <h3>Will it remember my class list?</h3>
        <p>Your list stays in the box while the page is open, and you can save classes on your device to
        load them again later. Nothing is sent to a server, so your students' names stay private to you.</p>
        <h3>Can I use it on a smartboard or tablet?</h3>
        <p>Absolutely. The wheel is touch-friendly and scales to fit interactive whiteboards, projectors,
        tablets and phones, so you can spin it however your classroom is set up.</p>`,
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
        <p>The <strong>Seating Chart Maker</strong> is a free drag-and-drop tool for mapping your
        classroom and placing students at their desks. Arrange desks, tables and other furniture to match
        your real room, then assign students by hand or shuffle them into seats at random. A clear seating
        chart helps you learn names quickly, manage behaviour, balance groups and hand a substitute
        teacher everything they need at a glance.</p>
        <p>Whether you teach in neat rows, clustered pods or a flexible layout that changes by the week,
        you can build it here in a few minutes and reuse it all year. Everything runs in your browser —
        no installation, no account and nothing to print unless you want to.</p>

        <h2>How to make a seating chart</h2>
        <ol>
          <li>Add desks to the canvas and drag them into the layout that matches your classroom.</li>
          <li>Type or paste your class list so the tool knows who needs a seat.</li>
          <li>Assign students to desks by hand, or shuffle them into the seats at random.</li>
          <li>Rearrange any time by dragging desks or students, then save the layout to reuse later.</li>
        </ol>

        <h2>What you can do</h2>
        <ul>
          <li>Drag desks and tables into rows, groups, a U-shape or any layout you like.</li>
          <li>Auto-assign your whole class to seats in one click, or place key students by hand.</li>
          <li>Shuffle seats randomly for a fresh arrangement or to break up chatty pairs.</li>
          <li>Save a layout for each class and reload it whenever you need it.</li>
        </ul>

        <h2>Ideas for seating arrangements</h2>
        <ul>
          <li><strong>Rows</strong> for tests and direct instruction, when you want focus and clear sightlines.</li>
          <li><strong>Pods or clusters</strong> for group projects, discussion and collaborative work.</li>
          <li><strong>A U-shape or horseshoe</strong> for seminars and whole-class conversation.</li>
          <li><strong>Strategic pairs</strong> that seat a supportive partner beside a student who needs one.</li>
        </ul>

        <h2>Why use a seating chart</h2>
        <p>A thoughtful seating plan does more than fill desks. It helps you learn and remember names at
        the start of the year, position students who benefit from being near the front or away from
        distractions, and balance friendship groups so collaboration stays productive. When you are away,
        a clear chart means a substitute can take attendance and keep your routines running smoothly.</p>

        <h2>Tips for a smoother classroom</h2>
        <ul>
          <li>Refresh your seating chart every few weeks to give students new partners and a change of view.</li>
          <li>Keep walkways clear so you can reach every desk during independent work.</li>
          <li>Place students with hearing or vision needs where they can see and hear best.</li>
          <li>Save more than one layout — one for tests, one for group work — and switch in seconds.</li>
        </ul>

        <h2>Common mistakes to avoid</h2>
        <ul>
          <li><strong>Blocking your own pathways.</strong> If you cannot reach every desk in a few steps, you lose the power of proximity. Keep walkways clear.</li>
          <li><strong>Setting it and forgetting it.</strong> A layout that fit in September may not suit the class that has formed by November. Revisit it every few weeks.</li>
          <li><strong>Moving students only as punishment.</strong> If the one time you change a seat is to shame someone, seating becomes a battleground. Treat changes as routine.</li>
          <li><strong>Ignoring access needs.</strong> Place students with hearing or vision needs where they can see and hear best, rather than wherever a gap is left.</li>
        </ul>

        <h2>Variations to try</h2>
        <ul>
          <li><strong>Layouts by activity:</strong> save one chart for tests and another for group work, then switch in seconds.</li>
          <li><strong>Random mixer:</strong> shuffle students for a fresh arrangement or a start-of-term icebreaker.</li>
          <li><strong>Beyond the classroom:</strong> plan an exam hall, a computer lab, an assembly or a field-trip bus.</li>
          <li><strong>Substitute-ready:</strong> keep a clear chart on hand so a relief teacher can take attendance at a glance.</li>
          <li><strong>Name practice:</strong> use your saved chart to quiz yourself on names in the first weeks of the year.</li>
        </ul>

        <h2>Frequently asked questions</h2>
        <h3>Can I match my real classroom layout?</h3>
        <p>Yes. You drag each desk into place, so you can recreate rows, pods, a horseshoe or any custom
        arrangement, including the position of your teacher desk and other furniture.</p>
        <h3>Can the tool assign students for me?</h3>
        <p>It can. Add your class list and use the shuffle option to drop everyone into seats at random, or
        place specific students yourself and let the tool fill in the rest.</p>
        <h3>Will my seating chart be saved?</h3>
        <p>You can save layouts on your device and reload them later, so you do not have to rebuild your
        chart every morning. Your class lists stay private on your own computer.</p>
        <h3>Is it free to use?</h3>
        <p>Completely free. There is no sign-up, no download and no limit on how many charts you create.</p>
        <h3>Can I use it for more than one class?</h3>
        <p>Yes. Save a separate layout for each class or period and switch between them whenever your
        groups change.</p>`,
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
        <p>The <strong>Behavior Chart</strong> is a free digital clip chart for tracking how your class is
        doing through the day. Students start in the middle and "clip up" for positive choices like
        kindness, effort and focus, or "clip down" when they need a reminder to get back on track. Because
        every level is colour-coded and visible on the board, students get instant, low-key feedback and
        learn to manage their own behaviour.</p>
        <p>A shared chart on the projector turns behaviour management into something calm and consistent.
        Instead of repeating warnings, you can simply move a name and let the visual do the talking — and
        celebrate the students who climb to the top.</p>

        <h2>How the behavior chart works</h2>
        <ol>
          <li>Add your students to the starting level in the middle of the chart.</li>
          <li>Tap a student to move them up for good choices, or down when a reminder is needed.</li>
          <li>Use the colour-coded levels so the whole class can see where everyone stands at a glance.</li>
          <li>Reset the chart at the end of the day so everyone starts fresh tomorrow.</li>
        </ol>

        <h2>Why teachers use a clip chart</h2>
        <ul>
          <li><strong>Instant feedback:</strong> a quick move up or down responds to behaviour in the moment, without a lecture.</li>
          <li><strong>Positive focus:</strong> students can climb for good choices, not just drop for mistakes.</li>
          <li><strong>Visual and consistent:</strong> colour-coded levels make expectations clear to every learner.</li>
          <li><strong>Self-management:</strong> students watch their own progress and learn to course-correct.</li>
        </ul>

        <h2>Tips for using it well</h2>
        <ul>
          <li>Catch students being good — clip up often so the chart rewards effort, not just flags slips.</li>
          <li>Pair each move with a few quiet words so students know exactly what earned it.</li>
          <li>Let students clip back up after a reminder, so a low moment is never the end of the day.</li>
          <li>Reset every morning so no one carries yesterday's tough day into a new start.</li>
        </ul>

        <h2>A balanced approach to behaviour</h2>
        <p>A clip chart works best as one part of a warm, encouraging classroom rather than the whole
        system. Keep the emphasis on positive recognition, give quiet reminders before moving anyone down,
        and talk privately with students who struggle so the chart never feels like public shaming. Used
        kindly and consistently, it gives children a clear, visual way to understand expectations and take
        pride in their progress.</p>

        <h2>Common mistakes to avoid</h2>
        <ul>
          <li><strong>Only ever clipping down.</strong> A chart that records mistakes but rarely rewards good choices becomes a shame board. Clip up often.</li>
          <li><strong>Moving a name silently.</strong> A change with no explanation teaches nothing. Pair each move with a few quiet words.</li>
          <li><strong>No way back up.</strong> If a student cannot recover after a reminder, the chart removes their incentive to improve. Always let them clip back up.</li>
          <li><strong>Carrying yesterday over.</strong> Starting a child at the bottom because of a tough day yesterday denies them a fresh start. Reset daily.</li>
          <li><strong>Public shaming.</strong> A few students find any public display humiliating. Use a quiet check-in instead when that is the case.</li>
        </ul>

        <h2>Variations to try</h2>
        <ul>
          <li><strong>Whole-class level:</strong> track the whole group toward a shared goal instead of, or alongside, individuals.</li>
          <li><strong>Pair with rewards:</strong> combine the chart with the <a href="/good-noodles/">Good Noodles board</a> so climbing earns recognition.</li>
          <li><strong>Match the cadence:</strong> reset daily for younger classes, or per lesson for secondary timetables.</li>
          <li><strong>Tie the top to a privilege:</strong> connect the highest level to a small, simple reward students can aim for.</li>
          <li><strong>Private mode:</strong> for sensitive students, track quietly with a one-to-one check-in rather than on the big screen.</li>
        </ul>

        <h2>Frequently asked questions</h2>
        <h3>How many levels does the chart have?</h3>
        <p>The chart uses several colour-coded levels above and below a neutral starting point, so there is
        room to recognise great choices and to flag when a student needs a reminder.</p>
        <h3>Can students move back up after clipping down?</h3>
        <p>Yes, and they should. Letting students clip back up after they correct their behaviour keeps the
        chart encouraging and shows that every choice is a fresh chance.</p>
        <h3>Does it save the day's results?</h3>
        <p>The chart is designed to be reset each day so students start fresh. It runs in your browser and
        keeps your class information on your own device.</p>
        <h3>Is the behavior chart free?</h3>
        <p>Yes. It is completely free to use, with no account, no download and no cost.</p>
        <h3>Can I use it on a projector or smartboard?</h3>
        <p>Definitely. The colour-coded levels are designed to be read from across the room, making it
        ideal for an interactive whiteboard or projector.</p>`,
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
        <p>The <strong>Good Noodles</strong> board is a free, playful reward chart that celebrates students
        who make great choices. When you catch a student being kind, working hard or staying focused, give
        them a "good noodle" and watch the positive behaviour spread as classmates aim to join the list.
        It is a cheerful, low-pressure way to put the spotlight on what is going right in your room.</p>
        <p>Positive reinforcement works best when students can see it, and the Good Noodles board makes
        recognition visible and fun. Display it on your projector or smartboard, hand out noodles
        throughout the day, and use it to build the warm, encouraging classroom culture you want.</p>

        <h2>How to use the Good Noodles chart</h2>
        <ol>
          <li>Add each student to the board so everyone has a place on the chart.</li>
          <li>Award a good noodle the moment you catch a student doing the right thing.</li>
          <li>Call out the positive choice so the whole class knows what earned it.</li>
          <li>Celebrate students who fill up their noodles, then reset to keep the encouragement going.</li>
        </ol>

        <h2>What to reward</h2>
        <ul>
          <li>Kindness and helping a classmate without being asked.</li>
          <li>Effort and persistence on tricky work.</li>
          <li>Focus, good listening and following directions the first time.</li>
          <li>Cleaning up, lining up calmly and other smooth transitions.</li>
        </ul>

        <h2>Why positive reinforcement works</h2>
        <p>Children repeat the behaviour that gets noticed. By rewarding good choices out loud, the Good
        Noodles board makes positive behaviour the centre of attention instead of misbehaviour, which
        encourages the rest of the class to follow. Over time, that steady stream of recognition builds
        students' confidence and helps a kind, hard-working classroom culture feel like the norm.</p>

        <h2>Tips for getting the most from it</h2>
        <ul>
          <li>Spread the noodles around so every student has a real chance to be recognised.</li>
          <li>Be specific — name the exact choice you are rewarding so others know what to copy.</li>
          <li>Mix in whole-class noodles for moments when the room shines together.</li>
          <li>Pair the board with a small reward when students reach a goal, like a sticker or choice time.</li>
        </ul>

        <h2>Common mistakes to avoid</h2>
        <ul>
          <li><strong>Rewarding only the usual stars.</strong> If the same few names always earn noodles, the rest of the class stops trying. Spread recognition deliberately.</li>
          <li><strong>Vague praise.</strong> "Well done" teaches nothing. Name the exact choice so others know what to copy.</li>
          <li><strong>Taking noodles away in anger.</strong> Stripping a hard-earned reward turns a positive board into a threat. Keep rewards and consequences separate.</li>
          <li><strong>Leaning on prizes.</strong> Constant tangible rewards can crowd out students' own motivation. Let attention and praise do most of the work.</li>
        </ul>

        <h2>Variations to try</h2>
        <ul>
          <li><strong>Whole-class jar:</strong> collect noodles toward a shared class reward to build teamwork.</li>
          <li><strong>Skill of the week:</strong> award noodles for one focus, such as kindness or perseverance, to highlight it.</li>
          <li><strong>Peer nominations:</strong> let students nominate a classmate who helped them, building a culture of noticing good.</li>
          <li><strong>Silent noodle:</strong> award one without stopping the lesson, then mention it later.</li>
          <li><strong>Pair with tracking:</strong> use it alongside the <a href="/behavior-chart/">Behavior Chart</a> so encouragement and reminders work together.</li>
        </ul>

        <h2>Frequently asked questions</h2>
        <h3>Where does the "Good Noodle" idea come from?</h3>
        <p>"Good noodle" is a friendly, classic phrase teachers use to praise a well-behaved student. This
        digital board turns that idea into a visible chart so the whole class can see and celebrate good
        choices together.</p>
        <h3>How many students can I add?</h3>
        <p>You can add your entire class. Each student gets their own spot on the board, and you can award
        noodles to as many of them as you like.</p>
        <h3>Can I reset the board?</h3>
        <p>Yes. Reset whenever you like — at the end of the day, the week, or once students reach a reward
        — so the chart stays fresh and motivating.</p>
        <h3>Is it free?</h3>
        <p>Completely free, with no sign-up and no download. Just open the page and start rewarding good
        choices.</p>
        <h3>Does it work on a smartboard?</h3>
        <p>Yes. The board is bright and easy to read on an interactive whiteboard or projector, so the
        whole class can enjoy it together.</p>`,
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
        <p>The <strong>Classroom Timer</strong> is a free, full-screen countdown the whole class can read
        from across the room. Set the minutes, press start, and the large high-contrast digits count down
        to zero, ending with a clear alarm. A visible timer keeps lessons moving, helps students pace
        themselves and turns "five more minutes" into something everyone can see.</p>
        <p>Use it for timed tests and writing prompts, smooth transitions between activities, brain breaks,
        clean-up routines and group rotations. It runs in any browser on your projector, smartboard,
        laptop or tablet — no app, no account and nothing to set up.</p>

        <h2>How to use the classroom timer</h2>
        <ol>
          <li>Set the amount of time you need using the timer controls.</li>
          <li>Press start, and the big digits begin counting down.</li>
          <li>Keep teaching — students can glance up any time to see how long is left.</li>
          <li>A clear alarm signals when time is up, then reset for the next activity.</li>
        </ol>

        <h2>Great for</h2>
        <ul>
          <li>Timed tests, quizzes and writing prompts.</li>
          <li>Transitions between activities and learning centres.</li>
          <li>Brain breaks, movement breaks and calm-down time.</li>
          <li>Clean-up routines, packing away and lining up.</li>
          <li>Group rotations, stations and turn-taking in games.</li>
        </ul>

        <h2>Why a visible timer helps</h2>
        <p>When students can see exactly how much time is left, they pace their own work, stay on task and
        feel less anxious about deadlines. A shared countdown also cuts down on "how long do we have?"
        questions, and the gentle alarm marks the end of an activity clearly so transitions are calmer and
        quicker. For younger students especially, watching time tick down builds an early, concrete sense
        of how long a few minutes really is.</p>

        <h2>Tips for classroom timing</h2>
        <ul>
          <li>Give a little more time than you think you need; you can always end early.</li>
          <li>Use short timers for transitions to keep the day's pace brisk and predictable.</li>
          <li>Announce what happens when the timer ends so students know what to expect.</li>
          <li>Add a quiet warning at the one-minute mark for smoother, less abrupt stops.</li>
        </ul>

        <h2>Common mistakes to avoid</h2>
        <ul>
          <li><strong>Timing everything.</strong> Deep thinking and rich discussion need room to breathe. Use the timer for pace and transitions, not to rush genuine struggle.</li>
          <li><strong>Being inconsistent.</strong> If the alarm sometimes means "stop" and sometimes means nothing, it loses its power. Honour it every time.</li>
          <li><strong>No warning before zero.</strong> An abrupt end catches students mid-thought. Give a quiet one-minute heads-up.</li>
          <li><strong>Setting too little time.</strong> Constant overruns train students to ignore the clock. Pad it slightly; you can always end early.</li>
        </ul>

        <h2>Variations to try</h2>
        <ul>
          <li><strong>Beat-the-clock tidy-up:</strong> a 60-second countdown turns packing away into a brisk routine.</li>
          <li><strong>Station rotations:</strong> a shared timer keeps every group moving together so no station runs long.</li>
          <li><strong>Retrieval races:</strong> short, sharp timers add energy to quizzes and quick-write warm-ups.</li>
          <li><strong>Focus sprints:</strong> longer countdowns create quiet, distraction-free work blocks for older students.</li>
          <li><strong>Brain breaks:</strong> let the timer, not you, call everyone back from a two-minute movement break.</li>
        </ul>

        <h2>Frequently asked questions</h2>
        <h3>Can the whole class see the timer?</h3>
        <p>Yes. The digits are large and high-contrast, designed to be read from the back of the room on a
        projector or interactive whiteboard.</p>
        <h3>Does it make a sound when time is up?</h3>
        <p>It ends with a clear alarm so you and your students know the moment time runs out, without you
        having to watch the clock.</p>
        <h3>Can I set any amount of time?</h3>
        <p>You can set the timer for anything from a quick transition to a full class period, then reset
        and reuse it for the next activity.</p>
        <h3>Is the timer free?</h3>
        <p>Completely free, with no account, no download and no cost. Open the page and it is ready to
        use.</p>
        <h3>Will it work on my smartboard or tablet?</h3>
        <p>Yes. The timer scales to fit projectors, interactive whiteboards, laptops, tablets and phones,
        so it fits whatever device runs your classroom.</p>`,
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
  <link rel="stylesheet" href="${base}css/pages.css">
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

const FOOTER = `  <!-- ═══════════════════════════ FOOTER ═══════════════════════════ -->
  <footer class="tt-footer">
    <div class="tt-footer-grid">
      <div class="tt-footer-brand">
        <a class="tt-fb-row" href="/">
          <img src="/Logo.png" alt="">
          <span>The Teacher Tools</span>
        </a>
        <p>Free, projector-friendly classroom tools and practical teaching resources. No sign-up, no download — just open and teach.</p>
      </div>
      <div>
        <h4>Tools</h4>
        <ul>
          <li><a href="/student-picker/">Student Picker</a></li>
          <li><a href="/seating-arranger/">Seating Chart Maker</a></li>
          <li><a href="/behavior-chart/">Behavior Chart</a></li>
          <li><a href="/good-noodles/">Good Noodles</a></li>
          <li><a href="/timer/">Classroom Timer</a></li>
        </ul>
      </div>
      <div>
        <h4>Resources</h4>
        <ul>
          <li><a href="/resources/">All Articles</a></li>
          <li><a href="/resources/classroom-management-strategies/">Classroom Management</a></li>
          <li><a href="/resources/classroom-seating-arrangements/">Seating Arrangements</a></li>
          <li><a href="/resources/attention-getting-signals/">Attention Signals</a></li>
          <li><a href="/resources/positive-reinforcement-classroom/">Positive Reinforcement</a></li>
        </ul>
      </div>
      <div>
        <h4>Site</h4>
        <ul>
          <li><a href="/about/">About</a></li>
          <li><a href="/contact/">Contact</a></li>
          <li><a href="/privacy/">Privacy Policy</a></li>
          <li><a href="https://ko-fi.com/kago1" target="_blank" rel="noopener">Support on Ko-fi</a></li>
        </ul>
      </div>
    </div>
    <div class="tt-footer-bottom">
      <p>&copy; 2026 The Teacher Tools. All rights reserved.</p>
      <div class="tt-fb-links">
        <a href="/privacy/">Privacy</a>
        <a href="/contact/">Contact</a>
        <a href="/about/">About</a>
      </div>
    </div>
  </footer>`;

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
    FOOTER,
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

/* ─── Hand-maintained content pages + resource articles (not generated here,
   but listed in the sitemap so they get crawled) ─── */
const EXTRA_PAGES = [
  'about/',
  'contact/',
  'privacy/',
  'resources/',
  'resources/classroom-management-strategies/',
  'resources/classroom-seating-arrangements/',
  'resources/attention-getting-signals/',
  'resources/positive-reinforcement-classroom/',
  'resources/cold-calling-students/',
  'resources/classroom-timers-transitions/',
];

/* sitemap.xml */
const urls = [
  ...NAV.map(n => SITE + (n.slug ? n.slug + '/' : '')),
  ...EXTRA_PAGES.map(p => SITE + p),
];
writeFile('sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map(u => `  <url><loc>${u}</loc><changefreq>monthly</changefreq></url>`).join('\n') +
  `\n</urlset>\n`);

/* robots.txt */
writeFile('robots.txt',
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE}sitemap.xml\n`);

console.log('\nDone. Re-run with:  node _generator/build.js');
