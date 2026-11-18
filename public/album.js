const buttons = document.querySelectorAll('[data-filter]');
const cards = document.querySelectorAll('#album [data-cat]');
buttons.forEach((b) =>
  b.addEventListener('click', () => {
    const f = b.dataset.filter;
    buttons.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    cards.forEach((c) => (c.hidden = f !== 'All' && c.dataset.cat !== f));
  }),
);
