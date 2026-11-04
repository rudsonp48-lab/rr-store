'use client';

import React, { useState, useEffect } from 'react';
import { X, Flame, Truck, RefreshCw, CheckCircle2, Sparkles, MapPin } from 'lucide-react';
import { formatBRL } from '../data/mockData';

interface SocialProofEvent {
  id: string;
  type: 'compra' | 'motoboy' | 'troca' | 'estoque';
  title: string;
  productName: string;
  region: string;
  timeAgo: string;
  price?: number;
}

const EVENTS: SocialProofEvent[] = [
  {
    id: 'ev-1',
    type: 'compra',
    title: 'Novo pedido confirmado no PIX',
    productName: 'iPhone 16 Pro 256GB Titânio Preto',
    region: 'Águas Claras - DF',
    timeAgo: 'há 4 min',
    price: 6890,
  },
  {
    id: 'ev-2',
    type: 'motoboy',
    title: 'Motoboy saiu para entrega',
    productName: 'Apple Watch Ultra 2 49mm',
    region: 'Sudoeste - DF',
    timeAgo: 'há 9 min',
  },
  {
    id: 'ev-3',
    type: 'troca',
    title: 'Troca Fácil Realizada',
    productName: 'iPhone 12 entregue como entrada no iPhone 15 128GB',
    region: 'Plano Piloto - DF',
    timeAgo: 'há 16 min',
  },
  {
    id: 'ev-4',
    type: 'compra',
    title: 'Retirada na Loja D439',
    productName: 'MacBook Air M5 512GB Midnight',
    region: 'Feira dos Importados SIA',
    timeAgo: 'há 24 min',
    price: 9490,
  },
  {
    id: 'ev-5',
    type: 'motoboy',
    title: 'Entrega Expressa Despachada',
    productName: 'AirPods Pro 2 MagSafe USB-C',
    region: 'Taguatinga Norte - DF',
    timeAgo: 'há 32 min',
  },
];

export default function LiveSocialProofToast() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isDismissed) return;

    // Surge a primeira vez após 5 segundos
    const initialTimer = setTimeout(() => {
      setIsVisible(true);
    }, 4500);

    return () => clearTimeout(initialTimer);
  }, [isDismissed]);

  // Rotaciona a cada 18 segundos
  useEffect(() => {
    if (isDismissed || isPaused) return;

    const interval = setInterval(() => {
      // Oculta por 600ms antes de trocar
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % EVENTS.length);
        setIsVisible(true);
      }, 700);
    }, 18000);

    return () => clearInterval(interval);
  }, [isDismissed, isPaused]);

  if (isDismissed) return null;

  const currentEvent = EVENTS[currentIndex];

  const getIcon = () => {
    switch (currentEvent.type) {
      case 'compra':
        return <Flame className="w-4 h-4 text-amber-400" />;
      case 'motoboy':
        return <Truck className="w-4 h-4 text-[#34D399]" />;
      case 'troca':
        return <RefreshCw className="w-4 h-4 text-[#A78BFA]" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-[#10B981]" />;
    }
  };

  return (
    <aside
      aria-label="Atividades recentes na loja"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`fixed bottom-20 md:bottom-6 left-3 sm:left-6 z-40 max-w-[340px] sm:max-w-sm transition-all duration-500 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
      }`}
    >
      <div className="relative rounded-2xl p-3 sm:p-3.5 bg-[#0D0D14]/95 text-white border border-white/15 shadow-[0_15px_40px_rgba(0,0,0,0.6)] backdrop-blur-md flex items-start gap-3">
        {/* Ícone */}
        <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0 mt-0.5">
          {getIcon()}
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#34D399]">
              {currentEvent.title}
            </span>
            <span className="text-[10px] text-white/40">• {currentEvent.timeAgo}</span>
          </div>

          <p className="text-xs font-black text-white truncate leading-snug">
            {currentEvent.productName}
          </p>

          <div className="flex items-center gap-1 text-[10px] text-white/70 font-semibold mt-1">
            <MapPin className="w-2.5 h-2.5 text-[#A78BFA] shrink-0" />
            <span className="truncate">{currentEvent.region}</span>
            {currentEvent.price && (
              <span className="ml-auto font-black text-[#34D399]">
                {formatBRL(currentEvent.price)}
              </span>
            )}
          </div>
        </div>

        {/* Botão de Fechar */}
        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="text-white/40 hover:text-white transition-colors cursor-pointer p-0.5"
          aria-label="Dispensar aviso"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
