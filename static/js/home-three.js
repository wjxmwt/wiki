import * as THREE from '../vendor/three/three.module.min.js';

// An optional, translucent membrane. SVG owns the scientific diagram and fallback.
export function createCellRenderer(canvas, onLost) {
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setClearColor(0x000000, 0);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(0, 1, 1, 0, 0.1, 2000);
    camera.position.z = 800;
    const geometry = new THREE.CapsuleGeometry(140, 350, 8, 18);
    geometry.rotateZ(Math.PI / 2);
    const material = new THREE.MeshPhongMaterial({
        color: 0x91c9a5, transparent: true, opacity: 0.16,
        shininess: 70, specular: 0xd9edb9, depthWrite: false
    });
    const cell = new THREE.Mesh(geometry, material);
    scene.add(cell);
    scene.add(new THREE.AmbientLight(0xc2e0c4, 2));
    const light = new THREE.DirectionalLight(0xffefd0, 3);
    light.position.set(-200, 500, 500);
    scene.add(light);
    let height = 1;
    let disposed = false;
    const lost = event => { event.preventDefault(); onLost(); };
    canvas.addEventListener('webglcontextlost', lost);
    return {
        resize(width, nextHeight, dpr) {
            height = nextHeight;
            renderer.setPixelRatio(dpr);
            renderer.setSize(width, height, false);
            camera.right = width;
            camera.top = height;
            camera.updateProjectionMatrix();
        },
        render(point, progress, alpha, theme) {
            if (disposed) return;
            cell.visible = alpha > 0.01;
            cell.position.set(point.x, height - point.y, 0);
            cell.scale.setScalar(point.scale * 0.12);
            cell.rotation.x = 0.15 + progress * 0.4;
            material.opacity = alpha * (theme === 'light' ? 0.14 : 0.2);
            material.emissive.setHex(progress > 0.84 ? 0x193f15 : 0x000000);
            renderer.render(scene, camera);
        },
        destroy() {
            if (disposed) return;
            disposed = true;
            canvas.removeEventListener('webglcontextlost', lost);
            geometry.dispose();
            material.dispose();
            renderer.clear();
            renderer.dispose();
        }
    };
}
