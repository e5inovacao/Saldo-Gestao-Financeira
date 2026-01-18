# Plano de Publicação e Redesign

## 1. Publicação no GitHub
Vou tentar novamente inicializar o repositório e fazer o push para o endereço fornecido.
Como a tentativa anterior falhou por falta de `.git`, vou inicializar o repositório do zero.
**Comandos:**
```bash
git init
git add .
git commit -m "feat: initial commit with payment integration and UI improvements"
git branch -M main
git remote add origin https://github.com/e5inovacao/Saldo-Gest-o-Financeira.git
git push -u origin main
```
*Nota: Se a autenticação falhar, deixarei o repositório local pronto para você apenas digitar sua senha/token.*

## 2. Redesign da Landing Page (Botões)
**Objetivo:** Tornar o botão "Comece o Teste Grátis" minimalista e adicionar Login ao lado.
**Ação:**
- Editar `LandingPage.tsx`.
- Botão "Comece o Teste Grátis": Remover cor de fundo sólida, usar borda (outline) ou estilo "ghost" com texto verde.
- Botão "Login": Já adicionei, mas vou garantir que esteja alinhado e com estilo complementar (ex: um sólido e um outline, ou ambos outline).
- Alinhamento: Garantir que fiquem lado a lado em telas grandes e empilhados em mobile.

## 3. Nova Identidade Visual (Verde Organizze)
**Objetivo:** Mudar a cor primária para um tom de verde inspirado no Organizze.
**Cor Escolhida:** `#32b958` (Verde Organizze aproximado) ou `#22c55e` (Tailwind Green 500). Vou usar um hex específico para ficar fiel.
**Ação:**
- Como não encontrei o `tailwind.config.js` na raiz (o comando falhou), vou procurar onde ele está (provavelmente oculto ou eu digitei errado). Se não achar, vou verificar se está usando variáveis CSS no `index.css`.
- Atualizar a variável de cor `primary` e `primary-landing`.

**Passos:**
1.  **Git:** Inicializar e tentar push.
2.  **Config:** Localizar e editar `tailwind.config.js` (ou `tailwind.config.ts`) para alterar as cores.
3.  **UI:** Atualizar `LandingPage.tsx` com os novos estilos de botão.

Vou começar procurando o arquivo de configuração do Tailwind novamente para garantir a mudança de cor.