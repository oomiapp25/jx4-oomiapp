import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Faltan variables de entorno de Supabase. Verifica SUPABASE_URL y SUPABASE_ANON_KEY.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'customer' | 'admin' | 'category_admin' | 'department_admin' | 'transport_admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  department_id?: string | null;
  transport_line_id?: string | null;
  phone_number?: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  category_id: string;
  department_id: string;
  created_by: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  rating?: number;
  created_by: string;
  created_at: string;
}

export interface Department {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  whatsapp?: string | null;
  created_by: string;
  created_at: string;
}

export interface Transport {
  id: string;
  name: string;
  carrier_info: string;
  base_price: number;
  has_papers: boolean;
  vehicle_type: string;
  whatsapp: string;
  created_by: string;
  created_at: string;
}

export interface TransportLine {
  id: string;
  name: string;
  origin: string;
  destination: string;
  schedule: string;
  departure_time?: string | null;
  arrival_time?: string | null;
  price: number;
  news_update: string;
  status?: 'normal' | 'retraso' | 'cola' | 'salida' | 'accidente' | 'alerta' | null;
  whatsapp: string;
  active: boolean;
  created_by: string;
  created_at: string;
}

export interface JobOffer {
  id: string;
  title: string;
  company: string;
  description: string;
  contact_info: string;
  active: boolean;
  created_by: string;
  created_at: string;
}

export interface ServicePortfolio {
  id: string;
  title: string;
  provider_name: string;
  description: string;
  whatsapp: string;
  category: string;
  active: boolean;
  created_by: string;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  items: any;
  total: number;
  status: string;
  transport_id: string;
  address: string;
  created_at: string;
}

export interface Ad {
  id: string;
  image_url: string;
  title?: string | null;
  description?: string | null;
  link: string;
  active: boolean;
  starts_at: string;
  ends_at: string;
  priority: number;
}

export interface News {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image_url: string;
  active: boolean;
  published_at: string;
}
