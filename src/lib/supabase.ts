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
  created_by: string;
  created_at: string;
}

export interface Department {
  id: string;
  name: string;
  slug: string;
  created_by: string;
  created_at: string;
}

export interface Transport {
  id: string;
  name: string;
  carrier_info: string;
  base_price: number;
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
