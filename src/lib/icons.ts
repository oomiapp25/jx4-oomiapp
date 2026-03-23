import { 
  Smartphone, 
  Store, 
  ShoppingBag, 
  Ticket, 
  CreditCard, 
  Truck, 
  ShieldCheck,
  Package,
  Utensils,
  Heart,
  Camera,
  Music,
  Gamepad2,
  Car,
  Home,
  Briefcase,
  Zap,
  Star,
  Coffee,
  Gift,
  Sparkles,
  Utensils as UtensilsIcon
} from 'lucide-react';

export const AVAILABLE_ICONS = [
  { id: 'Smartphone', icon: Smartphone, label: 'Celulares' },
  { id: 'Store', icon: Store, label: 'Tiendas' },
  { id: 'ShoppingBag', icon: ShoppingBag, label: 'Zapatos/Compras' },
  { id: 'Ticket', icon: Ticket, label: 'Cupones' },
  { id: 'CreditCard', icon: CreditCard, label: 'Pagar/Pagos' },
  { id: 'Truck', icon: Truck, label: 'Envíos' },
  { id: 'ShieldCheck', icon: ShieldCheck, label: 'Seguro' },
  { id: 'Package', icon: Package, label: 'Paquetes' },
  { id: 'Utensils', icon: Utensils, label: 'Comida' },
  { id: 'Heart', icon: Heart, label: 'Salud' },
  { id: 'Camera', icon: Camera, label: 'Fotos' },
  { id: 'Music', icon: Music, label: 'Música' },
  { id: 'Gamepad2', icon: Gamepad2, label: 'Juegos' },
  { id: 'Car', icon: Car, label: 'Vehículos' },
  { id: 'Home', icon: Home, label: 'Hogar' },
  { id: 'Briefcase', icon: Briefcase, label: 'Trabajo' },
  { id: 'Zap', icon: Zap, label: 'Energía' },
  { id: 'Star', icon: Star, label: 'Favoritos' },
  { id: 'Coffee', icon: Coffee, label: 'Café' },
  { id: 'Gift', icon: Gift, label: 'Regalos' },
  { id: 'arepa', icon: UtensilsIcon, label: 'Comida/Arepa' },
  { id: 'nail-polish', icon: Sparkles, label: 'Belleza/Uñas' }
];

export function isIconUrl(id: string | null | undefined): boolean {
  if (!id) return false;
  return id.startsWith('http://') || id.startsWith('https://') || id.startsWith('data:image/');
}

export function getIconById(id: string | null | undefined) {
  if (isIconUrl(id)) return null;
  const found = AVAILABLE_ICONS.find(i => i.id === id);
  return found ? found.icon : Package;
}
