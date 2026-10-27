(() => {
  const MEASUREMENT_ID = 'G-70TT6L9N4G';
  const CONSENT_KEY = 'bs-privacy-choice-v1';
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

  window.addEventListener('bs:privacy-choice', event => {
    if (event.detail?.choice === 'accepted') loadAnalytics();
  });

  loadAnalytics();
})();
