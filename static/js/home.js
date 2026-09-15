import { CHAPTERS, CUTS, LAYOUT, clamp, lerp, ease, range, mix, exhaustAt, waterAt, waterRoute, projectWater, project, storyFrame } from './home-motion.js?v=5.0.0';
let controller = null;
let resumeProgress = null;
const progressKey = 'homepage-story-progress';
let initialProgress = null;
try {
    const navigation = performance.getEntriesByType('navigation')[0];
    const saved = sessionStorage.getItem(progressKey);
    if (saved !== null && ['reload', 'back_forward'].includes(navigation?.type) && Number.isFinite(Number(saved))) initialProgress = clamp(Number(saved));
} catch { /* Storage may be unavailable; ordinary navigation remains usable. */ }
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
function canAnimate() {
    return !reducedMotion.matches && !!window.gsap && !!window.ScrollTrigger && window.innerHeight >= (window.innerWidth < 768 ? 600 : 500);
}
function boot() {
    controller?.destroy();
    controller = null;
    const root = document.querySelector('[data-story-root]');
    if (root && canAnimate()) controller = createStory(root);
}
function createStory(root) {
    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);
    const find = name => root.querySelector('[data-story-' + name + ']');
    const stage = find('stage');
    const canvas = find('particles');
    const ctx = canvas?.getContext('2d');
    if (!stage || !ctx) return null;
    const environments = [...root.querySelectorAll('[data-environment]')];
    const arts = [...root.querySelectorAll('[data-scene-art]')];
    const copies = [...root.querySelectorAll('[data-story-chapter]')];
    const beats = copies.map(copy => [...copy.querySelectorAll('[data-story-beat]')]);
    const shared = Object.fromEntries(['bottle', 'drop', 'cell', 'salicylate', 'clod', 'grain', 'ripple'].map(name => [name, root.querySelector('[data-shared-' + name + ']')]));
    const hands = [...root.querySelectorAll('[data-shared-hand]')];
    const handOriginals = [...root.querySelectorAll('#v4-hand-back *, #v4-hand-front *')].map(el => [el, el.getAttribute('d')]);
    const handContours = [...root.querySelectorAll('[data-hand-outline]')].map(el => {
        const closed = el.getAttribute('d');
        const numbers = path => path.match(/-?\d+(?:\.\d+)?/g).map(Number);
        return { el, closed, from: numbers(closed), to: numbers(el.dataset.handOpen) };
    });
    const car = root.querySelector('[data-car-v2]');
    const wheels = [...root.querySelectorAll('[data-story-wheel]')];
    const pipette = root.querySelector('[data-pipette-v2]');
    const state = { p: 0 };
    let width = innerWidth, height = innerHeight, mobile = width < 768;
    let disposed = false, resizeTimer = null, tickerActive = false, lenis = null;
    let three = null, threeRequested = false, threeFailed = false;
    let lastChapter = -1, lastAriaProgress = -1;
    let pendingProgress = null;
    const cleanups = [];
    const on = (target, event, fn, options) => {
        target.addEventListener(event, fn, options);
        cleanups.push(() => target.removeEventListener(event, fn, options));
    };
    const alpha = (el, value) => { if (el) el.style.opacity = clamp(value).toFixed(4); };
    const route = waterRoute();
    const routePath = (offset, depth = 0, reverse = false) => {
        const points = route.map((p, i) => {
            const a = route[Math.max(0, i - 1)], b = route[Math.min(route.length - 1, i + 1)];
            const length = Math.hypot(b.x - a.x, b.y - a.y);
            return [p.x - (b.y - a.y) / length * offset, p.y + (b.x - a.x) / length * offset + depth];
        });
        return (reverse ? points.reverse() : points).map(p => p.join(' ')).join('L');
    };
    root.querySelectorAll('[data-channel-band]').forEach(el => {
        const [a, b, da, db] = el.dataset.channelBand.split(',').map(Number);
        el.setAttribute('d', 'M' + routePath(a, da) + 'L' + routePath(b, db, true) + 'Z');
    });
    const sharedWater = root.querySelector('[data-shared-water]');
    sharedWater?.querySelectorAll('path').forEach(el => el.setAttribute('d', 'M' + routePath(0)));
    const joints = root.querySelector('[data-channel-joints]');
    [.05, .26, .48, .69, .89].forEach(t => {
        const p = waterAt(t), b = waterAt(t + .002);
        const angle = Math.atan2(b.y - p.y, b.x - p.x) * 180 / Math.PI;
        const joint = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        joint.setAttribute('d', 'M0-39V-29L0-12M0 13L0 13V22M0 22V50');
        joint.setAttribute('transform', 'translate(' + p.x + ' ' + p.y + ') rotate(' + angle + ')');
        joints?.append(joint);
    });
    const show = (el, visible) => { if (el) el.style.visibility = visible ? 'visible' : 'hidden'; };
    function pose(el, point, opacity = 1, angle = 0) {
        if (!el) return;
        el.setAttribute('transform', 'translate(' + point.x + ' ' + point.y + ') scale(' + point.scale + ') rotate(' + angle + ')');
        alpha(el, opacity);
        show(el, opacity > .001);
    }
    root.classList.add('is-enhanced');
    function measure() {
        width = innerWidth; height = innerHeight; mobile = width < 768;
        root.style.setProperty('--story-height', height + 'px');
        const dpr = Math.min(devicePixelRatio || 1, mobile ? 1.5 : 2);
        canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        // SVG art, shared objects and Canvas now use exactly the same CSS-pixel projection.
        environments.forEach(env => env.firstElementChild.setAttribute('viewBox', '0 0 ' + width + ' ' + height));
        three?.resize(width, height, dpr);
    }
    const seed = n => { const value = Math.sin(n * 127.1 + 311.7) * 43758.5453; return value - Math.floor(value); };
    const sprites = Array.from({ length: 4 }, (_, k) => {
        const sprite = document.createElement('canvas');
        sprite.width = sprite.height = 160;
        const brush = sprite.getContext('2d');
        for (let j = 0; j < 13; j++) {
            const a = j * 2.399 + k, r = 11 + seed(j + k * 29) * 28;
            const x = 80 + Math.cos(a) * r, y = 80 + Math.sin(a) * r;
            const radius = 25 + seed(j * 9 + k) * 31;
            const g = brush.createRadialGradient(x, y, 0, x, y, radius);
            g.addColorStop(0, 'rgba(191,204,185,.22)');
            g.addColorStop(.42, 'rgba(144,165,147,.15)');
            g.addColorStop(1, 'rgba(94,122,109,0)');
            brush.fillStyle = g; brush.fillRect(0, 0, 160, 160);
        }
        return sprite;
    });
    function puff(x, y, radius, opacity, j = 0, angle = 0) {
        if (opacity < .001 || x + radius < 0 || x - radius > width || y + radius < 0 || y - radius > height) return;
        ctx.save(); ctx.globalAlpha = clamp(opacity);
        ctx.translate(x, y); ctx.rotate(angle);
        ctx.drawImage(sprites[j % 4], -radius, -radius * .83, radius * 2, radius * 1.66);
        ctx.restore();
    }
    function dot(x, y, radius, opacity) {
        if (opacity < .001) return;
        ctx.globalAlpha = clamp(opacity); ctx.fillStyle = '#d9b678';
        ctx.beginPath(); ctx.arc(x, y, Math.max(.8, radius), 0, Math.PI * 2); ctx.fill();
    }
    function plume(frame, scene, sx, sy, strength) {
        const n = mobile ? 30 : 48;
        for (let j = 0; j < n; j++) {
            const age = (j / n + frame.q * .28) % 1;
            const spread = age * age;
            const eddy = Math.sin(j * 2.399 + frame.q * 2.1);
            const x = sx + 190 * age + eddy * spread * 70;
            const y = sy - 340 * age + Math.cos(j * 1.71) * spread * 52;
            const point = project(frame, scene, x, y);
            const radius = (9 + age * 116) * point.scale;
            puff(point.x, point.y, radius, Math.sin(age * Math.PI) * strength, j, eddy * .4);
        }
    }
    function drawParticles(frame) {
        const { q, t, index } = frame;
        const at = (i, x, y, scale = 1) => project(frame, i, x, y, scale);
        ctx.clearRect(0, 0, width, height);
        if (q < 1) {
            for (let j = 0; j < 40; j++) {
                const birth = -.48 + j * .03;
                if (Math.abs(birth - .12) < .001 || birth > q) continue;
                const p = exhaustAt(q, birth);
                const point = at(0, p.x, p.y);
                puff(point.x, point.y, p.radius * point.scale,
                    ease(0, .025, p.age) * (1 - ease(.38, .85, p.age)) * (1 - ease(.40, .54, t)), j, p.age * (j % 2 ? 1 : -1));
            }
        }
        if (q > .75 && q < 2) {
            const intensity = ease(.48, .65, t) * (index === 0 ? 1 : 0) + (index === 1 ? 1 : 0);
            plume(frame, 1, 310, 270, intensity);
            plume(frame, 1, 680, 350, intensity * .75);
        }
        // This is the road's retained plume cluster, enlarged through the source-to-source match.
        if (q < 1.6) {
            const a = frame.smoke;
            const opacity = q < 1 ? ease(.12, .17, q) : 1 - ease(1.2, 1.6, q);
            for (let j = 0; j < 15; j++) {
                const angle = j * 2.399 + q * .2;
                const distance = Math.sqrt(j / 15) * .62;
                puff(a.x + Math.cos(angle) * a.scale * distance, a.y + Math.sin(angle) * a.scale * distance * .65,
                    a.scale * (.85 + seed(j) * .50), opacity * .72, j, angle * .13);
            }
            const internal = index === 0 ? range(t, .24, .36, .70, .84) : 0;
            for (let j = 0; j < 7; j++) {
                const x = a.x + (seed(j + 10) - .5) * width * .6;
                const y = a.y + (seed(j + 40) - .5) * height * .42;
                dot(x, y, 3 + seed(j) * 5, internal * .8);
                if (internal > 0) {
                    ctx.globalAlpha = internal * .26; ctx.strokeStyle = '#e1d29c'; ctx.lineWidth = 1.4;
                    ctx.beginPath();
                    for (let k = 0; k <= 6; k++) { const angle = k * Math.PI / 3; const px = x + Math.cos(angle) * 16, py = y + Math.sin(angle) * 16; if (k) ctx.lineTo(px, py); else ctx.moveTo(px, py); }
                    ctx.stroke();
                }
            }
        }
        // Front lip occludes the smoke at the chimney mouth, in the same camera coordinates.
        if (q > .91 && q < 2) {
            [[310, 270, 1.15], [680, 350, .78]].forEach(([x, y, s]) => {
                const a = at(1, x, y, s);
                ctx.globalAlpha = (index === 0 ? ease(.55, .9, t) : 1);
                ctx.strokeStyle = '#a8b6a0'; ctx.lineWidth = 4 * a.scale;
                ctx.beginPath(); ctx.ellipse(a.x, a.y, 38 * a.scale, 11 * a.scale, 0, 0, Math.PI); ctx.stroke();
            });
        }
        if (q >= 1.3 && q < 4.65) {
            for (let j = 0; j < 26; j++) {
                const a = at(1, 410 + seed(j) * 220, 260 + seed(j + 10) * 130);
                const ground = at(2, 1080 + seed(j + 30) * 160, 579 + seed(j + 20) * 180);
                let point = mix(a, ground, ease(1.5 + j * .006, 2.25 + j * .006, q));
                let opacity = range(q, 1.3, 1.55, 4.45, 4.65);
                if (q >= 2.56) {
                    if (j % 3 === 0) {
                        const flow = clamp((q - 2.56) / 1.25 - j * .004);
                        const stream = projectWater(frame, flow);
                        point = mix(ground, stream, ease(2.56, 3, q));
                        if (q > 3.55) point = mix(point, at(4, 1080 + (seed(j) - .5) * 110, 749 + seed(j + 5) * 25), ease(3.55, 4.1, q));
                    } else opacity *= 1 - ease(2.80, 3, q);
                }
                dot(point.x, point.y, point.scale * (2 + j % 3), opacity * .65);
            }
        }
        const rain = range(q, 2.34, 2.62, 3.70, 4.10);
        if (rain > 0) {
            ctx.globalAlpha = rain * .33; ctx.strokeStyle = '#d5e8d6'; ctx.lineWidth = .9; ctx.beginPath();
            for (let j = 0; j < (mobile ? 45 : 80); j++) {
                const x = seed(j + 100) * width, y = (seed(j + 240) * height + q * 1450) % (height + 70) - 35;
                ctx.moveTo(x, y); ctx.lineTo(x - 7, y + 25);
            }
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    }
    async function loadThree() {
        if (threeRequested || threeFailed || disposed) return;
        threeRequested = true;
        try {
            const { createCellRenderer } = await import('./home-three.js?v=5.0.0');
            if (disposed) return;
            three = createCellRenderer(find('three'), () => { threeFailed = true; three?.destroy(); three = null; });
            three.resize(width, height, Math.min(devicePixelRatio || 1, mobile ? 1.5 : 2));
            render();
        } catch { threeFailed = true; }
    }
    function render() {
        if (disposed) return;
        const frame = storyFrame(state.p, width, height);
        const { q, index: current, f, t, cameras, cover } = frame;
        const at = (i, x, y, scale = 1) => project(frame, i, x, y, scale);
        environments.forEach((el, i) => {
            const active = i === current || (i === current + 1 && t > 0);
            el.style.display = active ? 'block' : 'none';
            el.style.opacity = '1'; el.style.clipPath = 'none'; el.style.maskImage = 'none'; el.style.zIndex = i === current ? '0' : '1';
            if (!active) return;
            const m = cameras[i];
            arts[i].style.opacity = '1';
            el.querySelector('.scene-backdrop').style.opacity = '1';
            arts[i].setAttribute('transform', 'matrix(' + m.scale + ' 0 0 ' + m.scale + ' ' + m.x + ' ' + m.y + ')');
            el.querySelector('.scene-backdrop').setAttribute('transform', 'translate(' + ((width - 1600 * cover) / 2) + ' ' + ((height - 1000 * cover) / 2) + ') scale(' + cover + ')');
        });
        if (t > 0) {
            const next = environments[current + 1];
            if (current === 0) next.style.opacity = String(ease(.46, .54, t));
            else if (current === 1) {
                // The real soil silhouette rises over the receding yard; its sky never forms a panel edge.
                next.querySelector('.scene-backdrop').style.opacity = String(ease(.76, 1, t));
                arts[1].style.opacity = String(1 - ease(0, .32, t));
                arts[2].style.opacity = String(ease(.08, .35, t));
            } else if (current === 2) {
                const edge = lerp(118, -18, t);
                next.style.maskImage = 'linear-gradient(90deg, transparent ' + (edge - 16) + '%, black ' + (edge + 16) + '%)';
            } else if (current === 3) {
                const edge = lerp(115, -15, t);
                next.style.maskImage = 'linear-gradient(180deg, transparent ' + (edge - 12) + '%, black ' + (edge + 12) + '%)';
                next.querySelector('.scene-backdrop').style.opacity = String(ease(.60, 1, t));
            } else if (current === 4) {
                next.style.opacity = String(ease(.12, .84, t));
            } else if (current === 5) {
                const r = 15 * frame.drop.scale * ease(.02, .4, t);
                next.style.clipPath = 'circle(' + r + 'px at ' + frame.drop.x + 'px ' + frame.drop.y + 'px)';
            } else if (current === 6) {
                next.style.opacity = String(ease(.1, .85, t));
                arts[6].style.opacity = String(1 - ease(0, .33, t));
            }
            else if (current === 7) next.style.opacity = String(ease(0, .2, t));
        }
        car.setAttribute('transform', 'translate(' + frame.car.x + ' ' + frame.car.y + ') scale(1.8)');
        wheels.forEach(wheel => wheel.setAttribute('transform', 'rotate(' + ((frame.car.x - 990) / 45 * 180 / Math.PI) + ')'));
        alpha(root.querySelector('[data-soil-dots]'), ease(1.8, 2.5, q));
        pose(shared.clod, frame.clod, range(q, 1.72, 1.93, 3.28, 3.5));
        pose(root.querySelector('[data-shared-pah]'), { ...frame.smoke, scale: frame.smoke.scale / 230 }, current === 0 ? range(t, .22, .38, .68, .84) * .65 : 0);
        pose(shared.grain, frame.grain, range(q, 1.32, 1.55, 4.12, 4.26));
        const waterCamera = q < 3 ? at(2, 820, 45) : at(3, 0, 0);
        pose(sharedWater, waterCamera, range(q, 2.30, 2.53, 3.83, 4.02));
        const startX = lerp(250, -1600, ease(2.56, 3, q));
        const wetEnd = waterAt(lerp(.12, 1, ease(2.53, 3.30, q)));
        const wetRoute = [{ x: startX, y: 535 + (startX - 300) * 22 / 430 }, ...route.filter(p => p.x > startX && p.x < wetEnd.x), wetEnd];
        sharedWater?.querySelectorAll('path').forEach((el, i) => {
            el.setAttribute('stroke-width', lerp(i ? 1 : 4, i ? 2 : 17, ease(2.56, 3, q)));
            el.setAttribute('d', wetRoute.length ? 'M' + wetRoute.map(p => p.x + ' ' + p.y).join('L') : '');
        });
        const rainDrop = at(2, 1120, lerp(380, 540, ease(2.28, 2.46, q)), .32);
        pose(root.querySelector('[data-shared-raindrop]'), rainDrop, range(q, 2.27, 2.30, 2.45, 2.49));
        pose(shared.ripple, frame.ripple, range(q, 3.22, 3.48, 4.45, 4.62));
        if (shared.ripple) shared.ripple.style.strokeDashoffset = String(-q * 15);
        const waterline = root.querySelector('[data-waterline-front]');
        pose(waterline, at(4, 1080, 749), range(q, 4.05, 4.09, 4.24, 4.30));
        pose(shared.bottle, frame.bottle, frame.bottleAlpha, frame.bottleAngle);
        const liquidLevel = lerp(100, lerp(-85, -156, ease(4.24, 4.56, q)), ease(4.07, 4.23, q));
        root.querySelector('[data-bottle-water]')?.setAttribute('transform', 'rotate(' + (-frame.bottleAngle) + ') translate(0 ' + liquidLevel + ')');
        hands.forEach(hand => {
            const retreat = ease(5.12, 5.29, q);
            alpha(hand, 1 - ease(5.23, 5.32, q));
            hand.setAttribute('transform', 'translate(' + (retreat * 420) + ' ' + (-ease(5.035, 5.16, q) * 80 - retreat * 88) + ')');
        });
        // A continuous contour unfolds from the palm; joints are not separate capsules.
        const opening = ease(5.035, 5.18, q);
        handContours.forEach(({ el, closed, from, to }) => {
            let i = 0;
            el.setAttribute('d', closed.replace(/-?\d+(?:\.\d+)?/g, () => {
                const value = lerp(from[i], to[i], opening); i++;
                return value.toFixed(3) + ' ';
            }));
        });
        alpha(root.querySelector('[data-hand-wrap]'), (1 - opening) * .9);
        alpha(root.querySelector('[data-hand-outline="fingers"]'), opening);
        alpha(root.querySelector('[data-hand-soft-detail]'), 1 - opening);
        pipette.setAttribute('transform', 'translate(' + frame.pipette.x + ' ' + frame.pipette.y + ')');
        pose(shared.drop, frame.drop, range(q, 5.52, 5.57, 5.84, 5.99));
        const dropShape = shared.drop?.querySelector('path');
        const rounding = ease(5.63, 5.72, q);
        dropShape?.setAttribute('d', 'M0 ' + lerp(-24, -15, rounding) + 'C' + lerp(-4, -8.28, rounding) + ' ' + lerp(-10, -15, rounding) + ' -15 ' + lerp(-2, -8.28, rounding) + ' -15 ' + lerp(8, 0, rounding) + 'C-15 ' + lerp(28, 20, rounding) + ' 15 ' + lerp(28, 20, rounding) + ' 15 ' + lerp(8, 0, rounding) + 'C15 ' + lerp(-2, -8.28, rounding) + ' ' + lerp(4, 8.28, rounding) + ' ' + lerp(-10, -15, rounding) + ' 0 ' + lerp(-24, -15, rounding) + 'Z');
        alpha(dropShape, 1 - ease(5.67, 5.82, q));
        pose(shared.cell, frame.cell, frame.cellAlpha);
        pose(shared.salicylate, frame.molecule, range(q, 6.25, 6.48, 7.23, 7.35));
        alpha(root.querySelector('[data-naphthalene-v2]'), 1 - ease(6.24, 6.58, q) * .7);
        alpha(root.querySelector('[data-pathway-steps]'), ease(6.12, 6.44, q));
        alpha(root.querySelector('[data-cell-transcript]'), range(q, 7.21, 7.35, 7.53, 7.65));
        alpha(root.querySelector('[data-cell-proteins]'), ease(7.38, 7.62, q));
        alpha(root.querySelector('[data-cell-promoter]'), .3 + ease(7.23, 7.37, q) * .7);
        alpha(root.querySelector('[data-bench-contact]'), range(q, 4.98, 5.01, 5.70, 5.86) * .28);
        alpha(find('note'), range(q, 3.95, 4.15, 8.1, 8.4) * (t > 0 ? 1 - Math.sin(Math.PI * t) * .8 : 1));
        const screen = root.querySelector('[data-cell-screen]');
        const clip = root.querySelector('[data-monitor-clip]');
        let canvasClip = 'none';
        if (q >= 7.61 && screen && clip) {
            const corner = at(8, 1065, 544), end = at(8, 1315, 690);
            clip.setAttribute('x', corner.x); clip.setAttribute('y', corner.y);
            clip.setAttribute('width', end.x - corner.x); clip.setAttribute('height', end.y - corner.y);
            screen.setAttribute('clip-path', 'url(#v3-screen-clip)');
            canvasClip = 'inset(' + Math.max(0, corner.y) + 'px ' + Math.max(0, width - end.x) + 'px ' + Math.max(0, height - end.y) + 'px ' + Math.max(0, corner.x) + 'px)';
        } else screen?.removeAttribute('clip-path');
        find('three').style.clipPath = canvasClip;
        const left = lerp(LAYOUT[current] === 'left' ? 1 : 0, LAYOUT[Math.min(8, current + 1)] === 'left' ? 1 : 0, t);
        const textStrength = t > 0 ? 1 - Math.sin(Math.PI * t) * .85 : 1;
        root.style.setProperty('--shade-left', left * textStrength);
        root.style.setProperty('--shade-right', (1 - left) * textStrength);
        root.style.setProperty('--shade-reading', textStrength);
        if (document.body.dataset.theme === 'light') {
            const micro = i => i === 6 || i === 7 ? 1 : 0;
            const amount = lerp(micro(current), micro(Math.min(8, current + 1)), t);
            const color = (a, b) => a.map((value, i) => Math.round(lerp(value, b[i], amount))).join(', ');
            root.style.setProperty('--story-shade', color([231, 238, 221], [6, 35, 29]));
            root.style.setProperty('--story-paper', 'rgb(' + color([23, 62, 48], [237, 240, 220]) + ')');
            root.style.setProperty('--story-muted', 'rgb(' + color([59, 93, 75], [192, 212, 189]) + ')');
        } else ['--story-shade', '--story-paper', '--story-muted'].forEach(name => root.style.removeProperty(name));
        const chapter = t > .62 ? Math.min(8, current + 1) : current;
        copies.forEach((copy, i) => {
            let opacity = 0, dx = 0, dy = 0, reading = 0;
            if (i === current) {
                opacity = current === 8 ? 1 : 1 - ease(0, .36, t);
                const movement = ease(0, .56, t);
                const direction = [0, -1, 0, 0, 0, 1, 0, 1, 0][i];
                dx = direction ? 0 : movement * (LAYOUT[i] === 'left' ? -width * .10 : width * .10);
                dy = direction ? movement * height * .18 * direction : -movement * height * .025;
                reading = clamp(f / CUTS[i]);
            } else if (i === current + 1 && t > .73) {
                opacity = ease(.73, 1, t);
                dy = (1 - ease(.73, 1, t)) * height * .1;
            }
            alpha(copy, opacity); show(copy, opacity > .001);
            copy.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
            const beatIndex = Math.min(2, Math.floor(reading * 3));
            beats[i].forEach((beat, j) => {
                let a = j === beatIndex ? 1 : 0;
                const within = reading * 3 - beatIndex;
                if (j === beatIndex && beatIndex > 0) a = ease(.075, .15, within);
                if (j === beatIndex - 1) a = 1 - ease(0, .06, within);
                alpha(beat, a); show(beat, a > .001);
                beat.style.transform = 'translateY(' + ((1 - a) * (j === beatIndex ? 13 : -13)) + 'px)';
                beat.setAttribute('aria-hidden', String(j !== beatIndex || opacity < .01));
            });
        });
        if (chapter !== lastChapter) {
            copies.forEach((copy, i) => { copy.classList.toggle('is-current', i === chapter); copy.inert = i !== chapter; copy.setAttribute('aria-hidden', String(i !== chapter)); });
            root.dataset.chapter = CHAPTERS[chapter][0]; root.dataset.layout = LAYOUT[chapter]; lastChapter = chapter;
        }
        find('progress').style.setProperty('--story-progress', state.p);
        const ariaProgress = Math.round(state.p * 100);
        if (ariaProgress !== lastAriaProgress) { find('progress').setAttribute('aria-valuenow', ariaProgress); lastAriaProgress = ariaProgress; }
        drawParticles(frame);
        if (q > 6.4) loadThree();
        three?.render({ ...frame.cell, scale: frame.cell.scale / .12 }, q / 9, frame.cellAlpha, document.body.dataset.theme);
    }
    measure();
    const timeline = gsap.timeline({ paused: true, onUpdate: render });
    timeline.to(state, { p: 1, duration: 100, ease: 'none' });
    CHAPTERS.forEach(([name, start]) => timeline.addLabel(name, start * 100));
    const trigger = ScrollTrigger.create({ id: 'homepage-story', trigger: root, start: 0,
        end: () => height * (mobile ? 16 : 20), pin: stage, pinSpacing: true,
        animation: timeline, scrub: true, invalidateOnRefresh: true });
    function stopTicker() {
        if (!tickerActive) return;
        gsap.ticker.remove(tick);
        tickerActive = false;
    }
    function tick(time) {
        lenis?.raf(time * 1000);
        if (!lenis?.isScrolling) stopTicker();
    }
    function wakeTicker() {
        if (disposed || document.hidden || !lenis || tickerActive) return;
        tickerActive = true;
        gsap.ticker.add(tick);
    }
    function setupLenis() {
        lenis?.destroy();
        lenis = null;
        stopTicker();
        if (mobile || !window.Lenis) return;
        lenis = new window.Lenis({ autoRaf: false, lerp: 0.1, smoothWheel: true, anchors: false });
        lenis.on('scroll', ScrollTrigger.update);
    }
    setupLenis();
    on(window, 'wheel', wakeTicker, { passive: true });
    on(window, 'keydown', wakeTicker);
    on(window, 'touchmove', wakeTicker, { passive: true });
    on(window, 'scroll', wakeTicker, { passive: true });
    on(document, 'visibilitychange', () => {
        if (document.hidden) stopTicker();
        else { render(); wakeTicker(); }
    });
    const aliases = { Project: 'beginning', Description: 'beginning', road: 'beginning', Engineering: 'pathway',
        'Wet Lab': 'signal', Design: 'signal', Result: 'return', 'Dry Lab': 'return', Team: 'return' };
    function chapterName(hash) {
        let name;
        try { name = decodeURIComponent(hash.replace(/^#/, '')); } catch { return null; }
        if (name.startsWith('story-')) name = name.slice(6);
        name = aliases[name] || name;
        return CHAPTERS.some(([key]) => key === name) ? name : null;
    }
    function seek(name, immediate = false) {
        const cue = CHAPTERS.find(([key]) => key === name);
        if (!cue) return;
        const p = name === 'return' ? 0.985 : cue[1] + (cue[1] ? 0.026 : 0);
        const target = trigger.start + (trigger.end - trigger.start) * p;
        if (lenis) {
            lenis.scrollTo(target, { immediate, duration: 1.15 });
            wakeTicker();
        } else {
            window.scrollTo({ top: target, behavior: immediate ? 'instant' : 'smooth' });
        }
    }
    on(document, 'click', event => {
        const link = event.target.closest('a[href^="#"]');
        if (!link || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        // Leave mobile navigation accordion buttons to the existing menu handler.
        if (mobile && link.matches('.has-dropdown > .nav-link')) return;
        const name = link.dataset.storyJump || chapterName(link.hash);
        if (!name) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        document.querySelectorAll('.dropdown-menu.active').forEach(menu => menu.classList.remove('active'));
        const menu = document.querySelector('#navMenu');
        if (menu?.classList.contains('active')) document.querySelector('#menuToggle')?.click();
        history.replaceState(null, '', '#story-' + name);
        seek(name);
    }, true);
    on(window, 'hashchange', () => {
        const name = chapterName(location.hash);
        if (name) seek(name);
    });
    on(window, 'resize', () => {
        clearTimeout(resizeTimer);
        if (mobile && width === window.innerWidth && Math.abs(height - window.innerHeight) < 160) return;
        resizeTimer = setTimeout(() => {
            const p = state.p;
            const previousMobile = mobile;
            measure();
            if (previousMobile !== mobile) setupLenis();
            ScrollTrigger.refresh();
            lenis?.resize();
            const position = trigger.start + (trigger.end - trigger.start) * p;
            if (lenis) lenis.scrollTo(position, { immediate: true });
            else window.scrollTo(0, position);
            render();
        }, 160);
    });
    const preferences = new MutationObserver(() => render());
    preferences.observe(document.body, { attributes: true, attributeFilter: ['data-theme', 'data-lang'] });
    const loader = document.querySelector('#loader');
    let loaderObserver = null;
    const finishSetup = async () => {
        // A direct story anchor must be resolved after fonts and the browser's initial layout.
        await document.fonts?.ready;
        await new Promise(resolve => requestAnimationFrame(resolve));
        if (disposed) return;
        const previousProgress = state.p;
        ScrollTrigger.refresh();
        // Refresh changes the pinned document height; update Lenis before restoring a position.
        lenis?.resize();
        const name = chapterName(location.hash);
        const navigation = performance.getEntriesByType('navigation')[0];
        const restoreProgress = pendingProgress ?? initialProgress;
        if (restoreProgress !== null) {
            const position = trigger.start + (trigger.end - trigger.start) * restoreProgress;
            pendingProgress = null;
            initialProgress = null;
            if (lenis) lenis.scrollTo(position, { immediate: true });
            else window.scrollTo(0, position);
            ScrollTrigger.update();
        } else if (name && navigation?.type !== 'reload' && navigation?.type !== 'back_forward') seek(name, true);
        else if (previousProgress > 0) {
            const position = trigger.start + (trigger.end - trigger.start) * previousProgress;
            if (lenis) lenis.scrollTo(position, { immediate: true });
            else window.scrollTo(0, position);
            ScrollTrigger.update();
        }
        render();
    };
    if (loader && !loader.hidden && !loader.classList.contains('hidden')) {
        loaderObserver = new MutationObserver(() => {
            if (loader.hidden || loader.classList.contains('hidden')) {
                loaderObserver.disconnect();
                finishSetup();
            }
        });
        loaderObserver.observe(loader, { attributes: true, attributeFilter: ['hidden', 'class'] });
    } else finishSetup();
    render();
    return {
        getProgress: () => state.p,
        restore(p) {
            pendingProgress = clamp(p);
            lenis?.resize();
            const position = trigger.start + (trigger.end - trigger.start) * clamp(p);
            if (lenis) lenis.scrollTo(position, { immediate: true });
            else window.scrollTo(0, position);
            ScrollTrigger.update();
        },
        destroy() {
            if (disposed) return;
            disposed = true;
            clearTimeout(resizeTimer);
            stopTicker();
            lenis?.destroy();
            three?.destroy();
            preferences.disconnect();
            loaderObserver?.disconnect();
            cleanups.forEach(cleanup => cleanup());
            trigger.kill(true);
            timeline.kill();
            root.classList.remove('is-enhanced');
            environments.forEach(el => el.removeAttribute('style'));
            arts.forEach(el => el.removeAttribute('transform'));
            root.removeAttribute('data-chapter');
            root.removeAttribute('data-layout');
            ['--shade-left', '--shade-right', '--shade-reading', '--story-shade', '--story-paper', '--story-muted'].forEach(name => root.style.removeProperty(name));
            root.querySelector('[data-bottle-water]').removeAttribute('transform');
            Object.values(shared).filter(Boolean).forEach(el => { el.removeAttribute('transform'); el.removeAttribute('style'); });
            hands.forEach(el => { el.removeAttribute('transform'); el.removeAttribute('style'); });
            handOriginals.forEach(([el, d]) => { el.removeAttribute('transform'); el.removeAttribute('style'); if (d !== null) el.setAttribute('d', d); });
            sharedWater?.removeAttribute('transform'); sharedWater?.removeAttribute('style');
            joints?.replaceChildren();
            beats.flat().forEach(el => { el.removeAttribute('style'); el.removeAttribute('aria-hidden'); });
            environments.forEach(el => { el.firstElementChild.setAttribute('viewBox', '0 0 1600 1000'); el.querySelector('.scene-backdrop').removeAttribute('transform'); el.querySelector('.scene-backdrop').removeAttribute('style'); });
            arts.forEach(el => el.removeAttribute('style'));
            root.querySelectorAll('[data-shared-raindrop], [data-shared-pah], [data-waterline-front]').forEach(el => { el.removeAttribute('transform'); el.removeAttribute('style'); });
            root.querySelectorAll('[data-cell-transcript], [data-cell-proteins], [data-cell-promoter], [data-naphthalene-v2], [data-pathway-steps]').forEach(el => el.removeAttribute('style'));
            root.querySelector('[data-cell-screen]')?.removeAttribute('clip-path');
            find('three').style.clipPath = 'none';
            copies.forEach(copy => {
                copy.removeAttribute('style');
                copy.removeAttribute('aria-hidden');
                copy.inert = false;
            });
            ctx?.clearRect(0, 0, width, height);
        }
    };
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();
reducedMotion.addEventListener('change', boot);
window.addEventListener('resize', () => {
    if (Boolean(controller) !== canAnimate()) boot();
});
window.addEventListener('pagehide', () => {
    resumeProgress = controller?.getProgress() ?? null;
    if (resumeProgress !== null) {
        try { sessionStorage.setItem(progressKey, String(resumeProgress)); } catch { /* Optional restoration must not block cleanup. */ }
    }
    controller?.destroy();
    controller = null;
});
window.addEventListener('pageshow', event => {
    if (event.persisted) {
        document.body.classList.remove('page-fade-out');
        boot();
        if (resumeProgress !== null) controller?.restore(resumeProgress);
    }
});
