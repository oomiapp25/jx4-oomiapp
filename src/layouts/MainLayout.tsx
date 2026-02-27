import { Link, Outlet, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, User, Menu, MessageCircle, ArrowUp, Home, Package, Shield, MapPin, Bus, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase, Ad, News, TransportLine } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export default function MainLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ads, setAds] = useState<Ad[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [transportLines, setTransportLines] = useState<TransportLine[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);

  useEffect(() => {
    fetchAds();
    fetchNews();
    fetchTransportLines();
    
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  async function fetchAds() {
    const { data } = await supabase.from('ads').select('*').eq('active', true).order('priority', { ascending: false });
    if (data) setAds(data);
  }

  async function fetchNews() {
    const { data } = await supabase.from('news').select('*').eq('active', true).order('published_at', { ascending: false }).limit(1);
    if (data) setNews(data);
  }

  async function fetchTransportLines() {
    const { data } = await supabase.from('transport_lines').select('*').eq('active', true);
    if (data) setTransportLines(data);
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans">
      {/* Ads Carousel (Simplified) */}
      {ads.length > 0 && (
        <div className="bg-stone-900 text-white py-2 overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap">
            {ads.map(ad => (
              <a key={ad.id} href={ad.link} className="mx-8 hover:text-emerald-400 transition-colors">
                {ad.image_url} {/* Placeholder text for now */}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Transport News Ticker */}
      {transportLines.length > 0 && (
        <div className="bg-emerald-600 text-white py-1.5 overflow-hidden border-b border-emerald-700">
          <div className="flex animate-marquee whitespace-nowrap items-center">
            {transportLines.map(line => (
              <div key={line.id} className="mx-12 flex items-center gap-3 text-[11px] font-bold uppercase tracking-wider">
                <Bus className="w-3.5 h-3.5" />
                <span>{line.origin} → {line.destination}</span>
                <span className="opacity-60">|</span>
                <span className="text-emerald-200">{line.news_update || 'Operando normal'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-bottom border-stone-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold tracking-tighter text-stone-900">
            JX4<span className="text-emerald-600">PARACOTOS</span>
          </Link>

          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Buscar productos..." 
                className="w-full pl-10 pr-4 py-2 bg-stone-100 border-none rounded-full text-sm focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>

          <nav className="flex items-center gap-4">
            <Link to="/cart" className="p-2 hover:bg-stone-100 rounded-full transition-colors relative">
              <ShoppingCart className="w-5 h-5 text-stone-700" />
              <span className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">0</span>
            </Link>
            <Link to="/login" className="p-2 hover:bg-stone-100 rounded-full transition-colors">
              <User className="w-5 h-5 text-stone-700" />
            </Link>
            <button className="md:hidden p-2 hover:bg-stone-100 rounded-full transition-colors">
              <Menu className="w-5 h-5 text-stone-700" />
            </button>
          </nav>
        </div>

        {/* News Strip */}
        {news.length > 0 && (
          <div className="bg-emerald-50 border-y border-emerald-100 py-1.5 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 flex items-center gap-2">
              <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">Noticia</span>
              <p className="text-xs text-emerald-900 font-medium truncate">{news[0].title}: {news[0].excerpt}</p>
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8">
        <Outlet />
      </main>

      {/* FAB Navigation */}
      <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-[100]">
        <AnimatePresence>
          {isFabOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              className="flex flex-col gap-3 mb-2"
            >
              <Link 
                to="/" 
                onClick={() => setIsFabOpen(false)}
                className="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl shadow-xl border border-stone-100 group hover:bg-emerald-50 transition-colors"
              >
                <span className="text-xs font-black text-stone-900 uppercase tracking-widest">Inicio</span>
                <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center text-stone-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  <Home className="w-5 h-5" />
                </div>
              </Link>

              <Link 
                to="/mis-pedidos" 
                onClick={() => setIsFabOpen(false)}
                className="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl shadow-xl border border-stone-100 group hover:bg-emerald-50 transition-colors"
              >
                <span className="text-xs font-black text-stone-900 uppercase tracking-widest">Mis Pedidos</span>
                <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center text-stone-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  <Package className="w-5 h-5" />
                </div>
              </Link>

              {user && user.role !== 'customer' && (
                <Link 
                  to="/admin" 
                  onClick={() => setIsFabOpen(false)}
                  className="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl shadow-xl border border-stone-100 group hover:bg-emerald-50 transition-colors"
                >
                  <span className="text-xs font-black text-stone-900 uppercase tracking-widest">Administración</span>
                  <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center text-stone-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <Shield className="w-5 h-5" />
                  </div>
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col gap-3">
          <AnimatePresence>
            {showScrollTop && (
              <motion.button
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="w-14 h-14 bg-white shadow-lg border border-stone-200 rounded-2xl flex items-center justify-center text-stone-600 hover:text-emerald-600 transition-colors"
              >
                <ArrowUp className="w-6 h-6" />
              </motion.button>
            )}
          </AnimatePresence>
          
          <button 
            onClick={() => setIsFabOpen(!isFabOpen)}
            className={`w-14 h-14 shadow-2xl rounded-2xl flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 ${isFabOpen ? 'bg-stone-900 rotate-45' : 'bg-emerald-600'}`}
          >
            <Plus className={`w-8 h-8 transition-transform ${isFabOpen ? 'rotate-0' : 'rotate-0'}`} />
          </button>
        </div>
      </div>

      <footer className="bg-white border-t border-stone-200 py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-bold mb-4">JX4 Paracotos</h3>
            <p className="text-stone-500 text-sm max-w-sm">
              Tu tienda de confianza en Paracotos. Calidad y servicio a tu alcance.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-stone-400 mb-4">Enlaces</h4>
            <ul className="space-y-2 text-sm text-stone-600">
              <li><Link to="/" className="hover:text-emerald-600">Inicio</Link></li>
              <li><Link to="/mis-pedidos" className="hover:text-emerald-600">Mis Pedidos</Link></li>
              <li><Link to="/admin" className="hover:text-emerald-600">Admin</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-stone-400 mb-4">Contacto</h4>
            <p className="text-sm text-stone-600">Soporte: +58 412-0000000</p>
            <p className="text-sm text-stone-600">Email: hola@jx4paracotos.com</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-stone-100 text-center text-xs text-stone-400">
          © 2026 JX4 Paracotos. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}
