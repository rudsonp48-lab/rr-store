import { Product } from '../types/store';

export interface ProductSpecItem {
  label: string;
  valor: string;
}

export interface ProductSeoDetails {
  isAppleOfficial: boolean;
  subtituloSeo: string;
  descricaoCompleta: string;
  fichaTecnica: ProductSpecItem[];
  beneficios: string[];
  itensInclusos: string[];
  avisosLoja?: string[];
}

export function getProductSeoDetails(product: Product): ProductSeoDetails {
  const nomeUpper = product.nome.toUpperCase();
  const isApple = product.id.startsWith('rr-apple-');

  if (isApple) {
    // Separa a descrição principal do aviso padrão RR-MOBILE
    const [rawDesc] = product.descricao.split(' | Pagamento:');
    const descricaoLimpa = rawDesc || product.descricao;

    let subtituloSeo = 'Produto Original Apple • Joias Apple RR-MOBILE Brasília';
    const fichaTecnica: ProductSpecItem[] = [
      { label: 'Marca', valor: 'Apple (Original)' },
    ];
    let itensInclusos = ['01 Produto Original Apple', 'Documentação e Acessórios de Fábrica'];
    let beneficios = [
      'Produto 100% original Apple com procedência garantida pela RR-MOBILE',
      'Desempenho de ponta e integração total com o ecossistema iOS / macOS',
      'Preço exclusivo à vista no PIX ou Dinheiro direto em Brasília-DF',
      'Suporte oficial Apple Brasil pelo telefone 0800 761 0880',
    ];

    if (nomeUpper.includes('IPHONE')) {
      const is18 = nomeUpper.includes('IPHONE 18');
      const isProMax = nomeUpper.includes('PRO MAX');
      const storage = nomeUpper.includes('512') ? '512 GB NVMe' : '256 GB NVMe';
      const tela = isProMax ? 'Super Retina XDR OLED de 6,9" (ProMotion 120Hz)' : 'Super Retina XDR OLED de 6,3" (ProMotion 120Hz)';
      const chip = is18 ? 'Chip Apple A20 Pro com Neural Engine Avançado' : 'Chip Apple A19 Pro com Apple Intelligence';

      subtituloSeo = `Smartphone Apple ${is18 ? 'iPhone 18' : 'iPhone 17'} Series • Modelo Americano 🇺🇸 • 5G e Câmera Pro 48MP`;
      fichaTecnica.push(
        { label: 'Modelo / Linha', valor: product.nome.replace(' (Americano 🇺🇸)', '') },
        { label: 'Armazenamento Interno', valor: storage },
        { label: 'Tela', valor: tela },
        { label: 'Processador', valor: chip },
        { label: 'Sistema de Câmeras', valor: 'Tripla Pro 48MP (Fusion + Ultra-Angular + Teleobjetiva) • Vídeo 4K Dolby Vision' },
        { label: 'Conectividade & Chip', valor: '5G, Wi-Fi 7, Bluetooth 5.3, NFC (Apple Pay), USB-C e eSIM (Versão EUA 🇺🇸)' },
        { label: 'Resistência', valor: 'Certificação IP68 (resistente a água até 6m por 30 min e poeira) + Ceramic Shield' }
      );
      itensInclusos = [
        `01 ${product.nome}`,
        '01 Cabo para Recarga USB-C Trançado Original Apple (1m)',
        'Documentação Apple',
      ];
    } else if (nomeUpper.includes('WATCH')) {
      const isUltra = nomeUpper.includes('ULTRA');
      const isS12 = nomeUpper.includes('SERIES 12') || nomeUpper.includes('S12');
      const isS11 = nomeUpper.includes('SERIES 11') || nomeUpper.includes('S11');
      const tamanho = nomeUpper.includes('49MM')
        ? '49 mm (Titânio Aeroespacial)'
        : nomeUpper.includes('46MM')
        ? '46 mm (Alumínio)'
        : nomeUpper.includes('44MM')
        ? '44 mm (Alumínio)'
        : nomeUpper.includes('42MM')
        ? '42 mm (Alumínio)'
        : '40 mm (Alumínio)';

      subtituloSeo = `Smartwatch Original Apple • Monitoramento Avançado de Saúde, Treinos e Notificações`;
      fichaTecnica.push(
        { label: 'Modelo', valor: product.nome.replace(' (Zerou no Estoque)', '') },
        { label: 'Tamanho da Caixa', valor: tamanho },
        {
          label: 'Mostrador / Tela',
          valor: isUltra
            ? 'Retina Sempre Ativa com Cristal de Safira Plano (até 3000 nits)'
            : 'Retina OLED de Amplo Ângulo com Vidro Ion-X Reforçado',
        },
        {
          label: 'Sensores de Saúde',
          valor: isS12 || isS11 || isUltra
            ? 'Frequência Cardíaca Óptica/Elétrica (ECG), Sinais Vitais, Sono, Temperatura e Oxigênio'
            : 'Frequência Cardíaca Óptica, Monitoramento de Sono, Detecção de Queda e Acidente',
        },
        {
          label: 'Resistência à Água',
          valor: isUltra ? 'Até 100 metros (EN13319 p/ mergulho e esportes aquáticos)' : 'Até 50 metros (Ideal para natação)',
        },
        { label: 'Conectividade', valor: 'GPS Integrado, Bluetooth 5.3, Wi-Fi e Apple Pay' }
      );
      itensInclusos = [
        `01 Caixa ${product.nome.replace(' (Zerou no Estoque)', '')}`,
        '01 Pulseira Original Apple Inclusa na Caixa',
        '01 Cabo Carregador Magnético Rápido USB-C para Apple Watch (1m)',
      ];
    } else if (nomeUpper.includes('MACBOOK') || nomeUpper.includes('MAC MINI')) {
      const isNeo = nomeUpper.includes('NEO');
      const isMini = nomeUpper.includes('MAC MINI');
      const ssd = nomeUpper.includes('512') ? '512 GB SSD NVMe Ultrarrápido' : '256 GB SSD NVMe Ultrarrápido';
      const ram = nomeUpper.includes('16GB') ? '16 GB de Memória Unificada' : '8 GB de Memória Unificada';
      const chip = nomeUpper.includes('M6')
        ? 'Chip Apple M6 de Nova Geração'
        : nomeUpper.includes('M5')
        ? 'Chip Apple M5 (Neural Engine de 16 núcleos)'
        : nomeUpper.includes('M4')
        ? 'Chip Apple M4 (CPU de 10 núcleos / GPU de 10 núcleos)'
        : 'Chip Apple A18 Pro (CPU de 6 núcleos / GPU de 5 núcleos)';

      subtituloSeo = isMini
        ? 'Desktop Compacto Apple Mac Mini • Alta Performance Profissional com macOS'
        : 'Notebook Ultrafino Apple MacBook 13" • Tela Liquid Retina e Bateria de Longa Duração';
      fichaTecnica.push(
        { label: 'Modelo', valor: product.nome },
        { label: 'Processador', valor: chip },
        { label: 'Memória RAM', valor: ram },
        { label: 'Armazenamento SSD', valor: ssd },
        {
          label: 'Tela / Vídeo',
          valor: isMini
            ? 'Suporte simultâneo para múltiplos monitores de até 6K via Thunderbolt / HDMI'
            : 'Tela Liquid Retina de 13 polegadas com True Tone e 1 bilhão de cores',
        },
        {
          label: 'Condição da Caixa',
          valor: nomeUpper.includes('SEM LACRE')
            ? 'Caixa sem lacre externa • Aparelho 100% Novo e SEM ATIVAÇÃO'
            : 'Novo • Lacrado de Fábrica',
        }
      );
      itensInclusos = isMini
        ? [`01 ${product.nome}`, '01 Cabo de Energia Original Apple']
        : [
            `01 ${product.nome}`,
            '01 Adaptador de Energia USB-C Original Apple',
            '01 Cabo de Recarga USB-C / MagSafe (2m)',
          ];
    } else if (nomeUpper.includes('IPAD') && !nomeUpper.includes('MAGIC KEYBOARD')) {
      const isPro = nomeUpper.includes('IPAD PRO');
      const isAir = nomeUpper.includes('IPAD AIR');
      const storage = nomeUpper.includes('512')
        ? '512 GB'
        : nomeUpper.includes('256')
        ? '256 GB'
        : '128 GB';
      const tela = nomeUpper.includes('13"')
        ? isPro
          ? 'Ultra Retina XDR OLED em Tandem de 13" (ProMotion 120Hz)'
          : 'Liquid Retina de 13" com True Tone e P3'
        : isPro
        ? 'Ultra Retina XDR OLED em Tandem de 11" (ProMotion 120Hz)'
        : isAir
        ? 'Liquid Retina de 11" com True Tone e P3'
        : 'Liquid Retina IPS de 10,9" com True Tone';
      const chip = isPro
        ? 'Chip Apple M5 com Neural Engine Acelerado'
        : isAir
        ? 'Chip Apple M4 de Alto Desempenho'
        : 'Chip Apple A16 Bionic';

      subtituloSeo = 'Tablet Apple iPad Wi-Fi • Produtividade, Estudos, Criatividade e Alta Performance';
      fichaTecnica.push(
        { label: 'Modelo', valor: product.nome },
        { label: 'Processador', valor: chip },
        { label: 'Capacidade', valor: storage },
        { label: 'Tela', valor: tela },
        { label: 'Conectividade', valor: 'Wi-Fi 6E/7 de alta velocidade + Conector USB-C / Thunderbolt' },
        { label: 'Compatibilidade', valor: 'Compatível com Apple Pencil e Magic Keyboard Apple' }
      );
      itensInclusos = [
        `01 ${product.nome}`,
        '01 Cabo para Recarga USB-C (1m)',
        '01 Carregador USB-C de 20W Original Apple',
      ];
    } else if (nomeUpper.includes('AIRPODS')) {
      subtituloSeo = 'Fone de Ouvido Sem Fio Original Apple • Áudio Espacial e Chip H2';
      fichaTecnica.push(
        { label: 'Modelo', valor: product.nome },
        { label: 'Processador de Áudio', valor: 'Chip Apple H2 com Áudio Computacional' },
        {
          label: 'Controle de Ruído',
          valor:
            nomeUpper.includes('CANCELAMENTO') || nomeUpper.includes('PRO') || nomeUpper.includes('MAX')
              ? 'Cancelamento Ativo de Ruído (ANC) + Modo Ambiente Adaptativo'
              : 'Isolamento de Voz em Chamadas + Áudio Espacial Personalizado',
        },
        { label: 'Conexão de Recarga', valor: 'Conector USB-C + Recarga Sem Fio (modelos ANC/Pro)' },
        { label: 'Resistência', valor: nomeUpper.includes('MAX') ? 'Conchas em Alumínio Anodizado' : 'Certificação IP54 (Resistente a poeira, suor e água)' }
      );
      itensInclusos = [
        `01 ${product.nome}`,
        '01 Estojo de Recarga / Smart Case Original Apple',
        'Documentação Oficial Apple',
      ];
    } else {
      subtituloSeo = 'Acessório Original Apple • Qualidade, Segurança e Compatibilidade Certificada';
      fichaTecnica.push(
        { label: 'Produto', valor: product.nome.replace(' (Zerou no Estoque)', '') },
        { label: 'Fabricante', valor: 'Apple Inc. (Original)' },
        {
          label: 'Interface / Conexão',
          valor: nomeUpper.includes('LIGHTNING')
            ? 'Conector Apple Lightning / USB-C'
            : nomeUpper.includes('MAGSAFE')
            ? 'Indução Magnética MagSafe + Conector USB-C'
            : 'USB-C / Bluetooth Sem Fio Apple',
        },
        { label: 'Garantia', valor: '12 Meses de Garantia Oficial Apple' }
      );
      itensInclusos = [`01 ${product.nome.replace(' (Zerou no Estoque)', '')}`];
    }

    return {
      isAppleOfficial: true,
      subtituloSeo,
      descricaoCompleta: descricaoLimpa,
      fichaTecnica,
      beneficios,
      itensInclusos,
      avisosLoja: [
        '💰 Pagamentos: PIX ou DINHEIRO (100% à vista no PIX, sem fiado).',
        '🚨 Não aceitamos devolução de aparelhos retirados da loja — confira e confirme sua venda no ato!',
        '🚨 Alguns produtos da Apple estão vindo com a data da compra, o que não significa que o aparelho esteja ativado. Para ativação junto ao site precisa da nota fiscal e entrar em contato com 0800 761 0880 (Apple Suporte). Sendo assim, não há possibilidade de troca do produto.',
      ],
    };
  }

  // ================= PRODUTOS JÁ EXISTENTES NA LOJA (GSM DIGITAL & CURADORIA RR STORE) =================
  const refMatch = product.descricao.match(/\(Ref:\s*([^)]+)\)/i);
  const brandMatch = product.descricao.match(/Produto\s+([A-Z0-9'-]+)\s*\(/i);
  const marca = brandMatch ? brandMatch[1] : 'Seleção Oficial RR Store';
  const refCode = refMatch ? refMatch[1] : product.id.toUpperCase();

  let subtituloSeo = `${product.categoria} • Pronta Entrega com Motoboy Express em Brasília-DF`;
  let complementoSeo = '';
  let beneficios = [
    'Produto novo, testado e revisado antes do envio em Brasília-DF',
    'Despacho expresso no mesmo dia via Motoboy para todas as RAs do DF',
    '5% de desconto imediato no PIX ou parcelamento facilitado no cartão',
    '7 dias de Garantia de Satisfação e Troca Fácil diretamente na loja',
  ];

  if (nomeUpper.includes('GARRAFA') || nomeUpper.includes('COPO TERMICO') || nomeUpper.includes('GARRAFA TERMICA')) {
    subtituloSeo = 'Hidratação Térmica de Alta Performance • Ideal para Academia, Escritório e Clima Seco do DF';
    complementoSeo =
      ' Projetado com isolamento eficiente que preserva a temperatura da sua bebida por horas, vedação segura antivazamento e acabamento ergonômico livre de BPA. Perfeito para acompanhar sua rotina de treinos, concursos e trabalho em Brasília.';
    beneficios = [
      'Conservação térmica prolongada para líquidos gelados ou quentes',
      'Tampa com vedação segura para transporte em bolsas e mochilas',
      'Material resistente, durável, fácil de higienizar e livre de BPA',
      'Entrega expressa no mesmo dia em Brasília e Região (DF)',
    ];
  } else if (
    nomeUpper.includes('CABO') ||
    nomeUpper.includes('CARREGADOR') ||
    nomeUpper.includes('FONTE') ||
    nomeUpper.includes('POWER BANK')
  ) {
    subtituloSeo = 'Energia & Recarga Rápida Segura • Proteção Inteligente Contra Sobrecarga';
    complementoSeo =
      ' Desenvolvido com componentes de alta condutividade para garantir carregamento rápido, estável e seguro, preservando a vida útil da bateria do seu smartphone, tablet ou acessório.';
    beneficios = [
      'Transmissão de energia estável com proteção contra curto-circuito e superaquecimento',
      'Revestimento reforçado para maior durabilidade no uso diário',
      'Compatibilidade ampla com smartphones e dispositivos modernos',
      'Pronta entrega imediata em Brasília via Motoboy Express',
    ];
  } else if (
    nomeUpper.includes('FONE') ||
    nomeUpper.includes('HEADSET') ||
    nomeUpper.includes('CAIXA DE SOM') ||
    nomeUpper.includes('MICROFONE')
  ) {
    subtituloSeo = 'Áudio de Alta Definição • Som Cristalino, Graves Potentes e Conforto';
    complementoSeo =
      ' Proporciona experiência sonora imersiva com graves encorpados, agudos nítidos e excelente isolamento acústico para músicas, chamadas de vídeo, jogos, treinos e reuniões.';
    beneficios = [
      'Qualidade sonora de alta definição com graves equilibrados',
      'Design ergonômico e confortável para uso prolongado sem incômodo',
      'Conexão rápida e estável para celulares, notebooks e tablets',
      'Testado e garantido pela equipe RR Store Brasília',
    ];
  } else if (
    nomeUpper.includes('LAMPADA') ||
    nomeUpper.includes('LED') ||
    nomeUpper.includes('REFLETOR') ||
    nomeUpper.includes('LUMINARIA') ||
    nomeUpper.includes('RING LIGHT') ||
    nomeUpper.includes('CAMERA')
  ) {
    subtituloSeo = 'Iluminação & Smart Home • Eficiência Energética e Praticidade para seu Ambiente';
    complementoSeo =
      ' Solução moderna para valorizar e proteger sua casa, escritório ou estúdio em Brasília com baixíssimo consumo de energia e longa vida útil.';
  } else if (product.categoria === 'Suplementos & Nutrição') {
    subtituloSeo = 'Nutrição Esportiva de Alta Pureza • Performance, Força e Recuperação Muscular';
    complementoSeo =
      ' Lote selecionado com rigoroso padrão de qualidade e solubilidade para potencializar seus resultados de hipertrofia, energia e saúde diária.';
  } else if (product.categoria === 'Skincare & Autocuidado') {
    subtituloSeo = 'Dermocosmético & Autocuidado • Hidratação e Proteção para o Clima de Brasília';
    complementoSeo =
      ' Fórmula de rápida absorção sem toque oleoso, ideal para manter a barreira cutânea saudável, radiante e protegida todos os dias.';
  }

  const fichaTecnica: ProductSpecItem[] = [
    { label: 'Produto', valor: product.nome },
    { label: 'Marca / Linha', valor: marca },
    { label: 'Código de Referência', valor: refCode },
    { label: 'Departamento', valor: product.categoria },
    { label: 'Avaliação dos Clientes', valor: `${product.avaliacao.toFixed(1)} de 5.0 (${product.avaliacoesCount} avaliações verificadas)` },
    { label: 'Disponibilidade em Estoque', valor: product.estoque > 0 ? `${product.estoque} unidades para envio imediato no DF` : 'Esgotado temporariamente (Sob consulta)' },
    { label: 'Garantia Local', valor: 'Garantia Oficial RR Store Brasília-DF' },
  ];

  return {
    isAppleOfficial: false,
    subtituloSeo,
    descricaoCompleta: product.descricao + complementoSeo,
    fichaTecnica,
    beneficios,
    itensInclusos: [`01 ${product.nome}`, 'Nota / Comprovante de Garantia RR Store DF'],
  };
}
