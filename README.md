# RR Store Brasília - Plataforma E-Commerce Multidepartamentos (Dark Tech & Modern Retail)

Plataforma de e-commerce moderna, responsiva (Mobile-First) e de alta conversão desenvolvida com **React, Next.js, TypeScript, Tailwind CSS e Lucide Icons** para a **RR Store (Brasília - DF)**.

## ✨ Destaques da Arquitetura

1. **Identidade Visual "Dark Tech & Modern Retail"**:
   - **Preto Profundo (`#0A0A0A` e `#121212`)** no Header Sticky (com `backdrop-blur-md`), Hero Section, Navegação de Nichos, Drawer de Checkout, Trust Badges e Footer.
   - **Branco Puro & Gelo (`#FFFFFF` e `#F8F9FA`)** na Vitrine e Cards de Produtos para leitura e conversão perfeitas.
   - **Verde Esmeralda / Neon Vibrante (`#10B981`, hover `#059669`, brilho `#34D399`)** nos CTAs, Top Bar, badges de desconto e preços no PIX.

2. **Navegação Completa pelos 10 Departamentos (Nichos)**:
   - Eletrônicos & Smartphones
   - Smart Home & Iluminação
   - Moda Fitness & Athleisure
   - Suplementos & Nutrição
   - Skincare & Autocuidado
   - Casa & Organização
   - Pet Shop
   - Moda Infantil & Enxoval
   - Acessórios & Semijoias
   - Papelaria Criativa & Concursos

3. **Catálogo com 30 Produtos Reais e Atrativos**:
   - Cálculo automático de **5% OFF no PIX** (`precoPix`), preço antigo riscado (`precoDe`), parcelamento sem juros, avaliação em estrelas e estoque.
   - Botões de **"Adicionar ao Carrinho"** e **"Comprar via WhatsApp"** em cada card.

4. **Carrinho Lateral (Slide-Over Drawer) & Checkout Híbrido Inteligente**:
   - Cálculo automático de **Taxa de Entrega e Frete Grátis por Região Administrativa do DF** (Plano Piloto, Águas Claras, Taguatinga, Guará, Sudoeste, Lago Sul, Lago Norte, Noroeste, Vicente Pires, Sobradinho, Ceilândia, Samambaia, Gama, etc.).
   - Abas interativas de pagamento: **PIX (QR Code dinâmico + Copia e Cola)**, **Cartão de Crédito (1x a 12x)** e **Cartão de Débito**.
   - **Integração com WhatsApp (`wa.me`)**: Gera número único de pedido (ex: `#RR-8492`) e envia mensagem completa e formatada.

## 🚀 Como Executar

```bash
cd /Users/teste/.gemini/antigravity/scratch/rr-store
bun run dev
# ou
npm run dev
```
Acesse `http://localhost:3000` no navegador.
