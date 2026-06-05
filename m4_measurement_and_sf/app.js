document.addEventListener('DOMContentLoaded', () => {
  // --- SLIDE NAVIGATION ---
  const slides = document.querySelectorAll('.slide');
  const nextBtn = document.getElementById('next-btn');
  const prevBtn = document.getElementById('prev-btn');
  const progressBar = document.getElementById('progress-bar');
  const navDotsContainer = document.getElementById('nav-dots');
  const currentSlideSpan = document.getElementById('current-slide');
  const totalSlidesSpan = document.getElementById('total-slides');

  let currentSlideIndex = 0;
  const totalSlides = slides.length;

  // Set total slides count in footer
  if (totalSlidesSpan) totalSlidesSpan.textContent = totalSlides;

  // Create navigation dots
  if (navDotsContainer) {
    navDotsContainer.innerHTML = '';
    for (let i = 0; i < totalSlides; i++) {
      const dot = document.createElement('div');
      dot.className = `nav-dot ${i === 0 ? 'active' : ''}`;
      dot.addEventListener('click', () => goToSlide(i));
      navDotsContainer.appendChild(dot);
    }
  }

  function updateControls() {
    // Enable/disable buttons
    if (prevBtn) prevBtn.disabled = currentSlideIndex === 0;
    if (nextBtn) nextBtn.disabled = currentSlideIndex === totalSlides - 1;

    // Update dots
    const dots = document.querySelectorAll('.nav-dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentSlideIndex);
    });

    // Update progress bar
    if (progressBar) {
      const progress = (currentSlideIndex / (totalSlides - 1)) * 100;
      progressBar.style.width = `${progress}%`;
    }

    // Update current slide number display
    if (currentSlideSpan) currentSlideSpan.textContent = currentSlideIndex + 1;
  }

  function goToSlide(index) {
    if (index < 0 || index >= totalSlides) return;
    
    // Remove active class and add prev class to outgoing active slide
    slides.forEach((slide, i) => {
      slide.classList.remove('active', 'prev');
      if (i < index) {
        slide.classList.add('prev');
      }
    });

    currentSlideIndex = index;
    slides[currentSlideIndex].classList.add('active');

    updateControls();
    
    // Custom triggers when entering specific slides
    if (currentSlideIndex === 1) {
      // Trigger ruler rendering when entering ruler slide
      setTimeout(renderRuler, 100);
    }
  }

  function nextSlide() {
    if (currentSlideIndex < totalSlides - 1) {
      goToSlide(currentSlideIndex + 1);
    }
  }

  function prevSlide() {
    if (currentSlideIndex > 0) {
      goToSlide(currentSlideIndex - 1);
    }
  }

  // Navigation button listeners
  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);

  // Initialize navigation display
  updateControls();


  // --- WIDGET 1: VIRTUAL RULER SIMULATION ---
  const draggableObj = document.getElementById('draggable-object');
  const rulerTicks = document.getElementById('ruler-ticks');
  const virtualRuler = document.getElementById('virtual-ruler');
  
  const directReadout = document.getElementById('ruler-direct-readout');
  const estimatedReadout = document.getElementById('ruler-estimated-readout');
  const finalReadout = document.getElementById('ruler-final-readout');
  const scaleText = document.getElementById('scale-description');

  let currentScale = 'ones'; // 'thousands', 'hundreds', 'tens', 'ones', 'tenths', 'hundredths'
  let objectWidthPx = 180; // Default width representing object length on ruler
  let isDragging = false;
  let startDragX = 0;
  let startWidth = 0;

  const scales = {
    thousands: { tickValue: 1000, max: 10000, directDecimals: -3, estDecimals: -2, unit: 'm', rangeText: 'หลักพัน (ขีดละ 1000)', directLabel: 'หลักพัน', estLabel: 'หลักร้อย' },
    hundreds: { tickValue: 100, max: 1000, directDecimals: -2, estDecimals: -1, unit: 'm', rangeText: 'หลักร้อย (ขีดละ 100)', directLabel: 'หลักร้อย', estLabel: 'หลักสิบ' },
    tens: { tickValue: 10, max: 100, directDecimals: -1, estDecimals: 0, unit: 'cm', rangeText: 'หลักสิบ (ขีดละ 10)', directLabel: 'หลักสิบ', estLabel: 'หลักหน่วย' },
    ones: { tickValue: 1, max: 10, directDecimals: 0, estDecimals: 1, unit: 'cm', rangeText: 'หลักหน่วย (ขีดละ 1)', directLabel: 'หลักหน่วย', estLabel: 'ทศนิยมตำแหน่งที่ 1' },
    tenths: { tickValue: 0.1, max: 1, directDecimals: 1, estDecimals: 2, unit: 'cm', rangeText: 'ทศนิยมตำแหน่งที่ 1 (ขีดละ 0.1)', directLabel: 'ทศนิยมตำแหน่งที่ 1', estLabel: 'ทศนิยมตำแหน่งที่ 2' },
    hundredths: { tickValue: 0.01, max: 0.1, directDecimals: 2, estDecimals: 3, unit: 'cm', rangeText: 'ทศนิยมตำแหน่งที่ 2 (ขีดละ 0.01)', directLabel: 'ทศนิยมตำแหน่งที่ 2', estLabel: 'ทศนิยมตำแหน่งที่ 3' }
  };

  // Switch scale button click listeners
  document.querySelectorAll('[data-scale]').forEach(button => {
    button.addEventListener('click', (e) => {
      document.querySelectorAll('[data-scale]').forEach(b => b.classList.remove('active'));
      button.classList.add('active');
      currentScale = button.getAttribute('data-scale');
      renderRuler();
    });
  });

  // Drag logic for sizing/moving the object on the ruler
  if (draggableObj) {
    draggableObj.addEventListener('mousedown', startDrag);
    draggableObj.addEventListener('touchstart', startDrag, { passive: true });
  }

  function startDrag(e) {
    isDragging = true;
    startDragX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    startWidth = objectWidthPx;

    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', stopDrag);
  }

  function drag(e) {
    if (!isDragging) return;
    if (e.type === 'touchmove') {
      e.preventDefault(); // Prevent scrolling while dragging
    }
    const currentX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const deltaX = currentX - startDragX;
    
    // Get ruler width bounds
    const rulerRect = virtualRuler.getBoundingClientRect();
    const minWidth = 10;
    const maxWidth = rulerRect.width - 40; // Leave padding margins

    objectWidthPx = Math.max(minWidth, Math.min(maxWidth, startWidth + deltaX));
    draggableObj.style.width = `${objectWidthPx}px`;

    calculateMeasurement();
  }

  function stopDrag() {
    isDragging = false;
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('touchmove', drag);
    document.removeEventListener('touchend', stopDrag);
  }

  function renderRuler() {
    if (!virtualRuler || !rulerTicks) return;
    rulerTicks.innerHTML = '';
    const rulerWidth = virtualRuler.getBoundingClientRect().width;
    const padding = 20; // 20px padding left and right
    const usableWidth = rulerWidth - (padding * 2);

    const scale = scales[currentScale];
    scaleText.textContent = `สเกลละเอียดที่สุด: ${scale.rangeText}`;

    // We will place 10 main intervals (major ticks) on the ruler
    const intervals = 10;
    const majorStepPx = usableWidth / intervals;

    // Helper to format tick labels
    const formatLabel = (val) => {
      if (currentScale === 'tenths') return val.toFixed(1);
      if (currentScale === 'hundredths') return val.toFixed(2);
      return Math.round(val).toLocaleString();
    };

    for (let i = 0; i <= intervals; i++) {
      const leftPx = padding + (i * majorStepPx);
      const val = (i / intervals) * scale.max;

      // Create Major Tick
      const majorTick = document.createElement('div');
      majorTick.className = 'tick major';
      majorTick.style.left = `${leftPx}px`;
      
      const label = document.createElement('div');
      label.className = 'tick-label';
      label.style.left = `${leftPx}px`;
      label.textContent = formatLabel(val);

      rulerTicks.appendChild(majorTick);
      rulerTicks.appendChild(label);

    }

    calculateMeasurement();
  }

  function calculateMeasurement() {
    if (!virtualRuler) return;
    const rulerWidth = virtualRuler.getBoundingClientRect().width;
    const padding = 20;
    const usableWidth = rulerWidth - (padding * 2);
    const scale = scales[currentScale];

    // Compute actual value corresponding to object width
    // Object left margin starts at 'padding' (20px)
    const objectVal = ((objectWidthPx - padding) / usableWidth) * scale.max;
    // Make sure we clamp it between 0 and max scale
    let value = Math.max(0, Math.min(scale.max, objectVal));

    // Calculate Direct vs Estimated
    // The smallest division value is scale.tickValue
    const smallestDiv = scale.tickValue;
    
    // Direct reading is the value rounded down to the nearest smallest division
    let directVal = Math.floor(value / smallestDiv) * smallestDiv;
    if (directVal < 0) directVal = 0;

    // Estimated reading is the fractional part of the smallest division (one-tenth of division)
    let remainder = value - directVal;
    let estimatedPart = Math.round((remainder / smallestDiv) * 10) / 10 * smallestDiv;
    
    let finalVal = directVal + estimatedPart;

    // Display formatted results based on decimals
    const formatValue = (num, decimals) => {
      if (decimals < 0) {
        // Round to tens, hundreds, or thousands place
        const factor = Math.pow(10, -decimals);
        return (Math.round(num / factor) * factor).toLocaleString();
      }
      return num.toFixed(decimals);
    };

    // For direct readout: formatting depends on directDecimals
    let directDecs = Math.max(0, scale.directDecimals);
    let estDecs = Math.max(0, scale.estDecimals);

    // Formatted strings
    let directStr = formatValue(directVal, directDecs);
    let estStr = formatValue(estimatedPart, estDecs);
    let finalStr = formatValue(finalVal, estDecs);

    if (directReadout) directReadout.textContent = `${directStr} (${scale.directLabel})`;
    if (estimatedReadout) estimatedReadout.textContent = `${estStr} (${scale.estLabel})`;
    if (finalReadout) finalReadout.innerHTML = `<span class="direct-val">${directStr}</span> + <span class="estimated">${estStr}</span> = <strong>${finalStr}</strong>`;
  }

  // Handle window resize to re-render ruler accurately
  window.addEventListener('resize', () => {
    if (currentSlideIndex === 1) renderRuler();
  });


  // --- WIDGET 2: SIGNIFICANT FIGURES COUNTER ---
  const sfInput = document.getElementById('sigfig-input');
  const sfVisualizer = document.getElementById('sigfig-visualizer');
  const sfCountDisplay = document.getElementById('sf-count');
  const sfRulesDisplay = document.getElementById('sf-rules');

  if (sfInput) {
    sfInput.addEventListener('input', (e) => {
      updateSigFigAnalysis(e.target.value);
    });
    // Init on load
    updateSigFigAnalysis(sfInput.value);
  }

  function updateSigFigAnalysis(rawVal) {
    if (!sfVisualizer || !sfCountDisplay || !sfRulesDisplay) return;

    const trimmed = rawVal.trim();
    if (trimmed === '') {
      sfVisualizer.innerHTML = '<span style="color:var(--text-muted)">พิมพ์ตัวเลขเพื่อตรวจสอบ...</span>';
      sfCountDisplay.textContent = '-';
      sfRulesDisplay.innerHTML = '<li>รอข้อมูลตัวเลข...</li>';
      return;
    }

    // Basic numerical format validation
    // Regex allows digits, one decimal point, minus sign, optional scientific suffix e.g. e4 or x10^4
    const numRegex = /^-?\d*\.?\d*(?:[eE][-+]?\d+|(?:\s*[xX\*]\s*10\^?-?\d+))?$/;
    if (!numRegex.test(trimmed)) {
      sfVisualizer.innerHTML = '<span style="color:var(--error)">รูปแบบตัวเลขไม่ถูกต้อง</span>';
      sfCountDisplay.textContent = 'Error';
      sfRulesDisplay.innerHTML = '<li>กรุณาพิมพ์ตัวเลขในรูปแบบที่ถูกต้อง เช่น 123, 0.0450, 1.2 x 10^3</li>';
      return;
    }

    // Check if it's in scientific notation format
    // e.g. "4.5 x 10^3", "4.5e3", "4.500 * 10^-2"
    let coefficientStr = trimmed;
    let powerStr = '';
    const sciMatch = trimmed.match(/^([^-eExX\*]+)(?:[eE]([-+]?\d+)|(?:\s*[xX\*]\s*10\^?(-?\d+)))$/);
    if (sciMatch) {
      coefficientStr = sciMatch[1].trim();
      powerStr = sciMatch[2] || sciMatch[3];
    }

    // Now analyze the core number string (coefficient)
    let chars = coefficientStr.split('');
    let numDigits = []; // Store only digits and their indexes for analysis
    let hasDecimal = coefficientStr.includes('.');

    // Extract indices of numerical digits, ignoring sign and decimal points
    for (let i = 0; i < chars.length; i++) {
      if (/\d/.test(chars[i])) {
        numDigits.push({ char: chars[i], index: i, type: 'undetermined' });
      }
    }

    if (numDigits.length === 0) {
      sfVisualizer.innerHTML = '<span style="color:var(--text-muted)">พิมพ์ตัวเลขเพื่อตรวจสอบ...</span>';
      sfCountDisplay.textContent = '-';
      sfRulesDisplay.innerHTML = '<li>รอข้อมูลตัวเลข...</li>';
      return;
    }

    // Find indices of first and last non-zero digits
    let firstNonZeroIdx = -1;
    let lastNonZeroIdx = -1;

    for (let i = 0; i < numDigits.length; i++) {
      if (numDigits[i].char !== '0') {
        if (firstNonZeroIdx === -1) firstNonZeroIdx = i;
        lastNonZeroIdx = i;
      }
    }

    let sigCount = 0;
    let isAmbiguous = false;
    let explanations = [];

    // Case 1: The number contains only zeros (e.g., "0", "0.00", "000")
    if (firstNonZeroIdx === -1) {
      // If only zeros are typed, typically it represents a baseline or is non-significant, but let's handle standard:
      // A lone "0" or "0.00" has 1 or more significant digits if measured, but math-wise standard IPST rules:
      // "0" has 1 significant figure (itself is the estimated digit). Let's set it as 1 or match decimals.
      numDigits.forEach(d => d.type = 'significant');
      sigCount = hasDecimal ? numDigits.length : 1;
      if (!hasDecimal) {
        numDigits.forEach((d, idx) => {
          if (idx > 0) d.type = 'not-significant';
        });
      }
      explanations.push("เป็นเลขศูนย์ทั้งหมด: นับจำนวนหลักศูนย์ทั้งหมดตามทศนิยม (หรือ 1 ตัวถ้าเป็นจำนวนเต็ม)");
    } else {
      // Apply rules to digit classification
      // 1. Non-zero digits (always significant)
      explanations.push("ตัวเลขที่ไม่ใช่ 0 ทุกตัว (1-9) ถือเป็นเลขนัยสำคัญ");

      for (let i = 0; i < numDigits.length; i++) {
        const d = numDigits[i];
        
        if (d.char !== '0') {
          d.type = 'significant';
          sigCount++;
        } else {
          // It's a zero! Apply sub-rules
          if (i < firstNonZeroIdx) {
            // 2.1 Leading zeros (never significant)
            d.type = 'not-significant';
          } else if (i > firstNonZeroIdx && i < lastNonZeroIdx) {
            // 2.2 Captive zeros (always significant)
            d.type = 'significant';
            sigCount++;
          } else if (i > lastNonZeroIdx) {
            // 2.3 Trailing zeros
            if (hasDecimal) {
              // 2.3.2 Decimals (always significant)
              d.type = 'significant';
              sigCount++;
            } else {
              // 2.3.1 Integers (ambiguous, usually NOT counted unless context or sci-notation specifies)
              d.type = 'ambiguous';
              isAmbiguous = true;
            }
          }
        }
      }

      // Add explanations based on triggered rules
      const hasLeading = numDigits.some((d, i) => d.char === '0' && i < firstNonZeroIdx);
      if (hasLeading) {
        explanations.push("เลข 0 หน้าเลขนัยสำคัญตัวแรกสุด (ด้านซ้าย) <strong>ไม่นับ</strong> (ทำหน้าที่แค่บอกตำแหน่งทศนิยม)");
      }

      const hasCaptive = numDigits.some((d, i) => d.char === '0' && i > firstNonZeroIdx && i < lastNonZeroIdx);
      if (hasCaptive) {
        explanations.push("เลข 0 ที่อยู่ระหว่างเลขนัยสำคัญตัวอื่น (ตรงกลาง) <strong>ให้นับเป็นเลขนัยสำคัญ</strong>");
      }

      const hasTrailing = numDigits.some((d, i) => d.char === '0' && i > lastNonZeroIdx);
      if (hasTrailing) {
        if (hasDecimal) {
          explanations.push("เลข 0 หลังเลขนัยสำคัญตัวสุดท้ายในรูปทศนิยม (ด้านขวาสุด) <strong>ให้นับเสมอ</strong> (แสดงถึงความละเอียดของการวัด)");
        } else {
          explanations.push("เลข 0 หลังเลขนัยสำคัญในจำนวนเต็ม <strong>อาจจะนับหรือไม่นับก็ได้</strong> (คลุมเครือ) แนะนำให้เขียนเป็น <strong>สัญกรณ์วิทยาศาสตร์</strong> เพื่อความชัดเจน");
        }
      }
    }

    // Set estimated digit: the rightmost significant digit
    // For ambiguous numbers, let's designate the last non-zero as estimated for the minimum sig fig case,
    // or explain both.
    let lastSigIdx = -1;
    for (let i = numDigits.length - 1; i >= 0; i--) {
      if (numDigits[i].type === 'significant') {
        lastSigIdx = i;
        break;
      }
    }

    // No estimated digit distinction in standard counting rules tool


    // Generate output HTML for the visualizer
    let outputHTML = '';
    let digitCounter = 0;
    
    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      if (/\d/.test(char)) {
        const digitObj = numDigits[digitCounter++];
        let labelText = '';
        if (digitObj.type === 'significant') labelText = 'นัยสำคัญ';
        else if (digitObj.type === 'estimated-digit') labelText = 'ค่าประมาณ';
        else if (digitObj.type === 'not-significant') labelText = 'ไม่นับ';
        else if (digitObj.type === 'ambiguous') labelText = 'ไม่แน่ชัด';

        outputHTML += `<span class="sf-digit ${digitObj.type}">${char}<span class="sf-digit-label">${labelText}</span></span>`;
      } else {
        // Just decimal point or minus sign
        outputHTML += `<span style="font-family:var(--font-title); font-size:2rem; font-weight:800; color:var(--text-main);">${char}</span>`;
      }
    }

    // Append scientific part back if exists
    if (sciMatch) {
      outputHTML += ` <span style="font-family:var(--font-title); font-size:1.75rem; font-weight:600; color:var(--secondary);">× 10<sup>${powerStr}</sup></span>`;
      explanations.push("ในรูปสัญกรณ์วิทยาศาสตร์ $A \\times 10^n$ เลขนัยสำคัญจะนับเฉพาะที่ตัวสัมประสิทธิ์ $A$ เท่านั้น ส่วน $10^n$ ไม่นับ");
    }

    sfVisualizer.innerHTML = outputHTML;

    // Display counts
    if (isAmbiguous) {
      const minCount = sigCount;
      const maxCount = numDigits.length - firstNonZeroIdx;
      sfCountDisplay.textContent = `${minCount} ถึง ${maxCount}`;
    } else {
      sfCountDisplay.textContent = sigCount;
    }

    // Populate rules explanation
    sfRulesDisplay.innerHTML = explanations.map(exp => `<li>${exp}</li>`).join('');
  }


  // --- WIDGET 3: UNCERTAINTY CALCULATOR (ADD/SUBTRACT) ---
  const addValA = document.getElementById('add-val-a');
  const addErrA = document.getElementById('add-err-a');
  const addValB = document.getElementById('add-val-b');
  const addErrB = document.getElementById('add-err-b');
  const addOpSelect = document.getElementById('add-op');
  
  const addResultVal = document.getElementById('add-result-val');
  const addSteps = document.getElementById('add-steps');

  // Add event listeners for inputs
  [addValA, addErrA, addValB, addErrB, addOpSelect].forEach(element => {
    if (element) {
      element.addEventListener('input', calculateAddSubUncertainty);
    }
  });

  function calculateAddSubUncertainty() {
    if (!addValA || !addErrA || !addValB || !addErrB || !addResultVal || !addSteps) return;

    const A = parseFloat(addValA.value);
    const dA = parseFloat(addErrA.value);
    const B = parseFloat(addValB.value);
    const dB = parseFloat(addErrB.value);
    const op = addOpSelect.value; // 'add' or 'sub'

    if (isNaN(A) || isNaN(dA) || isNaN(B) || isNaN(dB)) {
      addResultVal.textContent = 'กรุณากรอกข้อมูลให้ครบถ้วน';
      addSteps.textContent = 'รอการคำนวณ...';
      return;
    }

    // Determine decimal places for rounding values based on input decimals
    // Standard rule: decimal places of the result matches the least decimal places of A and B
    const getDecimalPlaces = (num) => {
      const str = num.toString();
      if (!str.includes('.')) return 0;
      return str.split('.')[1].length;
    };

    const decA = getDecimalPlaces(A);
    const decB = getDecimalPlaces(B);
    const decVal = Math.min(decA, decB);

    // Uncertainty decimal places: matches the precision of addition
    const decErrA = getDecimalPlaces(dA);
    const decErrB = getDecimalPlaces(dB);
    const decErr = Math.max(decErrA, decErrB); // Uncertainties add, so keep max decimals for precision

    // Calculations
    const valResult = op === 'add' ? (A + B) : (A - B);
    const errResult = dA + dB; // Uncertainty always adds up!

    // Rounding
    const roundedVal = valResult.toFixed(decVal);
    const roundedErr = errResult.toFixed(decErr);

    addResultVal.textContent = `${roundedVal} ± ${roundedErr}`;

    // Update step-by-step working out
    const opSign = op === 'add' ? '+' : '-';
    addSteps.innerHTML = `
      1. คำนวณค่าจริง: ${A} ${opSign} ${B} = ${valResult.toFixed(Math.max(decA, decB))} → ปรับทศนิยมให้เท่ากับตัวตั้งที่ทศนิยมน้อยที่สุด (${decVal} ตำแหน่ง) → <strong>${roundedVal}</strong><br>
      2. คำนวณค่าคลาดเคลื่อน: ${dA} + ${dB} = <strong>${roundedErr}</strong> (ค่าคลาดเคลื่อนบวกกันเสมอ ไม่ว่าจะบวกหรือลบตัวเลข)<br>
      3. ผลลัพธ์สุดท้าย: <strong>${roundedVal} ± ${roundedErr}</strong>
    `;
  }

  // Run once to initialize
  calculateAddSubUncertainty();


  // --- WIDGET 4: UNCERTAINTY CALCULATOR (MULTIPLY/DIVIDE) ---
  const mulValA = document.getElementById('mul-val-a');
  const mulErrA = document.getElementById('mul-err-a');
  const mulValB = document.getElementById('mul-val-b');
  const mulErrB = document.getElementById('mul-err-b');
  const mulOpSelect = document.getElementById('mul-op');

  const mulResultVal = document.getElementById('mul-result-val');
  const mulSteps = document.getElementById('mul-steps');

  [mulValA, mulErrA, mulValB, mulErrB, mulOpSelect].forEach(element => {
    if (element) {
      element.addEventListener('input', calculateMulDivUncertainty);
    }
  });

  function calculateMulDivUncertainty() {
    if (!mulValA || !mulErrA || !mulValB || !mulErrB || !mulResultVal || !mulSteps) return;

    const A = parseFloat(mulValA.value);
    const dA = parseFloat(mulErrA.value);
    const B = parseFloat(mulValB.value);
    const dB = parseFloat(mulErrB.value);
    const op = mulOpSelect.value; // 'mul' or 'div'

    if (isNaN(A) || isNaN(dA) || isNaN(B) || isNaN(dB) || A === 0 || B === 0) {
      mulResultVal.textContent = 'กรุณากรอกข้อมูลให้ครบถ้วน';
      mulSteps.textContent = 'รอการคำนวณ...';
      return;
    }

    // Calculations
    const valResult = op === 'mul' ? (A * B) : (A / B);
    
    // Percentage uncertainties
    const pctA = (dA / A) * 100;
    const pctB = (dB / B) * 100;
    const pctResult = pctA + pctB; // Percentage uncertainties add up!

    // Significant figures count for the result
    // Determine sig figs count from the raw input strings directly to preserve decimal precision
    const countSigFigs = (str) => {
      let coef = str.trim();
      const sciMatch = coef.match(/^([^-eExX\*]+)/);
      if (sciMatch) coef = sciMatch[1].trim();

      let cleaned = coef.replace(/[-.]/g, '');
      cleaned = cleaned.replace(/^0+/, '');
      if (cleaned.length === 0) return 0;
      return cleaned.length;
    };

    const sfA = countSigFigs(mulValA.value);
    const sfB = countSigFigs(mulValB.value);
    const targetSf = Math.max(1, Math.min(sfA, sfB));

    // Format output with appropriate significant figures
    // We format the final value to the least significant figures
    let formattedVal = valResult.toPrecision(targetSf);

    // Render output (Percentage uncertainty is shown directly, no absolute uncertainty as requested)
    mulResultVal.textContent = `${formattedVal} (คลาดเคลื่อน ± ${pctResult.toFixed(1)}%)`;

    const opSign = op === 'mul' ? '×' : '÷';
    mulSteps.innerHTML = `
      1. คำนวณค่าจริง: ${A} ${opSign} ${B} = ${valResult.toFixed(4)} → ปรับเลขนัยสำคัญให้มี ${targetSf} ตัว (เท่ากับตัวตั้งที่น้อยที่สุด) → <strong>${formattedVal}</strong><br>
      2. หาเปอร์เซ็นต์ความคลาดเคลื่อนของ A: (${dA} / ${A}) × 100% = <strong>${pctA.toFixed(1)}%</strong><br>
      3. หาเปอร์เซ็นต์ความคลาดเคลื่อนของ B: (${dB} / ${B}) × 100% = <strong>${pctB.toFixed(1)}%</strong><br>
      4. เปอร์เซ็นต์ความคลาดเคลื่อนคำตอบ: ${pctA.toFixed(1)}% + ${pctB.toFixed(1)}% = <strong>${pctResult.toFixed(1)}%</strong> (เปอร์เซ็นต์บวกกันเสมอ)<br>
      5. คำตอบในรูปเปอร์เซ็นต์คลาดเคลื่อน: <strong>${formattedVal} (คลาดเคลื่อน ± ${pctResult.toFixed(1)}%)</strong>
    `;
  }

  // Run once to initialize
  calculateMulDivUncertainty();


  // --- WIDGET 5: THERMOMETER UNCERTAINTY VISUALIZER (SLIDE 6) ---
  const thermoValInput = document.getElementById('thermo-val-input');
  const thermoErrInput = document.getElementById('thermo-err-input');
  const thermoValLabel = document.getElementById('thermo-val-label');
  const thermoErrLabel = document.getElementById('thermo-err-label');
  const thermoFormulaReadout = document.getElementById('thermo-formula-readout');
  const thermoRangeText = document.getElementById('thermo-range-text');
  const thermoLiquid = document.getElementById('thermo-liquid');
  const thermoRangeHighlight = document.getElementById('thermo-range-highlight');
  const thermoCenterMarker = document.getElementById('thermo-center-marker');
  const thermoTicksContainer = document.getElementById('thermo-ticks-container');

  const minTemp = 24.0;
  const maxTemp = 26.0;

  function renderThermoTicks() {
    if (!thermoTicksContainer) return;
    thermoTicksContainer.innerHTML = '';
    
    // Draw ticks from 24.0 to 26.0 with 0.1 step
    const steps = 20; // (26.0 - 24.0) / 0.1
    for (let i = 0; i <= steps; i++) {
      const temp = minTemp + (i * 0.1);
      const leftPercent = (i / steps) * 100;
      
      const tick = document.createElement('div');
      const isMajor = (i % 5 === 0); // major ticks at 24.0, 24.5, 25.0, 25.5, 26.0
      
      tick.className = `thermo-tick ${isMajor ? 'major' : ''}`;
      tick.style.left = `${leftPercent}%`;
      
      if (isMajor) {
        const label = document.createElement('div');
        label.className = 'thermo-tick-label';
        label.textContent = `${temp.toFixed(1)}°C`;
        label.style.left = `${leftPercent}%`;
        thermoTicksContainer.appendChild(label);
      }
      
      thermoTicksContainer.appendChild(tick);
    }
  }

  function updateThermometer() {
    if (!thermoValInput || !thermoErrInput) return;
    
    const A = parseFloat(thermoValInput.value);
    const dA = parseFloat(thermoErrInput.value);
    
    // Update labels
    if (thermoValLabel) thermoValLabel.textContent = `${A.toFixed(1)} °C`;
    if (thermoErrLabel) thermoErrLabel.textContent = `${dA.toFixed(1)} °C`;
    
    // Update formula readout
    if (thermoFormulaReadout) thermoFormulaReadout.textContent = `${A.toFixed(1)} ± ${dA.toFixed(1)} °C`;
    
    // Calculate range
    const lower = A - dA;
    const upper = A + dA;
    if (thermoRangeText) {
      thermoRangeText.textContent = `${lower.toFixed(1)} °C  ถึง  ${upper.toFixed(1)} °C`;
    }
    
    // Update fluid column position
    // Center value (A) position in percent (from minTemp to maxTemp)
    const aPercent = ((A - minTemp) / (maxTemp - minTemp)) * 100;
    if (thermoLiquid) thermoLiquid.style.width = `${aPercent}%`;
    if (thermoCenterMarker) thermoCenterMarker.style.left = `${aPercent}%`;
    
    // Update uncertainty range highlight
    const lowerPercent = ((lower - minTemp) / (maxTemp - minTemp)) * 100;
    const upperPercent = ((upper - minTemp) / (maxTemp - minTemp)) * 100;
    const rangeWidth = upperPercent - lowerPercent;
    
    if (thermoRangeHighlight) {
      thermoRangeHighlight.style.left = `${lowerPercent}%`;
      thermoRangeHighlight.style.width = `${rangeWidth}%`;
    }
  }

  // Bind events
  if (thermoValInput) thermoValInput.addEventListener('input', updateThermometer);
  if (thermoErrInput) thermoErrInput.addEventListener('input', updateThermometer);

  // Initialize on load
  renderThermoTicks();
  updateThermometer();
});
