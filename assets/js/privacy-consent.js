(() => {
  const CHOICE_KEY = 'bs-privacy-choice-v1';
  const ZONE = '12126317';
  const TAG_URL = 'https://nap5k.com/tag.min.js';

  const storedChoice = () => {
    try { return localStorage.getItem(CHOICE_KEY) || ''; } catch { return ''; }
  };
  const saveChoice = choice => {
    try { localStorage.setItem(CHOICE_KEY, choice); } catch {}
    window.dispatchEvent(new CustomEvent('bs:privacy-choice', { detail: { choice } }));
  };
  const loadAdvertising = () => {
    if (storedChoice() !== 'accepted' || document.querySelector(`script[data-zone="${ZONE}"]`)) return;
    const tag = document.createElement('script');
    tag.dataset.zone = ZONE;
    tag.src = TAG_URL;
    document.head.appendChild(tag);
  };
  const removeBanner = () => document.getElementById('cookie-banner')?.remove();

  const showBanner = () => {
    if (document.getElementById('cookie-banner')) return;
    const banner = document.createElement('section');
    banner.id = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Privacy choices');
    banner.innerHTML = '<div><strong>Privacy choices</strong><p>BiteSparks uses essential browser storage for saved recipes and preferences. With your permission, optional analytics and third-party advertising may be loaded. You can decline and still use every recipe.</p><p><a href="privacy.html">Privacy Policy</a> · <a href="cookie-policy.html">Cookie Policy</a></p></div><div><button class="btn btn-outline" data-privacy-choice="declined" type="button">Reject optional</button><button class="btn btn-dark" data-privacy-choice="accepted" type="button">Accept optional</button></div>';
    banner.style.cssText = 'position:fixed;bottom:16px;left:16px;right:16px;z-index:1000;background:var(--white);border:1px solid var(--line);border-radius:14px;padding:16px 18px;box-shadow:0 18px 50px rgba(35,30,22,.16);display:flex;justify-content:space-between;align-items:center;gap:18px;font-size:12px';
    banner.querySelectorAll('[data-privacy-choice]').forEach(button => button.addEventListener('click', () => {
      const previous = storedChoice();
      const choice = button.dataset.privacyChoice;
      saveChoice(choice);
      removeBanner();
      if (choice === 'accepted') loadAdvertising();
      if (choice === 'declined' && previous === 'accepted') window.location.reload();
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
    if (storedChoice() === 'accepted') loadAdvertising();
    else if (!storedChoice()) showBanner();
    addPrivacyControl();
  };

  window.BiteSparksPrivacy = { showChoices: showBanner, loadAdvertising };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
