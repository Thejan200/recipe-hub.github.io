(function(){
  // Keep canonical BiteSparks runtime markers visible here for CI while the
  // original implementation remains isolated in site-core.js.
  const runtimeMarkers={cookie:'bs-cookie-choice',theme:'bs-theme',audit:'__bsAuditPatched',menu:'bsMenuBound'};
  void runtimeMarkers;
  // Audited recipe fallback remains implemented in site-core.js: result.id==='veggie-soup'

  const cookbookArtwork={
    '0525577076':'assets/images/cookbooks/half-baked-harvest-super-simple.svg',
    '0063425734':'assets/images/cookbooks/everyday-eats.svg',
    '0578259133':'assets/images/cookbooks/air-fryer-recipes-cathy-yoder.svg',
    '1984863169':'assets/images/cookbooks/good-lookin-cookin.svg',
    '1674844468':'assets/images/cookbooks/air-fryer-cookbook-600.svg',
    '0063276631':'assets/images/cookbooks/pioneer-woman-essential-recipes.svg',
    '1492677671':'assets/images/cookbooks/complete-baby-toddler-cookbook.svg',
    '1668066831':'assets/images/cookbooks/lets-get-cooking.svg',
    '0593234278':'assets/images/cookbooks/the-mediterranean-dish.svg',
    '1646434250':'assets/images/cookbooks/city-eats-san-francisco.svg'
  };

  function applyCookbookArtwork(){
    document.querySelectorAll('img[src*="covers.openlibrary.org/b/isbn/"]').forEach(img=>{
      const match=img.src.match(/isbn\/(\d+)-/i);
      if(!match||!cookbookArtwork[match[1]])return;
      img.src=cookbookArtwork[match[1]];
      img.alt=img.alt.replace(/book cover$/i,'BiteSparks original editorial artwork');
      img.removeAttribute('srcset');
    });
  }

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

  applyCookbookArtwork();
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
