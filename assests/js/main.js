window.addEventListener('scroll', function () {
    let animationMachine = document.getElementsByClassName('machine');
    if (animationMachine.length > 0) {
        let animationMachinePosition = animationMachine[0].getBoundingClientRect().top;
        let screenPosition = window.innerHeight / 0.9;

        if (animationMachinePosition < screenPosition) {
            for (let i = 0; i < animationMachine.length; i++) {
                var animacion = 'type' + i
                animationMachine[i].classList.add(animacion);
            }
        } else {
            for (let i = 0; i < animationMachine.length; i++) {
                var animacion = 'type' + i
                animationMachine[i].classList.remove(animacion);
            }
        }
    }
});

// loading
window.addEventListener("load", function () {
    const loading = document.getElementById("loading");
    if (loading) loading.style.display = "none";
});

// Three.js SCROLL-REACTIVE UNIVERSE
function initThreeJS() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas || typeof THREE === "undefined") return;

    // Scene setup
    const scene = new THREE.Scene();

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Objects mapping
    const geometry = new THREE.IcosahedronGeometry(1.5, 0); // Apple-like mathematical geometry
    const material = new THREE.MeshBasicMaterial({
        color: 0xff5e00, // orange accent
        wireframe: true,
        transparent: true,
        opacity: 0.15
    });

    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 700;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 80;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.05,
        color: 0x3b82f6, // blue accent
        transparent: true,
        opacity: 0.6
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Add main flying floating shapes
    const shapes = [];
    for (let i = 0; i < 15; i++) {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = (Math.random() - 0.5) * 40;
        mesh.position.y = (Math.random() - 0.5) * 40;
        mesh.position.z = (Math.random() - 0.5) * 40 - 15;

        const scale = Math.random() * 2 + 1;
        mesh.scale.set(scale, scale, scale);

        scene.add(mesh);
        shapes.push(mesh);
    }

    // Scroll Logic Interaction
    let currentScroll = 0;
    const sections = document.querySelectorAll('section');

    window.addEventListener('scroll', () => {
        currentScroll = window.scrollY;
    });

    // Animation Loop
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // Slowly rotate shapes
        shapes.forEach((shape, index) => {
            shape.rotation.x += 0.001 * (index % 2 === 0 ? 1 : -1);
            shape.rotation.y += 0.0015;
        });

        // Rotate particles globally very slowly
        particlesMesh.rotation.y = elapsedTime * 0.02;

        // Reactive Camera based on Scroll (The "Zoom into world" effect)
        camera.position.z = 30 - (currentScroll * 0.025);
        camera.position.y = -(currentScroll * 0.005);

        // SYNC HTML DOM CONTENT WITH THE 3D WORLD
        // Make sections float towards the camera (scale up/down, fade in/out) organically like the particles
        sections.forEach((sec) => {
            const rect = sec.getBoundingClientRect();
            // Distance from center of the screen
            const centerOffset = (rect.top + rect.height / 2) - (window.innerHeight / 2);
            const ratio = centerOffset / window.innerHeight; // Negative if above center, Positive if below

            // Calculate depth pseudo-3D values
            // When ratio is 0 (dead center), scale is 1, opacity is 1
            const scale = 1 - Math.abs(ratio) * 0.4;
            const opacity = 1 - Math.abs(ratio) * 1.5;
            const translateY = ratio * 150; // Move it slightly opposite to scroll to float
            const translateZ = -Math.abs(ratio) * 500; // Pushes it "back" visually into the mesh

            // Apply calculated pseudo-Z depth physics directly to the DOM in real-time
            sec.style.transform = `perspective(1000px) translate3d(0, ${translateY}px, ${translateZ}px) scale(${Math.max(0.6, scale)})`;
            sec.style.opacity = Math.max(0, Math.min(1, opacity));
            // Add subtle blur to stuff far away
            const blur = Math.max(0, Math.abs(ratio) * 10 - 2);
            sec.style.filter = `blur(${blur}px)`;
        });

        renderer.render(scene, camera);
    }

    animate();

    // Handle Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Initialize when valid
window.addEventListener("DOMContentLoaded", initThreeJS);