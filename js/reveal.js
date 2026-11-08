/* Reveal blocks and language bars when they enter the viewport */
(() => {
const { $, $$, inView } = window.LR;

/* reveal */
$$('.rv').forEach(el => inView(el, () => el.classList.add('on'), .9));
inView($('#lang'), () => $('#lang').classList.add('on'));
})();
