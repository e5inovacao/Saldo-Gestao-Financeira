O erro "Forbidden use of secret API key in browser" ocorre porque a chave `service_role` (secreta) foi inserida na variável `VITE_SUPABASE_ANON_KEY` no arquivo `.env.local`. O cliente do Supabase no navegador aceita apenas a chave pública (`anon key`).

**Passos para correção:**

1.  **Acessar o Painel do Supabase:**
    *   Vá em **Settings** (ícone de engrenagem) > **API**.
2.  **Copiar a chave correta:**
    *   Procure pela seção **Project API keys**.
    *   Copie a chave rotulada como `anon` `public`. **NÃO** use a chave `service_role`.
3.  **Atualizar o arquivo `.env.local`:**
    *   Substitua o valor de `VITE_SUPABASE_ANON_KEY` pela chave `anon` que você copiou.
4.  **Reiniciar o servidor:**
    *   Pare o terminal atual e rode `npm run dev` novamente para carregar a nova configuração.

Como esta correção envolve chaves privadas que você deve gerenciar, não posso editar o arquivo por você. Por favor, faça essa alteração manualmente e confirme para prosseguirmos.