(() => {
  const nativeFetch = window.fetch.bind(window);
  const batches = {
    '/data/recipes.json': 'data/recipes-batch-01.json',
    '/data/videos.json': 'data/videos-batch-01.json'
  };
  const cache = new Map();
  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input?.url || '';
    const key = Object.keys(batches).find(k => url.includes(k));
    if (!key) return nativeFetch(input, init);
    if (!cache.has(key)) {
      cache.set(key, Promise.all([
        nativeFetch(input, init).then(r => r.json()),
        nativeFetch(batches[key]).then(r => r.ok ? r.json() : (key.includes('videos') ? {} : [])).catch(() => key.includes('videos') ? {} : [])
      ]).then(([base, extra]) => key.includes('videos') ? ({ ...base, ...extra }) : [...base, ...extra]));
    }
    const data = await cache.get(key);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  };
})();
