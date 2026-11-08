/* Navigation: sticky header, scroll progress line, active link, mobile menu */
(() => {
const { $, $$ } = window.LR;

/* nav state, progress line, active link */
const nav = $('#nav'), bar = $('#progress'), links = $$('#menu a[href^="#"]:not(.btn)');
const secs = links.map(a => document.querySelector(a.getAttribute('href')));
const onScroll = () => {
  const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
  nav.classList.toggle('is-stuck', y > 10);
  bar.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
  let cur = -1; secs.forEach((s, i) => { if (s && s.getBoundingClientRect().top < innerHeight * .4) cur = i; });
  links.forEach((a, i) => a.classList.toggle('is-active', i === cur));
};
onScroll(); addEventListener('scroll', onScroll, { passive: true });

/* mobile menu */
const btn = $('#menuBtn');
const setMenu = o => { nav.classList.toggle('open', o); btn.setAttribute('aria-expanded', o); btn.setAttribute('aria-label', o ? 'Close menu' : 'Open menu'); document.body.style.overflow = o ? 'hidden' : ''; };
btn.addEventListener('click', () => setMenu(btn.getAttribute('aria-expanded') !== 'true'));
$$('#menu a').forEach(a => a.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
})();
