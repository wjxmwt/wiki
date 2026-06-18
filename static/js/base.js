import initNavigation from './nav.js';

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

/**
 * 初始化应用状态
 */
function initializeApp() {
    loadPreferences();
}

function loadPreferences() {
    // 从本地存储加载用户偏好
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


/**
 * 初始化加载动画
 */
window.addEventListener('load',()=> {
    setTimeout(() => {
        initLoaderAnimation();
    },100);
});

function initLoaderAnimation() {
    const loader = document.getElementById('loader');
    const loaderPercent = document.getElementById('loaderPercent');
    const loaderBar = document.querySelector('.loader-progress-bar');
    if (!loader || !loaderPercent || !loaderBar) return;

    // 从子页面返回时跳过加载动画
    if (sessionStorage.getItem('skipLoader') === 'true') {
        let progressValue = 100;
        sessionStorage.removeItem('skipLoader');
        loaderPercent.textContent = progressValue + '%';
        loaderBar.style.width = progressValue + '%';
        setTimeout(() => {
            loader.classList.add('hidden');
        }, 500);
        return;
    }

    let progress = 0;
    loaderBar.style.width = '0%';
    loaderPercent.textContent = '0%';

    const progressInterval = setInterval(() => {
        progress += (Math.random() * 15) + 5;
        if (progress >= 100) {
            progress = 100;
            clearInterval(progressInterval);
            setTimeout(() => {
                if (typeof anime !== 'undefined') {
                    anime({
                        targets: loader,
                        opacity: [1, 0],
                        duration: 500,
                        easing: 'easeInOutQuad',
                        complete: () => {
                            loader.classList.add('hidden');
                        }
                    });
                } else {
                    loader.classList.add('hidden');
                }
            }, 300);
        }

        const progressValue = Math.floor(progress);
        loaderPercent.textContent = progressValue + '%';
        loaderBar.style.width = progressValue + '%';
    }, 100);
}