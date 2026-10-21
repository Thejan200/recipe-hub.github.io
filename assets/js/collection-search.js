(() => {
  const normalize = value => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const plural = count => `recipe${count === 1 ? '' : 's'}`;
  const distance = (left, right) => {
    if (left === right) return 0;
    let row = Array.from({ length: right.length + 1 }, (_, index) => index);
    for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
      const next = [leftIndex];
      for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
        next[rightIndex] = Math.min(next[rightIndex - 1] + 1, row[rightIndex] + 1, row[rightIndex - 1] + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1));
      }
      row = next;
    }
    return row[right.length];
  };
  const closeToken = (queryToken, candidateToken) => {
    if (candidateToken.startsWith(queryToken) || queryToken.startsWith(candidateToken)) return { score: 80, exact: false };
    const shortest = Math.min(queryToken.length, candidateToken.length);
    const limit = shortest >= 6 ? 2 : 1;
    const edits = shortest >= 4 ? distance(queryToken, candidateToken) : limit + 1;
    return edits <= limit ? { score: 70 - edits * 10, exact: false } : null;
  };
  const score = (query, text, title = '') => {
    const normalizedQuery = normalize(query);
    const normalizedText = normalize(text);
    const normalizedTitle = normalize(title);
    if (!normalizedQuery) return { score: 0, exact: true };
    if (normalizedTitle.includes(normalizedQuery)) return { score: 1000, exact: true };
    if (normalizedText.includes(normalizedQuery)) return { score: 700, exact: true };
    const candidates = [...new Set(normalizedText.split(' ').filter(Boolean))];
    const tokens = normalizedQuery.split(' ');
    let total = 0;
    for (const token of tokens) {
      const closest = candidates.map(candidate => closeToken(token, candidate)).filter(Boolean).sort((a, b) => b.score - a.score)[0];
      if (!closest) return null;
      total += closest.score;
    }
    return { score: total / tokens.length, exact: false };
  };
  window.BiteSparksFuzzy = { normalize, score };

  document.querySelectorAll('[data-collection-search]').forEach(collection => {
    const input = collection.querySelector('[data-collection-search-input]');
    const form = collection.querySelector('[data-collection-search-form]');
    const cards = [...collection.querySelectorAll('[data-recipe-search]')];
    const status = collection.querySelector('[data-collection-search-status]');
    const empty = collection.querySelector('[data-collection-search-empty]');
    const grid = collection.querySelector('.recipe-grid');
    if (!input || !status || !empty || !cards.length) return;
    const suggestion = document.createElement('p');
    suggestion.className = 'collection-search-suggestion';
    suggestion.hidden = true;
    status.insertAdjacentElement('afterend', suggestion);

    const update = () => {
      const query = input.value.trim();
      const ranked = cards.map(card => ({ card, title: card.querySelector('h3')?.textContent || '', match: score(query, card.dataset.recipeSearch, card.querySelector('h3')?.textContent || '') })).filter(item => item.match);
      ranked.sort((left, right) => right.match.score - left.match.score || left.title.localeCompare(right.title));
      cards.forEach(card => { card.hidden = Boolean(query); });
      ranked.forEach(({ card }) => { card.hidden = false; grid?.appendChild(card); });
      if (!query) cards.forEach(card => grid?.appendChild(card));
      empty.hidden = ranked.length !== 0;
      status.textContent = query ? `${ranked.length} matching ${plural(ranked.length)}` : `${cards.length} ${plural(cards.length)}`;
      const closest = ranked[0];
      suggestion.hidden = !query || !closest || closest.match.exact;
      suggestion.textContent = suggestion.hidden ? '' : `Did you mean: ${closest.title}?`;
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
