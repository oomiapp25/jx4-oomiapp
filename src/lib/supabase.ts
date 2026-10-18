import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Faltan variables de entorno de Supabase. Verifica SUPABASE_URL y SUPABASE_ANON_KEY.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'customer' | 'admin' | 'category_admin' | 'department_admin' | 'transport_admin' | 'social_admin' | 'sports_admin' | 'culture_admin' | 'electric_admin' | 'super_admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  roles: UserRole[];
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
  active: boolean;
  featured: boolean;
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
  image_url?: string | null;
  sector?: string | null;
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

export interface SocialInventory {
  id: string;
  name: string;
  description: string | null;
  quantity: number;
  image_url: string | null;
  active: boolean;
  created_by: string;
  created_at: string;
}

export interface SocialRequest {
  id: string;
  requester_name: string;
  requester_phone: string;
  item_requested: string;
  justification: string;
  medical_report_url: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'delivered';
  notes: string | null;
  created_at: string;
}

export interface SocialDelivery {
  id: string;
  beneficiary_name: string;
  item_delivered: string;
  description: string | null;
  image_url: string | null;
  delivery_date: string;
  created_by: string;
  created_at: string;
}

export interface CommunityEntry {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  video_url?: string | null;
  video_platform?: 'youtube' | 'tiktok' | null;
  creator_name?: string | null;
  area: 'sports' | 'culture' | 'religion' | 'tourism';
  type: 'news' | 'event' | 'profile';
  category: string | null;
  event_date: string | null;
  location: string | null;
  contact_info: string | null;
  published_by: string;
  created_at: string;
  active: boolean;
}

export interface CommunitySpace {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  contact_info: string | null;
  image_url: string | null;
  video_url?: string | null;
  video_platform?: 'youtube' | 'tiktok' | null;
  creator_name?: string | null;
  area: 'sports' | 'culture' | 'religion' | 'tourism';
  created_at: string;
  active: boolean;
}

// Módulo de Fallas Eléctricas JX4 Paracotos
export interface Circuit {
  id: string;
  code: string; // 'A1', 'A2', 'A3'
  name: string;
  description?: string | null;
  active: boolean;
  status?: 'normal' | 'falla_parcial' | 'corte_total' | 'mantenimiento' | 'reparando';
  status_updated_at?: string | null;
  created_at?: string;
}

export interface CircuitSector {
  id: string;
  circuit_id: string;
  sector_name: string;
  active: boolean;
  created_at?: string;
  circuit?: Circuit;
}

export type FailureType = 
  | 'corte_total' 
  | 'bajo_voltaje' 
  | 'cable_caido' 
  | 'transformador' 
  | 'poste' 
  | 'otro';

export type ReportStatus = 
  | 'pendiente' 
  | 'en_revision' 
  | 'cuadrilla_asignada' 
  | 'resuelto';

export interface ElectricalReport {
  id: string;
  ticket_code?: string;
  sector: string;
  circuit: string; // 'A1', 'A2', 'A3'
  circuit_id?: string | null;
  location_detail?: string | null;
  failure_type: FailureType;
  description?: string | null;
  reporter_name?: string | null;
  reporter_phone?: string | null;
  status: ReportStatus;
  admin_notes?: string | null;
  assigned_crew?: string | null;
  created_at: string;
  resolved_at?: string | null;
}

