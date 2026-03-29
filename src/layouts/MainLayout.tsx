import { Link, Outlet, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, MessageCircle, ArrowUp, Home, Package, Shield, MapPin, Bus, Plus, Briefcase, Wrench, Newspaper, CreditCard, Heart, Trophy, Download, LogOut } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase, Ad, News, TransportLine } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { usePWA } from '../hooks/usePWA';

export default function MainLayout() {
  const { user } = useAuth();
  const { itemCount } = useCart();
  const { isInstallable, installApp } = usePWA();
  const navigate = useNavigate();
  const [ads, setAds] = useState<Ad[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [transportLines, setTransportLines] = useState<TransportLine[]>([]);
  const [exchangeRate, setExchangeRate] = useState<string | null>(null);
  const [euroRate, setEuroRate] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

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
    if (data) {
      setExchangeRate(data.value.rate);
      setEuroRate(data.value.euro_rate || (parseFloat(data.value.rate) * 1.08).toFixed(2));
    }
  }

  return (
    <div className="min-h-screen bg-ml-white-cal flex flex-col font-sans overflow-x-hidden">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4">
          {/* Top Bar */}
          <div className="h-16 flex items-center justify-between gap-1 sm:gap-4">
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-lg sm:text-2xl font-black tracking-tighter text-ml-monte-verde leading-none">
                JX4<span className="text-ml-quebrada">PARACOTOS</span>
              </h1>
            </Link>

            {/* Exchange Rates Section - Hidden on mobile to prevent overflow */}
            <div className="hidden sm:flex flex-1 flex-col items-center justify-center px-1">
              <div className="flex items-center gap-2 bg-stone-50/50 px-2 py-1 rounded-2xl border border-stone-100 shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-ml-quebrada/10 rounded-lg flex items-center justify-center">
                    <span className="text-[9px] font-black text-ml-quebrada">$</span>
                  </div>
                  <span className="text-[10px] font-black text-ml-monte-verde tracking-tighter">
                    {exchangeRate ? `${exchangeRate}` : '---'}
                  </span>
                </div>
                <div className="w-px h-3 bg-stone-200" />
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-ml-teja/10 rounded-lg flex items-center justify-center">
                    <span className="text-[9px] font-black text-ml-teja">€</span>
                  </div>
                  <span className="text-[10px] font-black text-ml-monte-verde tracking-tighter">
                    {euroRate ? `${euroRate}` : '---'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-4">
              <div className="relative">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="p-2.5 bg-stone-100 text-ml-monte-verde hover:bg-stone-200 rounded-full transition-all border border-stone-200 shadow-sm"
                >
                  <User className="w-5 h-5" />
                </button>
                
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <>
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsUserMenuOpen(false)}
                        className="fixed inset-0 z-40"
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-56 glass bg-white/90 backdrop-blur-xl rounded-[25px] border border-white/40 shadow-2xl p-2 z-50 overflow-hidden"
                      >
                        {user ? (
                          <div className="space-y-1">
                            <div className="px-4 py-3 border-b border-stone-100 mb-1">
                              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Bienvenido</p>
                              <p className="text-sm font-black text-ml-monte-verde truncate">{user.full_name || user.email}</p>
                            </div>
                            
                            {(user.roles?.includes('admin') || user.email === 'jjtovar1510@gmail.com') && (
                              <Link 
                                to="/admin" 
                                onClick={() => setIsUserMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-ml-monte-verde/10 text-ml-monte-verde transition-colors"
                              >
                                <Shield className="w-4 h-4" />
                                <span className="text-xs font-black uppercase tracking-tighter">Panel Admin</span>
                              </Link>
                            )}
                            
                            <Link 
                              to="/perfil" 
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-ml-monte-verde/10 text-ml-monte-verde transition-colors"
                            >
                              <User className="w-4 h-4" />
                              <span className="text-xs font-black uppercase tracking-tighter">Mi Perfil</span>
                            </Link>
                            
                            <Link 
                              to="/mis-pedidos" 
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-ml-quebrada/10 text-ml-quebrada transition-colors"
                            >
                              <Package className="w-4 h-4" />
                              <span className="text-xs font-black uppercase tracking-tighter">Mis Pedidos</span>
                            </Link>
                            
                            <button 
                              onClick={async () => {
                                await supabase.auth.signOut();
                                setIsUserMenuOpen(false);
                                navigate('/');
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-600 transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              <span className="text-xs font-black uppercase tracking-tighter">Cerrar Sesión</span>
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <Link 
                              to="/login" 
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-ml-monte-verde/10 text-ml-monte-verde transition-colors"
                            >
                              <User className="w-4 h-4" />
                              <span className="text-xs font-black uppercase tracking-tighter">Iniciar Sesión</span>
                            </Link>
                            <Link 
                              to="/registro" 
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-ml-teja/10 text-ml-teja transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                              <span className="text-xs font-black uppercase tracking-tighter">Crear Cuenta</span>
                            </Link>
                          </div>
                        )}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <Link to="/checkout" className="relative p-2.5 bg-ml-monte-verde text-white hover:bg-ml-quebrada rounded-2xl transition-all shadow-lg shadow-ml-monte-verde/20">
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-ml-teja text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                    {itemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      {/* Sticky Ticker Bar */}
      <div className="bg-ml-monte-verde text-white py-2 overflow-hidden sticky top-[64px] z-40 backdrop-blur-md">
        <div className="flex animate-marquee whitespace-nowrap items-center gap-8">
          {[...Array(4)].map((_, i) => (
            <React.Fragment key={i}>
              <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-ml-teja rounded-full" />
                Tasa del día: $ {exchangeRate || '---'} Bs.
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-ml-teja rounded-full" />
                Euro: € {euroRate || '---'} Bs.
              </span>
              {news.length > 0 && (
                <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-ml-teja rounded-full" />
                  Noticia: {news[0].title}
                </span>
              )}
              <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-ml-teja rounded-full" />
                JX4 Paracotos: Calidad y Servicio
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      <main className="flex-grow w-full pb-32">
        <Outlet />
      </main>

      {/* Floating Bottom Tab Bar (iOS Style) */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md">
        <div className="glass bg-white/70 backdrop-blur-xl rounded-[35px] border border-white/40 shadow-2xl p-2 flex items-center justify-around">
          <Link to="/" className="flex flex-col items-center gap-1 p-3 rounded-2xl hover:bg-ml-monte-verde/10 transition-colors text-ml-monte-verde">
            <Home className="w-6 h-6" />
            <span className="text-[10px] font-black uppercase tracking-tighter">Inicio</span>
          </Link>
          <Link to="/noticias" className="flex flex-col items-center gap-1 p-3 rounded-2xl hover:bg-ml-quebrada/10 transition-colors text-ml-quebrada">
            <Newspaper className="w-6 h-6" />
            <span className="text-[10px] font-black uppercase tracking-tighter">Noticias</span>
          </Link>
          <div className="relative -top-8">
            <button 
              onClick={() => setIsFabOpen(!isFabOpen)}
              className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-2xl transition-all hover:scale-110 active:scale-95 ${isFabOpen ? 'bg-ml-monte-verde rotate-45' : 'bg-ml-teja'}`}
            >
              <Plus className="w-8 h-8" />
            </button>
          </div>
          <Link to="/comunidad" className="flex flex-col items-center gap-1 p-3 rounded-2xl hover:bg-ml-monte-verde/10 transition-colors text-ml-monte-verde">
            <Trophy className="w-6 h-6" />
            <span className="text-[10px] font-black uppercase tracking-tighter">Comunidad</span>
          </Link>
          <Link to="/transporte" className="flex flex-col items-center gap-1 p-3 rounded-2xl hover:bg-ml-quebrada/10 transition-colors text-ml-quebrada">
            <Bus className="w-6 h-6" />
            <span className="text-[10px] font-black uppercase tracking-tighter">Transporte</span>
          </Link>
        </div>
      </nav>

      {/* FAB Menu Overlay */}
      <AnimatePresence>
        {isFabOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFabOpen(false)}
              className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[90]"
            />
            <motion.div 
              initial={{ opacity: 0, y: 100, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.8 }}
              className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[100] w-[80%] max-w-sm grid grid-cols-2 gap-4"
            >
              <Link to="/empleos" onClick={() => setIsFabOpen(false)} className="flex flex-col items-center gap-2 p-4 glass bg-white/80 rounded-[30px] hover:bg-white transition-all group">
                <div className="w-12 h-12 bg-ml-monte-verde/10 rounded-2xl flex items-center justify-center text-ml-monte-verde group-hover:bg-ml-monte-verde group-hover:text-white transition-all">
                  <Briefcase className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase text-center">Empleos</span>
              </Link>
              <Link to="/servicios" onClick={() => setIsFabOpen(false)} className="flex flex-col items-center gap-2 p-4 glass bg-white/80 rounded-[30px] hover:bg-white transition-all group">
                <div className="w-12 h-12 bg-ml-teja/10 rounded-2xl flex items-center justify-center text-ml-teja group-hover:bg-ml-teja group-hover:text-white transition-all">
                  <Wrench className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase text-center">Servicios</span>
              </Link>
              {isInstallable && (
                <button 
                  onClick={() => { installApp(); setIsFabOpen(false); }} 
                  className="col-span-2 flex flex-col items-center gap-2 p-4 glass bg-ml-monte-verde text-white rounded-[30px] hover:bg-ml-quebrada transition-all group"
                >
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white transition-all">
                    <Download className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-center">Instalar Aplicación</span>
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <footer className="bg-white border-t border-ml-white-cal py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-xl font-black text-ml-monte-verde tracking-tighter mb-4">
            JX4<span className="text-ml-quebrada">PARACOTOS</span>
          </h3>
          <p className="text-ml-hierro text-sm max-w-md mx-auto mb-8">
            Tus tiendas de confianza en Paracotos. Calidad y servicio en un solo lugar
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-8">
            <Link to="/" className="text-xs font-bold text-ml-hierro hover:text-ml-monte-verde uppercase tracking-widest transition-colors">Inicio</Link>
            <Link to="/comunidad" className="text-xs font-bold text-ml-hierro hover:text-ml-monte-verde uppercase tracking-widest transition-colors">Comunidad</Link>
            <Link to="/noticias" className="text-xs font-bold text-ml-hierro hover:text-ml-monte-verde uppercase tracking-widest transition-colors">Noticias</Link>
            <Link to="/mis-pedidos" className="text-xs font-bold text-ml-hierro hover:text-ml-monte-verde uppercase tracking-widest transition-colors">Mis Pedidos</Link>
            <Link to="/privacidad" className="text-xs font-bold text-ml-hierro hover:text-ml-monte-verde uppercase tracking-widest transition-colors">Privacidad</Link>
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
