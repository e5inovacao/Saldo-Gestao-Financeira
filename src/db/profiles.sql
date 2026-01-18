-- Tabela de Perfis (Profiles)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  goal text,
  experience text,
  occupation text,
  updated_at timestamptz default now()
);

-- Habilitar RLS
alter table public.profiles enable row level security;

-- Políticas de Segurança (RLS)
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Trigger para atualizar updated_at automaticamente (Opcional, mas recomendado)
create extension if not exists moddatetime schema extensions;
create trigger handle_updated_at before update on public.profiles
  for each row execute procedure moddatetime (updated_at);
