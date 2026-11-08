/* Hero background: animated node network, reacts to the pointer, pauses off-screen */
(() => {
const { reduce, $ } = window.LR;

/* hero network canvas: nodes and links, drifts slowly, pauses off-screen */
const cv = $('#net'), ctx = cv.getContext('2d');
let W, H, pts = [], running = true, dpr = Math.min(devicePixelRatio || 1, 2), mouse = { x: -999, y: -999 };
const size = () => { W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const n = Math.round(Math.min(90, W * H / 16000)); pts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25 })); };
const draw = () => {
  ctx.clearRect(0, 0, W, H);
  for (const p of pts) { if (!reduce) { p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1; } }
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
    const a = pts[i], b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
    if (d < 130) { ctx.strokeStyle = `rgba(96,165,250,${(1 - d / 130) * .22})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
  }
  for (const p of pts) { const near = Math.hypot(p.x - mouse.x, p.y - mouse.y) < 140; ctx.fillStyle = near ? 'rgba(34,211,238,.95)' : 'rgba(147,197,253,.5)'; ctx.beginPath(); ctx.arc(p.x, p.y, near ? 2.2 : 1.4, 0, 7); ctx.fill(); }
};
const loop = () => { if (running) draw(); if (!reduce) requestAnimationFrame(loop); };
size(); addEventListener('resize', size); loop();
const hero = $('#top');
hero.addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
hero.addEventListener('pointerleave', () => { mouse.x = mouse.y = -999; });
addEventListener('scroll', () => { running = hero.getBoundingClientRect().bottom > 0; }, { passive: true });
})();
