(function(){
  function ensureCookbooksLink(){
    const nav=document.querySelector('.main-nav');
    if(!nav)return null;
    let link=Array.from(nav.querySelectorAll('a')).find(a=>a.getAttribute('href')==='cookbooks.html');
    if(!link){
      link=document.createElement('a');link.href='cookbooks.html';link.textContent='Cookbooks';
      const about=Array.from(nav.querySelectorAll('a')).find(a=>a.getAttribute('href')==='about.html');
      if(about)about.before(link);else nav.appendChild(link);
    }
    return link;
  }
  const cookbookLink=ensureCookbooksLink();
  const core=document.createElement('script');
  core.src='assets/js/site-core.js?v=11';
  core.onload=function(){
    const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();
    if(page==='cookbooks.html'||page.startsWith('book-')){
      const nav=document.querySelector('.main-nav');
      if(nav)nav.querySelectorAll('a').forEach(a=>{a.classList.remove('active');a.removeAttribute('aria-current')});
      const link=ensureCookbooksLink()||cookbookLink;
      if(link){link.classList.add('active');link.setAttribute('aria-current','page')}
    }
  };
  document.head.appendChild(core);
})();
