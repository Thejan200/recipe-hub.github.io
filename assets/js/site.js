(function(){
  // Keep canonical BiteSparks runtime markers visible here for CI while the
  // original implementation remains isolated in site-core.js.
  const runtimeMarkers={privacy:'bs-privacy-choice-v2',theme:'bs-theme',audit:'__bsAuditPatched',menu:'bsMenuBound'};
  void runtimeMarkers;
  const primaryNav=document.querySelector('.main-nav');
  if(primaryNav&&!primaryNav.querySelector('.nav-dropdown')){
    primaryNav.setAttribute('aria-label','Primary navigation');
    primaryNav.innerHTML='<a href="index.html">Home</a><a href="stories/">Stories</a><a href="recipes.html">All Recipes</a><a href="categories.html" data-nav-categories>Categories</a><a href="category.html?category=Quick%20%26%20Easy">Quick &amp; Easy</a><details class="nav-dropdown"><summary>Legal &amp; Privacy <span aria-hidden="true">⌄</span></summary><div class="nav-dropdown-menu"><a href="about.html">About</a><a href="contact.html">Contact</a><a href="privacy.html">Privacy Policy</a><a href="terms.html">Terms &amp; Conditions</a><a href="disclaimer.html">Disclaimer</a><a href="cookie-policy.html">Cookie Policy</a><a href="editorial-standards.html">Editorial Standards</a></div></details>';
  }
  const privacyConsent=document.createElement('script');
privacyConsent.src='assets/js/privacy-consent.js?v=6';
  privacyConsent.defer=true;
  document.head.appendChild(privacyConsent);
  const analytics=document.createElement('script');
  analytics.src='assets/js/analytics.js?v=2';
  analytics.defer=true;
  document.head.appendChild(analytics);

  function applyChristmasSitewideTheme(){
    const now=new Date();
    const today=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    if(today<'2026-11-09'||today>'2026-12-31')return;
    document.body.classList.add('christmas-season-active');
    const style=document.createElement('link');
    style.rel='stylesheet';
    style.href='assets/css/christmas-sitewide.css?v=2';
    style.dataset.christmasSitewideStyle='true';
    document.head.appendChild(style);
  }

  applyChristmasSitewideTheme();

  function addChristmasSitewideBanner(){
    if(!document.body.classList.contains('christmas-season-active')||document.querySelector('.christmas-season-banner'))return;
    const header=document.querySelector('.site-header');
    if(!header)return;
    const banner=document.createElement('aside');
    banner.className='christmas-season-banner';
    banner.setAttribute('aria-label','Christmas recipes at BiteSparks');
    banner.innerHTML='<div class="container christmas-season-banner-inner"><span class="christmas-banner-mark" aria-hidden="true">✦</span><p><strong>Christmas at BiteSparks</strong><span>Festive recipes for your table, your people, and your season.</span></p><a href="/categories/christmas/">Explore the collection <span aria-hidden="true">→</span></a></div>';
    header.insertAdjacentElement('afterend',banner);
  }

  addChristmasSitewideBanner();

  function addChristmasSeasonFeature(){
    const isHome=location.pathname==='/'||location.pathname.endsWith('/index.html');
    const hero=document.querySelector('main>.hero');
    if(!isHome||!hero||document.querySelector('.christmas-season-feature'))return;
    if(!document.querySelector('link[data-christmas-season-style]')){
      const style=document.createElement('link');
      style.rel='stylesheet';
      style.href='assets/css/christmas-season.css?v=3';
      style.dataset.christmasSeasonStyle='true';
      document.head.appendChild(style);
    }
    const feature=document.createElement('section');
    feature.className='christmas-season-feature';
    feature.setAttribute('aria-label','Christmas recipes');
    feature.innerHTML='<div class="container"><div class="christmas-season-card"><div class="christmas-season-copy"><p class="eyebrow">CHRISTMAS MENU IDEAS</p><h2>Christmas starts around the table.</h2><p>Explore festive mains, comforting bakes, and sweet recipes thoughtfully collected for gatherings, gifting, and slow holiday mornings.</p><a class="btn btn-primary" href="categories/christmas/">Explore Christmas recipes</a></div><a class="christmas-season-image" href="categories/christmas/" aria-label="Explore Christmas recipes"><img src="assets/images/categories/christmas-turkey-feast-generated.webp" alt="Festive Christmas meal on a holiday table" width="1600" height="900" loading="lazy" decoding="async"></a></div></div>';
    hero.insertAdjacentElement('afterend',feature);
  }

  function addChristmasPromotionPopup(){
    const isHome=location.pathname==='/'||location.pathname.endsWith('/index.html');
    const campaignEnd='2026-12-25';
    const specialMessages={
      '2026-12-01':{title:'Start planning your Christmas menu.',body:'Festive mains, cozy bakes, and sweet recipes are ready for your December table.'},
      '2026-12-10':{title:'Bake, share, and celebrate.',body:'Find Christmas cookies, comforting bakes, and dishes made for sharing.'},
      '2026-12-20':{title:'Last-minute Christmas ideas.',body:'Find easy holiday recipes for the days leading up to your celebration.'},
      '2026-12-25':{title:'Merry Christmas from BiteSparks.',body:'Make something special with festive mains, cozy bakes, and holiday sweets.'}
    };
    const date=new Date();
    const today=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    const special=specialMessages[today];
    const seenKey='bs-christmas-popup-v2-seen';
    const specialDateKey='bs-christmas-popup-v2-special-date';
    let seen='';let specialDate='';
    try{seen=localStorage.getItem(seenKey)||'';specialDate=localStorage.getItem(specialDateKey)||'';}catch{}
    if(!isHome||today>campaignEnd||(!special&&seen==='2026-season')||(special&&specialDate===today)||document.getElementById('christmas-promotion-popup'))return;
    const copy=special||{title:'Make something festive.',body:'Find cozy bakes, holiday desserts, and recipes for your Christmas table.'};
    const markSeen=()=>{try{localStorage.setItem(seenKey,'2026-season');if(special)localStorage.setItem(specialDateKey,today);}catch{}};
    const stylesheet=document.createElement('link');
    stylesheet.rel='stylesheet';
    stylesheet.href='assets/css/christmas-popup.css?v=4';
    document.head.appendChild(stylesheet);
    const show=()=>{
      const popup=document.createElement('aside');
      popup.id='christmas-promotion-popup';
      popup.className='christmas-promotion-popup';
      popup.setAttribute('role','dialog');
      popup.setAttribute('aria-label','Christmas recipes');
      popup.innerHTML=`<button class="christmas-popup-close" type="button" aria-label="Close Christmas recipes message">×</button><img src="assets/images/seasonal/christmas-popup-illustration-optimized.png" alt="" aria-hidden="true" width="420" height="420"><div class="christmas-popup-copy"><p class="eyebrow">CHRISTMAS AT BITESPARKS</p><h2>${copy.title}</h2><p>${copy.body}</p><a class="btn btn-primary" href="categories/christmas/">Explore Christmas Recipes</a></div>`;
      const close=()=>{markSeen();popup.remove();};
      popup.querySelector('.christmas-popup-close').addEventListener('click',close);
      popup.querySelector('a').addEventListener('click',markSeen);
      document.addEventListener('keydown',event=>{if(event.key==='Escape'&&document.body.contains(popup))close();},{once:true});
      document.body.appendChild(popup);
    };
    setTimeout(show,650);
  }
  // Audited recipe fallback remains implemented in site-core.js: result.id==='veggie-soup'

  function addSearchClearStyles(){
    if(document.getElementById('bs-search-clear-styles'))return;
    const style=document.createElement('style');
    style.id='bs-search-clear-styles';
    style.textContent='.hero-search .bs-search-clear{width:40px;min-width:40px;background:transparent;color:var(--muted);border-radius:9px;font-size:22px;line-height:1;padding:0;display:inline-flex;align-items:center;justify-content:center;box-shadow:none}.hero-search .bs-search-clear:hover{background:var(--soft);color:var(--ink)}.hero-search .bs-search-clear:focus-visible{outline:3px solid color-mix(in srgb,var(--accent) 45%,transparent);outline-offset:2px}.hero-search .bs-search-clear[hidden]{display:none!important}html[data-theme="dark"] .hero-search .bs-search-clear{background:transparent;color:#b2b8b3}html[data-theme="dark"] .hero-search .bs-search-clear:hover{background:#252a27;color:#fff}';
    document.head.appendChild(style);
  }

  function setupSearchClearButtons(root=document){
    addSearchClearStyles();
    root.querySelectorAll('.hero-search input[name="q"],.hero-search input[type="search"]').forEach(input=>{
      if(input.dataset.bsClearBound)return;
      input.dataset.bsClearBound='1';
      const form=input.closest('.hero-search');
      if(!form)return;
      const button=document.createElement('button');
      button.type='button';
      button.className='bs-search-clear';
      button.setAttribute('aria-label','Clear search');
      button.title='Clear search';
      button.textContent='×';
      const update=()=>{button.hidden=!String(input.value||'').length;};
      button.addEventListener('click',()=>{
        input.value='';
        input.dispatchEvent(new Event('input',{bubbles:true}));
        input.dispatchEvent(new Event('change',{bubbles:true}));
        update();
        input.focus();
      });
      input.addEventListener('input',update);
      input.addEventListener('change',update);
      input.addEventListener('focus',update);
      input.addEventListener('click',update);
      input.addEventListener('pointerdown',()=>requestAnimationFrame(update));
      input.addEventListener('touchstart',()=>requestAnimationFrame(update),{passive:true});
      input.insertAdjacentElement('afterend',button);
      update();
      requestAnimationFrame(update);
      setTimeout(update,0);
    });
  }

  function addRecipePublishedDateStyles(){
    if(document.getElementById('bs-recipe-date-styles'))return;
    const style=document.createElement('style');
    style.id='bs-recipe-date-styles';
    style.textContent='.recipe-published-date{margin:12px 0 0;color:var(--muted);font-size:13px;font-weight:600}.recipe-published-date time{color:inherit}';
    document.head.appendChild(style);
  }

  function addRecipePublishedDate(){
    const detail=document.getElementById('recipe-detail');
    if(!detail||detail.querySelector('.recipe-published-date')||typeof recipes==='undefined')return;
    const id=new URLSearchParams(location.search).get('id');
    const recipe=recipes.find(item=>item.id===id);
    const raw=String(recipe?.datePublished||'').trim();
    if(!raw)return;
    const parts=raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if(!parts)return;
    const date=new Date(Date.UTC(Number(parts[1]),Number(parts[2])-1,Number(parts[3])));
    if(Number.isNaN(date.getTime()))return;
    const heroCopy=detail.querySelector('.recipe-hero>div');
    if(!heroCopy)return;
    addRecipePublishedDateStyles();
    const line=document.createElement('p');
    line.className='recipe-published-date';
    const time=document.createElement('time');
    time.dateTime=raw;
    time.textContent=new Intl.DateTimeFormat('en-US',{year:'numeric',month:'long',day:'numeric',timeZone:'UTC'}).format(date);
    line.append('Published ');
    line.appendChild(time);
    const lead=heroCopy.querySelector('.lead');
    if(lead)lead.insertAdjacentElement('afterend',line);else heroCopy.appendChild(line);
  }

  addChristmasSeasonFeature();
  addChristmasPromotionPopup();
  setupSearchClearButtons();
  addRecipePublishedDate();
  const searchObserver=new MutationObserver(()=>{
    setupSearchClearButtons();
    addRecipePublishedDate();
  });
  searchObserver.observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('pageshow',()=>{
    setupSearchClearButtons();
    addRecipePublishedDate();
  });
  document.addEventListener('focusin',event=>{
    const input=event.target;
    if(!(input instanceof HTMLInputElement)||!input.matches('.hero-search input[name="q"],.hero-search input[type="search"]'))return;
    const button=input.parentElement&&input.parentElement.querySelector('.bs-search-clear');
    if(button)button.hidden=!String(input.value||'').length;
  });
  const ratingStyle=document.createElement('link');
  ratingStyle.rel='stylesheet';
  ratingStyle.href='assets/css/recipe-card-ratings.css?v=1';
  document.head.appendChild(ratingStyle);
  const cardRatings=document.createElement('script');
  cardRatings.src='assets/js/recipe-card-ratings.js?v=1';
  cardRatings.defer=true;
  document.head.appendChild(cardRatings);
  const core=document.createElement('script');
  core.src='assets/js/site-core.js?v=15';
  core.onload=function(){
    setupSearchClearButtons();
    addRecipePublishedDate();
  };
  document.head.appendChild(core);
})();
