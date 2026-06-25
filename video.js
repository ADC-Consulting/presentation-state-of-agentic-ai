// "Design moves to the forefront" breakout: a looping demo clip on the left
// (native controls — play / pause / scrub) plus the agentic-criteria checklist
// on the right. Revealing the criteria freezes the video.
(() => {
  const slide = document.querySelector('.slide--video');
  if (!slide) return;
  const video = slide.querySelector('.rag-video');
  const btn = slide.querySelector('.rag__btn');
  const crits = Array.from(slide.querySelectorAll('.rag-crit'));

  const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>';
  const CROSS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  const STATUS = { good: 'is-good', warn: 'is-warn', bad: 'is-bad' };

  const NB = ' ';
  const START = 'Agentic criteria' + NB + NB + '▶';
  const NEXT = 'Next' + NB + NB + '▶';
  const RESET = '↺' + NB + NB + 'Reset';

  let revealed = 0;

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

  function resetCriteria() {
    revealed = 0;
    crits.forEach((_, i) => setCrit(i, false));
    if (btn) btn.textContent = START;
  }

  if (btn) {
    btn.addEventListener('click', () => {
      if (revealed >= crits.length) { resetCriteria(); return; }
      if (revealed === 0 && video) video.pause(); // switching to criteria → freeze the clip
      setCrit(revealed, true);
      revealed += 1;
      btn.textContent = revealed >= crits.length ? RESET : NEXT;
    });
  }

  // Play from the top when the slide opens; pause it when it isn't shown.
  function syncActive() {
    if (slide.classList.contains('slide--active')) {
      resetCriteria();
      if (video) {
        try { video.currentTime = 0; } catch (e) { /* not ready yet */ }
        const p = video.play();
        if (p && p.catch) p.catch(() => {});
      }
    } else if (video) {
      video.pause();
    }
  }

  new MutationObserver(syncActive).observe(slide, { attributes: true, attributeFilter: ['class'] });
  syncActive();
})();
