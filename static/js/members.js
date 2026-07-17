(function () {
    const membersPage = document.querySelector('.members_page');
    if (!membersPage) return;

    const sections = Array.from(membersPage.querySelectorAll('section'));
    if (!sections.length) return;

    let carouselInitialized = false;
    let currentSectionIndex = 0;
    let isScrolling = false;
    const scrollThreshold = 0.1;

    // 初始化成员旋转图
    function initMembersCarousel() {
        if (carouselInitialized) return;
        carouselInitialized = true;

        const groupSlides = document.querySelector('.group_slides');
        if (!groupSlides) return;

        let cardWidth = 400;
        let activeIndex = 3;
        // 添加卡片点击事件
        function cardAddClick() {
            const cards = document.querySelectorAll('.carousel_card');
            cards.forEach((card, index) => {
                card.onclick = (e) => {
                    // 阻止事件冒泡（点击卡片时，不触发父元素的点击事件）
                    e.stopPropagation();
                    handleCardClick(index);
                };
            });
        }
        // 处理卡片点击事件
        function handleCardClick(index) {
            if (activeIndex !== index) {
                const previousIndex = activeIndex;
                closeActiveCardBook(previousIndex);
                activeIndex = index;  
                updateCarousel();
            } else {
                toggleActiveCardBook();
            }
        }
        // 切换到指定索引的卡片
        function toSlide(index) {
            activeIndex = index;
            updateCarousel();
        }
        // 更新旋转图状态
        function updateCarousel() {
            groupSlides.style.transform = `translateX(calc(60vw - ${activeIndex * cardWidth + cardWidth / 2}px))`;
            const cards = document.querySelectorAll('.carousel_card');
            const closedBookCases = document.querySelectorAll('.closed_book_case');
            const titles = document.querySelectorAll('.carousel_title');
            cards.forEach((card, index) => {
                const isActive = activeIndex === index;
                card.classList.toggle('is_active', isActive);
                const rotateY = (activeIndex - index) * 60;
                const scale = isActive ? 1 : 0.8;
                const carouselTransform = `rotateY(${rotateY}deg) scale(${scale})`;
                card.style.transform = carouselTransform;
                if (closedBookCases[index]) {
                    closedBookCases[index].style.transform = carouselTransform;
                }
            });
            titles.forEach((title, index) => {
                const isActive = activeIndex === index;
                title.style.filter = isActive ? 'blur(0)' : 'blur(10px)';
                title.style.opacity = isActive ? 1 : 0.5;
            });
        }

        const carouselItems = document.querySelectorAll('.carousel_item');
        // 获取指定索引的卡片容器
        function getCardContainer(index) {
            const item = carouselItems[index];
            return item ? item.querySelector('.group_book_3d') : null;
        }
        // 获取指定索引的卡片项
        function getCardItems(index) {
            const item = carouselItems[index];
            return item ? item.querySelectorAll('.group_book_3d_item') : [];
        }
        // 更新指定容器的状态
        function updateContainerState(index) {
            const container = getCardContainer(index);
            const items = getCardItems(index);
            if (!container || items.length === 0) return;
            // 检查是否有打开的页面
            const pages = Array.from(items).slice(0, -1);
            const anyOpen = pages.some((item) => item.classList.contains('is_open'));
            if (anyOpen) {
                container.classList.add('book_open');
                const carouselItem = carouselItems[index];
                if (carouselItem) {
                    carouselItem.classList.add('book_open');
                }
            } else {
                container.classList.remove('book_open');
                const carouselItem = carouselItems[index];
                if (carouselItem) {
                    carouselItem.classList.remove('book_open');
                }
            }
        }

        function closeActiveCardBook(index = activeIndex) {
            const items = getCardItems(index);
            Array.from(items).slice(0, -1).forEach((item) => item.classList.remove('is_open'));
            updateContainerState(index);
        }

        function openNextPage(index = activeIndex) {
            const items = getCardItems(index);
            const pages = Array.from(items).slice(0, -1);
            const nextPage = pages.find((item) => !item.classList.contains('is_open'));
            if (nextPage) {
                nextPage.classList.add('is_open');
                updateContainerState(index);
            }
        }

        function toggleActiveCardBook() {
            const items = getCardItems(activeIndex);
            const pages = Array.from(items).slice(0, -1);
            const allOpen = pages.length > 0 && pages.every((item) => item.classList.contains('is_open'));
            if (allOpen) {
                closeActiveCardBook();
            } else {
                openNextPage(activeIndex);
            }
        }

        document.addEventListener('click', () => {
            closeActiveCardBook();
        });

        cardAddClick();
        updateCarousel();
    }
    // 激活指定节部分
    function activateSection(section) {
        if (section.dataset.lazyLoaded === 'true') return;

        section.dataset.lazyLoaded = 'true';
        section.classList.add('is-loaded');
        section.classList.add('visible');

        if (section.id === 'membersDisplay') {
            initMembersCarousel();
        }
    }

    // 懒加载观察器
    const lazyObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                activateSection(entry.target);
                lazyObserver.unobserve(entry.target); // 只观察一次
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // 初始化所有section
    sections.forEach((section) => {
        section.classList.add('lazy-section');
        lazyObserver.observe(section);
    });

    // 防抖函数 - 优化性能
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 滚动吸附处理函数
    function handleScroll() {
        // 如果正在滚动动画中，忽略
        if (isScrolling) return;
        
        const windowHeight = window.innerHeight;
        const scrollTop = window.scrollY;
        
        // 向下滚动检测
        if (currentSectionIndex < sections.length - 1) {
            const nextSection = sections[currentSectionIndex + 1];
            const nextSectionTop = nextSection.offsetTop;
            // 计算下一个section已经进入视口的高度
            const visibleHeight = scrollTop + windowHeight - nextSectionTop;
            
            // 关键：只在可见高度在10%-90%之间时触发，避免边界问题
            if (visibleHeight > windowHeight * scrollThreshold && visibleHeight < windowHeight * 0.9) {
                scrollToSection(currentSectionIndex + 1);
                return;
            }
        }
        
        // 向上滚动检测
        if (currentSectionIndex > 0) {
            const currentSection = sections[currentSectionIndex];
            const currentSectionTop = currentSection.offsetTop;
            // 当前section顶部超出视口的距离
            const topGap = currentSectionTop - scrollTop;
            
            // 关键：只在顶部露出在10%-90%之间时触发
            if (topGap > windowHeight * scrollThreshold && topGap < windowHeight * 0.9) {
                scrollToSection(currentSectionIndex - 1);
                return;
            }
        }
    }

    // 滚动到指定section
    function scrollToSection(index) {
        // 参数校验
        if (index < 0 || index >= sections.length || isScrolling) return;
        
        isScrolling = true;
        currentSectionIndex = index;
        
        const section = sections[index];
        const targetPosition = section.offsetTop;
        
        // 平滑滚动
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
        
        // 使用定时器检测滚动完成（比requestAnimationFrame更稳定）
        let checkCount = 0;
        const checkInterval = setInterval(() => {
            checkCount++;
            const currentScroll = window.scrollY;
            
            // 到达目标位置（允许5px误差）或超时(1秒)
            if (Math.abs(currentScroll - targetPosition) < 5 || checkCount >= 20) {
                clearInterval(checkInterval);
                isScrolling = false;
            }
        }, 50); // 每50ms检查一次
    }

    // 初始化第一个section为可见
    if (sections[0]) {
        sections[0].classList.add('visible');
        sections[0].dataset.lazyLoaded = 'true';
    }

    // 监听滚动事件（使用防抖优化性能）
    const debouncedHandleScroll = debounce(handleScroll, 100);
    window.addEventListener('scroll', debouncedHandleScroll, { passive: true });
})();
