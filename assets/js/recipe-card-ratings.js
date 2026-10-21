(() => {
  // Public browser configuration only. The RPC exposes aggregate summaries,
  // never voter identities or individual ratings.
  const SUPABASE_URL = 'https://bvdexkmfsdlcyqhjvvks.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_43sVfeQEkrFUZ9f0bILBAw_Fh7C9dWE';
  let queued = false;

  const formatCount = count => `${count} rating${count === 1 ? '' : 's'}`;

  const addSummary = (card, row) => {
    const count = Number(row?.rating_count || 0);
    const average = Number(row?.average_rating || 0);
    if (!count || !Number.isFinite(average)) return;

    const summary = document.createElement('span');
    summary.className = 'recipe-card-rating';
    summary.setAttribute('aria-label', `${average.toFixed(1)} out of 5 from ${formatCount(count)}`);
    summary.innerHTML = '<span class="recipe-card-rating__star" aria-hidden="true">★</span><span class="recipe-card-rating__value"></span><span class="recipe-card-rating__count"></span>';
    summary.querySelector('.recipe-card-rating__value').textContent = average.toFixed(1);
    summary.querySelector('.recipe-card-rating__count').textContent = `(${count})`;
    const category = card.querySelector('.eyebrow');
    if (category) category.insertAdjacentElement('afterend', summary);
    else card.querySelector('h3')?.insertAdjacentElement('beforebegin', summary);
  };

  const refresh = async () => {
    queued = false;
    const cards = [...document.querySelectorAll('[data-recipe-card]')]
      .filter(card => !card.dataset.ratingSummaryState);
    if (!cards.length) return;

    cards.forEach(card => { card.dataset.ratingSummaryState = 'loading'; });
    const slugs = [...new Set(cards.map(card => card.dataset.recipeCard).filter(Boolean))];
    if (!slugs.length) return;

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/recipe_rating_summaries`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ p_recipe_slugs: slugs })
      });
      if (!response.ok) throw new Error('Rating summaries unavailable');
      const rows = await response.json();
      const summaries = new Map((Array.isArray(rows) ? rows : []).map(row => [row.recipe_slug, row]));
      cards.forEach(card => {
        addSummary(card, summaries.get(card.dataset.recipeCard));
        card.dataset.ratingSummaryState = 'ready';
      });
    } catch {
      // A card remains clean when a summary cannot be loaded. Never display a
      // placeholder or invented rating.
      cards.forEach(card => { card.dataset.ratingSummaryState = 'unavailable'; });
    }
  };

  const schedule = () => {
    if (queued) return;
    queued = true;
    window.setTimeout(refresh, 0);
  };

  schedule();
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
})();
