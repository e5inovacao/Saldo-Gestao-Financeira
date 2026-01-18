Alterações e Testes

1. Saudação dinâmica no Dashboard
- Busca `full_name` em `profiles` e exibe "Olá, Nome!" ou "Visitante".
- Arquivo: `pages/Dashboard.tsx`
- Logs: adicionados em fetch e ao salvar transações.

2. Sidebar de Configurações
- Exibe nome e e-mail reais do usuário logado.
- Atualiza nome e avatar via Supabase e mostra feedback.
- Arquivo: `pages/Settings.tsx`

3. Categorias e Subcategorias Padrão
- SQL autossuficiente cria tabelas e índices, RLS, função `insert_default_categories` e trigger.
- Inclusão de categorias: Moradia, Alimentação, Transporte, Saúde, Lazer, Educação, Serviços, Salário, Investimentos.
- Subcategorias coerentes para cada categoria.
- Arquivo: `src/db/default_categories.sql`

4. Bloqueio de edição/exclusão para categorias padrão
- Frontend bloqueia ações quando `is_default` é verdadeiro e exibe selo "Padrão".
- Arquivo: `pages/Categories.tsx`

5. Validações e Logs (Categorias)
- Validação de duplicidade ao criar categoria e subcategoria.
- Reload das listas após criar/editar/excluir.
- Logs detalhados no console.

6. Testes realizados
- SQL: execução completa sem erro 42P01 (tabelas criadas antes).
- Frontend: criação/edição/remoção de categorias e subcategorias com feedback e recarregamento.
- Dashboard: gráficos e cartões atualizam com transações reais do mês.
- Signup: criação de usuário e salvamento de perfil com tratamento para ausência de tabela.

Observações
- Para popular categorias de usuários existentes, descomente e execute o bloco de migração no final de `default_categories.sql`.
- Certifique-se de usar `VITE_SUPABASE_ANON_KEY` (chave pública ANON) no `.env.local`.
