-- 4D Insights Malaysia: initial schema and Row Level Security.
-- Run in the Supabase SQL Editor as a project administrator. This migration intentionally creates no predictions, results, payments, testimonials, or sample accounts.

create extension if not exists pgcrypto;

create type public.membership_status as enum ('inactive', 'pending', 'active', 'expired');
create type public.payment_status as enum ('pending', 'approved', 'rejected', 'more_info');
create type public.content_status as enum ('draft', 'published', 'archived');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  referral_code text,
  role text not null default 'user' check (role in ('user', 'admin')),
  age_confirmed boolean not null default false,
  terms_accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status public.membership_status not null default 'inactive',
  starts_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  membership_id uuid references public.memberships(id) on delete set null,
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'MYR' check (char_length(currency) = 3),
  payment_method text not null,
  transaction_id text not null,
  screenshot_url text,
  status public.payment_status not null default 'pending',
  admin_note text,
  submitted_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  verified_at timestamptz,
  verified_by uuid references auth.users(id)
);

create table if not exists public.free_predictions (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null default auth.uid() references auth.users(id),
  game_name text not null,
  draw_date date not null,
  prediction_date date not null default current_date,
  tip_numbers text[] not null default '{}',
  analysis text,
  video_url text,
  thumbnail_url text,
  confidence_label text default 'Informational Tip',
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.premium_predictions (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null default auth.uid() references auth.users(id),
  game_name text not null,
  draw_date date not null,
  prediction_date date not null default current_date,
  tip_numbers text[] not null default '{}',
  analysis text,
  video_url text,
  thumbnail_url text,
  confidence_label text default 'Informational Tip',
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.result_showcase (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null default auth.uid() references auth.users(id),
  game_name text not null,
  result_date date not null,
  result_number text not null,
  category text not null,
  source_url text,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  status text not null default 'new' check (status in ('new', 'open', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.faq (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  display_order integer not null default 0,
  status public.content_status not null default 'draft',
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payments_user_id_idx on public.payments(user_id);
create index if not exists payments_status_idx on public.payments(status);
create index if not exists payments_created_at_idx on public.payments(created_at desc);
create index if not exists memberships_user_id_idx on public.memberships(user_id);
create index if not exists free_predictions_status_published_idx on public.free_predictions(status, published_at desc);
create index if not exists premium_predictions_status_published_idx on public.premium_predictions(status, published_at desc);
create index if not exists result_showcase_status_date_idx on public.result_showcase(status, result_date desc);
create index if not exists contact_messages_created_at_idx on public.contact_messages(created_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql security invoker set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone, referral_code, age_confirmed, terms_accepted_at)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'phone', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'referral_code', '')), ''),
    coalesce((new.raw_user_meta_data ->> 'age_confirmed')::boolean, false),
    nullif(new.raw_user_meta_data ->> 'terms_accepted_at', '')::timestamptz
  ) on conflict (id) do nothing;

  insert into public.memberships (user_id, status)
  values (new.id, 'inactive') on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

create or replace function public.activate_membership_after_payment()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'approved' and old.status is distinct from 'approved' then
    insert into public.memberships (user_id, status, starts_at)
    values (new.user_id, 'active', now())
    on conflict (user_id) do update set status = 'active', starts_at = coalesce(public.memberships.starts_at, now()), updated_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists activate_membership_on_verified_payment on public.payments;
create trigger activate_membership_on_verified_payment after update of status on public.payments for each row execute procedure public.activate_membership_after_payment();

do $$
declare table_name text;
begin
  foreach table_name in array array['profiles','memberships','payments','free_predictions','premium_predictions','result_showcase','contact_messages','faq']
  loop
    execute format('drop trigger if exists set_%I_updated_at on public.%I', table_name, table_name);
    execute format('create trigger set_%I_updated_at before update on public.%I for each row execute procedure public.set_updated_at()', table_name, table_name);
  end loop;
end $$;

alter table public.profiles enable row level security;
alter table public.admin_users enable row level security;
alter table public.memberships enable row level security;
alter table public.payments enable row level security;
alter table public.free_predictions enable row level security;
alter table public.premium_predictions enable row level security;
alter table public.result_showcase enable row level security;
alter table public.contact_messages enable row level security;
alter table public.faq enable row level security;

create policy "profile owner or administrator can read" on public.profiles for select to authenticated using (auth.uid() = id or public.is_admin());
create policy "profile owner can update ordinary fields" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id and role = 'user');
create policy "administrator can update profiles" on public.profiles for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "administrator can read admin designations" on public.admin_users for select to authenticated using (public.is_admin());
create policy "administrator can manage designations" on public.admin_users for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "member or administrator can read membership" on public.memberships for select to authenticated using (auth.uid() = user_id or public.is_admin());
create policy "administrator can update membership" on public.memberships for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "administrator can create membership" on public.memberships for insert to authenticated with check (public.is_admin());

create policy "member or administrator can read payments" on public.payments for select to authenticated using (auth.uid() = user_id or public.is_admin());
create policy "member can submit pending payment" on public.payments for insert to authenticated with check (auth.uid() = user_id and status = 'pending');
create policy "administrator can review payment" on public.payments for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "administrator can delete payment" on public.payments for delete to authenticated using (public.is_admin());

create policy "public can read published free predictions" on public.free_predictions for select using (status = 'published' or public.is_admin());
create policy "administrator can manage free predictions" on public.free_predictions for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "active members can read published premium predictions" on public.premium_predictions for select to authenticated using (public.is_admin() or (status = 'published' and exists (select 1 from public.memberships where user_id = auth.uid() and status = 'active')));
create policy "administrator can manage premium predictions" on public.premium_predictions for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public can read published showcase records" on public.result_showcase for select using (status = 'published' or public.is_admin());
create policy "administrator can manage showcase records" on public.result_showcase for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "anyone can submit contact message" on public.contact_messages for insert with check (char_length(name) between 1 and 120 and char_length(subject) between 1 and 180 and char_length(message) between 1 and 5000);
create policy "administrator can read contact messages" on public.contact_messages for select to authenticated using (public.is_admin());
create policy "administrator can update contact messages" on public.contact_messages for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public can read published FAQ" on public.faq for select using (status = 'published' or public.is_admin());
create policy "administrator can manage FAQ" on public.faq for all to authenticated using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('payment-screenshots', 'payment-screenshots', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = false, file_size_limit = 5242880, allowed_mime_types = array['image/jpeg','image/png','image/webp'];

create policy "user can upload own payment evidence" on storage.objects for insert to authenticated with check (bucket_id = 'payment-screenshots' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "user or administrator can read payment evidence" on storage.objects for select to authenticated using (bucket_id = 'payment-screenshots' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
create policy "administrator can manage payment evidence" on storage.objects for all to authenticated using (bucket_id = 'payment-screenshots' and public.is_admin()) with check (bucket_id = 'payment-screenshots' and public.is_admin());

-- After the owner registers, promote the correct account. Replace the placeholder with the owner email.
-- insert into public.admin_users (user_id) select id from auth.users where email = 'OWNER_EMAIL@example.com';
-- update public.profiles set role = 'admin' where id in (select id from auth.users where email = 'OWNER_EMAIL@example.com');
