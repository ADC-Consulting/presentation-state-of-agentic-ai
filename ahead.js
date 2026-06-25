// Drives the "Looking ahead" breakout: stick figure runs the road, jumping the
// roadblocks (ROI → Costs → Trust) one click at a time, then sprints to the sun.
(() => {
  const root = document.querySelector('.slide--ahead');
  if (!root) return;

  const svg = root.querySelector('.ahead-svg');
  const btn = root.querySelector('.ahead__btn');
  const runner = svg.querySelector('.ahead-runner');
  const hop = svg.querySelector('.ahead-runner__hop');
  const blocks = Array.from(svg.querySelectorAll('.ahead-block'));
  const labels = Array.from(svg.querySelectorAll('.ahead-block-label'));

  // Road centerline: point(s) = (330 + 676s, 560 - 258s); depth scale shrinks
  // the runner as it nears the horizon.
  const pt = s => [210 + 420 * s, 560 - 260 * s];
  const sc = s => 1 - 0.6 * s;

  const BLOCK_S = [0.30, 0.54, 0.78]; // Costs, ROI, Trust (Trust last)
  const START_S = 0.05;
  const SUN_S = 0.95;
  const RUN_MS = 900;
  const JUMP_MS = 700;

  const NBSP = ' ';
  const BEGIN = 'Begin' + NBSP + NBSP + '▶';
  const NEXT = 'Next' + NBSP + NBSP + '▶';
  const RESET = '↺' + NBSP + NBSP + 'Reset';

  let phase = 0; // 0 = landing, 1 = roadblocks shown, 2..4 = after jump (i = phase-2)
  let busy = false;
  let timers = [];
  const after = (ms, fn) => timers.push(setTimeout(fn, ms));
  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };

  function place(s, ms) {
    if (ms != null) runner.style.transitionDuration = ms + 'ms';
    const [x, y] = pt(s);
    runner.style.transform = `translate(${x}px, ${y}px) scale(${sc(s)})`;
  }

  function reset() {
    clearTimers();
    busy = false;
    phase = 0;
    runner.classList.remove('is-celebrating', 'is-running');
    hop.classList.remove('is-jumping');
    runner.style.transition = 'none';
    place(START_S);
    void runner.getBoundingClientRect(); // commit before re-enabling transitions
    runner.style.transition = '';
    runner.style.transitionDuration = '';
    blocks.forEach(b => b.classList.remove('is-on'));
    labels.forEach(l => l.classList.remove('is-on', 'is-jumped'));
    btn.textContent = BEGIN;
  }

  function showBlocks() {
    phase = 1;
    blocks.forEach(b => b.classList.add('is-on'));
    labels.forEach(l => l.classList.add('is-on'));
    btn.textContent = NEXT;
  }

  function jump(i) {
    busy = true;
    const bs = BLOCK_S[i];
    const last = i === BLOCK_S.length - 1;

    runner.classList.add('is-running'); // legs start pumping
    place(bs - 0.075, RUN_MS); // run up to the roadblock
    after(RUN_MS, () => {
      hop.classList.remove('is-jumping');
      void hop.getBoundingClientRect();
      hop.classList.add('is-jumping');
      place(bs + 0.085, JUMP_MS); // arc over it
      after(JUMP_MS, () => {
        hop.classList.remove('is-jumping');
        labels[i].classList.add('is-jumped'); // extend the label
        if (last) {
          runner.classList.add('is-celebrating');
          after(280, () => {
            place(SUN_S, 1400); // sprint to the sun, arms raised
            after(1400, () => runner.classList.remove('is-running'));
            busy = false;
          });
          btn.textContent = RESET;
        } else {
          runner.classList.remove('is-running'); // stand and wait
          busy = false;
          btn.textContent = NEXT;
        }
      });
    });
  }

  btn.addEventListener('click', () => {
    if (busy) return;
    if (phase === 0) showBlocks();
    else if (phase >= 1 && phase <= 3) { const i = phase - 1; phase += 1; jump(i); }
    else reset();
  });

  reset();
})();
