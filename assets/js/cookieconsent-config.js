import 'https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@3.2.1/dist/cookieconsent.umd.js';

const addPrivacyControl = () => {
  if (document.querySelector('[data-cc="show-preferencesModal"]')) return;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'cookie-settings-button';
  button.dataset.cc = 'show-preferencesModal';
  button.textContent = 'Cookie settings';
  document.body.append(button);
};

CookieConsent.run({
  mode: 'opt-in',
  revision: 1,
  manageScriptTags: true,
  autoClearCookies: true,
  respectGpc: true,
  cookie: {
    name: 'bitesparks_cookie_consent',
    expiresAfterDays: 182,
    sameSite: 'Lax'
  },
  guiOptions: {
    consentModal: { layout: 'cloud inline', position: 'bottom center', equalWeightButtons: true },
    preferencesModal: { layout: 'box', equalWeightButtons: true }
  },
  categories: {
    necessary: { enabled: true, readOnly: true },
    analytics: {},
    ads: {}
  },
  language: {
    default: 'en',
    translations: {
      en: {
        consentModal: {
          title: 'Your privacy matters',
          description: 'We use essential cookies to make BiteSparks work. With your permission, we may also use analytics and advertising technologies to improve the site and show relevant ads.',
          acceptAllBtn: 'Accept all',
          acceptNecessaryBtn: 'Reject all',
          showPreferencesBtn: 'Manage preferences',
          footer: '<a href="/cookie-policy.html">Cookie Policy</a><a href="/privacy.html">Privacy Policy</a>'
        },
        preferencesModal: {
          title: 'Cookie preferences',
          acceptAllBtn: 'Accept all',
          acceptNecessaryBtn: 'Reject all',
          savePreferencesBtn: 'Save preferences',
          closeIconLabel: 'Close',
          sections: [
            { title: 'Your privacy choices', description: 'Choose which optional technologies BiteSparks may use. You can change your choices at any time.' },
            { title: 'Strictly necessary', description: 'These are required for core site functions and cannot be switched off.', linkedCategory: 'necessary' },
            { title: 'Analytics', description: 'These help us understand how visitors use BiteSparks and improve recipes.', linkedCategory: 'analytics' },
            { title: 'Advertising', description: 'These may be used by advertising partners to show and measure relevant ads. Advertising technology remains off unless you allow it.', linkedCategory: 'ads' },
            { title: 'More information', description: 'Read our <a href="/cookie-policy.html">Cookie Policy</a> and <a href="/privacy.html">Privacy Policy</a>.' }
          ]
        }
      }
    }
  },
  onModalReady: addPrivacyControl
});
