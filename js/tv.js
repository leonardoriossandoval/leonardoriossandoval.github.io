/* Banc de retroil·luminació: model i moviment. Generat per tools/tv/build.mjs — edita-ho allà. */
(() => {
const P = {"origin":[350,199.09627502359237],"scale":1.3271591400913207,"azimuth":52,"elevation":30};
const MODEL = {"cols":18,"rows":10,"strips":12,"moonR":0.11};
const TX = -50, TW = 136, TD = 77, TOP = 10;
const CENTERS = [-114,0,114];
const root = document.querySelector(".tv-stage");
if (!root) return;
const fig = root.closest(".iso-figure");
const readout = fig.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const LET = ["A", "B", "C"];
const surf = Object.fromEntries(LET.map((l) => [l, root.querySelector('[data-tray="' + l + '"]')]));
const moons = Object.fromEntries(LET.map((l) => [l, root.querySelector('[data-moon="' + l + '"]')]));
const strips = [...surf.B.querySelectorAll(".tv-zone")];
const zones = [...surf.C.querySelectorAll(".tv-zone")];
const area = (cy) => ({ x: TX + 2.4, y: cy - TD / 2 + 2.4, w: TW - 4.8, d: TD - 4.8 });
const aspect = (TW - 4.8) / (TD - 4.8);   // amplada/alçada de la imatge (≈ 16:9)

// la lluna en coordenades d'imatge (u esquerra→dreta, v dalt→baix)
const s = { u: 0.3, v: 0.35 };
const want = { u: 0.3, v: 0.35 };
let mode = "tour", idle = 0, frame = 0, last = 0, visible = false, t0 = 0;

const R = MODEL.moonR;                    // en fracció de l'alçada
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
function lightOf() {
  const ru = R / aspect, rv = R;          // radi en u i en v
  // B: una franja s'encén si la lluna hi cau; la vora de la lluna fa encendre a mitges la veïna (halo)
  const sb = [];
  for (let i = 0; i < MODEL.strips; i++) {
    const c = (i + 0.5) / MODEL.strips, half = 0.5 / MODEL.strips;
    const gap = Math.max(0, Math.abs(s.u - c) - half - ru);
    sb.push(gap <= 0 ? 1 : clamp(1 - gap / (half * 0.6), 0, 1) * 0.5);
  }
  // C: cada zona s'encén segons la distància al cercle (amb una cua suau d'una zona)
  const zc = [];
  const zu = 1 / MODEL.cols, zv = 1 / MODEL.rows;
  for (let r = 0; r < MODEL.rows; r++) for (let c = 0; c < MODEL.cols; c++) {
    const du = Math.max(0, Math.abs(s.u - (c + 0.5) * zu) - zu / 2) / ru;
    const dv = Math.max(0, Math.abs(s.v - (r + 0.5) * zv) - zv / 2) / rv;
    const d = Math.hypot(du, dv);         // 0..1 = la zona toca la lluna
    zc.push(d <= 1 ? 1 : clamp(1 - (d - 1) * 1.6, 0, 1) * 0.45);
  }
  return { sb, zc };
}
function moonPath(cy) {
  const a = area(cy);
  const x = a.x + a.w * s.u, y = a.y + a.d * s.v;
  const r = a.d * R;
  return onTop(circleRing(x, y, r, 36), TOP + 0.05, P, true);
}
function draw() {
  const { sb, zc } = lightOf();
  strips.forEach((el, i) => { const o = (sb[i] * 0.85).toFixed(2); if (el.style.opacity !== o) el.style.opacity = o; });
  zones.forEach((el, i) => { const o = (zc[i] * 0.85).toFixed(2); if (el.style.opacity !== o) el.style.opacity = o; });
  LET.forEach((l, i) => moons[l].setAttribute("d", moonPath(CENTERS[i])));
  // llum fora de la lluna: àrea encesa ponderada menys l'àrea de la lluna, sobre la resta de la pantalla
  const moonA = Math.PI * (R / aspect) * R;
  const out = (lit) => Math.max(0, Math.min(1, (lit - moonA) / (1 - moonA)));
  const bLit = sb.reduce((a, b) => a + b, 0) / MODEL.strips;
  const cLit = zc.reduce((a, b) => a + b, 0) / zc.length;
  const pct = (x) => Math.round(x * 100) + "%";
  const text = "llum fora de la lluna · A 100% · B " + pct(out(bLit)) + " · C " + pct(out(cLit));
  if (readout.textContent !== text) readout.textContent = text;
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  if (mode === "tour") {
    t0 += dt;
    want.u = 0.5 + 0.36 * Math.sin(t0 * 0.37);
    want.v = 0.48 + 0.3 * Math.sin(t0 * 0.61 + 1.2);
  }
  const ease = (v, t, sec) => still.matches ? t : v + (t - v) * (1 - Math.exp(-dt / sec));
  s.u = ease(s.u, want.u, 0.18); s.v = ease(s.v, want.v, 0.18);
  draw();
  const settled = Math.abs(s.u - want.u) < 0.0005 && Math.abs(s.v - want.v) < 0.0005;
  frame = visible && !(still.matches || (mode !== "tour" && settled)) ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
const takeOver = () => { mode = "user"; clearTimeout(idle); idle = setTimeout(() => { mode = "tour"; run(); }, 3500); };

// el punter es projecta sobre el pla de la safata més propera: cerquem u, v invertint la projecció del pla z = TOP
function pick(e) {
  const box = root.querySelector("svg").getBoundingClientRect();
  const vb = root.querySelector("svg").viewBox.baseVal;
  const sx = vb.x + (e.clientX - box.left) / box.width * vb.width, sy = vb.y + (e.clientY - box.top) / box.height * vb.height;
  // dos eixos del pla en pantalla
  const o = iso([0, 0, TOP], P), ex = iso([1, 0, TOP], P), ey = iso([0, 1, TOP], P);
  const ax = [ex[0] - o[0], ex[1] - o[1]], ay = [ey[0] - o[0], ey[1] - o[1]];
  const det = ax[0] * ay[1] - ax[1] * ay[0];
  const dx = sx - o[0], dy = sy - o[1];
  const wx = (dx * ay[1] - dy * ay[0]) / det, wy = (ax[0] * dy - ax[1] * dx) / det;
  let best = null;
  CENTERS.forEach((cy) => {
    const a = area(cy);
    const u = (wx - a.x) / a.w, v = (wy - a.y) / a.d;
    const off = Math.max(0, -u, u - 1, -v, v - 1);
    if (!best || off < best.off) best = { u, v, off };
  });
  return best;
}
root.addEventListener("pointermove", (e) => {
  const b = pick(e);
  if (!b || b.off > 0.6) return;
  takeOver();
  want.u = clamp(b.u, 0.05, 0.95); want.v = clamp(b.v, 0.08, 0.92);
  run();
});
root.addEventListener("keydown", (e) => {
  const step = 0.06, m = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
  if (!m) return;
  e.preventDefault(); takeOver();
  want.u = clamp(want.u + m[0], 0.05, 0.95); want.v = clamp(want.v + m[1], 0.08, 0.92);
  run();
});
new IntersectionObserver((en) => { visible = en[en.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(root);
draw();
})();
