(function () {
    if (!window.gsap || !window.ScrollTrigger || !window.SplitText) {
        return;
    }
    // 注册
    gsap.registerPlugin(ScrollTrigger, SplitText);
    // section ONE
    const loaderScreen = document.querySelector(".loader-screen");
    let split;
    function runHeroAnim() {
        const chip = document.querySelector(".chip-wrap .chip");
        const lineTop = document.querySelector(".chip-wrap .line-top");
        const lineBottom = document.querySelector(".chip-wrap .line-bottom");
        const lineLeft = document.querySelector(".chip-wrap .line-left");
        const lineRight = document.querySelector(".chip-wrap .line-right");
        if (!chip) return;

        const heroTl = gsap.timeline();

        // 1. 中心芯片脉冲式入场
        heroTl.fromTo(chip,
            { scale: 0.85, opacity: 0, filter: "drop-shadow(0 0 0px rgba(110, 168, 254, 0))" },
            {
                scale: 1,
                autoAlpha: 1,
                filter: "drop-shadow(0 0 22px rgba(110, 168, 254, 0.55))",
                duration: 0.7,
                ease: "power2.out"
            }
        )
            // 芯片接通电光脉冲
            .to(chip, {
                filter: "drop-shadow(0 0 30px rgba(143, 196, 255, 0.7))",
                duration: 0.2,
                ease: "power1.out"
            }, "-=0.15")
            .to(chip, {
                filter: "drop-shadow(0 0 18px rgba(110, 168, 254, 0.45))",
                duration: 0.4,
                ease: "power2.out"
            }, "-=0.05");

        // 2. 四条线路同时延伸（正确写法：to + className 追加类）
        heroTl.to(lineTop, {
            className: "piece line-top grow",
            duration: 0,
        }, 0.6);
        heroTl.to(lineBottom, {
            className: "piece line-bottom grow",
            duration: 0,
        }, 0.6);
        heroTl.to(lineLeft, {
            className: "piece line-left grow",
            duration: 0,
        }, 0.6);
        heroTl.to(lineRight, {
            className: "piece line-right grow",
            duration: 0,
        }, 0.6);
        // 3. 等待线路生长完成（CSS 过渡 2s，这里留足时间）后，整体慢慢模糊
        heroTl.to(".chip-wrap .piece", {
            filter: "blur(6px)",
            opacity: 0.6,
            duration: 1.2,
            ease: "power2.out"
        }, 2.4); // 0.6s 开始生长 + 2s 生长时长 ≈ 2.6s 长齐，提前一点开始模糊更自然

        // 4. 模糊开始后，触发标题掉落入场
        const titleEl = document.querySelector(".hero-title");
        const hrTop = document.querySelector(".hr-top");
        const hrBottom = document.querySelector(".hr-bottom");
        const heroText = document.querySelector(".hero-text");
        if (!titleEl) return;
        // 以单词为单位分割标题
        split = SplitText.create(titleEl, {
            type: 'words'
        });
        // 入场动画
        heroTl.from(split.words, {
            y: -100,
            opacity: 0,
            rotation: gsap.utils.random(-80, 90),
            duration: 1,
            ease: 'back.out(1.2)',
            stagger: 0.15,
            // 动画开始前，把容器打开
            onStart: () => {
                gsap.set(titleEl, {
                    visibility: 'visible',
                    opacity: 1
                })
            }
        }, 2.6);

        // 2. 两条横线分别从左右两端向中间延伸
        heroTl
            .to([hrTop, hrBottom], {
                width: '100%',
                autoAlpha: 1,
                duration: 0.8,
                ease: 'power2.out',
                stagger: 0.1, // 上下两条错开 0.1 秒，更有层次感
            }, 3.6) // 标题快结束时就开始出线，衔接更紧

        // 3. 中间副标题淡入上浮
        heroTl.to(heroText, {
            opacity: 1,
            visibility: 'visible',
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
        }, 4.0); // 横线快画完时文字开始出来
        return heroTl;
    }

    if (loaderScreen) {
        // 监听加载完成事件
        loaderScreen.addEventListener('transitionend', function handler(e) {
            if (e.propertyName === 'opacity' || e.propertyName === 'visibility') {
                runHeroAnim();
                loaderScreen.removeEventListener('transitionend', handler);
            }
        });
        // 设置定时器
        const timer = setInterval(() => {
            if (loaderScreen.classList.contains('hidden')) {
                const op = parseFloat(getComputedStyle(loaderScreen).opacity);
                if (op <= 0.01) {
                    clearInterval(timer);
                    runHeroAnim();
                }
            }
        }, 150);
    }
    // section TWO
    const pahsImage = document.querySelector("#sources .pahs-image img");
    const askH2 = document.querySelector("#sources .ask h2");
    const sourcesContent = document.querySelector("#sources .sources-content p");
    const chimney = document.querySelector("#sources .chimney");
    const smoke1 = document.querySelector("#sources .smoke1");
    const smoke2 = document.querySelector("#sources .smoke2");
    const smoke3 = document.querySelector("#sources .smoke3");
    const chimneyText = document.querySelector("#sources .chimney-text");
    // 水体场景元素
    const rainLayer = document.querySelector("#sources .rain-layer");
    const riverLayer = document.querySelector("#sources .river-layer");
    const fishLayer = document.querySelector("#sources .fish-layer");
    const waterText = document.querySelector("#sources .water-text");

    // ========== 新增：初始化雨滴动画 ==========
    let rippleTimer = null;
    function initRainEffect() {
        if (!rainLayer) return;

        // 创建内部三层结构
        const rainBg = document.createElement('div');
        rainBg.className = 'rain-bg';
        const rainFg = document.createElement('div');
        rainFg.className = 'rain-fg';
        const rippleBox = document.createElement('div');
        rippleBox.className = 'ripple-container';
        rainLayer.append(rainBg, rainFg, rippleBox);

        // 生成背景雨滴（细、淡、慢）
        const BG_COUNT = 60;
        for (let i = 0; i < BG_COUNT; i++) {
            const drop = document.createElement('div');
            drop.className = 'drop';
            drop.style.left = Math.random() * 100 + '%';
            rainBg.appendChild(drop);
        }
        // 生成前景雨滴（粗、亮、快）
        const FG_COUNT = 80;
        for (let i = 0; i < FG_COUNT; i++) {
            const drop = document.createElement('div');
            drop.className = 'drop';
            drop.style.left = Math.random() * 100 + '%';
            rainFg.appendChild(drop);
        }

        // 背景雨下落循环
        gsap.to('.rain-bg .drop', {
            y: '110vh',
            duration: 1.8,
            ease: 'none',
            repeat: -1,
            stagger: {
                each: 0.03,
                repeat: -1,
                from: 'random'
            }
        });
        // 前景雨下落循环
        gsap.to('.rain-fg .drop', {
            y: '110vh',
            duration: 0.9,
            ease: 'none',
            repeat: -1,
            stagger: {
                each: 0.02,
                repeat: -1,
                from: 'random'
            }
        });

        // 雨滴落地涟漪
        function createRipple() {
            const ripple = document.createElement('div');
            ripple.className = 'ripple';
            ripple.style.left = Math.random() * 100 + '%';
            rippleBox.appendChild(ripple);
            gsap.fromTo(ripple,
                { scale: 0.3, opacity: 0.8 },
                {
                    scale: 2.5,
                    opacity: 0,
                    duration: 0.6,
                    ease: 'power1.out',
                    onComplete: () => ripple.remove()
                }
            );
        }
        // 启动涟漪生成
        rippleTimer = setInterval(createRipple, 80);
    }
    // 页面初始化就生成雨滴，初始透明隐藏
    initRainEffect();

    // 时间轴
    const tl = gsap.timeline();
    // 【第一部分：旧内容入场】
    tl.to(pahsImage, {
        autoAlpha: 1,
        x: 90,
        duration: 0.48,
        ease: 'power1.out',
    }, 0.56);
    tl.to(askH2, {
        x: 300,
        y: -250,
        duration: 0.24,
        fontSize: '3rem',
        ease: 'power1.out',
    }, 0.4);
    tl.to(sourcesContent, {
        autoAlpha: 1,
        x: -100,
        duration: 0.32,
        ease: 'power1.out',
    }, 0.88);

    // 【第二部分：旧内容消失，烟囱出场】
    tl.to(askH2, {
        autoAlpha: 0,
        x: 350,
        duration: 0.52,
        ease: 'power1.out',
    }, 1.52);
    tl.to(sourcesContent, {
        autoAlpha: 0,
        x: 50,
        duration: 0.52,
        ease: 'power1.out',
    }, 1.52);
    tl.to(pahsImage, {
        autoAlpha: 0,
        x: -120,
        duration: 0.52,
        ease: 'power1.out',
    }, 1.52);

    tl.to(chimney, {
        autoAlpha: 1,
        scale: 0.4,
        y: 90,
        skewX: 15,
        skewY: -3,
        duration: 0.32
    }, 1.88)
        .to(chimney, {
            scale: 0.8,
            y: 0,
            skewX: 0,
            skewY: 0,
            duration: 0.32
        }, 2.16);

    tl.to(smoke1, {
        autoAlpha: 1,
        x: -30,
        y: -80,
        duration: 0.4,
        ease: 'power1.out',
    }, 2.4);
    tl.to(smoke2, {
        autoAlpha: 1,
        x: -100,
        y: -130,
        duration: 0.4,
        ease: 'power1.out',
    }, 2.68);
    tl.to(smoke3, {
        autoAlpha: 1,
        scale: 2,
        x: -300,
        y: -200,
        duration: 0.4,
        ease: 'power1.out',
    }, 3.0);

    tl.to(chimneyText, {
        autoAlpha: 1,
        x: -50,
        y: -50,
        duration: 0.2,
        ease: 'power1.out',
    }, 3.48);
    tl.to(chimneyText, {
        autoAlpha: 0,
        x: -80,
        y: -80,
        duration: 0.24,
        ease: 'power1.out',
    }, 3.88);

    tl.to(smoke3, {
        autoAlpha: 0,
        scale: 1.5,
        x: -300,
        y: -300,
        duration: 0.4,
        ease: 'power1.out',
    }, 4.32);
    tl.to(smoke2, {
        autoAlpha: 0,
        x: -100,
        y: -200,
        duration: 0.4,
        ease: 'power1.out',
    }, 4.52);
    tl.to(smoke1, {
        autoAlpha: 0,
        x: -30,
        y: -150,
        duration: 0.4,
        ease: 'power1.out',
    }, 4.72);

    tl.to(chimney, {
        scaleY: 0.5,
        scaleX: 1.05,
        duration: 0.4
    }, 4.88)
        .to(chimney, {
            scaleY: 0,
            scaleX: 1.1,
            autoAlpha: 0,
            blur: 8,
            duration: 0.24
        }, 5.0);

    // 【第三部分：水体污染叙事】
    tl.to(rainLayer, {
        autoAlpha: 0.8,
        duration: 0.32,
        ease: 'power1.out',
    }, 5.16);

    tl.to(riverLayer, {
        autoAlpha: 0.7,
        duration: 0.24,
        ease: 'power1.out',
    }, 5.4);
    tl.to(riverLayer, {
        maskPosition: '0 100%',
        yPercent: 5,
        duration: 1.0,
        ease: 'power1.out',
    }, 5.4);

    // 鱼在河流之后出现（修正原时序错误）
    tl.to(fishLayer, {
        autoAlpha: 1,
        yPercent: 50,
        duration: 0.6,
        ease: 'power1.inOut',
    }, 5.8);

    tl.to([rainLayer, riverLayer, fishLayer], {
        filter: 'blur(4px)',
        duration: 0.24,
        ease: 'power1.out',
    }, 6.2);

    tl.to(waterText, {
        autoAlpha: 1,
        y: 0,
        duration: 0.24,
        ease: 'power1.out',
    }, 6.32);

    ScrollTrigger.create({
        trigger: '#sources',
        start: 'top top',
        end: '+=12000',
        pin: true,
        pinSpacing: true,
        markers: false,
        animation: tl,
        scrub: true,
        anticipatePin: 0.2,
        invalidateOnRefresh: true,
        onRefresh() {
            gsap.set(askH2, { xPercent: -50, yPercent: -50 });
            gsap.set(pahsImage, { xPercent: -120, yPercent: -50 });
            gsap.set(sourcesContent, { xPercent: 10, yPercent: -10 });
            gsap.set(chimney, { xPercent: -10, yPercent: -10, scale: 0.3 });
            gsap.set(smoke1, { xPercent: -10, yPercent: -10 });
            gsap.set(smoke2, { xPercent: -20, yPercent: -20 });
            gsap.set(smoke3, { xPercent: -30, yPercent: -30, scale: 1 });
            gsap.set(chimneyText, { xPercent: -78, yPercent: -170 });
            // 水体元素初始状态重置
            gsap.set(rainLayer, { autoAlpha: 0 });
            gsap.set(riverLayer, {
                autoAlpha: 0,
                maskPosition: '0 0',
                yPercent: -5
            });
            gsap.set(fishLayer, { autoAlpha: 0, xPercent: -20 });
            gsap.set(waterText, { autoAlpha: 0, y: 20 });
        }
    });
})();
