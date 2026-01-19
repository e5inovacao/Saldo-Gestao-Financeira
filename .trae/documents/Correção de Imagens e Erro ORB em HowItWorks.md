# Plano de Correção em HowItWorks.tsx

## 1. Corrigir Erro ORB
**Problema:** O arquivo `pages/HowItWorks.tsx` contém a URL problemática na linha 17 (`https://images.unsplash.com/photo-1634733988685-a91a649bf449...`).
**Ação:** Substituir esta URL por uma imagem segura do Unsplash ou uma imagem local, para eliminar o erro `net::ERR_BLOCKED_BY_ORB`.
- Vou usar uma imagem similar (abstrata 3D suave) ou uma das imagens locais (`img_01_controle.png`) se fizer sentido com o contexto "Controle de Transações".
- Para garantir, vou substituir todas as URLs do Unsplash neste arquivo pelas imagens locais que já configurei na Landing Page, pois elas representam as mesmas funcionalidades.

## 2. Atualizar Imagens da Página HowItWorks
**Pedido:** "as imagens da página how-it-works não foram alteradas, verifique e corrija."
**Ação:** Substituir as URLs externas do array `steps` pelas imagens locais correspondentes que adicionei em `public/img_landingpage/`.
**Mapeamento:**
- **Dashboard Intuitivo (step 0):** `img_01_controle.png` (Visual do Dashboard/Controle).
- **Controle de Transações (step 1):** `img_02_metas.png` (Ou talvez usar a mesma ou uma variação, mas vou usar a de metas para ilustrar o controle ou a de categorias. O usuário forneceu 3 imagens: controle, metas, categorias.
    - O array `steps` tem 4 itens. Vou ter que reutilizar ou manter uma externa segura para o 4º item, ou usar uma das locais.
    - Vou mapear assim:
        1. Dashboard -> `img_01_controle.png`
        2. Controle de Transações -> `img_03_categorias.png` (Já que categorias e transações são ligadas)
        3. Metas Financeiras -> `img_02_metas.png`
        4. Categorias Personalizáveis -> `img_03_categorias.png` (Reutilizando ou mantendo uma URL segura se não tiver imagem específica, mas vou tentar usar a local para consistência).
- **Refinamento:** Vou usar:
    1. Dashboard: `img_01_controle.png`
    2. Transações: `img_01_controle.png` (Reuso, já que controle = transações)
    3. Metas: `img_02_metas.png`
    4. Categorias: `img_03_categorias.png`

Vou aplicar essas mudanças agora.