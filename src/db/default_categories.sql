-- CRIAR TABELAS SE NÃO EXISTIREM (Isso resolve o erro 42P01)
create extension if not exists pgcrypto;

-- categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  icon text,
  type text not null check (type in ('income','expense')),
  created_at timestamptz default now()
);

-- Índice de unicidade para permitir ON CONFLICT
do $$ begin
  if not exists (
    select 1 from pg_indexes where schemaname = 'public' and indexname = 'categories_unique_user_name'
  ) then
    create unique index categories_unique_user_name on public.categories (user_id, name);
  end if;
end $$;

-- Habilitar RLS para categories
alter table public.categories enable row level security;
drop policy if exists "categories_select_own" on public.categories;
create policy "categories_select_own" on public.categories for select using (user_id = auth.uid());
drop policy if exists "categories_insert_own" on public.categories;
create policy "categories_insert_own" on public.categories for insert with check (user_id = auth.uid());
drop policy if exists "categories_update_own" on public.categories;
create policy "categories_update_own" on public.categories for update using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "categories_delete_own" on public.categories;
create policy "categories_delete_own" on public.categories for delete using (user_id = auth.uid());

-- subcategories
create table if not exists public.subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  name text not null
);

-- Índice de unicidade para subcategorias
do $$ begin
  if not exists (
    select 1 from pg_indexes where schemaname = 'public' and indexname = 'subcategories_unique_category_name'
  ) then
    create unique index subcategories_unique_category_name on public.subcategories (category_id, name);
  end if;
end $$;

-- Habilitar RLS para subcategories
alter table public.subcategories enable row level security;
drop policy if exists "subcategories_select_own" on public.subcategories;
create policy "subcategories_select_own" on public.subcategories
  for select using (exists (select 1 from public.categories c where c.id = subcategories.category_id and c.user_id = auth.uid()));
drop policy if exists "subcategories_insert_own" on public.subcategories;
create policy "subcategories_insert_own" on public.subcategories
  for insert with check (exists (select 1 from public.categories c where c.id = subcategories.category_id and c.user_id = auth.uid()));
drop policy if exists "subcategories_update_own" on public.subcategories;
create policy "subcategories_update_own" on public.subcategories
  for update using (exists (select 1 from public.categories c where c.id = subcategories.category_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.categories c where c.id = subcategories.category_id and c.user_id = auth.uid()));
drop policy if exists "subcategories_delete_own" on public.subcategories;
create policy "subcategories_delete_own" on public.subcategories
  for delete using (exists (select 1 from public.categories c where c.id = subcategories.category_id and c.user_id = auth.uid()));


-- Adicionar coluna is_default (caso a tabela já existisse mas sem a coluna)
alter table public.categories add column if not exists is_default boolean default false;
alter table public.subcategories add column if not exists is_default boolean default false;

-- Função genérica para inserir categorias padrão
create or replace function public.insert_default_categories(target_user_id uuid)
returns void as $$
declare
  v_cat_id uuid;
begin
  -- Moradia
  insert into public.categories (user_id, name, icon, type, is_default)
  values (target_user_id, 'Moradia', 'home', 'expense', true)
  on conflict (user_id, name) do nothing;
  select id into v_cat_id from public.categories where user_id = target_user_id and name = 'Moradia';
  insert into public.subcategories (category_id, name, is_default) values 
    (v_cat_id, 'Aluguel', true), (v_cat_id, 'Condomínio', true), (v_cat_id, 'Energia', true), (v_cat_id, 'Água', true), (v_cat_id, 'Internet', true)
  on conflict (category_id, name) do nothing;

  -- Alimentação
  insert into public.categories (user_id, name, icon, type, is_default)
  values (target_user_id, 'Alimentação', 'restaurant', 'expense', true)
  on conflict (user_id, name) do nothing;
  select id into v_cat_id from public.categories where user_id = target_user_id and name = 'Alimentação';
  insert into public.subcategories (category_id, name, is_default) values 
    (v_cat_id, 'Supermercado', true), (v_cat_id, 'Restaurantes', true), (v_cat_id, 'Lanches', true)
  on conflict (category_id, name) do nothing;

  -- Transporte
  insert into public.categories (user_id, name, icon, type, is_default)
  values (target_user_id, 'Transporte', 'directions_car', 'expense', true)
  on conflict (user_id, name) do nothing;
  select id into v_cat_id from public.categories where user_id = target_user_id and name = 'Transporte';
  insert into public.subcategories (category_id, name, is_default) values 
    (v_cat_id, 'Combustível', true), (v_cat_id, 'Uber/Táxi', true), (v_cat_id, 'Manutenção', true)
  on conflict (category_id, name) do nothing;

  -- Saúde
  insert into public.categories (user_id, name, icon, type, is_default)
  values (target_user_id, 'Saúde', 'medical_services', 'expense', true)
  on conflict (user_id, name) do nothing;
  select id into v_cat_id from public.categories where user_id = target_user_id and name = 'Saúde';
  insert into public.subcategories (category_id, name, is_default) values 
    (v_cat_id, 'Farmácia', true), (v_cat_id, 'Consultas', true)
  on conflict (category_id, name) do nothing;

  -- Lazer
  insert into public.categories (user_id, name, icon, type, is_default)
  values (target_user_id, 'Lazer', 'movie', 'expense', true)
  on conflict (user_id, name) do nothing;
  select id into v_cat_id from public.categories where user_id = target_user_id and name = 'Lazer';
  insert into public.subcategories (category_id, name, is_default) values 
    (v_cat_id, 'Cinema', true), (v_cat_id, 'Streaming', true), (v_cat_id, 'Viagens', true)
  on conflict (category_id, name) do nothing;

  -- Educação
  insert into public.categories (user_id, name, icon, type, is_default)
  values (target_user_id, 'Educação', 'school', 'expense', true)
  on conflict (user_id, name) do nothing;
  select id into v_cat_id from public.categories where user_id = target_user_id and name = 'Educação';
  insert into public.subcategories (category_id, name, is_default) values 
    (v_cat_id, 'Cursos', true), (v_cat_id, 'Mensalidades', true), (v_cat_id, 'Materiais', true)
  on conflict (category_id, name) do nothing;

  -- Serviços
  insert into public.categories (user_id, name, icon, type, is_default)
  values (target_user_id, 'Serviços', 'handyman', 'expense', true)
  on conflict (user_id, name) do nothing;
  select id into v_cat_id from public.categories where user_id = target_user_id and name = 'Serviços';
  insert into public.subcategories (category_id, name, is_default) values 
    (v_cat_id, 'Assinaturas', true), (v_cat_id, 'Telefonia', true), (v_cat_id, 'Seguro', true)
  on conflict (category_id, name) do nothing;

  -- Receitas: Salário
  insert into public.categories (user_id, name, icon, type, is_default)
  values (target_user_id, 'Salário', 'work', 'income', true)
  on conflict (user_id, name) do nothing;
  select id into v_cat_id from public.categories where user_id = target_user_id and name = 'Salário';
  insert into public.subcategories (category_id, name, is_default) values (v_cat_id, 'Mensal', true), (v_cat_id, 'Adiantamento', true)
  on conflict (category_id, name) do nothing;

  -- Receitas: Investimentos
  insert into public.categories (user_id, name, icon, type, is_default)
  values (target_user_id, 'Investimentos', 'savings', 'income', true)
  on conflict (user_id, name) do nothing;
  select id into v_cat_id from public.categories where user_id = target_user_id and name = 'Investimentos';
  insert into public.subcategories (category_id, name, is_default) values (v_cat_id, 'Dividendos', true), (v_cat_id, 'Renda Fixa', true)
  on conflict (category_id, name) do nothing;
end;
$$ language plpgsql security definer;

-- Trigger
create or replace function public.handle_new_user_categories()
returns trigger as $$
begin
  perform public.insert_default_categories(new.id);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created_categories on auth.users;
create trigger on_auth_user_created_categories
  after insert on auth.users
  for each row execute procedure public.handle_new_user_categories();

-- MIGRAÇÃO MANUAL (Descomente para rodar)
-- do $$
-- declare
--   r record;
-- begin
--   for r in select id from auth.users loop
--     perform public.insert_default_categories(r.id);
--   end loop;
-- end;
-- $$;
