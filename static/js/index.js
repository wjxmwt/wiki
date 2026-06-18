/* ============================================
   HOMEPAGE ANIMATIONS
   ============================================ */

/**
 * Initialize homepage-specific animations
 */
function initHomepageAnimations() {
    // Only run on homepage
    if (!document.querySelector('.homepage-hero')) return;

    initParallax();
    initScrollAnimations();
    initMascotCursor();
}

/**
 * Parallax scrolling effect for SVG decorations
 */
function initParallax() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    if (parallaxElements.length === 0) return;

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;

        parallaxElements.forEach(el => {
            const speed = parseFloat(el.dataset.parallax);
            const yPos = -(scrolled * speed);
            el.style.transform = `translateY(${yPos}px)`;
        });
    }, { passive: true });
}

/**
 * Scroll-triggered animations using IntersectionObserver
 */
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // Trigger section-specific animations
                if (entry.target.classList.contains('section-solution')) {
                    animateSolutionSection();
                }
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px'
    });

    // Observe all animatable elements
    const animatableElements = document.querySelectorAll(
        '.homepage-section, .svg-decoration, .text-content, .visual-content, .mascot-decor'
    );

    animatableElements.forEach(el => {
        observer.observe(el);
    });

    // Make hero SVGs visible immediately
    const heroSvgs = document.querySelectorAll('.homepage-hero .svg-decoration');
    heroSvgs.forEach(svg => {
        setTimeout(() => {
            svg.classList.add('visible');
        }, 100);
    });
}

/**
 * Solution section specific animations using Anime.js
 */
function animateSolutionSection() {
    // Check if anime.js is available
    if (typeof anime === 'undefined') return;

    // 1. Plasmid orbits and transfects (fly in and rotate)
    const plasmidElement = document.querySelector('.solution-plasmid');
    if (plasmidElement) {
        anime({
            targets: plasmidElement,
            translateX: [-250, 0],
            translateY: [250, 0],
            opacity: [0, 0.8],
            rotate: 360,
            duration: 2200,
            easing: 'easeOutElastic(1, .6)'
        });
    }

    // 2. GFP glows and floats in (symbolizes fluorescing logic pathway active)
    const gfpElement = document.querySelector('.solution-bg-3');
    if (gfpElement) {
        anime({
            targets: gfpElement,
            scale: [0.1, 1],
            opacity: [0, 0.4],
            translateY: [150, 0],
            duration: 1800,
            delay: 400,
            easing: 'easeOutBack'
        });
    }

    // 3. Recombinant plasmid flies in from another side
    const recombElement = document.querySelector('.solution-bg-1');
    if (recombElement) {
        anime({
            targets: recombElement,
            translateX: [200, 0],
            scale: [0.5, 1],
            opacity: [0, 0.4],
            duration: 2000,
            delay: 200,
            easing: 'easeOutBack'
        });
    }

    // 4. Main solution illustration card scale-in
    const mainIll = document.querySelector('.solution-ill');
    if (mainIll) {
        anime({
            targets: mainIll,
            scale: [0.82, 1],
            opacity: [0, 1],
            duration: 1600,
            easing: 'easeOutElastic(1, .75)'
        });
    }
}

/**
 * Custom mascot cursor that follows mouse and reacts to scroll/hover
 */
function initMascotCursor() {
    const mascot = document.getElementById('mascot-cursor');
    if (!mascot) return;

    // Disable on touch devices or small screens — remove element entirely
    const isTouchDevice = window.matchMedia('(hover: none)').matches;
    if (isTouchDevice || window.innerWidth <= 960) {
        mascot.remove();
        return;
    }

    let mouseX = 0, mouseY = 0;
    let mascotX = 0, mascotY = 0;
    let currentScale = 0; // Starts from 0 for a smooth entrance scale-up
    let currentRotation = 0;
    let targetScale = 1;
    let targetRotation = 0;
    let isHovering = false;
    let isScrolling = false;
    let scrollTimeout;

    // Track mouse position
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Show mascot on first mouse move
        if (!mascot.classList.contains('active')) {
            mascot.classList.add('active');
        }
    });

    // React to scroll events (enlarge and rotate)
    window.addEventListener('scroll', () => {
        isScrolling = true;
        targetScale = isHovering ? 0.4 : 1.25;
        targetRotation = 12;

        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            isScrolling = false;
            targetScale = isHovering ? 0.4 : 1;
            targetRotation = 0;
        }, 150);
    }, { passive: true });

    // Shrink and fade mascot when hovering over clickable elements to prevent blocking clicks/vision
    const hoverables = document.querySelectorAll('a, button, .theme-toggle, .lang-toggle, [role="button"]');
    hoverables.forEach(el => {
        el.addEventListener('mouseenter', () => {
            isHovering = true;
            targetScale = 0.4;
            mascot.style.opacity = '0.5';
        });
        el.addEventListener('mouseleave', () => {
            isHovering = false;
            targetScale = isScrolling ? 1.25 : 1;
            mascot.style.opacity = '1';
        });
    });

    let lastStarX = 0, lastStarY = 0;

    // Helper to create small trailing stars
    function createStar(x, y) {
        const star = document.createElement('div');
        star.className = 'cursor-star';
        
        // Random cute star symbols
        const starChars = ['✦', '✧', '★', '✨'];
        star.textContent = starChars[Math.floor(Math.random() * starChars.length)];
        
        star.style.left = `${x}px`;
        star.style.top = `${y}px`;
        
        // Randomize physics drift, rotation, and size
        const dx = (Math.random() - 0.5) * 60;
        const dy = (Math.random() - 0.5) * 60;
        const rot = (Math.random() - 0.5) * 360;
        const size = Math.random() * 8 + 12; // 12px to 20px
        
        star.style.setProperty('--dx', `${dx}px`);
        star.style.setProperty('--dy', `${dy}px`);
        star.style.setProperty('--rot', `${rot}deg`);
        star.style.fontSize = `${size}px`;
        
        // Rainbow palette matching the project theme (greens, gold, soft blue, pink)
        const colors = ['#10B981', '#34D399', '#6EE7B7', '#FBBF24', '#60A5FA', '#F472B6'];
        star.style.color = colors[Math.floor(Math.random() * colors.length)];
        
        document.body.appendChild(star);
        
        // Remove after animation completes
        setTimeout(() => {
            star.remove();
        }, 800);
    }

    // Smooth animation loop using requestAnimationFrame
    function updateMascotPosition() {
        // Inertial physics lag (0.12 = smooth follow)
        const lag = 0.12;
        mascotX += (mouseX - mascotX) * lag;
        mascotY += (mouseY - mascotY) * lag;

        currentScale += (targetScale - currentScale) * 0.15;
        currentRotation += (targetRotation - currentRotation) * 0.15;

        // Offset the mascot completely to the bottom-right of the cursor (x+25, y+25)
        // This ensures the mascot sits below and to the right of the mouse pointer and never covers the hotspot
        const xOffset = 25;
        const yOffset = 25;

        mascot.style.left = `${mascotX + xOffset}px`;
        mascot.style.top = `${mascotY + yOffset}px`;
        mascot.style.transform = `scale(${currentScale}) rotate(${currentRotation}deg)`;

        // Spawning star trail
        const currentMascotCenterX = mascotX + xOffset + 40; // 80px width / 2
        const currentMascotCenterY = mascotY + yOffset + 40; // 80px height / 2

        const dist = Math.hypot(currentMascotCenterX - lastStarX, currentMascotCenterY - lastStarY);
        if (dist > 15 && currentScale > 0.2) {
            createStar(currentMascotCenterX, currentMascotCenterY);
            lastStarX = currentMascotCenterX;
            lastStarY = currentMascotCenterY;
        }

        requestAnimationFrame(updateMascotPosition);
    }

    updateMascotPosition();
}

// Initialize homepage animations when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHomepageAnimations);
} else {
    initHomepageAnimations();
}