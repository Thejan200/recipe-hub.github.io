(() => {
  const stage = document.getElementById('story-viewer-stage');
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  let stories = [], storyIndex = 0, slideIndex = 0, pointer = null, wheelLocked = false;
  const requestedId = () => new URLSearchParams(location.search).get('story');
  const updateUrl = () => history.replaceState({}, '', '?story=' + encodeURIComponent(stories[storyIndex].id));
  const render = () => {
    const story = stories[storyIndex], slide = story.slides[slideIndex];
    const progress = story.slides.map((_, index) => '<span class="' + (index === slideIndex ? 'is-active' : '') + '"></span>').join('');
    const recipe = slide.cta ? '<a class="story-viewer__recipe" href="../../recipes/' + encodeURIComponent(story.recipeId) + '/">' + esc(slide.cta) + '</a>' : '';
    stage.innerHTML = '<article class="story-viewer-card" style="--story-poster:url(../../' + esc(story.poster) + ')"><div class="story-viewer__progress" aria-hidden="true">' + progress + '</div><div class="story-viewer__top"><span class="story-viewer__brand">BiteSparks</span><span class="story-viewer__count">Story ' + (storyIndex + 1) + ' of ' + stories.length + ' · ' + (slideIndex + 1) + ' of ' + story.slides.length + '</span></div><div class="story-viewer__content"><p class="story-viewer__eyebrow">' + esc(slide.eyebrow) + '</p><h1>' + esc(slide.headline) + '</h1><p>' + esc(slide.body) + '</p>' + recipe + '</div><button class="story-viewer__tap story-viewer__tap--previous" type="button" aria-label="Previous slide"></button><button class="story-viewer__tap story-viewer__tap--next" type="button" aria-label="Next slide"></button></article>';
    stage.querySelector('.story-viewer__tap--previous').addEventListener('click', () => changeSlide(-1));
    stage.querySelector('.story-viewer__tap--next').addEventListener('click', () => changeSlide(1));
  };
  const changeSlide = step => { const story = stories[storyIndex]; slideIndex = Math.max(0, Math.min(story.slides.length - 1, slideIndex + step)); render(); };
  const changeStory = step => { const next = storyIndex + step; if (next < 0 || next >= stories.length) return; storyIndex = next; slideIndex = 0; updateUrl(); render(); };
  const onPointerDown = event => { pointer = {x:event.clientX,y:event.clientY}; };
  const onPointerUp = event => { if (!pointer) return; const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y; pointer = null; if (Math.abs(dy) > 56 && Math.abs(dy) > Math.abs(dx)) changeStory(dy < 0 ? 1 : -1); };
  const init = async () => {
    try {
      const response = await fetch('../../data/web-stories.json', {cache:'no-store'});
      if (!response.ok) throw new Error('Story data unavailable');
      const data = await response.json(); stories = Array.isArray(data.stories) ? data.stories : [];
      if (!stories.length) throw new Error('No stories found');
      const requested = requestedId(); const found = stories.findIndex(story => story.id === requested);
      storyIndex = found >= 0 ? found : 0; render();
      stage.addEventListener('pointerdown', onPointerDown); stage.addEventListener('pointerup', onPointerUp);
      document.addEventListener('wheel', event => { if (wheelLocked || Math.abs(event.deltaY) < 28) return; wheelLocked = true; changeStory(event.deltaY > 0 ? 1 : -1); setTimeout(() => { wheelLocked = false; }, 520); }, {passive:true});
      document.addEventListener('keydown', event => { if (event.key === 'ArrowUp') changeStory(-1); else if (event.key === 'ArrowDown') changeStory(1); else if (event.key === 'ArrowLeft') changeSlide(-1); else if (event.key === 'ArrowRight') changeSlide(1); else if (event.key === 'Escape') location.href = '../'; });
    } catch { stage.innerHTML = '<p class="story-viewer__loading">Stories are unavailable right now. <a href="../">Return to Stories</a></p>'; }
  };
  init();
})();