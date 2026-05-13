create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

create table if not exists public.pins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  pin_type text not null check (pin_type in ('person', 'business', 'ngo', 'creator', 'event')),
  display_name text not null check (char_length(trim(display_name)) between 2 and 120),
  description text null check (description is null or char_length(description) <= 2000),

  place_id text not null,
  place_resource_name text not null,
  formatted_address text null,
  short_formatted_address text null,

  city text not null,
  region text null,
  country text not null,
  country_code text null check (country_code is null or char_length(country_code) = 2),

  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),

  google_types text[] not null default '{}',

  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  is_active boolean not null default true,

  reviewed_by uuid null references auth.users(id) on delete set null,
  reviewed_at timestamptz null,
  rejection_reason text null check (rejection_reason is null or char_length(rejection_reason) <= 1000),

  place_refreshed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pin_moderation_events (
  id uuid primary key default gen_random_uuid(),
  pin_id uuid not null references public.pins(id) on delete cascade,
  actor_user_id uuid null references auth.users(id) on delete set null,
  event_type text not null check (event_type in ('submitted', 'approved', 'rejected', 'reopened', 'place_refreshed')),
  reason text null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_pins_public_feed
  on public.pins (created_at desc)
  where status = 'approved' and is_active = true;

create index if not exists idx_pins_status_created
  on public.pins (status, created_at desc);

create index if not exists idx_pins_user_id
  on public.pins (user_id, created_at desc);

create index if not exists idx_pins_place_id
  on public.pins (place_id);

create index if not exists idx_pins_country_city
  on public.pins (country_code, city);

create index if not exists idx_pin_moderation_events_pin_id
  on public.pin_moderation_events (pin_id, created_at desc);

drop trigger if exists trg_pins_set_updated_at on public.pins;
create trigger trg_pins_set_updated_at
before update on public.pins
for each row
execute function public.set_updated_at();

alter table public.pins enable row level security;
alter table public.pin_moderation_events enable row level security;

create policy "public_read_approved_pins"
on public.pins
for select
to anon, authenticated
using (status = 'approved' and is_active = true);

create policy "user_read_own_pins"
on public.pins
for select
to authenticated
using (auth.uid() = user_id);

create policy "user_insert_own_pending_pins"
on public.pins
for insert
to authenticated
with check (
  auth.uid() = user_id
  and status = 'pending'
  and reviewed_by is null
  and reviewed_at is null
);

create policy "user_update_own_pending_pins"
on public.pins
for update
to authenticated
using (auth.uid() = user_id and status = 'pending')
with check (auth.uid() = user_id and status = 'pending');

create policy "admin_full_access_pins"
on public.pins
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "user_read_related_moderation_events"
on public.pin_moderation_events
for select
to authenticated
using (
  exists (
    select 1
    from public.pins p
    where p.id = pin_id
      and (p.user_id = auth.uid() or public.is_admin())
  )
);

create policy "admin_insert_moderation_events"
on public.pin_moderation_events
for insert
to authenticated
with check (public.is_admin());

create policy "admin_read_all_moderation_events"
on public.pin_moderation_events
for select
to authenticated
using (public.is_admin());

alter publication supabase_realtime add table public.pins;
