'use client';

import React from 'react';
import {
  MessageCircle,
  MapPin,
  Clock,
  ShieldCheck,
  QrCode,
  CreditCard,
  PhoneCall,
  ChevronRight,
} from 'lucide-react';
import { CategoryId, DFRegion } from '../types/store';
import { CATEGORIES, DF_REGIONS } from '../data/mockData';
import { buildConsultantWhatsAppUrl } from '../data/whatsappUtils';
import InteractiveLogo3D from './InteractiveLogo3D';

interface FooterAndFloatingWhatsAppProps {
  selectedRegion: DFRegion;
  onSelectCategory: (cat: CategoryId) => void;
}

export default function FooterAndFloatingWhatsApp({
  selectedRegion,
  onSelectCategory,
}: FooterAndFloatingWhatsAppProps) {
  const nicheCategories = CATEGORIES.filter((c) => c.id !== 'Todos');

  const handleCategoryClick = (catId: CategoryId) => {
    onSelectCategory(catId);
    const el = document.getElementById('catalogo-produtos');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Footer Completo Dark Tech (#0A0A0A) */}
      <footer className="bg-[#0A0A0A] text-white border-t border-white/10 pt-14 pb-24 sm:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10">
            {/* Coluna 1: Sobre a RR Store Brasília */}
            <div className="lg:col-span-4 space-y-4">
              <InteractiveLogo3D
                variant="footer"
                onClickHeader={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              />

              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Sua loja multidepartamentos online em Brasília-DF. Curadoria completa com entrega
                expressa via motoboy no mesmo dia, atendimento direto pelo WhatsApp e pagamento
                facilitado no PIX ou Cartão.
              </p>

              <div className="space-y-2 pt-1 text-xs text-zinc-300">
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Horário de Funcionamento e Despacho:</strong>
                    <span>Segunda a Sábado: 08h30 às 20h00 | Domingos: Plantão Express</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Área de Cobertura Motoboy:</strong>
                    <span>
                      Plano Piloto, Águas Claras, Taguatinga, Sudoeste, Guará, Lagos, Noroeste e todo o DF
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <PhoneCall className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>Central WhatsApp Brasília: (61) 99999-9999</span>
                </div>
              </div>
            </div>

            {/* Coluna 2 e 3: Links Rápidos para as 10 Categorias */}
            <div className="lg:col-span-5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#34D399] mb-4">
                Os 10 Departamentos RR Store
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {nicheCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-[#34D399] py-1 transition-colors text-left group cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-[#10B981] group-hover:translate-x-0.5 transition-transform shrink-0" />
                    <span className="truncate">{cat.nome}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Coluna 4: Selos de Pagamento & Segurança */}
            <div className="lg:col-span-3 space-y-5">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#34D399] mb-3">
                  Formas de Pagamento Aceitas
                </h3>

                {/* Selos Visuais: PIX Oficial + Bandeiras de Cartão */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-3 bg-[#121212] border border-[#10B981]/40 rounded-xl p-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#10B981] text-[#0A0A0A] flex items-center justify-center font-black">
                        <QrCode className="w-4 h-4" />
                      </div>
                      <div className="leading-tight">
                        <span className="text-xs font-black text-white block">PIX Oficial</span>
                        <span className="text-[10px] text-[#34D399] font-bold">
                          5% de Desconto Imediato
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold bg-[#10B981]/20 text-[#34D399] px-2 py-0.5 rounded">
                      Banco Central
                    </span>
                  </div>

                  {['VISA', 'MASTERCARD', 'ELO', 'HIPERCARD', 'AMEX', 'DÉBITO'].map((brand) => (
                    <div
                      key={brand}
                      className="bg-[#121212] border border-white/10 rounded-lg py-2 px-2 text-center flex items-center justify-center gap-1"
                    >
                      <CreditCard className="w-3 h-3 text-zinc-400 shrink-0" />
                      <span className="text-[10px] font-black tracking-wider text-zinc-200">
                        {brand}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#121212] border border-white/10 rounded-xl p-3.5 flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-[#10B981] shrink-0" />
                <div className="text-[11px] text-zinc-400 leading-snug">
                  <strong className="text-white block">Ambiente 100% Seguro</strong>
                  Checkout híbrido integrado ao WhatsApp Oficial e maquininha presencial no DF.
                </div>
              </div>
            </div>
          </div>

          {/* Faixa de Regiões Atendidas */}
          <div className="py-5 border-b border-white/10 text-[11px] text-zinc-500 flex flex-wrap items-center gap-x-2 gap-y-1">
            <strong className="text-zinc-300">Entregas no mesmo dia em:</strong>
            {DF_REGIONS.map((reg, i) => (
              <span key={reg.id}>
                {reg.nome}
                {i < DF_REGIONS.length - 1 ? ' • ' : ''}
              </span>
            ))}
          </div>

          {/* Direitos Reservados */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
            <p>
              © {new Date().getFullYear()} <strong className="text-white">RR Store - Brasília/DF</strong>. Todos os
              direitos reservados.
            </p>
            <p className="text-[11px] text-zinc-400">
              Desenvolvido com foco em Alta Conversão • Dark Tech &amp; Modern Retail
            </p>
          </div>
        </div>
      </footer>

      {/* Botão Flutuante de WhatsApp no Canto Inferior Direito (Visível em Tablets/Desktop; no celular fica integrado na MobileBottomBar) */}
      <div className="hidden md:flex fixed bottom-5 right-5 z-40 items-center gap-2.5">
        <a
          href={buildConsultantWhatsAppUrl(selectedRegion.nome)}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center gap-2.5 bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] font-black px-4 py-3.5 rounded-full shadow-[0_10px_30px_rgba(16,185,129,0.5)] hover:shadow-[0_12px_36px_rgba(52,211,153,0.75)] transition-all duration-300 hover:scale-105"
          aria-label="Falar no WhatsApp da RR Store"
        >
          {/* Anel de Pulse Verde */}
          <span className="absolute -inset-1 rounded-full bg-[#34D399] opacity-35 animate-ping pointer-events-none" />
          <MessageCircle className="w-6 h-6 fill-[#0A0A0A] text-[#10B981] relative z-10" />
          <span className="text-xs sm:text-sm tracking-tight relative z-10">
            Dúvidas? WhatsApp DF
          </span>
        </a>
      </div>
    </>
  );
}
