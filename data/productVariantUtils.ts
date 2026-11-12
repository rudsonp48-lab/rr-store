import { Product } from '../types/store';
import { PRODUCTS } from './mockData';

export interface ColorSwatch {
  id: string;
  name: string;
  hex: string;
  secondaryHex?: string;
  borderHex?: string;
  glowColor?: string;
  targetProductId?: string;
  inStock?: boolean;
}

export interface StorageTier {
  id: string;
  label: string;
  price?: number;
  targetProductId?: string;
}

export interface ProductVariantConfig {
  isTechDevice: boolean;
  hasColorOptions: boolean;
  hasStorageOptions: boolean;
  currentColor: ColorSwatch | null;
  availableColors: ColorSwatch[];
  currentStorage: StorageTier | null;
  availableStorages: StorageTier[];
  officialSpecBadge?: string;
  modelFamilyName: string;
  variantSummaryLabel?: string;
  siblings: Product[];
}

// Catálogo Mestre de Cores Oficiais com Acabamento e HEX Metálico Realista
const COLOR_DEFINITIONS: Record<
  string,
  { name: string; hex: string; secondaryHex?: string; borderHex?: string; glowColor?: string }
> = {
  bordo: {
    name: 'Bordô',
    hex: '#5C1D2E',
    borderHex: '#3E121E',
    glowColor: 'rgba(92, 29, 46, 0.45)',
  },
  'laranja-cosmico': {
    name: 'Laranja Cósmico',
    hex: '#E36836',
    borderHex: '#C44F1F',
    glowColor: 'rgba(227, 104, 54, 0.45)',
  },
  'azul-intenso': {
    name: 'Azul Intenso',
    hex: '#234975',
    borderHex: '#173354',
    glowColor: 'rgba(35, 73, 117, 0.45)',
  },
  azul: {
    name: 'Azul',
    hex: '#28496E',
    borderHex: '#1B3450',
    glowColor: 'rgba(40, 73, 110, 0.45)',
  },
  'sky-blue': {
    name: 'Sky Blue (Azul Céu)',
    hex: '#8BB8D6',
    borderHex: '#6899BA',
    glowColor: 'rgba(139, 184, 214, 0.45)',
  },
  'azul-celeste': {
    name: 'Azul Celeste',
    hex: '#387BB2',
    borderHex: '#265E8C',
    glowColor: 'rgba(56, 123, 178, 0.45)',
  },
  'azul-indigo': {
    name: 'Azul (Índigo)',
    hex: '#284364',
    borderHex: '#1A2F49',
    glowColor: 'rgba(40, 67, 100, 0.45)',
  },
  silver: {
    name: 'Silver (Prateado)',
    hex: '#E2E4E8',
    borderHex: '#CBD0D8',
    glowColor: 'rgba(226, 228, 232, 0.55)',
  },
  starlight: {
    name: 'Starlight (Estelar)',
    hex: '#EFE7DE',
    borderHex: '#D9CFBF',
    glowColor: 'rgba(239, 231, 222, 0.45)',
  },
  midnight: {
    name: 'Midnight (Meia-Noite)',
    hex: '#19202B',
    borderHex: '#0F151E',
    glowColor: 'rgba(25, 32, 43, 0.55)',
  },
  preto: {
    name: 'Preto / Space Black',
    hex: '#1C1C1E',
    borderHex: '#0A0A0A',
    glowColor: 'rgba(28, 28, 30, 0.55)',
  },
  grafite: {
    name: 'Grafite / Space Gray',
    hex: '#4B4D53',
    borderHex: '#36383D',
    glowColor: 'rgba(75, 77, 83, 0.45)',
  },
  'titanium-gray': {
    name: 'Titanium Gray',
    hex: '#727479',
    borderHex: '#57595D',
    glowColor: 'rgba(114, 116, 121, 0.45)',
  },
  'tit-natural': {
    name: 'Titânio Natural',
    hex: '#9E9B94',
    borderHex: '#7E7A73',
    glowColor: 'rgba(158, 155, 148, 0.45)',
  },
  'rose-gold': {
    name: 'Rose Gold',
    hex: '#E5A898',
    borderHex: '#C98878',
    glowColor: 'rgba(229, 168, 152, 0.45)',
  },
  rosa: {
    name: 'Rosa',
    hex: '#F2B8C6',
    borderHex: '#D996A6',
    glowColor: 'rgba(242, 184, 198, 0.45)',
  },
  'dourado-bordo': {
    name: 'Dourado + Pulseira Bordô',
    hex: '#CFAC4B',
    secondaryHex: '#5C1D2E',
    borderHex: '#B08E35',
    glowColor: 'rgba(207, 172, 75, 0.45)',
  },
  'ouro-dourado': {
    name: 'Gold (Dourado)',
    hex: '#D4AF37',
    borderHex: '#B8952B',
    glowColor: 'rgba(212, 175, 55, 0.45)',
  },
  citrus: {
    name: 'Citrus',
    hex: '#D2DE38',
    borderHex: '#B5C122',
    glowColor: 'rgba(210, 222, 56, 0.45)',
  },
  roxo: {
    name: 'Roxo Cósmico',
    hex: '#6B3C8C',
    borderHex: '#4E2868',
    glowColor: 'rgba(107, 60, 140, 0.45)',
  },
  'verde-gamer': {
    name: 'Verde Gamer',
    hex: '#1E7E34',
    borderHex: '#145A24',
    glowColor: 'rgba(30, 126, 52, 0.45)',
  },
  branco: {
    name: 'Branco',
    hex: '#FFFFFF',
    borderHex: '#D1D5DB',
    glowColor: 'rgba(255, 255, 255, 0.6)',
  },
  'camuflado-grey': {
    name: 'Camuflado Grey',
    hex: '#5E6360',
    borderHex: '#464B48',
    glowColor: 'rgba(94, 99, 96, 0.45)',
  },
};

/**
 * Detecta a cor oficial e específica do produto com base no seu nome, id e descrição.
 */
export function detectProductColor(product: Product): ColorSwatch | null {
  const name = product.nome;
  const desc = product.descricao || '';
  const id = product.id.toLowerCase();
  const text = `${name} ${desc} ${id}`.toLowerCase();

  // 1. Tenta extrair a cor após o hífen ' - ' no nome
  let rawColor = '';
  if (name.includes(' - ')) {
    const parts = name.split(' - ');
    const lastPart = parts[parts.length - 1].trim();
    // Limpa complementos como (Zerou no Estoque), (Lacrado), etc.
    const clean = lastPart
      .replace(/\(Zerou no Estoque\)/gi, '')
      .replace(/\(Lacrado\)/gi, '')
      .replace(/\(Sem Lacre e Sem Ativação\)/gi, '')
      .replace(/\(Americano [^)]+\)/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Se não for código de produto
    if (clean && !/^[A-Z0-9\/]{6,}$/.test(clean)) {
      rawColor = clean;
    }
  }

  const rawLower = rawColor.toLowerCase();

  // Mapeamento prioritário
  if (rawLower.includes('natural') || id.includes('natural')) {
    return { id: 'tit-natural', ...COLOR_DEFINITIONS['tit-natural'] };
  }
  if (rawLower.includes('dourado') && (rawLower.includes('bordô') || rawLower.includes('bordo'))) {
    return { id: 'dourado-bordo', ...COLOR_DEFINITIONS['dourado-bordo'] };
  }
  if (rawLower.includes('bordô') || rawLower.includes('bordo') || id.includes('bordo')) {
    return { id: 'bordo', ...COLOR_DEFINITIONS['bordo'] };
  }
  if (rawLower.includes('laranja') || id.includes('laranja')) {
    return { id: 'laranja-cosmico', ...COLOR_DEFINITIONS['laranja-cosmico'] };
  }
  if (rawLower.includes('sky blue') || rawLower.includes('skyblue') || id.includes('skyblue')) {
    return { id: 'sky-blue', ...COLOR_DEFINITIONS['sky-blue'] };
  }
  if (rawLower.includes('azul intenso') || id.includes('azul-intenso')) {
    return { id: 'azul-intenso', ...COLOR_DEFINITIONS['azul-intenso'] };
  }
  if (rawLower.includes('azul celeste') || id.includes('azul-celeste')) {
    return { id: 'azul-celeste', ...COLOR_DEFINITIONS['azul-celeste'] };
  }
  if (rawLower.includes('índigo') || rawLower.includes('indigo')) {
    return { id: 'azul-indigo', ...COLOR_DEFINITIONS['azul-indigo'] };
  }
  if (rawLower.includes('rose gold') || rawLower.includes('ouro rosa') || id.includes('rosegold')) {
    return { id: 'rose-gold', ...COLOR_DEFINITIONS['rose-gold'] };
  }
  if (rawLower.includes('rosa') || rawLower.includes('pink') || id.includes('-rosa')) {
    return { id: 'rosa', ...COLOR_DEFINITIONS['rosa'] };
  }
  if (rawLower.includes('ouro dourado') || rawLower.includes('gold') || rawLower.includes('dourado') || id.includes('-gold')) {
    return { id: 'ouro-dourado', ...COLOR_DEFINITIONS['ouro-dourado'] };
  }
  if (rawLower.includes('starlight') || rawLower.includes('estelar') || id.includes('starlight')) {
    return { id: 'starlight', ...COLOR_DEFINITIONS['starlight'] };
  }
  if (rawLower.includes('midnight') || id.includes('midnight')) {
    return { id: 'midnight', ...COLOR_DEFINITIONS['midnight'] };
  }
  if (rawLower.includes('citrus') || id.includes('citrus')) {
    return { id: 'citrus', ...COLOR_DEFINITIONS['citrus'] };
  }
  if (rawLower.includes('verde gamer') || id.includes('verde')) {
    return { id: 'verde-gamer', ...COLOR_DEFINITIONS['verde-gamer'] };
  }
  if (rawLower.includes('camuflado') || id.includes('camu')) {
    return { id: 'camuflado-grey', ...COLOR_DEFINITIONS['camuflado-grey'] };
  }
  if (rawLower.includes('titanium gray') || id.includes('titanium-gray')) {
    return { id: 'titanium-gray', ...COLOR_DEFINITIONS['titanium-gray'] };
  }
  if (rawLower.includes('grafite') || id.includes('grafite')) {
    return { id: 'grafite', ...COLOR_DEFINITIONS['grafite'] };
  }
  if (rawLower.includes('gray') || rawLower.includes('cinza') || id.includes('gray')) {
    return { id: 'grafite', ...COLOR_DEFINITIONS['grafite'], name: 'Space Gray' };
  }
  if (rawLower.includes('silver') || rawLower.includes('pratead') || id.includes('silver')) {
    return { id: 'silver', ...COLOR_DEFINITIONS['silver'] };
  }
  if (rawLower.includes('branco') || rawLower.includes('white') || id.includes('branco')) {
    return { id: 'branco', ...COLOR_DEFINITIONS['branco'] };
  }
  if (rawLower.includes('roxo') || id.includes('roxo')) {
    return { id: 'roxo', ...COLOR_DEFINITIONS['roxo'] };
  }
  if (
    rawLower.includes('preto') ||
    rawLower.includes('preta') ||
    rawLower.includes('black') ||
    id.includes('preto') ||
    id.includes('black')
  ) {
    return { id: 'preto', ...COLOR_DEFINITIONS['preto'] };
  }
  if (rawLower.includes('azul') || id.includes('azul')) {
    return { id: 'azul', ...COLOR_DEFINITIONS['azul'] };
  }

  // Se não foi identificado pelo sufixo do nome, analisa palavras-chave no texto
  if (text.includes('bordô') || text.includes('bordo')) {
    return { id: 'bordo', ...COLOR_DEFINITIONS['bordo'] };
  }
  if (text.includes('laranja cósmico') || text.includes('laranja-cósmico')) {
    return { id: 'laranja-cosmico', ...COLOR_DEFINITIONS['laranja-cosmico'] };
  }
  if (text.includes('azul intenso') || text.includes('azul-intenso')) {
    return { id: 'azul-intenso', ...COLOR_DEFINITIONS['azul-intenso'] };
  }
  if (text.includes('céu-noturno') || text.includes('ceu-noturno')) {
    return { id: 'preto', ...COLOR_DEFINITIONS['preto'] };
  }
  if (text.includes('branco-estrela') || text.includes('prateado') || text.includes('silver')) {
    return { id: 'silver', ...COLOR_DEFINITIONS['silver'] };
  }
  if (text.includes('rose gold') || text.includes('rosegold')) {
    return { id: 'rose-gold', ...COLOR_DEFINITIONS['rose-gold'] };
  }
  if (text.includes('starlight')) {
    return { id: 'starlight', ...COLOR_DEFINITIONS['starlight'] };
  }
  if (text.includes('citrus')) {
    return { id: 'citrus', ...COLOR_DEFINITIONS['citrus'] };
  }
  if (text.includes('verde gamer')) {
    return { id: 'verde-gamer', ...COLOR_DEFINITIONS['verde-gamer'] };
  }

  return null;
}

/**
 * Normaliza o nome do produto para o modelo puro (removendo cor, capacidade e detalhes específicos),
 * garantindo que todas as variantes de cor e armazenamento do mesmo aparelho fiquem agrupadas em 1 único card.
 */
export function getPureModelName(productName: string): string {
  let base = productName
    .replace(/\biphone\s*18\s*duo\b/gi, 'iPhone Duo')
    .replace(/^apple\s+(?=(iphone|ipad|macbook|imac|mac mini|airpods|airtag|magic)\b)/i, '');
  if (base.includes(' - ')) {
    base = base.split(' - ')[0].trim();
  }
  // Normaliza teclado numérico com Touch ID independentemente da ordem
  if (/magic\s*keyboard/i.test(base) && /num[eé]rico/i.test(base) && /touch\s*id/i.test(base)) {
    return 'Magic Keyboard com Touch ID e Teclado Numérico';
  }
  // Remove capacidades, tamanhos de caixa de Watch, cores soltas no final e sufixos de condição/conectividade
  const pure = base
    .replace(/\(Americano[^)]*\)/gi, '')
    .replace(/\(Lacrado\)/gi, '')
    .replace(/\(Sem Lacre[^)]*\)/gi, '')
    .replace(/\(Zerou[^)]*\)/gi, '')
    .replace(/\(C[eé]u-Noturno\)/gi, '')
    .replace(/\b(128gb|256gb|512gb|1tb|2tb|64gb|32gb|240gb|16gb ram|8gb ram|4gb ram|12gb ram|16gb|8gb)\b/gi, '')
    .replace(/\b(40mm|42mm|44mm|46mm|49mm)\b/gi, '')
    .replace(/\b(wi-fi\s*\+\s*cellular|wi-fi|wifi|ssd\s+touch\s*id|ssd|tela)\b/gi, '')
    .replace(/\b(prateado|silver|preto|preta|black|natural|branco-estrela|branco|azul\s+intenso|azul|bord[oô]|laranja\s+c[oó]smico|rose\s*gold|starlight|midnight|space\s*gray|space\s*black|sky\s*blue|rosa|roxo|gold|dourado)\b$/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  return pure;
}

/**
 * Extrai a capacidade declarada no título ou descrição.
 */
export function extractStorageLabel(productName: string): string | null {
  const matchWatch = productName.match(/\b(40mm|42mm|44mm|46mm|49mm)\b/i);
  if (matchWatch) return matchWatch[1].toUpperCase();

  const matchStorage = productName.match(/\b(128GB|256GB|512GB|1TB|2TB|240GB)\b/i);
  if (matchStorage) {
    const cap = matchStorage[1].toUpperCase();
    if (/cellular/i.test(productName)) return `${cap} 5G`;
    return cap;
  }

  return null;
}

function parseStorageSortOrder(label: string): number {
  const upper = label.toUpperCase();
  if (upper.includes('TB')) return parseFloat(upper) * 1024;
  if (upper.includes('GB')) return parseFloat(upper) + (upper.includes('5G') ? 1 : 0);
  if (upper.includes('MM')) return parseFloat(upper);
  return 999;
}

/**
 * Retorna as especificações de variantes e irmãos no catálogo para o produto.
 */
export function getProductVariantConfig(
  product: Product,
  catalog: Product[] = PRODUCTS
): ProductVariantConfig {
  const pureModel = getPureModelName(product.nome);
  const currentColor = detectProductColor(product);
  const currentStorageLabel = extractStorageLabel(product.nome);

  const isApple = product.id.startsWith('rr-apple-') || product.nome.toLowerCase().includes('apple');
  const isSmartphone =
    /iphone|galaxy|redmi|poco|realme|smartphone/i.test(product.nome);
  const isWatch = /watch|relógio|smartwatch/i.test(product.nome);
  const isLaptopOrTablet = /macbook|ipad/i.test(product.nome);
  const isTechDevice = isSmartphone || isWatch || isLaptopOrTablet || isApple;

  // Busca produtos irmãos que pertencem à mesma família de modelo no catálogo
  const siblings = catalog.filter((item) => {
    return getPureModelName(item.nome).toLowerCase() === pureModel.toLowerCase();
  });

  // Mapeia Cores Reais do Catálogo em ordem fixa (para que as bolinhas nunca pulem de lugar ao clicar)
  const colorMap = new Map<string, ColorSwatch>();
  const allColorSiblings = siblings.length > 0 ? siblings : [product];

  for (const sib of allColorSiblings) {
    const sibColor = detectProductColor(sib);
    if (!sibColor) continue;
    const sibStorage = extractStorageLabel(sib.nome);
    const existing = colorMap.get(sibColor.id);
    const sibInStock = (sib.estoque ?? 0) > 0;

    if (!existing) {
      colorMap.set(sibColor.id, {
        ...sibColor,
        targetProductId: sib.id,
        inStock: sibInStock,
      });
    } else {
      // Prefere o irmão que tem a MESMA capacidade selecionada atualmente (ou que tenha estoque)
      const matchesCurrentStorage = currentStorageLabel && sibStorage === currentStorageLabel;
      const existingProd = allColorSiblings.find((p) => p.id === existing.targetProductId);
      const existingMatchesStorage =
        currentStorageLabel && existingProd && extractStorageLabel(existingProd.nome) === currentStorageLabel;

      if (
        (!existing.inStock && sibInStock) ||
        (matchesCurrentStorage && !existingMatchesStorage) ||
        (matchesCurrentStorage && existingMatchesStorage && (sib.estoque ?? 0) > (existingProd?.estoque ?? 0))
      ) {
        colorMap.set(sibColor.id, {
          ...sibColor,
          targetProductId: sib.id,
          inStock: existing.inStock || sibInStock,
        });
      } else if (sibInStock) {
        existing.inStock = true;
      }
    }
  }

  // Se o próprio produto ativo tem a cor no mapa e a mesma capacidade, aponta para ele mesmo
  if (currentColor && colorMap.has(currentColor.id)) {
    const selfInStock = (product.estoque ?? 0) > 0;
    const curr = colorMap.get(currentColor.id)!;
    colorMap.set(currentColor.id, {
      ...curr,
      targetProductId: product.id,
      inStock: selfInStock || curr.inStock,
    });
  }

  const availableColors = Array.from(colorMap.values());
  const hasColorOptions = availableColors.length > 1;

  // Mapeia Capacidades Reais do Catálogo ordenadas (128GB -> 256GB -> 512GB / 40MM -> 44MM)
  const storageMap = new Map<string, StorageTier>();
  for (const sib of allColorSiblings) {
    const sibStorage = extractStorageLabel(sib.nome);
    if (!sibStorage) continue;
    const sibColor = detectProductColor(sib);
    const existing = storageMap.get(sibStorage);

    if (!existing) {
      storageMap.set(sibStorage, {
        id: sibStorage.toLowerCase(),
        label: sibStorage,
        price: sib.precoPix,
        targetProductId: sib.id,
      });
    } else {
      // Prefere o irmão que tem a MESMA cor selecionada atualmente
      const matchesCurrentColor = currentColor && sibColor?.id === currentColor.id;
      const existingProd = allColorSiblings.find((p) => p.id === existing.targetProductId);
      const existingMatchesColor =
        currentColor && existingProd && detectProductColor(existingProd)?.id === currentColor.id;

      if (matchesCurrentColor && !existingMatchesColor) {
        storageMap.set(sibStorage, {
          id: sibStorage.toLowerCase(),
          label: sibStorage,
          price: sib.precoPix,
          targetProductId: sib.id,
        });
      }
    }
  }

  if (currentStorageLabel && storageMap.has(currentStorageLabel)) {
    storageMap.set(currentStorageLabel, {
      ...storageMap.get(currentStorageLabel)!,
      price: product.precoPix,
      targetProductId: product.id,
    });
  }

  const availableStorages = Array.from(storageMap.values()).sort(
    (a, b) => parseStorageSortOrder(a.label) - parseStorageSortOrder(b.label)
  );
  const hasStorageOptions = availableStorages.length > 1;

  // Resumo estilo vitrine Apple ("256GB a 512GB · 4 cores")
  const summaryParts: string[] = [];
  if (availableStorages.length > 1) {
    summaryParts.push(
      `${availableStorages[0].label} a ${availableStorages[availableStorages.length - 1].label}`
    );
  } else if (availableStorages.length === 1) {
    summaryParts.push(availableStorages[0].label);
  }
  if (availableColors.length > 1) {
    summaryParts.push(`${availableColors.length} cores`);
  }
  const variantSummaryLabel = summaryParts.length > 0 ? summaryParts.join(' · ') : undefined;

  // Badge de especificação oficial se não houver múltiplos botões
  let officialSpecBadge = '';
  if (currentStorageLabel) {
    if (isWatch) {
      officialSpecBadge = `Caixa ${currentStorageLabel}`;
    } else {
      // Extrai RAM se existir (ex: 8GB RAM, 12GB RAM)
      const ramMatch = product.nome.match(/\b(\d+GB\s+RAM)\b/i);
      officialSpecBadge = ramMatch
        ? `${currentStorageLabel} • ${ramMatch[1].toUpperCase()}`
        : `${currentStorageLabel} Oficial`;
    }
  } else if (isApple && !isTechDevice) {
    officialSpecBadge = '100% Original Apple';
  }

  return {
    isTechDevice,
    hasColorOptions,
    hasStorageOptions,
    currentColor,
    availableColors,
    currentStorage: currentStorageLabel
      ? {
          id: currentStorageLabel.toLowerCase(),
          label: currentStorageLabel,
          price: product.precoPix,
          targetProductId: product.id,
        }
      : null,
    availableStorages,
    officialSpecBadge,
    modelFamilyName: pureModel,
    variantSummaryLabel,
    siblings: allColorSiblings,
  };
}

/**
 * Cria uma cópia do produto com a variante selecionada (se não for irmão direto no catálogo).
 */
export function buildConfiguredProduct(
  baseProduct: Product,
  selectedColor?: ColorSwatch | null,
  selectedStorage?: StorageTier | null
): Product {
  let nome = baseProduct.nome;

  // Se o usuário selecionou uma cor diferente, reflete no nome com elegância
  if (selectedColor && !nome.toLowerCase().includes(selectedColor.name.toLowerCase())) {
    const baseClean = nome.split(' - ')[0];
    nome = `${baseClean} - ${selectedColor.name}`;
  }

  return {
    ...baseProduct,
    nome,
  };
}
