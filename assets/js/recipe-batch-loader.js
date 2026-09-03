(() => {
  const nativeFetch = window.fetch.bind(window);
  const batches = {
    '/data/recipes.json': 'data/recipes-batch-01.json',
    '/data/videos.json': 'data/videos-batch-01.json'
  };
  const cache = new Map();
  const publishedBatchCategories = {
    'honey-glazed-chicken-breast': 'Chicken',
    'classic-family-meatloaf': 'Dinner',
    'baked-mac-and-cheese': 'Dinner',
    'easy-lasagna': 'Dinner',
    'air-fryer-chicken-wings': 'Chicken',
    'golden-baked-pork-chops': 'Dinner',
    'old-fashioned-beef-stew': 'Soup',
    'ground-beef-tacos': 'Dinner',
    'spaghetti-and-meatballs': 'Dinner',
    'fluffy-buttermilk-pancakes': 'Breakfast'
  };
  const batchImageOverrides = {
    'easy-lasagna': 'https://images.unsplash.com/photo-1709429790175-b02bb1b19207?auto=format&fit=crop&w=1200&q=82',
    'spaghetti-and-meatballs': 'https://images.unsplash.com/photo-1714383611462-f730359f9145?auto=format&fit=crop&w=1200&q=82'
  };

  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input?.url || '';
    const key = Object.keys(batches).find(k => url.includes(k));
    if (!key) return nativeFetch(input, init);

    if (!cache.has(key)) {
      cache.set(key, Promise.all([
        nativeFetch(input, init).then(r => r.json()),
        nativeFetch(batches[key]).then(r => r.ok ? r.json() : (key.includes('videos') ? {} : [])).catch(() => key.includes('videos') ? {} : [])
      ]).then(([base, extra]) => {
        if (key.includes('videos')) return { ...base, ...extra };

        const publishedExtra = extra.map(recipe => {
          const category = publishedBatchCategories[recipe.id];
          if (!category) return recipe;
          const image = batchImageOverrides[recipe.id] || recipe.image;
          return { ...recipe, status: 'published', category, image };
        });
        return [...base, ...publishedExtra];
      }));
    }

    const data = await cache.get(key);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  };
})();
