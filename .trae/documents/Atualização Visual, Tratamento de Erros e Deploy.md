# Plano de Atualização da Landing Page e Deploy

## 1. Correção de Imagens e Erro ORB
**Problema:** O usuário reportou erro `net::ERR_BLOCKED_BY_ORB` com uma imagem do Unsplash na Landing Page. O Unsplash às vezes bloqueia requisições cross-origin (CORB/ORB) ou o link expirou.
**Ação:**
- Substituir a imagem de fundo do "Hero" (linha 24 de `LandingPage.tsx`) por uma imagem segura, livre de direitos e moderna (ex: Pexels ou Unsplash com parâmetros corretos, ou uma cor sólida/gradiente elegante se preferir segurança total).
- O usuário pediu para "trocar as imagens em `div` `div` e `div` faça imagens artisticas/modernas e minimalistas". Isso se refere às 3 imagens da seção "Como Funciona" ou "Testemunhos" ou "Hero".
    - Na `LandingPage.tsx`, já troquei os testemunhos por avatares locais.
    - O "Hero" ainda usa uma URL externa longa (`lh3.googleusercontent...`).
    - Vou substituir a imagem do Hero por uma imagem de alta qualidade do Unsplash (com `?ixlib=rb-4.0.3` e parâmetros corretos para evitar bloqueio) ou usar uma imagem local se tivermos. Como não tenho novas locais, vou usar uma URL estável do Unsplash com tema financeiro/minimalista.
    - URL sugerida para Hero: `https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=2071&auto=format&fit=crop` (Planta/Dinheiro minimalista) ou `https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2072&auto=format&fit=crop` (Calculadora/Minimalista).

## 2. Ajuste de Estilo do Botão (Hover)
**Pedido:** "o houver do botão `a` está azul, deixe verde escuro."
**Ação:**
- Localizar o botão "Comece o Teste Grátis" na `LandingPage.tsx` (linha 40 ou similar).
- A classe atual tem `hover:bg-primary-landing` (que pode ser azul) ou `hover:bg-blue-700`.
- O usuário especificou "verde escuro". Vou alterar para `hover:bg-green-700` ou `hover:bg-emerald-800`.

## 3. Mensagens de Erro com Contato de Suporte
**Pedido:** "nas mensagens de erro... Adicione uma mensagem informando para entra em contato pelo e-mail: equipe.e5inovacao@gmail.com"
**Ação:**
- Adicionar essa mensagem nos `toast.error` ou blocos de erro em:
    - `Signup.tsx` (Cadastro)
    - `Checkout.tsx` / `CreditCardForm.tsx` (Pagamento)
    - `Login.tsx` (Login)
- Vou criar uma constante ou helper para essa mensagem para garantir consistência: `Erro: [mensagem]. Se o problema persistir, contate equipe.e5inovacao@gmail.com`.

## 4. Deploy no GitHub
**Pedido:** "Após realizar essas atualizações suba o sistema para o github"
**Ação:**
- Executar os comandos git: `git add .`, `git commit`, `git push`.

---

## Passos Detalhados
1.  **LandingPage.tsx:**
    - Trocar imagem do Hero (linha 24).
    - Trocar cor do hover do botão "Comece o Teste Grátis" (linha 40) para `hover:bg-green-800`.
2.  **Signup.tsx, Login.tsx, Checkout.tsx:**
    - Atualizar chamadas de `toast.error` para incluir o sufixo de contato.
3.  **Git:**
    - Commitar e dar push.