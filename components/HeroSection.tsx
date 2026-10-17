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
  Star,
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
      {/* Subtle Light Beams & Depth (Stripe / Linear / Vercel aesthetic) */}
      <div className="pointer-events-none absolute -top-36 -left-36 w-[520px] h-[520px] rounded-full bg-[#10B981]/15 blur-[130px]" />
      <div className="pointer-events-none absolute top-1/4 right-10 w-[460px] h-[460px] rounded-full bg-amber-500/10 blur-[140px]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #34D399 1px, transparent 1px), linear-gradient(to bottom, #34D399 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Coluna Esquerda: Coreografia Hero (Beat 2 -> Beat 3 -> Beat 4) */}
          <div className="lg:col-span-7 space-y-6 order-2 lg:order-1">
            {/* BEAT 2: Proof Signal + Headline (Outcome + Audience) */}
            <div className="space-y-4 motion-hero-beat-2">
              <div className="inline-flex flex-wrap items-center gap-2 bg-[#121212] border border-[#10B981]/40 rounded-full px-3.5 py-1.5 shadow-[0_0_25px_rgba(16,185,129,0.18)]">
                <span className="flex h-2 w-2 rounded-full bg-[#34D399] animate-ping" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#34D399]">
                  RR Store &amp; RR Mobile • Entrega Expressa em 45–90 min no DF
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-amber-300 font-bold border-l border-white/15 pl-2">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  4.9/5 (+3.400 clientes em BSB)
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[52px] font-black tracking-tight leading-[1.08] text-white">
                Tudo o que seu dia a dia em{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] via-[#34D399] to-amber-300">
                  Brasília precisa
                </span>
                , na velocidade de um clique.
              </h1>
            </div>

            {/* BEAT 3: Specificity Subheadline + DF Region Logistics Proof */}
            <div className="space-y-4 motion-hero-beat-3">
              <p className="text-sm sm:text-base lg:text-lg text-zinc-300 leading-relaxed max-w-2xl">
                Esqueça fretes demorados de 10 dias. Compre tecnologia{' '}
                <strong className="text-amber-300">Apple &amp; Android (RR Mobile)</strong> e produtos
                selecionados nos <strong className="text-white">10 departamentos</strong> mais desejados da
                capital — com <strong className="text-[#34D399]">5% OFF imediato no PIX</strong>, até{' '}
                <strong className="text-white">12x sem juros</strong> ou pagamento direto na maquininha do
                motoboy na sua porta.
              </p>

              {/* Card Rápido de Logística Expressa para a Região Selecionada no DF */}
              <div className="bg-[#121212]/90 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#34D399] shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-extrabold text-white">
                        Rota Ativa: {selectedRegion.nome}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#10B981]/15 text-[#34D399] px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" /> {selectedRegion.tempoEstimado}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                      Frete Grátis acima de{' '}
                      <strong className="text-[#34D399]">
                        {formatBRL(selectedRegion.freteGratisAcimaDe)}
                      </strong>{' '}
                      (ou taxa fixa de {formatBRL(selectedRegion.taxaEntrega)})
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* BEAT 4: Primary CTA (Verb + Outcome) + Secondary CTA + Risk Reversal */}
            <div className="space-y-4 pt-1 motion-hero-beat-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <button
                  onClick={onExploreClick}
                  className="motion-hover-lift relative overflow-hidden inline-flex items-center justify-center gap-2.5 bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] font-black text-sm sm:text-base px-7 py-4 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_40px_rgba(52,211,153,0.65)] cursor-pointer"
                >
                  <span>Explorar Ofertas com Entrega Hoje</span>
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </button>

                <a
                  href={buildConsultantWhatsAppUrl(selectedRegion.nome)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="motion-hover-lift inline-flex items-center justify-center gap-2.5 bg-white/5 hover:bg-[#10B981]/15 text-white hover:text-[#34D399] border-2 border-white/20 hover:border-[#10B981] font-bold text-sm sm:text-base px-6 py-4 rounded-2xl"
                >
                  <MessageCircle className="w-5 h-5 text-[#34D399]" />
                  <span>Falar com Consultor no WhatsApp</span>
                </a>
              </div>

              {/* Risk Reversal Strip Above the Fold */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#121212] border border-[#10B981]/30 flex items-center justify-center text-[#10B981] shrink-0">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-extrabold text-white">Despacho 30 min</p>
                    <p className="text-[11px] text-zinc-400">Motoboy no DF</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#121212] border border-[#10B981]/30 flex items-center justify-center text-[#10B981] shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-extrabold text-white">Pague na Entrega</p>
                    <p className="text-[11px] text-zinc-400">Ou 5% OFF no PIX</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#121212] border border-[#10B981]/30 flex items-center justify-center text-[#10B981] shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-extrabold text-white">Garantia Local</p>
                    <p className="text-[11px] text-zinc-400">7 dias troca fácil</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Direita: BEAT 1 (Hero Visual moves in first!) */}
          <div className="lg:col-span-5 order-1 lg:order-2 motion-hero-beat-1">
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
