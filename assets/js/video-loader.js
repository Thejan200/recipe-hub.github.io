(function(){
  const nativeFetch=window.fetch.bind(window);
  window.fetch=async function(input,init){
    const requestUrl=typeof input==='string'?input:(input&&input.url)||'';
    const response=await nativeFetch(input,init);
    if(!/data\/recipes\.json(?:[?#]|$)/.test(requestUrl)) return response;
    try{
      const catalog=await response.clone().json();
      const videoResponse=await nativeFetch(new URL('data/videos.json',location.href).href,{cache:'no-store'});
      if(!videoResponse.ok) return response;
      const videos=await videoResponse.json();
      if(!videos||typeof videos!=='object') return response;
      const merged=Array.isArray(catalog)?catalog.map(recipe=>{
        if(recipe.video) return recipe;
        const video=videos[recipe.id];
        return video&&video.language==='en'?{...recipe,video}:recipe;
      }):catalog;
      return new Response(JSON.stringify(merged),{status:response.status,statusText:response.statusText,headers:{'Content-Type':'application/json'}});
    }catch(error){
      console.warn('Recipe video metadata could not be merged:',error);
      return response;
    }
  };

  function placeRecipeAuthor(){
    const card=document.getElementById('recipe-card');
    if(!card) return;
    const recipeBox=card.querySelector('.recipe-box');
    if(!recipeBox) return;
    let author=card.querySelector('.recipe-author');
    if(!author){
      author=document.createElement('p');
      author.className='recipe-author';
      author.textContent='Author: Thejan Mahakumbura';
    }
    if(author.parentNode===recipeBox&&recipeBox.lastElementChild===author) return;
    recipeBox.appendChild(author);
  }

  function watchRecipeAuthor(){
    const root=document.getElementById('recipe-detail');
    if(!root) return;
    placeRecipeAuthor();
    new MutationObserver(placeRecipeAuthor).observe(root,{childList:true,subtree:true});
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',watchRecipeAuthor,{once:true});
  }else{
    watchRecipeAuthor();
  }
})();
