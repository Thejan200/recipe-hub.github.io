(() => {
  const CHOICE_KEY = 'bs-privacy-choice-v2';
  const LEGACY_KEY = 'bs-privacy-choice-v1';
  const ZONE = '12126317';
  const TAG_URL = 'https://nap5k.com/tag.min.js';

  const normalise = value => ({
    analytics: Boolean(value?.analytics),
    advertising: Boolean(value?.advertising)
  });
  const storedPreferences = () => {
    try {
      const current = localStorage.getItem(CHOICE_KEY);
      if (current) return normalise(JSON.parse(current));
      const legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy === 'accepted') return { analytics: true, advertising: true };
      if (legacy === 'declined') return { analytics: false, advertising: false };
    } catch {}
    return null;
  };
  const savePreferences = preferences => {
    const value = normalise(preferences);
    try { localStorage.setItem(CHOICE_KEY, JSON.stringify(value)); } catch {}
    window.dispatchEvent(new CustomEvent('bs:privacy-choice', { detail: { preferences: value } }));
    return value;
  };
  const advertisingAllowed = () => storedPreferences()?.advertising === true;
  const loadAdvertising = () => {
    if (!advertisingAllowed() || document.querySelector(`script[data-zone="${ZONE}"]`)) return;

    // Preserve Monetag's supplied loader behavior: append after <head>
    // (normally to <body>), with a document-root fallback.
    const tag = document.createElement('script');
    tag.dataset.zone = ZONE;
    tag.src = TAG_URL;
    tag.addEventListener('error', () => {
      window.dispatchEvent(new CustomEvent('bs:advertising-load-error', { detail: { zone: ZONE } }));
    }, { once: true });
    const target = [document.documentElement, document.body].filter(Boolean).pop();
    target?.appendChild(tag);
  };
  const removeBanner = () => document.getElementById('cookie-banner')?.remove();

  const showBanner = () => {
    if (document.getElementById('cookie-banner')) return;
    const preferences = storedPreferences() || { analytics: false, advertising: false };
    const banner = document.createElement('section');
    banner.id = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookies, analytics and advertising choices');
    banner.innerHTML = `
      <div>
        <strong>Cookies, analytics &amp; advertising</strong>
        <p>Essential site storage always works. With your permission, BiteSparks may load Google Analytics and third-party advertising.</p>
        <p><a href="privacy.html">Privacy Policy</a> · <a href="cookie-policy.html">Cookie Policy</a></p>
      </div>
      <div class="privacy-choice-actions">
        <button class="btn btn-outline" data-privacy-choice="declined" type="button">Reject optional</button>
        <button class="btn btn-dark" data-privacy-choice="accepted" type="button">Accept optional</button>
        <button class="privacy-manage-link" data-manage-choices type="button">Manage choices</button>
      </div>
      <div data-manage-panel hidden>
        <label><input type="checkbox" data-choice-analytics ${preferences.analytics ? 'checked' : ''}> Google Analytics</label>
        <label><input type="checkbox" data-choice-advertising ${preferences.advertising ? 'checked' : ''}> Third-party advertising</label>
        <button class="btn btn-dark" data-save-choices type="button">Save choices</button>
      </div>`;
    banner.style.cssText = 'position:fixed;bottom:16px;left:16px;right:16px;z-index:1000;background:var(--white);border:1px solid var(--line);border-radius:14px;padding:16px 18px;box-shadow:0 18px 50px rgba(35,30,22,.16);display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px 18px;font-size:12px';
    const managePanel = banner.querySelector('[data-manage-panel]');
    const apply = next => {
      const value = savePreferences(next);
      removeBanner();
      if (value.advertising) loadAdvertising();
    };
    banner.querySelector('[data-privacy-choice="accepted"]').addEventListener('click', () => apply({ analytics: true, advertising: true }));
    banner.querySelector('[data-privacy-choice="declined"]').addEventListener('click', () => apply({ analytics: false, advertising: false }));
    banner.querySelector('[data-manage-choices]').addEventListener('click', () => {
      managePanel.hidden = !managePanel.hidden;
    });
    banner.querySelector('[data-save-choices]').addEventListener('click', () => apply({
      analytics: banner.querySelector('[data-choice-analytics]').checked,
      advertising: banner.querySelector('[data-choice-advertising]').checked
    }));
    document.body.appendChild(banner);
  };

  const addPrivacyControl = () => {
    if (document.getElementById('privacy-choices-control')) return;
    const footer = document.querySelector('.site-footer .footer-bottom');
    if (!footer) return;
    const control = document.createElement('button');
    control.id = 'privacy-choices-control';
    control.type = 'button';
    control.textContent = 'Privacy choices';
    control.style.cssText = 'background:none;border:0;padding:0;color:inherit;font:inherit;text-decoration:underline;cursor:pointer';
    control.addEventListener('click', () => showBanner());
    footer.append(' · ', control);
  };

  const init = () => {
    if (advertisingAllowed()) loadAdvertising();
    if (!storedPreferences()) showBanner();
    addPrivacyControl();
  };

  window.BiteSparksPrivacy = { showChoices: showBanner, loadAdvertising };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
