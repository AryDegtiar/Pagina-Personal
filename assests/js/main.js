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

    // Objects mapping: Replaced Wireframes with a dense, pristine Stardust galaxy
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 2000;
    const posArray = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i += 3) {
        // Broad distribution
        posArray[i] = (Math.random() - 0.5) * 100;
        posArray[i + 1] = (Math.random() - 0.5) * 100;
        posArray[i + 2] = (Math.random() - 0.5) * 100 - 10;

        // Randomly assign Blue or Orange accent to stars
        const isOrange = Math.random() > 0.5;
        colorArray[i] = isOrange ? 1.0 : 0.23; // R
        colorArray[i + 1] = isOrange ? 0.36 : 0.5; // G (0.36 for orange 0xff5e00)
        colorArray[i + 2] = isOrange ? 0.0 : 0.96; // B
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

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

        // Rotate particles globally very slowly
        particlesMesh.rotation.y = elapsedTime * 0.02;
        particlesMesh.rotation.x = elapsedTime * 0.005;

        // Reactive Camera based on Scroll
        camera.position.z = 30 - (currentScroll * 0.025);
        camera.position.y = -(currentScroll * 0.005);

        // SYNC HTML DOM CONTENT WITH THE 3D WORLD
        sections.forEach((sec) => {
            const rect = sec.getBoundingClientRect();
            const screenCenter = window.innerHeight / 2;
            let ratio = 0;

            // Logic Fix: If the screen center is ANYWHERE inside the section top/bottom boundaries, it remains fully visible
            if (rect.top <= screenCenter && rect.bottom >= screenCenter) {
                ratio = 0;
            } else if (rect.top > screenCenter) {
                // Divided by 2.5 to drastically stretch the scroll distance, making the transition super long
                ratio = (rect.top - screenCenter) / (window.innerHeight * 2.5);
            } else if (rect.bottom < screenCenter) {
                ratio = (rect.bottom - screenCenter) / (window.innerHeight * 2.5);
            }

            // Calculate pseudo-Z depth values based on updated bounded ratio
            const scale = 1 - Math.abs(ratio) * 0.55;
            const opacity = 1 - Math.abs(ratio) * 0.85;
            const translateY = ratio * 200;
            const translateZ = -Math.abs(ratio) * 1100;

            sec.style.transform = `perspective(1000px) translate3d(0, ${translateY}px, ${translateZ}px) scale(${Math.max(0.4, scale)})`;
            sec.style.opacity = Math.max(0, Math.min(1, opacity));

            const blur = Math.max(0, Math.abs(ratio) * 12 - 3);
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