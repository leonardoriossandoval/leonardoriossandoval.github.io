// BSPD test bench — isometric figure for the Formula Student chapter.
// Built with the Anatomy kit (tools/anatomy-kit, MIT). Run: node tools/bspd/build.mjs
// Writes: partials/bspd-figure.html (injected into index.html between the BSPD markers) and js/bspd.js (live code).
//
// The model (Formula Student rules, electric cars): the Brake System Plausibility Device opens the
// shutdown circuit (SDC) when hard braking happens while 5 kW or more is delivered to the motors,
// and that lasts longer than 500 ms. It is pure hardware and stays latched until it is reset.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../anatomy-kit/iso-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");

const MODEL = { kwLimit: 5, tripMs: 500, kwMax: 10 };
const WIDTH = 640;
const HEIGHT = 420;

// ---------- world layout (units ≈ px, z up) ----------
const PLATE = { x: -150, y: -92, w: 300, d: 184, r: 10 };
const PLATE_H = 10, FOOT_H = 5;

const BOARD = { x: -46, y: -46, w: 104, d: 78, r: 4 };
const BOARD_Z = 9, BOARD_T = 1.6, BT = BOARD_Z + BOARD_T;

const BLOCK = { x: -134, y: -64, w: 40, d: 40, r: 3 };
const BLOCK_H = 9;
const MC = [-118, -48];              // master cylinder axis
const MC_TOP = 46;
const PAD_REST = 58, PAD_TRAVEL = 8;
const SENSOR = [-102, -30];          // brake pressure sensor
const RES = [-102, -54];             // fluid reservoir

const HV_X = 100;
const POST_A = { x: HV_X - 10, y: -78, w: 20, d: 14, r: 2 };
const POST_B = { x: HV_X - 10, y: 18, w: 20, d: 14, r: 2 };
const CS = { x: HV_X - 16, y: -38, w: 32, d: 16, r: 2.5 };   // hall current sensor
const CS_H = 30;

const LOAD = { x: 62, y: 46, w: 70, d: 34, r: 3 };
const LOAD_H = 16;
const KNOB = [78, 63];
const METER = [110, 63], METER_R = 12, METER_Z = LOAD_H, METER_TOP = LOAD_H + 4;

const LAMP = [132, 8];
const LAMP_BASE_H = 4, LAMP_POST_TOP = 34;

const TBOX = { x: -140, y: 30, w: 66, d: 42, r: 3 };
const TBOX_H = 26;
const WIN = { x0: -133, x1: -91, z0: 8, z1: 20 };   // display window on the +y face (y = TBOX.y + TBOX.d)
const BTN = [-84, 44];

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [MC[0], MC[1], PAD_REST + 6], [LAMP[0], LAMP[1], LAMP_POST_TOP + 10]],
  WIDTH, HEIGHT, { pad: 26, azimuth: 45 },
);

const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const depth = (x, y, z = 0) => k.depthOf([x, y, z], P);
const byDepth = (pts) => [...pts].sort((a, b) => depth(a[0], a[1]) - depth(b[0], b[1]));

// ---------- base ----------
function plate() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 24))) {
    out.push(S(k.cylinder(x, y, 8, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 6, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
  const screws = k.corners(PLATE, 11);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.4, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.55 }));
  // ruler strip along the front (+x) edge
  const strip = { x: PLATE.x + PLATE.w - 15, y: -70, w: 7, d: 140, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const t = k.topTicks(strip.y + 4, strip.y + strip.d - 4, 4, 5, strip.x + 0.8, 0.6, [2, 3.6], P, "y");
  out.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
  out.push(D([at([strip.x + 3.5, strip.y + 2, 0.6]), at([strip.x + 3.5, strip.y + strip.d - 2, 0.6])], { size: 0.45 }));
  // label plate, front-right corner
  const label = { x: 40, y: PLATE.y + PLATE.d - 13, w: 64, d: 8, r: 1.2 };
  out.push(S(k.slabOf(label, 0, 0.8, P, 3), { tone: "lo", crease: "none" }));
  out.push(L(k.planOutline(k.insetPlan(label, 1.4), 0.8, P, 3), { tone: "faint" }));
  out.push(L([0, 1, 2].map((i) => k.lineOnTop([label.x + 6, label.y + 2.2 + i * 1.8], [label.x + 6 + [40, 30, 22][i], label.y + 2.2 + i * 1.8], 0.8, P)).join(""), { tone: "lo", free: true }));
  out.push(D([at([label.x + 2.6, label.y + 4, 0.8]), at([label.x + label.w - 2.6, label.y + 4, 0.8])], { size: 0.4 }));
  return out.join("");
}

// ---------- the subject: the BSPD board ----------
const J1 = { x: -42, y: 21, w: 32, d: 9, r: 1 };          // input terminal block on the front edge: test, brake, current, gnd
const J1_PINS = [-37, -30, -23, -16];
const U1 = { x: -24, y: -38, w: 18, d: 10, r: 1 };          // comparator: brake pressure
const U2 = { x: -24, y: -16, w: 18, d: 10, r: 1 };          // comparator: current (power)
const U3 = { x: 4, y: -27, w: 18, d: 10, r: 1 };            // AND gate + latch
const C1 = [32, -32], C1_R = 5.5, C1_H = 12;                // timing capacitor (RC ≈ 500 ms)
const R1 = { x: 26, y: -16, w: 12, d: 3.6, r: 1.6 };
const R2 = { x: 26, y: -9, w: 12, d: 3.6, r: 1.6 };
const K1 = { x: 14, y: 2, w: 24, d: 18, r: 2 };             // relay in the shutdown circuit
const K1_H = 14;
const J2 = { x: 46, y: -40, w: 9, d: 20, r: 1 };          // output terminal block on the right edge: SDC in, SDC out
const J2_PINS = [-34, -26];
const LED = [46, 20];

function chip(plan) {
  const out = [S(k.slabOf(plan, BT, 3.4, P, 3, 0.3), { tone: "mid" })];
  const pins = [];
  for (let i = 0; i < 4; i++) {
    const x = plan.x + 3 + i * ((plan.w - 6) / 3);
    pins.push(at([x, plan.y - 0.6, BT + 0.4]), at([x, plan.y + plan.d + 0.6, BT + 0.4]));
  }
  out.push(D(pins, { size: 0.42, tone: "mid" }));
  out.push(L(k.ring(plan.x + 2.4, plan.y + 2.4, 0.9, BT + 3.4, P, 10), { tone: "lo" }));
  return out.join("");
}
function terminal(plan, screws) {
  const out = [S(k.slabOf(plan, BT, 6, P, 2, 0.3), { tone: "mid", inner: L(k.sideSeam(plan, BT + 2, P, 2), { tone: "faint" }) })];
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 1.6, BT + 6, P, 12)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, BT + 6])), { size: 0.45, tone: "mid" }));
  return out.join("");
}
function board() {
  const out = [`<path class="iso-halo" d="${k.haloOf(BOARD, 0, BOARD_Z, P)}" style="filter:blur(4px);opacity:.55"/>`];
  for (const [x, y] of byDepth(k.corners(BOARD, 5))) out.push(S(k.cylinder(x, y, 2.6, 0, BOARD_Z, P, 18), { tone: "mid" }));
  out.push(S(k.slabOf(BOARD, BOARD_Z, BOARD_T, P, 4, 0.4), { tone: "hi", crease: "lo", className: "bspd-pcb" }));
  out.push(L(k.planOutline(k.insetPlan(BOARD, 2.2), BT, P, 4), { tone: "faint" }));
  const holes = k.corners(BOARD, 5);
  out.push(L(holes.map(([x, y]) => k.ring(x, y, 1.8, BT, P, 14)).join(""), { tone: "lo" }));
  out.push(D(holes.map(([x, y]) => at([x, y, BT])), { size: 0.5 }));
  // copper traces on top, every end on a part's edge
  const tr = (pts) => k.onTop(pts, BT, P);
  out.push(L([
    tr([[J1_PINS[1], J1.y], [J1_PINS[1], -33], [U1.x, -33]]),
    tr([[J1_PINS[2], J1.y], [J1_PINS[2], -11], [U2.x, -11]]),
    tr([[J1.x + J1.w, 25.5], [26, 25.5], [26, K1.y + K1.d]]),
    tr([[U1.x + U1.w, -33], [-2, -33], [-2, -23], [U3.x, -23]]),
    tr([[U2.x + U2.w, -11], [-2, -11], [-2, -19], [U3.x, -19]]),
    tr([[U3.x + U3.w, -24], [C1[0] - C1_R, -24]]),
    tr([[U3.x + U3.w, -20], [24, -20], [24, -14.2], [R1.x, -14.2]]),
    tr([[R2.x + R2.w, -7.2], [42, -7.2], [42, 6], [K1.x + K1.w, 6]]),
    tr([[C1[0] + C1_R, -32], [41, -32], [41, -21], [U3.x + U3.w, -21]]),
    tr([[K1.x + K1.w, 8], [J2.x + 4.5, 8], [J2.x + 4.5, J2.y + J2.d]]),
    tr([[K1.x + K1.w, 16], [LED[0] - 2.2, 16], [LED[0] - 2.2, LED[1]]]),
  ].join(""), { tone: "lo" }));
  out.push(k.faceTextSvg(k.topMatrix([29, BOARD.y + BOARD.d - 3], BT, P, "x"), "BSPD", { size: 3.4, tone: "mid" }));
  out.push(terminal(J1, J1_PINS.map((x) => [x, J1.y + 4.5])), chip(U1), chip(U2), chip(U3));
  for (const r of [R1, R2]) {
    out.push(S(k.slabOf(r, BT, 3, P, 4), { tone: "mid", crease: "none" }));
    out.push(L([0.3, 0.5, 0.7].map((f) => k.segment([r.x + r.w * f, r.y + r.d, BT], [r.x + r.w * f, r.y + r.d, BT + 3], P)).join(""), { tone: "lo" }));
  }
  out.push(S(k.cylinder(C1[0], C1[1], C1_R, BT, C1_H, P, 32, 0.4), { tone: "mid", className: "bspd-cap" }));
  out.push(L(k.sideArc(C1[0], C1[1], C1_R, BT + C1_H - 2.4, P, 24), { tone: "faint" }));
  out.push(L(k.ring(C1[0], C1[1], 3.2, BT + C1_H, P, 24), { tone: "lo" }));   // vent score
  out.push(S(k.slabOf(K1, BT, K1_H, P, 3, 0.5), { tone: "mid", inner: L(k.sideSeam(K1, BT + 3, P, 3), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(K1, 2.4), BT + K1_H, P, 3), { tone: "faint" }));
  out.push(terminal(J2, J2_PINS.map((y) => [J2.x + 4.5, y])));
  out.push(S(k.cylinder(LED[0], LED[1], 2.2, BT, 3.2, P, 16), { tone: "mid" }));
  out.push(`<circle class="bspd-led" cx="${at([LED[0], LED[1], BT + 3.2])[0].toFixed(1)}" cy="${at([LED[0], LED[1], BT + 3.2])[1].toFixed(1)}" r="1.7"/>`);
  return out.join("");
}

// ---------- brake rig: master cylinder, pedal pad, pressure sensor ----------
function brakeBack() {
  const out = [`<path class="iso-halo" d="${k.haloOf(BLOCK, 0, BLOCK_H, P)}" style="filter:blur(3px);opacity:.6"/>`];
  out.push(S(k.slabOf(BLOCK, 0, BLOCK_H, P, 4, 0.6), { tone: "mid", inner: L(k.sideSeam(BLOCK, 3, P, 4), { tone: "faint" }) }));
  out.push(D(k.corners(BLOCK, 4).map(([x, y]) => at([x, y, BLOCK_H])), { size: 0.5 }));
  out.push(S(k.cylinder(RES[0], RES[1], 5.5, BLOCK_H, 16, P, 28), { tone: "mid" }));
  out.push(L(k.sideArc(RES[0], RES[1], 5.5, BLOCK_H + 10, P, 18), { tone: "faint" }));
  out.push(S(k.cylinder(RES[0], RES[1], 3.4, BLOCK_H + 16, 2.4, P, 20), { tone: "mid" }));
  out.push(L(k.knurl(RES[0], RES[1], 3.4, BLOCK_H + 16, BLOCK_H + 18.4, 14, P), { tone: "lo" }));
  out.push(S(k.cylinder(MC[0], MC[1], 13, BLOCK_H, 4, P, 40), { tone: "mid" }));
  out.push(S(k.cylinder(MC[0], MC[1], 10, BLOCK_H + 4, MC_TOP - BLOCK_H - 4, P, 40, 0.5), { tone: "mid" }));
  out.push(L([20, 30].map((z) => k.sideArc(MC[0], MC[1], 10, z, P, 30)).join(""), { tone: "faint" }));
  out.push(S(k.cylinder(MC[0], MC[1], 7, MC_TOP, 3, P, 32), { tone: "mid" }));
  out.push(L(k.ring(MC[0], MC[1], 4.6, MC_TOP + 3, P, 24), { tone: "lo" }));
  return out.join("");
}
function pedalRod() {
  return S(k.cylinder(MC[0], MC[1], 2.6, MC_TOP + 3 - PAD_TRAVEL, PAD_REST - MC_TOP - 3 + PAD_TRAVEL, P, 18), { tone: "hi", crease: "none" });
}
function pedalPad() {
  const out = [];
  const pad = { x: MC[0] - 13, y: MC[1] - 10, w: 26, d: 20, r: 3 };
  out.push(S(k.slabOf(pad, PAD_REST, 4, P, 4, 0.5), { tone: "hi", crease: "lo" }));
  for (let i = 0; i < 4; i++) out.push(L(k.planOutline({ x: pad.x + 4, y: pad.y + 3.6 + i * 3.4, w: pad.w - 8, d: 1.6, r: 0.8 }, PAD_REST + 4, P, 3), { tone: "lo" }));   // grip slots
  return out.join("");
}
// the rod slides into the cylinder cap: clip it to everything above the cap's bore ring (a fixed clip, so the rod moves through it)
function rodClip() {
  const c = at([MC[0], MC[1], MC_TOP + 3]);
  const front = k.circleRing(MC[0], MC[1], 2.7, 48).map(([x, y]) => at([x, y, MC_TOP + 3])).filter(([, sy]) => sy >= c[1]).sort((p, q) => q[0] - p[0]);
  const half = `M${front[0][0].toFixed(2)} ${c[1].toFixed(2)}` + front.map(([x, y]) => `L${x.toFixed(2)} ${y.toFixed(2)}`).join("") + `L${front[front.length - 1][0].toFixed(2)} ${c[1].toFixed(2)}Z`;
  return `<clipPath id="bspd-rod"><path d="M-2000 -2000H2000V${c[1].toFixed(2)}H-2000Z${half}"/></clipPath>`;
}
function sensor() {
  const out = [];
  const [x, y] = SENSOR;
  out.push(S(k.cylinder(x, y, 5.2, BLOCK_H, 3, P, 6), { tone: "mid" }));       // hex
  out.push(S(k.cylinder(x, y, 4, BLOCK_H + 3, 10, P, 28, 0.3), { tone: "mid" }));
  out.push(L(k.sideArc(x, y, 4, BLOCK_H + 8, P, 18), { tone: "faint" }));
  out.push(S(k.cylinder(x, y, 3.2, BLOCK_H + 13, 4, P, 24), { tone: "lo" }));  // connector
  out.push(L(k.knurl(x, y, 3.2, BLOCK_H + 13, BLOCK_H + 17, 12, P), { tone: "faint" }));
  return out.join("");
}

// ---------- power: HV cable through a hall current sensor ----------
function post(plan) {
  const out = [S(k.slabOf(plan, 0, 14, P, 3, 0.5), { tone: "mid", inner: L(k.sideSeam(plan, 4, P, 3), { tone: "faint" }) })];
  const cx = plan.x + plan.w / 2, cy = plan.y + plan.d / 2;
  out.push(S(k.cylinder(cx, cy, 4.4, 14, 2.4, P, 6), { tone: "mid" }));
  out.push(S(k.cylinder(cx, cy, 2.2, 16.4, 3, P, 18), { tone: "lo" }));
  return out.join("");
}
const cable = (y0, y1) => S(k.slabOf({ x: HV_X - 5, y: y0, w: 10, d: y1 - y0, r: 4.8 }, 4.4, 9.6, P, 6), { tone: "lo", crease: "none" });
function currentSensor() {
  const out = [S(k.slabOf(CS, 0, CS_H, P, 4, 0.6), { tone: "mid", inner: L(k.sideSeam(CS, 6, P, 4), { tone: "faint" }) })];
  out.push(L(k.planOutline(k.insetPlan(CS, 2.6), CS_H, P, 4), { tone: "faint" }));
  out.push(D([at([CS.x + 4, CS.y + 4, CS_H]), at([CS.x + CS.w - 4, CS.y + CS.d - 4, CS_H])], { size: 0.5 }));
  // the cable passes through a window in the sensor's +y face
  const win = [[HV_X - 7, 3], [HV_X + 7, 3], [HV_X + 7, 16], [HV_X - 7, 16]].map(([x, z]) => at([x, CS.y + CS.d, z]));
  out.push(`<path class="iso-line" data-tone="lo" d="M${win.map((p) => p.map((v) => v.toFixed(1)).join(" ")).join("L")}Z"/>`);
  // signal connector on top
  out.push(S(k.slabOf({ x: CS.x + 4, y: CS.y + 4, w: 9, d: 8, r: 1 }, CS_H, 4, P, 2), { tone: "lo" }));
  return out.join("");
}
function loadBox() {
  const out = [`<path class="iso-halo" d="${k.haloOf(LOAD, 0, LOAD_H, P)}" style="filter:blur(3px);opacity:.6"/>`];
  out.push(S(k.slabOf(LOAD, 0, LOAD_H, P, 4, 0.6), { tone: "mid", inner: L(k.sideSeam(LOAD, 4, P, 4), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(LOAD, 3), LOAD_H, P, 4), { tone: "faint" }));
  out.push(D(k.corners(LOAD, 5).map(([x, y]) => at([x, y, LOAD_H])), { size: 0.5 }));
  // knurled load knob with a pointer
  out.push(S(k.cylinder(KNOB[0], KNOB[1], 7, LOAD_H, 5, P, 36), { tone: "mid" }));
  out.push(L(k.knurl(KNOB[0], KNOB[1], 7, LOAD_H, LOAD_H + 5, 36, P), { tone: "lo" }));
  out.push(D([at([KNOB[0], KNOB[1], LOAD_H + 5])], { size: 0.6, tone: "hi" }));
  // kW meter, face up
  const [x, y] = METER;
  out.push(S(k.cylinder(x, y, METER_R, METER_Z, 4, P, 56, 0.6), { tone: "hi", crease: "lo" }));
  out.push(L(k.ring(x, y, METER_R - 1.8, METER_TOP, P, 48), { tone: "lo" }));
  const span = Math.PI * 1.5, from = -span / 2;
  const tk = k.radialTicks(x, y, METER_R - 2.4, 20, 2, METER_TOP, [1.1, 2.2], P, from, span);
  out.push(L(tk.minor, { tone: "lo" }), L(tk.major, { tone: "mid" }));
  // 5 kW threshold mark
  const a5 = from + span * (MODEL.kwLimit / MODEL.kwMax);
  out.push(L(k.lineOnTop([x + Math.sin(a5) * (METER_R - 6), y - Math.cos(a5) * (METER_R - 6)], [x + Math.sin(a5) * (METER_R - 2.4), y - Math.cos(a5) * (METER_R - 2.4)], METER_TOP, P), { tone: "hi" }));
  out.push(L(k.ring(x, y, 1.4, METER_TOP, P, 12), { tone: "mid" }));
  return out.join("");
}
const needleOf = (kw) => {
  const span = Math.PI * 1.5, a = -span / 2 + span * Math.min(1, Math.max(0, kw / MODEL.kwMax));
  const [x, y] = METER;
  return k.lineOnTop([x - Math.sin(a) * 2.4, y + Math.cos(a) * 2.4], [x + Math.sin(a) * (METER_R - 3.4), y - Math.cos(a) * (METER_R - 3.4)], METER_TOP + 0.2, P);
};
const knobPointerOf = (kw) => {
  const a = -Math.PI * 0.75 + Math.PI * 1.5 * (kw / MODEL.kwMax);
  return k.lineOnTop([KNOB[0], KNOB[1]], [KNOB[0] + Math.sin(a) * 6, KNOB[1] - Math.cos(a) * 6], LOAD_H + 5, P);
};

// ---------- shutdown-circuit lamp ----------
function lamp() {
  const [x, y] = LAMP;
  const out = [`<path class="iso-halo" d="${k.haloOf({ x: x - 9, y: y - 9, w: 18, d: 18, r: 9 }, 0, 2, P)}" style="filter:blur(3px);opacity:.6"/>`];
  out.push(S(k.cylinder(x, y, 9, 0, LAMP_BASE_H, P, 40, 0.5), { tone: "mid" }));
  out.push(S(k.cylinder(x, y, 2.4, LAMP_BASE_H, LAMP_POST_TOP - LAMP_BASE_H - 2, P, 18), { tone: "mid", crease: "none" }));
  out.push(S(k.cylinder(x, y, 5.4, LAMP_POST_TOP - 2, 2, P, 28), { tone: "mid" }));
  out.push(`<g class="bspd-lamp">${S(k.cylinder(x, y, 4.6, LAMP_POST_TOP, 8, P, 28, 0.4), { tone: "hi", lit: true })}</g>`);
  out.push(S(k.cylinder(x, y, 5.4, LAMP_POST_TOP + 8, 1.6, P, 28), { tone: "mid" }));
  return out.join("");
}

// ---------- test box with millisecond display and reset button ----------
function testBox() {
  const out = [`<path class="iso-halo" d="${k.haloOf(TBOX, 0, TBOX_H, P)}" style="filter:blur(3px);opacity:.6"/>`];
  out.push(S(k.slabOf(TBOX, 0, TBOX_H, P, 4, 0.6), { tone: "mid", inner: L(k.sideSeam(TBOX, 4, P, 4), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(TBOX, 3), TBOX_H, P, 4), { tone: "faint" }));
  out.push(D(k.corners(TBOX, 5).map(([x, y]) => at([x, y, TBOX_H])), { size: 0.5 }));
  out.push(S(k.cylinder(BTN[0] + 0, BTN[1], 5.6, TBOX_H, 2, P, 28), { tone: "mid" }));
  out.push(`<g class="bspd-reset">${S(k.cylinder(BTN[0], BTN[1], 4, TBOX_H + 2, 2.6, P, 28, 0.3), { tone: "hi" })}</g>`);
  // display: drawn in the plane of the +y face
  const FY = TBOX.y + TBOX.d + 0.01;
  const m = k.sideMatrix([WIN.x0, FY], WIN.z1, P, "left");
  const w = WIN.x1 - WIN.x0, h = WIN.z1 - WIN.z0;
  out.push(`<g transform="${m}"><rect class="bspd-screen" x="0" y="0" width="${w}" height="${h}" rx="1.4"/>` +
    `<text class="bspd-digits" data-display x="${w - 3}" y="${h * 0.72}" text-anchor="end" font-size="${(h * 0.58).toFixed(2)}">000 ms</text>` +
    `<rect class="iso-line bspd-screen-edge" x="0" y="0" width="${w}" height="${h}" rx="1.4"/></g>`);
  return out.join("");
}

// ---------- wires on the bench (terminal dots land on parts) ----------
function wires() {
  const p = (x, y, z) => at([x, y, z]);
  const Z = 0.6, PIN_Z = BT + 3, J1F = J1.y + J1.d, J2F = J2.x + J2.w;
  return [
    // brake pressure sensor → J1 "brake": hangs from the connector, runs left of the board, rises to the terminal face
    k.wireSvg(p(SENSOR[0], SENSOR[1] + 3.2, BLOCK_H + 15), p(J1_PINS[1], J1F, PIN_Z), { via: [p(SENSOR[0], -16, BLOCK_H + 15), p(SENSOR[0], -16, Z), p(-54, -16, Z), p(-54, 44, Z), p(J1_PINS[1], 44, Z), p(J1_PINS[1], J1F + 3, Z), p(J1_PINS[1], J1F + 3, PIN_Z)], tone: "mid" }),
    // hall current sensor (socket on its front face) → J1 "current"
    k.wireSvg(p(CS.x + 4, CS.y + CS.d, 20), p(J1_PINS[2], J1F, PIN_Z), { via: [p(CS.x + 4, CS.y + CS.d + 3, 20), p(CS.x + 4, CS.y + CS.d + 3, Z), p(CS.x + 4, 40, Z), p(J1_PINS[2], 40, Z), p(J1_PINS[2], J1F + 3, Z), p(J1_PINS[2], J1F + 3, PIN_Z)], tone: "mid" }),
    // J1 "test" → test box (crosses the brake line once, on straights)
    k.wireSvg(p(J1_PINS[0], J1F, PIN_Z), p(TBOX.x + TBOX.w, 36, 8), { via: [p(J1_PINS[0], J1F + 3, PIN_Z), p(J1_PINS[0], J1F + 3, Z), p(J1_PINS[0], 36, Z), p(TBOX.x + TBOX.w + 2, 36, Z), p(TBOX.x + TBOX.w + 2, 36, 8)], tone: "mid" }),
    // J2 → shutdown-circuit lamp, passing under the raised HV cable
    k.wireSvg(p(J2F, J2_PINS[0], PIN_Z), p(LAMP[0], LAMP[1] + 9, 2), { via: [p(J2F + 3, J2_PINS[0], PIN_Z), p(J2F + 3, J2_PINS[0], Z), p(J2F + 3, -6, Z), p(118, -6, Z), p(118, 22, Z), p(LAMP[0], 22, Z), p(LAMP[0], LAMP[1] + 9, Z)], tone: "mid" }),
  ].join("");
}
const sockets = () => S(k.slabOf({ x: CS.x + 1.5, y: CS.y + CS.d, w: 5, d: 2.4, r: 0.6 }, 17, 6, P, 2), { tone: "lo" });

// ---------- paint back to front ----------
const items = [
  { at: [LAMP[0], LAMP[1]], svg: lamp() },
  { at: [POST_A.x + 10, POST_A.y + 7], svg: post(POST_A) },
  { at: [HV_X, -60], svg: cable(POST_A.y + POST_A.d - 1, CS.y + 2) },
  { at: [HV_X, CS.y + CS.d / 2], svg: currentSensor() + sockets() },
  { at: [HV_X, -4], svg: cable(CS.y + CS.d - 0.5, POST_B.y + 1) },
  { at: [POST_B.x + 10, POST_B.y + 7], svg: post(POST_B) },
  { at: [-114, -44], svg: brakeBack() + rodClip() + `<g clip-path="url(#bspd-rod)"><g data-part="rod">${pedalRod()}</g></g><g data-part="pedal">${pedalPad()}</g>` + sensor() },
  { at: [6, -8], svg: board() },
  { at: [6, -8], bias: 0.5, svg: wires() },
  { at: [LOAD.x + LOAD.w / 2, LOAD.y + LOAD.d / 2], svg: loadBox() + `<path data-part="knob" class="iso-line" data-tone="hi" data-free="end" d="${knobPointerOf(1.5)}" style="stroke-width:1"/>` + `<path data-part="needle" class="iso-line" data-tone="lit" data-free="start" d="${needleOf(1.5)}" style="stroke-width:1.1"/>` },
  { at: [TBOX.x + TBOX.w / 2, TBOX.y + TBOX.d / 2], svg: testBox() },
];
items.sort((a, b) => depth(a.at[0], a.at[1]) + (a.bias || 0) - depth(b.at[0], b.at[1]) - (b.bias || 0));

const svg = k.figureSvg({
  width: WIDTH, height: HEIGHT,
  label: "A BSPD test bench. On the left a brake master cylinder with a pedal pad and a pressure sensor; on the right a high-voltage cable runs through a hall current sensor, with a load box and a kW meter in front. Both sensors are wired to the BSPD board in the middle. Its relay feeds the shutdown-circuit lamp at the back, and a test box with a millisecond display sits at the front. When hard braking and at least 5 kW last more than 500 ms, the relay opens and the lamp goes out.",
  body: [plate(), ...items.map((i) => i.svg)],
  className: "bspd-svg",
});

const plateBody = k.plateHtml({
  fig: "Fig 2",
  title: "BSPD test bench",
  hint: "Hover: left brakes, right adds power",
  readout: "brake released · 1.5 kW · SDC closed",
  body: `<div class="iso-stage bspd-stage" tabindex="0" role="group" aria-label="BSPD test bench. Keys: B toggles hard braking, P toggles power above 5 kW, R resets the latch.">${svg}</div>`,
});

mkdirSync(join(ROOT, "partials"), { recursive: true });
writeFileSync(join(ROOT, "partials", "bspd-figure.html"), plateBody + "\n");
// inject into index.html between the markers
const indexPath = join(ROOT, "index.html");
const page = readFileSync(indexPath, "utf8");
const mark = /(<!-- BSPD:start -->)[\s\S]*?(<!-- BSPD:end -->)/;
if (mark.test(page)) writeFileSync(indexPath, page.replace(mark, (_, a, b) => `${a}\n${plateBody}\n${b}`));

// ---------- live code (classic script; kit functions are globals from js/vendor/iso-kit.js) ----------
const live = `/* BSPD test bench: live model and motion. Generated by tools/bspd/build.mjs — edit there. */
(() => {
const P = ${JSON.stringify(P)};
const MODEL = ${JSON.stringify(MODEL)};
const METER = ${JSON.stringify(METER)}, METER_R = ${METER_R}, METER_TOP = ${METER_TOP};
const KNOB = ${JSON.stringify(KNOB)}, LOAD_H = ${LOAD_H}, PAD_TRAVEL = ${PAD_TRAVEL};
const root = document.querySelector(".bspd-stage");
if (!root) return;
const fig = root.closest(".iso-figure");
const pedal = root.querySelector('[data-part="pedal"]');
const rod = root.querySelector('[data-part="rod"]');
const needle = root.querySelector('[data-part="needle"]');
const knob = root.querySelector('[data-part="knob"]');
const display = root.querySelector("[data-display]");
const readout = fig.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const k = { lineOnTop, translateAlong };
const needleOf = ${needleOf.toString()};
const knobPointerOf = ${knobPointerOf.toString()};

// state: inputs follow targets with real-ish lag; the timer and latch follow the rules exactly
const s = { press: 0, kw: 1.5, timer: 0, tripped: false };
const want = { brake: false, kw: 1.5 };
let source = "scroll", idle = 0, frame = 0, last = 0, visible = false;

function draw() {
  const press = translateAlong(P, [0, 0, -PAD_TRAVEL * s.press]);
  pedal.setAttribute("transform", press); rod.setAttribute("transform", press);
  needle.setAttribute("d", needleOf(s.kw));
  knob.setAttribute("d", knobPointerOf(s.kw));
  root.classList.toggle("is-tripped", s.tripped);
  root.classList.toggle("is-timing", s.timer > 0 && !s.tripped);
  const ms = Math.min(MODEL.tripMs, Math.round(s.timer));
  const text = s.tripped ? "TRIP" : String(ms).padStart(3, "0") + " ms";
  if (display.textContent !== text) display.textContent = text;
  const hard = s.press > 0.6;
  const out = (hard ? "hard braking" : "brake released") + " · " + s.kw.toFixed(1) + " kW · " + (s.tripped ? "SDC open (latched)" : s.timer > 0 ? ms + " / 500 ms" : "SDC closed");
  if (readout.textContent !== out) readout.textContent = out;
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  const calm = still.matches;
  const ease = (v, t, sec) => calm ? t : v + (t - v) * (1 - Math.exp(-dt / sec));
  s.press = ease(s.press, want.brake ? 1 : 0, 0.12);
  s.kw = ease(s.kw, want.kw, 0.25);
  if (Math.abs(s.press - (want.brake ? 1 : 0)) < 0.002) s.press = want.brake ? 1 : 0;
  if (Math.abs(s.kw - want.kw) < 0.01) s.kw = want.kw;
  const both = s.press > 0.6 && s.kw >= MODEL.kwLimit;
  if (!s.tripped) {
    s.timer = both ? s.timer + dt * 1000 : 0;
    if (s.timer > MODEL.tripMs) s.tripped = true;
  }
  draw();
  const settled = s.press === (want.brake ? 1 : 0) && s.kw === want.kw && !both;
  frame = visible && !(settled || s.tripped && s.kw === want.kw && s.press === (want.brake ? 1 : 0)) ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
const reset = () => { s.tripped = false; s.timer = 0; run(); };
const set = (brake, kw, from) => {
  if (from === "scroll" && source !== "scroll") return;
  const changed = brake !== want.brake || Math.abs(kw - want.kw) > 0.01;
  want.brake = brake; want.kw = kw;
  if (changed && from === "scroll" && !(brake && kw >= MODEL.kwLimit)) reset();
  run();
};
const takeOver = () => { source = "user"; clearTimeout(idle); idle = setTimeout(() => { source = "scroll"; window.dispatchEvent(new Event("scroll")); }, 4000); };

// scroll scenario (called by js/chapters.js with the chapter's progress p)
window.LR_BSPD = {
  scroll(p) {
    if (p < 0.34) set(true, 1.5, "scroll");          // hard braking alone
    else if (p < 0.64) set(false, 8, "scroll");     // power alone
    else set(true, 8, "scroll");                     // both: the timer runs, then trips
  },
};
root.addEventListener("pointermove", (e) => {
  const box = root.getBoundingClientRect();
  const fx = (e.clientX - box.left) / box.width, fy = (e.clientY - box.top) / box.height;
  takeOver();
  set(fx < 0.5 || fy > 0.85 ? fx < 0.5 : want.brake, fx >= 0.5 ? Math.round(10 * Math.min(1, (fx - 0.5) / 0.4) * MODEL.kwMax) / 10 : want.kw, "user");
});
root.addEventListener("pointerleave", () => { want.brake = false; run(); });
root.addEventListener("click", () => { takeOver(); reset(); });
root.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  if (key === "b") { takeOver(); set(!want.brake, want.kw, "user"); }
  else if (key === "p") { takeOver(); set(want.brake, want.kw >= MODEL.kwLimit ? 1.5 : 8, "user"); }
  else if (key === "r") { takeOver(); reset(); }
  else return;
  e.preventDefault();
});
new IntersectionObserver((en) => { visible = en[en.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(root);
draw();
})();
`;
writeFileSync(join(ROOT, "js", "bspd.js"), live);

// vendor copy of the kit for the browser (classic script: exports stripped)
writeFileSync(join(ROOT, "js", "vendor", "iso-kit.js"), "/* Anatomy iso kit (MIT) — see tools/anatomy-kit/LICENSE */\n" + readFileSync(join(HERE, "..", "anatomy-kit", "iso-kit.mjs"), "utf8").replace(/^export /gm, ""));
console.log("wrote partials/bspd-figure.html, js/bspd.js, js/vendor/iso-kit.js");
