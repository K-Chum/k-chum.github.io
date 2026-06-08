/**
 * sim-graph.js — Shared canvas graph utilities for simulation iframes
 *
 * Include in every canvas-based simulation AFTER your own <script>:
 *   <script src="../../../template/sim-graph.js"></script>
 *
 * Provides a SimGraph class that encapsulates:
 *   - Canvas sizing (DPR-aware)
 *   - Grid drawing
 *   - Axis drawing with numeric labels
 *   - Curve plotting (any fn, any color/width)
 *   - Point / dot drawing
 *   - Dashed crosshair lines
 *   - Window resize handler wiring
 *
 * Usage:
 *   const g = new SimGraph('my-canvas-id', {
 *     originRatioX: 0.15,   // x-origin as fraction of canvas width
 *     originRatioY: 0.85,   // y-origin as fraction of canvas height
 *     xRange: [0, 5],       // data x range shown
 *     yRange: [0, 6],       // data y range shown
 *   });
 *
 *   g.begin();              // clear + resize
 *   g.drawGrid();
 *   g.drawAxes({ xMax: 5, yMax: 6 });
 *   g.drawCurve(x => 0.5*x*x + 1, { color: '#a78bfa', lineWidth: 3 });
 *   g.drawDot(2, 3, { color: '#db2777', radius: 6 });
 *   g.drawCrosshair(2, 3, { color: 'rgba(219,39,119,0.4)', dash: [5,4] });
 *
 *   // Wire resize:
 *   window.addEventListener('resize', () => { g.begin(); myDrawFn(); });
 */

'use strict';

class SimGraph {
  /**
   * @param {string} canvasId  - The id of the <canvas> element
   * @param {object} opts
   * @param {number} [opts.originRatioX=0.15]  fraction from left for x=0
   * @param {number} [opts.originRatioY=0.85]  fraction from top for y=0
   * @param {number} [opts.xRange=5]            data units visible on x-axis
   * @param {number} [opts.yRange=6]            data units visible on y-axis
   * @param {number} [opts.paddingRatio=0.75]   fraction of canvas used for data
   */
  constructor(canvasId, opts = {}) {
    this.canvasId = canvasId;
    this.opts = Object.assign({
      originRatioX: 0.15,
      originRatioY: 0.85,
      xRange: 5,
      yRange: 6,
      paddingRatio: 0.75,
    }, opts);

    this.canvas = null;
    this.ctx = null;
    this.width = 0;
    this.height = 0;
    this.originX = 0;
    this.originY = 0;
    this.scaleX = 1;
    this.scaleY = 1;
  }

  /** Resolve canvas, resize to CSS pixel dimensions, recalculate geometry. */
  begin() {
    const canvas = document.getElementById(this.canvasId);
    if (!canvas) return false;
    this.canvas = canvas;

    const rect = canvas.getBoundingClientRect();
    canvas.width  = Math.round(rect.width);
    canvas.height = Math.round(rect.height);

    this.ctx    = canvas.getContext('2d');
    this.width  = canvas.width;
    this.height = canvas.height;

    const { originRatioX, originRatioY, xRange, yRange, paddingRatio } = this.opts;
    this.originX = this.width  * originRatioX;
    this.originY = this.height * originRatioY;
    this.scaleX  = (this.width  * paddingRatio) / xRange;
    this.scaleY  = (this.height * paddingRatio) / yRange;

    this.ctx.clearRect(0, 0, this.width, this.height);
    return true;
  }

  /** Convert data coords → canvas pixel coords */
  toScreen(dataX, dataY) {
    return {
      x: this.originX + dataX * this.scaleX,
      y: this.originY - dataY * this.scaleY,
    };
  }

  /** Convert canvas pixel coords → data coords */
  toData(screenX, screenY) {
    return {
      x: (screenX - this.originX) / this.scaleX,
      y: (this.originY - screenY) / this.scaleY,
    };
  }

  /**
   * Draw light-grey grid lines.
   * @param {object} [style]
   * @param {string} [style.color='#e2e8f0']
   * @param {number} [style.lineWidth=1]
   */
  drawGrid(style = {}) {
    const ctx = this.ctx;
    ctx.strokeStyle = style.color     || '#e2e8f0';
    ctx.lineWidth   = style.lineWidth || 1;

    // Vertical lines
    const minK = Math.ceil(-this.originX / this.scaleX);
    const maxK = Math.floor((this.width - this.originX) / this.scaleX);
    for (let k = minK; k <= maxK; k++) {
      const xPos = this.originX + k * this.scaleX;
      ctx.beginPath();
      ctx.moveTo(xPos, 0);
      ctx.lineTo(xPos, this.height);
      ctx.stroke();
    }

    // Horizontal lines
    const minM = Math.ceil((this.originY - this.height) / this.scaleY);
    const maxM = Math.floor(this.originY / this.scaleY);
    for (let m = minM; m <= maxM; m++) {
      const yPos = this.originY - m * this.scaleY;
      ctx.beginPath();
      ctx.moveTo(0, yPos);
      ctx.lineTo(this.width, yPos);
      ctx.stroke();
    }
  }

  /**
   * Draw x and y axes with tick labels.
   * @param {object} [opts]
   * @param {number} [opts.xMax=5]         number of integer ticks on x
   * @param {number} [opts.yMax=6]         number of integer ticks on y
   * @param {number} [opts.xStep=1]        tick step on x
   * @param {number} [opts.yStep=1]        tick step on y
   * @param {string} [opts.axisColor='#94a3b8']
   * @param {string} [opts.labelColor='#64748b']
   * @param {string} [opts.font='11px sans-serif']
   */
  drawAxes(opts = {}) {
    const ctx = this.ctx;
    const xMax  = opts.xMax  || this.opts.xRange;
    const yMax  = opts.yMax  || this.opts.yRange;
    const xStep = opts.xStep || 1;
    const yStep = opts.yStep || 1;

    // Axis lines
    ctx.strokeStyle = opts.axisColor || '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, this.originY); ctx.lineTo(this.width, this.originY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(this.originX, 0); ctx.lineTo(this.originX, this.height); ctx.stroke();

    // Labels
    ctx.fillStyle = opts.labelColor || '#64748b';
    ctx.font = opts.font || '11px sans-serif';

    ctx.textAlign = 'center';
    for (let x = xStep; x <= xMax; x += xStep) {
      ctx.fillText(x.toString(), this.originX + x * this.scaleX, this.originY + 14);
    }

    ctx.textAlign = 'right';
    for (let y = yStep; y <= yMax; y += yStep) {
      ctx.fillText(y.toString(), this.originX - 6, this.originY - y * this.scaleY + 4);
    }
    ctx.fillText('0', this.originX - 6, this.originY + 10);
  }

  /**
   * Plot a mathematical curve y = fn(x).
   * @param {Function} fn       - Function of x returning y
   * @param {object}   [style]
   * @param {string}   [style.color='#a78bfa']
   * @param {number}   [style.lineWidth=3]
   * @param {number}   [style.xStart]      defaults to 0
   * @param {number}   [style.xEnd]        defaults to xRange
   */
  drawCurve(fn, style = {}) {
    const ctx = this.ctx;
    ctx.strokeStyle = style.color     || '#a78bfa';
    ctx.lineWidth   = style.lineWidth || 3;

    const xStart = style.xStart !== undefined ? style.xStart : 0;
    const xEnd   = style.xEnd   !== undefined ? style.xEnd   : this.opts.xRange;
    const startPx = this.originX + xStart * this.scaleX;
    const endPx   = this.originX + xEnd   * this.scaleX;

    ctx.beginPath();
    let isFirst = true;
    for (let px = Math.max(0, startPx); px <= Math.min(this.width, endPx); px++) {
      const dataX  = (px - this.originX) / this.scaleX;
      let dataY;
      try { dataY = fn(dataX); } catch(e) { isFirst = true; continue; }
      if (!isFinite(dataY)) { isFirst = true; continue; }
      const screenY = this.originY - dataY * this.scaleY;
      if (isFirst) { ctx.moveTo(px, screenY); isFirst = false; }
      else          { ctx.lineTo(px, screenY); }
    }
    ctx.stroke();
  }

  /**
   * Draw a solid dot at data coordinates.
   * @param {number}   dataX
   * @param {number}   dataY
   * @param {object}   [style]
   * @param {string}   [style.color='#8b5cf6']
   * @param {number}   [style.radius=6]
   * @param {boolean}  [style.outline=true]   white ring
   */
  drawDot(dataX, dataY, style = {}) {
    const ctx = this.ctx;
    const { x, y } = this.toScreen(dataX, dataY);
    const r = style.radius || 6;

    ctx.fillStyle = style.color || '#8b5cf6';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    if (style.outline !== false) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  /**
   * Draw an open (hollow) circle — used for "hole" / excluded points.
   * @param {number}   dataX
   * @param {number}   dataY
   * @param {object}   [style]
   * @param {string}   [style.color='#ef4444']
   * @param {number}   [style.radius=6]
   */
  drawHole(dataX, dataY, style = {}) {
    const ctx = this.ctx;
    const { x, y } = this.toScreen(dataX, dataY);
    const r = style.radius || 6;
    ctx.strokeStyle = style.color || '#ef4444';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  /**
   * Draw dashed crosshair lines from axes to a point.
   * @param {number}   dataX
   * @param {number}   dataY
   * @param {object}   [style]
   * @param {string}   [style.color='rgba(219,39,119,0.4)']
   * @param {number[]} [style.dash=[5,4]]
   * @param {number}   [style.lineWidth=1.2]
   */
  drawCrosshair(dataX, dataY, style = {}) {
    const ctx = this.ctx;
    const { x: sx, y: sy } = this.toScreen(dataX, dataY);

    ctx.strokeStyle = style.color     || 'rgba(219,39,119,0.4)';
    ctx.lineWidth   = style.lineWidth || 1.2;
    ctx.setLineDash(style.dash        || [5, 4]);

    ctx.beginPath();
    ctx.moveTo(sx, this.originY);
    ctx.lineTo(sx, sy);
    ctx.lineTo(this.originX, sy);
    ctx.stroke();

    ctx.setLineDash([]);
  }

  /**
   * Draw a straight line between two data points.
   * @param {number} x1 @param {number} y1
   * @param {number} x2 @param {number} y2
   * @param {object} [style]
   */
  drawLine(x1, y1, x2, y2, style = {}) {
    const ctx = this.ctx;
    const p1 = this.toScreen(x1, y1);
    const p2 = this.toScreen(x2, y2);

    ctx.strokeStyle = style.color     || '#64748b';
    ctx.lineWidth   = style.lineWidth || 2;
    if (style.dash) ctx.setLineDash(style.dash);

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();

    ctx.setLineDash([]);
  }

  /**
   * Convenience: wire resize so caller's draw function re-runs on resize.
   * @param {Function} drawFn - Your full draw function (calls begin() inside)
   * @param {number}   [delay=100]  - Debounce delay in ms
   */
  onResize(drawFn, delay = 100) {
    let t;
    window.addEventListener('resize', () => {
      clearTimeout(t);
      t = setTimeout(drawFn, delay);
    });
  }
}

// ─── KaTeX helper ────────────────────────────────────────────────────────────
/**
 * Render a LaTeX string to an HTML string using KaTeX.
 * Gracefully degrades to the raw LaTeX if KaTeX isn't loaded yet.
 *
 * @param {string}  latex       - LaTeX expression (no delimiters)
 * @param {boolean} [display]   - true for display (block) mode
 * @returns {string}            - HTML string ready for innerHTML
 */
function renderKaTeX(latex, display = false) {
  if (typeof katex === 'undefined') return latex;
  try {
    return katex.renderToString(latex, { throwOnError: false, displayMode: display });
  } catch (e) {
    return latex;
  }
}

/**
 * KaTeX auto-render configuration used by all simulations.
 * Call this in onload of the auto-render script, or after DOMContentLoaded.
 */
function autoRenderMath(rootEl) {
  if (typeof renderMathInElement === 'undefined') return;
  renderMathInElement(rootEl || document.body, {
    delimiters: [
      { left: '$$', right: '$$',   display: true  },
      { left: '$',  right: '$',    display: false },
      { left: '\\(', right: '\\)', display: false },
      { left: '\\[', right: '\\]', display: true  },
    ],
    throwOnError: false,
  });
}
