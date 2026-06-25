// Drives the step-by-step breakout diagrams (Simple RAG, LLM workflows, …).
// Each .slide--rag is an independent, auto-playing flow + criteria checklist.
(() => {
  const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>';
  const CROSS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  const STATUS = { good: 'is-good', warn: 'is-warn', bad: 'is-bad' };

  const STEP_MS = 1700;    // delay between diagram steps while auto-playing
  const LOOP_PAUSE = 1600; // hold the full diagram before restarting

  function initRag(root) {
    const steps = Array.from(root.querySelectorAll('.rag-step'))
      .sort((a, b) => Number(a.dataset.step) - Number(b.dataset.step));
    const crits = Array.from(root.querySelectorAll('.rag-crit'));
    const btn = root.querySelector('.rag__btn');
    if (!btn) return;

    const diagramSteps = steps.length;

    let phase = 'idle';   // idle | playing | frozen | results
    let critIndex = 0;
    let timer = null;

    const setSteps = n =>
      steps.forEach(g => g.classList.toggle('is-on', Number(g.dataset.step) <= n));

    function setCrit(i, on) {
      const c = crits[i];
      const mark = c.querySelector('.rag-crit__mark');
      c.classList.toggle('is-on', on);
      if (on) {
        c.classList.add(STATUS[c.dataset.status]);
        mark.innerHTML = c.dataset.status === 'bad' ? CROSS : CHECK;
      } else {
        c.classList.remove('is-good', 'is-warn', 'is-bad');
        mark.innerHTML = '';
      }
    }

    const clearCrits = () => { critIndex = 0; crits.forEach((_, i) => setCrit(i, false)); };

    function play(idx) {
      if (phase !== 'playing') return;
      if (idx > diagramSteps) {
        timer = setTimeout(() => {
          if (phase !== 'playing') return;
          setSteps(0);
          timer = setTimeout(() => play(1), STEP_MS);
        }, LOOP_PAUSE);
        return;
      }
      setSteps(idx);
      timer = setTimeout(() => play(idx + 1), STEP_MS);
    }

    function startPlaying() {
      phase = 'playing';
      clearTimeout(timer);
      clearCrits();
      setSteps(0);
      btn.textContent = 'Next  ▶';
      timer = setTimeout(() => play(1), STEP_MS);
    }

    // First Next: stop the loop, hold the full diagram, but no scores yet.
    function freeze() {
      phase = 'frozen';
      clearTimeout(timer);
      setSteps(diagramSteps);
      clearCrits();
      btn.textContent = 'Next  ▶';
    }

    // Second Next onward: reveal the criteria one by one.
    function enterResults() {
      phase = 'results';
      critIndex = 0;
      advanceResults();
    }

    function advanceResults() {
      if (critIndex < crits.length) {
        setCrit(critIndex, true);
        critIndex++;
      }
      btn.textContent = critIndex >= crits.length ? '↺  Reset' : 'Next  ▶';
    }

    function reset() {
      phase = 'idle';
      clearTimeout(timer);
      setSteps(0);
      clearCrits();
      btn.textContent = 'Begin  ▶';
    }

    btn.addEventListener('click', () => {
      if (phase === 'idle') startPlaying();
      else if (phase === 'playing') freeze();
      else if (phase === 'frozen') enterResults();
      else if (critIndex >= crits.length) reset();
      else advanceResults();
    });

    reset();
  }

  document.querySelectorAll('.slide--rag').forEach(root => {
    if (root.classList.contains('slide--video')) return; // criteria driven by video.js
    initRag(root);
  });
})();
