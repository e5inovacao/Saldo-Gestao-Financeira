create extension if not exists pgcrypto;

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  subcategory_id uuid references public.subcategories(id),
  description text,
  amount numeric not null,
  date date not null,
  type text not null check (type in ('income','expense')),
  created_at timestamptz default now()
);

alter table public.transactions enable row level security;
drop policy if exists "transactions_select_own" on public.transactions;
create policy "transactions_select_own" on public.transactions for select using (user_id = auth.uid());
drop policy if exists "transactions_insert_own" on public.transactions;
create policy "transactions_insert_own" on public.transactions for insert with check (user_id = auth.uid());
drop policy if exists "transactions_update_own" on public.transactions;
create policy "transactions_update_own" on public.transactions for update using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "transactions_delete_own" on public.transactions;
create policy "transactions_delete_own" on public.transactions for delete using (user_id = auth.uid());

create index if not exists transactions_user_date_idx on public.transactions (user_id, date);
create index if not exists transactions_category_idx on public.transactions (category_id);
