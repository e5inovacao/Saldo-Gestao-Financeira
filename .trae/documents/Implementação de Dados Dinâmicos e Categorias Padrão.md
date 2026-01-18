# Plano de Implementação

## 1. Dados do Usuário em Settings
O código de `pages/Settings.tsx` já implementa a busca de dados do perfil (`loadProfile`) e a atualização do avatar (`handlePhotoSelect`). O campo de e-mail é preenchido com `user.email` do contexto de autenticação.
**Ação Necessária:** Nenhuma alteração significativa de lógica, apenas garantir que o formulário de atualização de nome funcione corretamente (já há um `useEffect` para carregar e um botão "Salvar Alterações" que chama `supabase.from('profiles').update`). O código atual parece completo, mas vou revisar se o `onChange` do nome e o `onClick` do salvar estão corretos.

## 2. Saudação Dinâmica no Dashboard
O arquivo `pages/Dashboard.tsx` tem um texto estático "Olá, Ricardo!".
**Ação Necessária:**
1.  Adicionar um estado `userName` (ou usar um contexto se preferir, mas estado local é suficiente dado que `loadProfile` já é um padrão usado).
2.  Buscar o `full_name` da tabela `profiles` no `useEffect` existente ou em um novo.
3.  Atualizar o JSX para exibir `Olá, {userName || 'Visitante'}!`.

## 3. Categorias Padrão e Gerenciamento
Atualmente, `pages/Categories.tsx` carrega categorias do banco (`loadCategories`). Para implementar categorias padrão pré-carregadas para novos usuários, a melhor abordagem é usar um gatilho (trigger) no banco de dados (Supabase) que insere essas categorias automaticamente quando um novo usuário é criado na tabela `auth.users` ou `public.profiles`.
**Ação Necessária (SQL):**
1.  Criar uma função SQL `handle_new_user` que insere categorias padrão (Alimentação, Moradia, Transporte, Salário, Investimentos) e suas subcategorias na tabela `categories` e `subcategories` associadas ao `new.id`.
2.  Criar um trigger `on_auth_user_created` que chama essa função após `INSERT` em `auth.users`.

**Ação Necessária (Frontend):**
1.  O código de `Categories.tsx` já suporta listagem, criação, edição e exclusão.
2.  Para impedir a exclusão/edição das categorias padrão (se for um requisito estrito "exceto as padrões"), precisaríamos de uma flag `is_system` na tabela `categories`. Como o requisito diz "exceto as padrões do sistema", vou adicionar uma coluna `is_default` boolean default false nas tabelas `categories` e `subcategories` via SQL.
3.  Atualizar `Categories.tsx` para verificar `!category.is_default` antes de permitir abrir o modal de edição/exclusão.

## Resumo das Tarefas
1.  **Dashboard:** Atualizar saudação dinâmica.
2.  **SQL:** Criar trigger para categorias padrão e adicionar coluna `is_default`.
3.  **Categories:** Bloquear edição/exclusão de itens padrão no frontend.
4.  **Settings:** Validar se a atualização de nome está persistindo corretamente (o código atual já parece fazer isso, mas vou confirmar).

Como você pediu para **implementar**, vou criar um arquivo SQL para você rodar no Supabase e depois aplicar as mudanças no código React.