const AppState = {
    currentLang: 'en',
    currentTheme: 'dark',
    currentSection: 'home',
    isMenuOpen: false,
    isLoaded: false
}

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    initTheme();
    initLanguage();
    initNavigation();
    initScrollEffects();
    initMobildMenu();
    updateThemeUI();
    initSubpageTransitions();
    init3DTiltAndGlow();
    
    // 渐显页面内容，防止语言及主题切换闪烁
    document.body.classList.remove('page-loading');
});

function initializeApp() {
    loadPreferences();
}

function loadPreferences() {
    const savedLang = sessionStorage.getItem('portfolio-lang');
    const savedTheme = sessionStorage.getItem('portfolio-theme');
    if (savedLang) AppState.currentLang = savedLang;
    if (savedTheme) AppState.currentTheme = savedTheme;
}

/**
 * 语言切换
 */
function initLanguage() {
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        langToggle.addEventListener('click', toggleLanguage);
    }
    setLanguage(AppState.currentLang);
}

function toggleLanguage() {
    const newLang = AppState.currentLang === 'en' ? 'zh' : 'en';
    setLanguage(newLang);
    sessionStorage.setItem('portfolio-lang', newLang);
}

function setLanguage(lang) {
    AppState.currentLang = lang;
    const html = document.documentElement;
    const body = document.body;
    if (lang === 'zh') {
        html.setAttribute('lang', 'zh');
        body.setAttribute('data-lang', 'zh');
    } else {
        html.setAttribute('lang', 'en');
        body.setAttribute('data-lang', 'en');
    }
    updateLanguageUI();
}

function updateLanguageUI() {
    const textElements = document.querySelectorAll('[data-text-en],[data-text-zh]');
    textElements.forEach(element => {
        const enText = element.getAttribute('data-text-en') || '';
        const zhText = element.getAttribute('data-text-zh') || '';
        // 双重过滤防御：如果是 data-html 或是文本中检测到 HTML 标签图案，则以 innerHTML 形式解析渲染
        const hasHTMLTags = /<\/?[a-z][\s\S]*>/i.test(enText) || /<\/?[a-z][\s\S]*>/i.test(zhText);
        const useHTML = element.hasAttribute('data-html') || hasHTMLTags;
        const setter = useHTML ? 'innerHTML' : 'textContent';
        if (AppState.currentLang === 'zh' && zhText) {
            element[setter] = zhText;
        } else if (AppState.currentLang === 'en' && enText) {
            element[setter] = enText;
        }
    });
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        const langText = langToggle.querySelector('.lang-text');
        if (langText) {
            langText.textContent = AppState.currentLang === 'en' ? 'ZH' : 'EN';
        }
    }
}

/**
 * 主题风格切换：亮/暗
 */
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    setTheme(AppState.currentTheme);
}

function toggleTheme() {
    const newTheme = AppState.currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    sessionStorage.setItem('portfolio-theme', newTheme); // 本地存储
}

function setTheme(theme) {
    AppState.currentTheme = theme;
    document.body.setAttribute('data-theme', theme);
    updateThemeUI();
}

function updateThemeUI() {
    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = AppState.currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }
}

/**
 * 导航栏动画切换
 */
function initNavigation() {
    const isSubpage = !!window.__IS_SUBPAGE;

    // ========== 1. 处理普通导航链接（无下拉） ==========
    const normalNavLinks = document.querySelectorAll('.nav-link[href^="#"]:not(.has-dropdown .nav-link)');
    normalNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            updateActiveNavLink(link); // 更新active状态

            // 平滑滚动到目标区块
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                const headerHeight = document.querySelector('.main-header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // 移动端菜单打开则关闭
                if (AppState.isMenuOpen) {
                    toggleMoblieMenu();
                }
            }
        });
    });

    // ========== 2. 下拉菜单 — 桌面端悬停触发，移动端点击触发 ==========
    const dropdownItems = document.querySelectorAll('.has-dropdown');

    // Helper: returns true when in mobile layout (nav drawer mode)
    function isMobileLayout() {
        return window.innerWidth <= 768;
    }

    dropdownItems.forEach(item => {
        const trigger = item.querySelector('.nav-link');
        const menu = item.querySelector('.dropdown-menu');
        let closeTimer = null;

        // Desktop: mouseenter / mouseleave
        item.addEventListener('mouseenter', () => {
            if (isMobileLayout()) return; // skip on mobile layout
            clearTimeout(closeTimer);
            dropdownItems.forEach(other => {
                if (other !== item) {
                    other.querySelector('.dropdown-menu')?.classList.remove('active');
                    other.querySelector('.nav-link')?.classList.remove('expanded');
                }
            });
            menu?.classList.add('active');
            trigger?.classList.add('expanded');
        });

        item.addEventListener('mouseleave', () => {
            if (isMobileLayout()) return;
            closeTimer = setTimeout(() => {
                menu?.classList.remove('active');
                trigger?.classList.remove('expanded');
            }, 150);
        });

        // Click handler — used on both desktop (to prevent navigation) and mobile (to toggle accordion)
        trigger?.addEventListener('click', (e) => {
            if (isMobileLayout()) {
                e.preventDefault();
                e.stopPropagation();
                const isOpen = menu?.classList.contains('active');

                // Accordion: close all OTHER menus first
                dropdownItems.forEach(other => {
                    if (other !== item) {
                        other.querySelector('.dropdown-menu')?.classList.remove('active');
                        other.querySelector('.nav-link')?.classList.remove('expanded');
                    }
                });

                // Toggle current menu (tap-same-item to close)
                if (isOpen) {
                    menu?.classList.remove('active');
                    trigger?.classList.remove('expanded');
                } else {
                    menu?.classList.add('active');
                    trigger?.classList.add('expanded');
                }
            } else {
                e.preventDefault();
            }
        });
    });

    // ========== 3. 处理下拉菜单的子链接 ==========
    // 首页模式：#xxx → 平滑滚动
    const dropdownLinksHash = document.querySelectorAll('.dropdown-link[href^="#"]');
    dropdownLinksHash.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            updateActiveNavLink(link);

            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                const headerHeight = document.querySelector('.main-header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                if (AppState.isMenuOpen) {
                    toggleMoblieMenu();
                }
            }

            // 关闭下拉菜单
            document.querySelectorAll('.dropdown-menu').forEach(menu => menu.classList.remove('active'));
            document.querySelectorAll('.has-dropdown .nav-link').forEach(l => l.classList.remove('expanded'));
        });
    });

    // 子页面模式：../../#xxx → 淡出过渡后跳转首页
    if (isSubpage) {
        const dropdownLinksSlash = document.querySelectorAll('.dropdown-link[href^="../../#"]');
        dropdownLinksSlash.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                // 如果链接指向当前页面则不跳转
                if (href === window.location.pathname) {
                    e.preventDefault();
                    return;
                }

                e.preventDefault();
                sessionStorage.setItem('skipLoader', 'true');
                document.body.classList.add('page-fade-out');
                // 关闭下拉菜单
                document.querySelectorAll('.dropdown-menu').forEach(menu => menu.classList.remove('active'));
                setTimeout(() => {
                    window.location.href = href;
                }, 300);
            });
        });

        // 子页面中无下拉的普通导航链接（如 Human Practice, Team, Video），也需要淡出过渡
        const normalSubpageLinks = document.querySelectorAll('.nav-link[href^="../../#"]:not(.has-dropdown .nav-link)');
        normalSubpageLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                sessionStorage.setItem('skipLoader', 'true');
                document.body.classList.add('page-fade-out');
                setTimeout(() => {
                    window.location.href = link.getAttribute('href');
                }, 300);
            });
        });
    }

    // ========== 4. 绑定滚动事件 ==========
    // 子页面不绑定 handleScroll（避免清除导航栏 active 状态）
    if (!isSubpage) {
        window.addEventListener('scroll', handleScroll);
    }
    window.addEventListener('scroll', updateHeaderOnSroll, { passive: true });

    // ========== 5. 点击页面其他区域关闭下拉菜单 ==========
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.has-dropdown')) {
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.classList.remove('active');
            });
            document.querySelectorAll('.has-dropdown .nav-link').forEach(link => {
                link.classList.remove('expanded');
            });
        }
    });
}

function handleScroll() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.scrollY + 100;
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            AppState.currentSection = sectionId;
            updateActiveNavLink(null, sectionId);
        }
    });
}

function updateActiveNavLink(clickedLink, sectionId = null) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (clickedLink && link === clickedLink) {
            link.classList.add('active');
        } else if (sectionId) {
            const linkSection = link.getAttribute('data-section');
            if (linkSection === sectionId) {
                link.classList.add('active');
            }
        }
    });
}

// ---- 胶囊导航栏滚动检测（rAF 优化） ----
const updateHeaderOnSroll = (() => {
    let header = null;
    let ticking = false;

    return function () {
        if (!header) header = document.querySelector('.main-header');
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            ticking = false;
        });
    };
})();

/**
 * 滚动响应
 */
function initScrollEffects() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
}

/**
 * 动态适应移动端布局
 */
function initMobildMenu() {
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMoblieMenu);
    }
    document.addEventListener('click', (e) => {
        const navMenu = document.getElementById('navMenu');
        const menuToggle = document.getElementById('menuToggle');
        if (AppState.isMenuOpen && !navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
            toggleMoblieMenu();
        }
    });
}

function toggleMoblieMenu() {
    AppState.isMenuOpen = !AppState.isMenuOpen;
    const navMenu = document.getElementById('navMenu');
    const menuToggle = document.getElementById('menuToggle');
    if (navMenu) {
        navMenu.classList.toggle('active', AppState.isMenuOpen);
    }
    if (menuToggle) {
        menuToggle.classList.toggle('active', AppState.isMenuOpen);
    }
    // Collapse all dropdown sub-menus when closing the drawer
    if (!AppState.isMenuOpen) {
        document.querySelectorAll('.dropdown-menu').forEach(menu => menu.classList.remove('active'));
        document.querySelectorAll('.has-dropdown .nav-link').forEach(link => link.classList.remove('expanded'));
    }
}

/**
 * 子页面平滑过渡
 * 处理 Logo 点击和当前页面链接
 */
function initSubpageTransitions() {
    if (!window.__IS_SUBPAGE) return;

    const currentPath = window.location.pathname;
    const homeUrl = window.__HOME_URL || '/';

    // Logo 点击 → 淡出过渡回首页
    // 使用 nav-brand 内的链接，而不是硬编码 href="/"
    const logoLink = document.querySelector('.nav-brand a');
    if (logoLink) {
        logoLink.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.setItem('skipLoader', 'true');
            document.body.classList.add('page-fade-out');
            setTimeout(() => {
                window.location.href = homeUrl;
            }, 300);
        });
    }

    // 当前子页面内的链接（如 /wetlab/salicylic-acid）不需要跳转
    const currentPageLinks = document.querySelectorAll(`a[href="${currentPath}"]`);
    currentPageLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
        });
    });
}

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

/**
 * Interactive 3D Tilt and Cursor Glow for Glass Cards and Illustration Containers
 */
function init3DTiltAndGlow() {
    // Disable 3D tilt on touch-only devices
    if (window.matchMedia('(hover: none)').matches) return;

    const targets = document.querySelectorAll('.glass-card, .illustration-container');
    targets.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Remove transition for latency-free 60fps tracking
            card.style.transition = 'none';

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            // Max rotation: 5 degrees for premium subtle tilt
            const tiltX = ((y - centerY) / centerY) * -5;
            const tiltY = ((x - centerX) / centerX) * 5;

            card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-6px)`;
            card.style.setProperty('--glow-x', `${x}px`);
            card.style.setProperty('--glow-y', `${y}px`);
        });

        card.addEventListener('mouseleave', () => {
            // Restore smooth transition on exit
            card.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.5s ease, border-color 0.5s ease';
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        });
    });
}
