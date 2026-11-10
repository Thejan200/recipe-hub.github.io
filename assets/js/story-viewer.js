(() => {
  const stage = document.getElementById('story-viewer-stage');
  const hint = document.getElementById('story-viewer-hint');
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&lt;','<':'&gt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  let stories = [], storyIndex = 0, slideIndex = 0, pointer = null, wheelLocked = false, ignoreTapUntil = 0;
  const requestedId = () => new URLSearchParams(location.search).get('story');
  const updateUrl = () => history.replaceState({}, '', '?story=' + encodeURIComponent(stories[storyIndex].id));

  const render = ({storyDirection = '', slideDirection = ''} = {}) => {
    const story = stories[storyIndex], slide = story.slides[slideIndex];
    const progress = story.slides.map((_, index) => '<span class="' + (index === slideIndex ? 'is-active' : '') + '"></span>').join('');
    const recipe = slide.cta ? '<a class="story-viewer__recipe" href="../../recipes/' + encodeURIComponent(story.recipeId) + '/">' + esc(slide.cta) + '</a>' : '';
    const motion = storyDirection ? ' story-viewer-card--story-' + storyDirection : (slideDirection ? ' story-viewer-card--slide-' + slideDirection : '');
    stage.setAttribute('aria-busy', 'true');
    stage.innerHTML = '<article class="story-viewer-card' + motion + '" style="--story-poster:url(../../' + esc(story.poster) + ')"><div class="story-viewer__progress" aria-hidden="true">' + progress + '</div><div class="story-viewer__top"><span class="story-viewer__brand">BiteSparks</span><span class="story-viewer__count">Story ' + (storyIndex + 1) + ' of ' + stories.length + '</span></div><div class="story-viewer__story-name">' + esc(story.title) + '</div><div class="story-viewer__content"><p class="story-viewer__eyebrow">' + esc(slide.eyebrow) + '</p><h1>' + esc(slide.headline) + '</h1><p>' + esc(slide.body) + '</p>' + recipe + '</div><button class="story-viewer__tap story-viewer__tap--previous" type="button" aria-label="Previous slide"></button><button class="story-viewer__tap story-viewer__tap--next" type="button" aria-label="Next slide"></button></article>';
    stage.querySelector('.story-viewer__tap--previous').addEventListener('click', () => { if (performance.now() >= ignoreTapUntil) changeSlide(-1); });
    stage.querySelector('.story-viewer__tap--next').addEventListener('click', () => { if (performance.now() >= ignoreTapUntil) changeSlide(1); });
    requestAnimationFrame(() => stage.removeAttribute('aria-busy'));
  };

  const changeSlide = step => {
    const story = stories[storyIndex];
    const next = slideIndex + step;
    if (next < 0 || next >= story.slides.length) return;
    slideIndex = next;
    render({slideDirection: step > 0 ? 'next' : 'previous'});
  };

  const changeStory = step => {
    const next = storyIndex + step;
    if (next < 0 || next >= stories.length) return;
    storyIndex = next;
    slideIndex = 0;
    updateUrl();
    render({storyDirection: step > 0 ? 'next' : 'previous'});
  };

  const onPointerDown = event => {
    if (event.target.closest('a, .story-viewer__hint-dialog')) return;
    pointer = {x: event.clientX, y: event.clientY};
  };

  const onPointerUp = event => {
    if (!pointer) return;
    const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
    pointer = null;
    if (Math.abs(dy) > 44 && Math.abs(dy) > Math.abs(dx)) {
      ignoreTapUntil = performance.now() + 350;
      changeStory(dy < 0 ? 1 : -1);
    }
  };

  // Keep the hint dismissed for this tab's BiteSparks session. sessionStorage is
  // the primary store; window.name is a same-tab fallback when storage is unavailable.
  const hintSessionKey = 'bs-story-navigation-help-dismissed';
  const hintWindowMarker = '__bs_story_help_dismissed__';
  const hintWasDismissed = () => {
    try { if (sessionStorage.getItem(hintSessionKey) === '1') return true; } catch {}
    try { return window.name.includes(hintWindowMarker); } catch { return false; }
  };
  const dismissHint = () => {
    hint.hidden = true;
    try { sessionStorage.setItem(hintSessionKey, '1'); } catch {}
    try { if (!window.name.includes(hintWindowMarker)) window.name += hintWindowMarker; } catch {}
  };
  if (hintWasDismissed()) hint.hidden = true;
  hint?.querySelector('.story-viewer__hint-close')?.addEventListener('click', dismissHint);

  const init = async () => {
    try {
      const response = await fetch('../../data/web-stories.json', {cache: 'no-store'});
      if (!response.ok) throw new Error('Story data unavailable');
      const data = await response.json();
      stories = Array.isArray(data.stories) ? data.stories : [];
      if (!stories.length) throw new Error('No stories found');
      const found = stories.findIndex(story => story.id === requestedId());
      storyIndex = found >= 0 ? found : 0;
      render();
      document.addEventListener('pointerdown', onPointerDown);
      document.addEventListener('pointerup', onPointerUp);
      document.addEventListener('pointercancel', () => { pointer = null; });
      document.addEventListener('wheel', event => {
        if (wheelLocked || Math.abs(event.deltaY) < 24) return;
        event.preventDefault();
        wheelLocked = true;
        changeStory(event.deltaY > 0 ? 1 : -1);
        setTimeout(() => { wheelLocked = false; }, 520);
      }, {passive: false});
      document.addEventListener('keydown', event => {
        if (event.key === 'ArrowUp') changeStory(-1);
        else if (event.key === 'ArrowDown') changeStory(1);
        else if (event.key === 'ArrowLeft') changeSlide(-1);
        else if (event.key === 'ArrowRight') changeSlide(1);
        else if (event.key === 'Escape') location.href = '../';
      });
    } catch {
      stage.innerHTML = '<p class="story-viewer__loading">Stories are unavailable right now. <a href="../">Return to Stories</a></p>';
    }
  };
  init();
})();