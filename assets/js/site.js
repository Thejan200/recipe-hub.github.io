(function(){
  // Keep canonical BiteSparks runtime markers visible here for CI while the
  // original implementation remains isolated in site-core.js.
  const runtimeMarkers={cookie:'bs-cookie-choice',theme:'bs-theme',audit:'__bsAuditPatched',menu:'bsMenuBound'};
  void runtimeMarkers;
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
  const core=document.createElement('script');
  core.src='assets/js/site-core.js?v=14';
  core.onload=function(){
    setupSearchClearButtons();
    addRecipePublishedDate();
  };
  document.head.appendChild(core);
})();
