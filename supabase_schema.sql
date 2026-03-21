-- SQL Schema for JX4 Paracotos

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table (Profiles)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  roles TEXT[] DEFAULT '{customer}',
  department_id UUID, -- For department admins
  transport_line_id UUID, -- For transport admins
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Departments Table
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  whatsapp TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories Table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  department_id UUID REFERENCES departments(id),
  icon TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  department_id UUID REFERENCES departments(id),
  category_id UUID REFERENCES categories(id),
  active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- News Table
CREATE TABLE news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  image_url TEXT,
  video_id TEXT, -- YouTube Video ID
  active BOOLEAN DEFAULT true,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ads Table (Ticker/Carousel)
CREATE TABLE ads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  link TEXT,
  active BOOLEAN DEFAULT true,
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ends_at TIMESTAMP WITH TIME ZONE,
  priority INTEGER DEFAULT 0
);

-- Transport Lines Table
CREATE TABLE transport_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  schedule TEXT,
  departure_time TIME,
  arrival_time TIME,
  price DECIMAL(10,2),
  news_update TEXT,
  status TEXT DEFAULT 'normal', -- normal, retraso, cola, salida, accidente, alerta
  whatsapp TEXT,
  active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job Offers Table
CREATE TABLE job_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  description TEXT,
  contact_info TEXT,
  active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services Table
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  description TEXT,
  whatsapp TEXT,
  category TEXT,
  active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social Inventory Table
CREATE TABLE social_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER DEFAULT 0,
  image_url TEXT,
  active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community Table (Sports & Culture)
CREATE TABLE community (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  area TEXT NOT NULL, -- sports, culture
  type TEXT NOT NULL, -- news, event, profile
  category TEXT,
  event_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  contact_info TEXT,
  published_by UUID REFERENCES auth.users(id),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings Table
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Initial Data
-- INSERT INTO settings (key, value) VALUES ('exchange_rate', '{"rate": "43.31", "euro_rate": "50.17"}');
