/* Studies dashboard: UOC roadmap, filters, progress ring and counters */
(() => {
const { reduce, $, $$, inView } = window.LR;

/* studies roadmap — d passed, p in progress, t to go */
const plan = [
 ['Year 1', [['Semester 1', [['Àlgebra','d'],['Lògica','d'],['Fonaments de programació','d'],['Fonaments de computadors','d'],['Competència comunicativa TIC','d']]],
             ['Semester 2', [['Anàlisi matemàtica','d'],['Pràctiques de programació','d'],['Treball en equip a la xarxa','d'],['Idioma modern I: anglès','t'],['Interacció persona ordinador','d']]]]],
 ['Year 2', [['Semester 3', [['Estadística','p'],['Enginyeria de programari','d'],['Disseny i programació OO','d'],['Fonaments físics de la informàtica','t'],["Administració i gestió d'organitzacions",'d']]],
             ['Semester 4', [['Grafs i complexitat','d'],['Ús de bases de dades','d'],['Disseny de bases de dades','d'],['Estructura de computadors','d'],['Idioma modern II: anglès','t']]]]],
 ['Year 3', [['Semester 5', [['Sistemes operatius','p'],['Xarxes i aplicacions Internet','p'],['Administració de xarxes i SO','p'],['Gestió de projectes','d'],['Intel·ligència artificial','p']]],
             ['Semester 6', [['Sistemes distribuïts','t'],['Optativa','t'],['Optativa','t'],['Optativa','t']]]]],
 ['Year 4', [['Semester 7', [['Iniciativa emprenedora','d'],['Pràctiques en empresa','d',12],['Optativa','t'],['Optativa','t',12]]],
             ['Semester 8', [['Treball final de grau','t',12],['Optativa','t'],['Optativa','t',12]]]]]
];
const C = { d: 'done', p: 'doing', t: 'todo' }, L = { d: 'passed', p: 'in progress', t: 'to go' };
const rm = $('#roadmap');
rm.innerHTML = plan.map(([y, sems]) => {
  const all = sems.flatMap(s => s[1]), sum = k => all.filter(x => x[1] === k).reduce((a, x) => a + (x[2] || 6), 0), tot = all.reduce((a, x) => a + (x[2] || 6), 0);
  return `<div class="year"><h3>${y}<span>${sum('d')}/${tot} cr</span></h3><div class="ybar" aria-hidden="true"><span style="width:${sum('d')/tot*100}%;background:var(--green)"></span><span style="width:${sum('p')/tot*100}%;background:var(--amber)"></span></div>` +
    sems.map(([s, list]) => `<div class="sem"><p class="sem__t">${s}</p>${list.map(([n, st, c]) => `<p class="subj ${C[st]}"><i aria-hidden="true"></i>${n}<span class="sr"> — ${L[st]}</span><em>${c || 6}</em></p>`).join('')}</div>`).join('') + '</div>';
}).join('');
$$('#filters button').forEach(b => b.addEventListener('click', () => {
  const on = b.getAttribute('aria-pressed') !== 'true';
  $$('#filters button').forEach(x => x.setAttribute('aria-pressed', 'false'));
  rm.className = 'roadmap';
  if (on) { b.setAttribute('aria-pressed', 'true'); rm.classList.add('filtered', 'f-' + b.dataset.f); }
}));

/* studies moment: ring fills and numbers count once */
const circ = 2 * Math.PI * 50, ringA = $('#ringA'), ringB = $('#ringB');
const fillRing = () => { ringA.style.strokeDasharray = `${circ * .5} ${circ}`; ringB.style.strokeDasharray = `${circ * .625} ${circ}`; };
const countUp = (el, to, ms = 1400) => { const t0 = performance.now(); const f = t => { const k = Math.min(1, (t - t0) / ms); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); };
if (reduce) fillRing();
else {
  $$('.cnt').forEach(e => e.textContent = '0'); $('#pct').textContent = '0';
  inView($('#app'), () => { fillRing(); countUp($('#pct'), 50); $$('.cnt').forEach(e => countUp(e, +e.dataset.to)); }, .75);
}
})();
