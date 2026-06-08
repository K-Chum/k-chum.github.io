/**
 * Classroom Learning Lab — Global Lesson Template Script (template.js)
 * Automatically handles presentation navigation, slide indicators,
 * background decorations, and LaTeX math rendering via KaTeX.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. INJECT FLOATING BACK BUTTON & BACKGROUND DECOR
  injectTemplateLayout();

  // 2. SLIDE NAVIGATION SYSTEM
  initSlideNavigation();

  // 3. LAUNCH KATEX MATH RENDERING
  loadKaTeXAndRender();
});

/**
 * Dynamically injects layout elements (back button, background grids/shapes)
 * so individual lessons don't need boilerplate HTML markup.
 */
function injectTemplateLayout() {
  // Inject Back Button if not already present
  if (!document.querySelector('.back-home')) {
    const backBtn = document.createElement('a');
    backBtn.className = 'back-home';
    
    // Support dynamic back links based on data-back-link attribute on body
    const customBackLink = document.body.getAttribute('data-back-link');
    backBtn.href = customBackLink || '../../index.html';
    
    backBtn.setAttribute('aria-label', 'กลับสู่หน้าหลัก');
    backBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
      </svg>
      กลับหน้าหลัก
    `;
    document.body.insertBefore(backBtn, document.body.firstChild);
  }

  // Inject Background Grid if not already present
  if (!document.querySelector('.bg-grid')) {
    const bgGrid = document.createElement('div');
    bgGrid.className = 'bg-grid';
    document.body.insertBefore(bgGrid, document.body.firstChild);
  }

  // Inject Blur Background Shapes if not already present
  if (!document.querySelector('.bg-shapes')) {
    const bgShapes = document.createElement('div');
    bgShapes.className = 'bg-shapes';
    bgShapes.innerHTML = `
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
    `;
    document.body.insertBefore(bgShapes, document.body.firstChild);
  }
}

/**
 * Handles slide switching, navigation buttons, progress tracking, and key listeners.
 */
function initSlideNavigation() {
  const container = document.querySelector('.presentation-container');
  const slides = document.querySelectorAll('.slide');
  if (!container || slides.length === 0) return;

  let currentSlideIndex = 0;
  const totalSlides = slides.length;

  // Create slide footer dynamically
  let slideFooter = document.querySelector('.slide-footer');
  if (!slideFooter) {
    slideFooter = document.createElement('footer');
    slideFooter.className = 'slide-footer';
    slideFooter.innerHTML = `
      <div class="nav-controls">
        <button class="nav-btn" id="prev-btn" title="หน้าก่อนหน้า" aria-label="สไลด์ก่อนหน้า">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <div class="nav-dots" id="nav-dots"></div>

        <div class="progress-container">
          <div class="progress-bar" id="progress-bar"></div>
        </div>

        <div class="slide-indicator">
          สไลด์ที่ <span id="current-slide">1</span> / <span id="total-slides">${totalSlides}</span>
        </div>

        <button class="nav-btn" id="next-btn" title="หน้าถัดไป" aria-label="สไลด์ถัดไป">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    `;
    container.appendChild(slideFooter);
  }

  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const progressBar = document.getElementById('progress-bar');
  const navDotsContainer = document.getElementById('nav-dots');
  const currentSlideSpan = document.getElementById('current-slide');

  // Populate nav dots
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
    if (prevBtn) prevBtn.disabled = currentSlideIndex === 0;
    if (nextBtn) nextBtn.disabled = currentSlideIndex === totalSlides - 1;

    // Update dot classes
    const dots = document.querySelectorAll('.nav-dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentSlideIndex);
    });

    // Update progress bar
    if (progressBar) {
      const progress = totalSlides > 1 ? (currentSlideIndex / (totalSlides - 1)) * 100 : 100;
      progressBar.style.width = `${progress}%`;
    }

    // Update page number labels
    if (currentSlideSpan) currentSlideSpan.textContent = currentSlideIndex + 1;

    // Trigger iframe refreshes or redraw hooks if defined in the slide
    const activeSlide = slides[currentSlideIndex];
    
    // Refresh or load iframes inside the active slide
    const iframes = activeSlide.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      // Load iframe if it hasn't loaded yet, or if it explicitly requests a reset on activation
      if (!iframe.dataset.loaded || iframe.dataset.reload === 'true') {
        const src = iframe.getAttribute('src');
        iframe.setAttribute('src', src);
        iframe.dataset.loaded = 'true';
      }
    });

    // Fire global slide change custom event for optional widgets integrations
    const event = new CustomEvent('slideChanged', { detail: { index: currentSlideIndex } });
    document.dispatchEvent(event);
  }

  function goToSlide(index) {
    if (index < 0 || index >= totalSlides) return;

    slides.forEach((slide) => {
      slide.classList.remove('active');
    });

    currentSlideIndex = index;
    slides[currentSlideIndex].classList.add('active');

    updateControls();
    window.scrollTo(0, 0); // Scroll to top on slide change
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

  // Bind controls events
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);
  if (nextBtn) nextBtn.addEventListener('click', nextSlide);

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    // Prevent navigating when typing inside form elements (inputs, textareas)
    if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA' || document.activeElement.isContentEditable) {
      return;
    }
    
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      nextSlide();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevSlide();
    }
  });

  // Init display
  goToSlide(0);
}

/**
 * Loads KaTeX dynamically from CDN and renders any LaTeX formulas in document body.
 * Supports static loading checks to prevent double-loading under local file:// protocol.
 */
function loadKaTeXAndRender() {
  const renderMath = () => {
    renderMathInElement(document.body, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\(', right: '\\)', display: false },
        { left: '\\[', right: '\\]', display: true }
      ],
      throwOnError: false
    });
  };

  // If already loaded statically, run immediately
  if (typeof renderMathInElement !== 'undefined') {
    renderMath();
    return;
  }

  // 1. Add CSS Link
  if (!document.querySelector('link[href*="katex"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/katex@0.17.0/dist/katex.min.css';
    link.integrity = 'sha384-vlBdW0r3AcZO/HboRPznQNowvexd3fY8qHOWkBi5q7KGgqJ+F48+DceybYmrVbmB';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }

  // 2. Load KaTeX Main JS
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/katex@0.17.0/dist/katex.min.js';
  script.integrity = 'sha384-AtrdNsnxl/75rvBneBVH7DtOvCxSVahR2zWqle1coBKd8DEmLoviqNeJSx64gNAs';
  script.crossOrigin = 'anonymous';
  script.onload = () => {
    // 3. Load KaTeX Auto-Render script after main script is loaded
    const autoRenderScript = document.createElement('script');
    autoRenderScript.src = 'https://cdn.jsdelivr.net/npm/katex@0.17.0/dist/contrib/auto-render.min.js';
    autoRenderScript.integrity = 'sha384-bjyGPfbij8/NDKJhSGZNP/khQVgtHUE5exjm4Ydllo42FwIgYsdLO2lXGmRBf5Mz';
    autoRenderScript.crossOrigin = 'anonymous';
    autoRenderScript.onload = renderMath;
    document.head.appendChild(autoRenderScript);
  };
  
  document.head.appendChild(script);
}
