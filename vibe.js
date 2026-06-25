(() => {
  const graph = document.getElementById('vibeGraph');
  if (!graph) return;

  const line = document.getElementById('vibeLine');
  const events = document.getElementById('vibeEvents');
  const needle = document.getElementById('vibeNeedle');
  const faceG = document.getElementById('vibeFaceG');
  const startBtn = document.getElementById('vibeStart');

  // ── Geometry ──────────────────────────────────────────────────
  const GW = 1000, GH = 240, MID = 120, AMP = 100;          // graph
  const PIV_X = 200, PIV_Y = 205, NEEDLE_LEN = 141;          // gauge

  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const xOf = t => (t / state.dur) * GW;
  const yOf = v => MID - (clamp(v, -100, 100) / 100) * AMP;

  // ── Events (positive = more hyped, negative = more disillusioned) ──
  const EVENTS = [
    { t: 'Opus just deleted my production database', d: -34 },
    { t: 'LLMs don’t really reason — they just pattern-match', d: -20 },
    { t: 'Our agent hallucinated a refund policy. Cost us $40k', d: -28 },
    { t: 'The model confidently cited 6 papers that don’t exist', d: -18 },
    { t: 'Day 3 of the agent looping on the same failing test', d: -22 },
    { t: 'Vibe-coded the auth layer — it shipped plaintext passwords', d: -26 },
    { t: 'GPT just solved an open physics problem', d: 32 },
    { t: 'GPT-5 refactored our legacy codebase overnight', d: 30 },
    { t: 'An agent shipped a full feature while I slept', d: 24 },
    { t: 'Cut our support backlog 80% with a single agent', d: 22 },
    { t: 'New model tops every benchmark by a mile', d: 20 },
    { t: 'My grandma built an app this weekend — no code', d: 18 },
  ];

  const BIRD = '<svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%" aria-hidden="true"><path d="M23.954 4.569c-.885.392-1.83.656-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.896-.959-2.173-1.559-3.591-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067 2.189 1.394 4.768 2.209 7.557 2.209 9.054 0 14-7.503 14-14 0-.21-.005-.42-.014-.63.961-.689 1.796-1.56 2.457-2.548l-.047-.02z"/></svg>';

  // ── State ─────────────────────────────────────────────────────
  const state = {
    running: false,
    startTs: 0,
    dur: 30000,
    pos: 0,    // displayed needle value (spring)
    vel: 0,
    target: 0, // value the needle is heading toward
    samples: [{ t: 0, v: 0 }],
    timers: [],
  };

  // ── Render loop: spring physics + voltage-meter wobble ─────────
  function frame(now) {
    const force = (state.target - state.pos) * 0.1;
    state.vel = (state.vel + force) * 0.8;
    state.pos += state.vel;

    let disp = state.pos;
    if (state.running) {
      disp += Math.sin(now / 90) * 0.8 + (Math.random() - 0.5) * 1.0;
    }
    disp = clamp(disp, -100, 100);

    const angle = (disp / 100) * 90;
    needle.setAttribute('transform', `rotate(${angle.toFixed(2)} ${PIV_X} ${PIV_Y})`);

    const a = (angle * Math.PI) / 180;
    const tx = PIV_X + NEEDLE_LEN * Math.sin(a);
    const ty = PIV_Y - NEEDLE_LEN * Math.cos(a);
    faceG.setAttribute('transform', `translate(${tx.toFixed(1)} ${ty.toFixed(1)})`);

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // ── Graph drawing ─────────────────────────────────────────────
  function redrawLine() {
    line.setAttribute(
      'points',
      state.samples.map(s => `${xOf(s.t).toFixed(1)},${yOf(s.v).toFixed(1)}`).join(' ')
    );
  }

  function sampleLoop() {
    if (!state.running) return;
    const el = performance.now() - state.startTs;
    state.samples.push({ t: Math.min(el, state.dur), v: state.pos });
    redrawLine();
    if (el >= state.dur) { finish(); return; }
    state.timers.push(setTimeout(sampleLoop, 140));
  }

  function fireEvent(ev) {
    const el = performance.now() - state.startTs;
    // pin a node on the line at the moment the event lands
    state.samples.push({ t: Math.min(el, state.dur), v: state.pos });
    addMarker(el, state.pos, ev);
    state.target = clamp(state.target + ev.d, -100, 100);
  }

  function addMarker(t, v, ev) {
    const leftPct = clamp((xOf(t) / GW) * 100, 4, 96);
    const topPct = (yOf(v) / GH) * 100;

    const dot = document.createElement('div');
    dot.className = 'vibe__marker';
    dot.style.left = leftPct + '%';
    dot.style.top = topPct + '%';
    events.appendChild(dot);

    const below = topPct < 34;
    const c = document.createElement('div');
    c.className = 'vibe__callout' + (below ? ' vibe__callout--below' : '');
    c.style.left = leftPct + '%';
    c.style.top = topPct + '%';
    c.innerHTML =
      '<div class="vibe__callout-inner"><span class="vibe__callout-bird">' +
      BIRD + '</span><span>' + ev.t + '</span></div>';
    events.appendChild(c);

    state.timers.push(setTimeout(() => {
      c.classList.add('is-out');
      state.timers.push(setTimeout(() => c.remove(), 450));
    }, 3600));
  }

  // ── Run / finish ──────────────────────────────────────────────
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function run() {
    state.timers.forEach(clearTimeout);
    state.timers = [];
    events.innerHTML = '';
    state.samples = [{ t: 0, v: 0 }];
    state.pos = 0; state.vel = 0; state.target = 0;

    const order = shuffle(EVENTS.slice());
    const offset = 900, interval = 2100;
    state.dur = offset + (order.length - 1) * interval + 2600;
    state.running = true;
    state.startTs = performance.now();
    redrawLine();

    startBtn.disabled = true;
    startBtn.textContent = 'Reading the room…';

    order.forEach((ev, i) => {
      state.timers.push(setTimeout(() => fireEvent(ev), offset + i * interval));
    });
    state.timers.push(setTimeout(sampleLoop, 140));
  }

  function finish() {
    state.running = false;
    startBtn.disabled = false;
    startBtn.textContent = '↻  Run it again';
  }

  startBtn.addEventListener('click', run);
})();
