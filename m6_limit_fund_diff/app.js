/**
 * Math Lab Academy - Limits & Derivatives (M.6)
 * Interactive Controller and Visualizations
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================
  // 1. SLIDE NAVIGATION SYSTEM
  // =========================================================
  const slides = document.querySelectorAll('.slide');
  const dotsContainer = document.getElementById('nav-dots');
  const progressBar = document.getElementById('progress-bar');
  const currentSlideLabel = document.getElementById('current-slide');
  const totalSlidesLabel = document.getElementById('total-slides');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  
  let currentSlideIndex = 0;
  const totalSlides = slides.length;
  totalSlidesLabel.textContent = totalSlides - 1;

  // Render navigation dots
  dotsContainer.innerHTML = '';
  slides.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.className = `dot ${index === 0 ? 'active' : ''}`;
    dot.addEventListener('click', () => goToSlide(index));
    dotsContainer.appendChild(dot);
  });
  const dots = document.querySelectorAll('.dot');

  function updateNav() {
    // Enable/disable buttons
    prevBtn.disabled = currentSlideIndex === 0;
    nextBtn.disabled = currentSlideIndex === totalSlides - 1;
    
    // Update dots
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentSlideIndex);
    });
    
    // Update progress bar
    const progressPercent = (currentSlideIndex / (totalSlides - 1)) * 100;
    progressBar.style.width = `${progressPercent}%`;
    
    // Update slide number
    currentSlideLabel.textContent = currentSlideIndex;
    
    // Redraw active slide canvas if needed
    setTimeout(drawActiveSlideVisuals, 100);
  }

  function goToSlide(index) {
    if (index < 0 || index >= totalSlides) return;
    
    slides[currentSlideIndex].classList.remove('active');
    currentSlideIndex = index;
    slides[currentSlideIndex].classList.add('active');
    
    updateNav();
  }

  prevBtn.addEventListener('click', () => goToSlide(currentSlideIndex - 1));
  nextBtn.addEventListener('click', () => goToSlide(currentSlideIndex + 1));



  // =========================================================
  // 2. CANVAS DRAWING UTILITIES
  // =========================================================
  function resizeCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const parent = canvas.parentElement;
    const rect = parent.getBoundingClientRect();
    
    // Stable width and stable fixed height of 300px to prevent layout changes when drawing
    const width = rect.width - 32;
    const height = 300;
    
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
  }

  function getCanvasCtx(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;
    return { ctx, width, height };
  }

  function drawGrid(ctx, width, height, scaleX, scaleY, originX, originY) {
    ctx.clearRect(0, 0, width, height);
    
    // Soft grid lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    
    // Draw vertical grid lines
    const startX = originX % scaleX;
    for (let x = startX; x < width; x += scaleX) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Draw horizontal grid lines
    const startY = originY % scaleY;
    for (let y = startY; y < height; y += scaleY) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // X and Y Axes
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    
    // X Axis
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    ctx.stroke();
    
    // Y Axis
    ctx.beginPath();
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.stroke();
  }

  // =========================================================
  // SLIDE 1: LIMIT DEFINITION WIDGET
  // =========================================================
  const limitDefSlider = document.getElementById('limit-def-slider');
  const limitDefXLabel = document.getElementById('limit-def-x-val');
  const limitDefYLabel = document.getElementById('limit-def-y-val');
  
  if (limitDefSlider) {
    limitDefSlider.addEventListener('input', (e) => {
      const xVal = parseFloat(e.target.value);
      limitDefXLabel.textContent = xVal.toFixed(2);
      
      // Calculate f(x) = 0.5 * x^2 + 1
      const yVal = 0.5 * xVal * xVal + 1;
      limitDefYLabel.textContent = yVal.toFixed(2);
      
      // Highlight table rows based on proximity to 2.0
      highlightLimitTableRows(xVal);
      drawLimitDefGraph();
    });
  }

  function highlightLimitTableRows(xVal) {
    // Clear previous active rows
    const rows = document.querySelectorAll('.approx-table tr');
    rows.forEach(r => r.classList.remove('active-row'));
    
    if (xVal < 2) {
      // Approaching from left
      if (xVal <= 1.7) {
        document.getElementById('row-l1')?.classList.add('active-row');
      } else if (xVal <= 1.95) {
        document.getElementById('row-l2')?.classList.add('active-row');
      } else if (xVal <= 1.995) {
        document.getElementById('row-l3')?.classList.add('active-row');
      } else {
        document.getElementById('row-l4')?.classList.add('active-row');
      }
    } else if (xVal > 2) {
      // Approaching from right
      if (xVal >= 2.3) {
        document.getElementById('row-r1')?.classList.add('active-row');
      } else if (xVal >= 2.05) {
        document.getElementById('row-r2')?.classList.add('active-row');
      } else if (xVal >= 2.005) {
        document.getElementById('row-r3')?.classList.add('active-row');
      } else {
        document.getElementById('row-r4')?.classList.add('active-row');
      }
    } else {
      // x = 2
      document.getElementById('row-l4')?.classList.add('active-row');
      document.getElementById('row-r4')?.classList.add('active-row');
    }
  }

  function drawLimitDefGraph() {
    const visual = getCanvasCtx('limit-def-canvas');
    if (!visual) return;
    
    const { ctx, width, height } = visual;
    
    // Scale config: x goes from 0 to 4, y goes from 0 to 4
    const originX = width * 0.15;
    const originY = height * 0.85;
    const scaleX = (width * 0.75) / 4;
    const scaleY = (height * 0.75) / 4;
    
    drawGrid(ctx, width, height, scaleX, scaleY, originX, originY);
    
    // Draw numbers on axes
    ctx.fillStyle = '#64748b';
    ctx.font = '12px Outfit';
    ctx.textAlign = 'center';
    
    // X Axis ticks
    for (let x = 1; x <= 4; x++) {
      ctx.fillText(x.toString(), originX + x * scaleX, originY + 18);
    }
    // Y Axis ticks
    ctx.textAlign = 'right';
    for (let y = 1; y <= 4; y++) {
      ctx.fillText(y.toString(), originX - 8, originY - y * scaleY + 4);
    }
    ctx.fillText('0', originX - 8, originY + 14);
    
    // Draw curve: f(x) = 0.5 * x^2 + 1
    ctx.strokeStyle = '#a78bfa';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    let isFirst = true;
    for (let screenX = originX; screenX < width; screenX++) {
      const x = (screenX - originX) / scaleX;
      if (x > 3.8) break; // Keep within boundaries
      const y = 0.5 * x * x + 1;
      const screenY = originY - y * scaleY;
      
      if (isFirst) {
        ctx.moveTo(screenX, screenY);
        isFirst = false;
      } else {
        ctx.lineTo(screenX, screenY);
      }
    }
    ctx.stroke();
    
    // Target Point: x=2, y=3
    const targetScreenX = originX + 2 * scaleX;
    const targetScreenY = originY - 3 * scaleY;
    
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
    ctx.setLineDash([5, 4]);
    ctx.lineWidth = 1.5;
    
    // Target projection lines
    ctx.beginPath();
    ctx.moveTo(targetScreenX, originY);
    ctx.lineTo(targetScreenX, targetScreenY);
    ctx.lineTo(originX, targetScreenY);
    ctx.stroke();
    ctx.setLineDash([]); // Reset
    
    // Current Point
    const currentX = parseFloat(limitDefSlider.value);
    const currentY = 0.5 * currentX * currentX + 1;
    const currentScreenX = originX + currentX * scaleX;
    const currentScreenY = originY - currentY * scaleY;
    
    // Projections of current point
    ctx.strokeStyle = currentX < 2 ? '#8b5cf6' : '#ec4899';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(currentScreenX, originY);
    ctx.lineTo(currentScreenX, currentScreenY);
    ctx.lineTo(originX, currentScreenY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Target Dot
    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    ctx.arc(targetScreenX, targetScreenY, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Current Dot
    ctx.fillStyle = currentX < 2 ? '#8b5cf6' : '#ec4899';
    ctx.beginPath();
    ctx.arc(currentScreenX, currentScreenY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Text Labels on Graph
    ctx.fillStyle = '#1e1b4b';
    ctx.font = 'bold 13px Noto Sans Thai';
    ctx.textAlign = 'left';
    ctx.fillText('L = 3', targetScreenX + 10, targetScreenY - 8);
    
    ctx.fillStyle = currentX < 2 ? '#8b5cf6' : '#ec4899';
    ctx.fillText(`x = ${currentX.toFixed(2)}`, currentScreenX - 22, originY - 10);
    ctx.fillText(`y = ${currentY.toFixed(2)}`, originX + 10, currentScreenY - 6);
  }

  // =========================================================
  // SLIDE 2: EVALUATING LIMITS OF POLYNOMIALS
  // =========================================================
  const polyFuncSelect = document.getElementById('poly-func-select');
  const polyCButtons = document.querySelectorAll('#poly-c-buttons button');
  const polyLimitNotation = document.getElementById('poly-limit-notation');
  const polyCDisplay = document.getElementById('poly-c-display');
  const polySubstitution = document.getElementById('poly-substitution');
  const polyResult = document.getElementById('poly-result');
  
  let selectedC = 1;
  
  if (polyFuncSelect && polyCButtons.length > 0) {
    polyFuncSelect.addEventListener('change', updatePolynomialLimit);
    
    polyCButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        polyCButtons.forEach(b => {
          b.className = 'step-btn';
          b.style.background = 'var(--primary-light)';
          b.style.color = 'var(--primary)';
        });
        
        btn.className = 'step-btn';
        btn.style.background = 'var(--primary)';
        btn.style.color = 'white';
        
        selectedC = parseInt(btn.getAttribute('data-c'));
        updatePolynomialLimit();
      });
    });
  }

  function updatePolynomialLimit() {
    if (!polyFuncSelect) return;
    
    const funcType = polyFuncSelect.value;
    const c = selectedC;
    polyCDisplay.textContent = c;
    
    let notationHTML = '';
    let substitutionHTML = '';
    let resultValue = 0;
    
    const fmtC = `${c}`;
    
    if (funcType === '1') {
      // P(x) = x^2 + 2x - 3
      notationHTML = `lim<sub>x→${c}</sub> (x² + 2x - 3)`;
      substitutionHTML = `= (${fmtC})² + 2(${fmtC}) - 3`;
      resultValue = c * c + 2 * c - 3;
    } else if (funcType === '2') {
      // P(x) = 2x^3 - 5x + 4
      notationHTML = `lim<sub>x→${c}</sub> (2x³ - 5x + 4)`;
      substitutionHTML = `= 2(${fmtC})³ - 5(${fmtC}) + 4`;
      resultValue = 2 * (c ** 3) - 5 * c + 4;
    } else if (funcType === '3') {
      // P(x) = -3x^2 + 4x + 6
      notationHTML = `lim<sub>x→${c}</sub> (-3x² + 4x + 6)`;
      substitutionHTML = `= -3(${fmtC})² + 4(${fmtC}) + 6`;
      resultValue = -3 * (c * c) + 4 * c + 6;
    }
    
    polyLimitNotation.innerHTML = notationHTML;
    polySubstitution.innerHTML = substitutionHTML;
    polyResult.innerHTML = `= ${resultValue}`;
  }

  // =========================================================
  // SLIDE 3: LEFT & RIGHT LIMITS (STEP FUNCTION)
  // =========================================================
  const stepSlider = document.getElementById('step-slider');
  const stepXLabel = document.getElementById('step-x-val');
  const stepYLabel = document.getElementById('step-y-val');
  const stepLeftReadout = document.getElementById('step-left-readout');
  const stepRightReadout = document.getElementById('step-right-readout');
  const stepFinalReadout = document.getElementById('step-final-readout');
  
  if (stepSlider) {
    stepSlider.addEventListener('input', (e) => {
      const x = parseFloat(e.target.value);
      stepXLabel.textContent = x.toFixed(2);
      
      const y = x < 2 ? 2.0 : 4.0;
      stepYLabel.textContent = y.toFixed(2);
      
      drawStepFuncGraph();
      updateStepLimitText(x);
    });
  }

  function updateStepLimitText(x) {
    if (!stepLeftReadout) return;
    
    // Highlight based on current x position relative to discontinuity point 2
    if (x < 2) {
      stepLeftReadout.parentElement.classList.add('success-box');
      stepLeftReadout.parentElement.style.opacity = '1';
      stepRightReadout.parentElement.classList.remove('accent-box');
      stepRightReadout.parentElement.style.opacity = '0.5';
    } else if (x > 2) {
      stepLeftReadout.parentElement.classList.remove('success-box');
      stepLeftReadout.parentElement.style.opacity = '0.5';
      stepRightReadout.parentElement.classList.add('accent-box');
      stepRightReadout.parentElement.style.opacity = '1';
    } else {
      stepLeftReadout.parentElement.style.opacity = '1';
      stepRightReadout.parentElement.style.opacity = '1';
    }
  }

  function drawStepFuncGraph() {
    const visual = getCanvasCtx('step-func-canvas');
    if (!visual) return;
    
    const { ctx, width, height } = visual;
    
    // Scale: x in [0, 4], y in [0, 5]
    const originX = width * 0.15;
    const originY = height * 0.85;
    const scaleX = (width * 0.75) / 4;
    const scaleY = (height * 0.75) / 5;
    
    drawGrid(ctx, width, height, scaleX, scaleY, originX, originY);
    
    // Ticks labels
    ctx.fillStyle = '#64748b';
    ctx.font = '12px Outfit';
    ctx.textAlign = 'center';
    
    for (let x = 1; x <= 4; x++) {
      ctx.fillText(x.toString(), originX + x * scaleX, originY + 18);
    }
    ctx.textAlign = 'right';
    for (let y = 1; y <= 5; y++) {
      ctx.fillText(y.toString(), originX - 8, originY - y * scaleY + 4);
    }
    ctx.fillText('0', originX - 8, originY + 14);
    
    // Draw piecewise lines
    // Line 1: y = 2 for x < 2
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(originX, originY - 2 * scaleY);
    ctx.lineTo(originX + 2 * scaleX, originY - 2 * scaleY);
    ctx.stroke();
    
    // Line 2: y = 4 for x >= 2
    ctx.strokeStyle = '#d946ef';
    ctx.beginPath();
    ctx.moveTo(originX + 2 * scaleX, originY - 4 * scaleY);
    ctx.lineTo(originX + 4 * scaleX, originY - 4 * scaleY);
    ctx.stroke();
    
    // Open circle at (2, 2)
    const circleScreenX = originX + 2 * scaleX;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(circleScreenX, originY - 2 * scaleY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Closed dot at (2, 4)
    ctx.fillStyle = '#d946ef';
    ctx.beginPath();
    ctx.arc(circleScreenX, originY - 4 * scaleY, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Current X point
    const currentX = parseFloat(stepSlider.value);
    const currentY = currentX < 2 ? 2 : 4;
    const currentScreenX = originX + currentX * scaleX;
    const currentScreenY = originY - currentY * scaleY;
    
    // Projection line
    ctx.strokeStyle = currentX < 2 ? '#10b981' : '#d946ef';
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(currentScreenX, originY);
    ctx.lineTo(currentScreenX, currentScreenY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Current Dot
    ctx.fillStyle = currentX < 2 ? '#10b981' : '#d946ef';
    ctx.beginPath();
    ctx.arc(currentScreenX, currentScreenY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Highlight labels
    ctx.fillStyle = '#1e1b4b';
    ctx.font = 'bold 12px Noto Sans Thai';
    ctx.textAlign = 'left';
    ctx.fillText('x = 2 (จุดขาดกะทันหัน)', circleScreenX + 8, originY + 5);
  }

  // =========================================================
  // SLIDE 5: INDETERMINATE FORMS & FACTORING (HOLE GRAPH)
  // =========================================================
  const holeSlider = document.getElementById('hole-slider');
  const holeXLabel = document.getElementById('hole-x-val');
  const holeYLabel = document.getElementById('hole-y-val');
  
  if (holeSlider) {
    holeSlider.addEventListener('input', (e) => {
      const x = parseFloat(e.target.value);
      holeXLabel.textContent = x.toFixed(2);
      
      if (Math.abs(x - 2.0) < 0.02) {
        // Exactly or extremely close to 2.0
        holeYLabel.innerHTML = 'ไม่มีนิยาม (0/0)';
        holeYLabel.className = 'badge';
        holeYLabel.style.background = 'var(--error-light)';
        holeYLabel.style.color = 'var(--error)';
      } else {
        const y = x + 2.0;
        holeYLabel.innerHTML = `f(x) = ${y.toFixed(2)}`;
        holeYLabel.className = 'badge';
        holeYLabel.style.background = 'var(--primary-light)';
        holeYLabel.style.color = 'var(--primary)';
      }
      
      drawHoleFuncGraph();
    });
  }

  function drawHoleFuncGraph() {
    const visual = getCanvasCtx('hole-func-canvas');
    if (!visual) return;
    
    const { ctx, width, height } = visual;
    
    // Scale: x in [0, 4], y in [0, 5]
    const originX = width * 0.15;
    const originY = height * 0.85;
    const scaleX = (width * 0.75) / 4;
    const scaleY = (height * 0.75) / 5;
    
    drawGrid(ctx, width, height, scaleX, scaleY, originX, originY);
    
    // Axes ticks
    ctx.fillStyle = '#64748b';
    ctx.font = '12px Outfit';
    ctx.textAlign = 'center';
    for (let x = 1; x <= 4; x++) {
      ctx.fillText(x.toString(), originX + x * scaleX, originY + 18);
    }
    ctx.textAlign = 'right';
    for (let y = 1; y <= 5; y++) {
      ctx.fillText(y.toString(), originX - 8, originY - y * scaleY + 4);
    }
    ctx.fillText('0', originX - 8, originY + 14);
    
    // Draw line y = x + 2
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(originX, originY - 2 * scaleY);
    ctx.lineTo(originX + 3.8 * scaleX, originY - (2 + 3.8) * scaleY);
    ctx.stroke();
    
    // Projection lines to target (2, 4)
    const targetX = 2;
    const targetY = 4;
    const targetScreenX = originX + targetX * scaleX;
    const targetScreenY = originY - targetY * scaleY;
    
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(targetScreenX, originY);
    ctx.lineTo(targetScreenX, targetScreenY);
    ctx.lineTo(originX, targetScreenY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw the "Hole" at (2, 4)
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(targetScreenX, targetScreenY, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Current point
    const currentX = parseFloat(holeSlider.value);
    const isAtDiscontinuity = Math.abs(currentX - 2.0) < 0.02;
    
    if (!isAtDiscontinuity) {
      const currentY = currentX + 2.0;
      const currentScreenX = originX + currentX * scaleX;
      const currentScreenY = originY - currentY * scaleY;
      
      // Projections
      ctx.strokeStyle = '#8b5cf6';
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(currentScreenX, originY);
      ctx.lineTo(currentScreenX, currentScreenY);
      ctx.lineTo(originX, currentScreenY);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Current Dot
      ctx.fillStyle = '#8b5cf6';
      ctx.beginPath();
      ctx.arc(currentScreenX, currentScreenY, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    // Draw text info
    ctx.fillStyle = '#ec4899';
    ctx.font = 'bold 12px Noto Sans Thai';
    ctx.textAlign = 'left';
    ctx.fillText('จุดโหว่ที่ไม่มีค่าฟังก์ชัน (x = 2)', targetScreenX + 10, targetScreenY - 8);
  }

  // =========================================================
  // SLIDE 6: CONTINUOUS FUNCTIONS
  // =========================================================
  const stateBtns = document.querySelectorAll('.state-btn');
  const contResultBox = document.getElementById('continuity-result-box');
  const contGraphTitle = document.getElementById('continuity-graph-title');
  const continuityChecklist = document.getElementById('continuity-checklist');
  
  let currentContType = 'cont'; // 'cont', 'hole', 'jump'
  
  if (stateBtns.length > 0) {
    stateBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        stateBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentContType = btn.getAttribute('data-type');
        
        updateContinuityDetails();
        drawContinuityGraph();
      });
    });
  }

  function updateContinuityDetails() {
    if (!contResultBox) return;
    
    const cond1 = document.getElementById('cond-1');
    const cond2 = document.getElementById('cond-2');
    const cond3 = document.getElementById('cond-3');
    
    // Reset classes
    cond1.className = 'info-box';
    cond2.className = 'info-box';
    cond3.className = 'info-box';
    
    cond1.querySelector('.cond-icon').textContent = '✓';
    cond2.querySelector('.cond-icon').textContent = '✓';
    cond3.querySelector('.cond-icon').textContent = '✓';
    
    if (currentContType === 'cont') {
      contGraphTitle.textContent = 'ฟังก์ชันต่อเนื่องสมบูรณ์แบบที่ x = 2';
      contResultBox.textContent = 'ต่อเนื่องที่ x = 2 (เงื่อนไขครบทั้ง 3 ข้อ)';
      contResultBox.className = 'color-p';
      
      cond1.classList.add('success-box');
      cond2.classList.add('success-box');
      cond3.classList.add('success-box');
    } else if (currentContType === 'hole') {
      contGraphTitle.textContent = 'ฟังก์ชันมีจุดโหว่ (ฟังก์ชันไม่ต่อเนื่อง) ที่ x = 2';
      contResultBox.textContent = 'ไม่ต่อเนื่องที่ x = 2 (ล้มเหลวที่เงื่อนไขข้อ 3)';
      contResultBox.className = 'color-s';
      
      cond1.classList.add('success-box'); // f(2) exists, e.g. 3.5
      cond2.classList.add('success-box'); // lim exists, e.g. 2
      
      // Condition 3 fails (f(a) != lim f(x))
      cond3.classList.add('error-box');
      cond3.querySelector('.cond-icon').textContent = '✗';
    } else if (currentContType === 'jump') {
      contGraphTitle.textContent = 'ฟังก์ชันกระโดดแยกตัว (ฟังก์ชันไม่ต่อเนื่อง) ที่ x = 2';
      contResultBox.textContent = 'ไม่ต่อเนื่องที่ x = 2 (ล้มเหลวที่เงื่อนไขข้อ 2 และ 3)';
      contResultBox.className = 'color-s';
      
      cond1.classList.add('success-box'); // f(2) exists, e.g. 3.5
      
      // Condition 2 fails (lim doesn't exist)
      cond2.classList.add('error-box');
      cond2.querySelector('.cond-icon').textContent = '✗';
      
      // Condition 3 fails automatically
      cond3.classList.add('error-box');
      cond3.querySelector('.cond-icon').textContent = '✗';
    }
  }

  function drawContinuityGraph() {
    const visual = getCanvasCtx('continuity-canvas');
    if (!visual) return;
    
    const { ctx, width, height } = visual;
    
    // Scale: x in [0, 4], y in [0, 5]
    const originX = width * 0.15;
    const originY = height * 0.85;
    const scaleX = (width * 0.75) / 4;
    const scaleY = (height * 0.75) / 5;
    
    drawGrid(ctx, width, height, scaleX, scaleY, originX, originY);
    
    // Ticks labels
    ctx.fillStyle = '#64748b';
    ctx.font = '12px Outfit';
    ctx.textAlign = 'center';
    for (let x = 1; x <= 4; x++) {
      ctx.fillText(x.toString(), originX + x * scaleX, originY + 18);
    }
    ctx.textAlign = 'right';
    for (let y = 1; y <= 5; y++) {
      ctx.fillText(y.toString(), originX - 8, originY - y * scaleY + 4);
    }
    ctx.fillText('0', originX - 8, originY + 14);
    
    ctx.lineWidth = 3.5;
    
    if (currentContType === 'cont') {
      // Curve f(x) = 0.5 * (x - 2)^2 + 2
      ctx.strokeStyle = '#8b5cf6';
      ctx.beginPath();
      let isFirst = true;
      for (let screenX = originX; screenX < width; screenX++) {
        const x = (screenX - originX) / scaleX;
        if (x > 3.8) break;
        const y = 0.5 * (x - 2) * (x - 2) + 2;
        const screenY = originY - y * scaleY;
        if (isFirst) { ctx.moveTo(screenX, screenY); isFirst = false; }
        else { ctx.lineTo(screenX, screenY); }
      }
      ctx.stroke();
      
      // Draw solid point at (2, 2)
      ctx.fillStyle = '#8b5cf6';
      ctx.beginPath();
      ctx.arc(originX + 2 * scaleX, originY - 2 * scaleY, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
    } else if (currentContType === 'hole') {
      // Curve with a hole at (2, 2) and a separate dot at (2, 3.5)
      ctx.strokeStyle = '#8b5cf6';
      ctx.beginPath();
      let isFirst = true;
      for (let screenX = originX; screenX < width; screenX++) {
        const x = (screenX - originX) / scaleX;
        if (x > 3.8) break;
        
        // Skip exactly at 2.0 to show discontinuity visually in path, but math is continuous
        const y = 0.5 * (x - 2) * (x - 2) + 2;
        const screenY = originY - y * scaleY;
        
        if (isFirst) { ctx.moveTo(screenX, screenY); isFirst = false; }
        else { ctx.lineTo(screenX, screenY); }
      }
      ctx.stroke();
      
      // Hollow circle at (2, 2)
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(originX + 2 * scaleX, originY - 2 * scaleY, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Separate filled dot at (2, 3.5)
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(originX + 2 * scaleX, originY - 3.5 * scaleY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      // Text labels
      ctx.fillStyle = '#ec4899';
      ctx.font = 'bold 11px Noto Sans Thai';
      ctx.textAlign = 'left';
      ctx.fillText('ค่าจริง f(2) = 3.5', originX + 2 * scaleX + 12, originY - 3.5 * scaleY + 4);
      ctx.fillStyle = '#8b5cf6';
      ctx.fillText('ลิมิต = 2.0', originX + 2 * scaleX + 12, originY - 2 * scaleY + 4);
      
    } else if (currentContType === 'jump') {
      // Piecewise: y = 0.5*(x-2)^2 + 1 for x < 2
      // Piecewise: y = 0.5*(x-2)^2 + 3.5 for x >= 2
      
      // Left branch
      ctx.strokeStyle = '#8b5cf6';
      ctx.beginPath();
      let isFirst = true;
      for (let screenX = originX; screenX <= originX + 2 * scaleX; screenX++) {
        const x = (screenX - originX) / scaleX;
        const y = 0.5 * (x - 2) * (x - 2) + 1;
        const screenY = originY - y * scaleY;
        if (isFirst) { ctx.moveTo(screenX, screenY); isFirst = false; }
        else { ctx.lineTo(screenX, screenY); }
      }
      ctx.stroke();
      
      // Right branch
      ctx.beginPath();
      isFirst = true;
      for (let screenX = originX + 2 * scaleX; screenX < width; screenX++) {
        const x = (screenX - originX) / scaleX;
        if (x > 3.8) break;
        const y = 0.5 * (x - 2) * (x - 2) + 3.5;
        const screenY = originY - y * scaleY;
        if (isFirst) { ctx.moveTo(screenX, screenY); isFirst = false; }
        else { ctx.lineTo(screenX, screenY); }
      }
      ctx.stroke();
      
      // Hollow point at (2, 1) - end of left branch
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(originX + 2 * scaleX, originY - 1 * scaleY, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Solid point at (2, 3.5) - start of right branch
      ctx.fillStyle = '#8b5cf6';
      ctx.beginPath();
      ctx.arc(originX + 2 * scaleX, originY - 3.5 * scaleY, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Texts
      ctx.fillStyle = '#8b5cf6';
      ctx.font = 'bold 11px Noto Sans Thai';
      ctx.textAlign = 'left';
      ctx.fillText('ลิมิตขวา = 3.5', originX + 2 * scaleX + 12, originY - 3.5 * scaleY + 4);
      ctx.fillText('ลิมิตซ้าย = 1.0', originX + 2 * scaleX + 12, originY - 1 * scaleY + 4);
    }
  }

  // =========================================================
  // SLIDE 7: SLOPE & INTRO TO DERIVATIVE
  // =========================================================
  const derivHSlider = document.getElementById('deriv-h-slider');
  const derivHVal = document.getElementById('deriv-h-val');
  const derivSecantSlope = document.getElementById('deriv-secant-slope');
  const derivQCoords = document.getElementById('deriv-q-coords');
  
  if (derivHSlider) {
    derivHSlider.addEventListener('input', (e) => {
      const h = parseFloat(e.target.value);
      derivHVal.textContent = h.toFixed(2);
      
      const qX = 2.0 + h;
      const qY = 0.25 * qX * qX + 1;
      derivQCoords.textContent = `${qX.toFixed(2)}, ${qY.toFixed(2)}`;
      
      // Slope calculation
      // f(2) = 2
      const slope = (qY - 2.0) / h;
      derivSecantSlope.textContent = slope.toFixed(2);
      
      drawDerivIntroGraph();
    });
  }

  function drawDerivIntroGraph() {
    const visual = getCanvasCtx('deriv-intro-canvas');
    if (!visual) return;
    
    const { ctx, width, height } = visual;
    
    // Scale: x in [0, 5], y in [0, 6]
    const originX = width * 0.15;
    const originY = height * 0.85;
    const scaleX = (width * 0.75) / 5;
    const scaleY = (height * 0.75) / 6;
    
    drawGrid(ctx, width, height, scaleX, scaleY, originX, originY);
    
    // Ticks labels
    ctx.fillStyle = '#64748b';
    ctx.font = '12px Outfit';
    ctx.textAlign = 'center';
    for (let x = 1; x <= 5; x++) {
      ctx.fillText(x.toString(), originX + x * scaleX, originY + 18);
    }
    ctx.textAlign = 'right';
    for (let y = 1; y <= 6; y++) {
      ctx.fillText(y.toString(), originX - 8, originY - y * scaleY + 4);
    }
    ctx.fillText('0', originX - 8, originY + 14);
    
    // Draw parabola curve: f(x) = 0.25 * x^2 + 1
    ctx.strokeStyle = '#a78bfa';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    let isFirst = true;
    for (let screenX = originX; screenX < width; screenX++) {
      const x = (screenX - originX) / scaleX;
      if (x > 4.5) break;
      const y = 0.25 * x * x + 1;
      const screenY = originY - y * scaleY;
      if (isFirst) { ctx.moveTo(screenX, screenY); isFirst = false; }
      else { ctx.lineTo(screenX, screenY); }
    }
    ctx.stroke();
    
    const h = parseFloat(derivHSlider.value);
    
    // Point P(2, 2)
    const pX = 2;
    const pY = 2;
    const pScreenX = originX + pX * scaleX;
    const pScreenY = originY - pY * scaleY;
    
    // Point Q(2+h, f(2+h))
    const qX = 2 + h;
    const qY = 0.25 * qX * qX + 1;
    const qScreenX = originX + qX * scaleX;
    const qScreenY = originY - qY * scaleY;
    
    // Draw Triangle representing dy, dx
    ctx.fillStyle = 'rgba(139, 92, 246, 0.05)';
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pScreenX, pScreenY);
    ctx.lineTo(qScreenX, pScreenY);
    ctx.lineTo(qScreenX, qScreenY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Label dx (h) and dy
    ctx.fillStyle = '#64748b';
    ctx.font = '11px Outfit';
    ctx.textAlign = 'center';
    ctx.fillText(`h = ${h.toFixed(2)}`, pScreenX + (qScreenX - pScreenX) / 2, pScreenY + 14);
    
    ctx.textAlign = 'left';
    ctx.fillText(`Δy = ${(qY - pY).toFixed(2)}`, qScreenX + 8, qScreenY + (pScreenY - qScreenY) / 2);
    
    // Secant Slope Line (passes through P and Q)
    // equation: y - 2 = m * (x - 2) => y = m * (x - 2) + 2
    const m = (qY - pY) / h;
    
    ctx.strokeStyle = '#ec4899'; // pink for secant
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    // Calculate line extremes on screen
    const secantLeftY = m * (0 - pX) + pY;
    const secantRightY = m * (5 - pX) + pY;
    
    ctx.moveTo(originX, originY - secantLeftY * scaleY);
    ctx.lineTo(originX + 5 * scaleX, originY - secantRightY * scaleY);
    ctx.stroke();
    
    // Tangent Slope Line (Slope is 1.0 at x = 2)
    // equation: y = x
    ctx.strokeStyle = '#10b981'; // green for tangent
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(originX, originY - 0 * scaleY);
    ctx.lineTo(originX + 5 * scaleX, originY - 5 * scaleY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw P Dot
    ctx.fillStyle = '#8b5cf6';
    ctx.beginPath();
    ctx.arc(pScreenX, pScreenY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Draw Q Dot
    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    ctx.arc(qScreenX, qScreenY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Labels P and Q
    ctx.fillStyle = '#1e1b4b';
    ctx.font = 'bold 12px Noto Sans Thai';
    ctx.textAlign = 'right';
    ctx.fillText('P(2, 2)', pScreenX - 8, pScreenY + 12);
    
    ctx.textAlign = 'left';
    ctx.fillText(`Q(2+h, f(2+h))`, qScreenX + 8, qScreenY - 8);
    
    // Draw slope colors legend
    ctx.fillStyle = '#ec4899';
    ctx.fillText(`ความชัน Secant = ${m.toFixed(2)}`, originX + 15, originY - 5.5 * scaleY);
    ctx.fillStyle = '#10b981';
    ctx.fillText(`ความชันสัมผัส Tangent (h→0) = 1.00`, originX + 15, originY - 5.0 * scaleY);
  }

  // =========================================================
  // SLIDE 9: PRACTICE GENERATOR & SYMBOLIC ENGINE
  // =========================================================
  const btnPracticeGen = document.getElementById('btn-practice-gen');
  const btnPracticeSteps = document.getElementById('btn-practice-steps');
  const btnPracticeAns = document.getElementById('btn-practice-ans');
  const practiceProblemText = document.getElementById('practice-problem');
  const practiceSolutionContainer = document.getElementById('practice-solution-container');
  
  let currentProblem = {
    terms: [], // list of objects { coeff, power }
    repr: '',
    steps: [],
    answer: ''
  };

  if (btnPracticeGen) {
    btnPracticeGen.addEventListener('click', generateNewProblem);
    btnPracticeSteps.addEventListener('click', showPracticeSteps);
    btnPracticeAns.addEventListener('click', showPracticeAnswer);
    
    // Generate first problem
    generateNewProblem();
  }

  function generateNewProblem() {
    practiceSolutionContainer.classList.remove('visible');
    
    // Randomize types:
    // 0: Quadratic (a x^2 + b x + c)
    // 1: Cubic (a x^3 + b x^2 + c x + d)
    // 2: Single terms (a x^n + c)
    const type = Math.floor(Math.random() * 3);
    let terms = [];
    
    const randomNonZero = (min, max) => {
      let val = 0;
      while (val === 0) {
        val = Math.floor(Math.random() * (max - min + 1)) + min;
      }
      return val;
    };
    
    if (type === 0) {
      // Quadratic
      const a = randomNonZero(-5, 6);
      const b = randomNonZero(-6, 7);
      const c = Math.floor(Math.random() * 10) - 4; // can be zero
      
      terms.push({ coeff: a, power: 2 });
      terms.push({ coeff: b, power: 1 });
      if (c !== 0) terms.push({ coeff: c, power: 0 });
    } else if (type === 1) {
      // Cubic
      const a = randomNonZero(-3, 4);
      const b = randomNonZero(-4, 5);
      const c = randomNonZero(-5, 6);
      const d = Math.floor(Math.random() * 8) - 3;
      
      terms.push({ coeff: a, power: 3 });
      terms.push({ coeff: b, power: 2 });
      terms.push({ coeff: c, power: 1 });
      if (d !== 0) terms.push({ coeff: d, power: 0 });
    } else {
      // Higher single power
      const a = randomNonZero(-4, 5);
      const n = Math.floor(Math.random() * 3) + 3; // power 3 to 5
      const b = randomNonZero(-5, 5);
      const c = Math.floor(Math.random() * 8) - 3;
      
      terms.push({ coeff: a, power: n });
      terms.push({ coeff: b, power: n - 2 });
      if (c !== 0) terms.push({ coeff: c, power: 0 });
    }
    
    currentProblem.terms = terms;
    currentProblem.repr = formatPolynomial(terms);
    
    // Build Solution
    buildSolution(terms);
    
    practiceProblemText.innerHTML = currentProblem.repr;
  }

  function formatPolynomial(terms) {
    let html = '';
    terms.forEach((term, index) => {
      let coeff = term.coeff;
      let power = term.power;
      
      if (coeff === 0) return;
      
      // Determine sign
      let sign = '';
      if (index === 0) {
        if (coeff < 0) sign = '-';
      } else {
        sign = coeff > 0 ? ' + ' : ' - ';
        coeff = Math.abs(coeff);
      }
      
      let termStr = '';
      if (power === 0) {
        termStr = `${coeff}`;
      } else if (power === 1) {
        termStr = coeff === 1 ? 'x' : `${coeff}x`;
      } else {
        const sup = getSuperscript(power);
        termStr = coeff === 1 ? `x${sup}` : `${coeff}x${sup}`;
      }
      
      html += sign + termStr;
    });
    return html;
  }

  function getSuperscript(power) {
    // Return HTML superscript
    return `<sup>${power}</sup>`;
  }

  function buildSolution(terms) {
    let steps = [];
    const d_dx = '<span class="fraction"><span class="fraction-num">d</span><span class="fraction-den">dx</span></span>';
    
    // Step 1: Write formula
    let step1HTML = `<strong>ขั้นตอนที่ 1: กระจายอนุพันธ์รายพจน์</strong><br>`;
    let splitRepr = terms.map(t => {
      const sign = t.coeff < 0 ? '-' : '+';
      const absCoeff = Math.abs(t.coeff);
      const termFmt = t.power === 0 ? `${absCoeff}` : (t.power === 1 ? `${absCoeff}x` : `${absCoeff}x<sup>${t.power}</sup>`);
      return `${d_dx}(${t.coeff < 0 ? '-' : ''}${termFmt})`;
    }).join(' + ').replace(/\+ -/g, '- ');
    
    step1HTML += `<div style="margin-top:8px; display:flex; align-items:center; flex-wrap:wrap; gap:4px;">${d_dx}[ ${currentProblem.repr} ] = ${splitRepr}</div>`;
    steps.push(step1HTML);
    
    // Step 2: Extract coefficient
    let step2HTML = `<strong>ขั้นตอนที่ 2: ดึงค่าสัมประสิทธิ์ออกมาคูณด้านหน้า</strong><br><div style="margin-top:6px; display:flex; align-items:center; flex-wrap:wrap; gap:4px;">= `;
    let step2Parts = terms.map(t => {
      if (t.power === 0) return `${d_dx}(${t.coeff})`;
      const sign = t.coeff < 0 ? '-' : '+';
      const absCoeff = Math.abs(t.coeff);
      return `${t.coeff}·${d_dx}(x<sup>${t.power}</sup>)`;
    });
    step2HTML += step2Parts.join(' + ').replace(/\+ -/g, '- ') + `</div>`;
    steps.push(step2HTML);
    
    // Step 3: Apply Power Rule
    let step3HTML = `<strong>ขั้นตอนที่ 3: ใช้กฎกำลัง ${d_dx}(xⁿ) = n·xⁿ⁻¹</strong><br><div style="margin-top:6px;">= `;
    let step3Parts = terms.map(t => {
      if (t.power === 0) {
        return `0`;
      } else if (t.power === 1) {
        return `${t.coeff}·(1)`;
      } else {
        return `${t.coeff}·(${t.power}x<sup>${t.power - 1}</sup>)`;
      }
    });
    step3HTML += step3Parts.join(' + ').replace(/\+ -/g, '- ') + `</div>`;
    steps.push(step3HTML);
    
    // Step 4: Multiply and simplify to answer
    let derivTerms = [];
    terms.forEach(t => {
      if (t.power === 0) return;
      const newCoeff = t.coeff * t.power;
      const newPower = t.power - 1;
      derivTerms.push({ coeff: newCoeff, power: newPower });
    });
    
    let answerHTML = formatPolynomial(derivTerms);
    if (answerHTML === '') answerHTML = '0';
    
    let step4HTML = `<strong>คำตอบสุดท้าย: จัดรูปสมการสรุป</strong><br><div style="font-size:1.4rem; color:var(--success); font-weight:800; border-top:1px dashed var(--border); padding-top:8px; margin-top:8px;">P'(x) = ${answerHTML}</div>`;
    
    steps.push(step4HTML);
    
    currentProblem.steps = steps;
    currentProblem.answer = answerHTML;
  }

  function showPracticeSteps() {
    practiceSolutionContainer.innerHTML = '';
    
    // Append steps one by one or all
    currentProblem.steps.forEach((step, i) => {
      const stepCard = document.createElement('div');
      stepCard.className = 'solution-step-item';
      stepCard.innerHTML = step;
      practiceSolutionContainer.appendChild(stepCard);
    });
    
    practiceSolutionContainer.classList.add('visible');
  }

  function showPracticeAnswer() {
    practiceSolutionContainer.innerHTML = '';
    
    const answerCard = document.createElement('div');
    answerCard.className = 'solution-step-item';
    answerCard.style.borderLeftColor = 'var(--success)';
    answerCard.innerHTML = `<strong>คำตอบสุดท้าย (Derivative Result)</strong>
      <div style="font-size:1.6rem; color:var(--success); font-weight:800; margin-top:10px;">
        P'(x) = ${currentProblem.answer}
      </div>`;
      
    practiceSolutionContainer.appendChild(answerCard);
    practiceSolutionContainer.classList.add('visible');
  }

  // =========================================================
  // GLOBAL RENDER TRIGER FOR CANVAS VISUALS
  // =========================================================
  function drawActiveSlideVisuals() {
    if (currentSlideIndex === 1) {
      resizeCanvas('limit-def-canvas');
      drawLimitDefGraph();
    } else if (currentSlideIndex === 3) {
      resizeCanvas('step-func-canvas');
      drawStepFuncGraph();
    } else if (currentSlideIndex === 5) {
      resizeCanvas('hole-func-canvas');
      drawHoleFuncGraph();
    } else if (currentSlideIndex === 6) {
      resizeCanvas('continuity-canvas');
      drawContinuityGraph();
    } else if (currentSlideIndex === 7) {
      resizeCanvas('deriv-intro-canvas');
      drawDerivIntroGraph();
    }
  }

  // Handle window resizing (very important for iPads rotating or resizing browser)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      drawActiveSlideVisuals();
    }, 200);
  });

  // Initialize first view
  updateNav();
  updatePolynomialLimit();
});
