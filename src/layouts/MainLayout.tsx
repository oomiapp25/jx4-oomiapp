import { Link, Outlet } from 'react-router-dom';
import { ShoppingCart, Search, User, Menu, MessageCircle, ArrowUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase, Ad, News } from '../lib/supabase';

export default function MainLayout() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    fetchAds();
    fetchNews();
    
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

      {/* FAB */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="p-3 bg-white shadow-lg border border-stone-200 rounded-full text-stone-600 hover:text-emerald-600 transition-colors"
            >
              <ArrowUp className="w-6 h-6" />
            </motion.button>
          )}
        </AnimatePresence>
        <button className="p-4 bg-emerald-600 shadow-xl rounded-full text-white hover:bg-emerald-700 transition-all hover:scale-110 active:scale-95">
          <MessageCircle className="w-6 h-6" />
        </button>
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
