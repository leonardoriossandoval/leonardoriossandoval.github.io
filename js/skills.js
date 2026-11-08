/* Skills bento: border spotlight follows the pointer */
(() => {
const { $$ } = window.LR;

/* spotlight cards follow the pointer */
$$('.spot').forEach(c => c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px'); }));
})();
