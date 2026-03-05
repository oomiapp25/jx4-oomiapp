-- JX4 Paracotos - Supabase Schema (Idempotent Version)

-- 0. Cleanup for existing conflicting objects
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.has_any_role(user_role[]);

-- 1. Custom Types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('customer', 'admin', 'category_admin', 'department_admin', 'transport_admin', 'social_admin', 'sports_admin', 'culture_admin');
EXCEPTION
    WHEN duplicate_object THEN 
        -- If type exists, we might need to add the new values if they're missing
        BEGIN
            ALTER TYPE user_role ADD VALUE 'sports_admin';
        EXCEPTION
            WHEN duplicate_object THEN null;
        END;
        BEGIN
            ALTER TYPE user_role ADD VALUE 'culture_admin';
        EXCEPTION
            WHEN duplicate_object THEN null;
        END;
END $$;

-- 2. Tables

CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    roles user_role[] DEFAULT '{customer}' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.departments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    whatsapp TEXT
);

CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER DEFAULT 0 NOT NULL,
    images TEXT[] DEFAULT '{}' NOT NULL,
    category_id UUID REFERENCES public.categories(id),
    department_id UUID REFERENCES public.departments(id),
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.transports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    carrier_info TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    has_papers BOOLEAN DEFAULT false NOT NULL,
    vehicle_type TEXT,
    whatsapp TEXT,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.transport_lines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    schedule TEXT,
    departure_time TEXT,
    arrival_time TEXT,
    price DECIMAL(10,2),
    news_update TEXT,
    status TEXT DEFAULT 'normal',
    whatsapp TEXT,
    active BOOLEAN DEFAULT true NOT NULL,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.job_offers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    description TEXT,
    contact_info TEXT,
    active BOOLEAN DEFAULT true NOT NULL,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.services_portfolio (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    provider_name TEXT NOT NULL,
    description TEXT,
    whatsapp TEXT,
    category TEXT,
    active BOOLEAN DEFAULT true NOT NULL,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id),
    items JSONB NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL,
    transport_id UUID REFERENCES public.transports(id),
    address TEXT NOT NULL,
    customer_name TEXT,
    customer_phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.ads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    image_url TEXT NOT NULL,
    title TEXT,
    description TEXT,
    link TEXT,
    active BOOLEAN DEFAULT true NOT NULL,
    starts_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    priority INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.news (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT,
    image_url TEXT,
    active BOOLEAN DEFAULT true NOT NULL,
    published_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.admin_invites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    role_to_grant user_role NOT NULL,
    token TEXT UNIQUE NOT NULL,
    invited_by UUID REFERENCES public.users(id),
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Social Help Tables
CREATE TABLE IF NOT EXISTS public.social_inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    quantity INTEGER DEFAULT 0 NOT NULL,
    image_url TEXT,
    active BOOLEAN DEFAULT true NOT NULL,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.social_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_name TEXT NOT NULL,
    requester_phone TEXT NOT NULL,
    item_requested TEXT NOT NULL,
    justification TEXT NOT NULL,
    medical_report_url TEXT,
    status TEXT DEFAULT 'pending' NOT NULL, -- pending, approved, rejected, delivered
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.social_deliveries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    beneficiary_name TEXT NOT NULL,
    item_delivered TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    delivery_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Alter users additions (if not present)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Alter orders additions
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;

-- 3. Functions & Triggers

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  -- Super admin bypass
  IF (SELECT auth.jwt() ->> 'email') = 'jjtovar1510@gmail.com' THEN
    RETURN true;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND roles && ARRAY['admin'::user_role]
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.has_any_role(roles_to_check user_role[])
RETURNS boolean AS $$
BEGIN
  -- Super admin bypass
  IF (SELECT auth.jwt() ->> 'email') = 'jjtovar1510@gmail.com' THEN
    RETURN true;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND roles && roles_to_check
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, roles)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', '{customer}')
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
        updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_deliveries ENABLE ROW LEVEL SECURITY;

-- 5. Policies (Idempotent)

-- Users
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Admins can update users" ON public.users;
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.users FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update users" ON public.users FOR UPDATE USING (public.is_admin());

-- Products
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (public.has_any_role(ARRAY['admin'::user_role, 'category_admin'::user_role, 'department_admin'::user_role]));

-- Categories
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (public.is_admin());

-- Departments
DROP POLICY IF EXISTS "Anyone can view departments" ON public.departments;
DROP POLICY IF EXISTS "Admins can manage departments" ON public.departments;
CREATE POLICY "Anyone can view departments" ON public.departments FOR SELECT USING (true);
CREATE POLICY "Admins can manage departments" ON public.departments FOR ALL USING (public.is_admin());

-- Transport lines
DROP POLICY IF EXISTS "Anyone can view transport lines" ON public.transport_lines;
DROP POLICY IF EXISTS "Admins can manage transport lines" ON public.transport_lines;
CREATE POLICY "Anyone can view transport lines" ON public.transport_lines FOR SELECT USING (true);
CREATE POLICY "Admins can manage transport lines" ON public.transport_lines FOR ALL USING (public.has_any_role(ARRAY['admin'::user_role, 'transport_admin'::user_role]));

-- Transports (Delivery/Private)
DROP POLICY IF EXISTS "Anyone can view transports" ON public.transports;
DROP POLICY IF EXISTS "Admins can manage transports" ON public.transports;
CREATE POLICY "Anyone can view transports" ON public.transports FOR SELECT USING (true);
CREATE POLICY "Admins can manage transports" ON public.transports FOR ALL USING (public.has_any_role(ARRAY['admin'::user_role, 'transport_admin'::user_role]));

-- Job offers
DROP POLICY IF EXISTS "Anyone can view jobs" ON public.job_offers;
DROP POLICY IF EXISTS "Admins can manage jobs" ON public.job_offers;
CREATE POLICY "Anyone can view jobs" ON public.job_offers FOR SELECT USING (active = true);
CREATE POLICY "Admins can manage jobs" ON public.job_offers FOR ALL USING (public.is_admin());

-- Services portfolio
DROP POLICY IF EXISTS "Anyone can view services" ON public.services_portfolio;
DROP POLICY IF EXISTS "Admins can manage services" ON public.services_portfolio;
CREATE POLICY "Anyone can view services" ON public.services_portfolio FOR SELECT USING (active = true);
CREATE POLICY "Admins can manage services" ON public.services_portfolio FOR ALL USING (public.is_admin());

-- Orders
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT USING (public.is_admin());
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);

-- Ads
DROP POLICY IF EXISTS "Anyone can view active ads" ON public.ads;
DROP POLICY IF EXISTS "Admins can manage ads" ON public.ads;
CREATE POLICY "Anyone can view active ads" ON public.ads FOR SELECT USING (active = true);
CREATE POLICY "Admins can manage ads" ON public.ads FOR ALL USING (public.is_admin());

-- News
DROP POLICY IF EXISTS "Anyone can view active news" ON public.news;
DROP POLICY IF EXISTS "Admins can manage news" ON public.news;
CREATE POLICY "Anyone can view active news" ON public.news FOR SELECT USING (active = true);
CREATE POLICY "Admins can manage news" ON public.news FOR ALL USING (public.is_admin());

-- Settings
DROP POLICY IF EXISTS "Anyone can view settings" ON public.settings;
DROP POLICY IF EXISTS "Admins can manage settings" ON public.settings;
CREATE POLICY "Anyone can view settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON public.settings FOR ALL USING (public.is_admin());

-- Social Inventory
DROP POLICY IF EXISTS "Anyone can view social inventory" ON public.social_inventory;
DROP POLICY IF EXISTS "Social admins can manage inventory" ON public.social_inventory;
CREATE POLICY "Anyone can view social inventory" ON public.social_inventory FOR SELECT USING (active = true);
CREATE POLICY "Social admins can manage inventory" ON public.social_inventory FOR ALL USING (public.has_any_role(ARRAY['admin'::user_role, 'social_admin'::user_role]));

-- Social Requests
DROP POLICY IF EXISTS "Anyone can create requests" ON public.social_requests;
DROP POLICY IF EXISTS "Social admins can view requests" ON public.social_requests;
CREATE POLICY "Anyone can create requests" ON public.social_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Social admins can view requests" ON public.social_requests FOR ALL USING (public.has_any_role(ARRAY['admin'::user_role, 'social_admin'::user_role]));

-- Social Deliveries
DROP POLICY IF EXISTS "Anyone can view deliveries" ON public.social_deliveries;
DROP POLICY IF EXISTS "Social admins can manage deliveries" ON public.social_deliveries;
CREATE POLICY "Anyone can view deliveries" ON public.social_deliveries FOR SELECT USING (true);
CREATE POLICY "Social admins can manage deliveries" ON public.social_deliveries FOR ALL USING (public.has_any_role(ARRAY['admin'::user_role, 'social_admin'::user_role]));

-- Community (Sports & Culture)
CREATE TABLE IF NOT EXISTS public.community_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    area TEXT NOT NULL CHECK (area IN ('sports', 'culture')),
    type TEXT NOT NULL CHECK (type IN ('news', 'event', 'profile')),
    category TEXT,
    event_date TIMESTAMPTZ,
    location TEXT,
    contact_info TEXT,
    published_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.community_spaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    location TEXT,
    contact_info TEXT,
    image_url TEXT,
    area TEXT NOT NULL CHECK (area IN ('sports', 'culture')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    active BOOLEAN DEFAULT true
);

ALTER TABLE public.community_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_spaces ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active community entries" ON public.community_entries;
CREATE POLICY "Public can view active community entries" ON public.community_entries FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Public can view active community spaces" ON public.community_spaces;
CREATE POLICY "Public can view active community spaces" ON public.community_spaces FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Admins can manage community entries" ON public.community_entries;
CREATE POLICY "Admins can manage community entries" ON public.community_entries FOR ALL USING (public.has_any_role(ARRAY['admin'::user_role, 'sports_admin'::user_role, 'culture_admin'::user_role]));

DROP POLICY IF EXISTS "Admins can manage community spaces" ON public.community_spaces;
CREATE POLICY "Admins can manage community spaces" ON public.community_spaces FOR ALL USING (public.has_any_role(ARRAY['admin'::user_role, 'sports_admin'::user_role, 'culture_admin'::user_role]));

-- 6. Triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Storage Buckets (Reference)
-- Bucket: products (Public)
-- Bucket: ads (Public)
-- Bucket: news (Public)
