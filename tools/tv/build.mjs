// Banc de retroil·luminació — figura isomètrica per a tv/index.html (comparativa de teles).
// Fet amb el kit Anatomy (tools/anatomy-kit, MIT). Executa: node tools/tv/build.mjs
// Escriu: partials/tv-figure.html (injectat a tv/index.html entre els marcadors TVFIG) i js/tv.js (codi viu).
//
// El model: tres safates de llum d'un LCD de 55" vistes sense el panell. Una "lluna" (un objecte brillant sobre
// fons negre) es mou per la imatge. Cada safata encén només el que la seva arquitectura pot controlar:
//   A · sense atenuació local: una sola zona, tot encès (Samsung M73H)
//   B · edge-lit: LEDs a la vora, el control és per franges verticals (Samsung QN74H, LG QNED81B)
//   C · full array: graella de zones darrere el panell; 180 zones (18 × 10) com el TCL 55C6K Pro
// La lectura és la fracció de la pantalla encesa fora de la lluna: la llum que es converteix en halo o en negre grisós.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../anatomy-kit/iso-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");

const WIDTH = 700, HEIGHT = 420;
const MODEL = { cols: 18, rows: 10, strips: 12, moonR: 0.11 };   // moonR: radi de la lluna en fracció de l'alçada

// ---------- món (unitats ≈ px, z amunt; +x és el davant) ----------
const PLATE = { x: -118, y: -176, w: 236, d: 352, r: 12 };
const PLATE_H = 10, FOOT_H = 5;
const TW = 136, TD = 77;                    // safata 16:9 (x = amplada de la imatge, y = alçada)
const TX = -50;
const CENTERS = [-114, 0, 114];
const TRAY_Z = 4, TRAY_H = 6, TOP = TRAY_Z + TRAY_H;
const FRAME_Z = 26, BAR = 3.2, BAR_H = 2.4;
const DRIVER = { x: -108, w: 34, d: 30, h: 14 };

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), ...k.boxCorners({ x: TX, y: CENTERS[0] - TD / 2, w: TW, d: TD * 3 }, 0, FRAME_Z + BAR_H)],
  WIDTH, HEIGHT, { pad: 12, azimuth: 52 },
);

const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const depth = (x, y, z = 0) => k.depthOf([x, y, z], P);
const byDepth = (pts) => [...pts].sort((a, b) => depth(a[0], a[1]) - depth(b[0], b[1]));
const f = (n) => n.toFixed(2);
const polyTop = (pts, z) => k.onTop(pts, z, P, true);
const trayOf = (cy) => ({ x: TX, y: cy - TD / 2, w: TW, d: TD, r: 3 });
// coordenades d'imatge: u (esquerra→dreta) al llarg de x; v (dalt→baix) al llarg de y

// ---------- base ----------
function plate() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 26))) {
    out.push(S(k.cylinder(x, y, 9, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
  const screws = k.corners(PLATE, 11);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.4, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.55 }));
  // regle al llarg del cantell de davant (+x)
  const strip = { x: PLATE.x + PLATE.w - 15, y: -150, w: 7, d: 300, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const t = k.topTicks(strip.y + 4, strip.y + strip.d - 4, 4, 5, strip.x + 0.8, 0.6, [2, 3.6], P, "y");
  out.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
  out.push(D([at([strip.x + 3.5, strip.y + 2, 0.6]), at([strip.x + 3.5, strip.y + strip.d - 2, 0.6])], { size: 0.45 }));
  return out.join("");
}

// petita placa gravada davant de cada safata, amb la lletra
function labelPlate(cy, letter) {
  const p = { x: TX + TW + 6, y: cy - 12, w: 11, d: 24, r: 1.4 };
  const out = [S(k.slabOf(p, 0, 1, P, 3), { tone: "lo", crease: "none" })];
  out.push(L(k.planOutline(k.insetPlan(p, 1.4), 1, P, 3), { tone: "faint" }));
  out.push(D([at([p.x + p.w / 2, p.y + 2.6, 1]), at([p.x + p.w / 2, p.y + p.d - 2.6, 1])], { size: 0.4 }));
  out.push(k.faceTextSvg(k.topMatrix([p.x + 3.4, cy + 2.2], 1, P, "y"), letter, { size: 6, tone: "hi", anchor: "middle" }));
  return out.join("");
}

// caixa de control (el "processador" que decideix què s'encén) amb un xip i un connector
function driver(cy) {
  const b = { x: DRIVER.x, y: cy - DRIVER.d / 2, w: DRIVER.w, d: DRIVER.d, r: 3 };
  const out = [`<path class="iso-halo" d="${k.haloOf(b, 0, DRIVER.h, P)}" style="filter:blur(3px);opacity:.6"/>`];
  out.push(S(k.slabOf(b, 0, DRIVER.h, P, 4, 0.6), { tone: "mid", inner: L(k.sideSeam(b, 4, P, 4), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(b, 2.6), DRIVER.h, P, 4), { tone: "faint" }));
  out.push(D(k.corners(b, 4.2).map(([x, y]) => at([x, y, DRIVER.h])), { size: 0.5 }));
  const chip = { x: b.x + 9, y: cy - 7, w: 14, d: 14, r: 1 };
  out.push(S(k.slabOf(chip, DRIVER.h, 2.2, P, 3, 0.3), { tone: "hi", crease: "lo", className: "tv-chip" }));
  const pins = [];
  for (let i = 0; i < 5; i++) {
    const t = 2.2 + i * 2.4;
    pins.push(at([chip.x - 0.7, chip.y + t, DRIVER.h + 0.3]), at([chip.x + chip.w + 0.7, chip.y + t, DRIVER.h + 0.3]));
  }
  out.push(D(pins, { size: 0.35, tone: "mid" }));
  out.push(L(k.ring(chip.x + 2.6, chip.y + 2.6, 0.9, DRIVER.h + 2.2, P, 10), { tone: "lo" }));
  // connector a la cara de davant (+x)
  out.push(S(k.slabOf({ x: b.x + b.w, y: cy - 6, w: 2.4, d: 12, r: 0.6 }, 4, 6, P, 2), { tone: "lo" }));
  return out.join("");
}
// cable pla: del connector de la caixa a la vora de darrere de la safata
const ribbon = (cy) => k.wireSvg(at([DRIVER.x + DRIVER.w + 2.4, cy, 7]), at([TX, cy, TRAY_Z + 3]), {
  via: [at([DRIVER.x + DRIVER.w + 6, cy, 7]), at([DRIVER.x + DRIVER.w + 6, cy, 0.4]), at([TX - 5, cy, 0.4]), at([TX - 5, cy, TRAY_Z + 3])], tone: "mid",
});

// ---------- les safates ----------
function trayBody(cy) {
  const t = trayOf(cy);
  const out = [`<path class="iso-halo" d="${k.haloOf(t, 0, TOP, P)}" style="filter:blur(4px);opacity:.55"/>`];
  for (const [x, y] of byDepth(k.corners(t, 6))) out.push(S(k.cylinder(x, y, 2.8, 0, TRAY_Z, P, 18), { tone: "mid" }));
  out.push(S(k.slabOf(t, TRAY_Z, TRAY_H, P, 4, 0.5), { tone: "mid", inner: L(k.sideSeam(t, TRAY_Z + 2, P, 4), { tone: "faint" }), className: "tv-tray" }));
  return out.join("");
}
// la superfície de llum: el fons fosc de la imatge, sobre el qual pintem el que la safata encén
function screenBase(cy) {
  const t = trayOf(cy);
  const inner = k.insetPlan(t, 2.4);
  return `<path class="tv-black" d="${k.planOutline(inner, TOP, P)}"/>` + L(k.planOutline(inner, TOP, P), { tone: "lo" });
}
const AREA = (cy) => k.insetPlan(trayOf(cy), 2.4);

// A: una sola zona. Mini LEDs presents però tots a la mateixa intensitat.
function trayA(cy) {
  const a = AREA(cy);
  const out = [`<path class="tv-zone" data-zone="all" d="${k.planOutline(a, TOP, P)}" style="opacity:.5"/>`];
  out.push(D(ledGrid(a), { size: 0.38, tone: "hi" }));
  return out.join("");
}
// B: tira de LEDs a la vora de baix de la imatge (+x) i franges verticals
function trayB(cy) {
  const a = AREA(cy);
  const out = [];
  const sw = a.w / MODEL.strips;
  for (let i = 0; i < MODEL.strips; i++) {
    const x0 = a.x + i * sw;
    out.push(`<path class="tv-zone" data-zone="s${i}" d="${polyTop([[x0, a.y], [x0 + sw, a.y], [x0 + sw, a.y + a.d], [x0, a.y + a.d]], TOP)}" style="opacity:0"/>`);
  }
  out.push(L(Array.from({ length: MODEL.strips - 1 }, (_, i) => k.lineOnTop([a.x + (i + 1) * sw, a.y], [a.x + (i + 1) * sw, a.y + a.d], TOP, P)).join(""), { tone: "faint" }));
  return out.join("");
}
function stripB(cy) {
  const a = AREA(cy);
  const bar = { x: a.x + 1, y: a.y + a.d - 4.6, w: a.w - 2, d: 4, r: 1 };
  const out = [S(k.slabOf(bar, TOP, 1.6, P, 2), { tone: "lo", crease: "none" })];
  const sw = a.w / MODEL.strips, pts = [];
  for (let i = 0; i < MODEL.strips; i++) for (const s of [0.3, 0.7]) pts.push(at([a.x + (i + s) * sw, bar.y + 2, TOP + 1.6]));
  out.push(`<g class="tv-edge-leds">${D(pts, { size: 0.55, tone: "hi" })}</g>`);
  return out.join("");
}
// C: graella de 18 × 10 zones, un mini LED (de fet, un grup) per zona
function trayC(cy) {
  const a = AREA(cy);
  const out = [];
  const zw = a.w / MODEL.cols, zd = a.d / MODEL.rows;   // x: columnes (amplada de la imatge), y: files
  for (let r = 0; r < MODEL.rows; r++) for (let c = 0; c < MODEL.cols; c++) {
    const x0 = a.x + c * zw, y0 = a.y + r * zd;
    out.push(`<path class="tv-zone" data-zone="z${r * MODEL.cols + c}" d="${polyTop([[x0, y0], [x0 + zw, y0], [x0 + zw, y0 + zd], [x0, y0 + zd]], TOP)}" style="opacity:0"/>`);
  }
  const grid = [];
  for (let c = 1; c < MODEL.cols; c++) grid.push(k.lineOnTop([a.x + c * zw, a.y], [a.x + c * zw, a.y + a.d], TOP, P));
  for (let r = 1; r < MODEL.rows; r++) grid.push(k.lineOnTop([a.x, a.y + r * zd], [a.x + a.w, a.y + r * zd], TOP, P));
  out.push(L(grid.join(""), { tone: "faint" }));
  out.push(D(ledGrid(a), { size: 0.38, tone: "mid" }));
  return out.join("");
}
function ledGrid(a) {
  const pts = [], zw = a.w / MODEL.cols, zd = a.d / MODEL.rows;
  for (let r = 0; r < MODEL.rows; r++) for (let c = 0; c < MODEL.cols; c++) pts.push(at([a.x + (c + 0.5) * zw, a.y + (r + 0.5) * zd, TOP]));
  return pts;
}

// marc del panell LCD: quatre pals i un bastidor buit per sobre de la safata
function frame(cy) {
  const t = trayOf(cy);
  const parts = [];
  const posts = k.corners(t, 4);
  for (const [x, y] of posts) parts.push({ d: depth(x, y, TOP), svg: S(k.cylinder(x, y, 1.6, TOP, FRAME_Z - TOP, P, 14), { tone: "mid", crease: "none" }) + D([at([x, y, TOP])], { size: 0.5, tone: "lo" }) });
  const x0 = t.x + 4 - BAR / 2, x1 = t.x + t.w - 4 - BAR / 2, y0 = t.y + 4 - BAR / 2, y1 = t.y + t.d - 4 - BAR / 2;
  const bars = [
    { x: x0, y: y0, w: BAR, d: y1 - y0 + BAR, r: 0.6 },                // darrere
    { x: x1, y: y0, w: BAR, d: y1 - y0 + BAR, r: 0.6 },                // davant
    { x: x0 + BAR, y: y0, w: x1 - x0 - BAR, d: BAR, r: 0.6 },          // esquerra
    { x: x0 + BAR, y: y1, w: x1 - x0 - BAR, d: BAR, r: 0.6 },          // dreta
  ];
  for (const b of bars) parts.push({ d: depth(b.x + b.w / 2, b.y + b.d / 2, FRAME_Z) + 40, svg: S(k.slabOf(b, FRAME_Z, BAR_H, P, 2, 0.2), { tone: "mid" }) });
  parts.push({ d: 1e6, svg: D(posts.map(([x, y]) => at([x, y, FRAME_Z + BAR_H])), { size: 0.55 }) });
  parts.sort((p, q) => p.d - q.d);
  return parts.map((p) => p.svg).join("");
}

// ---------- muntatge ----------
const LETTERS = ["A", "B", "C"];
const stations = CENTERS.map((cy, i) => {
  const kind = LETTERS[i];
  const surface = kind === "A" ? trayA(cy) : kind === "B" ? trayB(cy) : trayC(cy);
  const svg = [
    driver(cy), ribbon(cy), trayBody(cy),
    `<g class="tv-surface" data-tray="${kind}">${screenBase(cy)}${surface}<path class="tv-moon" data-moon="${kind}" d=""/></g>`,
    kind === "B" ? stripB(cy) : "",
    frame(cy), labelPlate(cy, kind),
  ].join("");
  return { d: depth(0, cy), svg };
}).sort((a, b) => a.d - b.d);

const svg = k.figureSvg({
  width: WIDTH, height: HEIGHT,
  label: "Banc amb tres safates de retroil·luminació d'una tele de 55 polzades, sense el panell LCD. Un objecte brillant es mou per la imatge. La safata A no té atenuació local i ho encén tot. La safata B és edge-lit: té els LEDs a la vora i només pot encendre franges senceres. La safata C és full array amb 180 zones i només encén les zones de sota l'objecte.",
  body: [plate(), ...stations.map((s) => s.svg)],
  className: "tv-svg",
});

const plateBody = k.plateHtml({
  fig: "Fig 1",
  title: "Banc de retroil·luminació",
  hint: "Mou el punter per moure la lluna",
  readout: "llum fora de la lluna · A 100% · B 10% · C 3%",
  keys: [
    { mark: "solid", label: "A · sense atenuació (M73H)" },
    { mark: "line", label: "B · edge-lit, franges (QN74H, QNED81B)" },
    { mark: "dot", label: "C · full array, 180 zones (C6K Pro)" },
  ],
  caption: "Cada safata és el que hi ha darrere del panell. El que s'encén fora de la lluna acaba com a halo o com a negre grisós.",
  body: `<div class="iso-stage tv-stage" tabindex="0" role="group" aria-label="Banc de retroil·luminació. Fletxes: mouen la lluna.">${svg}</div>`,
});

mkdirSync(join(ROOT, "partials"), { recursive: true });
writeFileSync(join(ROOT, "partials", "tv-figure.html"), plateBody + "\n");
const pagePath = join(ROOT, "tv", "index.html");
try {
  const page = readFileSync(pagePath, "utf8");
  const mark = /(<!-- TVFIG:start -->)[\s\S]*?(<!-- TVFIG:end -->)/;
  if (mark.test(page)) writeFileSync(pagePath, page.replace(mark, (_, a, b) => `${a}\n${plateBody}\n${b}`));
} catch { /* la pàgina encara no existeix */ }

// ---------- codi viu (script clàssic; les funcions del kit són globals de js/vendor/iso-kit.js) ----------
const live = `/* Banc de retroil·luminació: model i moviment. Generat per tools/tv/build.mjs — edita-ho allà. */
(() => {
const P = ${JSON.stringify(P)};
const MODEL = ${JSON.stringify(MODEL)};
const TX = ${TX}, TW = ${TW}, TD = ${TD}, TOP = ${TOP};
const CENTERS = ${JSON.stringify(CENTERS)};
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
`;
writeFileSync(join(ROOT, "js", "tv.js"), live);
console.log("wrote partials/tv-figure.html, js/tv.js");
