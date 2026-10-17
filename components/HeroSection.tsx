'use client';

import React from 'react';
import {
  Zap,
  ShieldCheck,
  Truck,
  MessageCircle,
  ArrowRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { DFRegion } from '../types/store';
import { formatBRL } from '../data/mockData';
import { buildConsultantWhatsAppUrl } from '../data/whatsappUtils';
import InteractiveLogo3D from './InteractiveLogo3D';

interface HeroSectionProps {
  selectedRegion: DFRegion;
  onExploreClick: () => void;
  onSelectPlatformFilter?: (query: string) => void;
}

export default function HeroSection({
  selectedRegion,
  onExploreClick,
  onSelectPlatformFilter,
}: HeroSectionProps) {
  return (
    <section className="relative bg-[#0A0A0A] text-white overflow-hidden border-b border-white/10">
      {/* Detalhes gráficos abstratos em verde neon suave e dourado metálico */}
      <div className="pointer-events-none absolute -top-36 -left-36 w-[500px] h-[500px] rounded-full bg-[#10B981]/15 blur-[130px]" />
      <div className="pointer-events-none absolute top-1/4 right-10 w-[460px] h-[460px] rounded-full bg-amber-500/10 blur-[140px]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #34D399 1px, transparent 1px), linear-gradient(to bottom, #34D399 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Coluna Principal (Headline & CTAs) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex flex-wrap items-center gap-2 bg-[#121212] border border-[#10B981]/40 rounded-full px-3.5 py-1.5 shadow-[0_0_25px_rgba(16,185,129,0.18)]">
              <span className="flex h-2 w-2 rounded-full bg-[#34D399] animate-ping" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#34D399]">
                RR Store &amp; RR Mobile • 10 Departamentos no DF
              </span>
              <span className="text-[11px] text-zinc-400 hidden sm:inline">
                | Motoboy Express Ativo Hoje
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[52px] font-black tracking-tight leading-[1.1] text-white">
              Tudo o que seu dia a dia em{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] via-[#34D399] to-amber-300">
                Brasília precisa
              </span>
              , na velocidade de um clique.
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-zinc-300 leading-relaxed max-w-2xl">
              Da tecnologia <strong className="text-amber-300">Apple &amp; Android (RR Mobile)</strong> aos{' '}
              <strong className="text-white">10 departamentos</strong> mais desejados da capital — Smart Home,
              Suplementos, Moda Fitness, Skincare para o clima do DF e Papelaria para Concursos. Pagamento
              facilitado com <strong className="text-[#34D399]">5% OFF no PIX</strong> ou em até{' '}
              <strong className="text-white">12x no Cartão</strong> e entrega flash via motoboy no mesmo dia.
            </p>

            {/* Dois botões de CTA */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-1">
              <button
                onClick={onExploreClick}
                className="inline-flex items-center justify-center gap-2.5 bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] font-black text-sm sm:text-base px-7 py-4 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_40px_rgba(52,211,153,0.65)] transition-all duration-200 active:scale-98 cursor-pointer"
              >
                <span>Explorar Ofertas</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </button>

              <a
                href={buildConsultantWhatsAppUrl(selectedRegion.nome)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 bg-white/5 hover:bg-[#10B981]/15 text-white hover:text-[#34D399] border-2 border-white/25 hover:border-[#10B981] font-bold text-sm sm:text-base px-6 py-4 rounded-2xl transition-all duration-200"
              >
                <MessageCircle className="w-5 h-5 text-[#34D399]" />
                <span>Falar com Consultor no WhatsApp</span>
              </a>
            </div>

            {/* Card Rápido de Logística Expressa para a Região Selecionada no DF */}
            <div className="bg-[#121212]/90 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#34D399] shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-white">
                      {selectedRegion.nome}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#10B981]/15 text-[#34D399] px-2 py-0.5 rounded-full">
                      <Clock className="w-3 h-3" /> {selectedRegion.tempoEstimado}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                    Frete Grátis acima de{' '}
                    <strong className="text-[#34D399]">{formatBRL(selectedRegion.freteGratisAcimaDe)}</strong>{' '}
                    (Taxa fixa: {formatBRL(selectedRegion.taxaEntrega)})
                  </p>
                </div>
              </div>
            </div>

            {/* Indicadores Rápidos */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#121212] border border-[#10B981]/30 flex items-center justify-center text-[#10B981] shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-extrabold text-white">Entrega Hoje</p>
                  <p className="text-[11px] text-zinc-400">Em todo o DF</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#121212] border border-[#10B981]/30 flex items-center justify-center text-[#10B981] shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-extrabold text-white">5% OFF no PIX</p>
                  <p className="text-[11px] text-zinc-400">Ou até 12x Cartão</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#121212] border border-[#10B981]/30 flex items-center justify-center text-[#10B981] shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-extrabold text-white">Nota 4.9 / 5.0</p>
                  <p className="text-[11px] text-zinc-400">+3.400 clientes DF</p>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Emblema 3D Interativo Oficial RR MOBILE */}
          <div className="lg:col-span-5">
            <InteractiveLogo3D
              variant="hero"
              onSelectPlatformFilter={onSelectPlatformFilter}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
