import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  Building2, 
  Truck, 
  Users, 
  Image as ImageIcon, 
  Newspaper, 
  Trophy,
  LogOut,
  ChevronRight,
  Bell,
  Briefcase,
  Wrench,
  Settings,
  Menu,
  X,
  Heart
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

export default function AdminLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin', roles: ['admin'] },
    { icon: Package, label: 'Productos', path: '/admin/productos', roles: ['admin', 'category_admin', 'department_admin'] },
    { icon: Tags, label: 'Categorías', path: '/admin/categorias', roles: ['admin'] },
    { icon: Building2, label: 'Departamentos', path: '/admin/departamentos', roles: ['admin'] },
    { icon: Truck, label: 'Transportes', path: '/admin/transportes', roles: ['admin', 'transport_admin'] },
    { icon: Briefcase, label: 'Empleos', path: '/admin/empleos', roles: ['admin'] },
    { icon: Wrench, label: 'Servicios', path: '/admin/servicios', roles: ['admin'] },
    { icon: Users, label: 'Usuarios', path: '/admin/usuarios', roles: ['super_admin'] },
    { icon: ImageIcon, label: 'Publicidad', path: '/admin/ads', roles: ['admin'] },
    { icon: Newspaper, label: 'Noticias', path: '/admin/noticias', roles: ['admin', 'journalist'] },
    { icon: Trophy, label: 'Comunidad', path: '/admin/comunidad', roles: ['admin', 'sports_admin', 'culture_admin'] },
    { icon: Heart, label: 'Ayuda Social', path: '/admin/ayuda-social', roles: ['admin', 'social_admin'] },
    { icon: Settings, label: 'Configuración', path: '/admin/configuracion', roles: ['admin'] },
  ];

  const filteredMenu = menuItems.filter(item => 
    user && (item.roles.some(r => user.roles.includes(r as any)) || user.email === 'jjtovar1510@gmail.com')
  );

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-ml-white-cal flex flex-col font-sans relative lg:flex-row">
      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-ml-monte-verde/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-ml-monte-verde text-white flex flex-col transition-transform duration-300 transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen
      `}>
        <div className="p-6 flex items-center justify-between">
          <div>
            <Link to="/" className="text-xl font-bold tracking-tighter">
              JX4<span className="text-ml-quebrada">ADMIN</span>
            </Link>
            <p className="text-[10px] text-ml-quebrada/60 uppercase tracking-widest mt-1">Panel de Control</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 hover:bg-ml-hierro rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-grow px-4 space-y-1 overflow-y-auto">
          {filteredMenu.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-ml-teja text-white' 
                    : 'text-ml-quebrada/70 hover:bg-ml-hierro hover:text-white'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
                {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-ml-hierro/30">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-ml-teja flex items-center justify-center font-bold text-xs">
              {user?.full_name?.[0] || 'A'}
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-xs font-bold truncate">{user?.full_name || 'Admin'}</p>
              <p className="text-[10px] text-ml-quebrada/60 truncate">{user?.roles.join(', ')}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-xs font-medium text-ml-quebrada/70 hover:text-ml-pared-floreada transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-ml-white-cal flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-ml-white-cal rounded-lg text-ml-hierro"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-sm font-bold text-ml-monte-verde uppercase tracking-wider hidden sm:block">
              {menuItems.find(i => i.path === location.pathname)?.label || 'Admin'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-ml-quebrada hover:text-ml-monte-verde transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-ml-teja rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-[1px] bg-ml-white-cal mx-2 hidden sm:block"></div>
            <span className="text-xs font-medium text-ml-hierro hidden sm:block">{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </div>
        </header>

        <div className="p-4 lg:p-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
