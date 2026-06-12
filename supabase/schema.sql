-- ============================================================
-- Clueless Closet — Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ============================================================

-- ---- Extensions ----
create extension if not exists "uuid-ossp";

-- ---- Enum ----
create type item_category as enum ('top', 'bottom', 'dress', 'shoes', 'purse', 'accessory');

-- ---- profiles (1:1 with auth.users) ----
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  location_city text,
  style_preferences jsonb not null default '{}',
  sizes jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can delete own profile"
  on profiles for delete
  using (auth.uid() = id);

-- Auto-create profile on new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---- items ----
create table items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category item_category not null,
  name text not null,
  photo_url text not null,
  colors text[] not null default '{}',
  style_tags text[] not null default '{}',
  seasons text[] not null default '{}',
  occasions text[] not null default '{}',
  brand text,
  is_wishlist boolean not null default false,
  wishlist_link text,
  wear_count int not null default 0,
  created_at timestamptz not null default now()
);

alter table items enable row level security;

create policy "Users can view own items"
  on items for select
  using (auth.uid() = user_id);

create policy "Users can insert own items"
  on items for insert
  with check (auth.uid() = user_id);

create policy "Users can update own items"
  on items for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own items"
  on items for delete
  using (auth.uid() = user_id);

create index items_user_id_idx on items(user_id);
create index items_category_idx on items(category);
create index items_is_wishlist_idx on items(is_wishlist);

-- ---- outfits ----
create table outfits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text,
  item_ids uuid[] not null,
  occasion text,
  source text not null default 'generated',
  created_at timestamptz not null default now()
);

alter table outfits enable row level security;

create policy "Users can view own outfits"
  on outfits for select
  using (auth.uid() = user_id);

create policy "Users can insert own outfits"
  on outfits for insert
  with check (auth.uid() = user_id);

create policy "Users can update own outfits"
  on outfits for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own outfits"
  on outfits for delete
  using (auth.uid() = user_id);

create index outfits_user_id_idx on outfits(user_id);

-- ---- outfit_calendar ----
create table outfit_calendar (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  outfit_id uuid not null references outfits(id) on delete cascade,
  date date not null,
  status text not null default 'planned',
  constraint status_check check (status in ('planned', 'worn')),
  unique (user_id, date)
);

alter table outfit_calendar enable row level security;

create policy "Users can view own calendar"
  on outfit_calendar for select
  using (auth.uid() = user_id);

create policy "Users can insert own calendar"
  on outfit_calendar for insert
  with check (auth.uid() = user_id);

create policy "Users can update own calendar"
  on outfit_calendar for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own calendar"
  on outfit_calendar for delete
  using (auth.uid() = user_id);

create index outfit_calendar_user_date_idx on outfit_calendar(user_id, date);

-- ============================================================
-- Storage Buckets
-- Run these separately in the SQL Editor after creating buckets
-- in Storage → New Bucket (or use the API)
-- ============================================================

-- Create buckets (run once):
-- insert into storage.buckets (id, name, public) values ('item-photos', 'item-photos', false);
-- insert into storage.buckets (id, name, public) values ('avatars', 'avatars', false);

-- Storage RLS policies for item-photos:
create policy "Users can upload own item photos"
  on storage.objects for insert
  with check (
    bucket_id = 'item-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can view own item photos"
  on storage.objects for select
  using (
    bucket_id = 'item-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update own item photos"
  on storage.objects for update
  using (
    bucket_id = 'item-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own item photos"
  on storage.objects for delete
  using (
    bucket_id = 'item-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage RLS policies for avatars:
create policy "Users can upload own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can view own avatar"
  on storage.objects for select
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
