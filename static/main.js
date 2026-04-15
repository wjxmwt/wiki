const AppState = {
    currentLang: 'en',
    currentTheme: 'light',
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
});

function initializeApp() {
    loadPreferences();
}

function loadPreferences() {
    const savedLang = localStorage.getItem('porfolio-lang');
    const savedTheme = localStorage.getItem('portfolio-theme');
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
    localStorage.setItem('portfolio-lang', newLang);
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
        const enText = element.getAttribute('data-text-en');
        const zhText = element.getAttribute('data-text-zh');
        // 支持复杂格式的翻译
        // 包含HTML标记（例如物种名称的<em>）的元素使用innerHTML
        const useHTML = element.hasAttribute('data-html');
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
}

function toggleTheme() {
    const newTheme = AppState.currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('portfolio-theme', newTheme); // 本地存储
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

    // ========== 2. 处理下拉菜单的父级导航（仅展开/收起下拉，不跳转） ==========
    // 同时匹配首页 (#xxx) 和子页面 (/#xxx) 格式的下拉触发器
    const dropdownTriggers = document.querySelectorAll('.has-dropdown .nav-link');
    dropdownTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const parentLi = trigger.closest('.has-dropdown');
            const dropdownMenu = parentLi?.querySelector('.dropdown-menu');
            const isOpen = dropdownMenu?.classList.contains('active');

            // 关闭所有其他下拉菜单
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.classList.remove('active');
            });
            document.querySelectorAll('.has-dropdown .nav-link').forEach(link => {
                link.classList.remove('expanded');
            });

            // 切换当前下拉菜单
            if (dropdownMenu) {
                dropdownMenu.classList.toggle('active', !isOpen);
                trigger.classList.toggle('expanded', !isOpen);
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

    // 子页面模式：/#xxx → 淡出过渡后跳转首页
    if (isSubpage) {
        const dropdownLinksSlash = document.querySelectorAll('.dropdown-link[href^="/#"]');
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
        const normalSubpageLinks = document.querySelectorAll('.nav-link[href^="/#"]:not(.has-dropdown .nav-link)');
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
    window.addEventListener('scroll', updateHeaderOnSroll);

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

function updateHeaderOnSroll() {
    const header = document.querySelector('.main-header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
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

