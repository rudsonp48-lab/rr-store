'use client';

import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Sparkles, Rotate3d, Layers, Compass } from 'lucide-react';

interface InteractiveLogo3DProps {
  variant?: 'header' | 'hero' | 'footer';
  onSelectPlatformFilter?: (query: string) => void;
  onClickHeader?: () => void;
}

export default function InteractiveLogo3D({
  variant = 'hero',
  onSelectPlatformFilter,
  onClickHeader,
}: InteractiveLogo3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const webglMountRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<'parallax3d' | 'webgl360'>('parallax3d');
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0.25 });
  const [isHovering, setIsHovering] = useState(false);
  const [activeBadge, setActiveBadge] = useState<'apple' | 'android' | null>(null);

  // Animação suave de flutuação 3D quando o mouse não está sobre o emblema
  useEffect(() => {
    if (isHovering || mode === 'webgl360') return;
    let animationFrameId: number;
    let startTime = performance.now();

    const animateIdle = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const idleX = Math.sin(elapsed * 1.4) * 6;
      const idleY = Math.cos(elapsed * 1.1) * 8;
      setRotation({ x: idleX, y: idleY });
      setGlare({
        x: 50 + Math.sin(elapsed * 1.4) * 25,
        y: 50 + Math.cos(elapsed * 1.1) * 25,
        opacity: 0.3,
      });
      animationFrameId = requestAnimationFrame(animateIdle);
    };

    animationFrameId = requestAnimationFrame(animateIdle);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isHovering, mode]);

  // Motor WebGL Three.js para o Modo Placa/Moeda 3D 360°
  useEffect(() => {
    if (variant !== 'hero' || mode !== 'webgl360' || !webglMountRef.current) return;

    const mount = webglMountRef.current;
    const width = mount.clientWidth || 380;
    const height = mount.clientHeight || 380;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    camera.position.z = 5.2;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    // Iluminação Metálica Dourada + Verde Esmeralda/Android
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.35);
    scene.add(ambientLight);

    const goldLight = new THREE.PointLight(0xd4af37, 4.5, 15);
    goldLight.position.set(3, 3, 4);
    scene.add(goldLight);

    const emeraldLight = new THREE.PointLight(0x10b981, 4.0, 15);
    emeraldLight.position.set(-3, -2, 4);
    scene.add(emeraldLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 2.2);
    rimLight.position.set(0, 4, -3);
    scene.add(rimLight);

    // Carrega a textura oficial da logo RR MOBILE enviada pelo usuário
    const textureLoader = new THREE.TextureLoader();
    const logoTexture = textureLoader.load('/rr-mobile-logo.jpg');
    logoTexture.colorSpace = THREE.SRGBColorSpace;
    logoTexture.anisotropy = 8;

    // Grupo 3D da Placa de Luxo RR Mobile
    const group = new THREE.Group();
    scene.add(group);

    // Placa Principal com borda metálica bronze/dourada e faces texturizadas
    const boxGeo = new THREE.BoxGeometry(2.9, 2.9, 0.18);
    const sideMaterial = new THREE.MeshStandardMaterial({
      color: 0xb08d57,
      metalness: 0.88,
      roughness: 0.22,
    });
    const faceMaterial = new THREE.MeshStandardMaterial({
      map: logoTexture,
      bumpMap: logoTexture,
      bumpScale: 0.035,
      metalness: 0.55,
      roughness: 0.28,
    });

    const materials = [
      sideMaterial,
      sideMaterial,
      sideMaterial,
      sideMaterial,
      faceMaterial,
      faceMaterial,
    ];

    const plaqueMesh = new THREE.Mesh(boxGeo, materials);
    group.add(plaqueMesh);

    // Moldura Externa Chanfrada em Ouro Escovado & Preto Obsidiana
    const frameGeo = new THREE.BoxGeometry(3.04, 3.04, 0.12);
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0xc5a059,
      metalness: 0.92,
      roughness: 0.18,
    });
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    group.add(frameMesh);

    // Partículas Orbitais Douradas e Verdes
    const particlesCount = 45;
    const positions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      const angle = (i / particlesCount) * Math.PI * 2;
      const radius = 1.9 + Math.random() * 0.45;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.6;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x34d399,
      size: 0.045,
      transparent: true,
      opacity: 0.75,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    group.add(particles);

    // Interação de Arrastar e Girar 360° no WebGL
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let targetRotY = 0.25;
    let targetRotX = -0.1;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      goldLight.position.set(normX * 4, normY * 4, 3.5);

      if (!isDragging) {
        targetRotY = normX * 0.55;
        targetRotX = -normY * 0.4;
        return;
      }
      const deltaX = e.clientX - prevX;
      const deltaY = e.clientY - prevY;
      targetRotY += deltaX * 0.015;
      targetRotX += deltaY * 0.015;
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    mount.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      if (!isDragging) {
        targetRotY += 0.0045;
      }
      group.rotation.y += (targetRotY - group.rotation.y) * 0.08;
      group.rotation.x += (targetRotX - group.rotation.x) * 0.08;
      particles.rotation.z -= 0.002;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(reqId);
      mount.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      renderer.dispose();
    };
  }, [variant, mode]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const maxTilt = variant === 'header' ? 18 : 22;
    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    setRotation({ x: rotateX, y: rotateY });
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.55,
    });
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setRotation({ x: 0, y: 0 });
    setGlare({ x: 50, y: 50, opacity: 0.2 });
    setActiveBadge(null);
  };

  // ============================================================================
  // VARIANTE COMPACTA 3D (HEADER & FOOTER)
  // ============================================================================
  if (variant === 'header' || variant === 'footer') {
    return (
      <div
        ref={containerRef}
        onClick={onClickHeader}
        onMouseEnter={() => setIsHovering(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="flex items-center gap-3 text-left group shrink-0 cursor-pointer select-none"
        style={{ perspective: '700px' }}
      >
        <div
          className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#0A0A0A] border border-amber-500/40 group-hover:border-[#10B981] shadow-[0_0_25px_rgba(212,175,55,0.28)] group-hover:shadow-[0_0_32px_rgba(16,185,129,0.55)] transition-shadow duration-300 overflow-hidden"
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${
              isHovering ? 1.07 : 1
            })`,
            transformStyle: 'preserve-3d',
            transition: isHovering ? 'transform 60ms linear' : 'transform 400ms ease-out',
          }}
        >
          <img
            src="/rr-mobile-logo.jpg"
            alt="RR Store / RR Mobile Logo 3D"
            className="w-full h-full object-cover scale-110"
          />
          {/* Reflexo Especular Dinâmico */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 230, 150, ${glare.opacity}), rgba(16, 185, 129, 0.2) 45%, transparent 75%)`,
              mixBlendMode: 'screen',
            }}
          />
        </div>

        <div className="leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="text-lg sm:text-xl font-black tracking-tight text-white">
              RR <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-[#10B981]">STORE</span>
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-300 rounded border border-amber-500/30">
              RR MOBILE 3D
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 font-medium">
            Apple • Android • 10 Departamentos DF
          </p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // VARIANTE HERO: PALCO 3D INTERATIVO COMPLETO (PARALLAX MULTI-CAMADAS + WEBGL)
  // ============================================================================
  return (
    <div className="relative flex flex-col items-center">
      {/* Barra de Controle do Emblema 3D */}
      <div className="mb-3 flex flex-wrap items-center justify-center gap-2 z-20">
        <button
          type="button"
          onClick={() => setMode('parallax3d')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
            mode === 'parallax3d'
              ? 'bg-gradient-to-r from-amber-500/25 to-[#10B981]/25 border-amber-400/60 text-amber-200 shadow-[0_0_20px_rgba(212,175,55,0.25)]'
              : 'bg-[#121212] border-white/10 text-zinc-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>Relevo 3D Multi-Camadas</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('webgl360')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
            mode === 'webgl360'
              ? 'bg-[#10B981] border-[#34D399] text-[#0A0A0A] shadow-[0_0_20px_rgba(16,185,129,0.4)]'
              : 'bg-[#121212] border-white/10 text-zinc-400 hover:text-white'
          }`}
        >
          <Rotate3d className="w-3.5 h-3.5" />
          <span>Placa 3D WebGL 360°</span>
        </button>
      </div>

      {mode === 'webgl360' ? (
        <div className="relative w-full max-w-[400px] aspect-square rounded-3xl bg-gradient-to-b from-[#121212] to-[#0A0A0A] border border-amber-500/30 shadow-[0_25px_70px_rgba(0,0,0,0.9)] flex flex-col items-center justify-center overflow-hidden">
          <div
            ref={webglMountRef}
            className="w-full h-full cursor-grab active:cursor-grabbing"
            title="Arraste para girar a logo RR Mobile em 360°"
          />
          <div className="pointer-events-none absolute bottom-3 inset-x-4 flex items-center justify-between text-[11px] bg-black/75 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl text-zinc-300">
            <span className="flex items-center gap-1.5 font-bold text-amber-300">
              <Compass className="w-3.5 h-3.5 animate-spin" />
              Arraste para girar em 360°
            </span>
            <span className="text-[#34D399] font-extrabold">WebGL Three.js</span>
          </div>
        </div>
      ) : (
        /* PALCO 3D PARALLAX COM RELEVO PROFUNDO E ILUMINAÇÃO METÁLICA DINÂMICA */
        <div
          ref={containerRef}
          onMouseEnter={() => setIsHovering(true)}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative w-full max-w-[400px] aspect-square select-none cursor-pointer"
          style={{ perspective: '1100px' }}
        >
          {/* Glow Traseiro Dourado (Apple) + Verde (Android/Esmeralda) */}
          <div
            className="pointer-events-none absolute -inset-3 rounded-3xl opacity-75 blur-2xl transition-all duration-300"
            style={{
              background:
                activeBadge === 'apple'
                  ? 'radial-gradient(circle, rgba(212,175,55,0.45) 0%, transparent 70%)'
                  : activeBadge === 'android'
                  ? 'radial-gradient(circle, rgba(132,196,65,0.45) 0%, transparent 70%)'
                  : 'linear-gradient(135deg, rgba(212,175,55,0.3) 0%, rgba(16,185,129,0.3) 100%)',
            }}
          />

          {/* Cartão 3D Principal com Preserve-3D */}
          <div
            className="relative w-full h-full rounded-3xl bg-[#070707] border-2 border-amber-500/35 shadow-[0_30px_70px_rgba(0,0,0,0.95)]"
            style={{
              transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
              transformStyle: 'preserve-3d',
              transition: isHovering ? 'transform 70ms linear' : 'transform 500ms ease-out',
            }}
          >
            {/* CAMADA 1 (Base Z=0): Imagem Oficial RR MOBILE em Alta Definição */}
            <div
              className="absolute inset-0 rounded-3xl overflow-hidden"
              style={{ transform: 'translateZ(0px)' }}
            >
              <img
                src="/rr-mobile-logo.jpg"
                alt="Logo Oficial RR Mobile 3D"
                className="w-full h-full object-cover"
              />

              {/* Luz Especular Metálica que Segue o Cursor */}
              <div
                className="pointer-events-none absolute inset-0 transition-opacity duration-200"
                style={{
                  background: `radial-gradient(circle 220px at ${glare.x}% ${glare.y}%, rgba(255, 223, 128, ${glare.opacity}), rgba(52, 211, 153, 0.18) 45%, transparent 75%)`,
                  mixBlendMode: 'screen',
                }}
              />
            </div>

            {/* CAMADA 2 (Z=24px): Moldura Metálica 3D Flutuante nos Cantos */}
            <div
              className="pointer-events-none absolute inset-3 rounded-2xl border border-amber-400/30 shadow-[inset_0_0_25px_rgba(212,175,55,0.15)]"
              style={{ transform: 'translateZ(24px)' }}
            />

            {/* CAMADA 3 (Z=42px): Hotspots 3D Flutuantes sobre a Maçã Dourada e o Android Verde */}
            {/* Hotspot Esquerdo: Apple Dourada */}
            <button
              type="button"
              onMouseEnter={() => setActiveBadge('apple')}
              onMouseLeave={() => setActiveBadge(null)}
              onClick={() => onSelectPlatformFilter?.('MagSafe')}
              style={{ transform: 'translateZ(42px)' }}
              className="group/apple absolute left-[9%] top-[33%] w-[26%] h-[28%] rounded-2xl border border-transparent hover:border-amber-400/70 hover:bg-amber-400/10 transition-all flex items-end justify-center p-1.5 cursor-pointer"
              title="Filtrar Linha Apple / MagSafe"
            >
              <span className="opacity-0 group-hover/apple:opacity-100 transition-opacity bg-black/90 text-amber-300 border border-amber-400/50 text-[10px] font-black px-2 py-0.5 rounded-md shadow-lg whitespace-nowrap">
                 Linha Apple
              </span>
            </button>

            {/* Hotspot Direito: Android Verde */}
            <button
              type="button"
              onMouseEnter={() => setActiveBadge('android')}
              onMouseLeave={() => setActiveBadge(null)}
              onClick={() => onSelectPlatformFilter?.('Bluetooth')}
              style={{ transform: 'translateZ(42px)' }}
              className="group/android absolute right-[8%] top-[33%] w-[27%] h-[30%] rounded-2xl border border-transparent hover:border-[#84C441]/80 hover:bg-[#84C441]/10 transition-all flex items-end justify-center p-1.5 cursor-pointer"
              title="Filtrar Linha Android & Smart"
            >
              <span className="opacity-0 group-hover/android:opacity-100 transition-opacity bg-black/90 text-[#84C441] border border-[#84C441]/50 text-[10px] font-black px-2 py-0.5 rounded-md shadow-lg whitespace-nowrap">
                🤖 Linha Android
              </span>
            </button>

            {/* CAMADA 4 (Z=52px): Badge Superior Flutuante de Interatividade 3D */}
            <div
              style={{ transform: 'translateZ(52px)' }}
              className="pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-[#10B981] text-[#0A0A0A] text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.8)]"
            >
              <Sparkles className="w-3 h-3 fill-current" />
              Emblema 3D Interativo • RR Mobile
            </div>

            {/* CAMADA 5 (Z=46px): Barra Inferior Flutuante com Status 3D */}
            <div
              style={{ transform: 'translateZ(46px)' }}
              className="pointer-events-none absolute bottom-3 inset-x-4 bg-black/80 backdrop-blur-md border border-amber-500/30 rounded-xl px-3 py-2 flex items-center justify-between text-[11px]"
            >
              <span className="text-amber-300 font-extrabold flex items-center gap-1.5">
                <Rotate3d className="w-3.5 h-3.5 text-[#34D399]" />
                Mova o cursor para inclinar em 3D
              </span>
              <span className="text-zinc-300 font-bold">
                X:{rotation.x.toFixed(0)}° Y:{rotation.y.toFixed(0)}°
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
