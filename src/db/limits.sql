-- Update limits table to support subcategories
-- We are recreating it to ensure clean state for the new logic
drop table if exists public.limits;

create table if not exists public.limits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete cascade not null,
  subcategory_id uuid references public.subcategories(id) on delete cascade, -- Nullable for category-level limits
  limit_amount decimal(12,2) not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Ensure unique limit per subcategory (or category if subcategory is null)
  -- This constraint might need adjustment if we allow both, but for now let's enforce uniqueness on subcategory_id if present
  unique(user_id, subcategory_id)
);

-- RLS Policies
alter table public.limits enable row level security;

create policy "Users can view their own limits"
  on public.limits for select
  using (auth.uid() = user_id);

create policy "Users can insert their own limits"
  on public.limits for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own limits"
  on public.limits for update
  using (auth.uid() = user_id);

create policy "Users can delete their own limits"
  on public.limits for delete
  using (auth.uid() = user_id);
