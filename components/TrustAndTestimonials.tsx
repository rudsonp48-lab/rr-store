'use client';

import React, { useState } from 'react';
import {
  Truck,
  ShieldCheck,
  Award,
  MessageCircle,
  Star,
  MapPin,
  CheckCircle2,
  Clock,
  ChevronDown,
  ArrowRight,
  Zap,
  XCircle,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { DFRegion } from '../types/store';
import { FAQ_ITEMS, formatBRL, TESTIMONIALS } from '../data/mockData';
import { buildConsultantWhatsAppUrl } from '../data/whatsappUtils';
import MotionReveal from './MotionReveal';

interface TrustAndTestimonialsProps {
  selectedRegion?: DFRegion;
  onExploreClick?: () => void;
}

export default function TrustAndTestimonials({
  selectedRegion,
  onExploreClick,
}: TrustAndTestimonialsProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const trustBadges = [
    {
      icon: Truck,
      title: 'Receba em Horas, Não em Semanas',
      description:
        'Enquanto fretes nacionais levam de 7 a 12 dias úteis para chegar a Brasília, nossa frota de motoboys entrega no mesmo dia em todo o DF.',
      highlight: '45 a 90 min no DF',
    },
    {
      icon: ShieldCheck,
      title: 'Risco Zero: Pague no PIX ou na Entrega',
      description:
        'Economize 5% à vista no PIX, parcele em até 12x sem juros no link seguro ou passe seu cartão presencialmente na maquininha do motoboy.',
      highlight: '5% OFF ou 12x',
    },
    {
      icon: Award,
      title: 'Curadoria RR Mobile & 10 Departamentos',
      description:
        'Da linha Apple & Android a Suplementos, Skincare e Concursos: produtos inspecionados um a um com garantia local em Brasília.',
      highlight: 'Garantia BSB',
    },
    {
      icon: MessageCircle,
      title: 'Atendimento Humano em Brasília',
      description:
        'Fale diretamente com consultores da nossa equipe no DF pelo WhatsApp para tirar dúvidas, pedir vídeos reais e acompanhar o envio.',
      highlight: 'WhatsApp Direto',
    },
  ];

  const howItWorksSteps = [
    {
      step: '01',
      title: 'Monte sua sacola nos 10 departamentos',
      description:
        'Filtre por categoria ou use a busca em tempo real. Combine itens de Eletrônicos, Fitness, Casa, Pet ou Papelaria no mesmo pedido.',
      badge: 'Leva menos de 1 minuto',
    },
    {
      step: '02',
      title: 'Escolha sua Região do DF e pagamento',
      description:
        'Selecione sua Região Administrativa para ver a taxa de motoboy (ou Frete Grátis) e escolha entre PIX 5% OFF, Crédito 12x ou Débito na entrega.',
      badge: 'Checkout Híbrido Transparente',
    },
    {
      step: '03',
      title: 'Confirme no WhatsApp e receba hoje',
      description:
        'Com 1 clique seu pedido formatado (#RR-XXXX) chega à nossa central em Brasília e seu motoboy sai para entrega imediata.',
      badge: 'Despacho em até 30 min',
    },
  ];

  return (
    <>
      {/* 1. SEÇÃO PROBLEM -> SOLUTION (Landing Page Skill) */}
      <section className="bg-[#0A0A0A] text-white py-14 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MotionReveal>
            <div className="text-center max-w-3xl mx-auto mb-10">
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#34D399] bg-[#10B981]/10 border border-[#10B981]/30 px-3.5 py-1 rounded-full mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                Por que Brasília escolhe a RR Store?
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                Pare de esperar 10 dias por entregas ou pagar caro no shopping
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2.5 leading-relaxed">
                Criamos o padrão <strong className="text-white">RR Store &amp; RR Mobile</strong> para quem mora em
                Brasília e exige preço justo de internet com a velocidade de retirada imediata.
              </p>
            </div>
          </MotionReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
            <MotionReveal delayMs={60}>
              <div className="h-full bg-[#121212]/70 border border-rose-500/25 rounded-2xl p-6 space-y-3.5">
                <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-rose-400 bg-rose-500/10 px-3 py-1 rounded-lg">
                  <XCircle className="w-4 h-4" />
                  Compras Tradicionais na Internet / Shopping
                </div>
                <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-400">
                  <li className="flex items-start gap-2.5">
                    <span className="text-rose-400 font-bold">✕</span>
                    <span>Fretes demorados de 7 a 15 dias úteis para chegar ao DF.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-rose-400 font-bold">✕</span>
                    <span>Vendedores de fora sem suporte rápido ou troca difícil pelos Correios.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-rose-400 font-bold">✕</span>
                    <span>Estacionamento pago, filas e preços inflacionados em lojas físicas.</span>
                  </li>
                </ul>
              </div>
            </MotionReveal>

            <MotionReveal delayMs={130}>
              <div className="h-full bg-gradient-to-br from-[#121212] to-[#0A0A0A] border-2 border-[#10B981]/60 rounded-2xl p-6 space-y-3.5 shadow-[0_0_35px_rgba(16,185,129,0.15)]">
                <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#0A0A0A] bg-[#10B981] px-3 py-1 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  A Experiência RR Store Brasília
                </div>
                <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-200">
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#34D399] font-black">✓</span>
                    <span>
                      <strong>Entrega Expressa no mesmo dia (45–90 min)</strong> via motoboy dedicado em todo o DF.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#34D399] font-black">✓</span>
                    <span>
                      <strong>5% OFF imediato no PIX</strong>, até 12x sem juros ou pagamento na maquininha ao receber.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#34D399] font-black">✓</span>
                    <span>
                      <strong>10 departamentos em um só lugar</strong> com garantia local e suporte direto no WhatsApp.
                    </span>
                  </li>
                </ul>
              </div>
            </MotionReveal>
          </div>

          {/* 2. SEÇÃO DE BENEFÍCIOS (Outcome-Driven Trust Badges) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {trustBadges.map((badge, index) => {
              const Icon = badge.icon;
              return (
                <MotionReveal key={index} delayMs={index * 65}>
                  <div className="motion-hover-lift h-full bg-[#121212] border border-white/10 hover:border-[#10B981]/60 rounded-2xl p-5 flex flex-col justify-between group">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#34D399] group-hover:bg-[#10B981] group-hover:text-[#0A0A0A] transition-colors">
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#34D399] bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                          {badge.highlight}
                        </span>
                      </div>

                      <h3 className="text-base font-extrabold text-white mb-2 leading-snug">
                        {badge.title}
                      </h3>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {badge.description}
                      </p>
                    </div>
                  </div>
                </MotionReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. COMO FUNCIONA EM 3 PASSOS (How It Works — Landing Page Skill) */}
      <section className="bg-[#121212] text-white py-14 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MotionReveal>
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#10B981]">
                Simples, Transparente e Sem Burocracia
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                Como funciona sua compra expressa em 3 passos
              </h2>
            </div>
          </MotionReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {howItWorksSteps.map((item, idx) => (
              <MotionReveal key={item.step} delayMs={idx * 75}>
                <div className="motion-hover-lift relative h-full bg-[#0A0A0A] border border-white/10 hover:border-[#10B981]/50 rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-amber-300">
                        Passo {item.step}
                      </span>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30 px-2.5 py-1 rounded-full">
                        {item.badge}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-extrabold text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </MotionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PROVA SOCIAL VERIFICADA DE CLIENTES DE BRASÍLIA */}
      <section className="bg-[#0A0A0A] text-white py-14 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MotionReveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <span className="inline-block text-xs font-extrabold uppercase tracking-wider text-[#34D399] mb-1">
                  Prova Social Verificada • Clientes do DF
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Quem compra em Brasília, recebe hoje e recomenda
                </h2>
              </div>
              <div className="inline-flex items-center gap-2 bg-[#121212] border border-white/10 px-4 py-2.5 rounded-2xl self-start">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-xs font-extrabold text-white">
                  4.9/5.0 de satisfação no DF (+3.400 entregas)
                </span>
              </div>
            </div>
          </MotionReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((item, idx) => (
              <MotionReveal key={item.id} delayMs={idx * 75}>
                <div className="motion-hover-lift h-full bg-[#121212] border border-white/10 hover:border-[#10B981]/50 rounded-2xl p-6 flex flex-col justify-between shadow-lg">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(item.avaliacao)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 fill-amber-400 text-amber-400"
                          />
                        ))}
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#34D399] bg-[#10B981]/15 border border-[#10B981]/30 px-2.5 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" />
                        {item.tempoEntrega}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed italic mb-5">
                      &ldquo;{item.comentario}&rdquo;
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] text-[#0A0A0A] font-black text-xs flex items-center justify-center">
                          {item.avatarIniciais}
                        </div>
                        <div>
                          <p className="text-sm font-extrabold text-white flex items-center gap-1.5">
                            {item.nome}
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                          </p>
                          <p className="text-[11px] text-zinc-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#10B981]" />
                            {item.regiao}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] text-zinc-500">{item.data}</span>
                    </div>

                    <div className="mt-3 bg-[#0A0A0A] rounded-lg px-3 py-1.5 text-[11px] text-zinc-400 truncate">
                      Comprou: <strong className="text-zinc-200">{item.produtoComprado}</strong>
                    </div>
                  </div>
                </div>
              </MotionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FAQ ESTRATÉGICO DE QUEBRA DE OBJEÇÕES (8 Q/As + AEO Ready) */}
      <section id="perguntas-frequentes" className="bg-[#121212] text-white py-14 border-t border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <MotionReveal>
            <div className="text-center mb-10">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#34D399]">
                Tire Suas Dúvidas • Transparência Total
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                Perguntas Frequentes sobre Entrega e Pagamento no DF
              </h2>
            </div>
          </MotionReveal>

          <div className="space-y-3">
            {FAQ_ITEMS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <MotionReveal key={index} delayMs={index * 40}>
                  <div
                    className={`rounded-2xl border transition-colors ${
                      isOpen
                        ? 'bg-[#0A0A0A] border-[#10B981]/60'
                        : 'bg-[#0A0A0A]/70 border-white/10 hover:border-white/25'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left cursor-pointer"
                      aria-expanded={isOpen}
                    >
                      <span className="text-xs sm:text-sm font-extrabold text-white">
                        {faq.q}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#34D399] shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-white/5">
                        {faq.a}
                      </div>
                    )}
                  </div>
                </MotionReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. INVERSÃO DE RISCO + FINAL CTA SECTION (Landing Page Skill) */}
      <section className="bg-[#0A0A0A] text-white py-14 border-t border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <MotionReveal>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121212] via-[#0A0A0A] to-[#10B981]/15 border-2 border-[#10B981]/50 p-7 sm:p-10 text-center shadow-[0_20px_60px_rgba(16,185,129,0.18)]">
              <div className="inline-flex items-center gap-2 bg-[#10B981]/15 border border-[#10B981]/40 text-[#34D399] text-xs font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full mb-4">
                <ShieldCheck className="w-4 h-4" />
                Garantia Blindada RR Store • Risco Zero no DF
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight max-w-2xl mx-auto">
                Receba seu pedido hoje mesmo em{' '}
                <span className="text-[#34D399]">
                  {selectedRegion ? selectedRegion.nome : 'Brasília e Região'}
                </span>
              </h2>

              <p className="text-xs sm:text-base text-zinc-300 max-w-2xl mx-auto mt-3 leading-relaxed">
                Aproveite <strong className="text-[#34D399]">5% OFF imediato no PIX</strong>, parcele em até{' '}
                <strong className="text-white">12x no Cartão</strong> ou pague somente na entrega direto na
                maquininha do nosso motoboy. Frete grátis em compras acima de{' '}
                <strong className="text-white">
                  {selectedRegion ? formatBRL(selectedRegion.freteGratisAcimaDe) : 'R$ 199,00'}
                </strong>
                .
              </p>

              <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5">
                <button
                  type="button"
                  onClick={onExploreClick}
                  className="motion-hover-lift inline-flex items-center justify-center gap-2.5 bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] font-black text-sm sm:text-base px-8 py-4 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.45)] cursor-pointer"
                >
                  <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
                  <span>Escolher Produtos com Entrega Hoje</span>
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </button>

                <a
                  href={buildConsultantWhatsAppUrl(selectedRegion?.nome)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="motion-hover-lift inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/20 font-bold text-sm sm:text-base px-6 py-4 rounded-2xl"
                >
                  <MessageCircle className="w-5 h-5 text-[#34D399]" />
                  <span>Tirar Dúvida no WhatsApp</span>
                </a>
              </div>

              <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-[#34D399]" /> Despacho em 30 min
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#34D399]" /> 7 Dias Troca Fácil em BSB
                </span>
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#34D399]" /> Motoboy Rastreável via WhatsApp
                </span>
              </div>
            </div>
          </MotionReveal>
        </div>
      </section>
    </>
  );
}
