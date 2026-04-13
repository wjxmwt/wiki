/*
 * Wet Lab页面交互增强
 * 目录高亮 · 滚动动画 · 返回顶部
 */

document.addEventListener('DOMContentLoaded', () => {
    initWetlabTOC();
    initWetlabAnimations();
    initBackToTop();
});

/* ========================================
   1. 目录高亮
   ======================================== */
function initWetlabTOC() {
    const tocLinks = document.querySelectorAll('#tocList a');
    if (!tocLinks.length) return;

    const sectionIds = Array.from(tocLinks).map(a => a.getAttribute('href').replace('#', ''));

    function updateActiveTOC() {
        const scrollY = window.scrollY + 140;       // 偏移量
        let activeId = sectionIds[0];

        sectionIds.forEach(id => {
            const section = document.getElementById(id);
            if (section && section.offsetTop <= scrollY) {
                activeId = id;
            }
        });

        tocLinks.forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === '#' + activeId);
        });
    }

    window.addEventListener('scroll', updateActiveTOC, { passive: true });
    updateActiveTOC();     // 初始运行

    // 点击平滑滚动
    tocLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                const headerH = document.querySelector('.main-header')?.offsetHeight || 80;
                window.scrollTo({
                    top: target.offsetTop - headerH - 20,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ========================================
   2. 滚动动画（淡入上移）
   ======================================== */
function initWetlabAnimations() {
    const elements = document.querySelectorAll('.wetlab-animate');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.08,
        rootMargin: '0px 0px -60px 0px'
    });

    elements.forEach(el => observer.observe(el));
}

/* ========================================
   3. 返回顶部按钮
   ======================================== */
function initBackToTop() {
    const btn = document.getElementById('backToTopBtn');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}
