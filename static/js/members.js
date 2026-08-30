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
    function initTeacherWindow() {
        const hexItems = gsap.utils.toArray(".hex-circle-wrap .hex");
        const receipt = document.querySelector('.receipt');
        const title = document.querySelector('.receipt .title');
        const name = document.querySelector('.receipt .name');
        const description = document.querySelector('.receipt .description');

        const personData = [
            {
                title: 'Alumnus',
                name: 'Jiaqi Wang',
                desc: 'He has rich experience in synthetic biology competitions and research. He supports our project on experimental design and iGEM preparation based on his previous competition experience.'
            },
            {
                title: 'Associate professor',
                name: 'Nisha He',
                desc: 'Her research focuses on molecular enzymology, biosensing and enzyme engineering. She guides the design and experimental scheme of the whole-cell biosensor in our project.'
            },
            {
                title: 'Professor',
                name: 'Haimou Zhang',
                desc: 'He has long supervised the HUBU-China iGEM team and guided our pollutant detection project.'
            },
            {
                title: 'Professor',
                name: 'Zhifan Yang',
                desc: 'He has long served as the supervisor of the HUBU-China iGEM team and supported innovative synthetic biology projects.'
            },
            {
                title: 'Foreign expert',
                name: 'Jonathan Nimal',
                desc: 'He supports our team on English materials, international presentation and iGEM defense.'
            },
            {
                title: 'Associate professor',
                name: 'Pan Wu',
                desc: 'Her guides the construction of PAH-degrading strains and whole-cell biosensors in our project.'
            }
        ]
        // ===== 每个六边形【最终停留的坐标】=====
        // 半径180px，6个点标准正六边形圆环坐标
        const posList = [
            { x: 0, y: -315 },   // 0号 上
            { x: 140, y: -145 },    // 1号 右上
            { x: 0, y: 80 }, // 2号 右下
            { x: -230, y: 80 },   // 3号 下
            { x: -335, y: -115 },    // 4号 左下
            { x: -230, y: -315 }     // 5号 左上
        ];

        // 初始状态：全部叠在中心点，内部图片旋转0度
        gsap.set(hexItems, {
            x: 0,
            y: 0,
            opacity: 0,
            scale: 0.7
        });
        gsap.set(hexItems.map(h => h.querySelector(".hex-shape")), {
            rotate: 0
        });
        // 更新整个圆环位置的公共函数
        function updateRing(targetClickOriginalIndex) {
            // 目标：把点击的这个originalIndex，移动到 posList[0]（最上方点位）
            // 计算需要偏移多少
            ringOffset = (1 - targetClickOriginalIndex + 6) % 6;

            hexItems.forEach((hex) => {
                // 每个六边形固定不变的原始下标 data-person-index
                const originalIdx = Number(hex.dataset.personIndex);
                const shapeDom = hex.querySelector(".hex-shape");
                // 计算这个hex现在应该落到圆环的第几个点位
                const posIndex = (originalIdx + ringOffset) % 6;
                const pos = posList[posIndex];

                gsap.to(hex, {
                    x: pos.x,
                    y: pos.y,
                    duration: 0.6,
                    ease: "power2.out"
                });
                // ✅获取当前已经旋转的角度，再叠加360，每次点击多转一圈
                const curRot = gsap.getProperty(shapeDom, "rotate");
                // 内部的hex‑shape单独转一整圈360°
                gsap.to(shapeDom, {
                    rotate: curRot + 360,
                    duration: 0.8,
                    ease: "power2.out"
                })
            });
        }
        // 每个hex依次执行动画：从圆心，旋转一圈，飞到对应posList位置
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

            // 内部的hex‑shape单独转一整圈360°
            gsap.to(shapeDom, {
                rotate: 360,
                duration: 0.8,
                ease: "power2.out"
            })
        })
        let activeIndex = 1; // 默认第一个老师
        title.textContent = personData[activeIndex].title;
        name.textContent = personData[activeIndex].name;
        description.textContent = personData[activeIndex].desc;
        hexItems[activeIndex].classList.add('active');

        hexItems.forEach(hex => {
            hex.onclick = () => {
                const idx = Number(hex.dataset.personIndex);
                if (activeIndex == idx) return;
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

        let cardWidth = 400;
        let activeIndex = 2;
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
            groupSlides.style.transform = `translateX(calc(59vw - ${activeIndex * cardWidth + cardWidth / 2}px))`;
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

    // 监听滚动事件（使用防抖优化性能）
    const debouncedHandleScroll = debounce(handleScroll, 100);
    window.addEventListener('scroll', debouncedHandleScroll, { passive: true });
})();
