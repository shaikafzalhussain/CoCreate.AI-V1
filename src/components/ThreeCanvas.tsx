import { useEffect, useRef } from "react";

const ThreeCanvas = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    let renderer: any = null;
    let scene: any = null;
    let camera: any = null;
    let frameId: number | null = null;

    async function init() {
      // dynamic import so the app doesn't crash if three isn't installed yet
      const THREE = await import('three');

      // Set up renderer
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(window.devicePixelRatio || 1);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.domElement.style.position = 'absolute';
      renderer.domElement.style.inset = '0';
      renderer.domElement.style.zIndex = '0';
      renderer.domElement.style.pointerEvents = 'none';

      // Scene and camera
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 50;

      // Particle field
      const particles = 1200;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particles * 3);
      const sizes = new Float32Array(particles);

      for (let i = 0; i < particles; i++) {
        const i3 = i * 3;
        positions[i3 + 0] = (Math.random() - 0.5) * 120;
        positions[i3 + 1] = (Math.random() - 0.5) * 60;
        positions[i3 + 2] = (Math.random() - 0.5) * 40;
        sizes[i] = 1 + Math.random() * 2;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

      const material = new THREE.PointsMaterial({
        size: 0.8,
        vertexColors: false,
        color: new THREE.Color(0x00e0ff),
        transparent: true,
        opacity: 0.8
      });

      const points = new THREE.Points(geometry, material);
      scene.add(points);

      // Add some subtle ambient glow via additive blending (approximation)
      material.blending = THREE.AdditiveBlending;

      // Mount to DOM
      if (mountRef.current) {
        mountRef.current.appendChild(renderer.domElement);
      }

      const onResize = () => {
        if (!camera || !renderer) return;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };

      window.addEventListener('resize', onResize);

      let t = 0;
      const animate = () => {
        if (!mounted) return;
        t += 0.002;
        // Rotate and wave
        points.rotation.y = t * 0.25;
        const pos = geometry.attributes.position.array;
        for (let i = 0; i < pos.length; i += 3) {
          pos[i + 1] += Math.sin((i + t * 50) * 0.001) * 0.0008;
        }
        geometry.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
        frameId = requestAnimationFrame(animate);
      };

      animate();
    }

    init().catch((err) => {
      console.warn('ThreeCanvas init failed:', err);
    });

    return () => {
      mounted = false;
      if (frameId) cancelAnimationFrame(frameId);
      // note: not fully disposing renderer/scene for simplicity in dev; garbage collector will clean up on hot reload
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 -z-0 opacity-90 pointer-events-none" />;
};

export default ThreeCanvas;
