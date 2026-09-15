// Every camera and carrier is a pure function of the one scroll playhead.
const LENGTHS = [13, 11, 11, 11, 11, 13, 12, 13, 9];
const NAMES = ['beginning', 'air', 'soil', 'rain', 'sample', 'lab', 'pathway', 'signal', 'return'];
export const CUTS = [.55, .59, .56, .55, .67, .60, .61, .61, 1];
const TOTAL = LENGTHS.reduce((sum, value) => sum + value, 0);
export const CHAPTERS = NAMES.map((name, i) => [name, LENGTHS.slice(0, i).reduce((sum, value) => sum + value, 0) / TOTAL]);
export const LAYOUT = ['left', 'right', 'left', 'right', 'left', 'left', 'left', 'right', 'left'];
const FOCUS = [[980, 675, .62], [650, 560, .50], [1080, 665, .68], [700, 650, .60], [1080, 685, .77], [1080, 655, .61], [1070, 630, .66], [540, 650, .66], [1150, 655, .50]];
export const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const ease = (a, b, p) => { const t = clamp((p - a) / (b - a)); return t * t * (3 - 2 * t); };
export const range = (p, a, b, c, d) => ease(a, b, p) * (1 - ease(c, d, p));
export const mix = (a, b, t) => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), scale: lerp(a.scale, b.scale, t) });
export const carAt = q => ({ x: lerp(990, 1400, ease(0, .75, q)), y: lerp(727, 748, ease(0, .75, q)) });
// Emission positions are historical: advancing the car never drags old exhaust along.
export function exhaustAt(q, birth) {
    const age = Math.max(0, q - birth), car = carAt(birth);
    const velocity = (carAt(birth + .001).x - car.x) / .001;
    return { x: car.x - 236 + velocity * .075 * (1 - Math.exp(-age / .075)) - 165 * age,
        y: car.y + 10 - 160 * age + Math.sin(age * 9) * age * 18,
        radius: 10 + 170 * Math.min(age, .56), age };
}
// One centreline defines both scenes' water, the concrete edges and moving grains.
export function waterAt(t) {
    const u = clamp(t), v = 1 - u;
    return { x: v * v * v * 300 + 3 * v * v * u * 730 + 3 * v * u * u * 720 + u * u * u * 945,
        y: v * v * v * 535 + 3 * v * v * u * 557 + 3 * v * u * u * 785 + u * u * u * 848 };
}
export function waterRoute() {
    return [{ x: -1600, y: 438 }, { x: -600, y: 489 }, ...Array.from({ length: 81 }, (_, i) => waterAt(i / 80))];
}
export function projectWater(frame, t) {
    const p = waterAt(t);
    return frame.q < 3 ? project(frame, 2, p.x + 820, p.y + 45) : project(frame, 3, p.x, p.y);
}
export const project = (frame, i, x, y, scale = 1) => ({ x: frame.cameras[i].x + x * frame.cameras[i].scale, y: frame.cameras[i].y + y * frame.cameras[i].scale, scale: scale * frame.cameras[i].scale });

export function storyFrame(progress, width, height) {
    let index = 8;
    for (let i = 0; i < 8; i++) if (progress < CHAPTERS[i + 1][1]) { index = i; break; }
    const f = clamp((progress - CHAPTERS[index][1]) / (LENGTHS[index] / TOTAL));
    const q = index + f;
    const t = index < 8 ? ease(CUTS[index], 1, f) : 0;
    const mobile = width < 768;
    const cover = Math.max(width / 1600, height / 1000);
    const ox = (width - 1600 * cover) / 2, oy = (height - 1000 * cover) / 2;
    const bases = FOCUS.map(([x, y, zoom], i) => mobile
        ? { x: width / 2 - x * cover * zoom, y: height * (i === 8 ? .79 : .73) - y * cover * zoom, scale: cover * zoom }
        : { x: ox, y: oy, scale: cover });
    const cameras = bases.map(point => ({ ...point }));
    const frame = { q, index, f, t, mobile, cameras, cover, width, height };
    const at = (i, x, y, scale = 1) => project(frame, i, x, y, scale);
    const focus = (i, x, y, zoom, sx = width * .5, sy = height * .57) => {
        const scale = bases[i].scale * zoom;
        return { x: sx - x * scale, y: sy - y * scale, scale };
    };
    const c = carAt(q);
    const smokeSource = exhaustAt(q, .12);
    const smokeRadius = smokeSource.radius;
    if (t > 0) {
        switch (index) {
            case 0:
                cameras[0] = mix(bases[0], focus(0, smokeSource.x, smokeSource.y, 11), ease(0, .47, t));
                cameras[1] = mix(focus(1, 470, 145, 11 * smokeRadius / 105 * bases[0].scale / bases[1].scale), bases[1], ease(.53, 1, t));
                break;
            case 1:
                cameras[1] = mix(bases[1], focus(1, 450, 1150, 1.7, width * .53, -height * .12), t);
                cameras[2] = mix(focus(2, 1120, 580, 1.7, width * .53, height * .82), bases[2], t);
                break;
            case 2: {
                const incoming = focus(3, 300, 535, bases[2].scale / bases[3].scale, at(2, 1120, 580).x, at(2, 1120, 580).y);
                cameras[3] = mix(incoming, bases[3], t);
                const exit = { scale: bases[3].scale, x: bases[3].x + (300 - 1120) * bases[3].scale, y: bases[3].y + (535 - 580) * bases[3].scale };
                cameras[2] = mix(bases[2], exit, t);
                break;
            }
            case 3:
                cameras[3] = mix(bases[3], focus(3, 1000, 837, 1.7, width * .60, height * .68), t);
                cameras[4] = mix(focus(4, 1080, 749, 1.6, width * .60, height * .68), bases[4], t);
                break;
            case 4:
                cameras[4] = mix(bases[4], focus(4, 1080, 735, 1.12, at(4, 1080, 735).x - width * .1, at(4, 1080, 735).y), t);
                cameras[5] = mix({ ...bases[5], x: bases[5].x + width * .12 }, bases[5], t);
                break;
            case 5:
                cameras[5] = mix(bases[5], focus(5, 1120, 791, 16, width * .60, height * .59), ease(.03, .65, t));
                cameras[6] = mix(focus(6, 1020, 625, .46, width * .60, height * .59), bases[6], ease(.4, 1, t));
                break;
            case 6:
                cameras[6] = mix(bases[6], focus(6, 1245, 625, 2, width * .62, height * .60), t);
                cameras[7] = mix(focus(7, 720, 624, 1.7, width * .62, height * .60), bases[7], t);
                break;
            case 7: {
                const oldCell = at(7, 540, 650, 1.08);
                cameras[8] = mix(focus(8, 1190, 617, oldCell.scale / (.28 * bases[8].scale), oldCell.x, oldCell.y), bases[8], t);
                break;
            }
        }
    }
    // Carriers may outlive their environment. Retain that environment's exit camera.
    if (q >= 2) cameras[1] = focus(1, 450, 1150, 1.7, width * .53, -height * .12);
    if (q >= 4) cameras[3] = focus(3, 1000, 837, 1.7, width * .60, height * .68);
    if (q >= 7) cameras[6] = focus(6, 1245, 625, 2, width * .62, height * .60);
    frame.car = c;
    frame.smoke = q < 1 ? at(0, smokeSource.x, smokeSource.y, smokeRadius) : at(1, 470, 145, 105);
    if (index === 0 && t > .5) frame.smoke = at(1, 470, 145, 105);
    frame.grain = q < 2
        ? mix(at(1, 450, 290), at(2, 1120, 544), ease(1.53, 1.97, q))
        : q < 3 ? at(2, 1120, 544) : at(3, 300, 499);
    if (q < 2) frame.grain.scale *= 1 + Math.sin(ease(1.53, 1.97, q) * Math.PI) * 2;
    frame.clod = q < 3 ? at(2, 1120, 544) : at(3, 300, 499);
    if (q > 2.4) {
        const flow = ease(2.4, 3.65, q);
        const stream = projectWater(frame, flow);
        frame.grain = mix(frame.clod, stream, ease(2.56, 3, q));
        if (q > 3.55) frame.grain = mix(frame.grain, at(4, 1080, 756), ease(3.55, 4.12, q));
    }
    frame.ripple = mix(at(3, 945, 848), at(4, 1080, 749), ease(3.55, 4, q));
    // The bottle bottom is the contact anchor; the hand shares its transform.
    const bottleAngle = -76 * (1 - ease(4.24, 4.56, q));
    let bottle = at(4, 1080 - 269 * Math.sin(bottleAngle * Math.PI / 180) + 710 * (1 - ease(3.88, 4.06, q)), lerp(838, 735, ease(4.24, 4.56, q)));
    if (q >= 4.67 && q < 6) bottle = mix(at(4, 1080, 735), at(5, 935, 792), ease(4.67, 5, q));
    if (q >= 6) bottle = at(5, 935, 792);
    frame.bottle = bottle;
    frame.bottleAngle = bottleAngle;
    frame.bottleAlpha = range(q, 3.89, 4.05, 5.68, 5.82);
    if (q >= 7.61) { frame.bottle = at(8, 1460, 788, .7); frame.bottleAlpha = ease(7.64, 7.86, q); frame.bottleAngle = 0; }
    frame.pipette = { x: lerp(935, 1120, ease(5.25, 5.43, q)), y: 490 - 155 * ease(5.09, 5.25, q) + 177 * ease(5.43, 5.53, q) };
    frame.drop = at(5, 1120, lerp(672, 791, ease(5.53, 5.64, q)), 1 + ease(5.64, 5.93, q) * 13);
    frame.cell = q <= 7.61 ? at(7, 540, 650, 1.08) : at(8, 1190, 617, .28);
    frame.cellAlpha = ease(6.64, 6.97, q);
    frame.molecule = mix(at(6, 1245, 625, .85), { x: frame.cell.x + 180 * frame.cell.scale, y: frame.cell.y - 26 * frame.cell.scale, scale: frame.cell.scale * .18 }, ease(6.61, 7.23, q));
    return frame;
}
