(() => {
  const nativeFetch = window.fetch.bind(window);
  const batches = {
    '/data/recipes.json': ['data/recipes-batch-01.json', 'data/recipes-batch-02.json', 'data/recipes-batch-03.json', 'data/recipes-batch-04.json', 'data/recipes-batch-05.json', 'data/recipes-batch-06.json', 'data/recipes-batch-07.json', 'data/recipes-batch-08.json', 'data/recipes-batch-09.json'],
    '/data/videos.json': ['data/videos-batch-01.json', 'data/videos-batch-02.json', 'data/videos-batch-03.json', 'data/videos-batch-04.json', 'data/videos-batch-05.json', 'data/videos-batch-06.json', 'data/videos-batch-07.json', 'data/videos-batch-08.json', 'data/videos-batch-09.json']
  };
  const cache = new Map();
  const imageCredits = {
    'taco-soup': { text: 'Photo by Collin Harvey, CC BY 2.0', url: 'https://commons.wikimedia.org/wiki/File:Taco_soup.jpg' },
    'beef-barley-soup': { text: 'Photo by jeffreyw, CC BY 2.0', url: 'https://commons.wikimedia.org/wiki/File:Beef_barley_soup_(15439896429).jpg' }
  };
  const publishedBatchCategories = {
    'honey-glazed-chicken-breast': 'Chicken', 'classic-family-meatloaf': 'Dinner', 'baked-mac-and-cheese': 'Dinner', 'easy-lasagna': 'Dinner', 'air-fryer-chicken-wings': 'Chicken', 'golden-baked-pork-chops': 'Dinner', 'old-fashioned-beef-stew': 'Dinner', 'ground-beef-tacos': 'Dinner', 'spaghetti-and-meatballs': 'Dinner', 'fluffy-buttermilk-pancakes': 'Breakfast', 'classic-banana-bread': 'Breakfast', 'easy-sugar-cookies': 'Dessert', 'awesome-slow-cooker-pot-roast': 'Dinner', 'classic-chicken-pot-pie': 'Dinner', 'southern-fried-chicken': 'Chicken', 'buffalo-chicken-dip': 'Appetizer', 'chicken-alfredo': 'Pasta', 'chicken-parmesan': 'Chicken', 'chicken-enchiladas': 'Dinner', 'chicken-fajitas': 'Chicken', 'chicken-caesar-salad': 'Salad', 'chicken-noodle-soup': 'Soup', 'chicken-fried-rice': 'Dinner', 'classic-chocolate-chip-cookies': 'Dessert', 'chicken-and-rice-casserole': 'Dinner', 'chicken-bacon-ranch-casserole': 'Dinner', 'bbq-chicken': 'Chicken', 'chicken-fried-steak': 'Beef', 'chicken-and-dumplings': 'Dinner', 'chicken-marsala': 'Chicken', 'chicken-piccata': 'Chicken', 'chicken-parmesan-casserole': 'Dinner', 'creamy-tuscan-chicken': 'Chicken', 'marry-me-chicken': 'Chicken', 'classic-cheeseburger': 'Beef', 'smash-burgers': 'Beef', 'beef-stroganoff': 'Beef', 'classic-beef-chili': 'Beef', 'chili-mac': 'Beef', 'beef-enchiladas': 'Beef', 'beef-burritos': 'Beef', 'beef-fajitas': 'Beef', 'philly-cheesesteak': 'Beef', 'french-dip-sandwiches': 'Beef', 'sloppy-joes': 'Beef', 'salisbury-steak': 'Beef', 'salisbury-steak-meatballs': 'Beef', 'beef-and-broccoli': 'Beef', 'korean-beef-bowls': 'Beef', 'ground-beef-casserole': 'Beef', 'beef-nachos': 'Beef', 'beef-quesadillas': 'Beef', 'steak-bites': 'Beef', 'garlic-butter-steak': 'Beef', 'pulled-pork': 'Pork', 'bbq-ribs': 'Pork', 'baby-back-ribs': 'Pork', 'pork-tenderloin': 'Pork', 'pork-carnitas': 'Pork', 'pork-belly': 'Pork', 'pork-loin-roast': 'Pork', 'sausage-and-peppers': 'Pork', 'biscuits-and-gravy': 'Breakfast', 'ham-and-cheese-casserole': 'Pork',
    'french-toast': 'Breakfast', 'cinnamon-french-toast': 'Breakfast', 'breakfast-burritos': 'Breakfast', 'breakfast-casserole': 'Breakfast', 'sausage-breakfast-casserole': 'Breakfast', 'eggs-benedict': 'Breakfast', 'hash-browns': 'Breakfast', 'home-fries': 'Breakfast', 'breakfast-tacos': 'Breakfast',
    'tomato-soup': 'Soup', 'creamy-tomato-soup': 'Soup', 'potato-soup': 'Soup', 'broccoli-cheddar-soup': 'Soup', 'clam-chowder': 'Soup', 'chicken-tortilla-soup': 'Soup', 'taco-soup': 'Soup', 'french-onion-soup': 'Soup', 'beef-barley-soup': 'Soup', 'split-pea-soup': 'Soup'
  };
  const categoryOverrides = { 'Greek Yogurt Berry Parfait': 'Dessert' };
  const batchImageOverrides = {
    'easy-lasagna': 'https://images.unsplash.com/photo-1709429790175-b02bb1b19207?auto=format&fit=crop&w=1200&q=82', 'spaghetti-and-meatballs': 'https://images.unsplash.com/photo-1714383611462-f730359f9145?auto=format&fit=crop&w=1200&q=82', 'awesome-slow-cooker-pot-roast': 'https://images.unsplash.com/photo-1603185730021-ddc0c8097059?auto=format&fit=crop&w=1200&q=82', 'classic-chicken-pot-pie': 'https://images.unsplash.com/photo-1650917331384-1fd06afa3230?auto=format&fit=crop&w=1200&q=82', 'beef-enchiladas': 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Gfp-enchiladas.jpg', 'sloppy-joes': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Sloppy_joe_sandwiches.jpg/1280px-Sloppy_joe_sandwiches.jpg', 'salisbury-steak': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Salisbury_steak.jpg/1280px-Salisbury_steak.jpg', 'salisbury-steak-meatballs': 'https://images.unsplash.com/photo-1632071773782-f68ef6109422?auto=format&fit=crop&fm=webp&w=1200&q=78', 'beef-and-broccoli': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Beef_and_broccoli_stir_fry.jpg/1280px-Beef_and_broccoli_stir_fry.jpg', 'korean-beef-bowls': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Korean_Beef_Bulgogi_Rice_Bowl_%2834817154336%29.jpg/1280px-Korean_Beef_Bulgogi_Rice_Bowl_%2834817154336%29.jpg', 'ground-beef-casserole': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Sauteed_beef_and_mushroom_casserole.jpg/1280px-Sauteed_beef_and_mushroom_casserole.jpg', 'beef-nachos': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Beef_Nachos_02.jpg/1280px-Beef_Nachos_02.jpg', 'beef-quesadillas': 'https://images.unsplash.com/photo-1673990349292-ed2dfa7988c9?auto=format&fit=crop&fm=webp&w=1200&q=78', 'steak-bites': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Beef_steak_slices_on_a_platter_with_sauce.JPG/1280px-Beef_steak_slices_on_a_platter_with_sauce.JPG', 'garlic-butter-steak': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Beef_steak_with_garlic_butter.jpg/1280px-Beef_steak_with_garlic_butter.jpg', 'breakfast-casserole': 'assets/images/recipes/breakfast-casserole.webp', 'sausage-breakfast-casserole': 'assets/images/recipes/sausage-breakfast-casserole.webp', 'breakfast-tacos': 'https://images.unsplash.com/photo-1632370339733-759652742546?auto=format&fit=crop&fm=webp&w=1200&q=78'
  };
  const applyCategoryOverride = recipe => { const category = categoryOverrides[recipe.title]; return category ? { ...recipe, category } : recipe; };
  const normalizeTitle = value => String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ');
  const normalizeImage = value => String(value || '').trim().split(/[?#]/)[0].toLowerCase();
  const enforcePublishedUniqueness = recipes => {
    const ids = new Set(), titles = new Set(), images = new Set();
    return recipes.map(recipe => {
      if (recipe.status !== 'published') return recipe;
      const id = String(recipe.id || '').trim().toLowerCase(), title = normalizeTitle(recipe.title), image = normalizeImage(recipe.image);
      const duplicate = (id && ids.has(id)) || (title && titles.has(title)) || (image && images.has(image));
      if (duplicate) { console.error('[BiteSparks] Duplicate published recipe blocked:', recipe.id || recipe.title); return { ...recipe, status: 'draft' }; }
      if (id) ids.add(id); if (title) titles.add(title); if (image) images.add(image); return recipe;
    });
  };
  const renderImageCredit = () => {
    if (!location.pathname.endsWith('/recipe.html') || document.querySelector('.image-credit')) return;
    const id = new URLSearchParams(location.search).get('id');
    const credit = imageCredits[id];
    const frame = document.querySelector('#recipe-detail .detail-image-frame');
    if (!credit || !frame) return;
    const note = document.createElement('p'); note.className = 'image-credit'; note.append('Image: ');
    const link = document.createElement('a'); link.href = credit.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = credit.text;
    note.appendChild(link); frame.insertAdjacentElement('afterend', note);
  };
  new MutationObserver(renderImageCredit).observe(document.documentElement, { childList: true, subtree: true });
  setInterval(renderImageCredit, 500);
  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input?.url || ''; let resolvedUrl = url;
    try { resolvedUrl = new URL(url, window.location.href).href; } catch {}
    const key = Object.keys(batches).find(k => resolvedUrl.includes(k)); if (!key) return nativeFetch(input, init);
    if (!cache.has(key)) {
      cache.set(key, Promise.all([nativeFetch(input, init).then(r => r.json()), ...batches[key].map(path => nativeFetch(path).then(r => r.ok ? r.json() : (key.includes('videos') ? {} : [])).catch(() => key.includes('videos') ? {} : []))]).then(([base, ...extras]) => {
        if (key.includes('videos')) return Object.assign({}, base, ...extras);
        const correctedBase = base.map(applyCategoryOverride);
        const publishedExtra = extras.flat().map(recipe => { const category = publishedBatchCategories[recipe.id]; if (!category) return applyCategoryOverride(recipe); const image = batchImageOverrides[recipe.id] || recipe.image; return { ...recipe, status: 'published', category, image }; });
        return enforcePublishedUniqueness([...correctedBase, ...publishedExtra]);
      }));
    }
    const data = await cache.get(key); return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
})();
