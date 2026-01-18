-- Adicionar coluna para ID do Asaas e CPF
alter table public.profiles add column if not exists asaas_customer_id text;
alter table public.profiles add column if not exists cpf_cnpj text;

-- Índice para busca rápida (opcional, bom para evitar duplicação)
create index if not exists profiles_asaas_id_idx on public.profiles (asaas_customer_id);
