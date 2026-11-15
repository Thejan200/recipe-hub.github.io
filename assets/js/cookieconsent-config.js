import 'https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@3.2.1/dist/cookieconsent.umd.js';

const adsterraSlotId = 'container-efbe94065ccd9bff712d56fa411179af';

const consentHealth = window.BiteSparksConsentHealth || {
  state: 'checking',
  markReady() { if (this.state === 'checking') this.state = 'ready'; },
  disable() { this.state = 'blocked'; }
};
window.BiteSparksConsentHealth = consentHealth;

const adsConsentGranted = () => (
  consentHealth.state === 'ready' &&
  CookieConsent.acceptedCategory('ads')
);

const isRecipeDetailPage = () => /^\/recipes\/[^/]+\/?$/.test(window.location.pathname);
const isRecipeCollectionPage = () => (
  ['/', '/index.html', '/recipes/', '/recipes.html', '/category.html'].includes(window.location.pathname) ||
  /^\/categories\/[^/]+\/?$/.test(window.location.pathname)
);

const collectionAdAnchor = () => {
  if (window.location.pathname === '/') {
    return document.querySelector('#featured')?.closest('section') || null;
  }

  return document.querySelector('main .recipe-grid')?.closest('section') || null;
};

const loadAdsterraNativeBanner = () => {
  if (!adsConsentGranted() || document.getElementById(adsterraSlotId)) return;
  const relatedRecipes = document.querySelector('section.related');
  const collectionAnchor = isRecipeCollectionPage() ? collectionAdAnchor() : null;
  if (!isRecipeDetailPage() && !collectionAnchor) return;

  const placement = document.createElement('section');
  placement.id = 'adsterra-native-placement';
  placement.className = isRecipeDetailPage()
    ? 'section adsterra-native-placement'
    : 'adsterra-native-placement adsterra-native-placement--collection';
  placement.setAttribute('aria-label', 'Sponsored recommendations');
  placement.innerHTML = '<p class="eyebrow">SPONSORED</p><div id="' + adsterraSlotId + '"></div>';
  if (isRecipeDetailPage()) {
    if (!relatedRecipes) return;
    relatedRecipes.before(placement);
  } else {
    collectionAnchor.after(placement);
  }

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
  if (!adsConsentGranted() || document.getElementById('adsterra-social-bar-script')) return;

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

const loadAdsterraDisplayBanner = () => new Promise(resolve => {
  if (!adsConsentGranted() || document.getElementById(adsterraDisplayBannerId)) {
    resolve();
    return;
  }
  if (!isRecipeDetailPage()) {
    resolve();
    return;
  }

  const recipeLayout = document.querySelector('article.recipe-layout');
  if (!recipeLayout) {
    resolve();
    return;
  }

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
  bannerTag.addEventListener('load', resolve, { once: true });
  bannerTag.addEventListener('error', resolve, { once: true });
  placement.append(bannerTag);
});

const removeAdsterraDisplayBanner = () => {
  document.getElementById(adsterraDisplayBannerId)?.remove();
  document.getElementById('adsterra-300x250-script')?.remove();
};

const adsterraLeaderboardId = 'adsterra-728x90-placement';

const loadAdsterraLeaderboard = async () => {
  if (!adsConsentGranted() || document.getElementById(adsterraLeaderboardId)) return;
  if (!window.matchMedia('(min-width: 1024px)').matches) return;
  if (!isRecipeDetailPage()) return;

  await loadAdsterraDisplayBanner();

  const recipeHero = document.querySelector('section.recipe-hero');
  if (!recipeHero) return;

  const placement = document.createElement('section');
  placement.id = adsterraLeaderboardId;
  placement.className = 'section adsterra-leaderboard';
  placement.setAttribute('aria-label', 'Sponsored advertisement');
  placement.innerHTML = '<p class="eyebrow">SPONSORED</p>';
  recipeHero.after(placement);

  window.atOptions = {
    key: 'bac05364c58cdb5e1741a23ef2a8ba83',
    format: 'iframe',
    height: 90,
    width: 728,
    params: {}
  };

  const bannerTag = document.createElement('script');
  bannerTag.id = 'adsterra-728x90-script';
  bannerTag.src = 'https://bauval.org/22/bac05364c58cdb5e1741a23ef2a8ba83';
  bannerTag.async = false;
  placement.append(bannerTag);
};

const removeAdsterraLeaderboard = () => {
  document.getElementById(adsterraLeaderboardId)?.remove();
  document.getElementById('adsterra-728x90-script')?.remove();
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
    .adsterra-display-banner,
    .adsterra-leaderboard {
      align-items: center;
      display: flex;
      flex-direction: column;
      margin: 2rem auto;
      text-align: center;
      width: 100%;
    }

    .adsterra-display-banner > iframe,
    .adsterra-display-banner iframe,
    .adsterra-leaderboard > iframe,
    .adsterra-leaderboard iframe {
      display: block;
      margin-inline: auto !important;
      max-width: 100%;
    }

    .adsterra-display-banner > div,
    .adsterra-leaderboard > div {
      margin-inline: auto !important;
    }

    .adsterra-native-placement--collection {
      width: min(1160px, calc(100% - 40px));
      margin: 38px auto 54px;
      padding: 22px 0 0;
      border-top: 1px solid var(--line);
    }

    .adsterra-native-placement--collection .eyebrow {
      margin-bottom: 14px;
    }

    @media (max-width: 520px) {
      .adsterra-native-placement--collection {
        width: min(100% - 28px, 1160px);
        margin: 28px auto 42px;
      }
    }

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

// Ad placement styles must load for every visitor, including those with saved consent.
addPrivacyControlStyles();
// The footer is already in the document when this module runs, so the privacy
// control must not depend on a CookieConsent modal lifecycle callback.
addPrivacyControl();

// CookieConsent invokes onConsent while it initializes. Mark the local consent
// bridge ready first so a visitor's saved Advertising choice can load ads on the
// initial page view instead of requiring a manual preference change.
window.BiteSparksConsentHealth?.markReady();

CookieConsent.run({
  mode: 'opt-in',
  revision: 6,
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
    queueMicrotask(async () => {
      loadAdsterraNativeBanner();
      loadAdsterraSocialBar();
      await loadAdsterraDisplayBanner();
      await loadAdsterraLeaderboard();
    });
  },
  onChange: ({ changedCategories }) => {
    if (!changedCategories.includes('ads')) return;
    queueMicrotask(async () => {
      if (adsConsentGranted()) {
        loadAdsterraNativeBanner();
        loadAdsterraSocialBar();
        await loadAdsterraDisplayBanner();
        await loadAdsterraLeaderboard();
      } else {
        removeAdsterraNativeBanner();
        removeAdsterraSocialBar();
        removeAdsterraDisplayBanner();
        removeAdsterraLeaderboard();
        window.location.reload();
      }
    });
  },
  onModalReady: () => {
    addPrivacyControlStyles();
    addPrivacyControl();
  }
});
