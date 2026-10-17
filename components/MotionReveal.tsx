'use client';

import React, { useEffect, useRef, useState } from 'react';

interface MotionRevealProps {
  children: React.ReactNode;
  delayMs?: number;
  offsetY?: number;
  className?: string;
}

export default function MotionReveal({
  children,
  delayMs = 0,
  offsetY = 18,
  className = '',
}: MotionRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respeita prefers-reduced-motion imediatamente
    if (
      typeof window !== 'undefined' &&
      (window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
        document.documentElement.classList.contains('reduced-motion'))
    ) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: '0px 0px -30px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translate3d(0, 0, 0)' : `translate3d(0, ${offsetY}px, 0)`,
        transition: `opacity var(--dur-section, 620ms) var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1)) ${delayMs}ms, transform var(--dur-section, 620ms) var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1)) ${delayMs}ms`,
        willChange: isVisible ? 'auto' : 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}
