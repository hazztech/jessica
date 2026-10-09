-- Run in Supabase → SQL Editor after setup. Each block says what to expect.

-- 1) Every table has Row Level Security ON  → expect 0 rows
select tablename from pg_tables where schemaname = 'public' and not rowsecurity;

-- 2) Seed loaded  → expect 8 categories, 19 products, 17 product images, 17 gallery items
select (select count(*) from public.product_categories) as categories,
       (select count(*) from public.products)           as products,
       (select count(*) from public.product_images)     as product_images,
       (select count(*) from public.gallery)            as gallery;

-- 3) Your admin account  → expect your email with role 'admin'
select email, role from public.profiles where role = 'admin';

-- 4) Storage buckets  → customer-uploads must be public = false
select id, public from storage.buckets order by id;
