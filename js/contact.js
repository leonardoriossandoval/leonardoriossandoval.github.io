/* Contact: copy email to clipboard */
(() => {
const { $ } = window.LR;

/* copy email */
const copyBtn = $('#copyBtn');
copyBtn.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText('leonardorioslr@gmail.com'); copyBtn.querySelector('span').textContent = 'Copied ✓'; }
  catch { location.href = 'mailto:leonardorioslr@gmail.com'; }
  setTimeout(() => copyBtn.querySelector('span').textContent = 'Copy email', 2000);
});
})();
