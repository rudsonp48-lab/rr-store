'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  MapPin,
  QrCode,
  CreditCard,
  Copy,
  Check,
  MessageCircle,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  AlertCircle,
  Wallet,
} from 'lucide-react';
import {
  CardPaymentMode,
  CartItem,
  CustomerCheckoutData,
  DFRegion,
  PaymentMethod,
} from '../types/store';
import { DF_REGIONS, formatBRL } from '../data/mockData';
import {
  buildCheckoutWhatsAppUrl,
  generateOrderCode,
  generateSimulatedPixPayload,
} from '../data/whatsappUtils';
import { saveOrderToFirebase } from '../lib/firebase';

interface CartAndCheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  selectedRegion: DFRegion;
  onSelectRegion: (region: DFRegion) => void;
}

export default function CartAndCheckoutDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  selectedRegion,
  onSelectRegion,
}: CartAndCheckoutDrawerProps) {
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [orderCode, setOrderCode] = useState<string>('#RR-8492');
  const [copiedPix, setCopiedPix] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [customer, setCustomer] = useState<CustomerCheckoutData>({
    nomeCompleto: '',
    whatsapp: '',
    regiaoId: selectedRegion.id,
    cep: '',
    enderecoCompleto: '',
    complemento: '',
    observacoes: '',
    metodoPagamento: 'pix',
    parcelasCredito: 3,
    modoCartao: 'maquininha_entrega',
    numeroCartaoSimulado: '',
    nomeImpressoCartao: '',
    validadeCartao: '',
    cvvCartao: '',
  });

  // Sync selectedRegion with form
  useEffect(() => {
    setCustomer((prev) => ({ ...prev, regiaoId: selectedRegion.id }));
  }, [selectedRegion.id]);

  // Generate fresh order code when entering checkout
  useEffect(() => {
    if (isOpen && step === 'checkout') {
      setOrderCode(generateOrderCode());
    }
  }, [isOpen, step]);

  // Calculations
  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + item.product.precoPor * item.quantity, 0);
  }, [items]);

  const pixDiscount = useMemo(() => {
    return Number((subtotal * 0.05).toFixed(2));
  }, [subtotal]);

  const isFreeShipping = subtotal >= selectedRegion.freteGratisAcimaDe && items.length > 0;
  const shippingCost = items.length === 0 ? 0 : isFreeShipping ? 0 : selectedRegion.taxaEntrega;

  const finalTotal = useMemo(() => {
    if (items.length === 0) return 0;
    const discountedProducts =
      customer.metodoPagamento === 'pix' ? subtotal - pixDiscount : subtotal;
    return Number((discountedProducts + shippingCost).toFixed(2));
  }, [items.length, customer.metodoPagamento, subtotal, pixDiscount, shippingCost]);

  const missingForFreeShipping = Math.max(0, selectedRegion.freteGratisAcimaDe - subtotal);
  const freeShippingProgress = Math.min(
    100,
    Math.round((subtotal / selectedRegion.freteGratisAcimaDe) * 100)
  );

  const pixPayload = useMemo(
    () => generateSimulatedPixPayload(orderCode, finalTotal),
    [orderCode, finalTotal]
  );

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(pixPayload);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 2500);
    } catch {
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 2500);
    }
  };

  const handleRegionSelectChange = (regionId: string) => {
    const found = DF_REGIONS.find((r) => r.id === regionId);
    if (found) {
      onSelectRegion(found);
      setCustomer((prev) => ({ ...prev, regiaoId: found.id }));
    }
  };

  const handleFinishOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!customer.nomeCompleto.trim() || customer.nomeCompleto.trim().length < 3) {
      setFormError('Por favor, informe seu Nome Completo para identificação na entrega.');
      return;
    }
    if (!customer.whatsapp.trim() || customer.whatsapp.replace(/\D/g, '').length < 10) {
      setFormError('Por favor, informe um telefone/WhatsApp válido com DDD (ex: 61 99999-9999).');
      return;
    }
    if (!customer.enderecoCompleto.trim() || customer.enderecoCompleto.trim().length < 6) {
      setFormError(
        'Por favor, preencha o endereço completo de entrega (Quadra/Rua, Bloco/Lote, Casa/Apto).'
      );
      return;
    }

    // Salva pedido no Firebase Firestore em segundo plano (Zero latência no redirecionamento)
    void saveOrderToFirebase({
      orderCode,
      customer,
      region: selectedRegion,
      items: items.map((i) => ({
        id: i.product.id,
        nome: i.product.nome,
        categoria: i.product.categoria,
        quantity: i.quantity,
        precoUnitario:
          customer.metodoPagamento === 'pix' ? i.product.precoPix : i.product.precoPor,
      })),
      subtotal,
      pixDiscount,
      shippingCost,
      finalTotal,
    });

    const whatsappUrl = buildCheckoutWhatsAppUrl({
      orderCode,
      items,
      customer,
      region: selectedRegion,
      subtotal,
      pixDiscount,
      shippingCost,
      finalTotal,
    });

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setStep('success');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-xl bg-[#0A0A0A] text-white border-l border-white/15 shadow-2xl flex flex-col justify-between">
          {/* Header do Drawer */}
          <div className="p-4 sm:p-5 bg-[#121212] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {step === 'checkout' && (
                <button
                  onClick={() => {
                    setFormError(null);
                    setStep('cart');
                  }}
                  className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
                  title="Voltar para sacola"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <div className="w-9 h-9 rounded-xl bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center text-[#34D399]">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-white leading-tight">
                  {step === 'cart' && 'Seu Carrinho RR Store'}
                  {step === 'checkout' && `Finalizar Pedido ${orderCode}`}
                  {step === 'success' && `Pedido ${orderCode} Gerado!`}
                </h2>
                <p className="text-xs text-zinc-400">
                  {step === 'cart' && 'Entrega Expressa via Motoboy em Brasília/DF'}
                  {step === 'checkout' && 'Checkout Híbrido Rápido & Seguro'}
                  {step === 'success' && 'Enviado para nosso atendimento no WhatsApp'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              aria-label="Fechar carrinho"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Barra de Progresso de Frete Grátis no DF */}
          {items.length > 0 && step !== 'success' && (
            <div className="bg-[#121212]/90 px-4 sm:px-5 py-2.5 border-b border-white/10">
              <div className="flex items-center justify-between text-xs mb-1.5">
                {isFreeShipping ? (
                  <span className="font-extrabold text-[#34D399] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    Parabéns! Você ganhou Frete Grátis via Motoboy em {selectedRegion.nome}!
                  </span>
                ) : (
                  <span className="text-zinc-300">
                    Faltam <strong className="text-[#34D399]">{formatBRL(missingForFreeShipping)}</strong> para{' '}
                    <strong className="text-white">Frete Grátis</strong> em {selectedRegion.nome}
                  </span>
                )}
                <span className="text-[11px] font-bold text-zinc-400">{freeShippingProgress}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#059669] to-[#34D399] transition-all duration-300"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Conteúdo Central Rolável */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-14 px-4">
                <div className="w-16 h-16 rounded-2xl bg-[#121212] border border-white/10 flex items-center justify-center text-zinc-500 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-extrabold text-white mb-1">
                  Seu carrinho está vazio
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-xs mb-6">
                  Adicione produtos dos nossos 10 departamentos e receba hoje mesmo em Brasília e região!
                </p>
                <button
                  onClick={onClose}
                  className="bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] font-black text-sm px-6 py-3 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
                >
                  Explorar Produtos da Loja
                </button>
              </div>
            ) : step === 'cart' ? (
              <>
                {/* Lista de Produtos no Carrinho */}
                <div className="space-y-3">
                  {items.map(({ product, quantity }) => (
                    <div
                      key={product.id}
                      className="flex gap-3.5 bg-[#121212] border border-white/10 rounded-2xl p-3.5 hover:border-white/20 transition-all"
                    >
                      <img
                        src={product.imagem}
                        alt={product.nome}
                        className="w-20 h-20 rounded-xl object-cover bg-zinc-900 shrink-0"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug">
                              {product.nome}
                            </h4>
                            <button
                              onClick={() => onRemoveItem(product.id)}
                              className="text-zinc-500 hover:text-rose-400 p-1 rounded-lg transition-colors shrink-0"
                              title="Remover item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <span className="text-[11px] text-zinc-400 block mt-0.5">
                            {product.categoria}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/10">
                          {/* Controle de Quantidade + e - */}
                          <div className="inline-flex items-center bg-[#0A0A0A] border border-white/15 rounded-xl p-0.5">
                            <button
                              onClick={() => onUpdateQuantity(product.id, -1)}
                              className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
                              aria-label="Diminuir quantidade"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3 text-xs font-extrabold text-white">
                              {quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(product.id, 1)}
                              className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
                              aria-label="Aumentar quantidade"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="text-right">
                            <span className="text-xs sm:text-sm font-black text-[#34D399] block">
                              {formatBRL(product.precoPix * quantity)} no PIX
                            </span>
                            <span className="text-[11px] text-zinc-400">
                              ou {formatBRL(product.precoPor * quantity)} cartão
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Simulador de Região Administrativa do DF no Carrinho */}
                <div className="bg-[#121212] border border-white/10 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#10B981]" />
                      Região Administrativa de Entrega (DF)
                    </label>
                    <span className="text-[11px] text-[#34D399] font-semibold">
                      Motoboy no Mesmo Dia
                    </span>
                  </div>

                  <select
                    value={selectedRegion.id}
                    onChange={(e) => handleRegionSelectChange(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white font-semibold focus:outline-none focus:border-[#10B981]"
                  >
                    {DF_REGIONS.map((reg) => (
                      <option key={reg.id} value={reg.id}>
                        {reg.nome} — {formatBRL(reg.taxaEntrega)} ({reg.tempoEstimado})
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-[#10B981]" />
                      Prazo: <strong className="text-white">{selectedRegion.tempoEstimado}</strong>
                    </span>
                    <span className="font-bold text-[#34D399]">
                      {isFreeShipping ? 'FRETE GRÁTIS' : formatBRL(shippingCost)}
                    </span>
                  </div>
                </div>
              </>
            ) : step === 'checkout' ? (
              <form id="rr-checkout-form" onSubmit={handleFinishOrder} className="space-y-5">
                {formError && (
                  <div className="bg-rose-500/15 border border-rose-500/40 text-rose-200 rounded-xl p-3.5 text-xs font-semibold flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* 1. Dados do Cliente e Endereço de Entrega em Brasília/DF */}
                <div className="bg-[#121212] border border-white/10 rounded-2xl p-4 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#34D399] flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#10B981] text-[#0A0A0A] text-xs font-black flex items-center justify-center">
                        1
                      </span>
                      Dados para Entrega Expressa (DF)
                    </h3>
                    <span className="text-[11px] text-zinc-400">Campos obrigatórios *</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-zinc-300 mb-1">
                        Nome Completo *
                      </label>
                      <input
                        type="text"
                        required
                        autoComplete="name"
                        value={customer.nomeCompleto}
                        onChange={(e) =>
                          setCustomer({ ...customer, nomeCompleto: e.target.value })
                        }
                        placeholder="Ex: Gabriel Rodrigues"
                        className="w-full bg-[#0A0A0A] border border-white/15 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#10B981]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1">
                        Telefone / WhatsApp com DDD *
                      </label>
                      <input
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        required
                        value={customer.whatsapp}
                        onChange={(e) =>
                          setCustomer({ ...customer, whatsapp: e.target.value })
                        }
                        placeholder="(61) 99999-9999"
                        className="w-full bg-[#0A0A0A] border border-white/15 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#10B981]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1">
                        CEP (Brasília / DF)
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="postal-code"
                        value={customer.cep}
                        onChange={(e) => setCustomer({ ...customer, cep: e.target.value })}
                        placeholder="Ex: 70200-000"
                        className="w-full bg-[#0A0A0A] border border-white/15 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#10B981]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-zinc-300 mb-1">
                        Região Administrativa do DF *
                      </label>
                      <select
                        value={selectedRegion.id}
                        onChange={(e) => handleRegionSelectChange(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-white/15 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-white font-semibold focus:outline-none focus:border-[#10B981]"
                      >
                        {DF_REGIONS.map((reg) => (
                          <option key={reg.id} value={reg.id}>
                            {reg.nome} — Taxa: {isFreeShipping ? 'GRÁTIS' : formatBRL(reg.taxaEntrega)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-zinc-300 mb-1">
                        Endereço Completo (Quadra/Rua, Bloco/Conjunto, Casa/Apto) *
                      </label>
                      <input
                        type="text"
                        autoComplete="street-address"
                        required
                        value={customer.enderecoCompleto}
                        onChange={(e) =>
                          setCustomer({ ...customer, enderecoCompleto: e.target.value })
                        }
                        placeholder="Ex: SQS 308 Bloco D Apto 402 (ou Rua 14 Norte Lote 5)"
                        className="w-full bg-[#0A0A0A] border border-white/15 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#10B981]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-zinc-300 mb-1">
                        Ponto de Referência / Instruções para o Motoboy (Opcional)
                      </label>
                      <input
                        type="text"
                        value={customer.complemento}
                        onChange={(e) =>
                          setCustomer({ ...customer, complemento: e.target.value })
                        }
                        placeholder="Ex: Deixar na portaria ou interfonar ao chegar"
                        className="w-full bg-[#0A0A0A] border border-white/15 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#10B981]"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Escolha da Forma de Pagamento (Abas Interativas) */}
                <div className="bg-[#121212] border border-white/10 rounded-2xl p-4 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#34D399] flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#10B981] text-[#0A0A0A] text-xs font-black flex items-center justify-center">
                        2
                      </span>
                      Escolha a Forma de Pagamento
                    </h3>
                    <span className="text-[11px] font-bold text-[#34D399]">
                      100% Seguro
                    </span>
                  </div>

                  {/* Abas: PIX / Crédito / Débito */}
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        {
                          id: 'pix',
                          title: 'PIX',
                          subtitle: '5% OFF Imediato',
                          icon: QrCode,
                        },
                        {
                          id: 'credito',
                          title: 'Crédito',
                          subtitle: 'Em até 12x',
                          icon: CreditCard,
                        },
                        {
                          id: 'debito',
                          title: 'Débito',
                          subtitle: 'À vista',
                          icon: Wallet,
                        },
                      ] as const
                    ).map((tab) => {
                      const Icon = tab.icon;
                      const active = customer.metodoPagamento === tab.id;
                      return (
                        <button
                          type="button"
                          key={tab.id}
                          onClick={() =>
                            setCustomer({
                              ...customer,
                              metodoPagamento: tab.id as PaymentMethod,
                            })
                          }
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            active
                              ? 'bg-[#10B981]/20 border-[#10B981] text-white shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                              : 'bg-[#0A0A0A] border-white/10 hover:border-white/25 text-zinc-400'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <Icon
                              className={`w-4 h-4 ${
                                active ? 'text-[#34D399]' : 'text-zinc-400'
                              }`}
                            />
                            {tab.id === 'pix' && (
                              <span className="text-[9px] font-black uppercase bg-[#10B981] text-[#0A0A0A] px-1.5 py-0.5 rounded">
                                -5%
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-extrabold text-white">{tab.title}</p>
                          <p className="text-[10px] text-zinc-400">{tab.subtitle}</p>
                        </button>
                      );
                    })}
                  </div>

                  {/* Conteúdo da Aba Selecionada */}
                  {customer.metodoPagamento === 'pix' && (
                    <div className="bg-[#0A0A0A] border border-[#10B981]/40 rounded-xl p-4 space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase text-[#0A0A0A] bg-[#34D399] px-2 py-0.5 rounded-md">
                            Aprovação Imediata • 5% OFF Aplicado
                          </span>
                          <p className="text-xs text-zinc-300 mt-1">
                            Você está economizando{' '}
                            <strong className="text-[#34D399]">{formatBRL(pixDiscount)}</strong> neste pedido!
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] text-zinc-400 block">Total no PIX</span>
                          <span className="text-lg font-black text-[#34D399]">
                            {formatBRL(finalTotal)}
                          </span>
                        </div>
                      </div>

                      {/* Simulação de QR Code Dinâmico + Código Copia e Cola */}
                      <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#121212] p-3.5 rounded-xl border border-white/10">
                        <div className="w-32 h-32 bg-white p-2 rounded-xl shrink-0 flex flex-col items-center justify-center shadow-md">
                          {/* QR Code visual estilizado em SVG */}
                          <svg
                            viewBox="0 0 100 100"
                            className="w-full h-full text-[#0A0A0A]"
                            fill="currentColor"
                          >
                            <rect x="5" y="5" width="28" height="28" rx="3" fill="none" stroke="currentColor" strokeWidth="6" />
                            <rect x="13" y="13" width="12" height="12" rx="1" />
                            <rect x="67" y="5" width="28" height="28" rx="3" fill="none" stroke="currentColor" strokeWidth="6" />
                            <rect x="75" y="13" width="12" height="12" rx="1" />
                            <rect x="5" y="67" width="28" height="28" rx="3" fill="none" stroke="currentColor" strokeWidth="6" />
                            <rect x="13" y="75" width="12" height="12" rx="1" />
                            <rect x="40" y="8" width="6" height="6" />
                            <rect x="52" y="8" width="6" height="12" />
                            <rect x="40" y="20" width="12" height="6" />
                            <rect x="40" y="34" width="8" height="8" />
                            <rect x="54" y="34" width="8" height="8" />
                            <rect x="8" y="42" width="12" height="6" />
                            <rect x="26" y="42" width="8" height="14" />
                            <rect x="42" y="46" width="16" height="16" rx="2" fill="#10B981" />
                            <rect x="66" y="42" width="8" height="8" />
                            <rect x="80" y="42" width="14" height="6" />
                            <rect x="66" y="56" width="14" height="6" />
                            <rect x="86" y="54" width="8" height="14" />
                            <rect x="40" y="68" width="6" height="12" />
                            <rect x="52" y="68" width="14" height="6" />
                            <rect x="72" y="70" width="8" height="14" />
                            <rect x="86" y="74" width="8" height="8" />
                            <rect x="40" y="86" width="18" height="8" />
                            <rect x="64" y="88" width="14" height="6" />
                            <rect x="84" y="88" width="10" height="6" />
                          </svg>
                        </div>

                        <div className="flex-1 w-full space-y-2">
                          <p className="text-xs font-bold text-white">
                            QR Code PIX Dinâmico ({orderCode})
                          </p>
                          <p className="text-[11px] text-zinc-400 leading-relaxed">
                            Escaneie pelo app do seu banco ou copie o código abaixo. Ao finalizar, o comprovante segue junto no WhatsApp para liberação imediata do motoboy.
                          </p>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              readOnly
                              value={pixPayload}
                              className="flex-1 bg-[#0A0A0A] border border-white/15 rounded-lg px-2.5 py-2 text-[11px] text-zinc-400 font-mono truncate"
                            />
                            <button
                              type="button"
                              onClick={handleCopyPix}
                              className="inline-flex items-center gap-1.5 bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] font-extrabold text-xs px-3 py-2 rounded-lg transition-colors shrink-0 cursor-pointer"
                            >
                              {copiedPix ? (
                                <>
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  <span>Copiado!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copiar Pix</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {customer.metodoPagamento === 'credito' && (
                    <div className="bg-[#0A0A0A] border border-white/15 rounded-xl p-4 space-y-3.5">
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                          Número de Parcelas (Até 12x Sem Juros)
                        </label>
                        <select
                          value={customer.parcelasCredito}
                          onChange={(e) =>
                            setCustomer({
                              ...customer,
                              parcelasCredito: Number(e.target.value),
                            })
                          }
                          className="w-full bg-[#121212] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-[#10B981]"
                        >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((parcela) => (
                            <option key={parcela} value={parcela}>
                              {parcela}x de {formatBRL(finalTotal / parcela)} sem juros (Total:{' '}
                              {formatBRL(finalTotal)})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                          Como prefere realizar o pagamento no cartão?
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {(
                            [
                              {
                                id: 'maquininha_entrega',
                                label: 'Passar na Maquininha na Entrega',
                                desc: 'Motoboy leva a maquininha (Aproximação/Chip)',
                              },
                              {
                                id: 'link_seguro',
                                label: 'Receber Link Seguro',
                                desc: 'Link oficial Mercado Pago / InfinitePay no WhatsApp',
                              },
                              {
                                id: 'checkout_transparente',
                                label: 'Informar Cartão Agora',
                                desc: 'Pré-autorização online imediata',
                              },
                            ] as const
                          ).map((opt) => (
                            <button
                              type="button"
                              key={opt.id}
                              onClick={() =>
                                setCustomer({
                                  ...customer,
                                  modoCartao: opt.id as CardPaymentMode,
                                })
                              }
                              className={`p-2.5 rounded-xl border text-left transition-all ${
                                customer.modoCartao === opt.id
                                  ? 'bg-[#10B981]/15 border-[#10B981] text-white'
                                  : 'bg-[#121212] border-white/10 text-zinc-400 hover:border-white/20'
                              }`}
                            >
                              <p className="text-xs font-bold text-white">{opt.label}</p>
                              <p className="text-[10px] text-zinc-400 mt-0.5">{opt.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {customer.modoCartao === 'checkout_transparente' && (
                        <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-white/10">
                          <div className="col-span-2">
                            <input
                              type="text"
                              placeholder="Número do Cartão (0000 0000 0000 0000)"
                              maxLength={19}
                              value={customer.numeroCartaoSimulado}
                              onChange={(e) =>
                                setCustomer({
                                  ...customer,
                                  numeroCartaoSimulado: e.target.value,
                                })
                              }
                              className="w-full bg-[#121212] border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                            />
                          </div>
                          <input
                            type="text"
                            placeholder="Validade (MM/AA)"
                            maxLength={5}
                            value={customer.validadeCartao}
                            onChange={(e) =>
                              setCustomer({ ...customer, validadeCartao: e.target.value })
                            }
                            className="bg-[#121212] border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                          />
                          <input
                            type="text"
                            placeholder="CVV (3 dígitos)"
                            maxLength={4}
                            value={customer.cvvCartao}
                            onChange={(e) =>
                              setCustomer({ ...customer, cvvCartao: e.target.value })
                            }
                            className="bg-[#121212] border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {customer.metodoPagamento === 'debito' && (
                    <div className="bg-[#0A0A0A] border border-white/15 rounded-xl p-4 space-y-3">
                      <p className="text-xs text-zinc-300">
                        Escolha como deseja pagar no <strong>Cartão de Débito à vista</strong> ({formatBRL(finalTotal)}):
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() =>
                            setCustomer({ ...customer, modoCartao: 'maquininha_entrega' })
                          }
                          className={`p-3 rounded-xl border text-left ${
                            customer.modoCartao === 'maquininha_entrega'
                              ? 'bg-[#10B981]/15 border-[#10B981] text-white'
                              : 'bg-[#121212] border-white/10 text-zinc-400'
                          }`}
                        >
                          <p className="text-xs font-bold text-white">
                            Maquininha Presencial no Ato da Entrega
                          </p>
                          <p className="text-[11px] text-zinc-400 mt-0.5">
                            Pague diretamente ao motoboy da RR Store ao receber seu pedido.
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setCustomer({ ...customer, modoCartao: 'link_seguro' })
                          }
                          className={`p-3 rounded-xl border text-left ${
                            customer.modoCartao === 'link_seguro'
                              ? 'bg-[#10B981]/15 border-[#10B981] text-white'
                              : 'bg-[#121212] border-white/10 text-zinc-400'
                          }`}
                        >
                          <p className="text-xs font-bold text-white">
                            Link de Pagamento Débito Seguro
                          </p>
                          <p className="text-[11px] text-zinc-400 mt-0.5">
                            Receba o link oficial de pagamento instantâneo pelo WhatsApp.
                          </p>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            ) : (
              /* Etapa de Sucesso Pós-Envio */
              <div className="py-10 px-4 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-[#10B981]/20 border border-[#10B981] text-[#34D399] flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <span className="inline-block text-xs font-black uppercase tracking-wider bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30 px-3 py-1 rounded-full">
                  Pedido {orderCode} Formatado com Sucesso
                </span>
                <h3 className="text-xl font-black text-white">
                  Seu pedido foi enviado para o WhatsApp da RR Store!
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
                  Caso a janela do WhatsApp não tenha aberto automaticamente, clique no botão abaixo para reenviar seu pedido completo com prioridade para nossa central em Brasília-DF.
                </p>

                <div className="pt-2 space-y-2.5 max-w-sm mx-auto">
                  <a
                    href={buildCheckoutWhatsAppUrl({
                      orderCode,
                      items,
                      customer,
                      region: selectedRegion,
                      subtotal,
                      pixDiscount,
                      shippingCost,
                      finalTotal,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] font-black text-sm flex items-center justify-center gap-2 shadow-lg"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Abrir Pedido no WhatsApp Novamente</span>
                  </a>

                  <button
                    onClick={() => {
                      onClearCart();
                      setStep('cart');
                      onClose();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold"
                  >
                    Limpar Sacola e Voltar à Loja
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Rodapé Fixo com Resumo Financeiro e CTA (Com Safe Area iOS/Android) */}
          {items.length > 0 && step !== 'success' && (
            <div className="p-4 sm:p-5 pb-safe bg-[#121212] border-t border-white/15 space-y-3.5">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal ({items.reduce((sum, i) => sum + i.quantity, 0)} itens)</span>
                  <span className="font-semibold text-white">{formatBRL(subtotal)}</span>
                </div>

                {customer.metodoPagamento === 'pix' && (
                  <div className="flex justify-between text-[#34D399]">
                    <span className="font-semibold">Desconto PIX (5% OFF imediato)</span>
                    <span className="font-bold">-{formatBRL(pixDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-zinc-400">
                  <span>Entrega Expressa ({selectedRegion.nome})</span>
                  <span className="font-bold text-[#34D399]">
                    {isFreeShipping ? 'GRÁTIS 🎉' : formatBRL(shippingCost)}
                  </span>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-baseline justify-between">
                  <div>
                    <span className="text-sm font-extrabold text-white block">
                      Valor Total Final
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      {customer.metodoPagamento === 'pix'
                        ? 'Com 5% de desconto no PIX'
                        : customer.metodoPagamento === 'credito'
                        ? `Ou em ${customer.parcelasCredito}x de ${formatBRL(
                            finalTotal / customer.parcelasCredito
                          )} sem juros`
                        : 'Pagamento no Cartão de Débito'}
                    </span>
                  </div>
                  <span className="text-xl sm:text-2xl font-black text-[#34D399]">
                    {formatBRL(finalTotal)}
                  </span>
                </div>
              </div>

              {step === 'cart' ? (
                <button
                  onClick={() => setStep('checkout')}
                  className="w-full py-4 px-6 rounded-2xl bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:shadow-[0_0_35px_rgba(52,211,153,0.65)] transition-all cursor-pointer"
                >
                  <span>Avançar para Dados de Entrega e Pagamento</span>
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </button>
              ) : (
                <button
                  type="submit"
                  form="rr-checkout-form"
                  className="w-full py-4 px-6 rounded-2xl bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(16,185,129,0.45)] hover:shadow-[0_0_35px_rgba(52,211,153,0.7)] transition-all cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 stroke-[2.5]" />
                  <span>Finalizar Pedido e Enviar no WhatsApp</span>
                </button>
              )}

              <div className="flex items-center justify-center gap-4 text-[11px] text-zinc-400">
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                  Compra 100% Protegida
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-[#10B981]" />
                  Motoboy Brasília-DF
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
