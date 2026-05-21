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
    setupTimelineLine();
});

// dynamic timeline line segments generator
function setupTimelineLine() {
    const container = document.querySelector('.timeline-curved-line-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    const wrapper = document.querySelector('.timeline-wrapper');
    if (!wrapper) return;
    
    const totalHeight = wrapper.offsetHeight;
    const segmentHeight = 35; // px per segment
    const numSegments = Math.ceil(totalHeight / segmentHeight);
    
    for (let i = 0; i < numSegments; i++) {
        const seg = document.createElement('div');
        seg.className = 'timeline-curve-segment';
        seg.style.top = `${i * segmentHeight}px`;
        seg.style.height = `${segmentHeight + 2}px`; // slightly overlap
        container.appendChild(seg);
    }
}

// Three.js SCROLL-REACTIVE UNIVERSE
function initThreeJS() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas || typeof THREE === "undefined") return;

    setupTimelineLine();

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
            const scale = 1 - Math.abs(ratio) * 0.45;
            const opacity = 1 - Math.abs(ratio) * 0.75;
            const translateY = ratio * 150;
            const translateZ = -Math.abs(ratio) * 800;

            sec.style.transform = `perspective(1000px) translate3d(0, ${translateY}px, ${translateZ}px) scale(${Math.max(0.05, scale)})`;
            sec.style.opacity = Math.max(0, Math.min(1, opacity));

            const blur = Math.max(0, Math.abs(ratio) * 8 - 2);
            sec.style.filter = `blur(${blur}px)`;
        });

        // 3D Experience Timeline Curvature (World Effect)
        const timelineItems = document.querySelectorAll('.timeline-item');
        const screenCenter = window.innerHeight / 2;
        
        timelineItems.forEach((item, index) => {
            const rect = item.getBoundingClientRect();
            const itemCenter = rect.top + rect.height / 2;
            const deltaY = itemCenter - screenCenter;
            
            // Normalize distance based on half viewport height
            const maxDistance = window.innerHeight * 0.6;
            const ratio = Math.max(-1.5, Math.min(1.5, deltaY / maxDistance));
            
            // If the item is close to the center, mark it as active
            if (Math.abs(deltaY) < rect.height / 2 + 50) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
            
            // 3D Spherical/Fish-eye Curve Calculations (World Effect)
            const maxAngle = window.innerWidth < 768 ? 18 : 28; // degrees
            const maxZ = window.innerWidth < 768 ? -120 : -200; // px
            const maxXShift = window.innerWidth < 768 ? 30 : 0; // px (on mobile, curve towards center; on desktop, perfectly centered)
            
            const angleX = ratio * maxAngle;
            const radCurve = (ratio * Math.PI) / 2;
            
            // Calculate spherical coordinates
            const cosRad = Math.cos(radCurve);
            const sinRad = Math.sin(radCurve);
            
            const z = (cosRad - 1) * Math.abs(maxZ);
            const xShift = (1 - cosRad) * maxXShift;
            const yShift = sinRad * 35;
            
            // Rotation Y: wraps around the globe (opposite directions for left and right cards to face center)
            const isLeft = window.innerWidth < 768 ? false : (index % 2 === 0);
            const angleY = (1 - cosRad) * 12 * (isLeft ? 1 : -1);
            
            // Opacity & Scale
            const opacity = 1 - Math.max(0, Math.min(1, Math.abs(ratio) * 0.7));
            const scale = 1 - Math.max(0, Math.min(0.2, Math.abs(ratio) * 0.15));
            const blur = Math.max(0, Math.abs(ratio) * 4 - 0.5);
            
            // Apply 3D Transform to the entire timeline item
            item.style.transform = `perspective(1200px) translate3d(${xShift}px, ${yShift}px, ${z}px) rotateX(${-angleX}deg) rotateY(${angleY}deg) scale(${scale})`;
            item.style.opacity = opacity;
            item.style.filter = `blur(${blur}px)`;
        });

        // 3D Literal Timeline Line Curvature (Fish-eye segments)
        const segments = document.querySelectorAll('.timeline-curve-segment');
        segments.forEach((seg) => {
            const rect = seg.getBoundingClientRect();
            const segCenter = rect.top + rect.height / 2;
            const deltaY = segCenter - screenCenter;
            
            const maxDistance = window.innerHeight * 0.6;
            const ratio = Math.max(-1.5, Math.min(1.5, deltaY / maxDistance));
            
            const maxAngle = window.innerWidth < 768 ? 18 : 28;
            const maxZ = window.innerWidth < 768 ? -120 : -200;
            const maxXShift = window.innerWidth < 768 ? 30 : 0;
            
            const angleX = ratio * maxAngle;
            const radCurve = (ratio * Math.PI) / 2;
            
            const cosRad = Math.cos(radCurve);
            const sinRad = Math.sin(radCurve);
            
            const z = (cosRad - 1) * Math.abs(maxZ);
            const xShift = (1 - cosRad) * maxXShift;
            const yShift = sinRad * 35;
            
            // Apply 3D Transform to the segment
            seg.style.transform = `perspective(1200px) translate3d(${xShift}px, ${yShift}px, ${z}px) rotateX(${-angleX}deg)`;
            
            // Dynamic color/glow based on proximity to center
            const absDelta = Math.abs(deltaY);
            if (absDelta < 180) {
                const factor = 1 - (absDelta / 180);
                seg.style.backgroundColor = `var(--accent)`;
                seg.style.boxShadow = `0 0 ${8 * factor}px var(--accent-glow)`;
                seg.style.opacity = 0.2 + 0.6 * factor;
            } else {
                seg.style.backgroundColor = `rgba(255, 255, 255, 0.2)`;
                seg.style.boxShadow = `none`;
                seg.style.opacity = Math.max(0.05, 0.2 - (absDelta - 180) / 1000);
            }
        });

        renderer.render(scene, camera);
    }

    animate();

    // Handle Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        setupTimelineLine();
    });
}

// Initialize when valid
window.addEventListener("DOMContentLoaded", initThreeJS);