(() => {
  const nativeFetch = window.fetch.bind(window);
  const extraBatch = 'data/recipes-batch-01.json';
  let mergedPromise;
  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input?.url || '';
    if (!url.includes('/data/recipes.json')) return nativeFetch(input, init);
    if (!mergedPromise) {
      mergedPromise = Promise.all([
        nativeFetch(input, init).then(r => r.json()),
        nativeFetch(extraBatch).then(r => r.ok ? r.json() : []).catch(() => [])
      ]).then(([base, extra]) => [...base, ...extra]);
    }
    const data = await mergedPromise;
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  };
})();
