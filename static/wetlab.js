/*
 * Wet Lab页面交互增强
 * 目录高亮 · 可折叠目录 · 图片放大 · 移动端TOC · 滚动动画 · 返回顶部
 */

document.addEventListener('DOMContentLoaded', () => {
    initWetlabTOC();
    initCollapsibleTOC();
    initWetlabAnimations();
    initBackToTop();
    initImageLightbox();
    initMobileTOC();
});

/* ========================================
   1. 目录高亮（使用 getBoundingClientRect 精确定位）
   ======================================== */
function initWetlabTOC() {
    const tocLinks = document.querySelectorAll('#tocList a');
    if (!tocLinks.length) return;

    const sectionIds = Array.from(tocLinks).map(a => a.getAttribute('href').replace('#', ''));
    const OFFSET = 160; // 导航栏高度 + 额外偏移

    function updateActiveTOC() {
        let activeId = sectionIds[0];

        for (let i = 0; i < sectionIds.length; i++) {
            const section = document.getElementById(sectionIds[i]);
            if (!section) continue;
            const rect = section.getBoundingClientRect();
            if (rect.top <= OFFSET) {
                activeId = sectionIds[i];
            }
        }

        tocLinks.forEach(a => {
            const isActive = a.getAttribute('href') === '#' + activeId;
            a.classList.toggle('active', isActive);
        });

        // 自动展开高亮子项所属的父级折叠组
        const activeLink = document.querySelector('#tocList a.active');
        if (activeLink) {
            const parentLi = activeLink.closest('.toc-parent');
            if (parentLi && !parentLi.classList.contains('expanded')) {
                parentLi.classList.add('expanded');
            }
        }
    }

    window.addEventListener('scroll', updateActiveTOC, { passive: true });
    updateActiveTOC();

    // 点击平滑滚动
    tocLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                const headerH = document.querySelector('.main-header')?.offsetHeight || 80;
                window.scrollTo({
                    top: target.getBoundingClientRect().top + window.scrollY - headerH - 24,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ========================================
   2. 可折叠树形目录
   ======================================== */
function initCollapsibleTOC() {
    const expandBtns = document.querySelectorAll('.toc-expand-btn');
    expandBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const parentLi = btn.closest('.toc-parent');
            if (parentLi) {
                parentLi.classList.toggle('expanded');
            }
        });
    });

    // 主标题链接也可以展开/收起（点击链接文字时）
    document.querySelectorAll('.toc-parent-row > a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const parentLi = link.closest('.toc-parent');
            if (parentLi) {
                parentLi.classList.toggle('expanded');
            }
            // 同时跳转到对应章节
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                const headerH = document.querySelector('.main-header')?.offsetHeight || 80;
                window.scrollTo({
                    top: target.getBoundingClientRect().top + window.scrollY - headerH - 24,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ========================================
   3. 滚动动画（淡入上移）
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
   4. 返回顶部按钮
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

/* ========================================
   5. 图片点击放大（Lightbox）
   ======================================== */
function initImageLightbox() {
    // 创建 lightbox DOM
    const lightbox = document.createElement('div');
    lightbox.className = 'image-lightbox';
    lightbox.id = 'imageLightbox';
    lightbox.innerHTML = `
        <button class="lightbox-close" aria-label="关闭"><i class="fas fa-times"></i></button>
        <img src="" alt="放大预览">
    `;
    document.body.appendChild(lightbox);

    const lightboxImg = lightbox.querySelector('img');
    const closeBtn = lightbox.querySelector('.lightbox-close');

    // 为所有 wetlab-figure 中的图片绑定点击事件
    document.querySelectorAll('.wetlab-figure img').forEach(img => {
        img.addEventListener('click', () => {
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt || '放大预览';
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    // 关闭
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeLightbox();
    });

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
}

/* ========================================
   6. 移动端侧边栏折叠
   ======================================== */
function initMobileTOC() {
    const toggleBtn = document.getElementById('tocToggleBtn');
    const toc = document.getElementById('wetlab-toc');
    const overlay = document.getElementById('tocOverlay');
    if (!toggleBtn || !toc) return;

    function openTOC() {
        toc.classList.add('open');
        toggleBtn.classList.add('active');
        if (overlay) overlay.classList.add('active');
    }

    function closeTOC() {
        toc.classList.remove('open');
        toggleBtn.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
    }

    toggleBtn.addEventListener('click', () => {
        if (toc.classList.contains('open')) {
            closeTOC();
        } else {
            openTOC();
        }
    });

    // 点击遮罩关闭
    if (overlay) {
        overlay.addEventListener('click', closeTOC);
    }

    // 点击目录链接后自动关闭（仅移动端）
    document.querySelectorAll('#tocList a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 960) {
                setTimeout(closeTOC, 200);
            }
        });
    });
}
