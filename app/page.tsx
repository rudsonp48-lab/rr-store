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
  Grid2x2,
  Rows3,
} from 'lucide-react';
import { CartItem, CategoryId, DFRegion, HeroBanner, Product } from '../types/store';
import { CATEGORIES, DF_REGIONS, formatBRL, PRODUCTS } from '../data/mockData';
import TopBarAndHeader from '../components/TopBarAndHeader';
import HeroSection from '../components/HeroSection';
import CategoryNav from '../components/CategoryNav';
import BrandLogo, { BrandLogoKey } from '../components/BrandLogo';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';
import CartAndCheckoutDrawer from '../components/CartAndCheckoutDrawer';
import TrustAndTestimonials from '../components/TrustAndTestimonials';
import FooterAndFloatingWhatsApp from '../components/FooterAndFloatingWhatsApp';
import MotionReveal from '../components/MotionReveal';
import MobileBottomBar from '../components/MobileBottomBar';
import { loadStoreSettings } from '../lib/firebase';

type SortOption = 'destaques' | 'menor-preco' | 'maior-desconto' | 'melhor-avaliacao';
type QuickFilterId =
  | 'todos'
  | 'apple'
  | 'xiaomi'
  | 'realme'
  | 'samsung'
  | 'gamer'
  | 'jbl-audio'
  | 'smartwatches'
  | 'ssd';

// Cache da última versão publicada pelo painel (abre a loja instantaneamente na próxima visita)
const SETTINGS_CACHE_KEY = 'rr_store_settings_cache_v7';

const LOCAL_CURATED_MAP = new Map<string, Product>(PRODUCTS.map((p) => [p.id, p]));

function mergeWithVerifiedCatalog(cloudProducts: Product[]): Product[] {
  const cloudIds = new Set(cloudProducts.map((p) => p.id));
  const sanitizedCloud = cloudProducts.map((cp) => {
    const local = LOCAL_CURATED_MAP.get(cp.id);
    if (local && (cp.id.startsWith('rr-apple-') || cp.id.startsWith('sousa-'))) {
      return {
        ...cp,
        nome: local.nome,
        imagem: local.imagem,
        descricao: local.descricao,
      };
    }
    return cp;
  });
  return [...PRODUCTS.filter((p) => !cloudIds.has(p.id)), ...sanitizedCloud];
}

function matchesQuickFilter(product: Product, filterId: QuickFilterId): boolean {
  if (filterId === 'todos') return true;
  const name = product.nome.toLowerCase();
  const text = `${product.nome} ${product.descricao}`.toLowerCase();

  switch (filterId) {
    case 'apple':
      return (
        product.id.startsWith('rr-apple-') ||
        /\b(iphone|ipad|macbook|imac|mac mini|airpods|airtag|apple watch|magic mouse|magic keyboard|apple pencil|magsafe|cabo usb-c apple|fonte 20w apple|adaptador lightning)\b/i.test(
          name
        )
      );
    case 'xiaomi':
      return /\b(xiaomi|redmi|poco|mi tv)\b/i.test(name);
    case 'realme':
      return /\brealme\b/i.test(name);
    case 'samsung':
      return /\b(samsung|galaxy)\b/i.test(name);
    case 'gamer':
      return /\b(ps5|playstation|dualsense|gamer|joystick|controle|mouse gamer|teclado mec[aâ]nico|headset)\b/i.test(
        text
      );
    case 'jbl-audio':
      return /\b(jbl|airpods|buds|headphone|fone|caixa de som|speaker|microfone|boombox|partybox)\b/i.test(
        name
      );
    case 'smartwatches':
      return /\b(smartwatch|apple watch|amazfit|haylou|rel[oó]gio)\b/i.test(name);
    case 'ssd':
      return /\b(ssd|nvme|sata|sandisk|kingston|case gaveta)\b/i.test(name);
    default:
      return true;
  }
}

export interface SubFilterChip {
  id: string;
  label: string;
  brand: BrandLogoKey;
  match: (product: Product) => boolean;
}

const SUB_FILTERS_BY_TOPIC: Record<Exclude<QuickFilterId, 'todos'>, SubFilterChip[]> = {
  apple: [
    { id: 'all', label: 'Tudo Apple', brand: 'apple', match: () => true },
    {
      id: 'iphones',
      label: 'iPhones',
      brand: 'apple',
      match: (p) => /\biphone\b/i.test(p.nome),
    },
    {
      id: 'ipads',
      label: 'iPads',
      brand: 'apple',
      match: (p) => /\bipad\b/i.test(p.nome) && !/\b(magic keyboard|pencil)\b/i.test(p.nome),
    },
    {
      id: 'imacs-macbooks',
      label: 'iMacs & MacBooks',
      brand: 'apple',
      match: (p) => /\b(macbook|imac|mac mini)\b/i.test(p.nome),
    },
    {
      id: 'airpods',
      label: 'AirPods',
      brand: 'apple',
      match: (p) => /\bairpods\b/i.test(p.nome),
    },
    {
      id: 'apple-watch',
      label: 'Apple Watch',
      brand: 'apple',
      match: (p) => /\bapple watch\b/i.test(p.nome),
    },
    {
      id: 'acessorios-apple',
      label: 'Acessórios Apple',
      brand: 'apple',
      match: (p) =>
        /\b(magic mouse|magic keyboard|apple pencil|airtag|magsafe|fonte|cabo|carregador|adaptador)\b/i.test(
          p.nome
        ),
    },
  ],
  xiaomi: [
    { id: 'all', label: 'Tudo Xiaomi', brand: 'xiaomi', match: () => true },
    {
      id: 'redmi-note',
      label: 'Linha Redmi Note',
      brand: 'xiaomi',
      match: (p) => /\b(redmi note|xiaomi note)\b/i.test(p.nome),
    },
    {
      id: 'redmi',
      label: 'Linha Redmi',
      brand: 'xiaomi',
      match: (p) => /\bredmi\b/i.test(p.nome) && !/\bredmi note\b/i.test(p.nome) && !/\bbuds\b/i.test(p.nome),
    },
    {
      id: 'poco',
      label: 'Linha Poco',
      brand: 'poco',
      match: (p) => /\bpoco\b/i.test(p.nome),
    },
    {
      id: 'xiaomi-ecossistema',
      label: 'Áudio, TV & Smart',
      brand: 'xiaomi',
      match: (p) => /\b(mi tv|buds|band|watch)\b/i.test(p.nome),
    },
  ],
  realme: [
    { id: 'all', label: 'Tudo Realme', brand: 'realme', match: () => true },
    {
      id: 'realme-note',
      label: 'Realme Note',
      brand: 'realme',
      match: (p) => /\brealme note\b/i.test(p.nome),
    },
    {
      id: 'realme-c',
      label: 'Linha Realme C',
      brand: 'realme',
      match: (p) => /\brealme c\d+/i.test(p.nome),
    },
    {
      id: 'realme-audio',
      label: 'Realme Buds & Áudio',
      brand: 'realme',
      match: (p) => /\b(buds|fone)\b/i.test(p.nome),
    },
  ],
  samsung: [
    { id: 'all', label: 'Tudo Samsung', brand: 'samsung', match: () => true },
    {
      id: 'galaxy-5g',
      label: 'Galaxy 5G',
      brand: 'samsung',
      match: (p) => /\b5g\b/i.test(p.nome),
    },
    {
      id: 'galaxy-a',
      label: 'Linha Galaxy A',
      brand: 'samsung',
      match: (p) => /\bgalaxy a\d+/i.test(p.nome),
    },
  ],
  gamer: [
    { id: 'all', label: 'Tudo Gamer', brand: 'gamer', match: () => true },
    {
      id: 'ps5-controles',
      label: 'PS5 & Controles',
      brand: 'gamer',
      match: (p) => /\b(ps5|playstation|dualsense|controle|joystick)\b/i.test(p.nome) && !/\bbase\b/i.test(p.nome),
    },
    {
      id: 'bases-console',
      label: 'Bases & Acessórios PS5',
      brand: 'gamer',
      match: (p) => /\b(base|carregamento|suporte|cooler)\b/i.test(`${p.nome} ${p.descricao}`),
    },
    {
      id: 'headsets-gamer',
      label: 'Headsets & Áudio Gamer',
      brand: 'gamer',
      match: (p) => /\b(headset|fone gamer|quantum)\b/i.test(`${p.nome} ${p.descricao}`),
    },
    {
      id: 'perifericos-pc',
      label: 'Mouse, Teclado & PC',
      brand: 'gamer',
      match: (p) => /\b(mouse|teclado|rgb|mec[aâ]nico)\b/i.test(`${p.nome} ${p.descricao}`),
    },
  ],
  'jbl-audio': [
    { id: 'all', label: 'Tudo JBL & Áudio', brand: 'jbl-audio', match: () => true },
    {
      id: 'caixas-jbl',
      label: 'Caixas JBL & Speakers',
      brand: 'jbl-audio',
      match: (p) => /\b(flip|charge|go|xtreme|boombox|partybox|caixa de som|speaker)\b/i.test(p.nome),
    },
    {
      id: 'fones-tws',
      label: 'Fones Sem Fio & TWS',
      brand: 'jbl-audio',
      match: (p) => /\b(airpods|buds|wave|tws|in-ear)\b/i.test(`${p.nome} ${p.descricao}`),
    },
    {
      id: 'headphones',
      label: 'Headphones & Headsets',
      brand: 'jbl-audio',
      match: (p) => /\b(tune|headphone|headset|quantum)\b/i.test(`${p.nome} ${p.descricao}`),
    },
    {
      id: 'microfones',
      label: 'Microfones & Estúdio',
      brand: 'jbl-audio',
      match: (p) => /\b(microfone|lapela)\b/i.test(`${p.nome} ${p.descricao}`),
    },
  ],
  smartwatches: [
    { id: 'all', label: 'Todos Smartwatches', brand: 'smartwatches', match: () => true },
    {
      id: 'watch-apple',
      label: 'Apple Watch',
      brand: 'apple',
      match: (p) => /\bapple watch\b/i.test(p.nome),
    },
    {
      id: 'watch-amazfit',
      label: 'Amazfit',
      brand: 'amazfit',
      match: (p) => /\bamazfit\b/i.test(p.nome),
    },
    {
      id: 'watch-haylou',
      label: 'Haylou',
      brand: 'haylou',
      match: (p) => /\bhaylou\b/i.test(p.nome),
    },
  ],
  ssd: [
    { id: 'all', label: 'Tudo Armazenamento', brand: 'ssd', match: () => true },
    {
      id: 'ssd-sandisk',
      label: 'SSD SanDisk',
      brand: 'sandisk',
      match: (p) => /\bsandisk\b/i.test(p.nome),
    },
    {
      id: 'ssd-kingston',
      label: 'SSD Kingston',
      brand: 'kingston',
      match: (p) => /\bkingston\b/i.test(p.nome),
    },
    {
      id: 'cases-nvme',
      label: 'Cases & Gavetas NVMe',
      brand: 'ssd',
      match: (p) => /\b(case|gaveta|nvme)\b/i.test(p.nome),
    },
  ],
};

function matchesSubFilter(product: Product, topic: QuickFilterId, subId: string): boolean {
  if (topic === 'todos' || subId === 'all') return true;
  const subList = SUB_FILTERS_BY_TOPIC[topic];
  const found = subList?.find((s) => s.id === subId);
  return found ? found.match(product) : true;
}

const QUICK_FILTER_CHIPS: { id: QuickFilterId; label: string; brand: BrandLogoKey }[] = [
  { id: 'todos', label: 'Todos', brand: 'todos' },
  { id: 'apple', label: 'Apple', brand: 'apple' },
  { id: 'xiaomi', label: 'Xiaomi', brand: 'xiaomi' },
  { id: 'realme', label: 'Realme', brand: 'realme' },
  { id: 'samsung', label: 'Samsung', brand: 'samsung' },
  { id: 'gamer', label: 'Gamer', brand: 'gamer' },
  { id: 'jbl-audio', label: 'JBL', brand: 'jbl-audio' },
  { id: 'smartwatches', label: 'Smartwatches', brand: 'smartwatches' },
  { id: 'ssd', label: 'SSD & Memória', brand: 'ssd' },
];

function prioritizeAppleProducts(list: Product[]): Product[] {
  const apple = list.filter((p) => p.id.startsWith('rr-apple-'));
  const others = list.filter((p) => !p.id.startsWith('rr-apple-'));
  return [...apple, ...others];
}

export default function RRStorePage() {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [regions, setRegions] = useState<DFRegion[]>(DF_REGIONS);
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('Todos');
  const [quickFilter, setQuickFilter] = useState<QuickFilterId>('todos');
  const [subFilter, setSubFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('destaques');
  const [selectedRegion, setSelectedRegion] = useState<DFRegion>(DF_REGIONS[0]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [toastProduct, setToastProduct] = useState<Product | null>(null);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [mobileColumns, setMobileColumns] = useState<1 | 2>(2);

  // Carrega preferências locais e, em seguida, o catálogo/fretes/banners publicados no Firestore
  useEffect(() => {
    let currentRegions = DF_REGIONS;
    try {
      // Limpa dados de quando o painel ficava dentro do site (edições locais não valem mais)
      localStorage.removeItem('rr_store_products_v1');
      localStorage.removeItem('rr_store_regions_list_v1');
      localStorage.removeItem('rr_store_orders_v1');
      localStorage.removeItem('rr_store_settings_cache_v2');
      localStorage.removeItem('rr_store_settings_cache_v3');
      localStorage.removeItem('rr_store_settings_cache_v4');
      localStorage.removeItem('rr_store_settings_cache_v5');

      const cached = localStorage.getItem(SETTINGS_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed.products) && parsed.products.length > 0) {
          const merged = mergeWithVerifiedCatalog(parsed.products);
          setProducts(prioritizeAppleProducts(merged));
        }
        if (Array.isArray(parsed.regions) && parsed.regions.length > 0) {
          currentRegions = parsed.regions;
          setRegions(parsed.regions);
        }
        if (Array.isArray(parsed.banners)) {
          setBanners(parsed.banners);
        }
      }

      const savedCart = localStorage.getItem('rr_store_cart_v1');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }

      const savedRegionId = localStorage.getItem('rr_store_region_v1');
      if (savedRegionId) {
        const found = currentRegions.find((r) => r.id === savedRegionId);
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

    const syncWithSupplierAndCloud = async () => {
      const cloud = await loadStoreSettings();
      let baseProducts = PRODUCTS;
      if (cloud.products && cloud.products.length > 0) {
        baseProducts = mergeWithVerifiedCatalog(cloud.products);
      }

      // Sincroniza em tempo real com o fornecedor GSM Digital Acessórios
      try {
        const res = await fetch('/api/supplier-sync');
        if (res.ok) {
          const supplierData = await res.json();
          if (Array.isArray(supplierData.products) && supplierData.products.length > 0) {
            const supplierMap = new Map<string, Product>(
              supplierData.products.map((p: Product) => [p.id, p])
            );
            // Atualiza preço, foto e estoque dos itens GSM Digital e adiciona novos produtos do fornecedor
            const updatedExisting = baseProducts.map((p) => {
              const live = supplierMap.get(p.id);
              if (!live) return p;
              supplierMap.delete(p.id);
              return {
                ...p,
                nome: live.nome,
                precoDe: live.precoDe,
                precoPor: live.precoPor,
                precoPix: live.precoPix,
                parcelamento: live.parcelamento,
                imagem: live.imagem || p.imagem,
                estoque: live.estoque,
              };
            });
            const newFromSupplier = Array.from(supplierMap.values());
            baseProducts = [...updatedExisting, ...newFromSupplier];
          }
        }
      } catch {
        // Fallback silencioso para o catálogo local/cloud
      }

      baseProducts = prioritizeAppleProducts(baseProducts);
      setProducts(baseProducts);
      setCartItems((prev) =>
        prev.map((item) => ({
          ...item,
          product: baseProducts.find((p) => p.id === item.product.id) || item.product,
        }))
      );

      if (cloud.regions) {
        setRegions(cloud.regions);
        setSelectedRegion((prev) => cloud.regions!.find((r) => r.id === prev.id) || prev);
      }
      if (cloud.banners) setBanners(cloud.banners);
      try {
        localStorage.setItem(
          SETTINGS_CACHE_KEY,
          JSON.stringify({ ...cloud, products: baseProducts })
        );
      } catch {
        // Ignore
      }
    };

    void syncWithSupplierAndCloud();
    const interval = setInterval(() => {
      void syncWithSupplierAndCloud();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
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

    const list = products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'Todos' || product.categoria === selectedCategory;

      if (!matchesCategory) return false;
      if (!matchesQuickFilter(product, quickFilter)) return false;
      if (!matchesSubFilter(product, quickFilter, subFilter)) return false;
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
  }, [products, selectedCategory, quickFilter, subFilter, searchQuery, sortBy]);

  // Funções do Carrinho
  const handleAddToCart = (product: Product, qty: number = 1) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + qty,
        };
        return updated;
      }
      return [...prev, { product, quantity: qty }];
    });

    setToastProduct(product);
    setSelectedProduct(null);
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

  const cartSubtotalPix = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.product.precoPix * item.quantity, 0),
    [cartItems]
  );

  const cartSubtotalRaw = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.product.precoPor * item.quantity, 0),
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

  const scrollToDepartments = () => {
    const el = document.getElementById('departamentos');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const focusMobileSearch = () => {
    const input = document.getElementById('rr-mobile-search-input') as HTMLInputElement | null;
    if (input) {
      input.focus();
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] pb-20 md:pb-0">
      {/* 2.1 Top Bar & Sticky Header */}
      <TopBarAndHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        selectedRegion={selectedRegion}
        onSelectRegion={handleSelectRegion}
        cartCount={cartCount}
        cartSubtotal={cartSubtotalPix}
        onOpenCart={() => setIsCartOpen(true)}
        regions={regions}
      />

      {/* 2.2 Hero Section Compactada + Super Banner (imagens gerenciadas no painel externo) */}
      <HeroSection
        selectedRegion={selectedRegion}
        onExploreClick={scrollToCatalog}
        onAddToCart={handleAddToCart}
        onSelectProduct={setSelectedProduct}
        products={products}
        banners={banners}
      />

      {/* 2.3 Navegação por Departamentos (Os 10 Nichos da RR Store) */}
      <CategoryNav
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setQuickFilter('todos');
          setSubFilter('all');
        }}
        products={products}
      />

      {/* 3. Área Principal de Produtos (Background Secundário #F8F9FA / #FFFFFF para Leitura Perfeita) */}
      <main id="catalogo-produtos" className="flex-1 bg-[#F8F9FA] text-[#0A0A0A] py-6 sm:py-14">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          {/* Cabeçalho da Vitrine & Controles de Filtro/Ordenação/Painel Admin */}
          <div className="bg-[#FFFFFF] rounded-2xl p-3.5 sm:p-6 border border-zinc-200/90 shadow-sm mb-5 sm:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-3.5">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-[#0A0A0A] text-[#34D399] px-2.5 py-1 rounded-lg">
                  <Sparkles className="w-3 h-3" />
                  Vitrine Oficial RR Store
                </span>
                <span className="text-xs font-bold text-zinc-500">
                  • <strong className="text-[#0A0A0A]">{filteredProducts.length}</strong>{' '}
                  {filteredProducts.length === 1 ? 'produto' : 'produtos'}
                </span>
              </div>

              <h2 className="text-lg sm:text-2xl font-black text-[#0A0A0A] tracking-tight mt-1">
                {activeCategoryObj.nome}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 mt-0.5">
                {searchQuery
                  ? `Resultados em tempo real para "${searchQuery}"`
                  : activeCategoryObj.subtitulo}
              </p>
            </div>

            {/* Controles Mobile-First: Alternador 1/2 Colunas + Botão Painel Admin + Ordenação */}
            <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2">
              <div className="sm:hidden inline-flex items-center bg-[#F8F9FA] border border-zinc-200 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setMobileColumns(2)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold transition-colors ${
                    mobileColumns === 2
                      ? 'bg-[#0A0A0A] text-[#34D399]'
                      : 'text-zinc-600'
                  }`}
                  aria-label="Visualizar em 2 colunas no celular"
                >
                  <Grid2x2 className="w-3.5 h-3.5" />
                  <span>2 Col</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMobileColumns(1)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold transition-colors ${
                    mobileColumns === 1
                      ? 'bg-[#0A0A0A] text-[#34D399]'
                      : 'text-zinc-600'
                  }`}
                  aria-label="Visualizar em 1 coluna detalhada no celular"
                >
                  <Rows3 className="w-3.5 h-3.5" />
                  <span>1 Col</span>
                </button>
              </div>

              {(selectedCategory !== 'Todos' ||
                quickFilter !== 'todos' ||
                searchQuery.trim() !== '') && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('Todos');
                    setQuickFilter('todos');
                    setSubFilter('all');
                    setSearchQuery('');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Ver Tudo ({products.length})</span>
                </button>
              )}

              <button
                type="button"
                onClick={toggleReducedMotion}
                className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  reducedMotion
                    ? 'bg-[#0A0A0A] text-[#34D399] border-[#10B981]'
                    : 'bg-[#F8F9FA] text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                }`}
                title="Acessibilidade: Ativar ou desativar animações (Reduced Motion)"
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span>{reducedMotion ? 'Movimento Reduzido: ON' : 'Reduzir Animações'}</span>
              </button>

              <div className="flex items-center gap-1.5 bg-[#F8F9FA] border border-zinc-200 rounded-xl px-2.5 py-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  aria-label="Ordenar produtos"
                  className="bg-transparent text-xs font-extrabold text-[#0A0A0A] focus:outline-none cursor-pointer"
                >
                  <option value="destaques">Destaques</option>
                  <option value="menor-preco">Menor Preço PIX</option>
                  <option value="maior-desconto">Maior Desconto</option>
                  <option value="melhor-avaliacao">Melhor Avaliação</option>
                </select>
              </div>
            </div>
          </div>

          {/* Atalhos Rápidos de Busca por Marcas e Categorias Populares + Subcategorias Expansíveis */}
          <div className="relative mb-6 bg-[#0A0A0A] rounded-2xl p-3 sm:p-4 border border-zinc-800 shadow-lg space-y-3">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-[#34D399]" />
                <span className="text-[11px] font-black uppercase tracking-[0.12em] text-zinc-200">
                  Filtro Rápido
                </span>
              </div>

              {QUICK_FILTER_CHIPS.map((chip) => {
                const active = quickFilter === chip.id && searchQuery.trim() === '';
                const count = products.filter((p) => matchesQuickFilter(p, chip.id)).length;
                return (
                  <button
                    type="button"
                    key={chip.id}
                    onClick={() => {
                      setQuickFilter(chip.id);
                      setSubFilter('all');
                      setSelectedCategory('Todos');
                      setSearchQuery('');
                    }}
                    className={`group relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer ${
                      active
                        ? 'bg-[#10B981] text-[#0A0A0A] shadow-[0_6px_18px_rgba(16,185,129,0.35)] border border-[#34D399]'
                        : 'bg-white/[0.05] hover:bg-white/[0.12] text-zinc-200 border border-white/10 hover:border-white/25'
                    }`}
                  >
                    <BrandLogo
                      brand={chip.brand}
                      size="md"
                      className="transition-transform group-hover:scale-105"
                    />
                    <span className="tracking-tight">{chip.label}</span>
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                        active
                          ? 'bg-[#0A0A0A]/20 text-[#0A0A0A]'
                          : 'bg-white/10 text-zinc-400 group-hover:text-white'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Subcategorias Dinâmicas do Tópico Selecionado (Apple, Xiaomi, Realme, Samsung, Gamer, JBL, etc.) */}
            {quickFilter !== 'todos' && SUB_FILTERS_BY_TOPIC[quickFilter] && (
              <div className="pt-2.5 border-t border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#7C63E6]/20 border border-[#7C63E6]/40 text-[#C4B5FD] text-[10px] font-black uppercase tracking-wider shrink-0">
                  <span>↳ Nichos {QUICK_FILTER_CHIPS.find((c) => c.id === quickFilter)?.label}:</span>
                </span>

                {SUB_FILTERS_BY_TOPIC[quickFilter].map((sub) => {
                  const topicProducts = products.filter((p) => matchesQuickFilter(p, quickFilter));
                  const subCount = topicProducts.filter((p) => sub.match(p)).length;
                  const isSubActive = subFilter === sub.id;

                  return (
                    <button
                      type="button"
                      key={sub.id}
                      onClick={() => {
                        setSubFilter(sub.id);
                        setSearchQuery('');
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-extrabold whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer ${
                        isSubActive
                          ? 'bg-[#7C63E6] text-white shadow-[0_4px_14px_rgba(124,99,230,0.45)] border border-[#A78BFA]'
                          : 'bg-white/[0.04] hover:bg-white/[0.10] text-zinc-300 border border-white/10 hover:border-white/20'
                      }`}
                    >
                      <BrandLogo brand={sub.brand} size="sm" />
                      <span>{sub.label}</span>
                      <span
                        className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                          isSubActive
                            ? 'bg-black/25 text-white'
                            : 'bg-white/10 text-zinc-400'
                        }`}
                      >
                        {subCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Grid de Produtos Responsivo (1 ou 2 Colunas no Celular -> 2 no Tablet -> 3/4 no Desktop) */}
          {filteredProducts.length === 0 ? (
            <div className="bg-[#FFFFFF] rounded-2xl border border-zinc-200 p-8 sm:p-12 text-center max-w-xl mx-auto my-6 shadow-sm">
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
                type="button"
                onClick={() => {
                  setSelectedCategory('Todos');
                  setQuickFilter('todos');
                  setSubFilter('all');
                  setSearchQuery('');
                }}
                className="bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] font-black text-xs sm:text-sm px-6 py-3 rounded-xl transition-all cursor-pointer"
              >
                Limpar Filtros e Mostrar Tudo
              </button>
            </div>
          ) : (
            <div
              className={`grid ${
                mobileColumns === 2 ? 'grid-cols-2 gap-2.5' : 'grid-cols-1 gap-4'
              } sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4`}
            >
              {filteredProducts.map((product, idx) => (
                <MotionReveal key={product.id} delayMs={(idx % 4) * 45} offsetY={14}>
                  <ProductCard
                    product={product}
                    selectedRegion={selectedRegion}
                    onAddToCart={handleAddToCart}
                    onSelectProduct={setSelectedProduct}
                    compactMobile={mobileColumns === 2}
                  />
                </MotionReveal>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal de Informações e SEO Completo ao Clicar em Qualquer Produto */}
      <ProductDetailModal
        product={selectedProduct}
        selectedRegion={selectedRegion}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* 5. Seções Completas de Conversão */}
      <TrustAndTestimonials
        selectedRegion={selectedRegion}
        onExploreClick={scrollToCatalog}
      />

      {/* 6. Footer Completo & Botão Flutuante de WhatsApp */}
      <FooterAndFloatingWhatsApp
        selectedRegion={selectedRegion}
        onSelectCategory={setSelectedCategory}
      />

      {/* 7. Barra de Navegação Inferior Nativa Mobile + Fechamento Rápido 1-Toque */}
      <MobileBottomBar
        cartCount={cartCount}
        cartSubtotalPix={cartSubtotalPix}
        cartSubtotalRaw={cartSubtotalRaw}
        selectedRegion={selectedRegion}
        onOpenCart={() => setIsCartOpen(true)}
        onHomeClick={() => {
          setSelectedCategory('Todos');
          setSearchQuery('');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onCategoriesClick={scrollToDepartments}
        onSearchClick={focusMobileSearch}
      />

      {/* 4. Carrinho Lateral (Drawer) & Fluxo de Checkout Híbrido com Cálculo de Frete por Localidade */}
      <CartAndCheckoutDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        selectedRegion={selectedRegion}
        onSelectRegion={handleSelectRegion}
        regions={regions}
      />


      {/* Toast de Feedback Visual Rápido ao Adicionar Produto */}
      {toastProduct && !isCartOpen && (
        <div className="hidden md:flex fixed bottom-20 right-5 z-40 bg-[#121212] text-white border border-[#10B981] rounded-2xl p-4 shadow-2xl max-w-xs items-center gap-3">
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
            type="button"
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
