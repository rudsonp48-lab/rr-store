# Contexto Completo do Projeto — RR Store / RR Mobile Brasília (`rrmobilestore.com.br`)

Este arquivo serve como **memória sincronizada** para quando você abrir o projeto em outro computador (como o seu MacBook ou PC de casa) no Antigravity.

## 1. Repositórios Oficiais no GitHub
- **Loja Oficial (`rr-store`)**: `https://github.com/rudsonp48-lab/rr-store.git`
- **Painel Administrativo (`rr-store-admin`)**: `https://github.com/rudsonp48-lab/rr-store-admin.git`

## 2. Links em Produção (Vercel) & Domínio Oficial
- **Domínio Oficial Registrado (Registro.br)**: `https://rrmobilestore.com.br` e `https://www.rrmobilestore.com.br`
  - Servidores DNS da Vercel vinculados ao projeto `rr-store`:
    - `ns1.vercel-dns.com`
    - `ns2.vercel-dns.com`
  - Ou apontamento Zona DNS Registro.br:
    - Tipo `A` (vazio) -> `76.76.21.21`
    - Tipo `CNAME` (`www`) -> `cname.vercel-dns.com`
- **URL Vercel da Loja**: `https://rr-store-rouge.vercel.app` (Projeto Vercel: `rudsons-projects-d5ff4518/rr-store`)
- **URL Vercel do Painel Admin**: `https://rr-store-admin.vercel.app`

## 3. Endereço Físico & Contatos Configurados
- **Endereço**: Feira dos Importados do SIA — Conjunto D, Loja D439 • SIA Trecho 7, Brasília - DF
- **WhatsApp Principal**: `5561998151299`
- **WhatsApp Secundário**: `5561985964112`

## 4. Regras de Negócio e Arquitetura Implementadas
1. **Banner Principal (`components/HeroSection.tsx`)**:
   - Layout editorial roxo/lavanda com títulos monumentais divididos no topo.
   - 10 produtos Flagship Apple no centro em **PNG 100% transparente sem fundo e em tamanho grande** (`public/apple-cutouts/*.png`), com efeito de esmaecer/parallax no scroll.
   - Card lateral direito reproduzindo ao vivo em loop os **vídeos oficiais da Apple Brasil (`apple.com/br`)** para cada produto.
2. **Filtro Rápido por Marcas com Logos Oficiais + Subcategorias (`app/page.tsx` & `components/BrandLogo.tsx`)**:
   - Botões principais com as logos vetoriais oficiais de cada marca: **Todos (RR)**, **Apple**, **Xiaomi**, **Realme**, **Samsung**, **Gamer (PlayStation)**, **JBL**, **Smartwatches**, **SSD & Memória (SanDisk/Kingston)**.
   - Ao clicar em qualquer marca (ex.: Apple), abre a sub-barra de nichos (iPhones, iPads, iMacs & MacBooks, AirPods, Apple Watch, Acessórios Apple).
3. **Política de Preço de Atacado Integral e Parcelamento (`data/mockData.ts`, `components/ProductCard.tsx`, `components/ProductDetailModal.tsx`, `components/CartAndCheckoutDrawer.tsx`)**:
   - Todos os percentuais de desconto (`% OFF` / `-5% PIX`) foram removidos do site.
   - O valor no PIX (`precoPix`) é **100% o valor integral de atacado postado** (sem abater 5% do lojista).
   - No cartão de crédito (em até 12x), consta claramente em todo o site e no checkout que **os juros são calculados de acordo com a taxa da operadora**.
4. **Sincronização com Fornecedores**:
   - `rr-apple-*`: Linha completa Joias Apple com fotos oficiais verificadas.
   - `sousa-*`: Catálogo Sousa Games & Tecnologia (`https://sousagamestecnologia.kyte.site/pt-BR`) com margem de 25% e fotos reais verificadas.
   - `gsm-*`: Sincronização automática via API (`app/api/supplier-sync/route.ts`).
