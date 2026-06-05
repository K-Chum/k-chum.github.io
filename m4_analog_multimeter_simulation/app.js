/* =============================================
   MultimeterLab — App Logic  (app.js)
   DC Voltage · Sanwa-style multi-row scale
   ============================================= */

'use strict';

// ─────────────────────────────────────────────
// 1. RANGE DEFINITIONS  (DC Voltage only)
// ─────────────────────────────────────────────
const RANGES = [
  { id:'dcv-5',    label:'5',    display:'5 V',    fullScale:5,    unit:'V DC', decimalPlaces:2, dialAngle:288 },
  { id:'dcv-10',   label:'10',   display:'10 V',   fullScale:10,   unit:'V DC', decimalPlaces:2, dialAngle:263 },
  { id:'dcv-50',   label:'50',   display:'50 V',   fullScale:50,   unit:'V DC', decimalPlaces:1, dialAngle:276 },
  { id:'dcv-1000', label:'1000', display:'1000 V', fullScale:1000, unit:'V DC', decimalPlaces:0, dialAngle:300 }
];

// ─────────────────────────────────────────────
// 2. SCALE GEOMETRY
// ─────────────────────────────────────────────
const SC = {
  cx: 230, cy: 224,
  r: 185, rMirror: 189,
  aMin: -65, aMax: 65
};

// ─────────────────────────────────────────────
// 3. MULTI-ROW SCALE CONFIG
// ─────────────────────────────────────────────
const SCALE_ROWS = [
  { rangeId:'dcv-1000', labelR:155 },
  { rangeId:'dcv-5',    labelR:141 },
  { rangeId:'dcv-50',   labelR:127 },
  { rangeId:'dcv-10',   labelR:113 },
];
const SEP_RADII = [163, 148, 134, 120, 106];

const DIAL = { cx:215, cy:443 };

// ─────────────────────────────────────────────
// 4. HELPERS
// ─────────────────────────────────────────────
function p2xy(angleDeg, r) {
  const rad = angleDeg * Math.PI / 180;
  return { x: SC.cx + r * Math.sin(rad), y: SC.cy - r * Math.cos(rad) };
}
function fToAngle(f) { return SC.aMin + f * (SC.aMax - SC.aMin); }
function fmt(val, range) { return val.toFixed(range.decimalPlaces); }
function fmtLabel(rawVal, range) {
  if (rawVal === 0) return '0';
  if (range.decimalPlaces === 0) return Math.round(rawVal).toString();
  if (range.decimalPlaces === 1) {
    const s = rawVal.toFixed(1);
    return s.endsWith('.0') ? Math.round(rawVal).toString() : s;
  }
  return rawVal.toFixed(2).replace(/\.?0+$/, '');
}
function svgEl(tag) { return document.createElementNS('http://www.w3.org/2000/svg', tag); }

// ─────────────────────────────────────────────
// 5. STATE
// ─────────────────────────────────────────────
const state = {
  rangeId:'dcv-10', fraction:0.5, answerValue:0,
  revealed:false, attempts:0, hintVisible:true,
  needleAngle:0, targetAngle:0, animId:null
};
function curRange() { return RANGES.find(r => r.id === state.rangeId); }

// ─────────────────────────────────────────────
// 6. SCALE DRAWING
// ─────────────────────────────────────────────
function drawScale(activeRange) {
  const tickGrp = document.getElementById('scale-ticks-group');
  const lblGrp  = document.getElementById('scale-labels-group');
  const mirGrp  = document.getElementById('mirror-group');
  tickGrp.innerHTML = lblGrp.innerHTML = mirGrp.innerHTML = '';

  addArc(mirGrp, SC.rMirror,     '#bab69e', 5.5, 0.5);
  addArc(mirGrp, SC.rMirror - 4, '#666',    0.5, 0.45);
  SEP_RADII.forEach(r => addArc(mirGrp, r, '#888', 0.55, 0.35));

  const TOTAL = 100;
  for (let i = 0; i <= TOTAL; i++) {
    const f     = i / TOTAL;
    const angle = fToAngle(f);
    const isMaj = (i % 10 === 0);
    const isHalf= (i % 10 === 5);
    const rIn   = isMaj ? 163 : (isHalf ? 174 : 181);
    addTick(tickGrp, angle, SC.r, rIn,
            isMaj ? '#1c1c1c' : (isHalf ? '#1c1c1c' : '#404040'),
            isMaj ? 1.8 : (isHalf ? 1.35 : 0.75));
  }

  SCALE_ROWS.forEach(row => {
    const range    = RANGES.find(r => r.id === row.rangeId);
    const isActive = row.rangeId === activeRange.id;
    const fillCol  = isActive ? '#0d0d0d' : '#b8b099';
    const fSize    = isActive ? '8.5' : '7';
    const fWeight  = isActive ? '700' : '400';

    for (let i = 0; i <= 10; i++) {
      const f      = i / 10;
      const angle  = fToAngle(f);
      const rawVal = f * range.fullScale;
      const pos    = p2xy(angle, row.labelR);
      const txt    = svgEl('text');
      txt.setAttribute('x',                 pos.x.toFixed(2));
      txt.setAttribute('y',                 pos.y.toFixed(2));
      txt.setAttribute('text-anchor',       'middle');
      txt.setAttribute('dominant-baseline', 'central');
      txt.setAttribute('font-family',       'Arial Narrow, Arial, sans-serif');
      txt.setAttribute('font-size',         fSize);
      txt.setAttribute('font-weight',       fWeight);
      txt.setAttribute('fill',              fillCol);
      txt.textContent = fmtLabel(rawVal, range);
      lblGrp.appendChild(txt);
    }

    const rEdge   = p2xy(SC.aMax + 3.5, row.labelR);
    const edgeLbl = svgEl('text');
    edgeLbl.setAttribute('x',                 rEdge.x.toFixed(2));
    edgeLbl.setAttribute('y',                 rEdge.y.toFixed(2));
    edgeLbl.setAttribute('text-anchor',       'start');
    edgeLbl.setAttribute('dominant-baseline', 'central');
    edgeLbl.setAttribute('font-family',       'Arial Narrow, Arial, sans-serif');
    edgeLbl.setAttribute('font-size',         isActive ? '6.5' : '5.5');
    edgeLbl.setAttribute('font-weight',       isActive ? '700' : '400');
    edgeLbl.setAttribute('fill',              isActive ? '#444' : '#ccc');
    edgeLbl.textContent = `${range.fullScale}V`;
    lblGrp.appendChild(edgeLbl);
  });

  const readout = document.getElementById('scale-range-readout');
  if (readout) readout.textContent = `0 – ${activeRange.fullScale} V`;
}

function addArc(group, r, stroke, width, opacity) {
  const path = buildArcPath(r, SC.aMin, SC.aMax, 80);
  path.setAttribute('stroke',       stroke);
  path.setAttribute('stroke-width', width.toString());
  path.setAttribute('opacity',      opacity.toString());
  group.appendChild(path);
}
function addTick(group, angleDeg, rOut, rIn, stroke, width) {
  const outer = p2xy(angleDeg, rOut);
  const inner = p2xy(angleDeg, rIn);
  const ln = svgEl('line');
  ln.setAttribute('x1', outer.x.toFixed(2)); ln.setAttribute('y1', outer.y.toFixed(2));
  ln.setAttribute('x2', inner.x.toFixed(2)); ln.setAttribute('y2', inner.y.toFixed(2));
  ln.setAttribute('stroke', stroke); ln.setAttribute('stroke-width', width.toString());
  ln.setAttribute('stroke-linecap', 'round');
  group.appendChild(ln);
}
function buildArcPath(r, aMin, aMax, steps) {
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const a = aMin + (aMax - aMin) * (i / steps);
    const p = p2xy(a, r);
    d += (i === 0 ? 'M' : 'L') + `${p.x.toFixed(2)},${p.y.toFixed(2)} `;
  }
  const path = svgEl('path');
  path.setAttribute('d', d); path.setAttribute('fill', 'none');
  path.setAttribute('stroke-linecap', 'round');
  return path;
}

// ─────────────────────────────────────────────
// 7. NEEDLE ANIMATION
// ─────────────────────────────────────────────
function animateNeedle() {
  const diff = state.targetAngle - state.needleAngle;
  if (Math.abs(diff) < 0.08) {
    state.needleAngle = state.targetAngle;
    applyNeedle(state.needleAngle);
    state.animId = null; return;
  }
  state.needleAngle += diff * 0.11;
  applyNeedle(state.needleAngle);
  state.animId = requestAnimationFrame(animateNeedle);
}
function applyNeedle(angle) {
  document.getElementById('needle-group')
    .setAttribute('transform', `rotate(${angle.toFixed(3)}, ${SC.cx}, ${SC.cy})`);
}
function setNeedle(fraction) {
  state.fraction    = Math.max(0, Math.min(1, fraction));
  state.targetAngle = fToAngle(state.fraction);
  if (state.animId) cancelAnimationFrame(state.animId);
  state.animId = requestAnimationFrame(animateNeedle);
}

// ─────────────────────────────────────────────
// 8. DIAL POINTER
// ─────────────────────────────────────────────
function setDialPointer(range) {
  document.getElementById('dial-ptr')
    .setAttribute('transform', `rotate(${range.dialAngle}, ${DIAL.cx}, ${DIAL.cy})`);
  document.querySelectorAll('.dlbl').forEach(el => {
    const active = el.dataset.rid === range.id;
    el.setAttribute('fill',        active ? '#fbbf24' : '#666');
    el.setAttribute('font-weight', active ? '800'     : '600');
  });
}

// ─────────────────────────────────────────────
// 9. READING GENERATION
// ─────────────────────────────────────────────
function generateReading(range) {
  const TOTAL = 100; const minF = 0.05; const maxF = 0.95;
  let f;
  if (Math.random() < 0.30) {
    const idx = Math.round(minF*TOTAL) + Math.floor(Math.random()*Math.round((maxF-minF)*TOTAL));
    f = idx / TOTAL;
  } else {
    const idx = Math.round(minF*TOTAL) + Math.floor(Math.random()*Math.round((maxF-minF)*TOTAL));
    f = (idx + 0.15 + Math.random()*0.70) / TOTAL;
  }
  return { f: Math.max(minF, Math.min(maxF, f)), answer: f * range.fullScale };
}

// ─────────────────────────────────────────────
// 10. UI UPDATES
// ─────────────────────────────────────────────
function updateHints(range) {
  const maj = range.fullScale / 10;
  const min = maj / 10;
  document.getElementById('hint-full-scale').textContent = `0 – ${range.fullScale} ${range.unit}`;
  document.getElementById('hint-major-div').textContent  = `${fmt(maj, range)} V  (long mark)`;
  document.getElementById('hint-minor-div').textContent  = `${fmt(min, range)} V  (short mark)`;
}
function updateRangeDisplay(range) {
  document.getElementById('range-display-text').textContent = range.display;
}
function hideAnswer() {
  document.getElementById('answer-panel').classList.remove('visible');
  state.revealed = false;
}
function revealAnswer() {
  if (state.revealed) return;
  const range = curRange();
  document.getElementById('answer-value').textContent        = fmt(state.answerValue, range);
  document.getElementById('answer-unit-display').textContent = range.unit;
  const rem    = (state.fraction * 100) % 1;
  const onTick = rem < 0.04 || rem > 0.96;
  document.getElementById('answer-note').textContent = onTick
    ? '✓ This reading lands exactly on a tick mark.'
    : '⚠ Between tick marks — estimation was needed!';
  document.getElementById('answer-panel').classList.add('visible');
  state.revealed = true; state.attempts++;
  document.getElementById('score-attempts').textContent = state.attempts;
}

// ─────────────────────────────────────────────
// 11. NEW READING
// ─────────────────────────────────────────────
function newReading() {
  hideAnswer();
  const range = curRange();
  const { f, answer } = generateReading(range);
  state.answerValue = answer;
  setNeedle(f);
}

// ─────────────────────────────────────────────
// 12. RANGE SELECTION
// ─────────────────────────────────────────────
function selectRange(rangeId) {
  state.rangeId = rangeId;
  const range = curRange();

  // Update range selector buttons
  document.querySelectorAll('.range-btn').forEach(btn => {
    const active = btn.dataset.rid === rangeId;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  });

  drawScale(range);
  updateHints(range);
  updateRangeDisplay(range);
  setDialPointer(range);
  newReading();
}

// ─────────────────────────────────────────────
// 13. BUILD RANGE BUTTONS
// ─────────────────────────────────────────────
function buildRangeButtons() {
  const container = document.getElementById('range-buttons');
  if (!container) return;
  RANGES.forEach(range => {
    const btn = document.createElement('button');
    btn.className   = 'range-btn' + (range.id === state.rangeId ? ' active' : '');
    btn.dataset.rid = range.id;
    btn.setAttribute('aria-pressed', String(range.id === state.rangeId));
    btn.setAttribute('aria-label',   `Select ${range.display} range`);
    btn.textContent = range.display;
    btn.addEventListener('click', () => selectRange(range.id));
    container.appendChild(btn);
  });
}

// ─────────────────────────────────────────────
// 14. WIRE DIAL LABELS (click to select range)
// ─────────────────────────────────────────────
function wireDialLabels() {
  document.querySelectorAll('.dlbl').forEach(el => {
    el.style.cursor = 'pointer';
    el.addEventListener('click', () => selectRange(el.dataset.rid));
    el.addEventListener('mouseenter', () => {
      if (el.dataset.rid !== state.rangeId) el.setAttribute('fill', '#bbb');
    });
    el.addEventListener('mouseleave', () => {
      if (el.dataset.rid !== state.rangeId) el.setAttribute('fill', '#666');
    });
  });
}

// ─────────────────────────────────────────────
// 15. HINT TOGGLE
// ─────────────────────────────────────────────
function initHintToggle() {
  const btn  = document.getElementById('toggle-hint-btn');
  const hint = document.getElementById('scale-hint');
  if (!btn || !hint) return;
  btn.addEventListener('click', () => {
    state.hintVisible = !state.hintVisible;
    hint.classList.toggle('collapsed', !state.hintVisible);
    btn.classList.toggle('collapsed',  !state.hintVisible);
    btn.setAttribute('aria-expanded', String(state.hintVisible));
  });
}

// ─────────────────────────────────────────────
// 16. INIT
// ─────────────────────────────────────────────
function init() {
  buildRangeButtons();
  wireDialLabels();
  initHintToggle();

  const range = curRange();
  drawScale(range);
  updateHints(range);
  updateRangeDisplay(range);
  setDialPointer(range);
  newReading();

  document.getElementById('btn-new').addEventListener('click', newReading);
  document.getElementById('btn-reveal').addEventListener('click', revealAnswer);
  document.getElementById('btn-reset').addEventListener('click', () => {
    state.attempts = 0;
    document.getElementById('score-attempts').textContent = '0';
  });
}

document.addEventListener('DOMContentLoaded', init);
