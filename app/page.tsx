'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  SlidersHorizontal,
  Sparkles,
  CheckCircle2,
  ShoppingBag,
  X,
  RotateCcw,
  EyeOff,
} from 'lucide-react';
import { CartItem, CategoryId, DFRegion, Product } from '../types/store';
import { CATEGORIES, DF_REGIONS, formatBRL, PRODUCTS } from '../data/mockData';
import TopBarAndHeader from '../components/TopBarAndHeader';
import HeroSection from '../components/HeroSection';
import CategoryNav from '../components/CategoryNav';
import ProductCard from '../components/ProductCard';
import CartAndCheckoutDrawer from '../components/CartAndCheckoutDrawer';
import TrustAndTestimonials from '../components/TrustAndTestimonials';
import FooterAndFloatingWhatsApp from '../components/FooterAndFloatingWhatsApp';
import MotionReveal from '../components/MotionReveal';

type SortOption = 'destaques' | 'menor-preco' | 'maior-desconto' | 'melhor-avaliacao';

export default function RRStorePage() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('destaques');
  const [selectedRegion, setSelectedRegion] = useState<DFRegion>(DF_REGIONS[0]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [toastProduct, setToastProduct] = useState<Product | null>(null);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  // Carregar carrinho, região e preferência de movimento salvos no navegador
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('rr_store_cart_v1');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
      const savedRegionId = localStorage.getItem('rr_store_region_v1');
      if (savedRegionId) {
        const found = DF_REGIONS.find((r) => r.id === savedRegionId);
        if (found) setSelectedRegion(found);
      }
      const savedReducedMotion = localStorage.getItem('rr_store_reduced_motion_v1');
      if (savedReducedMotion === 'true') {
        setReducedMotion(true);
        document.documentElement.classList.add('reduced-motion');
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const toggleReducedMotion = () => {
    setReducedMotion((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('reduced-motion');
      } else {
        document.documentElement.classList.remove('reduced-motion');
      }
      try {
        localStorage.setItem('rr_store_reduced_motion_v1', String(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  // Salvar carrinho sempre que atualizar
  useEffect(() => {
    try {
      localStorage.setItem('rr_store_cart_v1', JSON.stringify(cartItems));
    } catch {
      // Ignore storage errors
    }
  }, [cartItems]);

  const handleSelectRegion = (region: DFRegion) => {
    setSelectedRegion(region);
    try {
      localStorage.setItem('rr_store_region_v1', region.id);
    } catch {
      // Ignore
    }
  };

  // Filtragem e Ordenação Inteligente em Tempo Real
  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const list = PRODUCTS.filter((product) => {
      const matchesCategory =
        selectedCategory === 'Todos' || product.categoria === selectedCategory;

      if (!matchesCategory) return false;
      if (!query) return true;

      return (
        product.nome.toLowerCase().includes(query) ||
        product.categoria.toLowerCase().includes(query) ||
        product.descricao.toLowerCase().includes(query) ||
        product.tag.toLowerCase().includes(query)
      );
    });

    if (sortBy === 'menor-preco') {
      return [...list].sort((a, b) => a.precoPix - b.precoPix);
    }
    if (sortBy === 'maior-desconto') {
      return [...list].sort(
        (a, b) =>
          (b.precoDe - b.precoPix) / b.precoDe - (a.precoDe - a.precoPix) / a.precoDe
      );
    }
    if (sortBy === 'melhor-avaliacao') {
      return [...list].sort(
        (a, b) => b.avaliacao - a.avaliacao || b.avaliacoesCount - a.avaliacoesCount
      );
    }
    return list;
  }, [selectedCategory, searchQuery, sortBy]);

  // Funções do Carrinho
  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      }
      return [...prev, { product, quantity: 1 }];
    });

    setToastProduct(product);
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const cartCount = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.quantity, 0),
    [cartItems]
  );

  const cartSubtotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.product.precoPix * item.quantity, 0),
    [cartItems]
  );

  const activeCategoryObj = useMemo(
    () => CATEGORIES.find((c) => c.id === selectedCategory) || CATEGORIES[0],
    [selectedCategory]
  );

  const scrollToCatalog = () => {
    const el = document.getElementById('catalogo-produtos');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A]">
      {/* 2.1 Top Bar & Sticky Header */}
      <TopBarAndHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        selectedRegion={selectedRegion}
        onSelectRegion={handleSelectRegion}
        cartCount={cartCount}
        cartSubtotal={cartSubtotal}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* 2.2 Hero Section com Coreografia (Stripe/Linear/Apple/Vercel) & Logo 3D Interativa */}
      <HeroSection
        selectedRegion={selectedRegion}
        onExploreClick={scrollToCatalog}
        onSelectPlatformFilter={(query) => {
          setSelectedCategory('Eletrônicos & Smartphones');
          setSearchQuery(query);
          scrollToCatalog();
        }}
      />

      {/* 2.3 Navegação por Departamentos (Os 10 Nichos da RR Store) */}
      <CategoryNav
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        products={PRODUCTS}
      />

      {/* 3. Área Principal de Produtos (Background Secundário #F8F9FA / #FFFFFF para Leitura Perfeita) */}
      <main id="catalogo-produtos" className="flex-1 bg-[#F8F9FA] text-[#0A0A0A] py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Cabeçalho da Vitrine & Controles de Filtro/Ordenação/Acessibilidade */}
          <div className="bg-[#FFFFFF] rounded-2xl p-4 sm:p-6 border border-zinc-200/90 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-[#0A0A0A] text-[#34D399] px-2.5 py-1 rounded-lg">
                  <Sparkles className="w-3 h-3" />
                  Vitrine Oficial RR Store
                </span>
                <span className="text-xs font-bold text-zinc-500">
                  • Mostrando <strong className="text-[#0A0A0A]">{filteredProducts.length}</strong>{' '}
                  {filteredProducts.length === 1 ? 'produto' : 'produtos'}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-[#0A0A0A] tracking-tight mt-1.5">
                {activeCategoryObj.nome}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 mt-0.5">
                {searchQuery
                  ? `Resultados em tempo real para "${searchQuery}"`
                  : activeCategoryObj.subtitulo}
              </p>
            </div>

            {/* Ordenação + Modo Movimento Reduzido + Limpar Filtros */}
            <div className="flex flex-wrap items-center gap-2.5">
              {(selectedCategory !== 'Todos' || searchQuery.trim() !== '') && (
                <button
                  onClick={() => {
                    setSelectedCategory('Todos');
                    setSearchQuery('');
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-extrabold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Ver Todos os 30 Produtos
                </button>
              )}

              <button
                type="button"
                onClick={toggleReducedMotion}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  reducedMotion
                    ? 'bg-[#0A0A0A] text-[#34D399] border-[#10B981]'
                    : 'bg-[#F8F9FA] text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                }`}
                title="Acessibilidade: Ativar ou desativar animações (Reduced Motion)"
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span>{reducedMotion ? 'Movimento Reduzido: ON' : 'Reduzir Animações'}</span>
              </button>

              <div className="flex items-center gap-2 bg-[#F8F9FA] border border-zinc-200 rounded-xl px-3 py-2">
                <SlidersHorizontal className="w-4 h-4 text-[#059669]" />
                <label htmlFor="sort-select" className="text-xs font-bold text-zinc-600">
                  Ordenar:
                </label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-transparent text-xs font-extrabold text-[#0A0A0A] focus:outline-none cursor-pointer"
                >
                  <option value="destaques">Mais Vendidos &amp; Destaques</option>
                  <option value="menor-preco">Menor Preço no PIX</option>
                  <option value="maior-desconto">Maior Desconto (%)</option>
                  <option value="melhor-avaliacao">Melhor Avaliação (★)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grid de Produtos Responsivo com Stagger Reveal (50ms por coluna) */}
          {filteredProducts.length === 0 ? (
            <div className="bg-[#FFFFFF] rounded-2xl border border-zinc-200 p-12 text-center max-w-xl mx-auto my-6 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-[#10B981]/15 text-[#059669] flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-[#0A0A0A] mb-1">
                Nenhum produto encontrado para sua busca
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 mb-6">
                Não encontramos itens correspondentes a &ldquo;{searchQuery}&rdquo; em{' '}
                {selectedCategory}. Tente buscar por outro termo ou veja todos os departamentos.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('Todos');
                  setSearchQuery('');
                }}
                className="bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] font-black text-xs sm:text-sm px-6 py-3 rounded-xl transition-all cursor-pointer"
              >
                Limpar Filtros e Mostrar Tudo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
              {filteredProducts.map((product, idx) => (
                <MotionReveal key={product.id} delayMs={(idx % 4) * 50} offsetY={16}>
                  <ProductCard
                    product={product}
                    selectedRegion={selectedRegion}
                    onAddToCart={handleAddToCart}
                  />
                </MotionReveal>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 5. Seções Completas de Conversão: Problem->Solution, Benefícios, Como Funciona (3 Passos), Depoimentos, FAQ (8 Q/As) e Final CTA */}
      <TrustAndTestimonials
        selectedRegion={selectedRegion}
        onExploreClick={scrollToCatalog}
      />

      {/* 6. Footer Completo & Botão Flutuante de WhatsApp */}
      <FooterAndFloatingWhatsApp
        selectedRegion={selectedRegion}
        onSelectCategory={setSelectedCategory}
      />

      {/* 4. Carrinho Lateral (Drawer) & Fluxo de Checkout Híbrido */}
      <CartAndCheckoutDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        selectedRegion={selectedRegion}
        onSelectRegion={handleSelectRegion}
      />

      {/* Toast de Feedback Visual Rápido ao Adicionar Produto */}
      {toastProduct && !isCartOpen && (
        <div className="fixed bottom-20 right-5 z-40 bg-[#121212] text-white border border-[#10B981] rounded-2xl p-4 shadow-2xl max-w-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#34D399] shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-extrabold text-white truncate">
              {toastProduct.nome}
            </p>
            <p className="text-[11px] text-[#34D399] font-bold">
              Adicionado • {formatBRL(toastProduct.precoPix)} no PIX
            </p>
          </div>
          <button
            onClick={() => setToastProduct(null)}
            className="text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
