import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { formatINR } from '../../lib/calculator';

interface Hero3DSceneProps {
  interactiveWeeks?: number;
  onWeekChange?: (week: number) => void;
}

export const Hero3DScene: React.FC<Hero3DSceneProps> = ({
  interactiveWeeks = 21,
  onWeekChange,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [currentWeek, setCurrentWeek] = useState(interactiveWeeks);
  const [isRotating, setIsRotating] = useState(true);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const coinsGroupRef = useRef<THREE.Group | null>(null);
  const reqIdRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    setCurrentWeek(interactiveWeeks);
  }, [interactiveWeeks]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || Math.min(window.innerWidth - 32, 400);
    const height = container.clientHeight || 420;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.2, 5.2);
    camera.lookAt(0, 0.4, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xfff7ed, 1.2);
    scene.add(ambientLight);

    const goldSpotLight = new THREE.DirectionalLight(0xf59e0b, 2.5);
    goldSpotLight.position.set(5, 8, 5);
    goldSpotLight.castShadow = true;
    scene.add(goldSpotLight);

    const emeraldFillLight = new THREE.DirectionalLight(0x10b981, 1.8);
    emeraldFillLight.position.set(-5, 3, -2);
    scene.add(emeraldFillLight);

    const rimLight = new THREE.PointLight(0xffffff, 2.2, 10);
    rimLight.position.set(0, -3, 3);
    scene.add(rimLight);

    // Coins Stack Group
    const coinsGroup = new THREE.Group();
    coinsGroupRef.current = coinsGroup;
    scene.add(coinsGroup);

    // Pedestal / Base Vault Platform
    const pedestalGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.25, 48);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.2,
      metalness: 0.9,
      wireframe: false,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -0.9;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    // Glowing base ring
    const ringGeo = new THREE.TorusGeometry(1.65, 0.04, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -0.78;
    scene.add(ring);

    // Materials for 21 coins
    const coinThickness = 0.08;
    const coinRadius = 1.15;
    const coinGeo = new THREE.CylinderGeometry(coinRadius, coinRadius, coinThickness, 48);

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.95,
      roughness: 0.15,
    });

    const highlightMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.98,
      roughness: 0.08,
      emissive: 0x78350f,
      emissiveIntensity: 0.3,
    });

    // Generate 21 Coins
    const coinMeshes: THREE.Mesh[] = [];
    for (let i = 0; i < 21; i++) {
      const isTop = i === 20;
      const mesh = new THREE.Mesh(coinGeo, isTop ? highlightMat : goldMat);
      mesh.position.y = -0.75 + (i * (coinThickness + 0.015));
      mesh.rotation.y = (i * 0.35);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { index: i };
      coinsGroup.add(mesh);
      coinMeshes.push(mesh);
    }

    // Add floating coin particle dust
    const particleCount = 45;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 5;
      positions[i + 1] = Math.random() * 4 - 1;
      positions[i + 2] = (Math.random() - 0.5) * 4;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xf59e0b,
      size: 0.06,
      transparent: true,
      opacity: 0.7,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth mouse parallax
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      if (coinsGroup) {
        if (isRotating) {
          coinsGroup.rotation.y += delta * 0.6;
        }
        coinsGroup.rotation.x = mouseRef.current.y * 0.35;
        coinsGroup.rotation.z = -mouseRef.current.x * 0.2;
      }

      // Rotate particle field
      particles.rotation.y = time * 0.1;

      // Adjust coin visibility based on currentWeek
      coinMeshes.forEach((mesh, idx) => {
        const visible = idx < currentWeek;
        mesh.visible = visible;
        if (visible && idx === currentWeek - 1) {
          mesh.scale.set(
            1 + Math.sin(time * 4) * 0.03,
            1,
            1 + Math.sin(time * 4) * 0.03
          );
        } else {
          mesh.scale.set(1, 1, 1);
        }
      });

      renderer.render(scene, camera);
      reqIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseRef.current.targetX = x;
      mouseRef.current.targetY = y;
    };

    container.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(reqIdRef.current);
      renderer.dispose();
    };
  }, [currentWeek, isRotating]);

  const totalCalculated = currentWeek * 600;
  const currentProfit = Math.max(0, totalCalculated - 10000);

  return (
    <div className="relative w-full max-w-full h-[380px] sm:h-[440px] md:h-[480px] rounded-2xl sm:rounded-3xl bg-gradient-to-b from-slate-900/90 via-[#0d1520] to-emerald-950/40 border border-slate-800/80 backdrop-blur-xl overflow-hidden p-3 sm:p-4 flex flex-col justify-between shadow-2xl shadow-emerald-950/30">
      {/* Top Floating Badge with Live Calculation */}
      <div className="flex items-center justify-between z-10 gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-900/80 border border-amber-500/30 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] sm:text-xs font-semibold text-amber-200">
            Week {currentWeek} of 21 Stack
          </span>
        </div>

        <button
          onClick={() => setIsRotating(!isRotating)}
          className="text-[10px] sm:text-[11px] font-medium text-slate-400 hover:text-slate-200 bg-slate-800/60 px-2 sm:px-2.5 py-1 rounded-lg border border-slate-700/60 transition-colors cursor-pointer shrink-0"
        >
          {isRotating ? 'Pause Spin' : 'Resume'}
        </button>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Target Milestones Overlay */}
      <div className="absolute top-14 sm:top-16 left-2.5 sm:left-6 z-10 pointer-events-none">
        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl sm:rounded-2xl p-2 sm:p-3 backdrop-blur-md shadow-lg">
          <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
            Base Lent
          </span>
          <span className="text-sm sm:text-lg font-black text-slate-200">
            ₹10,000
          </span>
        </div>
      </div>

      <div className="absolute top-14 sm:top-16 right-2.5 sm:right-6 z-10 pointer-events-none">
        <div className="bg-slate-900/90 border border-amber-500/40 rounded-xl sm:rounded-2xl p-2 sm:p-3 backdrop-blur-md shadow-lg text-right">
          <span className="text-[9px] sm:text-[10px] text-amber-400 uppercase tracking-wider font-bold block">
            21-Wk Vault
          </span>
          <span className="text-sm sm:text-xl font-black bg-gradient-to-r from-amber-300 via-emerald-300 to-amber-200 bg-clip-text text-transparent">
            ₹12,600
          </span>
        </div>
      </div>

      {/* Bottom Interactive Week Slider */}
      <div className="relative z-10 bg-slate-900/90 border border-slate-800 rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 backdrop-blur-md">
        <div className="flex items-center justify-between text-[11px] sm:text-xs mb-1.5 sm:mb-2">
          <span className="text-slate-300 font-medium">
            Sum: <strong className="text-amber-300 font-bold">{formatINR(totalCalculated)}</strong>
          </span>
          <span className="text-emerald-400 font-semibold truncate ml-1">
            {currentProfit > 0 ? `+${formatINR(currentProfit)} Profit` : 'Principal Phase'}
          </span>
        </div>

        <input
          type="range"
          min="1"
          max="21"
          value={currentWeek}
          onChange={(e) => {
            const val = Number(e.target.value);
            setCurrentWeek(val);
            if (onWeekChange) onWeekChange(val);
          }}
          className="w-full accent-amber-400 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
        />

        <div className="flex justify-between text-[9px] sm:text-[10px] text-slate-500 mt-1 font-mono">
          <span>Wk 1</span>
          <span className="hidden sm:inline">Wk 10</span>
          <span>Wk 17 (Break-even)</span>
          <span className="text-amber-400 font-bold">Wk 21 (₹12,600)</span>
        </div>
      </div>
    </div>
  );
};
