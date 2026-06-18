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

export default initNavigation;

