-- Run this in your Supabase project's SQL editor

-- Puzzles table
create table if not exists puzzles (
  id                    text primary key,
  number                integer unique not null,
  date                  date unique not null,
  fake_card             jsonb not null,
  real_card_name        text not null,
  real_card_scryfall_id text not null,
  difficulty            text not null default 'easy' check (difficulty in ('easy','hard')),
  state                 text not null default 'draft' check (state in ('draft','scheduled','published')),
  hints                 text[] not null default '{}',
  tags                  text[],
  curator_notes         text,
  created_at            timestamptz not null default now(),
  published_at          timestamptz
);

create index if not exists puzzles_date_idx  on puzzles(date);
create index if not exists puzzles_state_idx on puzzles(state);
create index if not exists puzzles_num_idx   on puzzles(number);

-- Row Level Security: public can only read published/scheduled puzzles
alter table puzzles enable row level security;

create policy "Public read published" on puzzles
  for select using (state in ('published', 'scheduled'));

create policy "Service role full access" on puzzles
  for all using (auth.role() = 'service_role');

-- Storage bucket for card artwork
insert into storage.buckets (id, name, public)
values ('card-artwork', 'card-artwork', true)
on conflict (id) do nothing;

create policy "Public read artwork" on storage.objects
  for select using (bucket_id = 'card-artwork');

create policy "Service role upload artwork" on storage.objects
  for insert with check (bucket_id = 'card-artwork' and auth.role() = 'service_role');

-- Seed data from the existing puzzles (paste your puzzle rows here or import via Supabase dashboard)
