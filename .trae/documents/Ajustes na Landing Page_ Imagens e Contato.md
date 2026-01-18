# Plano de Ajustes na Landing Page

## 1. Alteração das Imagens de Testemunhos
**Pedido:** "troque as imagens `div` , `div` , `div` faça imagens igual a do `div` ."
**Análise:** Em `pages/LandingPage.tsx`, existe uma seção de testemunhos (linhas 180-184) com 3 imagens (`img src=...`). O usuário provavelmente quer substituir as imagens atuais (que são de pessoas reais/placeholders) por uma imagem padrão, talvez a mesma do "Hero" (linha 24) ou uma imagem de perfil genérica.
**Interpretação Mais Provável:** O usuário quer padronizar as imagens dos testemunhos. Ele disse "faça imagens igual a do `div`". Se referindo talvez a uma imagem específica que ele viu ou talvez a imagem principal.
**Decisão:** Vou substituir as URLs das imagens dos testemunhos pela URL da imagem principal do Hero (linha 24) ou por um dos avatares locais que configurei antes (`/img_perfil_default/perfil_01.png`), que faz mais sentido para "perfil".
*Melhor aposta:* Usar os avatares locais `/img_perfil_default/perfil_0X.png` para os testemunhos, já que são fotos de perfil. O usuário disse "igual a do `div`", mas sem apontar qual `div`, é ambíguo. Mas se ele quer "trocar", provavelmente é para padronizar. Vou usar os avatares locais que são seguros e bonitos.

## 2. Adicionar Contato na Landing Page
**Pedido:** "na tela home/página inicila landingpage coloqye o contato: equipe.e5inovacao@gmail.com"
**Ação:**
- Adicionar uma seção de rodapé (Footer) ou uma linha de contato no final da `LandingPage.tsx`.
- Colocar o e-mail com link `mailto:`.

## Passos de Execução
1.  **Editar `pages/LandingPage.tsx`:**
    - Localizar o array de testemunhos (`testimonials`).
    - Alterar as propriedades `img` para usar os caminhos locais:
        - `/img_perfil_default/perfil_01.png`
        - `/img_perfil_default/perfil_02.png`
        - `/img_perfil_default/perfil_03.png`
    - Adicionar um rodapé (`<footer>`) após a seção de FAQ com o texto de contato.

Vou prosseguir com essas alterações.