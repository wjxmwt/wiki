/* All article content is readable until this page-local enhancement succeeds. */
document.addEventListener('DOMContentLoaded', () => {
    const page = document.querySelector('.engineering-page');
    const deck = page?.querySelector('[data-engineering-deck]');
    if (!deck) return;

    const cards = Array.from(deck.querySelectorAll('[data-module]'));
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const states = cards.map(card => ({
        cycle: card.querySelector('[data-cycle]').dataset.cycle,
        stage: 0
    }));
    const stageNames = ['Design', 'Build', 'Test', 'Learn'];
    const stageNamesZh = ['设计', '构建', '测试', '学习'];
    let front = 0;
    let expanded = false;
    let switching = false;
    let frame = 0;
    let animations = [];

    function isChinese() {
        return (document.documentElement.dataset.lang || document.body.dataset.lang || 'en') === 'zh';
    }

    function syncCopy() {
        const zh = isChinese();
        page.querySelectorAll('[data-text-en][data-text-zh]').forEach(element => {
            element.textContent = zh ? element.dataset.textZh : element.dataset.textEn;
        });
        cards.forEach((card, index) => {
            const state = states[index];
            const stage = zh ? stageNamesZh[state.stage] : stageNames[state.stage];
            card.querySelector('.engineering-card-status').textContent = zh
                ? `模块 ${index + 1} / 第 ${state.cycle} 轮 / ${stage}`
                : `Module ${index + 1} / Cycle ${state.cycle} / ${stage}`;
            card.querySelector('.engineering-cycles').setAttribute('aria-label', zh
                ? `模块 ${index + 1} 的迭代轮次` : `Module ${index + 1} cycles`);
            card.querySelectorAll('[data-stage-direction]').forEach(button => {
                const previous = button.dataset.stageDirection === '-1';
                button.setAttribute('aria-label', zh
                    ? (previous ? '上一阶段' : '下一阶段')
                    : (previous ? 'Previous stage' : 'Next stage'));
            });
        });
    }

    function sizeDeck() {
        if (expanded) return;
        const card = cards[front];
        const height = card.offsetHeight;
        const width = card.offsetWidth;
        const mobile = window.innerWidth <= 600;
        // Bound both vertical and horizontal protrusion as the article grows.
        const exposure = mobile ? 10 : 24;
        const angle = Math.min(3, Math.atan(exposure / (Math.max(width, height) / 2)) * 180 / Math.PI);
        deck.style.setProperty('--front-height', `${height}px`);
        deck.style.setProperty('--card-angle', `${angle}deg`);
        deck.style.setProperty('--card-shift', mobile ? '3px' : '7px');
    }

    function scheduleSize() {
        if (frame) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
            frame = 0;
            sizeDeck();
            revealSelectedCycles();
        });
    }

    function revealSelectedCycles() {
        cards.forEach((card, index) => {
            if (!expanded && index !== front) return;
            const list = card.querySelector('.engineering-cycle-list');
            const selected = list.querySelector('[aria-current="true"]');
            if (!selected || list.scrollWidth <= list.clientWidth) return;
            list.scrollLeft += selected.getBoundingClientRect().left - list.getBoundingClientRect().left
                - (list.clientWidth - selected.offsetWidth) / 2;
        });
    }

    function render() {
        deck.classList.toggle('is-expanded', expanded);
        cards.forEach((card, index) => {
            const state = states[index];
            const behind = !expanded && index !== front;
            card.classList.toggle('is-front', index === front);
            card.classList.toggle('is-back', index !== front);
            card.inert = behind;
            if (behind) card.setAttribute('aria-hidden', 'true');
            else card.removeAttribute('aria-hidden');

            card.querySelectorAll('[data-cycle-link]').forEach(link => {
                const selected = link.dataset.cycleLink === state.cycle;
                if (selected) link.setAttribute('aria-current', 'true');
                else link.removeAttribute('aria-current');
            });
            card.querySelectorAll('[data-cycle]').forEach(cycle => {
                cycle.hidden = cycle.dataset.cycle !== state.cycle;
                cycle.querySelectorAll('[data-stage]').forEach(panel => {
                    panel.hidden = Number(panel.dataset.stage) !== state.stage;
                    panel.setAttribute('role', 'tabpanel');
                    panel.setAttribute('aria-labelledby', `cycle-${cycle.dataset.cycle}-tab-${panel.dataset.stage}`);
                    panel.tabIndex = 0;
                });
                cycle.querySelectorAll('[data-stage-index]').forEach(tab => {
                    const selected = Number(tab.dataset.stageIndex) === state.stage;
                    tab.setAttribute('aria-selected', String(selected));
                    tab.tabIndex = selected ? 0 : -1;
                });
                cycle.querySelector('[data-stage-direction="-1"]').disabled = state.stage === 0;
                cycle.querySelector('[data-stage-direction="1"]').disabled = state.stage === 3;
            });
            const toggle = card.querySelector('[data-toggle-layout]');
            toggle.setAttribute('aria-expanded', String(expanded));
            toggle.setAttribute('aria-controls', cards.map(item => item.id).join(' '));
            const text = toggle.querySelector('[data-layout-label]');
            text.dataset.textEn = expanded ? 'Stack cards' : 'Show both';
            text.dataset.textZh = expanded ? '恢复叠放' : '同时展示';
        });
        syncCopy();
        sizeDeck();
        revealSelectedCycles();
    }

    function bringIntoView(target, always = false) {
        const header = document.querySelector('.main-header');
        const offset = (header?.offsetHeight || 80) + 24;
        const bounds = target.getBoundingClientRect();
        if (always || bounds.top < offset || bounds.top > window.innerHeight - 120) {
            window.scrollTo({
                top: window.scrollY + bounds.top - offset,
                behavior: reducedMotion.matches ? 'instant' : 'smooth'
            });
        }
    }

    function setHash(id) {
        // Keep the URL shareable without adding a history entry for every tab.
        history.replaceState(null, '', `#${id}`);
    }

    function cancelAnimations() {
        animations.forEach(animation => animation.cancel());
        animations = [];
        switching = false;
    }

    async function switchModule(fromIndex) {
        if (switching) return;
        const next = (fromIndex + 1) % cards.length;
        if (expanded || reducedMotion.matches || !cards[front].animate) {
            front = next;
            render();
        } else {
            switching = true;
            const outgoing = cards[front];
            const incoming = cards[next];
            const backTransform = getComputedStyle(incoming).transform;
            const lift = outgoing.animate([
                { transform: 'translate(0, 0) rotate(0)' },
                { transform: 'translate(-14px, -8px) rotate(-0.7deg)' }
            ], { duration: 110, easing: 'ease-out', fill: 'forwards' });
            animations.push(lift);
            try {
                await lift.finished;
                front = next;
                render();
                lift.cancel();
                const enter = incoming.animate([
                    { transform: backTransform },
                    { transform: 'translate(0, 0) rotate(0)' }
                ], { duration: 190, easing: 'ease-out' });
                const leave = outgoing.animate([
                    { transform: 'translate(-14px, -8px) rotate(-0.7deg)' },
                    { transform: getComputedStyle(outgoing).transform }
                ], { duration: 190, easing: 'ease-out' });
                animations.push(enter, leave);
                await Promise.all([enter.finished, leave.finished]);
            } catch {
                // Page hiding or a hash navigation can cancel a running swap.
                return;
            } finally {
                cancelAnimations();
            }
        }
        setHash(cards[front].querySelector(`[data-cycle="${states[front].cycle}"] [data-stage="${states[front].stage}"] h4`).id);
        cards[front].querySelector('[data-next-module]').focus({ preventScroll: true });
        bringIntoView(cards[front], true);
    }

    deck.addEventListener('click', event => {
        const card = event.target.closest('[data-module]');
        if (!card || card.inert || switching) return;
        const index = Number(card.dataset.module);
        const state = states[index];
        const cycleLink = event.target.closest('[data-cycle-link]');
        const stageTab = event.target.closest('[data-stage-index]');
        const direction = event.target.closest('[data-stage-direction]');
        if (event.target.closest('[data-next-module]')) {
            switchModule(index);
            return;
        }
        if (event.target.closest('[data-toggle-layout]')) {
            expanded = !expanded;
            render();
            const focusCard = expanded ? card : cards[front];
            focusCard.querySelector('[data-toggle-layout]').focus({ preventScroll: true });
            if (!reducedMotion.matches && focusCard.animate) {
                const animation = focusCard.animate([
                    { transform: 'translateY(8px)' }, { transform: 'translateY(0)' }
                ], { duration: 220, easing: 'ease-out' });
                animations.push(animation);
                animation.finished.then(() => {
                    animations = animations.filter(item => item !== animation);
                }).catch(() => {});
            }
            bringIntoView(focusCard, true);
            return;
        }
        if (cycleLink) {
            event.preventDefault();
            front = index;
            state.cycle = cycleLink.dataset.cycleLink;
            state.stage = 0;
            render();
            setHash(cycleLink.hash.slice(1));
            const cycle = card.querySelector(`[data-cycle="${state.cycle}"]`);
            bringIntoView(cycle);
        } else if (stageTab || direction) {
            front = index;
            state.stage = stageTab ? Number(stageTab.dataset.stageIndex)
                : Math.max(0, Math.min(3, state.stage + Number(direction.dataset.stageDirection)));
            render();
            const cycle = card.querySelector(`[data-cycle="${state.cycle}"]`);
            setHash(cycle.querySelector(`[data-stage="${state.stage}"] h4`).id);
            bringIntoView(cycle);
        }
    });

    deck.addEventListener('keydown', event => {
        const tab = event.target.closest('[role="tab"]');
        if (!tab || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const tabs = Array.from(tab.parentElement.querySelectorAll('[role="tab"]'));
        const current = tabs.indexOf(tab);
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? 3
            : (current + (event.key === 'ArrowRight' ? 1 : 3)) % 4;
        tabs[next].click();
        tabs[next].focus({ preventScroll: true });
    });

    function revealHash() {
        let id;
        try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
        const target = document.getElementById(id);
        const card = target?.closest('[data-module]');
        if (!card) return;
        cancelAnimations();
        front = Number(card.dataset.module);
        const cycle = target.closest('[data-cycle]');
        const stage = target.closest('[data-stage]');
        if (cycle) {
            states[front].cycle = cycle.dataset.cycle;
            states[front].stage = stage ? Number(stage.dataset.stage) : 0;
        }
        render();
        bringIntoView(cycle || card, true);
    }

    const resizeObserver = typeof ResizeObserver === 'function'
        ? new ResizeObserver(scheduleSize) : null;
    const languageObserver = new MutationObserver(() => {
        syncCopy();
        scheduleSize();
    });
    function observe() {
        cards.forEach(card => resizeObserver?.observe(card));
        [document.documentElement, document.body].forEach(element => {
            languageObserver.observe(element, { attributes: true, attributeFilter: ['data-lang'] });
        });
    }
    window.addEventListener('resize', scheduleSize, { passive: true });
    window.addEventListener('hashchange', revealHash);
    window.addEventListener('pagehide', () => {
        cancelAnimations();
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        resizeObserver?.disconnect();
        languageObserver.disconnect();
    });
    window.addEventListener('pageshow', event => {
        if (event.persisted) {
            observe();
            render();
        }
    });
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) cancelAnimations();
    });

    render();
    deck.classList.add('is-ready');
    sizeDeck();
    observe();
    revealHash();
});
