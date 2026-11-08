/* Project terminals type their example run when scrolled into view */
(() => {
const { reduce, $, $$, esc, inView } = window.LR;

/* terminals type when they come into view */
const cls = { cmd: '', q: '', y: 'c-y', m: 'c-m', o: '' };
$$('.typer').forEach(pre => {
  const lines = JSON.parse(pre.dataset.lines);
  const render = (n, partial) => lines.slice(0, n).map((l, i) => {
    const [pre_, body, k] = l; const txt = (i === n - 1 && partial != null) ? body.slice(0, partial) : body;
    const p = k === 'cmd' ? `<span class="c-p">leo@uoc</span>:<span class="c-a">~/tools</span>${esc(pre_)}` : k === 'o' ? `<span class="c-p">${esc(pre_)}</span>` : `<span class="c-m">${esc(pre_)}</span>`;
    return p + `<span class="${cls[k] || ''}">${esc(txt)}</span>`;
  }).join('\n');
  const end = '\n<span class="c-p">leo@uoc</span>:<span class="c-a">~/tools</span>$ <span class="caret"></span>';
  if (reduce) { pre.innerHTML = render(lines.length) + end; return; }
  pre.innerHTML = '<span class="caret"></span>';
  inView(pre, () => {
    let li = 0, ci = 0;
    const tick = () => {
      if (li >= lines.length) { pre.innerHTML = render(lines.length) + end; return; }
      const typed = lines[li][2] === 'cmd' || lines[li][2] === 'q';
      if (!typed) { li++; pre.innerHTML = render(li) + '<span class="caret"></span>'; return setTimeout(tick, 260); }
      ci++; pre.innerHTML = render(li + 1, ci) + '<span class="caret"></span>';
      if (ci >= lines[li][1].length) { li++; ci = 0; return setTimeout(tick, 380); }
      setTimeout(tick, 34 + Math.random() * 40);
    };
    setTimeout(tick, 300);
  }, .8);
});
})();
