(function(){
  const BRAND='BiteSparks';
  const LEGACY='Recipe Hub';
  const replaceBrand=value=>typeof value==='string'?value.split(LEGACY).join(BRAND):value;
  function normalizeBrandUi(){
    document.title=replaceBrand(document.title);
    document.querySelectorAll('meta[name="description"],meta[property="og:site_name"],meta[property="og:title"],meta[property="og:description"],meta[name="twitter:title"],meta[name="twitter:description"]').forEach(meta=>{
      const content=meta.getAttribute('content')||'';
      const next=replaceBrand(content);
      if(next!==content)meta.setAttribute('content',next);
    });
    document.querySelectorAll('.brand').forEach(link=>{
      const mark=link.querySelector('.brand-mark');
      if(mark&&mark.textContent.trim()==='RH')mark.textContent='BS';
      const markText=mark?.textContent||'';
      const full=link.textContent.replace(markText,'').replace(/\s+/g,'').trim();
      if(full==='RecipeHub'){
        Array.from(link.childNodes).forEach(node=>{if(node!==mark)node.remove()});
        const word=document.createElement('span');word.append('Bite');const accent=document.createElement('span');accent.textContent='Sparks';word.appendChild(accent);link.appendChild(word);
      }
    });
    const banner=document.getElementById('cookie-banner');
    if(banner){const p=banner.querySelector('p');if(p)p.textContent=replaceBrand(p.textContent)}
  }
  function wrap(name){
    const original=window[name];
    if(typeof original!=='function'||original.__biteSparksBrandWrapped)return;
    const wrapped=function(...args){const result=original.apply(this,args);normalizeBrandUi();return result};
    wrapped.__biteSparksBrandWrapped=true;
    window[name]=wrapped;
  }
  ['renderCategory','renderRecipe','setupConsent'].forEach(wrap);
  normalizeBrandUi();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',normalizeBrandUi,{once:true});
})();
