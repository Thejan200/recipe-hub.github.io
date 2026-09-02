(function(){
  'use strict';
  const mq=window.matchMedia?window.matchMedia('(max-width: 850px)'):null;
  const mobile=()=>mq?mq.matches:window.innerWidth<=850;

  function enhanceMenu(){
    const nav=document.querySelector('.main-nav');
    const header=document.querySelector('.nav-wrap');
    if(!nav||!header)return;
    let button=header.querySelector('.menu-toggle');
    if(!button){
      button=document.createElement('button');
      button.className='menu-toggle';
      button.type='button';
      button.textContent='☰';
      header.insertBefore(button,nav);
    }
    button.type='button';
    if(!nav.id)nav.id='site-navigation';
    button.setAttribute('aria-controls',nav.id);
    if(!button.hasAttribute('aria-expanded'))button.setAttribute('aria-expanded','false');
    if(!button.hasAttribute('aria-label'))button.setAttribute('aria-label','Open menu');
    if(button.dataset.rhHardening==='1')return;
    button.dataset.rhHardening='1';
    const close=()=>{
      if(button.getAttribute('aria-expanded')!=='true')return;
      button.click();
      button.setAttribute('aria-expanded','false');
      button.setAttribute('aria-label','Open menu');
    };
    document.addEventListener('keydown',e=>{
      if(e.key==='Escape'&&button.getAttribute('aria-expanded')==='true'){
        close();
        button.focus();
      }
    });
    document.addEventListener('click',e=>{
      if(!mobile()||button.getAttribute('aria-expanded')!=='true')return;
      if(!nav.contains(e.target)&&!button.contains(e.target))close();
    });
    window.addEventListener('resize',()=>{if(!mobile()&&button.getAttribute('aria-expanded')==='true')close()});
  }

  function enhanceImages(){
    document.querySelectorAll('img').forEach(img=>{
      if(!img.hasAttribute('decoding'))img.decoding='async';
      if(!img.hasAttribute('width')||!img.hasAttribute('height')){
        const w=img.getAttribute('width'),h=img.getAttribute('height');
        if(!w||!h)img.style.aspectRatio=img.style.aspectRatio||'auto';
      }
      const inHero=!!img.closest('.hero-art,.recipe-hero');
      if(!inHero&&!img.hasAttribute('loading'))img.loading='lazy';
    });
  }

  function enhanceForms(){
    document.querySelectorAll('form').forEach(form=>{
      form.addEventListener('invalid',e=>{e.target.setAttribute('aria-invalid','true')},true);
      form.addEventListener('input',e=>{if(e.target.matches('input,textarea,select')&&e.target.checkValidity())e.target.removeAttribute('aria-invalid')},true);
    });
  }

  function enhanceExternalLinks(){
    document.querySelectorAll('a[target="_blank"]').forEach(a=>{
      const rel=new Set((a.getAttribute('rel')||'').split(/\s+/).filter(Boolean));
      rel.add('noopener');rel.add('noreferrer');a.setAttribute('rel',Array.from(rel).join(' '));
    });
  }

  function init(){enhanceMenu();enhanceImages();enhanceForms();enhanceExternalLinks()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();