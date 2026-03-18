-- ==========================================
-- HOTEL BOOKING WEB APP - CONSOLIDATED SCHEMA
-- ==========================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Events / Halls Table
-- This table represents the physical halls or venues available for booking
create table public.events (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  image_url text,
  capacity integer,
  price_per_guest numeric,
  features text,
  type text default 'Wedding Hall', -- e.g. Wedding Hall, Party Hall
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Rooms Table
create table public.rooms (
  id uuid default uuid_generate_v4() primary key,
  room_number text not null unique,
  type text not null, -- Single, Double, Suite, Deluxe
  price numeric not null,
  status text default 'Available', -- Available, Occupied, Maintenance
  description text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Staff Table
create table public.staff (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text not null unique,
  phone text,
  role text not null, -- owner, staff_manager, receptionist, event_manager
  status text default 'active',
  temp_password text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Facilities Table
create table public.facilities (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  status text default 'Operational', 
  image_url text,
  price_per_hour numeric default 0,
  max_capacity integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Menu Table
create table public.menu (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  category text not null, 
  is_available boolean default true,
  is_featured boolean default false,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Users Table (For Customers)
create table public.users (
  id uuid references auth.users not null primary key,
  name text,
  email text not null,
  role text default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Room Bookings Table
create table public.room_bookings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users, -- Nullable for walk-in guests
  room_id uuid references public.rooms(id) not null,
  check_in date not null,
  check_out date not null,
  total_price numeric not null,
  status text default 'Confirmed',
  guest_name text, -- For walk-in
  guest_email text,
  guest_phone text,
  guest_id_no text, -- Passport / NIC
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Event Bookings Table
create table public.event_bookings (
  id uuid default uuid_generate_v4() primary key,
  hall_id uuid references public.events(id) not null,
  user_id uuid references auth.users,
  customer_name text,
  customer_email text,
  customer_phone text,
  customer_id_no text, -- Guest ID / NIC
  booking_date date not null,
  session_type text check (session_type in ('Morning', 'Evening', 'Full Day')),
  guest_count integer,
  total_price numeric,
  status text default 'Confirmed',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Ensure a hall isn't double booked for the same session
  constraint unique_hall_session unique(hall_id, booking_date, session_type)
);

-- 9. Facility Bookings Table
create table public.facility_bookings (
  id uuid default uuid_generate_v4() primary key,
  facility_id uuid references public.facilities(id) not null,
  user_id uuid references auth.users,
  customer_name text,
  customer_email text,
  customer_phone text,
  customer_id_no text, -- NIC / Passport
  booking_date date not null,
  start_time time not null,
  duration_hours integer not null,
  guest_count integer not null,
  total_price numeric not null,
  status text default 'Confirmed',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. Reviews Table
create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  user_name text,
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  status text default 'Pending',
  event_id uuid references public.events(id),
  room_id uuid references public.rooms(id),
  facility_id uuid references public.facilities(id),
  room_booking_id uuid references public.room_bookings(id),
  event_booking_id uuid references public.event_bookings(id),
  facility_booking_id uuid references public.facility_bookings(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. Payments Table
create table public.payments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users,
  room_booking_id uuid references public.room_bookings(id) on delete set null,
  event_booking_id uuid references public.event_bookings(id) on delete set null,
  facility_booking_id uuid references public.facility_bookings(id) on delete set null,
  amount numeric not null,
  payment_method text not null check (payment_method in ('Card', 'Cash')), -- Card, Cash only
  payment_status text default 'Paid',
  transaction_id text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 12. FAQs Table
create table public.faqs (
  id uuid default uuid_generate_v4() primary key,
  question text not null,
  answer text not null,
  category text not null default 'General', -- General, Booking, Events, Dining, etc.
  is_active boolean default true,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 13. Promotions Table
create table public.promotions (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  discount_percentage numeric,
  start_date date not null,
  end_date date not null,
  target_type text default 'All', -- Rooms, Events, Facilities, All
  is_active boolean default true,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

alter table public.events enable row level security;
alter table public.rooms enable row level security;
alter table public.staff enable row level security;
alter table public.facilities enable row level security;
alter table public.menu enable row level security;
alter table public.users enable row level security;
alter table public.room_bookings enable row level security;
alter table public.event_bookings enable row level security;
alter table public.reviews enable row level security;
alter table public.facility_bookings enable row level security;
alter table public.payments enable row level security;
alter table public.faqs enable row level security;
alter table public.promotions enable row level security;

-- Public Read Access
create policy "Public Access Events Select" on public.events for select using (true);
create policy "Public Access Rooms Select" on public.rooms for select using (true);
create policy "Public Access Facilities Select" on public.facilities for select using (true);
create policy "Public Access Menu Select" on public.menu for select using (true);
create policy "Public Access Reviews Select" on public.reviews for select using (true);
create policy "Public Access FAQs Select" on public.faqs for select using (true);
create policy "Public Access Promotions Select" on public.promotions for select using (true);
create policy "Public Access Facility Bookings All" on public.facility_bookings for all using (true) with check (true);
create policy "Public Access Payments All" on public.payments for all to anon, authenticated using (true) with check (true);
grant all on public.payments to anon, authenticated, service_role;
grant all on public.faqs to anon, authenticated, service_role;
grant all on public.promotions to anon, authenticated, service_role;

-- Admin/Staff Access (Simplicifed for Dev, usually restricted by role)
create policy "Staff Access All Staff" on public.staff for all using (true);
create policy "Staff Access All Menu" on public.menu for all using (true);
create policy "Staff Access All Events" on public.events for all using (true);
create policy "Staff Access All Rooms" on public.rooms for all using (true);
create policy "Staff Access All Facilities" on public.facilities for all using (true);
create policy "Staff Access All FAQs" on public.faqs for all using (true) with check (true);
create policy "Staff Access All Promotions" on public.promotions for all using (true) with check (true);

-- Users
create policy "Users manage own profile" on public.users for all using (auth.uid() = id);
create policy "Public access users" on public.users for select using (true);

-- Room Bookings
create policy "Public Access Room Bookings All" on public.room_bookings for all using (true) with check (true);

-- Event Bookings
create policy "Public Access Event Bookings All" on public.event_bookings for all using (true) with check (true);
