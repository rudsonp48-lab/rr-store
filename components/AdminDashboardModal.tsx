'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Pencil,
  Trash2,
  Package,
  Truck,
  Sparkles,
  Check,
  RotateCcw,
  Search,
  Layers,
  Database,
  RefreshCw,
} from 'lucide-react';
import { CategoryId, DFRegion, Product } from '../types/store';
import {
  calculatePixPrice,
  CATEGORIES,
  formatBRL,
  formatInstallment,
} from '../data/mockData';
import {
  CloudOrderRecord,
  fetchOrdersFromFirebase,
  FIREBASE_PROJECT_ID,
  verifyFirebaseConnection,
} from '../lib/firebase';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSaveProducts: (updated: Product[]) => void;
  onResetDefaultProducts: () => void;
  regions: DFRegion[];
  onSaveRegions: (updated: DFRegion[]) => void;
}

const VALID_CATEGORIES = CATEGORIES.filter((c) => c.id !== 'Todos').map(
  (c) => c.id as Exclude<CategoryId, 'Todos'>
);

const TAG_OPTIONS: Product['tag'][] = [
  'Mais Vendido',
  'Entrega Hoje DF',
  'Novidade',
  'Oferta Flash',
  'Favorito no DF',
  'Estoque Limitado',
];

export default function AdminDashboardModal({
  isOpen,
  onClose,
  products,
  onSaveProducts,
  onResetDefaultProducts,
  regions,
  onSaveRegions,
}: AdminDashboardModalProps) {
  const [activeTab, setActiveTab] = useState<'produtos' | 'novo' | 'fretes' | 'firebase'>(
    'produtos'
  );
  const [adminSearch, setAdminSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [savedBanner, setSavedBanner] = useState<string | null>(null);
  const [firebaseStatus, setFirebaseStatus] = useState<{
    ok: boolean;
    projectId: string;
    message: string;
    syncedAt: string;
  } | null>(null);
  const [orders, setOrders] = useState<CloudOrderRecord[]>([]);
  const [isSyncingFirebase, setIsSyncingFirebase] = useState(false);

  useEffect(() => {
    if (isOpen && activeTab === 'firebase') {
      void handleCheckFirebase();
    }
  }, [isOpen, activeTab]);

  const handleCheckFirebase = async () => {
    setIsSyncingFirebase(true);
    const [status, loadedOrders] = await Promise.all([
      verifyFirebaseConnection(products, regions),
      fetchOrdersFromFirebase(),
    ]);
    setFirebaseStatus(status);
    setOrders(loadedOrders);
    setIsSyncingFirebase(false);
  };

  const [formData, setFormData] = useState<{
    nome: string;
    categoria: Exclude<CategoryId, 'Todos'>;
    precoDe: string;
    precoPor: string;
    maxParcelasSemJuros: number;
    tag: Product['tag'];
    estoque: number;
    imagem: string;
    descricao: string;
  }>({
    nome: '',
    categoria: 'Eletrônicos & Smartphones',
    precoDe: '199.90',
    precoPor: '149.90',
    maxParcelasSemJuros: 5,
    tag: 'Mais Vendido',
    estoque: 20,
    imagem:
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=85',
    descricao: '',
  });

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setSavedBanner(msg);
    setTimeout(() => setSavedBanner(null), 2600);
  };

  const handleStartEdit = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      nome: prod.nome,
      categoria: prod.categoria,
      precoDe: prod.precoDe.toFixed(2),
      precoPor: prod.precoPor.toFixed(2),
      maxParcelasSemJuros: prod.maxParcelasSemJuros,
      tag: prod.tag,
      estoque: prod.estoque,
      imagem: prod.imagem,
      descricao: prod.descricao,
    });
    setActiveTab('novo');
  };

  const handleStartNew = () => {
    setEditingProduct(null);
    setFormData({
      nome: '',
      categoria: 'Eletrônicos & Smartphones',
      precoDe: '249.90',
      precoPor: '169.90',
      maxParcelasSemJuros: 5,
      tag: 'Novidade',
      estoque: 15,
      imagem:
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=85',
      descricao: 'Produto selecionado com Garantia Oficial RR Store e entrega expressa em Brasília-DF.',
    });
    setActiveTab('novo');
  };

  const handleProductFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const precoDeNum = Math.max(1, parseFloat(formData.precoDe.replace(',', '.')) || 199.9);
    const precoPorNum = Math.max(1, parseFloat(formData.precoPor.replace(',', '.')) || 149.9);
    const precoPix = calculatePixPrice(precoPorNum);
    const parcelamento = formatInstallment(precoPorNum, formData.maxParcelasSemJuros);

    if (editingProduct) {
      const updated = products.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              nome: formData.nome.trim(),
              categoria: formData.categoria,
              precoDe: precoDeNum,
              precoPor: precoPorNum,
              precoPix,
              parcelamento,
              maxParcelasSemJuros: formData.maxParcelasSemJuros,
              tag: formData.tag,
              estoque: Number(formData.estoque) || 10,
              imagem: formData.imagem.trim(),
              descricao: formData.descricao.trim(),
            }
          : p
      );
      onSaveProducts(updated);
      showToast('Produto atualizado com sucesso na loja!');
    } else {
      const newProduct: Product = {
        id: `rr-custom-${Date.now()}`,
        nome: formData.nome.trim() || 'Novo Produto RR Store',
        categoria: formData.categoria,
        precoDe: precoDeNum,
        precoPor: precoPorNum,
        precoPix,
        parcelamento,
        maxParcelasSemJuros: formData.maxParcelasSemJuros,
        avaliacao: 5.0,
        avaliacoesCount: 12,
        tag: formData.tag,
        estoque: Number(formData.estoque) || 15,
        imagem:
          formData.imagem.trim() ||
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=85',
        descricao:
          formData.descricao.trim() ||
          'Produto com entrega expressa via motoboy no mesmo dia em Brasília-DF.',
      };
      onSaveProducts([newProduct, ...products]);
      showToast('Novo produto cadastrado e publicado na vitrine!');
    }

    setEditingProduct(null);
    setActiveTab('produtos');
  };

  const handleDeleteProduct = (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    onSaveProducts(updated);
    showToast('Produto removido do catálogo.');
  };

  const handleUpdateRegionFee = (
    regionId: string,
    field: 'taxaEntrega' | 'freteGratisAcimaDe',
    value: number
  ) => {
    const updated = regions.map((r) =>
      r.id === regionId ? { ...r, [field]: Math.max(0, value) } : r
    );
    onSaveRegions(updated);
    showToast('Tabela de frete de Brasília-DF atualizada!');
  };

  const filteredList = products.filter(
    (p) =>
      p.nome.toLowerCase().includes(adminSearch.toLowerCase()) ||
      p.categoria.toLowerCase().includes(adminSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4">
      <div className="bg-[#0E0E11] border border-white/15 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col text-white shadow-2xl overflow-hidden">
        {/* Topo do Painel Admin */}
        <div className="p-4 sm:p-5 bg-[#141418] border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center text-[#34D399]">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                Painel Admin — RR Store Brasília
                <span className="text-[10px] font-black uppercase bg-[#10B981] text-[#0A0A0A] px-2 py-0.5 rounded-full">
                  Gestão em Tempo Real
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Gerencie produtos, preços PIX, fotos do banner e taxas de entrega por localidade do DF
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleStartNew}
              className="inline-flex items-center gap-1.5 bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] font-black text-xs px-3.5 py-2.5 rounded-xl cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Novo Produto</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
              aria-label="Fechar Painel Admin"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Abas de Navegação do Admin */}
        <div className="px-4 sm:px-5 py-2.5 bg-[#121215] border-b border-white/10 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('produtos')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'produtos'
                  ? 'bg-[#10B981] text-[#0A0A0A]'
                  : 'bg-white/5 text-zinc-300 hover:bg-white/10'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Catálogo ({products.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!editingProduct) handleStartNew();
                else setActiveTab('novo');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'novo'
                  ? 'bg-[#10B981] text-[#0A0A0A]'
                  : 'bg-white/5 text-zinc-300 hover:bg-white/10'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{editingProduct ? 'Editando Produto' : 'Adicionar Produto'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('fretes')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'fretes'
                  ? 'bg-[#10B981] text-[#0A0A0A]'
                  : 'bg-white/5 text-zinc-300 hover:bg-white/10'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Taxas de Frete DF ({regions.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('firebase')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'firebase'
                  ? 'bg-[#10B981] text-[#0A0A0A]'
                  : 'bg-white/5 text-amber-300 hover:bg-white/10 border border-amber-400/30'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>🔥 Firebase & Pedidos</span>
            </button>
          </div>

          {savedBanner && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#34D399] bg-[#10B981]/15 border border-[#10B981]/30 px-3 py-1 rounded-xl">
              <Check className="w-3.5 h-3.5" />
              {savedBanner}
            </span>
          )}
        </div>

        {/* Corpo do Painel Admin */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {activeTab === 'produtos' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                  <input
                    type="search"
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    placeholder="Filtrar produtos no painel por nome ou departamento..."
                    className="w-full bg-[#0A0A0A] border border-white/15 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#10B981]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onResetDefaultProducts();
                    showToast('Catálogo padrão de 30 produtos restaurado!');
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl cursor-pointer self-start"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar Catálogo Original</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredList.map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-[#141418] border border-white/10 hover:border-[#10B981]/40 rounded-2xl p-3 flex items-center gap-3.5 transition-all"
                  >
                    <img
                      src={prod.imagem}
                      alt={prod.nome}
                      className="w-16 h-16 rounded-xl object-cover bg-zinc-900 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-[#34D399] block truncate">
                        {prod.categoria} • Estoque: {prod.estoque}
                      </span>
                      <h4 className="text-xs sm:text-sm font-extrabold text-white truncate">
                        {prod.nome}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-zinc-500 line-through">
                          {formatBRL(prod.precoDe)}
                        </span>
                        <span className="text-xs font-black text-[#34D399]">
                          {formatBRL(prod.precoPix)} no PIX
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          ({formatBRL(prod.precoPor)} cartão)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(prod)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-[#10B981]/20 text-zinc-300 hover:text-[#34D399] transition-colors cursor-pointer"
                        title="Editar produto"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Excluir produto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'novo' && (
            <form onSubmit={handleProductFormSubmit} className="max-w-2xl mx-auto space-y-4">
              <div className="bg-[#141418] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4">
                <h3 className="text-sm font-black text-[#34D399] uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {editingProduct ? `Editando: ${editingProduct.nome}` : 'Cadastrar Novo Produto na Loja'}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-zinc-300 mb-1">
                      Nome do Produto *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Ex: Smartwatch Ultra Series 49mm AMOLED"
                      className="w-full bg-[#0A0A0A] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">
                      Departamento (10 Nichos) *
                    </label>
                    <select
                      value={formData.categoria}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          categoria: e.target.value as Exclude<CategoryId, 'Todos'>,
                        })
                      }
                      className="w-full bg-[#0A0A0A] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white font-semibold"
                    >
                      {VALID_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">
                      Tag de Destaque *
                    </label>
                    <select
                      value={formData.tag}
                      onChange={(e) =>
                        setFormData({ ...formData, tag: e.target.value as Product['tag'] })
                      }
                      className="w-full bg-[#0A0A0A] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white font-semibold"
                    >
                      {TAG_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">
                      Preço Antigo Riscado (R$) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.precoDe}
                      onChange={(e) => setFormData({ ...formData, precoDe: e.target.value })}
                      className="w-full bg-[#0A0A0A] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">
                      Preço Atual Cartão (R$) — PIX calcula -5% auto *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.precoPor}
                      onChange={(e) => setFormData({ ...formData, precoPor: e.target.value })}
                      className="w-full bg-[#0A0A0A] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">
                      Parcelas Sem Juros
                    </label>
                    <select
                      value={formData.maxParcelasSemJuros}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxParcelasSemJuros: Number(e.target.value),
                        })
                      }
                      className="w-full bg-[#0A0A0A] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white"
                    >
                      {[2, 3, 4, 5, 6, 10, 12].map((n) => (
                        <option key={n} value={n}>
                          Até {n}x sem juros
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">
                      Quantidade em Estoque (DF)
                    </label>
                    <input
                      type="number"
                      value={formData.estoque}
                      onChange={(e) =>
                        setFormData({ ...formData, estoque: Number(e.target.value) })
                      }
                      className="w-full bg-[#0A0A0A] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-zinc-300 mb-1">
                      URL da Foto do Produto (Unsplash ou link direto) *
                    </label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="url"
                        required
                        value={formData.imagem}
                        onChange={(e) => setFormData({ ...formData, imagem: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="flex-1 bg-[#0A0A0A] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white"
                      />
                      {formData.imagem && (
                        <img
                          src={formData.imagem}
                          alt="Preview"
                          className="w-12 h-12 rounded-xl object-cover border border-white/15 shrink-0"
                        />
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-zinc-300 mb-1">
                      Descrição Curta de Alta Conversão *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      placeholder="Destaque os benefícios e a entrega rápida em Brasília..."
                      className="w-full bg-[#0A0A0A] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                  <div className="text-xs text-zinc-400">
                    Valor calculado no PIX (-5%):{' '}
                    <strong className="text-[#34D399] text-sm">
                      {formatBRL(
                        calculatePixPrice(
                          parseFloat(formData.precoPor.replace(',', '.')) || 0
                        )
                      )}
                    </strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('produtos')}
                      className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-zinc-300 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] font-black text-xs cursor-pointer"
                    >
                      {editingProduct ? 'Salvar Alterações' : 'Publicar Produto na Loja'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {activeTab === 'fretes' && (
            <div className="space-y-4">
              <div className="bg-[#141418] border border-white/10 rounded-2xl p-4">
                <h3 className="text-sm font-black text-[#34D399] mb-1">
                  Tabela de Frete por Localidade / Região Administrativa do DF
                </h3>
                <p className="text-xs text-zinc-400">
                  Ajuste abaixo o valor da taxa de entrega via motoboy e a meta de Frete Grátis para cada localidade de Brasília.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {regions.map((reg) => (
                  <div
                    key={reg.id}
                    className="bg-[#141418] border border-white/10 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-xs sm:text-sm font-extrabold text-white">
                        {reg.nome}
                      </p>
                      <p className="text-[11px] text-zinc-400">{reg.tempoEstimado}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div>
                        <label className="block text-[10px] text-zinc-400">Taxa (R$)</label>
                        <input
                          type="number"
                          step="0.50"
                          value={reg.taxaEntrega}
                          onChange={(e) =>
                            handleUpdateRegionFee(
                              reg.id,
                              'taxaEntrega',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-20 bg-[#0A0A0A] border border-white/15 rounded-lg px-2 py-1 text-xs font-bold text-[#34D399]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-400">
                          Grátis acima (R$)
                        </label>
                        <input
                          type="number"
                          step="10"
                          value={reg.freteGratisAcimaDe}
                          onChange={(e) =>
                            handleUpdateRegionFee(
                              reg.id,
                              'freteGratisAcimaDe',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-24 bg-[#0A0A0A] border border-white/15 rounded-lg px-2 py-1 text-xs font-bold text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'firebase' && (
            <div className="space-y-4">
              {/* Status Card Firebase */}
              <div className="bg-[#141418] border border-[#10B981]/40 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/40 px-2.5 py-0.5 rounded-full">
                      <Database className="w-3.5 h-3.5" />
                      Firebase Cloud Firestore + Cache Persistente IndexedDB
                    </span>
                    <h3 className="text-sm sm:text-base font-black text-white mt-1.5">
                      Projeto Conectado: <span className="text-[#34D399]">{FIREBASE_PROJECT_ID}</span>
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={handleCheckFirebase}
                    disabled={isSyncingFirebase}
                    className="inline-flex items-center gap-1.5 bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] font-black text-xs px-4 py-2.5 rounded-xl cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingFirebase ? 'animate-spin' : ''}`} />
                    <span>{isSyncingFirebase ? 'Verificando...' : 'Sincronizar & Testar Agora'}</span>
                  </button>
                </div>

                {firebaseStatus && (
                  <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-3 text-xs space-y-1">
                    <p className="font-bold text-[#34D399]">
                      ✓ Status ({firebaseStatus.syncedAt}): {firebaseStatus.message}
                    </p>
                    <p className="text-zinc-400">
                      • Documentos ativos: <code className="text-white">rr_store_settings/catalog</code> ({products.length} produtos), <code className="text-white">rr_store_settings/shipping</code> ({regions.length} localidades DF) e coleção <code className="text-white">rr_store_orders</code>.
                    </p>
                  </div>
                )}
              </div>

              {/* Lista de Pedidos Gravados */}
              <div className="bg-[#141418] border border-white/10 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                  Últimos Pedidos Armazenados ({orders.length})
                </h4>
                {orders.length === 0 ? (
                  <p className="text-xs text-zinc-400 py-4 text-center">
                    Nenhum pedido registrado ainda. Faça um pedido de teste na Sacola para vê-lo gravado aqui e no Firebase!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {orders.map((ord, idx) => (
                      <div
                        key={ord.id || idx}
                        className="bg-[#0A0A0A] border border-white/10 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <p className="font-black text-[#34D399]">
                            {ord.orderCode} — {ord.customer?.nomeCompleto || 'Cliente DF'}
                          </p>
                          <p className="text-zinc-400">
                            📍 {ord.region?.nome} • {ord.customer?.enderecoCompleto} • Tel: {ord.customer?.whatsapp}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-white block">
                            {formatBRL(ord.finalTotal || 0)}
                          </span>
                          <span className="text-[10px] text-zinc-500 uppercase">
                            {ord.customer?.metodoPagamento || 'PIX'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
