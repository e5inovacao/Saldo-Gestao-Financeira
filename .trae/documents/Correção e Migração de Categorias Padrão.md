# Plano de Ação: Correção das Categorias

## Situação Atual
1.  **Código Frontend:** Atualizado para exibir categorias do banco (`loadCategories` em `Categories.tsx` e `Dashboard.tsx`) e bloquear edição de padrões (`is_default`).
2.  **Banco de Dados (SQL):** Um script `default_categories.sql` foi criado para definir um trigger que insere categorias padrão para **novos usuários**.
3.  **Problema Potencial:** Usuários existentes (como o que você está usando agora) não passaram pelo trigger de criação, então suas tabelas de categorias podem estar vazias ou desatualizadas, fazendo com que o dashboard e a tela de categorias não mostrem nada ou mostrem dados antigos sem a flag `is_default`.

## Análise e Solução
Para corrigir a situação para o usuário atual e garantir a robustez:

1.  **Verificação:** O usuário precisa rodar o script SQL gerado anteriormente para criar a função e o trigger.
2.  **Migração para Usuários Existentes:** O trigger só funciona para `INSERT` em `auth.users`. Precisamos de uma forma de inserir as categorias padrão para usuários que já existem mas não têm categorias.
    *   **Ação:** Criar um botão "Restaurar Categorias Padrão" na tela de Configurações (ou rodar um script SQL manual) que chama a função de inserção.
    *   **Alternativa SQL (Recomendada):** Fornecer um script SQL adicional que insere as categorias para o usuário atual especificamente, ou para todos que não têm.

## Plano Detalhado

1.  **Passo 1 (SQL Manual - Ação do Usuário):** Você deve executar o script `src/db/default_categories.sql` no Supabase.
2.  **Passo 2 (Inserção Manual para seu Usuário):** Como você já criou o usuário, o trigger não vai disparar. Vou fornecer um comando SQL para você rodar manualmente e popular suas categorias.
3.  **Passo 3 (Frontend - Melhoria):** Adicionar um botão de "Recarregar Categorias Padrão" em `Settings.tsx` para casos de emergência, ou apenas instruir o uso do SQL. Dado o escopo de "pair programmer", a solução via SQL é mais limpa para agora.

**SQL para Usuário Atual (Executar no Supabase SQL Editor):**
```sql
-- Descubra seu ID de usuário (auth.uid()) ou execute isso logado no contexto correto, 
-- mas via editor SQL é melhor usar uma query explicita se souber o email, ou genericamente:

do $$
declare
  r record;
begin
  for r in select id from auth.users loop
    -- Verifica se o usuário já tem categorias. Se não tiver, insere.
    if not exists (select 1 from public.categories where user_id = r.id) then
      -- Aqui chamamos a lógica da função (copiada ou adaptada pois a função retorna trigger)
      -- Simplificação: Apenas chame este bloco se quiser forçar para TODOS os usuários existentes
      null; -- Placeholder, a lógica real precisa ser duplicada ou a função ajustada para não ser apenas trigger.
    end if;
  end loop;
end;
$$;
```

**Abordagem Prática e Rápida:**
Vou refatorar a função PL/PGSQL para ser reutilizável (não apenas trigger) e então você poderá chamá-la manualmente para seu usuário.

1.  **Refatorar SQL:** Separar a lógica de inserção em uma função `insert_default_categories(target_user_id uuid)` que pode ser chamada pelo trigger E manualmente.
2.  **Atualizar Arquivo SQL:** Reescrever `src/db/default_categories.sql` com essa abordagem modular.
3.  **Instrução:** Você executará o novo script.

Isso resolve o problema de "categorias sumiram" ou "não apareceram" para sua conta atual.