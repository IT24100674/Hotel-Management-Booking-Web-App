-- ==========================================
-- STORAGE SETUP AND RLS POLICIES
-- ==========================================

-- 1. Create Buckets
insert into storage.buckets (id, name, public)
values 
  ('room_images', 'room_images', true),
  ('menu_images', 'menu_images', true),
  ('event_images', 'event_images', true),
  ('facility_images', 'facility_images', true),
  ('staff_images', 'staff_images', true)
on conflict (id) do update set public = true;

-- 2. Drop existing broad policies to avoid conflicts
drop policy if exists "Public Access Storage Select" on storage.objects;
drop policy if exists "Public Access Storage Insert" on storage.objects;
drop policy if exists "Public Access Storage Update" on storage.objects;
drop policy if exists "Public Access Storage Delete" on storage.objects;

-- 3. Create Consolidated Policies for Hotel Buckets
-- Note: These policies allow public (anon) and authenticated users to manage images.

create policy "Public Access Storage Select"
on storage.objects for select
using ( bucket_id in ('room_images', 'menu_images', 'event_images', 'facility_images', 'staff_images') );

create policy "Public Access Storage Insert"
on storage.objects for insert
with check ( bucket_id in ('room_images', 'menu_images', 'event_images', 'facility_images', 'staff_images') );

create policy "Public Access Storage Update"
on storage.objects for update
using ( bucket_id in ('room_images', 'menu_images', 'event_images', 'facility_images', 'staff_images') );

create policy "Public Access Storage Delete"
on storage.objects for delete
using ( bucket_id in ('room_images', 'menu_images', 'event_images', 'facility_images', 'staff_images') );
