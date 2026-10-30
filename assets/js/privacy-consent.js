(() => {
  const CHOICE_KEY = 'bs-privacy-choice-v2';
  const LEGACY_KEY = 'bs-privacy-choice-v1';
  const normalise = value => ({ analytics: Boolean(value?.analytics) });
  const storedPreferences = () => {
    try {
      const current = localStorage.getItem(CHOICE_KEY);
      if (current) return normalise(JSON.parse(current));
      const legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy === 'accepted') return { analytics: true };
      if (legacy === 'declined') return { analytics: false };
    } catch {}
    return null;
  };
  const savePreferences = preferences => {
    const value = normalise(preferences);
    try { localStorage.setItem(CHOICE_KEY, JSON.stringify(value)); } catch {}
    window.dispatchEvent(new CustomEvent('bs:privacy-choice', { detail: { preferences: value } }));
    return value;
  };
  const removeBanner = () => document.getElementById('cookie-banner')?.remove();
  const showBanner = () => {
    if (document.getElementById('cookie-banner')) return;
    const preferences = storedPreferences() || { analytics: false };
    const banner = document.createElement('section');
    banner.id = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookies and analytics choices');
    banner.innerHTML = `
      <div><strong>Cookies &amp; analytics</strong><p>Essential site storage always works. With your permission, BiteSparks may load Google Analytics.</p><p><a href="privacy.html">Privacy Policy</a> · <a href="cookie-policy.html">Cookie Policy</a></p></div>
      <div class="privacy-choice-actions"><button class="btn btn-outline" data-privacy-choice="declined" type="button">Reject analytics</button><button class="btn btn-dark" data-privacy-choice="accepted" type="button">Accept analytics</button></div>`;
    banner.style.cssText = 'position:fixed;bottom:16px;left:16px;right:16px;z-index:1000;background:var(--white);border:1px solid var(--line);border-radius:14px;padding:16px 18px;box-shadow:0 18px 50px rgba(35,30,22,.16);display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px 18px;font-size:12px';
    const apply = next => { savePreferences(next); removeBanner(); };
    banner.querySelector('[data-privacy-choice="accepted"]').addEventListener('click', () => apply({ analytics: true }));
    banner.querySelector('[data-privacy-choice="declined"]').addEventListener('click', () => apply({ analytics: false }));
    document.body.appendChild(banner);
  };
  const addPrivacyControl = () => {
    if (document.getElementById('privacy-choices-control')) return;
    const footer = document.querySelector('.site-footer .footer-bottom'); if (!footer) return;
    const control = document.createElement('button'); control.id = 'privacy-choices-control'; control.type = 'button'; control.textContent = 'Privacy choices';
    control.style.cssText = 'background:none;border:0;padding:0;color:inherit;font:inherit;text-decoration:underline;cursor:pointer';
    control.addEventListener('click', showBanner); footer.append(' · ', control);
  };
  const init = () => { if (!storedPreferences()) showBanner(); addPrivacyControl(); };
  window.BiteSparksPrivacy = { showChoices: showBanner };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})();
