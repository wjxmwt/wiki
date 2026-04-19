function inView(element, callback, options = {}) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                callback(entry);
                if (options.once !== false) {
                    observer.unobserve(entry.target);
                }
            }
        });
    }, {
        threshold: options.amount || 0.1,
        rootMargin: options.rootMargin || '0px'
    });
    observer.observe(element);
    return () => observer.unobserve(element);
}


function animateElement(element, props, options = {}) {
    if (typeof anime === 'undefined') return;
    const animeProps = {};
    if (props.opacity) animeProps.opacity = props.opacity;
    if (props.x !== undefined) animeProps.translateX = props.x;
    if (props.y !== undefined) animeProps.translateY = props.y;
    if (props.scale) animeProps.scale = props.scale;
    return anime({
        targets: element,
        ...animeProps,
        duration: (options.duration || 0.8) * 1000,
        delay: (options.delay || 0) * 1000,
        easing: options.easing || 'easeOutExpo'
    });
}

window.addEventListener('load',()=> {
    setTimeout(() => {
        initLoaderAnimation();
    },100);
});

function initLoaderAnimation() {
    const loader = document.getElementById('loader');
    const loaderPercent = document.getElementById('loaderPercent');
    if (!loader || !loaderPercent) return;

    // 从子页面返回时跳过加载动画
    if (sessionStorage.getItem('skipLoader') === 'true') {
        sessionStorage.removeItem('skipLoader');
        loader.classList.add('hidden');
        return;
    }

    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(progressInterval);
            setTimeout(() => {
                if (typeof anime !== 'undefined') {
                    anime({
                        targets: loader,
                        opacity: [1,0],
                        duration: 500,
                        easing: 'easeInOutQuad',
                        complete: () => {
                            loader.classList.add('hidden');
                        }
                    });
                } else {
                    loader.classList.add('hidden');
                }
            },300);
        }
        if (loaderPercent) {
            loaderPercent.textContent = Math.floor(progress) + '%';
        }
    },100);
}