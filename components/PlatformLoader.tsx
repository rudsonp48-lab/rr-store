'use client';

import React, { useEffect, useState } from 'react';

export function LoadingWave() {
  return (
    <div id="loadingWave" aria-label="Carregando vitrine RR Mobile...">
      <div className="shape square" />
      <div className="shape triangle" />
      <div className="shape diamond" />
      <div className="shape circle" />
      <div className="shape square" />
      <div className="shape triangle" />
      <div className="shape diamond" />
      <div className="shape circle" />
    </div>
  );
}

export default function PlatformLoader() {
  const [mounted, setMounted] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Permite que o usuário veja a animação de ondas geométricas durante o carregamento inicial
    const timer = setTimeout(() => {
      setFading(true);
      const removeTimer = setTimeout(() => {
        setMounted(false);
      }, 500);
      return () => clearTimeout(removeTimer);
    }, 1100);

    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return (
    <div
      id="platform-initial-loader"
      className={`fixed inset-0 z-[99999] flex items-center justify-center select-none transition-opacity duration-500 ease-out ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ backgroundColor: '#000000' }}
    >
      <LoadingWave />
    </div>
  );
}
