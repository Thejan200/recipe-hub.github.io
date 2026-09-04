(function(){
  const year=document.getElementById('year');
  if(year)year.textContent=new Date().getFullYear();

  const button=document.querySelector('.menu-toggle');
  const nav=document.querySelector('.main-nav');
  if(nav){
    const recipesLink=Array.from(nav.querySelectorAll('a')).find(a=>/^(Recipes|All Recipes)$/i.test(a.textContent.trim()));
    if(recipesLink){
      recipesLink.textContent='All Recipes';
      recipesLink.href='recipes.html';
      if(!nav.querySelector('[data-nav-categories]')){
        const categories=document.createElement('a');
        categories.href='category.html?category=All%20Recipes';
        categories.textContent='Categories';
        categories.setAttribute('data-nav-categories','');
        recipesLink.insertAdjacentElement('afterend',categories);
      }
    }
  }
  if(button&&nav){
    button.type='button';
    if(!nav.id)nav.id='site-navigation';
    button.setAttribute('aria-controls',nav.id);
    button.setAttribute('aria-expanded','false');
    const setOpen=open=>{
      nav.classList.toggle('menu-open',open);
      button.setAttribute('aria-expanded',String(open));
      button.setAttribute('aria-label',open?'Close menu':'Open menu');
      if(open){
        nav.style.display='flex';nav.style.position='absolute';nav.style.top='68px';nav.style.left='0';nav.style.right='0';nav.style.padding='20px';nav.style.background='var(--white)';nav.style.flexDirection='column';nav.style.borderBottom='1px solid var(--line)';
      }else{
        nav.style.display='none';['position','top','left','right','padding','background','flex-direction','border-bottom'].forEach(p=>nav.style.removeProperty(p));
      }
    };
    if(!button.dataset.rhMenuBound){
      button.dataset.rhMenuBound='1';
      button.addEventListener('click',()=>setOpen(button.getAttribute('aria-expanded')!=='true'));
      nav.addEventListener('click',e=>{if(e.target.closest('a')&&window.matchMedia('(max-width: 850px)').matches)setOpen(false)});
      document.addEventListener('keydown',e=>{if(e.key==='Escape'&&button.getAttribute('aria-expanded')==='true'){setOpen(false);button.focus()}});
      document.addEventListener('click',e=>{if(button.getAttribute('aria-expanded')==='true'&&!nav.contains(e.target)&&!button.contains(e.target)&&window.matchMedia('(max-width: 850px)').matches)setOpen(false)});
      window.addEventListener('resize',()=>{if(!window.matchMedia('(max-width: 850px)').matches&&button.getAttribute('aria-expanded')==='true')setOpen(false)});
    }
  }

  let choice='';
  try{choice=localStorage.getItem('rh-cookie-choice')||''}catch{}
  if(!choice){
    const b=document.createElement('div');b.id='cookie-banner';b.setAttribute('role','dialog');b.setAttribute('aria-modal','false');b.setAttribute('aria-label','Cookie and privacy notice');
    b.innerHTML='<div><strong>Cookies & privacy</strong><p>Recipe Hub uses essential browser storage for saved recipes. Analytics and advertising will only be added with an appropriate consent setup.</p></div><div><button class="btn btn-outline" id="cookie-decline" type="button">Decline</button><button class="btn btn-dark" id="cookie-accept" type="button">Accept</button></div>';
    b.style='position:fixed;bottom:16px;left:16px;right:16px;z-index:50;background:var(--white);border:1px solid var(--line);border-radius:14px;padding:16px 18px;box-shadow:0 18px 50px rgba(35,30,22,.16);display:flex;justify-content:space-between;align-items:center;gap:18px;font-size:12px';
    document.body.appendChild(b);const choose=v=>{try{localStorage.setItem('rh-cookie-choice',v)}catch{}b.remove()};
    document.getElementById('cookie-accept').onclick=()=>choose('accepted');document.getElementById('cookie-decline').onclick=()=>choose('declined');
  }

  const header=document.querySelector('.nav-wrap');
  if(header&&!header.querySelector('.theme-toggle')){
    const themeButton=document.createElement('button');themeButton.type='button';themeButton.className='theme-toggle';themeButton.title='Switch theme';
    const current=()=>document.documentElement.getAttribute('data-theme')==='dark';
    const sync=()=>{const dark=current();themeButton.innerHTML=`<span class="theme-icon" aria-hidden="true">${dark?'☀':'☾'}</span><span class="sr-only">${dark?'Switch to light mode':'Switch to dark mode'}</span>`;themeButton.setAttribute('aria-label',dark?'Switch to light mode':'Switch to dark mode')};
    let saved='';try{saved=localStorage.getItem('rh-theme')||''}catch{}
    const preferred=saved==='dark'||saved==='light'?saved:(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
    document.documentElement.setAttribute('data-theme',preferred);
    const savedLink=header.querySelector('.saved-link');if(savedLink)savedLink.before(themeButton);else header.appendChild(themeButton);
    themeButton.onclick=()=>{const next=current()?'light':'dark';document.documentElement.setAttribute('data-theme',next);try{localStorage.setItem('rh-theme',next)}catch{}sync()};sync();
  }
})();