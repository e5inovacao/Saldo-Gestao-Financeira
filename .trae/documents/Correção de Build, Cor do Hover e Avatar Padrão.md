# Plano de Correção e Ajustes

## 1. Analisar Erro no Cloudflare
**Log:** O log mostra apenas o sucesso do `npm clean-install` e alertas de vulnerabilidades. **Não há erro explícito no trecho colado**. O log termina abruptamente ou o usuário não copiou a parte do erro real (geralmente depois de "Installing project dependencies").
**Hipótese:**
- Pode ser que o comando de build (`npm run build`) esteja falhando logo depois.
- Pode ser problema de compatibilidade do Node.js v22 (o log mostra `nodejs@22.16.0`).
- Pode ser erro de TypeScript (`tsc`) que falha o build.
**Ação:**
- Vou rodar `npm run build` localmente para ver se quebra. Se quebrar localmente, é fácil corrigir.
- Se localmente funcionar, vou sugerir fixar a versão do Node no Cloudflare (criando `.nvmrc` ou definindo `NODE_VERSION` nas vars de ambiente).

## 2. Ajustar Cor do Hover
**Pedido:** "o verde escuro do houver está muito escuro."
**Ação:**
- Em `components/PublicHeader.tsx` e `pages/LandingPage.tsx`, troquei para `hover:bg-green-800`.
- Vou clarear para algo como `hover:bg-green-600` ou `hover:bg-green-700` (um verde mais vivo, menos preto).

## 3. Foto de Perfil Padrão
**Pedido:** "a foto de perfil em `a` quando loga pela primeira vez deve ser a `div`" (referindo-se a `/img_perfil_default/perfil_01.png`).
**Análise:**
- Quando o usuário loga, a foto de perfil vem do banco (`profiles.avatar_url`) ou do auth provider.
- Se não tiver foto, provavelmente mostra um placeholder ou nada.
- **Ação:**
    - Verificar `components/Header.tsx` (ou onde fica o avatar do usuário logado).
    - Se `user.avatar_url` for nulo, usar `/img_perfil_default/perfil_01.png` como fallback padrão.
    - Também verificar no `Signup.tsx` se podemos salvar esse padrão no banco na criação da conta. Mas o fallback no frontend é mais garantido para usuários antigos também.

## Passos de Execução
1.  **Build Check:** Rodar `npm run build` no terminal para caçar erros.
2.  **Header Hover:** Alterar classes CSS para um verde mais claro.
3.  **Avatar Default:** Editar `components/Header.tsx` (e talvez `Sidebar.tsx` se houver) para usar a imagem `perfil_01.png` quando não houver avatar.
4.  **Deploy:** Commitar correções.

Vou começar verificando o build.