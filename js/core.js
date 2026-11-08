/* Shared helpers for every module (loaded first) */
window.LR = (() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const esc = t => t.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

  /* once-only "in view" helper (scroll based, robust everywhere) */
  const watchers = [];
  const inView = (el, fn, at = .85) => { if (el) watchers.push({ el, fn, at, done: false }); };
  const check = () => watchers.forEach(w => {
    if (w.done) return;
    const r = w.el.getBoundingClientRect();
    if (r.top < innerHeight * w.at && r.bottom > 0) { w.done = true; w.fn(); }
  });
  return { reduce, $, $$, esc, inView, check };
})();
