(() => {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const navBtns = Array.from(document.querySelectorAll('.slide-nav__btn'));
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');

  let current = 0;

  function setActiveNav(index) {
    navBtns.forEach(b => {
      b.classList.toggle('slide-nav__btn--active', Number(b.dataset.target) === index);
    });
  }

  function goTo(index) {
    if (index < 0 || index >= slides.length) return;

    slides[current].classList.remove('slide--active');
    current = index;
    slides[current].classList.add('slide--active');

    setActiveNav(current);
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === slides.length - 1;
  }

  // Bottom-nav pills (map to a slide via data-target; breakout slides may have no pill)
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => goTo(Number(btn.dataset.target)));
  });

  // In-slide navigation targets (e.g. timeline markers)
  document.querySelectorAll('[data-target]').forEach(el => {
    if (el.classList.contains('slide-nav__btn')) return;
    el.addEventListener('click', () => {
      const t = el.dataset.target;
      if (t !== '' && t != null) goTo(Number(t));
    });
  });

  // Arrow buttons
  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
      e.preventDefault();
      goTo(current + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      goTo(current - 1);
    }
  });

  // Init state
  goTo(0);

  // Hide keyboard hint after first interaction
  const hint = document.querySelector('.key-hint');
  if (hint) {
    const hideHint = () => { hint.classList.add('key-hint--hidden'); };
    document.addEventListener('keydown', hideHint, { once: true });
    document.addEventListener('click', hideHint, { once: true });
  }
})();
