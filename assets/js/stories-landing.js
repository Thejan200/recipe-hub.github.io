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
})();
