(() => {
  const root = document.documentElement;
  const themeButton = document.querySelector('.theme-toggle');
  const syncTheme = () => {
    const dark = root.getAttribute('data-theme') === 'dark';
    themeButton?.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    if (themeButton) themeButton.innerHTML = `<span class="theme-icon" aria-hidden="true">${dark ? '☀' : '☾'}</span><span class="sr-only">${dark ? 'Switch to light mode' : 'Switch to dark mode'}</span>`;
  };
  themeButton?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('bs-theme', next); } catch {}
    syncTheme();
  });
  syncTheme();

  const nav = document.querySelector('.main-nav');
  const menu = document.querySelector('.menu-toggle');
  const closeMenu = () => {
    nav?.classList.remove('menu-open');
    menu?.setAttribute('aria-expanded', 'false');
    if (nav) ['display','position','top','left','right','padding','background','flex-direction','border-bottom'].forEach(property => nav.style.removeProperty(property));
  };
  menu?.addEventListener('click', () => {
    const opening = !nav?.classList.contains('menu-open');
    if (!opening) return closeMenu();
    nav?.classList.add('menu-open');
    menu.setAttribute('aria-expanded', 'true');
    if (nav) Object.assign(nav.style, { display:'flex', position:'absolute', top:'68px', left:'0', right:'0', padding:'20px', background:'var(--white)', flexDirection:'column', borderBottom:'1px solid var(--line)' });
  });
  const closeLegal = () => document.querySelectorAll('.nav-dropdown[open]').forEach(item => item.removeAttribute('open'));
  document.addEventListener('pointerdown', event => { if (!event.target.closest('.nav-dropdown')) closeLegal(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') { closeLegal(); closeMenu(); } });
  nav?.addEventListener('click', event => { if (event.target.closest('a') && matchMedia('(max-width:850px)').matches) closeMenu(); });
  document.getElementById('year').textContent = new Date().getFullYear();
  const cards = [...document.querySelectorAll('[data-story-card], .stories-grid > a')];
  let pagination = document.querySelector('[data-stories-pagination]');
  if (!pagination && cards.length) {
    pagination = document.createElement('nav');
    pagination.className = 'stories-pagination';
    pagination.setAttribute('data-stories-pagination', '');
    pagination.setAttribute('aria-label', 'Story pages');
    document.querySelector('.stories-grid')?.after(pagination);
  }
  const perPage = 10;
  if (cards.length && pagination) {
    const pages = Math.ceil(cards.length / perPage);
    const requested = Number(new URLSearchParams(location.search).get('page'));
    let current = Number.isInteger(requested) && requested >= 1 && requested <= pages ? requested : 1;
    const renderPage = page => {
      current = page;
      cards.forEach((card, index) => { card.hidden = Math.floor(index / perPage) + 1 !== current; });
      pagination.innerHTML = '';
      for (let number = 1; number <= pages; number++) {
        const button = document.createElement('button');
        button.type = 'button'; button.textContent = String(number);
        button.setAttribute('aria-label', 'Show Story page ' + number);
        if (number === current) { button.className = 'is-active'; button.setAttribute('aria-current', 'page'); }
        button.addEventListener('click', () => {
          const url = new URL(location.href); url.searchParams.set('page', number);
          history.replaceState({}, '', url); renderPage(number);
          document.querySelector('.stories-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        pagination.appendChild(button);
      }
    };
    renderPage(current);
  }
})();
