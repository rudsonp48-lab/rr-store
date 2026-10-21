'use client';

import React from 'react';
import { MapPin, Navigation, MessageCircle, PhoneCall, Clock, Store } from 'lucide-react';
import { STORE_ADDRESS, WHATSAPP_NUMBER, WHATSAPP_NUMBER_SECONDARY } from '../data/mockData';
import MotionReveal from './MotionReveal';

const MAP_QUERY = 'Feira dos Importados de Brasília, SIA Trecho 7, Loja D439, Brasília - DF';
const MAP_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&z=17&output=embed`;
const MAP_ROUTE_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(MAP_QUERY)}`;

function formatPhone(num: string): string {
  // 5561998151299 -> (61) 99815-1299
  const local = num.replace(/^55/, '');
  return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`;
}

const CONTACTS = [
  { number: WHATSAPP_NUMBER, label: 'Atendimento 1' },
  { number: WHATSAPP_NUMBER_SECONDARY, label: 'Atendimento 2' },
];

export default function StoreLocationSection() {
  const waMessage = encodeURIComponent(
    'Olá! Vi o site da RR Store e gostaria de mais informações sobre a loja na Feira dos Importados (Loja D439).'
  );

  return (
    <section
      id="loja-fisica"
      className="relative overflow-hidden bg-[#0A0A0A] text-white py-16 border-t border-white/10"
    >
      {/* Glow atmosférico */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full bg-[#10B981]/15 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-[420px] h-[420px] rounded-full bg-amber-500/10 blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MotionReveal>
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#34D399] bg-[#10B981]/10 border border-[#10B981]/30 px-3.5 py-1 rounded-full mb-3">
              <Store className="w-3.5 h-3.5" />
              Loja Física em Brasília
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
              Visite nossa loja na <span className="text-[#34D399]">Feira dos Importados</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2.5 leading-relaxed">
              Venha conhecer os produtos pessoalmente, testar seu novo aparelho e retirar seu pedido na
              hora. Estamos na <strong className="text-white">Loja D439</strong> da Feira dos Importados do SIA.
            </p>
          </div>
        </MotionReveal>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
          {/* Mapa */}
          <MotionReveal delayMs={60} className="lg:col-span-3">
            <div className="h-full min-h-[320px] sm:min-h-[420px] rounded-3xl overflow-hidden border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] bg-[#121212]">
              <iframe
                title="Mapa - RR Store, Feira dos Importados do SIA, Loja D439"
                src={MAP_EMBED_URL}
                className="w-full h-full min-h-[320px] sm:min-h-[420px] border-0"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </MotionReveal>

          {/* Informações */}
          <MotionReveal delayMs={130} className="lg:col-span-2">
            <div className="h-full flex flex-col gap-4">
              <div className="bg-[#121212] border border-[#10B981]/40 rounded-3xl p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#10B981] text-[#0A0A0A] flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#34D399]">
                      Endereço
                    </p>
                    <p className="text-sm sm:text-base font-extrabold text-white leading-snug">
                      Feira dos Importados do SIA — Loja D439
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5">{STORE_ADDRESS}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 text-[#34D399] flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#34D399]">
                      Horário
                    </p>
                    <p className="text-xs text-zinc-300">
                      Conforme funcionamento da Feira dos Importados. Confirme pelo WhatsApp antes da visita.
                    </p>
                  </div>
                </div>

                <a
                  href={MAP_ROUTE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="motion-hover-lift w-full inline-flex items-center justify-center gap-2 bg-white text-[#0A0A0A] font-black text-sm px-5 py-3.5 rounded-2xl"
                >
                  <Navigation className="w-4 h-4" />
                  Traçar rota no Google Maps
                </a>
              </div>

              <div className="bg-[#121212] border border-white/10 rounded-3xl p-6 space-y-3 flex-1">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#34D399]">
                  Contato / WhatsApp
                </p>
                {CONTACTS.map((c) => (
                  <div
                    key={c.number}
                    className="flex items-center justify-between gap-3 bg-[#0A0A0A] border border-white/10 rounded-2xl p-3"
                  >
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase font-bold">{c.label}</p>
                      <p className="text-base font-black text-white tracking-tight">
                        {formatPhone(c.number)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:+${c.number}`}
                        aria-label={`Ligar para ${formatPhone(c.number)}`}
                        className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 flex items-center justify-center text-white transition-colors"
                      >
                        <PhoneCall className="w-4 h-4" />
                      </a>
                      <a
                        href={`https://wa.me/${c.number}?text=${waMessage}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`WhatsApp ${formatPhone(c.number)}`}
                        className="w-10 h-10 rounded-xl bg-[#10B981] hover:bg-[#059669] flex items-center justify-center text-[#0A0A0A] transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </MotionReveal>
        </div>
      </div>
    </section>
  );
}
