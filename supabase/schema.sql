create table if not exists kv_store (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table kv_store enable row level security;

create policy "Permitir leitura" on kv_store
  for select using (true);

create policy "Permitir escrita" on kv_store
  for insert with check (true);

create policy "Permitir atualização" on kv_store
  for update using (true);

create policy "Permitir exclusão" on kv_store
  for delete using (true);
