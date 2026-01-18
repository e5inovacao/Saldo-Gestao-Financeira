-- Create subcategories table
create table if not exists public.subcategories (
  id uuid default gen_random_uuid() primary key,
  category_id uuid references public.categories(id) on delete cascade not null,
  name text not null,
  is_default boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Unique index to prevent duplicate names within the same category
create unique index if not exists subcategories_unique_category_name on public.subcategories (category_id, name);

-- RLS Policies
alter table public.subcategories enable row level security;

-- Policy for reading subcategories (everyone can read for now, or filter by category ownership)
-- Since categories are private, we can just check if the user has access to the parent category
-- But for simplicity and performance in this context, we can allow read if the parent category belongs to the user
create policy "Users can view subcategories of their categories"
  on public.subcategories for select
  using (
    exists (
      select 1 from public.categories
      where categories.id = subcategories.category_id
      and categories.user_id = auth.uid()
    )
  );

create policy "Users can insert subcategories to their categories"
  on public.subcategories for insert
  with check (
    exists (
      select 1 from public.categories
      where categories.id = category_id
      and categories.user_id = auth.uid()
    )
  );

create policy "Users can update subcategories of their categories"
  on public.subcategories for update
  using (
    exists (
      select 1 from public.categories
      where categories.id = subcategories.category_id
      and categories.user_id = auth.uid()
    )
  );

create policy "Users can delete subcategories of their categories"
  on public.subcategories for delete
  using (
    exists (
      select 1 from public.categories
      where categories.id = subcategories.category_id
      and categories.user_id = auth.uid()
    )
  );
