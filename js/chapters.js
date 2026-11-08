/* Pinned scroll chapters: progress p (0→1) drives the car, PCB, SQL and soft-skills animations */
(() => {
const { reduce, $, $$, esc } = window.LR;

/* ---------- scroll chapters: each pinned stage is scrubbed by scroll progress p (0→1) ---------- */
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (p, a, b) => clamp((p - a) / (b - a));
const ease = t => 1 - Math.pow(1 - t, 3);
const U = {};

/* Formula Student car */
const cells = $('#cells');
for (let i = 0; i < 8; i++) cells.insertAdjacentHTML('beforeend', `<rect x="${272 + i * 17}" y="248" width="13" height="34" rx="3" fill="#0F2A22" stroke="#34D399" stroke-width="1.2"/>`);
const cellEls = [...cells.children], carSvg = $('.car-svg'), wires = $$('.wire:not(.flow)');
U.car = p => {
  const k = ease(seg(p, 0, .34)), x = -1000 + 1000 * k;
  $('#car').setAttribute('transform', `translate(${x} 0)`);
  const a = (x + 1000) * 1.25;
  $('#w1').setAttribute('transform', `rotate(${a} 210 298)`); $('#w2').setAttribute('transform', `rotate(${a} 616 298)`);
  $('#lanes').setAttribute('transform', `translate(${-((x + 1000) * 2.2 % 200)} 0)`);
  $('#speed').setAttribute('opacity', (1 - seg(p, .2, .34)) * .7);
  $('#speed').setAttribute('transform', `translate(${x * .3} 0)`);
  const xr = seg(p, .36, .5);
  $('#shell').setAttribute('opacity', 1 - .78 * xr); $('#xray').setAttribute('opacity', xr);
  const n = Math.round(seg(p, .42, .6) * 8); cellEls.forEach((c, i) => c.setAttribute('fill', i < n ? '#34D399' : '#0F2A22'));
  wires.forEach((w, i) => w.style.strokeDashoffset = 1 - seg(p, .48 + i * .03, .62 + i * .03));
  carSvg.classList.toggle('live', p > .66);
  $('#hud').setAttribute('opacity', seg(p, .68, .78));
  $('#wave1').style.strokeDashoffset = 1 - seg(p, .7, .92); $('#wave2').style.strokeDashoffset = 1 - seg(p, .76, .97);
};

/* PCB */
const pcb = $('#pcb'), traces = $$('#traces path'), comps = $$('.comp');
U.pcb = p => {
  const t = ease(seg(p, 0, .32));
  pcb.style.transform = `rotateX(${(1 - t) * 58}deg) rotateZ(${(1 - t) * -16}deg) scale(${.8 + .2 * t})`;
  traces.forEach((tr, i) => tr.style.strokeDashoffset = 1 - seg(p, .2 + i * .022, .4 + i * .022));
  comps.forEach((c, i) => { const k = ease(seg(p, .42 + i * .035, .5 + i * .035)); c.style.opacity = k; c.setAttribute('transform', `translate(0 ${(1 - k) * -60})`); });
  const lit = p > .8; pcb.classList.toggle('lit', lit);
  $('#ledHalo').setAttribute('opacity', lit ? .9 : 0); $('#ledBody').setAttribute('fill', lit ? '#6EE7B7' : '#1E3A2F');
};

/* SQL → table → report */
const toks = [['SELECT','k'],[' client,\n       ',''],['COUNT','k'],['(*) ',''],['AS','k'],[' invoices,\n       ',''],['SUM','k'],['(total) ',''],['AS','k'],[' invoiced\n',''],['FROM','k'],[' sales_invoices\n',''],['WHERE','k'],[' year = ',''],['2025','n'],['\n',''],['GROUP BY','k'],[' client\n',''],['ORDER BY','k'],[' invoiced ',''],['DESC','k'],[';','']];
const total = toks.reduce((a, t) => a + t[0].length, 0), sqlEl = $('#sql');
const rows = [['Client A', 42, '18,400'], ['Client B', 35, '15,120'], ['Client C', 27, '11,900'], ['Client D', 19, '7,350'], ['Client E', 12, '4,080']];
const tb = $('#res tbody'); tb.innerHTML = rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('');
const trs = [...tb.children], barsBox = $('#chart .bars');
barsBox.innerHTML = [100, 82, 65, 40, 22].map(h => `<span style="--h:${h}%"></span>`).join('');
const bars = [...barsBox.children]; let lastN = -1;
U.code = p => {
  const n = Math.round(seg(p, .04, .36) * total);
  if (n !== lastN) { lastN = n; let left = n, out = '';
    for (const [t, c] of toks) { if (left <= 0) break; const s = esc(t.slice(0, left)); out += c ? `<span class="${c}">${s}</span>` : s; left -= t.length; }
    sqlEl.innerHTML = out + (n < total ? '<span class="caret"></span>' : ''); }
  $('#runBtn').classList.toggle('on', p > .38);
  const rn = Math.ceil(seg(p, .42, .66) * rows.length); trs.forEach((r, i) => r.classList.toggle('on', i < rn));
  bars.forEach((b, i) => b.style.transform = `scaleY(${ease(seg(p, .72 + i * .03, .86 + i * .03))})`);
};

/* soft skills words */
const wordsEl = $('#words'), keys = ['listen', 'clearly,', 'team', 'fast.'];
const used = new Set(); wordsEl.innerHTML = wordsEl.textContent.split(' ').map(w => { const k = keys.includes(w) && !used.has(w); if (k) used.add(w); return `<span${k ? ' class="key"' : ''}>${w}</span>`; }).join(' ');
const wsp = [...wordsEl.children], floaters = $$('.floaters span');
U.words = p => {
  const N = wsp.length; wsp.forEach((w, i) => w.style.opacity = .14 + .86 * seg(p, .1 + i / N * .7, .1 + (i + 1) / N * .7));
  floaters.forEach(f => f.style.transform = `translateY(${(p - .5) * -180 * +f.dataset.s}px)`);
};

const chs = $$('.chapter');
const runChapters = () => chs.forEach(el => {
  const r = el.getBoundingClientRect(); if (r.bottom < -100 || r.top > innerHeight + 100) return;
  const p = clamp(-r.top / (r.height - innerHeight)); el.style.setProperty('--p', p.toFixed(4)); U[el.dataset.ch](p, el);
  el.querySelectorAll('.beat').forEach(b => { const [a, c] = b.dataset.r.split(',').map(Number); b.classList.toggle('on', p >= a && p < c); });
});
if (reduce) chs.forEach(el => { U[el.dataset.ch](1, el); el.style.setProperty('--p', 1); });
else { let q = false; addEventListener('scroll', () => { if (!q) { q = true; requestAnimationFrame(() => { runChapters(); q = false; }); } }, { passive: true }); addEventListener('resize', runChapters); runChapters(); }
})();
