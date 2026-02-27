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
  LogOut,
  ChevronRight,
  Bell
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

export default function AdminLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Package, label: 'Productos', path: '/admin/productos' },
    { icon: Tags, label: 'Categorías', path: '/admin/categorias' },
    { icon: Building2, label: 'Departamentos', path: '/admin/departamentos' },
    { icon: Truck, label: 'Transportes', path: '/admin/transportes' },
    { icon: Users, label: 'Usuarios', path: '/admin/usuarios' },
    { icon: ImageIcon, label: 'Publicidad', path: '/admin/ads' },
    { icon: Newspaper, label: 'Noticias', path: '/admin/noticias' },
  ];

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-stone-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-stone-900 text-white flex flex-col sticky top-0 h-screen">
        <div className="p-6">
          <Link to="/" className="text-xl font-bold tracking-tighter">
            JX4<span className="text-emerald-400">ADMIN</span>
          </Link>
          <p className="text-[10px] text-stone-500 uppercase tracking-widest mt-1">Panel de Control</p>
        </div>

        <nav className="flex-grow px-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-emerald-600 text-white' 
                    : 'text-stone-400 hover:bg-stone-800 hover:text-white'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
                {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-stone-800">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-xs">
              {user?.full_name?.[0] || 'A'}
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-xs font-bold truncate">{user?.full_name || 'Admin'}</p>
              <p className="text-[10px] text-stone-500 truncate">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-xs font-medium text-stone-400 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col">
        <header className="h-16 bg-white border-b border-stone-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
            {menuItems.find(i => i.path === location.pathname)?.label || 'Admin'}
          </h2>
          <div className="flex items-center gap-4">
            <button className="p-2 text-stone-400 hover:text-stone-900 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-[1px] bg-stone-200 mx-2"></div>
            <span className="text-xs font-medium text-stone-500">{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </div>
        </header>

        <div className="p-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
