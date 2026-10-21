(() => {
  const normalize = value => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const plural = count => `recipe${count === 1 ? '' : 's'}`;

  document.querySelectorAll('[data-collection-search]').forEach(collection => {
    const input = collection.querySelector('[data-collection-search-input]');
    const form = collection.querySelector('[data-collection-search-form]');
    const cards = [...collection.querySelectorAll('[data-recipe-search]')];
    const status = collection.querySelector('[data-collection-search-status]');
    const empty = collection.querySelector('[data-collection-search-empty]');
    if (!input || !status || !empty || !cards.length) return;

    const update = () => {
      const query = normalize(input.value);
      let matches = 0;
      cards.forEach(card => {
        const visible = !query || normalize(card.dataset.recipeSearch).includes(query);
        card.hidden = !visible;
        if (visible) matches += 1;
      });
      empty.hidden = matches !== 0;
      status.textContent = query ? `${matches} matching ${plural(matches)}` : `${cards.length} ${plural(cards.length)}`;
    };

    form?.addEventListener('submit', event => event.preventDefault());
    input.addEventListener('input', update);
    input.addEventListener('keydown', event => {
      if (event.key === 'Escape' && input.value) {
        input.value = '';
        update();
      }
    });
  });
})();
