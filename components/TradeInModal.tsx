'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  ArrowRight,
  Sparkles,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Store,
  Truck,
  MessageCircle,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';
import { Product, DFRegion } from '../types/store';
import { formatBRL, PRODUCTS } from '../data/mockData';
import {
  TRADE_IN_MODELS,
  TradeInBrand,
  DeviceCondition,
  CONDITION_MULTIPLIERS,
  calculateTradeInValue,
  buildTradeInWhatsAppUrl,
} from '../data/tradeInData';
import { trackTradeInSimulation, trackContact } from '../lib/metaPixel';

interface TradeInModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedProduct?: Product | null;
  selectedRegion?: DFRegion;
  allProducts?: Product[];
}

export default function TradeInModal({
  isOpen,
  onClose,
  preSelectedProduct = null,
  selectedRegion,
  allProducts = PRODUCTS,
}: TradeInModalProps) {
  const [selectedBrand, setSelectedBrand] = useState<TradeInBrand>('Apple');
  const [selectedModelId, setSelectedModelId] = useState<string>('apple-ip13');
  const [selectedStorage, setSelectedStorage] = useState<string>('128GB');
  const [selectedCondition, setSelectedCondition] = useState<DeviceCondition>('excelente');
  const [deliveryMethod, setDeliveryMethod] = useState<'loja' | 'motoboy'>('loja');

  // Aparelho novo desejado
  const [targetProductId, setTargetProductId] = useState<string>(
    preSelectedProduct?.id || 'rr-apple-ip17pm-512-silver'
  );

  // Modelos disponíveis pela marca selecionada
  const brandModels = useMemo(
    () => TRADE_IN_MODELS.filter((m) => m.brand === selectedBrand),
    [selectedBrand]
  );

  const currentModel = useMemo(
    () => brandModels.find((m) => m.id === selectedModelId) || brandModels[0],
    [brandModels, selectedModelId]
  );

  // Garante que o storage selecionado pertença ao modelo
  const effectiveStorageOption = useMemo(() => {
    if (!currentModel) return null;
    const match = currentModel.storageOptions.find((o) => o.storage === selectedStorage);
    return match || currentModel.storageOptions[0];
  }, [currentModel, selectedStorage]);

  // Valor avaliado do usado
  const evaluatedValue = useMemo(() => {
    if (!effectiveStorageOption) return 0;
    return calculateTradeInValue(effectiveStorageOption.baseValue, selectedCondition);
  }, [effectiveStorageOption, selectedCondition]);

  // Aparelho alvo novo
  const targetProduct = useMemo(() => {
    const p = allProducts.find((p) => p.id === targetProductId);
    return p || preSelectedProduct || allProducts[0];
  }, [allProducts, targetProductId, preSelectedProduct]);

  // Diferença a pagar (Volta)
  const differencePix = useMemo(() => {
    if (!targetProduct) return 0;
    return Math.max(0, targetProduct.precoPix - evaluatedValue);
  }, [targetProduct, evaluatedValue]);

  const differenceNormal = useMemo(() => {
    if (!targetProduct) return 0;
    return Math.max(0, targetProduct.precoPor - evaluatedValue);
  }, [targetProduct, evaluatedValue]);

  if (!isOpen) return null;

  const handleBrandChange = (brand: TradeInBrand) => {
    setSelectedBrand(brand);
    const first = TRADE_IN_MODELS.find((m) => m.brand === brand);
    if (first) {
      setSelectedModelId(first.id);
      setSelectedStorage(first.storageOptions[0]?.storage || '128GB');
    }
  };

  const handleModelChange = (id: string) => {
    setSelectedModelId(id);
    const m = brandModels.find((it) => it.id === id);
    if (m && !m.storageOptions.some((s) => s.storage === selectedStorage)) {
      setSelectedStorage(m.storageOptions[0]?.storage || '128GB');
    }
  };

  const handleWhatsAppClick = () => {
    if (!currentModel || !effectiveStorageOption || !targetProduct) return;
    trackTradeInSimulation({
      usedModel: currentModel.name,
      usedStorage: effectiveStorageOption.storage,
      condition: selectedCondition,
      evaluatedValue,
      targetProductId: targetProduct.id,
      targetProductName: targetProduct.nome,
      differencePix,
    });
    trackContact('Trade-In Simulador WhatsApp', differencePix, {
      used_device: `${currentModel.name} ${effectiveStorageOption.storage}`,
      condition: selectedCondition,
      target_product: targetProduct.nome,
    });
    const url = buildTradeInWhatsAppUrl({
      usedModelName: currentModel.name,
      usedStorage: effectiveStorageOption.storage,
      condition: selectedCondition,
      evaluatedValue,
      targetProduct,
      differencePix,
      deliveryMethod,
      customerRegion: selectedRegion?.nome,
    });
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl border border-white/15 bg-[#0D0D14] text-white shadow-[0_25px_80px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Glow de fundo */}
        <div className="pointer-events-none absolute -top-32 -right-32 w-80 h-80 rounded-full bg-[#7C63E6]/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-[#10B981]/20 blur-3xl" />

        {/* Header */}
        <div className="relative z-10 p-4 sm:p-6 border-b border-white/10 bg-gradient-to-r from-[#141226] via-[#0D0D14] to-[#141226] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#7C63E6]/20 border border-[#7C63E6]/40 flex items-center justify-center text-[#A78BFA] shadow-lg shadow-[#7C63E6]/20 shrink-0">
              <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#34D399] bg-[#10B981]/15 px-2.5 py-0.5 rounded-full border border-[#10B981]/30">
                  Troca Fácil • Trade-In
                </span>
                <span className="hidden sm:inline-block text-xs font-bold text-white/50">
                  Feira dos Importados SIA D439
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-black text-white tracking-tight mt-0.5">
                Simulador de Usado como Entrada
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corpo com Scroll */}
        <div className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* PASSO 1: DADOS DO SEU USADO */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#7C63E6] text-white text-xs font-black flex items-center justify-center">
                  1
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-white">
                  Qual é o seu aparelho atual?
                </h3>
              </div>
              <span className="text-xs text-white/50">Passo 1 de 2</span>
            </div>

            {/* Seletor de Marca */}
            <div className="grid grid-cols-3 gap-2">
              {(['Apple', 'Samsung', 'Xiaomi'] as TradeInBrand[]).map((brand) => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => handleBrandChange(brand)}
                  className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                    selectedBrand === brand
                      ? 'bg-[#7C63E6] border-[#7C63E6] text-white shadow-md shadow-[#7C63E6]/30'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {brand === 'Apple' ? '🍎 iPhone' : brand}
                </button>
              ))}
            </div>

            {/* Seletor de Modelo */}
            <div>
              <label className="block text-xs font-bold text-white/70 mb-1.5">
                Modelo do aparelho:
              </label>
              <select
                value={selectedModelId}
                onChange={(e) => handleModelChange(e.target.value)}
                className="w-full bg-[#181628] border border-white/15 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-[#7C63E6] cursor-pointer"
              >
                {brandModels.map((m) => (
                  <option key={m.id} value={m.id} className="bg-[#181628] text-white">
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Seletor de Armazenamento */}
            {currentModel && (
              <div>
                <label className="block text-xs font-bold text-white/70 mb-1.5">
                  Capacidade de Armazenamento:
                </label>
                <div className="flex flex-wrap gap-2">
                  {currentModel.storageOptions.map((opt) => {
                    const isSelected = effectiveStorageOption?.storage === opt.storage;
                    return (
                      <button
                        key={opt.storage}
                        type="button"
                        onClick={() => setSelectedStorage(opt.storage)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-[#34D399] border-[#34D399] text-[#0A0A0A] shadow-md shadow-[#34D399]/30'
                            : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                        }`}
                      >
                        {opt.storage}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Seletor de Condição */}
            <div>
              <label className="block text-xs font-bold text-white/70 mb-1.5">
                Estado de Conservação do Aparelho:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(['excelente', 'bom', 'marcas'] as DeviceCondition[]).map((cond) => {
                  const info = CONDITION_MULTIPLIERS[cond];
                  const isSelected = selectedCondition === cond;
                  return (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => setSelectedCondition(cond)}
                      className={`text-left p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#7C63E6] bg-[#7C63E6]/15 shadow-md shadow-[#7C63E6]/25'
                          : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-extrabold text-white">
                          {cond === 'excelente' ? 'Excelente' : cond === 'bom' ? 'Bom' : 'Marcas'}
                        </span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />}
                      </div>
                      <p className="text-[10px] text-white/60 leading-tight">
                        {info.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Card com a Avaliação Calculada do Usado */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#1b1535] to-[#141b2c] border border-[#7C63E6]/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-white/60">
                  Avaliação estimada do seu {currentModel?.name} {effectiveStorageOption?.storage}
                </span>
                <p className="text-xl sm:text-2xl font-black text-[#34D399] tracking-tight">
                  ~ {formatBRL(evaluatedValue)}
                </p>
              </div>
              <span className="text-[11px] font-bold text-[#A78BFA] bg-[#7C63E6]/20 px-2.5 py-1 rounded-full border border-[#7C63E6]/30">
                Crédito na Troca
              </span>
            </div>
          </div>

          {/* PASSO 2: ESCOLHA DO NOVO APARELHO */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#10B981] text-[#0A0A0A] text-xs font-black flex items-center justify-center">
                  2
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-white">
                  Qual novo aparelho você quer levar?
                </h3>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-white/70 mb-1.5">
                Escolha o modelo da RR Store:
              </label>
              <select
                value={targetProductId}
                onChange={(e) => setTargetProductId(e.target.value)}
                className="w-full bg-[#181628] border border-white/15 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-[#10B981] cursor-pointer"
              >
                {allProducts
                  .filter((p) => p.estoque > 0)
                  .slice(0, 30)
                  .map((prod) => (
                    <option key={prod.id} value={prod.id} className="bg-[#181628] text-white">
                      {prod.nome} — {formatBRL(prod.precoPix)} no PIX
                    </option>
                  ))}
              </select>
            </div>

            {/* Preferência de Retirada/Entrega */}
            <div>
              <label className="block text-xs font-bold text-white/70 mb-1.5">
                Como prefere fechar a troca?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('loja')}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    deliveryMethod === 'loja'
                      ? 'border-[#7C63E6] bg-[#7C63E6]/15'
                      : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]'
                  }`}
                >
                  <Store className="w-4 h-4 text-[#A78BFA] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-white">Presencial na Loja D439</p>
                    <p className="text-[10px] text-white/60">Feira dos Importados SIA • Na hora</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryMethod('motoboy')}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    deliveryMethod === 'motoboy'
                      ? 'border-[#10B981] bg-[#10B981]/15'
                      : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]'
                  }`}
                >
                  <Truck className="w-4 h-4 text-[#34D399] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-white">Motoboy Express no DF</p>
                    <p className="text-[10px] text-white/60">Troca e pagamento na sua porta</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* RESUMO FINAL: O CÁLCULO DA VOLTA */}
          <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-[#181230] via-[#10192a] to-[#0c1424] border-2 border-[#7C63E6]/60 shadow-xl space-y-3">
            <h4 className="text-xs uppercase font-black tracking-widest text-[#A78BFA] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Resumo da Sua Troca
            </h4>

            <div className="space-y-1.5 text-xs text-white/80 border-b border-white/10 pb-3">
              <div className="flex justify-between items-center">
                <span>{targetProduct?.nome} (Novo)</span>
                <span className="font-bold text-white">{formatBRL(targetProduct?.precoPix || 0)}</span>
              </div>
              <div className="flex justify-between items-center text-[#34D399]">
                <span>(-) Avaliação estimada do seu usado</span>
                <span className="font-bold">- {formatBRL(evaluatedValue)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div>
                <span className="text-xs text-white/60 block">Sua Volta a Pagar no PIX:</span>
                <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  ~ {formatBRL(differencePix)}
                </span>
                <span className="block text-[11px] text-white/60">
                  ou em até 12x no cartão (juros da operadora)
                </span>
              </div>

              <button
                type="button"
                onClick={handleWhatsAppClick}
                className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] active:scale-95 text-[#0A0A0A] font-black px-6 py-3.5 rounded-full text-xs sm:text-sm shadow-lg shadow-[#25D366]/30 transition-all cursor-pointer shrink-0"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Enviar Proposta no WhatsApp</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Rodapé com Selos de Confiança */}
        <div className="p-3 sm:p-4 bg-[#08080C] border-t border-white/10 flex items-center justify-center gap-4 sm:gap-8 text-[11px] text-white/60 font-bold">
          <span className="inline-flex items-center gap-1 text-[#34D399]">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            Avaliação Justa & Imediata
          </span>
          <span className="text-white/20">|</span>
          <span className="inline-flex items-center gap-1 text-white/80">
            <Store className="w-3.5 h-3.5 text-[#A78BFA] shrink-0" />
            Loja Física SIA D439
          </span>
          <span className="hidden sm:inline-block text-white/20">|</span>
          <span className="hidden sm:inline-flex items-center gap-1 text-amber-400">
            <Truck className="w-3.5 h-3.5 shrink-0" />
            Motoboy Express no DF
          </span>
        </div>
      </div>
    </div>
  );
}
