(() => {
  const MEASUREMENT_ID = 'G-70TT6L9N4G';
  const CONSENT_KEY = 'bs-analytics-consent-v1';
  let loaded = false;

  const storedChoice = () => {
    try { return localStorage.getItem(CONSENT_KEY) || ''; } catch { return ''; }
  };

  const loadAnalytics = () => {
    if (loaded || storedChoice() !== 'accepted') return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag(){ window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    window.gtag('js', new Date());
    window.gtag('config', MEASUREMENT_ID);
    const tag = document.createElement('script');
    tag.async = true;
    tag.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`;
    document.head.appendChild(tag);
  };

  const saveChoice = (choice) => {
    try { localStorage.setItem(CONSENT_KEY, choice); } catch {}
    document.getElementById('cookie-banner')?.remove();
    if (choice === 'accepted') loadAnalytics();
    document.dispatchEvent(new CustomEvent('bs-analytics-consent', { detail: { choice } }));
  };

  const addBanner = () => {
    if (document.getElementById('cookie-banner') || storedChoice()) return;
    const banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie and analytics choice');
    banner.innerHTML = '<div><strong>Cookies & analytics</strong><p>BiteSparks uses essential browser storage for saved recipes and preferences. With your permission, Google Analytics helps us understand anonymous site use. You can decline analytics and still use the site.</p></div><div><button class="btn btn-outline" id="cookie-decline" type="button">Decline</button><button class="btn btn-dark" id="cookie-accept" type="button">Accept</button></div>';
    banner.style = 'position:fixed;bottom:16px;left:16px;right:16px;z-index:50;background:var(--white);border:1px solid var(--line);border-radius:14px;padding:16px 18px;box-shadow:0 18px 50px rgba(35,30,22,.16);display:flex;justify-content:space-between;align-items:center;gap:18px;font-size:12px';
    document.body.appendChild(banner);
  };

  document.addEventListener('click', event => {
    const button = event.target.closest('#cookie-accept, #cookie-decline');
    if (!button) return;
    saveChoice(button.id === 'cookie-accept' ? 'accepted' : 'declined');
  });

  if (storedChoice() === 'accepted') loadAnalytics();
  else if (!storedChoice()) addBanner();
})();
