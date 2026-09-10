(() => {
  const nativeFetch = window.fetch.bind(window);
  const batches = {
    '/data/recipes.json': ['data/recipes-batch-01.json', 'data/recipes-batch-02.json', 'data/recipes-batch-03.json', 'data/recipes-batch-04.json', 'data/recipes-batch-05.json', 'data/recipes-batch-06.json'],
    '/data/videos.json': ['data/videos-batch-01.json', 'data/videos-batch-02.json', 'data/videos-batch-03.json', 'data/videos-batch-04.json', 'data/videos-batch-05.json', 'data/videos-batch-06.json']
  };
  const cache = new Map();
  const publishedBatchCategories = {
    'honey-glazed-chicken-breast': 'Chicken',
    'classic-family-meatloaf': 'Dinner',
    'baked-mac-and-cheese': 'Dinner',
    'easy-lasagna': 'Dinner',
    'air-fryer-chicken-wings': 'Chicken',
    'golden-baked-pork-chops': 'Dinner',
    'old-fashioned-beef-stew': 'Dinner',
    'ground-beef-tacos': 'Dinner',
    'spaghetti-and-meatballs': 'Dinner',
    'fluffy-buttermilk-pancakes': 'Breakfast',
    'classic-banana-bread': 'Breakfast',
    'easy-sugar-cookies': 'Dessert',
    'awesome-slow-cooker-pot-roast': 'Dinner',
    'classic-chicken-pot-pie': 'Dinner',
    'southern-fried-chicken': 'Chicken',
    'buffalo-chicken-dip': 'Appetizer',
    'chicken-alfredo': 'Pasta',
    'chicken-parmesan': 'Chicken',
    'chicken-enchiladas': 'Dinner',
    'chicken-fajitas': 'Chicken',
    'chicken-caesar-salad': 'Salad',
    'chicken-noodle-soup': 'Soup',
    'chicken-fried-rice': 'Dinner',
    'classic-chocolate-chip-cookies': 'Dessert',
    'chicken-and-rice-casserole': 'Dinner',
    'chicken-bacon-ranch-casserole': 'Dinner',
    'bbq-chicken': 'Chicken',
    'chicken-fried-steak': 'Beef',
    'chicken-and-dumplings': 'Dinner',
    'chicken-marsala': 'Chicken',
    'chicken-piccata': 'Chicken',
    'chicken-parmesan-casserole': 'Dinner',
    'creamy-tuscan-chicken': 'Chicken',
    'marry-me-chicken': 'Chicken',
    'classic-cheeseburger': 'Beef',
    'smash-burgers': 'Beef',
    'beef-stroganoff': 'Beef',
    'classic-beef-chili': 'Beef',
    'chili-mac': 'Beef',
    'beef-enchiladas': 'Beef',
    'beef-burritos': 'Beef',
    'beef-fajitas': 'Beef',
    'philly-cheesesteak': 'Beef',
    'french-dip-sandwiches': 'Beef',
    'sloppy-joes': 'Beef',
    'salisbury-steak': 'Beef',
    'salisbury-steak-meatballs': 'Beef',
    'beef-and-broccoli': 'Beef',
    'korean-beef-bowls': 'Beef',
    'ground-beef-casserole': 'Beef',
    'beef-nachos': 'Beef',
    'beef-quesadillas': 'Beef',
    'steak-bites': 'Beef',
    'garlic-butter-steak': 'Beef'
  };
  const categoryOverrides = {
    'Greek Yogurt Berry Parfait': 'Dessert'
  };
  const batchImageOverrides = {
    'easy-lasagna': 'https://images.unsplash.com/photo-1709429790175-b02bb1b19207?auto=format&fit=crop&w=1200&q=82',
    'spaghetti-and-meatballs': 'https://images.unsplash.com/photo-1714383611462-f730359f9145?auto=format&fit=crop&w=1200&q=82',
    'awesome-slow-cooker-pot-roast': 'https://images.unsplash.com/photo-1603185730021-ddc0c8097059?auto=format&fit=crop&w=1200&q=82',
    'classic-chicken-pot-pie': 'https://images.unsplash.com/photo-1650917331384-1fd06afa3230?auto=format&fit=crop&w=1200&q=82',
    'beef-enchiladas': 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Gfp-enchiladas.jpg',
    'sloppy-joes': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Sloppy_joe_sandwiches.jpg/1280px-Sloppy_joe_sandwiches.jpg',
    'salisbury-steak': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Salisbury_steak.jpg/1280px-Salisbury_steak.jpg',
    'salisbury-steak-meatballs': 'https://images.unsplash.com/photo-1632071773782-f68ef6109422?auto=format&fit=crop&fm=webp&w=1200&q=78',
    'beef-and-broccoli': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Beef_and_broccoli_stir_fry.jpg/1280px-Beef_and_broccoli_stir_fry.jpg',
    'korean-beef-bowls': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Korean_Beef_Bulgogi_Rice_Bowl_%2834817154336%29.jpg/1280px-Korean_Beef_Bulgogi_Rice_Bowl_%2834817154336%29.jpg',
    'ground-beef-casserole': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Sauteed_beef_and_mushroom_casserole.jpg/1280px-Sauteed_beef_and_mushroom_casserole.jpg',
    'beef-nachos': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Beef_Nachos_02.jpg/1280px-Beef_Nachos_02.jpg',
    'beef-quesadillas': 'https://images.unsplash.com/photo-_BW-YmENFcM?auto=format&fit=crop&fm=webp&w=1200&q=78',
    'steak-bites': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Beef_steak_slices_on_a_platter_with_sauce.JPG/1280px-Beef_steak_slices_on_a_platter_with_sauce.JPG',
    'garlic-butter-steak': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Beef_steak_with_garlic_butter.jpg/1280px-Beef_steak_with_garlic_butter.jpg'
  };

  const applyCategoryOverride = recipe => {
    const category = categoryOverrides[recipe.title];
    return category ? { ...recipe, category } : recipe;
  };

  const normalizeTitle = value => String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ');
  const normalizeImage = value => String(value || '').trim().split(/[?#]/)[0].toLowerCase();

  const enforcePublishedUniqueness = recipes => {
    const ids = new Set();
    const titles = new Set();
    const images = new Set();

    return recipes.map(recipe => {
      if (recipe.status !== 'published') return recipe;

      const id = String(recipe.id || '').trim().toLowerCase();
      const title = normalizeTitle(recipe.title);
      const image = normalizeImage(recipe.image);
      const duplicate = (id && ids.has(id)) || (title && titles.has(title)) || (image && images.has(image));

      if (duplicate) {
        console.error('[BiteSparks] Duplicate published recipe blocked:', recipe.id || recipe.title);
        return { ...recipe, status: 'draft' };
      }

      if (id) ids.add(id);
      if (title) titles.add(title);
      if (image) images.add(image);
      return recipe;
    });
  };

  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input?.url || '';
    let resolvedUrl = url;
    try { resolvedUrl = new URL(url, window.location.href).href; } catch {}
    const key = Object.keys(batches).find(k => resolvedUrl.includes(k));
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
        return enforcePublishedUniqueness([...correctedBase, ...publishedExtra]);
      }));
    }

    const data = await cache.get(key);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  };
})();
