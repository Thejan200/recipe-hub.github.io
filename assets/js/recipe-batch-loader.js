(() => {
  const nativeFetch = window.fetch.bind(window);
  const batches = {
    '/data/recipes.json': ['data/recipes-batch-01.json', 'data/recipes-batch-02.json'],
    '/data/videos.json': ['data/videos-batch-01.json', 'data/videos-batch-02.json']
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
    'fluffy-buttermilk-pancakes': 'Breakfast',
    'classic-banana-bread': 'Breakfast',
    'easy-sugar-cookies': 'Dessert',
    'awesome-slow-cooker-pot-roast': 'Dinner',
    'classic-chicken-pot-pie': 'Dinner'
  };
  const categoryOverrides = {
    'Greek Yogurt Berry Parfait': 'Dessert'
  };
  const batchImageOverrides = {
    'easy-lasagna': 'https://images.unsplash.com/photo-1709429790175-b02bb1b19207?auto=format&fit=crop&w=1200&q=82',
    'spaghetti-and-meatballs': 'https://images.unsplash.com/photo-1714383611462-f730359f9145?auto=format&fit=crop&w=1200&q=82',
    'awesome-slow-cooker-pot-roast': 'https://images.unsplash.com/photo-1603185730021-ddc0c8097059?auto=format&fit=crop&w=1200&q=82'
  };

  const applyCategoryOverride = recipe => {
    const category = categoryOverrides[recipe.title];
    return category ? { ...recipe, category } : recipe;
  };

  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input?.url || '';
    const key = Object.keys(batches).find(k => url.includes(k));
    if (!key) return nativeFetch(input, init);

    if (!cache.has(key)) {
      cache.set(key, Promise.all([
        nativeFetch(input, init).then(r => r.json()),
        ...batches[key].map(path => nativeFetch(path).then(r => r.ok ? r.json() : (key.includes('videos') ? {} : [])).catch(() => key.includes('videos') ? {} : []))
      ]).then(([base, ...extras]) => {
        if (key.includes('videos')) return Object.assign({}, base, ...extras);

        const correctedBase = base.map(applyCategoryOverride);
        const publishedExtra = extras.flat().map(recipe => {
          const category = publishedBatchCategories[recipe.id];
          if (!category) return applyCategoryOverride(recipe);
          const image = batchImageOverrides[recipe.id] || recipe.image;
          return { ...recipe, status: 'published', category, image };
        });
        return [...correctedBase, ...publishedExtra];
      }));
    }

    const data = await cache.get(key);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  };
})();
