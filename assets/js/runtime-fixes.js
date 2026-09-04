(function(){
  if(typeof normalize==='function'){
    const baseNormalize=normalize;
    normalize=function(recipe){
      const normalized=baseNormalize(recipe);
      if(normalized.id==='veggie-soup'&&!normalized.datePublished)normalized.datePublished='2026-08-31';
      return normalized;
    };
  }

  if(typeof renderCollection==='function'){
    renderCollection=function(root,list,page=1){
      const pages=Math.max(1,Math.ceil(list.length/PAGE_SIZE));
      const current=Math.min(Math.max(1,Number(page)||1),pages);
      const items=list.slice((current-1)*PAGE_SIZE,current*PAGE_SIZE);
      root.innerHTML=items.length?items.map(card).join(''):'<div class="empty"><h2>No recipes found</h2><p>Try another keyword or clear your filters.</p><a class="btn btn-primary" href="recipes.html">View all recipes</a></div>';
      const pager=document.getElementById('pagination');
      if(!pager)return;
      pager.innerHTML='';
      if(pages<=1)return;
      pager.setAttribute('role','navigation');
      pager.setAttribute('aria-label','Recipe pages');
      const makeUrl=target=>{
        const params=new URLSearchParams(location.search);
        if(target<=1)params.delete('page');else params.set('page',String(target));
        const query=params.toString();
        return `${location.pathname}${query?'?'+query:''}`;
      };
      const addLink=(label,target,aria,extra='',rel='')=>{
        const link=document.createElement('a');
        link.className=`btn btn-outline ${extra}`.trim();
        link.href=makeUrl(target);
        link.setAttribute('aria-label',aria);
        if(rel)link.rel=rel;
        link.textContent=label;
        pager.appendChild(link);
      };
      const addPage=n=>{
        if(n===current){
          const active=document.createElement('span');
          active.className='btn btn-primary pagination-page is-current';
          active.setAttribute('aria-current','page');
          active.setAttribute('aria-label',`Page ${n}, current page`);
          active.textContent=String(n);
          pager.appendChild(active);
        }else addLink(String(n),n,`Go to recipes page ${n}`,'pagination-page');
      };
      const addEllipsis=()=>{
        const dots=document.createElement('span');
        dots.className='pagination-ellipsis';
        dots.setAttribute('aria-hidden','true');
        dots.textContent='…';
        pager.appendChild(dots);
      };
      if(current>1)addLink('← Previous',current-1,'Go to previous recipes page','pagination-prev','prev');
      let visible=[];
      if(pages<=9)visible=Array.from({length:pages},(_,i)=>i+1);
      else if(current<=5)visible=[1,2,3,4,5,6,pages];
      else if(current>=pages-4)visible=[1,pages-5,pages-4,pages-3,pages-2,pages-1,pages];
      else visible=[1,current-2,current-1,current,current+1,current+2,pages];
      visible.forEach((n,index)=>{if(index&&n-visible[index-1]>1)addEllipsis();addPage(n)});
      if(current<pages)addLink('Next →',current+1,'Go to next recipes page','pagination-next','next');
    };
  }

  if(typeof renderPage==='function'){
    const baseRenderPage=renderPage;
    renderPage=function(){
      baseRenderPage();
      const saved=document.getElementById('saved-results');
      if(saved){
        const page=Number(new URLSearchParams(location.search).get('page'))||1;
        renderCollection(saved,recipes.filter(recipe=>getSaved().includes(recipe.id)),page);
      }
    };
  }
})();
