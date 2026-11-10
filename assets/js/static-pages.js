(() => {
  const privacyConsent=document.createElement('script');
privacyConsent.src='assets/js/privacy-consent.js?v=6';
  privacyConsent.defer=true;
  document.head.appendChild(privacyConsent);
  const analytics=document.createElement('script');
  analytics.src='assets/js/analytics.js?v=2';
  analytics.defer=true;
  document.head.appendChild(analytics);
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
  const header = document.querySelector('.nav-wrap');
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  if (nav && !nav.querySelector('.nav-dropdown')) nav.innerHTML = '<a href="/">Home</a><a href="/stories/">Stories</a><a href="/recipes/">All Recipes</a><a href="/categories.html">Categories</a><a href="/categories/quick-and-easy/">Quick &amp; Easy</a><details class="nav-dropdown"><summary>Legal &amp; Privacy <span aria-hidden="true">⌄</span></summary><div class="nav-dropdown-menu"><a href="/about.html">About</a><a href="/contact.html">Contact</a><a href="/privacy.html">Privacy Policy</a><a href="/terms.html">Terms &amp; Conditions</a><a href="/disclaimer.html">Disclaimer</a><a href="/cookie-policy.html">Cookie Policy</a><a href="/editorial-standards.html">Editorial Standards</a></div></details>';
  const closeLegalMenu = () => document.querySelectorAll('.nav-dropdown[open]').forEach(dropdown => dropdown.removeAttribute('open'));
  document.addEventListener('pointerdown', event => { if (!event.target.closest('.nav-dropdown')) closeLegalMenu(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeLegalMenu(); });
  document.querySelectorAll('.footer-grid').forEach(grid => {
    const heading = Array.from(grid.querySelectorAll('h3')).find(item => item.textContent.trim() === 'Explore');
    const column = heading?.parentElement;
    if (!column || column.querySelector('a[data-stories-link]')) return;
    const stories = document.createElement('a');
    stories.href = '/stories/';
    stories.textContent = 'Stories';
    stories.dataset.storiesLink = 'true';
    const categories = Array.from(column.querySelectorAll('a')).find(link => /Categories/.test(link.textContent));
    if (categories) categories.insertAdjacentElement('beforebegin', stories); else column.appendChild(stories);
  });
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
  // Recipe PDF buttons: route the action to the site's PDF generator instead of the browser's native print dialog.
  if (document.getElementById('recipe-card')) {
    const pdfScript = document.createElement('script');
    pdfScript.src = new URL(document.currentScript.src.replace(/static-pages\.js(?:\?.*)?$/, 'pdf-export.js?v=3'));
    pdfScript.defer = true;
    document.head.appendChild(pdfScript);
    document.querySelectorAll('button[onclick="window.print()"]')?.forEach(button => {
      button.removeAttribute('onclick');
      button.addEventListener('click', () => window.downloadRecipePDF?.());
    });
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
