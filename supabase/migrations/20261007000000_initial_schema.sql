-- =====================================================================
--  Jessica's Customized Shoes & Accessories — initial schema
--  Run in Supabase: SQL Editor → paste → Run  (or `supabase db push`)
--
--  Security model
--   • Row Level Security is ON for every table.
--   • Shoppers (anon) can only READ published catalog, gallery and reviews.
--   • Orders and custom requests are CREATED only by Netlify Functions using
--     the service-role key (server-side validation + re-pricing).
--   • Admins (profiles.role = 'admin') can read/write everything, enforced
--     by the database itself via is_admin().
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- helpers ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------- profiles (one row per auth user) ----------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  full_name   text,
  phone       text,
  role        text not null default 'customer' check (role in ('customer', 'admin')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

-- create a profile automatically when someone signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- is the signed-in user an admin?  (security definer avoids RLS recursion)
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- users may not promote themselves: only admins can change role
create or replace function public.protect_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- API callers (anon/authenticated) need admin rights; the SQL editor and
  -- service role (no end-user JWT) are trusted.
  if new.role is distinct from old.role
     and coalesce(auth.role(), '') in ('anon', 'authenticated')
     and not public.is_admin() then
    raise exception 'Only admins can change roles';
  end if;
  return new;
end $$;
create trigger profiles_protect_role before update on public.profiles
  for each row execute function public.protect_role();

-- ---------- catalog ----------
create table public.product_categories (
  id          text primary key,              -- 'shoes', 'outfits', …
  name        text not null,
  slug        text not null unique,
  description text not null default '',
  image       jsonb,                         -- { url, alt, width, height }
  sort        int not null default 0
);

create table public.products (
  id                        text primary key default ('p-' || substr(gen_random_uuid()::text, 1, 8)),
  slug                      text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name                      text not null check (length(name) between 1 and 120),
  description               text not null default '',
  category_id               text not null references public.product_categories (id),
  price                     numeric(10, 2) not null check (price > 0),
  sale_price                numeric(10, 2) check (sale_price is null or (sale_price > 0 and sale_price < price)),
  video                     text,
  featured                  boolean not null default false,
  customizable              boolean not null default true,
  active                    boolean not null default true,     -- visible in shop
  archived                  boolean not null default false,
  inventory                 int check (inventory is null or inventory >= 0),  -- null = made to order
  low_stock_threshold       int not null default 3,
  estimated_production_time text not null default '1–2 weeks',
  sizes                     text[] not null default '{}',
  colors                    text[] not null default '{}',
  occasions                 text[] not null default '{}',
  popularity                int not null default 0,
  customization             jsonb not null default '{}'::jsonb, -- per-product settings on top of the category schema
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);
create index products_category_idx on public.products (category_id);
create index products_visible_idx on public.products (active, archived);
create trigger products_updated before update on public.products
  for each row execute function public.set_updated_at();

-- image FILES live in Storage; rows store only the URL + file metadata
create table public.product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  text not null references public.products (id) on delete cascade,
  url         text not null,
  src_set     text,                          -- responsive sizes, e.g. "a-600.webp 600w, a.webp 1200w"
  path        text,                          -- storage path (null for static /images files)
  alt         text not null default '',
  width       int,
  height      int,
  file_name   text,
  file_type   text,
  file_size   int,
  sort        int not null default 0,
  uploaded_at timestamptz not null default now()
);
create index product_images_product_idx on public.product_images (product_id, sort);

-- size/color variants for stock tracking (optional; reserved for future use)
create table public.product_variants (
  id          uuid primary key default gen_random_uuid(),
  product_id  text not null references public.products (id) on delete cascade,
  label       text not null,                 -- e.g. "Women's 8 / Black"
  sku         text unique,
  inventory   int check (inventory is null or inventory >= 0),
  price_delta numeric(10, 2) not null default 0
);

-- ---------- coupons ----------
create table public.coupons (
  code        text primary key check (code = upper(code)),
  type        text not null check (type in ('percent', 'fixed')),
  value       numeric(10, 2) not null check (value > 0),
  active      boolean not null default true,
  starts_at   timestamptz,
  ends_at     timestamptz,
  max_uses    int,
  uses        int not null default 0,
  min_subtotal numeric(10, 2) not null default 0,
  created_at  timestamptz not null default now()
);

-- ---------- orders ----------
create sequence public.order_number_seq start 1001;

create table public.orders (
  id                uuid primary key default gen_random_uuid(),
  order_number      text not null unique default ('JCS-' || nextval('public.order_number_seq')),
  customer_id       uuid references auth.users (id) on delete set null,
  customer          jsonb not null,            -- { name, email, phone }
  shipping_address  jsonb not null,
  billing_address   jsonb not null,
  shipping_method   text not null,
  subtotal          numeric(10, 2) not null,
  discount          numeric(10, 2) not null default 0,
  shipping          numeric(10, 2) not null default 0,
  tax               numeric(10, 2) not null default 0,
  total             numeric(10, 2) not null,
  coupon_code       text references public.coupons (code) on delete set null,
  payment_status    text not null default 'unpaid' check (payment_status in ('unpaid', 'paid', 'refunded', 'failed')),
  status            text not null default 'new' check (status in
                      ('new', 'paid', 'processing', 'in-production', 'finishing', 'ready', 'shipped', 'delivered', 'cancelled')),
  tracking_number   text not null default '',
  notes             text not null default '',
  stripe_session_id text unique,
  preview           boolean not null default false,  -- placed while payments were disabled
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index orders_status_idx on public.orders (status, created_at desc);
create trigger orders_updated before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders (id) on delete cascade,
  product_id  text references public.products (id) on delete set null,
  name        text not null,                  -- copied so history survives product edits/deletes
  category    text not null,
  unit_price  numeric(10, 2) not null,
  quantity    int not null check (quantity between 1 and 99),
  selections  jsonb not null default '{}'::jsonb,
  summary     jsonb not null default '[]'::jsonb,
  charges     jsonb not null default '[]'::jsonb,
  uploads     jsonb not null default '[]'::jsonb  -- [{ path, fileName, fileType, fileSize, uploadDate }]
);
create index order_items_order_idx on public.order_items (order_id);

create table public.order_status_history (
  id        bigint generated always as identity primary key,
  order_id  uuid not null references public.orders (id) on delete cascade,
  status    text not null,
  at        timestamptz not null default now(),
  by_user   uuid default auth.uid()
);

-- ---------- custom requests ----------
create table public.custom_requests (
  id                         uuid primary key default gen_random_uuid(),
  request_number             text not null unique check (request_number ~ '^JCSA-[0-9]{5}$'),
  customer_id                uuid references auth.users (id) on delete set null,
  first_name                 text not null,
  last_name                  text not null,
  email                      text not null,
  phone                      text not null default '',
  preferred_contact_method   text not null check (preferred_contact_method in ('email', 'text', 'phone')),
  item_types                 text[] not null,
  occasion                   text,
  style_theme                text,
  colors                     text[] not null default '{}',
  color_notes                text not null default '',
  description                text not null,
  personalization            text not null default '',
  design_elements            text[] not null default '{}',
  sizes                      jsonb not null default '[]'::jsonb,
  quantity                   int not null default 1 check (quantity between 1 and 999),
  additional_requests        text not null default '',
  details                    jsonb not null default '{}'::jsonb,   -- raw answers per category
  detail_summary             jsonb not null default '[]'::jsonb,   -- readable answers per category
  vision_summary             jsonb not null default '[]'::jsonb,
  common_summary             jsonb not null default '[]'::jsonb,
  budget                     text not null,
  budget_label               text,
  requested_date             date,
  rush_requested             boolean not null default false,
  acknowledged_pricing_terms boolean not null default false,
  admin_notes                text not null default '',
  quoted_price               numeric(10, 2),
  deposit_amount             numeric(10, 2),
  status                     text not null default 'new' check (status in
                               ('new', 'reviewing', 'need-info', 'quote-sent', 'awaiting-approval', 'approved', 'deposit-paid',
                                'in-production', 'finishing', 'ready', 'shipped', 'completed', 'cancelled')),
  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now()
);
create index custom_requests_status_idx on public.custom_requests (status, created_at desc);
create trigger custom_requests_updated before update on public.custom_requests
  for each row execute function public.set_updated_at();

create table public.custom_request_images (
  id          uuid primary key default gen_random_uuid(),
  request_id  uuid not null references public.custom_requests (id) on delete cascade,
  path        text not null,                 -- private bucket: customer-uploads
  file_name   text not null,
  file_type   text not null,
  file_size   int not null,
  uploaded_at timestamptz not null default now()
);
create index custom_request_images_req_idx on public.custom_request_images (request_id);

create table public.custom_request_status_history (
  id          bigint generated always as identity primary key,
  request_id  uuid not null references public.custom_requests (id) on delete cascade,
  status      text not null,
  at          timestamptz not null default now(),
  by_user     uuid default auth.uid()
);

-- status history is recorded automatically, for every status change
create or replace function public.log_order_status()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    insert into public.order_status_history (order_id, status) values (new.id, new.status);
  end if;
  return new;
end $$;
create trigger orders_status_log after insert or update of status on public.orders
  for each row execute function public.log_order_status();

create or replace function public.log_request_status()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    insert into public.custom_request_status_history (request_id, status) values (new.id, new.status);
  end if;
  return new;
end $$;
create trigger custom_requests_status_log after insert or update of status on public.custom_requests
  for each row execute function public.log_request_status();

-- ---------- reviews, gallery, wishlists ----------
create table public.reviews (
  id          uuid primary key default gen_random_uuid(),
  product_id  text references public.products (id) on delete cascade,
  customer_id uuid references auth.users (id) on delete set null,
  name        text not null,
  rating      int not null check (rating between 1 and 5),
  body        text not null default '',
  approved    boolean not null default false,
  created_at  timestamptz not null default now()
);

create table public.gallery (
  id          text primary key default ('g-' || substr(gen_random_uuid()::text, 1, 8)),
  title       text not null,
  category_id text not null references public.product_categories (id),
  description text not null default '',
  images      jsonb not null default '[]'::jsonb,  -- [{ url, path, alt, width, height, fileName, fileType, fileSize, uploadDate }]
  featured    boolean not null default false,
  published   boolean not null default true,
  sort        int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger gallery_updated before update on public.gallery
  for each row execute function public.set_updated_at();

create table public.wishlists (
  customer_id uuid not null references auth.users (id) on delete cascade,
  product_id  text not null references public.products (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (customer_id, product_id)
);

-- ---------- stock: called by the Stripe webhook after payment ----------
create or replace function public.decrement_inventory(p_product_id text, p_qty int)
returns void language sql security definer set search_path = public as $$
  update public.products
     set inventory = greatest(inventory - p_qty, 0)
   where id = p_product_id and inventory is not null;
$$;
revoke execute on function public.decrement_inventory(text, int) from public, anon, authenticated;
grant execute on function public.decrement_inventory(text, int) to service_role;

create or replace function public.increment_coupon_use(p_code text)
returns void language sql security definer set search_path = public as $$
  update public.coupons set uses = uses + 1 where code = p_code;
$$;
revoke execute on function public.increment_coupon_use(text) from public, anon, authenticated;
grant execute on function public.increment_coupon_use(text) to service_role;

-- =====================================================================
--  ROW LEVEL SECURITY
-- =====================================================================
alter table public.profiles                      enable row level security;
alter table public.product_categories            enable row level security;
alter table public.products                      enable row level security;
alter table public.product_images                enable row level security;
alter table public.product_variants              enable row level security;
alter table public.coupons                       enable row level security;
alter table public.orders                        enable row level security;
alter table public.order_items                   enable row level security;
alter table public.order_status_history          enable row level security;
alter table public.custom_requests               enable row level security;
alter table public.custom_request_images         enable row level security;
alter table public.custom_request_status_history enable row level security;
alter table public.reviews                       enable row level security;
alter table public.gallery                       enable row level security;
alter table public.wishlists                     enable row level security;

-- profiles: see/edit your own; admins see all
create policy "profiles: own read"   on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles: own update" on public.profiles for update using (id = auth.uid() or public.is_admin());

-- public catalog reads
create policy "categories: public read" on public.product_categories for select using (true);
create policy "products: public read visible" on public.products for select
  using ((active and not archived) or public.is_admin());
create policy "product_images: public read" on public.product_images for select
  using (exists (select 1 from public.products p where p.id = product_id and ((p.active and not p.archived) or public.is_admin())));
create policy "variants: public read" on public.product_variants for select using (true);
create policy "gallery: public read published" on public.gallery for select using (published or public.is_admin());
create policy "reviews: public read approved" on public.reviews for select using (approved or public.is_admin());

-- wishlists: owner only
create policy "wishlists: owner" on public.wishlists for all
  using (customer_id = auth.uid()) with check (customer_id = auth.uid());

-- customers can read their own orders (when accounts are added)
create policy "orders: own read" on public.orders for select using (customer_id = auth.uid() or public.is_admin());
create policy "order_items: own read" on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_id and (o.customer_id = auth.uid() or public.is_admin())));
create policy "custom_requests: own read" on public.custom_requests for select using (customer_id = auth.uid() or public.is_admin());

-- admins: full access everywhere
do $$
declare t text;
begin
  foreach t in array array['product_categories','products','product_images','product_variants','coupons','orders',
                           'order_items','order_status_history','custom_requests','custom_request_images',
                           'custom_request_status_history','reviews','gallery']
  loop
    execute format('create policy "admin: all" on public.%I for all using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- =====================================================================
--  STORAGE
--   product-images, gallery : public read, admin write
--   customer-uploads        : PRIVATE. Customers upload via one-time signed
--                             upload URLs issued by a Netlify Function;
--                             only admins can read (signed URLs).
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('product-images', 'product-images', true, 15728640, array['image/jpeg','image/png','image/webp']),
  ('gallery', 'gallery', true, 15728640, array['image/jpeg','image/png','image/webp']),
  ('customer-uploads', 'customer-uploads', false, 15728640,
     array['image/jpeg','image/png','image/webp','image/heic','image/heif','application/pdf'])
on conflict (id) do nothing;

create policy "public images: read" on storage.objects for select
  using (bucket_id in ('product-images', 'gallery'));
create policy "public images: admin write" on storage.objects for insert
  with check (bucket_id in ('product-images', 'gallery') and public.is_admin());
create policy "public images: admin update" on storage.objects for update
  using (bucket_id in ('product-images', 'gallery') and public.is_admin());
create policy "public images: admin delete" on storage.objects for delete
  using (bucket_id in ('product-images', 'gallery') and public.is_admin());
create policy "customer uploads: admin read" on storage.objects for select
  using (bucket_id = 'customer-uploads' and public.is_admin());
create policy "customer uploads: admin delete" on storage.objects for delete
  using (bucket_id = 'customer-uploads' and public.is_admin());
