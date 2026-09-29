(() => {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
  const header = document.querySelector('.nav-wrap');
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  if (menu && nav) menu.addEventListener('click', () => {
    const open = nav.classList.toggle('menu-open');
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  const savedTheme = (() => { try { return localStorage.getItem('bs-theme') || ''; } catch { return ''; } })();
  const initialTheme = savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', initialTheme);
  if (header) {
    const theme = document.createElement('button');
    theme.type = 'button'; theme.className = 'theme-toggle';
    const sync = () => { const dark = document.documentElement.getAttribute('data-theme') === 'dark'; theme.innerHTML = `<span aria-hidden="true">${dark ? '☀' : '☾'}</span><span class="sr-only">${dark ? 'Switch to light mode' : 'Switch to dark mode'}</span>`; theme.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode'); };
    theme.addEventListener('click', () => { const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'; document.documentElement.setAttribute('data-theme', next); try { localStorage.setItem('bs-theme', next); } catch {} sync(); });
    header.querySelector('.saved-link')?.before(theme); sync();
  }
  document.querySelectorAll('.video-credit').forEach(credit => {
    const channelLink = credit.querySelector('a[href^="https://www.youtube.com/"]');
    if (!channelLink) return;
    const channelUrl = channelLink.getAttribute('href');
    const channelName = channelLink.textContent.trim() || 'YouTube';
    credit.innerHTML = `Video courtesy of <a href="${channelUrl}" rel="noopener noreferrer">${channelName}</a>. Please support the creator by <a href="${channelUrl}" rel="noopener noreferrer">subscribing to their YouTube channel</a>.`;
  });
  document.querySelectorAll('[data-save-recipe]').forEach(button => button.addEventListener('click', () => {
    const id = button.dataset.saveRecipe; let saved = [];
    try { saved = JSON.parse(localStorage.getItem('bs-saved') || '[]'); } catch {}
    saved = Array.isArray(saved) ? saved : [];
    const index = saved.indexOf(id); if (index < 0) saved.push(id); else saved.splice(index, 1);
    try { localStorage.setItem('bs-saved', JSON.stringify(saved)); } catch {}
    button.textContent = index < 0 ? '♥ Saved' : '♡ Save recipe';
  }));
})();
