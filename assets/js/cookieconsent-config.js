import 'https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@3.2.1/dist/cookieconsent.umd.js';

const adsterraSlotId = 'container-efbe94065ccd9bff712d56fa411179af';

const loadAdsterraNativeBanner = () => {
  if (!CookieConsent.acceptedCategory('ads') || document.getElementById(adsterraSlotId)) return;
  if (!/^\/recipes\/[^/]+\/?$/.test(window.location.pathname)) return;

  const relatedRecipes = document.querySelector('section.related');
  if (!relatedRecipes) return;

  const placement = document.createElement('section');
  placement.id = 'adsterra-native-placement';
  placement.className = 'section adsterra-native-placement';
  placement.setAttribute('aria-label', 'Sponsored recommendations');
  placement.innerHTML = '<p class="eyebrow">SPONSORED</p><div id="' + adsterraSlotId + '"></div>';
  relatedRecipes.before(placement);

  const adsterraTag = document.createElement('script');
  adsterraTag.id = 'adsterra-native-script';
  adsterraTag.async = true;
  adsterraTag.dataset.cfasync = 'false';
  adsterraTag.src = 'https://bauval.org/21/efbe94065ccd9bff712d56fa411179af';
  document.head.append(adsterraTag);
};

const removeAdsterraNativeBanner = () => {
  document.getElementById('adsterra-native-script')?.remove();
  document.getElementById('adsterra-native-placement')?.remove();
};

const loadAdsterraSocialBar = () => {
  if (!CookieConsent.acceptedCategory('ads') || document.getElementById('adsterra-social-bar-script')) return;

  const socialBarTag = document.createElement('script');
  socialBarTag.id = 'adsterra-social-bar-script';
  socialBarTag.dataset.cfasync = 'false';
  socialBarTag.src = 'https://bauval.org/14/d3619c39d8561616811b85987812d5ae';
  document.body.append(socialBarTag);
};

const removeAdsterraSocialBar = () => {
  document.getElementById('adsterra-social-bar-script')?.remove();
};

const adsterraDisplayBannerId = 'adsterra-300x250-placement';

const loadAdsterraDisplayBanner = () => {
  if (!CookieConsent.acceptedCategory('ads') || document.getElementById(adsterraDisplayBannerId)) return;
  if (!/^\/recipes\/[^/]+\/?$/.test(window.location.pathname)) return;

  const recipeLayout = document.querySelector('article.recipe-layout');
  if (!recipeLayout) return;

  const placement = document.createElement('section');
  placement.id = adsterraDisplayBannerId;
  placement.className = 'section adsterra-display-banner';
  placement.setAttribute('aria-label', 'Sponsored advertisement');
  placement.innerHTML = '<p class="eyebrow">SPONSORED</p>';
  recipeLayout.after(placement);

  window.atOptions = {
    key: '3c1d3488183269fd969b29cf99f596b6',
    format: 'iframe',
    height: 250,
    width: 300,
    params: {}
  };

  const bannerTag = document.createElement('script');
  bannerTag.id = 'adsterra-300x250-script';
  bannerTag.src = 'https://bauval.org/22/3c1d3488183269fd969b29cf99f596b6';
  bannerTag.async = false;
  placement.append(bannerTag);
};

const removeAdsterraDisplayBanner = () => {
  document.getElementById(adsterraDisplayBannerId)?.remove();
  document.getElementById('adsterra-300x250-script')?.remove();
};

const addPrivacyControl = () => {
  if (document.getElementById('cookie-settings-control')) return;

  const button = document.createElement('button');
  button.id = 'cookie-settings-control';
  button.type = 'button';
  button.className = 'cookie-settings-button';
  button.textContent = 'Cookie settings';
  button.setAttribute('aria-label', 'Manage cookie preferences');
  button.addEventListener('click', () => CookieConsent.showPreferences());

  const footer = document.querySelector('.site-footer .footer-bottom, footer .footer-bottom');
  if (footer) {
    footer.append(' · ', button);
    return;
  }

  document.body.append(button);
};

const addPrivacyControlStyles = () => {
  if (document.getElementById('cookie-settings-control-styles')) return;

  const style = document.createElement('style');
  style.id = 'cookie-settings-control-styles';
  style.textContent = `
    .cookie-settings-button {
      appearance: none;
      background: transparent;
      border: 0;
      color: inherit;
      cursor: pointer;
      font: inherit;
      padding: 0;
      text-decoration: underline;
      text-underline-offset: 0.16em;
    }

    .cookie-settings-button:hover {
      color: #f4d15d;
    }

    .cookie-settings-button:focus-visible {
      border-radius: 2px;
      outline: 2px solid currentColor;
      outline-offset: 3px;
    }
  `;
  document.head.append(style);
};

CookieConsent.run({
  mode: 'opt-in',
  revision: 5,
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
  onConsent: () => {
    loadAdsterraNativeBanner();
    loadAdsterraSocialBar();
    loadAdsterraDisplayBanner();
  },
  onChange: ({ changedCategories }) => {
    if (!changedCategories.includes('ads')) return;
    if (CookieConsent.acceptedCategory('ads')) {
      loadAdsterraNativeBanner();
      loadAdsterraSocialBar();
      loadAdsterraDisplayBanner();
    } else {
      removeAdsterraNativeBanner();
      removeAdsterraSocialBar();
      removeAdsterraDisplayBanner();
      window.location.reload();
    }
  },
  onModalReady: () => {
    addPrivacyControlStyles();
    addPrivacyControl();
  }
});
