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
  image_url TEXT,
  sector TEXT,
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
  featured BOOLEAN DEFAULT false,
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

-- Community Videos Table
CREATE TABLE community_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  youtube_id TEXT NOT NULL,
  description TEXT,
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

-- =======================================================
-- MÓDULO DE FALLAS ELÉCTRICAS Y CIRCUITOS JX4 PARACOTOS
-- =======================================================

-- 1. Tabla Circuits
CREATE TABLE IF NOT EXISTS circuits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'normal', -- normal, falla_parcial, corte_total, mantenimiento, reparando
  status_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla Circuit Sectors
CREATE TABLE IF NOT EXISTS circuit_sectors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circuit_id UUID REFERENCES circuits(id) ON DELETE CASCADE,
  sector_name TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(circuit_id, sector_name)
);

-- 3. Tabla Electrical Reports
CREATE TABLE IF NOT EXISTS electrical_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_code TEXT,
  sector TEXT NOT NULL,
  circuit TEXT NOT NULL,
  circuit_id UUID REFERENCES circuits(id) ON DELETE SET NULL,
  location_detail TEXT,
  failure_type TEXT NOT NULL, -- corte_total, bajo_voltaje, cable_caido, transformador, poste, otro
  description TEXT,
  reporter_name TEXT,
  reporter_phone TEXT,
  status TEXT DEFAULT 'pendiente', -- pendiente, en_revision, cuadrilla_asignada, resuelto
  admin_notes TEXT,
  assigned_crew TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_circuit_sectors_circuit_id ON circuit_sectors(circuit_id);
CREATE INDEX IF NOT EXISTS idx_circuit_sectors_lower_name ON circuit_sectors(LOWER(sector_name));
CREATE INDEX IF NOT EXISTS idx_electrical_reports_circuit ON electrical_reports(circuit);
CREATE INDEX IF NOT EXISTS idx_electrical_reports_status ON electrical_reports(status);
CREATE INDEX IF NOT EXISTS idx_electrical_reports_created ON electrical_reports(created_at DESC);

-- RLS
ALTER TABLE circuits ENABLE ROW LEVEL SECURITY;
ALTER TABLE circuit_sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE electrical_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura publica circuits" ON circuits FOR SELECT USING (true);
CREATE POLICY "Lectura publica circuit_sectors" ON circuit_sectors FOR SELECT USING (true);
CREATE POLICY "Lectura publica electrical_reports" ON electrical_reports FOR SELECT USING (true);
CREATE POLICY "Insercion publica electrical_reports" ON electrical_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Modificacion admin electrical_reports" ON electrical_reports FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Gestion admin circuits" ON circuits FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Gestion admin circuit_sectors" ON circuit_sectors FOR ALL USING (auth.role() = 'authenticated');

-- Datos Iniciales de Circuitos de Paracotos
INSERT INTO circuits (code, name, description, active, status) VALUES 
  ('A1', 'Circuito A1 - Casco Central y Zonas Bajas', 'Alimenta el Casco Central de Paracotos, Plaza Bolívar, La Candelaria y sectores aledaños.', true, 'normal'),
  ('A2', 'Circuito A2 - Maitana, El Hato y Zonas Altas', 'Cubre Maitana, El Hato (alto), La Suiza, Las Lagunitas y cordillera este.', true, 'normal'),
  ('A3', 'Circuito A3 - Palo Negro, Los Lirios y Caseríos', 'Alimenta Palo Negro, Los Lirios, Bucarito, San Ramón, El Laurel y vía sur.', true, 'normal')
ON CONFLICT (code) DO NOTHING;

