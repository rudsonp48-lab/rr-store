'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Sparkles,
  ArrowRight,
  Check,
  Cpu,
  Camera,
  Battery,
  Layers,
  Zap,
  ShoppingBag,
  RefreshCw,
} from 'lucide-react';
import { Product } from '../types/store';
import { formatBRL, PRODUCTS } from '../data/mockData';

interface DeviceComparatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (product: Product) => void;
  onOpenTradeIn?: (product: Product) => void;
  initialProductA?: Product | null;
  allProducts?: Product[];
}

interface SpecRow {
  label: string;
  icon: React.ReactNode;
  valA: string;
  valB: string;
}

export default function DeviceComparatorModal({
  isOpen,
  onClose,
  onAddToCart,
  onOpenTradeIn,
  initialProductA = null,
  allProducts = PRODUCTS,
}: DeviceComparatorModalProps) {
  // Flagships filtrados para comparação
  const flagships = useMemo(() => {
    return allProducts.filter(
      (p) =>
        p.categoria.includes('Smartphones') ||
        p.categoria.includes('Apple') ||
        p.id.startsWith('rr-apple-')
    );
  }, [allProducts]);

  const [productIdA, setProductIdA] = useState<string>(
    initialProductA?.id || 'rr-apple-ip17pm-512-silver'
  );
  const [productIdB, setProductIdB] = useState<string>('rr-apple-ip17pm-256-laranja');

  const productA = useMemo(
    () => flagships.find((p) => p.id === productIdA) || flagships[0] || allProducts[0],
    [flagships, productIdA, allProducts]
  );

  const productB = useMemo(
    () => flagships.find((p) => p.id === productIdB) || flagships[1] || allProducts[1],
    [flagships, productIdB, allProducts]
  );

  if (!isOpen || !productA || !productB) return null;

  const priceDiff = Math.abs(productA.precoPix - productB.precoPix);
  const moreExpensive = productA.precoPix > productB.precoPix ? 'A' : 'B';

  const specs: SpecRow[] = [
    {
      label: 'Processador',
      icon: <Cpu className="w-4 h-4 text-[#A78BFA]" />,
      valA: productA.nome.includes('18') || productA.nome.includes('17')
        ? 'A18 Pro (3nm Apple Intelligence)'
        : 'Chip A-Series Bionic / Snapdragon 8 Gen',
      valB: productB.nome.includes('18') || productB.nome.includes('17')
        ? 'A18 Pro (3nm Apple Intelligence)'
        : 'Chip A-Series Bionic / Snapdragon 8 Gen',
    },
    {
      label: 'Câmera Principal',
      icon: <Camera className="w-4 h-4 text-[#34D399]" />,
      valA: productA.nome.includes('Pro')
        ? '48MP Fusion + Telefoto 5x Óptico + Macro'
        : '48MP Avançada com Modo Retrato Noturno',
      valB: productB.nome.includes('Pro')
        ? '48MP Fusion + Telefoto 5x Óptico + Macro'
        : '48MP Avançada com Modo Retrato Noturno',
    },
    {
      label: 'Bateria Estimada',
      icon: <Battery className="w-4 h-4 text-amber-400" />,
      valA: productA.nome.includes('Max') ? 'Até 33h de reprodução de vídeo' : 'Até 27h de reprodução',
      valB: productB.nome.includes('Max') ? 'Até 33h de reprodução de vídeo' : 'Até 27h de reprodução',
    },
    {
      label: 'Recursos Exclusivos',
      icon: <Layers className="w-4 h-4 text-blue-400" />,
      valA: 'Botão de Ação + Botão de Controle de Câmera + USB-C 3',
      valB: 'Botão de Ação + Controle de Câmera + Tela Super Retina',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-white/15 bg-[#0D0D14] text-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-gradient-to-r from-[#141226] via-[#0D0D14] to-[#141226] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7C63E6]/20 border border-[#7C63E6]/40 flex items-center justify-center text-[#A78BFA]">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#34D399]">
                Comparador RR Store
              </span>
              <h2 className="text-base sm:text-xl font-black text-white">
                Comparativo Lado a Lado: Vale o Upgrade?
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Fechar comparador"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corpo Comparativo */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Seletor Lado a Lado dos Aparelhos */}
          <div className="grid grid-cols-2 gap-3 sm:gap-6">
            {/* Aparelho A */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-3 sm:p-4 text-center space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#A78BFA] bg-[#7C63E6]/20 px-2 py-0.5 rounded-md">
                Modelo 1
              </span>
              <select
                value={productIdA}
                onChange={(e) => setProductIdA(e.target.value)}
                className="w-full bg-[#181628] border border-white/15 rounded-xl p-2 text-xs font-bold text-white focus:outline-none cursor-pointer"
              >
                {flagships.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#181628] text-white">
                    {p.nome}
                  </option>
                ))}
              </select>

              <div className="h-32 sm:h-40 flex items-center justify-center">
                <img
                  src={productA.imagem}
                  alt={productA.nome}
                  className="max-h-full max-w-full object-contain drop-shadow-[0_10px_20px_rgba(124,99,230,0.3)]"
                />
              </div>

              <div>
                <p className="text-base sm:text-2xl font-black text-[#34D399] tracking-tight">
                  {formatBRL(productA.precoPix)}
                </p>
                <p className="text-[10px] sm:text-xs text-white/60">
                  {productA.parcelamento}
                </p>
              </div>

              <div className="flex flex-col gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onAddToCart?.(productA);
                    onClose();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] font-black text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Escolher Este</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenTradeIn?.(productA);
                  }}
                  className="w-full py-1.5 px-3 rounded-xl bg-[#7C63E6]/20 hover:bg-[#7C63E6]/30 text-[#C4B5FD] font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3 text-[#A78BFA]" />
                  <span>Dar Usado na Troca</span>
                </button>
              </div>
            </div>

            {/* Aparelho B */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-3 sm:p-4 text-center space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#34D399] bg-[#10B981]/20 px-2 py-0.5 rounded-md">
                Modelo 2
              </span>
              <select
                value={productIdB}
                onChange={(e) => setProductIdB(e.target.value)}
                className="w-full bg-[#181628] border border-white/15 rounded-xl p-2 text-xs font-bold text-white focus:outline-none cursor-pointer"
              >
                {flagships.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#181628] text-white">
                    {p.nome}
                  </option>
                ))}
              </select>

              <div className="h-32 sm:h-40 flex items-center justify-center">
                <img
                  src={productB.imagem}
                  alt={productB.nome}
                  className="max-h-full max-w-full object-contain drop-shadow-[0_10px_20px_rgba(16,185,129,0.3)]"
                />
              </div>

              <div>
                <p className="text-base sm:text-2xl font-black text-[#34D399] tracking-tight">
                  {formatBRL(productB.precoPix)}
                </p>
                <p className="text-[10px] sm:text-xs text-white/60">
                  {productB.parcelamento}
                </p>
              </div>

              <div className="flex flex-col gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onAddToCart?.(productB);
                    onClose();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] font-black text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Escolher Este</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenTradeIn?.(productB);
                  }}
                  className="w-full py-1.5 px-3 rounded-xl bg-[#7C63E6]/20 hover:bg-[#7C63E6]/30 text-[#C4B5FD] font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3 text-[#A78BFA]" />
                  <span>Dar Usado na Troca</span>
                </button>
              </div>
            </div>
          </div>

          {/* Banner de Diferença de Preço */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#171228] to-[#101b2a] border border-white/10 text-center">
            <p className="text-xs text-white/70">
              Diferença de investimento no PIX:{' '}
              <strong className="text-white text-sm sm:text-base">
                {formatBRL(priceDiff)}
              </strong>
            </p>
          </div>

          {/* Tabela de Especificações */}
          <div className="border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/10 bg-white/[0.02]">
            {specs.map((s, idx) => (
              <div key={idx} className="p-3.5 sm:p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-white/80">
                  {s.icon}
                  <span>{s.label}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-white/90 leading-snug">
                    {s.valA}
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-white/90 leading-snug">
                    {s.valB}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
