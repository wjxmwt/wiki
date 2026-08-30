(function () {
    gsap.registerPlugin(ScrollTrigger, SplitText);
    const membersPage = document.querySelector('.members_page');
    if (!membersPage) return;

    const sections = Array.from(membersPage.querySelectorAll('section'));
    if (!sections.length) return;

    let carouselInitialized = false;
    let currentSectionIndex = 0;
    let isScrolling = false;
    const scrollThreshold = 0.1;

    // 初始化老师展示界面
    let ringOffset = 0; // 移到外层，不要写函数内部，resize需要访问
    let hexItems;
    let receipt, title, name, description;
    let personData;

    // 根据css变量动态生成圆环坐标
    function generatePosList() {
        const root = getComputedStyle(document.documentElement);
        const R = parseFloat(root.getPropertyValue('--circle-radius'));
        // 6个点角度，0°、60°、120°、180°、240°、300°
        const w = window.innerWidth;
        const anglesDeg = [30, 90, 150, 210, 270, 330];
        return anglesDeg.map(deg => {
            const rad = deg * Math.PI / 180;
            return {
                x: R * Math.sin(rad),
                y: -R * Math.cos(rad)
            }
        })
    }

    // 将当前ringOffset应用到所有hex
    function applyRingPositions() {
        const posList = generatePosList();
        hexItems.forEach((hex) => {
            const originalIdx = Number(hex.dataset.personIndex);
            const posIndex = (originalIdx + ringOffset) % 6;
            const pos = posList[posIndex];
            gsap.to(hex, {
                x: pos.x,
                y: pos.y,
                duration: 0.4,
                ease: "power2.out"
            })
        })
    }

    // 更新整个圆环位置的公共函数（点击调用）
    function updateRing(targetClickOriginalIndex) {
        ringOffset = (1 - targetClickOriginalIndex + 6) % 6;
        applyRingPositions();
        hexItems.forEach((hex) => {
            const shapeDom = hex.querySelector(".hex-shape");
            const curRot = gsap.getProperty(shapeDom, "rotate");
            gsap.to(shapeDom, {
                rotate: curRot + 360,
                duration: 0.8,
                ease: "power2.out"
            })
        });
    }

    function initTeacherWindow() {
        hexItems = gsap.utils.toArray(".hex-circle-wrap .hex");
        receipt = document.querySelector('.receipt');
        title = document.querySelector('.receipt .title');
        name = document.querySelector('.receipt .name');
        description = document.querySelector('.receipt .description');
        personData = [
            {
                title: 'Alumnus',
                name: 'Jiaqi Wang',
                desc: 'He has rich experience in synthetic biology competitions and research. He supports our project on experimental design and iGEM preparation based on his previous competition experience.'
            },
            {
                title: 'Associate professor',
                name: 'Nisha He',
                desc: 'Her research focuses on molecular enzymology, biosensing and enzyme engineering. She guides the design and experimental scheme of the whole‑cell biosensor in our project.'
            },
            {
                title: 'Professor',
                name: 'Haimou Zhang',
                desc: 'He has long supervised the HUBU‑China iGEM team and guided our pollutant detection project.'
            },
            {
                title: 'Professor',
                name: 'Zhifan Yang',
                desc: 'He has long served as the supervisor of the HUBU‑China iGEM team and supported innovative synthetic biology projects.'
            },
            {
                title: 'Foreign expert',
                name: 'Jonathan Nimal',
                desc: 'He supports our team on English materials, international presentation and iGEM defense.'
            },
            {
                title: 'Associate professor',
                name: 'Pan Wu',
                desc: 'Her guides the construction of PAH‑degrading strains and whole‑cell biosensors in our project.'
            }
        ];

        const posList = generatePosList();
        // 初始状态：全部叠在中心点
        gsap.set(hexItems, {
            x: 0,
            y: 0,
            opacity: 0,
            scale: 0.7
        });
        gsap.set(hexItems.map(h => h.querySelector(".hex-shape")), {
            rotate: 0
        });

        // 入场散开动画
        hexItems.forEach((hex, idx) => {
            const shapeDom = hex.querySelector(".hex-shape");
            const targetPos = posList[idx];
            gsap.to(hex, {
                x: targetPos.x,
                y: targetPos.y,
                opacity: 1,
                scale: 1,
                duration: 0.8,
                ease: "back.out(1.2)",
                stagger: {
                    each: 0.12,
                    from: "center"
                }
            });
            gsap.to(shapeDom, {
                rotate: 360,
                duration: 0.8,
                ease: "power2.out"
            })
        })

        ringOffset = 0;
        let activeIndex = 1; // 默认选中第二个
        title.textContent = personData[activeIndex].title;
        name.textContent = personData[activeIndex].name;
        description.textContent = personData[activeIndex].desc;
        hexItems[activeIndex].classList.add('active');

        hexItems.forEach(hex => {
            hex.onclick = () => {
                const idx = Number(hex.dataset.personIndex);
                if (activeIndex === idx) return;
                updateRing(idx);
                hexItems[activeIndex].classList.remove('active');
                hexItems[idx].classList.add('active');
                activeIndex = idx;
                title.textContent = personData[idx].title;
                name.textContent = personData[idx].name;
                description.textContent = personData[idx].desc;
                gsap.fromTo(receipt, { opacity: 0, x: 20 },
                    { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" })
            }
        })
    }
    // 初始化成员旋转图
    function initMembersCarousel() {
        if (carouselInitialized) return;
        carouselInitialized = true;

        const groupSlides = document.querySelector('.group_slides');
        if (!groupSlides) return;

        let activeIndex = 2;

        function getCardMetrics() {
            const cards = document.querySelectorAll('.carousel_card');
            const firstCard = cards[0];
            const gap = parseFloat(getComputedStyle(groupSlides).gap) || 8;
            const cardWidth = firstCard ? firstCard.offsetWidth : 350;
            return { gap, cardWidth };
        }

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
                const isOpenBefore = closeActiveCardBook(previousIndex);
                if (isOpenBefore) {
                    setTimeout(() => {
                        activeIndex = index;
                        updateCarousel();
                    }, 800);
                } else {
                    activeIndex = index;
                    updateCarousel();
                }
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
            const cards = document.querySelectorAll('.carousel_card');
            const closedBookCases = document.querySelectorAll('.closed_book_case');
            const titles = document.querySelectorAll('.carousel_title');

            if (window.innerWidth <= 640) {
                groupSlides.style.transform = 'none';
                groupSlides.style.width = 'max-content';
                groupSlides.style.justifyContent = 'flex-start';
                groupSlides.style.flexDirection = 'row';

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
                return;
            }

            const { gap, cardWidth } = getCardMetrics();
            const wrapperWidth = groupSlides.parentElement ? groupSlides.parentElement.clientWidth : window.innerWidth;
            const offset = (wrapperWidth - cardWidth) / 2 - activeIndex * (cardWidth + gap);

            groupSlides.style.transform = `translateX(${offset}px)`;

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
            let isOpen = items[0].classList.contains('is_open');
            Array.from(items).slice(0, -1).forEach((item) => item.classList.remove('is_open'));
            updateContainerState(index);
            return isOpen;
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

        window.addEventListener('resize', updateCarousel);

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
        if (section.id === 'teacherDisplay') {
            initTeacherWindow();
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
        threshold: 0.4,
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

    // 窗口resize防抖处理，屏幕大小改变重新排布圆环
    const debounceResize = debounce(() => {
        if (!hexItems || hexItems.length === 0) return;
        applyRingPositions();
    }, 120);
    window.addEventListener('resize', debounceResize);

    // 监听滚动事件（使用防抖优化性能）
    const debouncedHandleScroll = debounce(handleScroll, 100);
    window.addEventListener('scroll', debouncedHandleScroll, { passive: true });
})();
