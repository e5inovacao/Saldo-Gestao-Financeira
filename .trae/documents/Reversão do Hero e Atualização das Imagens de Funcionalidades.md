# Plano de Correção e Ajustes na Landing Page

## 1. Reverter Imagem do Hero
**Pedido:** "volte a imagem que estava antes em `div`" (se referindo ao Hero).
**Ação:**
- Em `pages/LandingPage.tsx` (linha 24), reverter a URL da imagem de fundo para a original do Google (`https://lh3.googleusercontent.com/aida-public/...`).
- O usuário disse que essa é a imagem que ele quer de volta, mesmo que eu tenha trocado para corrigir o ORB. Vou obedecer e reverter.

## 2. Substituir Imagens das Funcionalidades ("Como Funciona")
**Pedido:** "troque as imagens `div` `div` `div` pelas imagens img_01_controle, img_02_metas e img_03_categorias respectivamentes".
**Análise:**
- Atualmente, a seção "Como Funciona" (linhas 57-90) usa **ícones** (`person_add`, `paid`, `rocket_launch`), não imagens `div`.
- Onde estão as "imagens div div div" que o usuário fala?
    - Talvez ele esteja vendo uma versão antiga ou cacheada?
    - Ou talvez ele queira que eu **transforme** esses ícones em imagens.
    - Ou talvez ele esteja se referindo a uma seção que **não existe mais** ou que eu não estou vendo no código atual (`LandingPage.tsx`).
    - **Olhando o código:** Não há outras imagens na Landing Page além do Hero e dos Testemunhos (que já são avatares).
    - **Reinterpretação:** O usuário provavelmente quer substituir os **ícones** da seção "Como Funciona" pelas imagens que ele mencionou.
    - **Ação:** Vou alterar a estrutura do map (linha 69) para usar `img` em vez de `icon`, apontando para `/img_landingpage/img_01_controle.png`, etc.
    - **Mapeamento:**
        1. "1. Crie sua conta" -> `img_01_controle.png` (ou similar, o usuário disse "controle, metas, categorias"). A ordem do usuário foi:
            - 1º div: `img_01_controle`
            - 2º div: `img_02_metas`
            - 3º div: `img_03_categorias`
        - Vou ajustar os títulos/descrições para bater com as imagens se necessário, ou manter os textos e só trocar a visualização.
        - Como os textos atuais são "Crie sua conta", "Registre gastos", "Alcance objetivos", vou assumir:
            - 1º (Crie conta) -> `img_01_controle`
            - 2º (Registre gastos) -> `img_02_metas`
            - 3º (Alcance objetivos) -> `img_03_categorias`

## 3. Corrigir Erro ORB (`...a91a649bf449`)
**Pedido:** "corrija `net::ERR_BLOCKED_BY_ORB ...`"
**Análise:**
- A URL mencionada (`...a91a649bf449`) **não está presente** no código atual de `LandingPage.tsx` que acabei de ler.
- Ela pode estar em algum CSS global, index.html ou componente importado (`PublicHeader`?).
- **Busca:** Vou procurar essa string no projeto todo. Se não achar, pode ser que ela fosse usada dinamicamente ou estava no cache do navegador do usuário e ele acha que ainda está lá.
- Se não encontrar a URL exata, vou assumir que ao trocar as imagens pelas locais (passo 2) o problema será resolvido, pois o usuário associou o erro a essas imagens.

## Passos de Execução
1.  **Search:** Procurar a URL `photo-1634733988685-a91a649bf449` no codebase.
2.  **Edit `LandingPage.tsx`:**
    - Reverter imagem do Hero para a do Google.
    - Modificar a seção "Como Funciona" para usar tags `<img>` com as imagens locais solicitadas em vez de ícones.

Vou prosseguir.