'use client';

import React from 'react';
import {
  Truck,
  ShieldCheck,
  Award,
  MessageCircle,
  Star,
  MapPin,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { TESTIMONIALS } from '../data/mockData';

export default function TrustAndTestimonials() {
  const trustBadges = [
    {
      icon: Truck,
      title: 'Entrega Expressa em Brasília e Entorno',
      description:
        'Frota própria e parceiros motoboys dedicados para entregas no mesmo dia no Plano Piloto, Águas Claras, Taguatinga, Sudoeste, Lagos e todo o DF.',
      highlight: 'Despacho Imediato',
    },
    {
      icon: ShieldCheck,
      title: 'Pagamento 100% Seguro (Pix, Crédito e Débito)',
      description:
        'Aproveite 5% OFF imediato no PIX, parcele em até 12x no cartão ou pague direto na maquininha presencial no ato da entrega.',
      highlight: 'Flexibilidade Total',
    },
    {
      icon: Award,
      title: 'Produtos Selecionados com Garantia RR Store',
      description:
        'Curadoria rigorosa nos 10 departamentos da loja. Todos os itens passam por inspeção de qualidade antes do envio.',
      highlight: 'Garantia Oficial',
    },
    {
      icon: MessageCircle,
      title: 'Atendimento Humanizado via WhatsApp',
      description:
        'Sem robôs travados: fale diretamente com consultores de Brasília para tirar dúvidas, ver fotos reais e acompanhar seu motoboy.',
      highlight: 'Suporte Rápido BSB',
    },
  ];

  return (
    <>
      {/* Seção de Benefícios (Trust Badges) */}
      <section className="bg-[#0A0A0A] text-white py-14 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-block text-xs font-extrabold uppercase tracking-wider text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/30 px-3 py-1 rounded-full mb-2">
              Por que comprar na RR Store?
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              A Experiência de Compra Mais Rápida de Brasília
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2">
              Unimos a conveniência do e-commerce moderno à velocidade da entrega local no Distrito Federal.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {trustBadges.map((badge, index) => {
              const Icon = badge.icon;
              return (
                <div
                  key={index}
                  className="bg-[#121212] border border-white/10 hover:border-[#10B981]/60 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group"
                >
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
              );
            })}
          </div>
        </div>
      </section>

      {/* Seção de Depoimentos (Prova Social de Clientes de Brasília) */}
      <section className="bg-[#121212] text-white py-14 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="inline-block text-xs font-extrabold uppercase tracking-wider text-[#34D399] mb-1">
                Prova Social Verificada • Clientes do DF
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Quem compra em Brasília, recebe hoje e recomenda
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 bg-[#0A0A0A] border border-white/10 px-4 py-2.5 rounded-2xl self-start">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs font-extrabold text-white">
                4.9/5.0 de satisfação no DF
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((item) => (
              <div
                key={item.id}
                className="bg-[#0A0A0A] border border-white/10 hover:border-[#10B981]/50 rounded-2xl p-6 flex flex-col justify-between shadow-lg transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(item.avaliacao)].map((_, idx) => (
                        <Star
                          key={idx}
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

                  <div className="mt-3 bg-[#121212] rounded-lg px-3 py-1.5 text-[11px] text-zinc-400 truncate">
                    Comprou: <strong className="text-zinc-200">{item.produtoComprado}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
