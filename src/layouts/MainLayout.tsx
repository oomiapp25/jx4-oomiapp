import { Link, Outlet, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, User, Menu, MessageCircle, ArrowUp, Home, Package, Shield, MapPin, Bus, Plus, Briefcase, Wrench, Newspaper } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase, Ad, News, TransportLine } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';

export default function MainLayout() {
  const { user } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [ads, setAds] = useState<Ad[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [transportLines, setTransportLines] = useState<TransportLine[]>([]);
  const [exchangeRate, setExchangeRate] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);

  useEffect(() => {
    fetchAds();
    fetchNews();
    fetchTransportLines();
    fetchExchangeRate();
    
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

  async function fetchExchangeRate() {
    const { data } = await supabase.from('settings').select('*').eq('key', 'exchange_rate').single();
    if (data) setExchangeRate(data.value.rate);
  }

  return (
    <div className="min-h-screen bg-ml-white-cal flex flex-col font-sans">
      {/* Header */}
      <header className="bg-ml-monte-verde shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          {/* Top Bar */}
          <div className="h-14 flex items-center justify-between gap-4 md:gap-8">
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-xl md:text-2xl font-black tracking-tighter text-white leading-none">
                JX4<span className="text-ml-quebrada">PARACOTOS</span>
              </h1>
            </Link>

            <div className="flex-grow max-w-2xl">
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Buscar productos, marcas y más..." 
                  className="w-full pl-4 pr-12 py-2 bg-white border-none rounded shadow-sm text-sm focus:ring-0 transition-all placeholder:text-stone-400"
                />
                <button className="absolute right-0 top-0 h-full px-4 text-ml-hierro border-l border-stone-100 hover:text-ml-teja transition-colors">
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="h-10 flex items-center justify-end text-xs md:text-sm text-white/80">
            <div className="flex items-center gap-6">
              {user ? (
                <div className="flex items-center gap-4">
                  <Link to="/perfil" className="flex items-center gap-1 hover:text-white transition-colors">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">{user.email?.split('@')[0]}</span>
                  </Link>
                  <Link to="/mis-pedidos" className="hover:text-white transition-colors">Mis compras</Link>
                  <button onClick={() => supabase.auth.signOut()} className="hover:text-ml-pared-floreada transition-colors">Salir</button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link to="/register" className="hover:text-white transition-colors">Crea tu cuenta</Link>
                  <Link to="/login" className="hover:text-white transition-colors">Ingresa</Link>
                  <Link to="/mis-pedidos" className="hover:text-white transition-colors">Mis compras</Link>
                </div>
              )}
              <Link to="/checkout" className="relative hover:text-white transition-colors">
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-ml-teja text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {itemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Transport News Ticker (Optional, kept but styled) */}
      {transportLines.length > 0 && (
        <div className="bg-ml-quebrada/10 border-b border-ml-quebrada/20 py-1 overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap items-center">
            {transportLines.map(line => (
              <div key={line.id} className="mx-12 flex items-center gap-2 text-[10px] font-bold uppercase text-ml-monte-verde">
                <Bus className="w-3 h-3 text-ml-teja" />
                <span>{line.origin} → {line.destination}</span>
                <span className={`px-2 py-0.5 rounded-full text-[8px] ${
                  line.status === 'normal' ? 'bg-ml-monte-verde/10 text-ml-monte-verde' :
                  line.status === 'alerta' || line.status === 'accidente' ? 'bg-red-500 text-white' :
                  'bg-amber-500 text-white'
                }`}>
                  {line.status === 'retraso' ? 'RETRASO' :
                   line.status === 'cola' ? 'COLA EN VÍA' :
                   line.status === 'salida' ? 'DESPACHANDO' :
                   line.status === 'accidente' ? 'ACCIDENTE' :
                   line.status === 'alerta' ? 'ALERTA' : 'NORMAL'}
                </span>
                <span className="text-ml-hierro">{line.news_update || 'Operando normal'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <main className="flex-grow w-full">
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
                className="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl shadow-xl border border-ml-white-cal group hover:bg-ml-white-cal transition-colors"
              >
                <span className="text-xs font-black text-ml-monte-verde uppercase tracking-widest">Inicio</span>
                <div className="w-10 h-10 bg-ml-white-cal rounded-xl flex items-center justify-center text-ml-hierro group-hover:bg-ml-monte-verde group-hover:text-white transition-all">
                  <Home className="w-5 h-5" />
                </div>
              </Link>

              <Link 
                to="/mis-pedidos" 
                onClick={() => setIsFabOpen(false)}
                className="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl shadow-xl border border-ml-white-cal group hover:bg-ml-white-cal transition-colors"
              >
                <span className="text-xs font-black text-ml-monte-verde uppercase tracking-widest">Mis Pedidos</span>
                <div className="w-10 h-10 bg-ml-white-cal rounded-xl flex items-center justify-center text-ml-hierro group-hover:bg-ml-monte-verde group-hover:text-white transition-all">
                  <Package className="w-5 h-5" />
                </div>
              </Link>

              <Link 
                to="/noticias" 
                onClick={() => setIsFabOpen(false)}
                className="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl shadow-xl border border-ml-white-cal group hover:bg-ml-white-cal transition-colors"
              >
                <span className="text-xs font-black text-ml-monte-verde uppercase tracking-widest">Noticias</span>
                <div className="w-10 h-10 bg-ml-white-cal rounded-xl flex items-center justify-center text-ml-hierro group-hover:bg-ml-quebrada group-hover:text-white transition-all">
                  <Newspaper className="w-5 h-5" />
                </div>
              </Link>

              <Link 
                to="/transporte" 
                onClick={() => setIsFabOpen(false)}
                className="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl shadow-xl border border-ml-white-cal group hover:bg-ml-white-cal transition-colors"
              >
                <span className="text-xs font-black text-ml-monte-verde uppercase tracking-widest">Transporte</span>
                <div className="w-10 h-10 bg-ml-white-cal rounded-xl flex items-center justify-center text-ml-hierro group-hover:bg-ml-quebrada group-hover:text-white transition-all">
                  <Bus className="w-5 h-5" />
                </div>
              </Link>

              <Link 
                to="/empleos" 
                onClick={() => setIsFabOpen(false)}
                className="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl shadow-xl border border-ml-white-cal group hover:bg-ml-white-cal transition-colors"
              >
                <span className="text-xs font-black text-ml-monte-verde uppercase tracking-widest">Empleos</span>
                <div className="w-10 h-10 bg-ml-white-cal rounded-xl flex items-center justify-center text-ml-hierro group-hover:bg-ml-quebrada group-hover:text-white transition-all">
                  <Briefcase className="w-5 h-5" />
                </div>
              </Link>

              <Link 
                to="/servicios" 
                onClick={() => setIsFabOpen(false)}
                className="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl shadow-xl border border-ml-white-cal group hover:bg-ml-white-cal transition-colors"
              >
                <span className="text-xs font-black text-ml-monte-verde uppercase tracking-widest">Servicios</span>
                <div className="w-10 h-10 bg-ml-white-cal rounded-xl flex items-center justify-center text-ml-hierro group-hover:bg-ml-quebrada group-hover:text-white transition-all">
                  <Wrench className="w-5 h-5" />
                </div>
              </Link>

              {user && (user.role !== 'customer' || user.email === 'jjtovar1510@gmail.com') && (
                <Link 
                  to="/admin" 
                  onClick={() => setIsFabOpen(false)}
                  className="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl shadow-xl border border-ml-white-cal group hover:bg-ml-white-cal transition-colors"
                >
                  <span className="text-xs font-black text-ml-monte-verde uppercase tracking-widest">Administración</span>
                  <div className="w-10 h-10 bg-ml-white-cal rounded-xl flex items-center justify-center text-ml-hierro group-hover:bg-ml-quebrada group-hover:text-white transition-all">
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
                className="w-14 h-14 bg-white shadow-lg border border-ml-white-cal rounded-2xl flex items-center justify-center text-ml-hierro hover:text-ml-quebrada transition-colors"
              >
                <ArrowUp className="w-6 h-6" />
              </motion.button>
            )}
          </AnimatePresence>
          
          <button 
            onClick={() => setIsFabOpen(!isFabOpen)}
            className={`w-14 h-14 shadow-2xl rounded-2xl flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 ${isFabOpen ? 'bg-ml-monte-verde rotate-45' : 'bg-ml-teja'}`}
          >
            <Plus className={`w-8 h-8 transition-transform ${isFabOpen ? 'rotate-0' : 'rotate-0'}`} />
          </button>
        </div>
      </div>

      <footer className="bg-white border-t border-ml-white-cal py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-xl font-black text-ml-monte-verde tracking-tighter mb-4">
            JX4<span className="text-ml-quebrada">PARACOTOS</span>
          </h3>
          <p className="text-ml-hierro text-sm max-w-md mx-auto mb-8">
            Tus tiendas de confianza en Paracotos. Calidad y servicio en un solo lugar
          </p>
          
          <div className="flex items-center justify-center gap-6 mb-8">
            <Link to="/" className="text-xs font-bold text-ml-hierro hover:text-ml-monte-verde uppercase tracking-widest transition-colors">Inicio</Link>
            <Link to="/noticias" className="text-xs font-bold text-ml-hierro hover:text-ml-monte-verde uppercase tracking-widest transition-colors">Noticias</Link>
            <Link to="/mis-pedidos" className="text-xs font-bold text-ml-hierro hover:text-ml-monte-verde uppercase tracking-widest transition-colors">Mis Pedidos</Link>
            <a 
              href="https://wa.me/584241208234" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-2 text-xs font-bold text-ml-hierro hover:text-ml-monte-verde uppercase tracking-widest transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
          </div>

          <div className="pt-8 border-t border-ml-white-cal text-[10px] font-bold text-stone-400 uppercase tracking-widest">
            © 2026 JX4 Paracotos. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
