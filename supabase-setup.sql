-- Run this ONCE in Supabase: SQL Editor > New query > paste > Run.
-- NOTE: this project is meant to be SEPARATE from any Supabase project your backend partner
-- is using for the school management system, so these table/bucket names are safe to use as-is.
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  venue text default '',
  start_at timestamptz not null,
  cover_url text,
  photos text[] not null default '{}',
  created_at timestamptz default now()
);
alter table public.events enable row level security;
create policy "Anyone can read events" on public.events for select using (true);
create policy "Admins manage events" on public.events for all to authenticated using (true) with check (true);

insert into storage.buckets (id, name, public) values ('event-photos','event-photos',true) on conflict (id) do nothing;
create policy "Public read event photos" on storage.objects for select using (bucket_id = 'event-photos');
create policy "Admins upload event photos" on storage.objects for insert to authenticated with check (bucket_id = 'event-photos');
create policy "Admins update event photos" on storage.objects for update to authenticated using (bucket_id = 'event-photos');
create policy "Admins delete event photos" on storage.objects for delete to authenticated using (bucket_id = 'event-photos');
