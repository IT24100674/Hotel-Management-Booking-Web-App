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
  location text not null,
  image_url text,
  capacity integer,
  price numeric,
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
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Menu Table
create table public.menu (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  price numeric not null,
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
create table public.bookings (
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

-- 8. Hall Bookings Table
create table public.hall_bookings (
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

-- 9. Reviews Table
create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  user_name text,
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  status text default 'Pending',
  event_id uuid references public.events(id),
  room_id uuid references public.rooms(id),
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
alter table public.bookings enable row level security;
alter table public.hall_bookings enable row level security;
alter table public.reviews enable row level security;

-- Public Read Access
create policy "Public Access Events Select" on public.events for select using (true);
create policy "Public Access Rooms Select" on public.rooms for select using (true);
create policy "Public Access Facilities Select" on public.facilities for select using (true);
create policy "Public Access Menu Select" on public.menu for select using (true);
create policy "Public Access Reviews Select" on public.reviews for select using (true);

-- Admin/Staff Access (Simplicifed for Dev, usually restricted by role)
create policy "Staff Access All Staff" on public.staff for all using (true);
create policy "Staff Access All Menu" on public.menu for all using (true);
create policy "Staff Access All Events" on public.events for all using (true);
create policy "Staff Access All Rooms" on public.rooms for all using (true);

-- Users
create policy "Users manage own profile" on public.users for all using (auth.uid() = id);
create policy "Public access users" on public.users for select using (true);

-- Room Bookings
create policy "Public Access Bookings Insert" on public.bookings for insert with check (true);
create policy "Public Access Bookings Select" on public.bookings for select using (true);
create policy "Public Access Bookings Update" on public.bookings for update using (true);
create policy "Public Access Bookings Delete" on public.bookings for delete using (true);

-- Hall Bookings
create policy "Public Access Hall Bookings All" on public.hall_bookings for all using (true);
