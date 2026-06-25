(() => {
  const eq = document.getElementById('eqBody');
  const switchEl = document.querySelector('.eq__switch');
  if (!eq || !switchEl) return;

  const btns = switchEl.querySelectorAll('.eq__switch-btn');

  const A = [
    { t: 'AI Agent', type: 'lhs' },
    { t: '≈', type: 'rel' },
    { t: 'Decision Engine', sub: 'LLM', type: 'term' },
    { t: '+', type: 'op' },
    { t: 'State', sub: 'memory, context', type: 'term' },
    { t: '+', type: 'op' },
    { t: 'Tool-Use', type: 'term' },
    { t: '+', type: 'op' },
    { t: 'Control Loop', type: 'term' },
  ];

  const B = [
    { t: 'Human–AI System', type: 'lhs', hot: true },
    { t: '≈', type: 'rel' },
    { t: 'Decision Engines', sub: 'LLM, human', type: 'term', hot: true },
    { t: '+', type: 'op' },
    { t: 'State', sub: 'memory, context', type: 'term' },
    { t: '+', type: 'op' },
    { t: 'Tool-Use', type: 'term' },
    { t: '+', type: 'op' },
    { t: 'Human Action', type: 'term', hot: true },
    { t: '+', type: 'op' },
    { t: 'Control Loop', type: 'term' },
  ];

  let state = 'A';

  function render(tokens, animate) {
    eq.innerHTML = tokens.map((tk, i) => {
      if (tk.type === 'op' || tk.type === 'rel') {
        return `<span class="eq__op" style="--i:${i}">${tk.t}</span>`;
      }
      const sub = tk.sub ? `<small>${tk.sub}</small>` : '';
      const cls = ['eq__term',
        tk.type === 'lhs' ? 'eq__term--lhs' : '',
        tk.hot ? 'is-hot' : ''].filter(Boolean).join(' ');
      return `<span class="${cls}" style="--i:${i}">${tk.t}${sub}</span>`;
    }).join('');

    const reveal = () => eq.querySelectorAll('.eq__term, .eq__op')
      .forEach(el => el.classList.add('is-in'));

    if (animate) requestAnimationFrame(reveal);
    else reveal();
  }

  function switchTo(target) {
    if (target === state) return;
    eq.classList.add('eq--out');
    setTimeout(() => {
      state = target;
      eq.classList.remove('eq--out');
      render(state === 'A' ? A : B, true);
      btns.forEach(b => b.classList.toggle('is-active', b.dataset.eq === state));
    }, 260);
  }

  // initial render
  render(A, false);

  btns.forEach(btn => {
    btn.addEventListener('click', () => switchTo(btn.dataset.eq));
  });
})();
