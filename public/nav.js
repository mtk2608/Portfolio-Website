// Scroll-spy: mark the nav link for the section currently in view (landing page only).
const links = [...document.querySelectorAll('nav[aria-label=Main] a[data-section]')];
const sections = links.map((a) => document.getElementById(a.dataset.section)).filter(Boolean);
if (sections.length && 'IntersectionObserver' in window) {
  const set = (id) =>
    links.forEach((a) => (a.dataset.section === id ? a.setAttribute('aria-current', 'location') : a.removeAttribute('aria-current')));
  const io = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) set(visible.target.id);
    },
    { rootMargin: '-40% 0px -50% 0px', threshold: [0, 0.1, 0.5, 1] },
  );
  sections.forEach((s) => io.observe(s));
  // Clear the highlight when back at the hero (above the first section).
  addEventListener('scroll', () => { if (scrollY < sections[0].offsetTop - innerHeight * 0.6) set(''); }, { passive: true });
}
