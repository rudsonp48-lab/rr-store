'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  BadgeDollarSign,
  Check,
  ChevronLeft,
  Heart,
  MapPin,
  Menu,
  Plus,
  Search,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  X,
} from 'lucide-react';
import { CategoryId, CategoryInfo, DFRegion, Product } from '../types/store';
import { formatBRL } from '../data/mockData';

interface Props {
  category: CategoryId;
  categories: CategoryInfo[];
  allProducts: Product[];
  selectedRegion: DFRegion;
  cartCount: number;
  onSelectCategory: (cat: CategoryId) => void;
  onAddToCart: (product: Product, qty?: number) => void;
  onSelectProduct: (product: Product) => void;
  onOpenCart: () => void;
}

interface CategoryMeta {
  curator: string;
  tagline: string;
  displayTitle1: string;
  displayTitle2: string;
  description: string;
  location: string;
  heroImages: string[];
  aboutHeading: string;
  aboutQuote: string;
  aboutPara1: string;
  aboutPara2: string;
  aboutImage: string;
  quoteText: string;
  quoteAuthor: string;
  guides: {
    date: string;
    title: string;
    summary: string;
    image: string;
  }[];
}

const CATEGORY_METAS: Record<string, CategoryMeta> = {
  'Eletrônicos & Smartphones': {
    curator: 'Joias Apple & Tech',
    tagline: 'Linha iPhone 17/18, Watches, MacBooks & Mais',
    displayTitle1: 'ELETRÔNICOS &',
    displayTitle2: 'SMARTPHONES',
    description:
      'Aparelhos selecionados a dedo com processadores de altíssima performance, câmeras Pro cinematográficas e acabamento em titânio aeroespacial. Pronta-entrega expressa no mesmo dia em Brasília-DF.',
    location: 'Brasília-DF • Motoboy Express 45–90 min',
    heroImages: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=2000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=2000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=2000&auto=format&fit=crop',
    ],
    aboutHeading: 'Originais com Garantia & Procedência',
    aboutQuote: 'Cada aparelho passa por rigorosa checagem de lote e número de série antes da liberação.',
    aboutPara1:
      'Na RR Mobile, entendemos que adquirir um novo iPhone ou eletrônico é um investimento em produtividade, segurança e estilo. Trabalhamos exclusivamente com unidades 100% originais, novas e lacradas, prontas para ativação direta no suporte oficial.',
    aboutPara2:
      'Garantimos a entrega mais rápida de Brasília, com pagamento 100% no PIX ou parcelamento em até 12x no cartão na maquininha na entrega.',
    aboutImage:
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=1900&auto=format&fit=crop',
    quoteText:
      'A tecnologia mais avançada não é a que você vê, mas a que transforma o seu dia a dia com perfeição.',
    quoteAuthor: 'Steve Jobs',
    guides: [
      {
        date: '03.11',
        title: 'Guia de Migração: Como transferir seus dados para o novo iPhone com segurança',
        summary:
          'Aprenda o passo a passo para clonar seu aparelho anterior pelo Início Rápido sem perder nenhum app ou conversa.',
        image:
          'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?q=80&w=1900&auto=format&fit=crop',
      },
      {
        date: '28.10',
        title: 'Como preservar a saúde da bateria do seu smartphone acima de 90% por anos',
        summary:
          'Dicas de ouro sobre carregadores de 20W homologados, limites de recarga e dissipação térmica no clima de Brasília.',
        image:
          'https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=1900&auto=format&fit=crop',
      },
      {
        date: '24.10',
        title: 'iPhone Americano (eSIM) vs Nacional: O que muda na prática no Brasil?',
        summary:
          'Tudo o que você precisa saber sobre o chip virtual (eSIM) na Claro, Vivo e TIM com conectividade 5G ultrarrápida.',
        image:
          'https://images.unsplash.com/photo-1556656793-08538906a9f8?q=80&w=1900&auto=format&fit=crop',
      },
      {
        date: '19.10',
        title: 'Apple Watch Series vs Ultra: Qual escolher para o seu estilo de vida?',
        summary:
          'Comparativo completo entre acabamento em alumínio, titânio, resistência à água e autonomia de bateria no dia a dia.',
        image:
          'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=1900&auto=format&fit=crop',
      },
    ],
  },
  'Smart Home & Iluminação': {
    curator: 'Ambientes Inteligentes',
    tagline: 'Lâmpadas Wi-Fi, Fitas LED RGB & Câmeras',
    displayTitle1: 'SMART HOME &',
    displayTitle2: 'ILUMINAÇÃO',
    description:
      'Transforme sua casa ou escritório em Brasília em um espaço moderno e acolhedor com luzes inteligentes controladas por voz e automação completa.',
    location: 'Brasília-DF • Pronta-Entrega Expressa',
    heroImages: [
      'https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=2000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=2000&auto=format&fit=crop',
    ],
    aboutHeading: 'Iluminação & Praticidade no Seu Dia a Dia',
    aboutQuote: 'Ambientes personalizados com comando de voz via Alexa ou Google Home.',
    aboutPara1:
      'A iluminação correta melhora o foco nos estudos, valoriza a decoração e cria o clima ideal para descansar no final do dia no DF.',
    aboutPara2:
      'Compatíveis com os principais ecossistemas do mercado, com instalação plug-and-play e aplicativo intuitivo.',
    aboutImage:
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=1900&auto=format&fit=crop',
    quoteText: 'O conforto de um lar inteligente começa com a luz certa no momento exato.',
    quoteAuthor: 'RR Ambient Design',
    guides: [
      {
        date: '01.11',
        title: 'Como criar rotinas de despertar gradual com lâmpadas inteligentes',
        summary: 'Melhore a qualidade do seu sono simulando o nascer do sol no quarto.',
        image:
          'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=1900&auto=format&fit=crop',
      },
      {
        date: '22.10',
        title: 'Fitas LED atrás da TV: Reduza o cansaço visual com luz indireta',
        summary: 'Como instalar fitas RGB com controle de saturação e brilho cinema.',
        image:
          'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=1900&auto=format&fit=crop',
      },
      {
        date: '15.10',
        title: 'Câmeras de segurança Wi-Fi com visão noturna e áudio bidirecional',
        summary: 'Monitore sua casa com notificações em tempo real direto no celular.',
        image:
          'https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=1900&auto=format&fit=crop',
      },
      {
        date: '10.10',
        title: 'Plugues inteligentes: Como medir o consumo de energia dos seus aparelhos',
        summary: 'Automatize eletrodomésticos e economize na conta de energia todo mês.',
        image:
          'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=1900&auto=format&fit=crop',
      },
    ],
  },
  'Moda Fitness & Athleisure': {
    curator: 'Alta Performance',
    tagline: 'Poliamida Nobre & Modelagem Anatômica',
    displayTitle1: 'MODA FITNESS &',
    displayTitle2: 'ATHLEISURE',
    description:
      'Conjuntos sem costura, leggings de alta compressão e tecidos respiráveis para treinar com máxima elegância e liberdade de movimento.',
    location: 'Brasília-DF • Entrega Hoje no DF',
    heroImages: [
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=2000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1483721074573-50630b8c2c8f?q=80&w=2000&auto=format&fit=crop',
    ],
    aboutHeading: 'Tecnologia Têxtil que Acompanha Seu Ritmo',
    aboutQuote: 'Zero transparência, toque suave e secagem ultrarrápida.',
    aboutPara1:
      'Selecionamos tecidos com elastano de recuperação imediata para suportar desde treinos pesados de musculação até corridas no Parque da Cidade.',
    aboutPara2:
      'Modelagens pensadas para valorizar o corpo sem apertar, com cós duplo anatômico que não enrola durante o agachamento.',
    aboutImage:
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1900&auto=format&fit=crop',
    quoteText: 'Disciplina é a ponte que liga seus objetivos diários às suas maiores conquistas.',
    quoteAuthor: 'RR Performance',
    guides: [
      {
        date: '02.11',
        title: 'Como escolher o top com a sustentação certa para corrida e HIIT',
        summary: 'Evite impactos e desconforto com alças reforçadas e bojos removíveis.',
        image:
          'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1900&auto=format&fit=crop',
      },
      {
        date: '25.10',
        title: 'Cuidados de lavagem para manter suas peças fitness como novas por anos',
        summary: 'Como lavar tecidos técnicos sem danificar a elasticidade e as cores.',
        image:
          'https://images.unsplash.com/photo-1483721074573-50630b8c2c8f?q=80&w=1900&auto=format&fit=crop',
      },
      {
        date: '18.10',
        title: 'Athleisure: Como combinar roupas de treino no look casual do dia a dia',
        summary: 'Dicas para transitar da academia para compromissos informais com estilo.',
        image:
          'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1900&auto=format&fit=crop',
      },
      {
        date: '12.10',
        title: 'Tecidos térmicos: Como treinar ao ar livre nas manhãs frias de Brasília',
        summary: 'Mantenha o corpo aquecido sem reter suor com as camadas certas.',
        image:
          'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1900&auto=format&fit=crop',
      },
    ],
  },
  'Suplementos & Nutrição': {
    curator: 'Nutrição de Alto Nível',
    tagline: 'Creatina Pura, Whey Protein & Pré-Treinos',
    displayTitle1: 'SUPLEMENTOS &',
    displayTitle2: 'NUTRIÇÃO',
    description:
      'Produtos certificados com laudos laboratoriais para garantir máxima pureza, força muscular e rápida recuperação física no seu dia a dia.',
    location: 'Brasília-DF • Motoboy Express 45–90 min',
    heroImages: [
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=2000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=2000&auto=format&fit=crop',
    ],
    aboutHeading: 'Pureza Comprovada em Cada Dose',
    aboutQuote: 'Marcas renomadas com matéria-prima importada e alta solubilidade.',
    aboutPara1:
      'Nutrir seu corpo com creatina 100% monohidratada e proteínas com excelente aminograma é o caminho mais seguro para ganhar massa magra e saúde.',
    aboutPara2:
      'Receba seu suplemento em casa ou na academia em Brasília antes do próximo treino.',
    aboutImage:
      'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?q=80&w=1900&auto=format&fit=crop',
    quoteText: 'O seu corpo é o único lugar que você tem para viver. Nutra-o com excelência.',
    quoteAuthor: 'RR Nutrição',
    guides: [
      {
        date: '31.10',
        title: 'Creatina: Tomar antes ou depois do treino? O que a ciência diz',
        summary: 'Entenda como funciona o efeito acumulativo nas fibras musculares.',
        image:
          'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1900&auto=format&fit=crop',
      },
      {
        date: '26.10',
        title: 'Whey Isolado vs Concentrado: Qual é o ideal para o seu objetivo?',
        summary: 'Diferenças de filtragem, teor de carboidratos e velocidade de absorção.',
        image:
          'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=1900&auto=format&fit=crop',
      },
      {
        date: '19.10',
        title: 'Como evitar o efeito rebote do pré-treino e treinar com foco máximo',
        summary: 'Dicas sobre dosagem de cafeína e hidratação com eletrólitos no DF.',
        image:
          'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?q=80&w=1900&auto=format&fit=crop',
      },
      {
        date: '11.10',
        title: 'Glutamina e imunidade: Vale a pena para quem treina pesado?',
        summary: 'Benefícios comprovados para a saúde intestinal e recuperação celular.',
        image:
          'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1900&auto=format&fit=crop',
      },
    ],
  },
};

const DEFAULT_META: CategoryMeta = {
  curator: 'Curadoria RR Mobile',
  tagline: 'Seleção Premium para Brasília-DF',
  displayTitle1: 'PRODUTOS',
  displayTitle2: 'SELECIONADOS',
  description:
    'Itens testados e aprovados para atender a sua rotina com qualidade superior, garantia oficial e entrega expressa em todo o Distrito Federal.',
  location: 'Brasília-DF • Motoboy 45–90 min',
  heroImages: [
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=2069&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1935&auto=format&fit=crop',
  ],
  aboutHeading: 'Qualidade que Faz a Diferença',
  aboutQuote: 'Cada produto do catálogo atende a um rigoroso padrão de procedência.',
  aboutPara1:
    'Trabalhamos para que você receba o que há de melhor em Brasília, sem precisar esperar semanas por fretes tradicionais de fora do estado.',
  aboutPara2:
    'Pagamento 100% no PIX com preço de atacado real ou parcelamento flexível em até 12x na entrega.',
  aboutImage:
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1935&auto=format&fit=crop',
  quoteText: 'O estilo e a qualidade que você escolhe hoje definem a confiança do seu amanhã.',
  quoteAuthor: 'RR Mobile Store',
  guides: [
    {
      date: '02.11',
      title: 'Como funciona a entrega expressa via Motoboy no mesmo dia no DF',
      summary: 'Seu pedido separado, embalado e despachado em 45 a 90 minutos para Asa Sul, Norte, Águas Claras e cidades satélites.',
      image:
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1900&auto=format&fit=crop',
    },
    {
      date: '27.10',
      title: 'Vantagens do pagamento no PIX sem fiado: Economia real de atacado',
      summary: 'Entenda como repassamos os melhores descontos diretamente na vitrine.',
      image:
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1900&auto=format&fit=crop',
    },
    {
      date: '20.10',
      title: 'Dúvidas sobre garantia: Como funciona o suporte e a nota da sua compra',
      summary: 'Transparência total desde a separação do produto até o pós-venda dedicado.',
      image:
        'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?q=80&w=1900&auto=format&fit=crop',
    },
    {
      date: '14.10',
      title: 'Dicas para compras seguras e conferência de lote no ato do recebimento',
      summary: 'Confira seu pedido na presença do entregador e pague com comodidade.',
      image:
        'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=1900&auto=format&fit=crop',
    },
  ],
};

export default function CategoryShowcaseLayout({
  category,
  categories,
  allProducts,
  selectedRegion,
  cartCount,
  onSelectCategory,
  onAddToCart,
  onSelectProduct,
  onOpenCart,
}: Props) {
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [addedAnimationId, setAddedAnimationId] = useState<string | null>(null);

  // Metadados dinâmicos para a categoria ativa
  const meta: CategoryMeta = useMemo(() => {
    if (CATEGORY_METAS[category]) return CATEGORY_METAS[category];

    // Cria metadados elegantes caso seja outra categoria
    const parts = category.split('&');
    const p1 = (parts[0] || category).trim().toUpperCase();
    const p2 = (parts[1] || 'PREMIUM').trim().toUpperCase();

    return {
      ...DEFAULT_META,
      curator: `Coleção ${category}`,
      tagline: `Seleção Especial de ${category}`,
      displayTitle1: p1,
      displayTitle2: p2,
      description: `Produtos selecionados de ${category} para você receber hoje em Brasília com preço de atacado no PIX e entrega expressa.`,
    };
  }, [category]);

  // Produtos pertencentes a esta categoria
  const categoryProducts = useMemo(() => {
    return allProducts.filter((p) => p.categoria === category);
  }, [allProducts, category]);

  // Produtos filtrados por busca interna
  const displayProducts = useMemo(() => {
    if (!searchQuery.trim()) return categoryProducts;
    const q = searchQuery.toLowerCase().trim();
    return categoryProducts.filter(
      (p) =>
        p.nome.toLowerCase().includes(q) ||
        p.descricao.toLowerCase().includes(q) ||
        (p.tag && p.tag.toLowerCase().includes(q))
    );
  }, [categoryProducts, searchQuery]);

  // Alterna wishlist
  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Efeito de scroll reveal
  useEffect(() => {
    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('active');
      }, index * 80);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    revealElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [category]);

  // Rolagem suave para os produtos
  const scrollToProducts = () => {
    const el = document.getElementById('categoria-vitrine-produtos');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, 1);
    setAddedAnimationId(product.id);
    setTimeout(() => {
      setAddedAnimationId(null);
    }, 1200);
  };

  return (
    <div className="bg-[#121212] text-[#f5f5f5] min-h-screen overflow-x-hidden selection:bg-[#e0a87e] selection:text-black">
      {/* 1. Glass Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-nav transition-all duration-300" id="navbar">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 h-16 sm:h-20 flex items-center justify-between gap-3">
          {/* Links Left */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 text-xs font-semibold tracking-widest uppercase text-white/60">
            <button
              type="button"
              onClick={() => onSelectCategory('Todos')}
              className="hover:text-[#e0a87e] transition-colors flex items-center gap-1.5 cursor-pointer text-white/80"
            >
              <ChevronLeft className="w-4 h-4 text-[#e0a87e]" />
              <span>Todos Departamentos</span>
            </button>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="text-[#e0a87e] font-bold">{category}</span>
          </div>

          {/* Logo Center */}
          <div className="md:absolute md:left-1/2 md:-translate-x-1/2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSelectCategory('Todos')}
              className="text-left cursor-pointer group"
            >
              <span className="font-display text-xl sm:text-2xl font-bold tracking-widest uppercase text-white group-hover:text-[#e0a87e] transition-colors">
                RR MOBILE
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] tracking-widest text-[#e0a87e] uppercase font-bold border-l border-white/20 pl-2">
                Brasília
              </span>
            </button>
          </div>

          {/* Icons Right */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Search Input */}
            <div className="relative group">
              <input
                type="text"
                placeholder="Buscar nesta categoria..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-full py-1.5 pl-3.5 pr-8 text-xs focus:outline-none focus:border-[#e0a87e] w-32 sm:w-48 lg:w-60 transition-all duration-300 text-white placeholder-white/40"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/50 pointer-events-none" />
            </div>

            {/* Wishlist Button */}
            <button
              type="button"
              onClick={scrollToProducts}
              className="text-white/80 hover:text-[#e0a87e] transition-colors relative cursor-pointer p-1"
              title="Favoritos"
            >
              <Heart className="w-5 h-5" />
              {wishlist.size > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#e0a87e] rounded-full text-[9px] flex items-center justify-center text-black font-extrabold">
                  {wishlist.size}
                </span>
              )}
            </button>

            {/* Shopping Bag Button */}
            <button
              type="button"
              onClick={onOpenCart}
              className="text-white/80 hover:text-[#e0a87e] transition-colors relative cursor-pointer p-1"
              title="Ver Carrinho"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#e0a87e] rounded-full text-[9px] flex items-center justify-center text-black font-bold animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Categories Menu */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white p-1 cursor-pointer"
              aria-label="Abrir Categorias"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-[#e0a87e]" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu for Categories */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#18181b] border-t border-white/10 px-4 py-4 space-y-2 max-h-[70vh] overflow-y-auto">
            <p className="text-[11px] font-bold text-white/50 uppercase tracking-wider mb-2">
              Navegar Departamentos:
            </p>
            <button
              type="button"
              onClick={() => {
                onSelectCategory('Todos');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-white hover:bg-white/10 flex items-center justify-between"
            >
              <span>← Todos os Departamentos</span>
            </button>
            {categories
              .filter((c) => c.id !== 'Todos')
              .map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => {
                    onSelectCategory(c.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                    c.id === category
                      ? 'bg-[#e0a87e] text-black font-bold'
                      : 'text-white/80 hover:bg-white/5'
                  }`}
                >
                  <span>{c.nome}</span>
                  {c.id === category && <Check className="w-4 h-4 text-black" />}
                </button>
              ))}
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="w-full max-w-[1600px] mx-auto pt-20 sm:pt-24 pb-16 px-4 sm:px-6 md:px-8">
        {/* Breadcrumb Bar */}
        <div className="py-3 sm:py-4 flex items-center justify-between gap-2 text-xs text-white/50 border-b border-white/5 mb-6">
          <div className="flex items-center gap-2 truncate">
            <button
              type="button"
              onClick={() => onSelectCategory('Todos')}
              className="hover:text-[#e0a87e] text-white/70 transition-colors cursor-pointer"
            >
              Início
            </button>
            <span>/</span>
            <span className="text-white/40">Departamentos</span>
            <span>/</span>
            <span className="text-[#e0a87e] font-semibold truncate">{category}</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-white/60 shrink-0">
            <MapPin className="w-3.5 h-3.5 text-[#e0a87e]" />
            <span>Entrega: {selectedRegion.nome}</span>
          </div>
        </div>

        {/* 2. Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 min-h-[520px] md:h-[78vh] max-h-[850px] mb-8">
          {/* Left Hero Card */}
          <div className="reveal lg:col-span-5 bg-[#3a3532] rounded-[2rem] p-7 sm:p-10 md:p-12 lg:p-14 flex flex-col justify-center relative overflow-hidden group shadow-2xl border border-white/5">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-[#e0a87e]/15 rounded-full blur-[90px] pointer-events-none" />

            <div className="relative z-10">
              <p className="font-script text-2xl sm:text-3xl md:text-4xl text-[#e0a87e] mb-3 rotate-[-2deg]">
                {meta.curator}
              </p>
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold uppercase leading-[0.92] tracking-tight mb-6 text-white">
                {meta.displayTitle1}
                <br />
                <span className="text-white/90">{meta.displayTitle2}</span>
              </h1>
              <p className="text-white/70 text-xs sm:text-sm max-w-sm leading-relaxed mb-8">
                {meta.description}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={scrollToProducts}
                  className="bg-[#e0a87e] hover:bg-white hover:scale-105 text-black font-semibold text-xs sm:text-sm uppercase tracking-wide px-7 py-3.5 rounded-full transition-all duration-300 shadow-[0_10px_30px_rgba(224,168,126,0.3)] w-fit flex items-center gap-2 cursor-pointer"
                >
                  <span>Ver {categoryProducts.length} Produtos</span>
                  <ArrowDown className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onSelectCategory('Todos')}
                  className="bg-white/5 hover:bg-white/10 text-white/80 text-xs uppercase tracking-wider px-5 py-3.5 rounded-full border border-white/10 transition-colors cursor-pointer"
                >
                  Outros Departamentos
                </button>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/10 flex items-center gap-3 opacity-70">
              <MapPin className="w-4 h-4 text-[#e0a87e]" />
              <span className="text-xs font-medium uppercase tracking-wider text-white/80">
                {meta.location}
              </span>
            </div>
          </div>

          {/* Right Hero Image Card */}
          <div className="reveal delay-100 lg:col-span-7 relative rounded-[2rem] overflow-hidden group h-[380px] sm:h-[450px] lg:h-auto border border-white/5 shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={meta.heroImages[currentImgIdx] || meta.heroImages[0]}
              alt={category}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Category Tag pill */}
            <div className="absolute top-6 left-6 z-10">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-[#e0a87e] border border-[#e0a87e]/30 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                {meta.tagline}
              </span>
            </div>

            {/* Floating Top-Right Button */}
            <div className="absolute top-6 right-6">
              <button
                type="button"
                onClick={scrollToProducts}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 hover:bg-white hover:text-black transition-all duration-300 group/btn cursor-pointer"
                title="Descer para produtos"
              >
                <ArrowUpRight className="w-5 h-5 group-hover/btn:rotate-45 transition-transform" />
              </button>
            </div>

            {/* Floating Image Slider Controls */}
            {meta.heroImages.length > 1 && (
              <div className="absolute bottom-6 right-6 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentImgIdx((prev) => (prev === 0 ? meta.heroImages.length - 1 : prev - 1))
                  }
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform cursor-pointer shadow-lg"
                  title="Imagem anterior"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentImgIdx((prev) => (prev === meta.heroImages.length - 1 ? 0 : prev + 1))
                  }
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/60 backdrop-blur text-white flex items-center justify-center border border-white/20 hover:bg-[#e0a87e] hover:border-[#e0a87e] hover:text-black transition-colors cursor-pointer"
                  title="Próxima imagem"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Pagination Dots */}
            {meta.heroImages.length > 1 && (
              <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                {meta.heroImages.map((_, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setCurrentImgIdx(i)}
                    className={`transition-all duration-300 rounded-full cursor-pointer ${
                      i === currentImgIdx ? 'w-1.5 h-6 bg-[#e0a87e]' : 'w-1.5 h-1.5 bg-white/30'
                    }`}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 3. Features Banner */}
        <section className="reveal delay-200 py-12 sm:py-16 px-4 md:px-6 border-b border-white/5 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="flex flex-col items-center text-center gap-3.5 group">
              <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-[#e0a87e] group-hover:bg-[#e0a87e] group-hover:text-black transition-all duration-300">
                <Truck className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
                Entrega 45–90 min DF
              </span>
              <p className="text-[11px] text-white/40">Motoboy Express no mesmo dia</p>
            </div>

            <div className="flex flex-col items-center text-center gap-3.5 group">
              <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-[#e0a87e] group-hover:bg-[#e0a87e] group-hover:text-black transition-all duration-300">
                <BadgeDollarSign className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
                Preço Atacado no PIX
              </span>
              <p className="text-[11px] text-white/40">Desconto máximo à vista sem fiado</p>
            </div>

            <div className="flex flex-col items-center text-center gap-3.5 group">
              <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-[#e0a87e] group-hover:bg-[#e0a87e] group-hover:text-black transition-all duration-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
                100% Originais
              </span>
              <p className="text-[11px] text-white/40">Garantia oficial e lote lacrado</p>
            </div>

            <div className="flex flex-col items-center text-center gap-3.5 group">
              <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-[#e0a87e] group-hover:bg-[#e0a87e] group-hover:text-black transition-all duration-300">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
                Pagamento Seguro
              </span>
              <p className="text-[11px] text-white/40">Pague no PIX ou Cartão em até 12x</p>
            </div>
          </div>
        </section>

        {/* 4. About Category Section */}
        <section className="py-16 sm:py-20 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Text */}
            <div className="reveal">
              <span className="font-script text-2xl sm:text-3xl text-[#e0a87e] block mb-2">
                Qualidade & Procedência
              </span>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold uppercase mb-6 text-white">
                {meta.aboutHeading}
              </h2>
              <p className="text-xs sm:text-sm font-medium text-white/60 mb-6 border-l-2 border-[#e0a87e] pl-4">
                {meta.aboutQuote}
              </p>
              <div className="space-y-4 text-white/70 text-xs sm:text-sm leading-relaxed">
                <p>{meta.aboutPara1}</p>
                <p>{meta.aboutPara2}</p>
              </div>

              <div className="mt-8 flex items-center gap-4">
                <button
                  type="button"
                  onClick={scrollToProducts}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white text-white hover:text-black text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer"
                >
                  <span>Explorar Estoque DF</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Image Composition */}
            <div className="reveal delay-100 relative">
              <div className="absolute -top-4 -right-4 w-24 h-48 bg-[#e0a87e] rounded-r-2xl z-0" />
              <div className="relative z-10 rounded-2xl overflow-hidden h-[360px] sm:h-[460px] border border-white/10 shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={meta.aboutImage}
                  alt={category}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 5. Products Showcase Section — "Last Arrivals" (White Card Section) */}
        <section
          id="categoria-vitrine-produtos"
          className="reveal bg-white text-black rounded-[2.5rem] p-6 sm:p-10 md:p-14 lg:p-16 mb-20 relative overflow-hidden shadow-2xl"
        >
          {/* Section Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6 border-b border-neutral-200 pb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e0a87e]/20 text-[#a35e3a] text-xs font-bold uppercase tracking-wider mb-2">
                <span>Vitrine da Categoria</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight text-neutral-900 mb-2">
                {category}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 max-w-lg">
                Exibindo {displayProducts.length} itens disponíveis para entrega imediata em Brasília-DF.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              <button
                type="button"
                onClick={() => onSelectCategory('Todos')}
                className="px-5 py-2.5 rounded-full bg-neutral-100 hover:bg-[#e0a87e] text-neutral-800 hover:text-black font-semibold text-xs uppercase tracking-wide transition-all duration-300 flex items-center gap-2 cursor-pointer border border-neutral-200"
              >
                <span>Todos Departamentos</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Product Grid */}
          {displayProducts.length === 0 ? (
            <div className="py-16 text-center">
              <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-700 font-bold text-base mb-1">
                Nenhum produto encontrado nesta busca.
              </p>
              <p className="text-neutral-500 text-xs mb-4">
                Tente buscar por outro termo ou limpe o filtro.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-6 py-2.5 rounded-full bg-neutral-900 text-white text-xs font-bold uppercase cursor-pointer"
              >
                Limpar Busca
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {displayProducts.map((product) => {
                const isWished = wishlist.has(product.id);
                const isJustAdded = addedAnimationId === product.id;

                return (
                  <div
                    key={product.id}
                    onClick={() => onSelectProduct(product)}
                    className="group cursor-pointer flex flex-col justify-between"
                  >
                    {/* Image Container Aspect [4/5] */}
                    <div className="bg-neutral-100 rounded-2xl p-5 sm:p-6 mb-4 relative aspect-[4/5] flex items-center justify-center transition-all duration-300 group-hover:shadow-lg border border-neutral-200/60 overflow-hidden">
                      {/* Wishlist Heart */}
                      <button
                        type="button"
                        onClick={(e) => toggleWishlist(product.id, e)}
                        className={`absolute top-3.5 right-3.5 p-2 rounded-full transition-colors z-10 ${
                          isWished
                            ? 'text-red-500 bg-white shadow-sm'
                            : 'text-neutral-400 hover:text-red-500 hover:bg-white'
                        }`}
                        title="Favoritar"
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>

                      {/* Tag pill */}
                      {product.tag && (
                        <div className="absolute top-3.5 left-3.5 z-10">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-neutral-900 text-white">
                            {product.tag}
                          </span>
                        </div>
                      )}

                      {/* Product Image */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.imagem}
                        alt={product.nome}
                        loading="lazy"
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>

                    {/* Information */}
                    <div>
                      <div className="mb-2">
                        <h3 className="font-bold text-sm text-neutral-900 group-hover:text-[#a35e3a] transition-colors line-clamp-2 leading-tight">
                          {product.nome}
                        </h3>
                        <p className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">
                          Pronta-entrega DF • {selectedRegion.tempoEstimado}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-extrabold text-base text-neutral-950">
                              {formatBRL(product.precoPix)}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-600 uppercase">
                              no PIX
                            </span>
                          </div>
                          {product.parcelamento && (
                            <p className="text-[10px] text-neutral-400 leading-none">
                              {product.parcelamento}
                            </p>
                          )}
                        </div>

                        {/* Quick Add Button */}
                        <button
                          type="button"
                          onClick={(e) => handleQuickAdd(product, e)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer shadow-sm ${
                            isJustAdded
                              ? 'bg-emerald-500 text-white scale-110'
                              : 'bg-[#e0a87e]/20 hover:bg-[#e0a87e] text-neutral-900'
                          }`}
                          title="Adicionar ao Carrinho"
                        >
                          {isJustAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 6. Quote Banner */}
        <section className="reveal relative h-[360px] md:h-[400px] rounded-[2.5rem] overflow-hidden flex items-center justify-center text-center px-4 sm:px-8 mb-20 shadow-2xl border border-white/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?q=80&w=2073&auto=format&fit=crop"
            alt="Texture background"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px]" />

          <div className="relative z-10 max-w-3xl">
            <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-bold uppercase leading-tight tracking-tight mb-6 text-white">
              &ldquo;{meta.quoteText}&rdquo;
            </h2>
            <p className="font-script text-2xl sm:text-3xl text-[#e0a87e] rotate-[-2deg]">
              {meta.quoteAuthor}
            </p>
          </div>
        </section>

        {/* 7. Blog / Guides Section */}
        <section className="mb-20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
            <div>
              <span className="font-script text-2xl text-[#e0a87e] block">
                Conteúdo & Recomendações
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-tight text-white">
                Guia do Especialista
              </h2>
              <p className="text-xs text-white/50 mt-1">
                Orientações práticas, comparativos e cuidados para seus produtos em Brasília.
              </p>
            </div>

            <button
              type="button"
              onClick={scrollToProducts}
              className="px-6 py-2.5 rounded-full border border-[#e0a87e] text-[#e0a87e] hover:bg-[#e0a87e] hover:text-black font-semibold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer"
            >
              Ver Produtos da Categoria →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
            {meta.guides.map((guide, idx) => (
              <div
                key={idx}
                className="group reveal cursor-pointer grid grid-cols-1 sm:grid-cols-2 gap-5 items-center p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#e0a87e]/30 transition-colors"
                onClick={scrollToProducts}
              >
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-neutral-900">
                  <div className="absolute top-3 right-3 bg-white text-black text-[10px] font-bold px-2 py-0.5 rounded shadow z-10">
                    {guide.date}
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={guide.image}
                    alt={guide.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-base mb-2 leading-snug group-hover:text-[#e0a87e] transition-colors text-white">
                    {guide.title}
                  </h3>
                  <p className="text-xs text-white/50 mb-4 line-clamp-2 leading-relaxed">
                    {guide.summary}
                  </p>
                  <span className="inline-block px-3.5 py-1.5 rounded-full border border-white/20 text-[10px] font-bold uppercase tracking-wider text-white/80 group-hover:bg-[#e0a87e] group-hover:text-black group-hover:border-[#e0a87e] transition-all">
                    Ler Guia
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 8. Bottom Category Switcher */}
        <section className="p-8 sm:p-12 rounded-[2rem] bg-gradient-to-br from-[#1e1c1b] to-[#121212] border border-white/10 text-center mb-12">
          <span className="font-script text-2xl text-[#e0a87e] mb-2 block">
            Explore Mais em Brasília
          </span>
          <h3 className="font-display text-2xl sm:text-3xl font-bold uppercase text-white mb-4">
            Deseja ver outros departamentos?
          </h3>
          <p className="text-xs sm:text-sm text-white/60 max-w-lg mx-auto mb-6">
            Navegue por todas as categorias oficiais da RR Mobile com entrega expressa via Motoboy no mesmo dia no DF.
          </p>

          <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
            <button
              type="button"
              onClick={() => onSelectCategory('Todos')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#e0a87e] text-black hover:bg-white transition-colors cursor-pointer"
            >
              Todos os Departamentos
            </button>
            {categories
              .filter((c) => c.id !== 'Todos' && c.id !== category)
              .map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => {
                    onSelectCategory(c.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/15 text-white/80 border border-white/10 transition-colors cursor-pointer"
                >
                  {c.nome}
                </button>
              ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#1a1a1a] border-t border-white/5 pt-14 pb-12">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="space-y-4">
              <span className="font-display text-2xl font-bold tracking-widest uppercase text-white">
                RR MOBILE
              </span>
              <p className="text-xs text-white/50 leading-relaxed">
                Tudo o que seu dia a dia em Brasília precisa, na velocidade de um clique. Preço de atacado no PIX sem fiado e entrega expressa via Motoboy no DF.
              </p>
              <div className="flex items-center gap-2 text-xs text-[#e0a87e]">
                <MapPin className="w-4 h-4" />
                <span>Atendimento e Pronta-Entrega em Brasília-DF</span>
              </div>
            </div>

            {/* Departamentos */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider mb-4 text-white">
                Departamentos
              </h4>
              <ul className="space-y-2.5 text-xs text-white/50">
                {categories.slice(0, 6).map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectCategory(c.id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="hover:text-[#e0a87e] transition-colors cursor-pointer text-left"
                    >
                      {c.nome}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Informações */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider mb-4 text-white">
                Informações & Entrega
              </h4>
              <ul className="space-y-2.5 text-xs text-white/50">
                <li>Horário: Seg a Sáb 08h às 20h</li>
                <li>Entrega via Motoboy: 45 a 90 min</li>
                <li>Pagamento no PIX ou Cartão em até 12x</li>
                <li>Garantia e procedência comprovadas</li>
              </ul>
            </div>

            {/* Contato */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider mb-4 text-white">
                Central de Pedidos
              </h4>
              <p className="text-xs text-white/50 mb-3">
                Dúvidas sobre modelos, lotes ou cálculo de entrega no DF? Fale conosco direto no WhatsApp:
              </p>
              <a
                href="https://wa.me/5561998151299"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#25D366] text-black font-bold text-xs hover:bg-[#20ba59] transition-colors"
              >
                <span>Falar no WhatsApp</span>
              </a>
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-white/30">
            <p>Copyright © 2026 RR Mobile Store Brasília. Todos os direitos reservados.</p>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white hover:text-black transition-all cursor-pointer"
              title="Voltar ao topo"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
