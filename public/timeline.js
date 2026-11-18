// Native <dialog> handles focus trapping and Esc to close.
document.querySelectorAll('[data-open]').forEach((b) =>
  b.addEventListener('click', () => document.getElementById('role-' + b.dataset.open)?.showModal()),
);
document.querySelectorAll('dialog.role-dialog').forEach((d) => {
  d.querySelector('[data-close]')?.addEventListener('click', () => d.close());
  // click on the backdrop (outside the content box) closes it
  d.addEventListener('click', (e) => {
    const r = d.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) d.close();
  });
});
