import React, { useState, useEffect } from 'react';
import { supabase, Product, Department } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, CreditCard, Truck, ShieldCheck, Ticket, Smartphone, Store, Footprints, Package, Plus, Search, Download, Play, Trophy, Music, Users, ShoppingBag } from 'lucide-react';
import HeroCarousel from '../components/HeroCarousel';
import { getIconById } from '../lib/icons';
import { IconRenderer } from '../components/IconRenderer';
import { useCart } from '../hooks/useCart';
import { usePWA } from '../hooks/usePWA';
import { parseImages } from '../lib/utils';

export default function Home() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInstallable, installApp } = usePWA();
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [communityVideos, setCommunityVideos] = useState<any[]>([]);
  const [exchangeRate, setExchangeRate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const filteredProducts = products
        .filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 5)
        .map(p => ({ ...p, type: 'product' }));
      
      const filteredDepts = departments
        .filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 3)
        .map(d => ({ ...d, type: 'department' }));

      setSuggestions([...filteredDepts, ...filteredProducts]);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, products, departments]);

  async function fetchData() {
    const [productsRes, deptsRes, rateRes, videosRes] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('departments').select('*').order('name'),
      supabase.from('settings').select('*').eq('key', 'exchange_rate').single(),
      supabase.from('community_videos').select('*').eq('active', true).order('created_at', { ascending: false })
    ]);
    
    if (productsRes.data) {
      setProducts(productsRes.data);
      setFeaturedProducts(productsRes.data.filter(p => p.featured));
    }
    if (deptsRes.data) setDepartments(deptsRes.data);
    if (rateRes.data) setExchangeRate(rateRes.data.value.rate);
    if (videosRes.data) setCommunityVideos(videosRes.data);
    setLoading(false);
  }

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    const result = addToCart(product, 1);
    if (result?.success === false) {
      const choice = confirm(
        `${result.message}\n\n` +
        `• Aceptar: Ir al carrito para finalizar la compra actual.\n` +
        `• Cancelar: Seguir viendo productos.`
      );
      if (choice) {
        navigate('/checkout');
      }
    }
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalogo?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 pb-20">
      <div className="w-full aspect-[2/1] sm:aspect-[21/9] bg-stone-200 animate-pulse" />
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded shadow-sm p-4 animate-pulse">
              <div className="aspect-square bg-stone-100 rounded mb-4" />
              <div className="h-4 bg-stone-100 rounded w-3/4 mb-2" />
              <div className="h-4 bg-stone-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-32 space-y-12">
      <HeroCarousel />

      <div className="max-w-7xl mx-auto px-4">
        {/* Search Bar - Bento Style */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto mb-16 relative z-[60]"
        >
          <form onSubmit={handleSearch} className="relative group">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim().length > 1 && setShowSuggestions(true)}
              placeholder="¿Qué estás buscando hoy en Paracotos?" 
              className="w-full pl-8 pr-16 py-6 glass bg-white/80 rounded-[35px] text-lg focus:ring-4 focus:ring-ml-monte-verde/20 transition-all placeholder:text-stone-400 font-bold shadow-2xl"
            />
            <button 
              type="submit"
              className="absolute right-3 top-3 bottom-3 px-8 bg-ml-monte-verde text-white rounded-[25px] hover:bg-ml-quebrada transition-all flex items-center gap-2 shadow-lg shadow-ml-monte-verde/20"
            >
              <Search className="w-5 h-5" />
              <span className="hidden sm:inline text-xs font-black uppercase tracking-widest">Buscar</span>
            </button>

            {/* Suggestions Dropdown */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <>
                  <div 
                    className="fixed inset-0 z-[-1]" 
                    onClick={() => setShowSuggestions(false)} 
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-4 glass bg-white/95 backdrop-blur-xl rounded-[30px] border border-white/40 shadow-2xl overflow-hidden z-50 p-2"
                  >
                    {suggestions.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          if (item.type === 'product') {
                            navigate(`/producto/${item.id}`);
                          } else {
                            navigate(`/departamento/${item.slug}`);
                          }
                          setShowSuggestions(false);
                          setSearchQuery('');
                        }}
                        className="w-full flex items-center gap-4 p-4 hover:bg-ml-monte-verde/5 rounded-2xl transition-colors text-left group"
                      >
                        <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center text-ml-monte-verde group-hover:bg-ml-monte-verde group-hover:text-white transition-all overflow-hidden">
                          {item.type === 'product' ? (
                            <img src={parseImages(item.images)[0] || 'https://picsum.photos/seed/product/40/40'} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <IconRenderer iconId={item.icon} className="w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-black text-ml-monte-verde uppercase tracking-tighter">
                            {item.type === 'product' ? item.title : item.name}
                          </p>
                          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                            {item.type === 'product' ? 'Producto' : 'Departamento'}
                          </p>
                        </div>
                      </button>
                    ))}
                    <button
                      onClick={handleSearch}
                      className="w-full p-4 text-center text-xs font-black text-ml-quebrada uppercase tracking-widest hover:bg-ml-quebrada/5 transition-colors border-t border-stone-100 mt-2"
                    >
                      Ver todos los resultados para "{searchQuery}"
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </form>
        </motion.div>

        {/* Departments Grid */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-ml-monte-verde tracking-tighter uppercase">Nuestros Departamentos</h2>
              <div className="h-1 w-16 bg-ml-teja mt-1 rounded-full" />
            </div>
            <Link to="/catalogo" className="flex items-center gap-2 text-[10px] font-black text-ml-hierro uppercase tracking-widest bg-stone-100 px-4 py-2 rounded-full hover:bg-ml-monte-verde hover:text-white transition-all group">
              <ShoppingBag className="w-3 h-3" />
              Ver Todo
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {departments.map((dept) => (
              <Link 
                key={dept.id} 
                to={`/departamento/${dept.slug}`} 
                className="relative aspect-[4/5] rounded-[35px] overflow-hidden group shadow-xl border border-stone-100"
              >
                {dept.image_url ? (
                  <img 
                    src={dept.image_url} 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    alt={dept.name} 
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="absolute inset-0 bg-ml-monte-verde" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/90 transition-colors" />
                
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-[25px] flex items-center justify-center mb-4 border border-white/20 group-hover:scale-110 transition-transform">
                    <IconRenderer iconId={dept.icon} className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-white font-black text-lg uppercase tracking-tighter leading-tight">{dept.name}</h3>
                  <p className="text-white/60 text-[9px] font-bold uppercase tracking-widest mt-2">{dept.sector || 'Paracotos'}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Products - Horizontal Scroll */}
        {featuredProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-ml-monte-verde tracking-tighter uppercase">Destacados</h2>
                <div className="h-1 w-16 bg-ml-quebrada mt-1 rounded-full" />
              </div>
              <Link to="/catalogo" className="text-[10px] font-black text-ml-hierro uppercase tracking-widest bg-stone-100 px-4 py-2 rounded-full hover:bg-ml-monte-verde hover:text-white transition-all">Ver Catálogo</Link>
            </div>
            
            <div className="flex gap-6 overflow-x-auto no-scrollbar pb-6 -mx-4 px-4">
              {featuredProducts.map((product) => (
                <motion.div 
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="min-w-[200px] md:min-w-[240px] bg-white rounded-[35px] overflow-hidden shadow-xl border border-stone-100 group"
                >
                  <Link to={`/producto/${product.id}`} className="block relative aspect-square overflow-hidden">
                    <img 
                      src={parseImages(product.images)[0] || 'https://picsum.photos/seed/product/400/400'} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      alt={product.title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 right-3">
                      <button 
                        onClick={(e) => handleQuickAdd(e, product)}
                        className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-xl flex items-center justify-center text-ml-monte-verde shadow-lg hover:bg-ml-monte-verde hover:text-white transition-all active:scale-90"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </Link>
                  <div className="p-5">
                    <h4 className="font-black text-ml-monte-verde uppercase tracking-tighter leading-tight line-clamp-1 mb-2">{product.title}</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black text-ml-monte-verde tracking-tighter">${product.price}</span>
                      {exchangeRate && (
                        <span className="text-[9px] font-black text-ml-quebrada uppercase tracking-widest">
                          {Math.round(product.price * parseFloat(exchangeRate))} Bs.
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Community Videos - Horizontal Scroll */}
        {communityVideos.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-ml-monte-verde tracking-tighter uppercase">Videos de la Comunidad</h2>
                <div className="h-1 w-16 bg-ml-teja mt-1 rounded-full" />
              </div>
              <button className="text-[10px] font-black text-ml-hierro uppercase tracking-widest bg-stone-100 px-4 py-2 rounded-full hover:bg-ml-monte-verde hover:text-white transition-all">Ver todos</button>
            </div>
            
            <div className="flex gap-6 overflow-x-auto no-scrollbar pb-6 -mx-4 px-4">
              {communityVideos.map((video) => (
                <motion.div 
                  key={video.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="min-w-[280px] md:min-w-[400px] aspect-video rounded-[30px] overflow-hidden relative group shadow-xl border-2 border-white"
                >
                  <img src={`https://img.youtube.com/vi/${video.youtube_id}/maxresdefault.jpg`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={video.title} />
                  <a 
                    href={`https://youtube.com/watch?v=${video.youtube_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                      <Play className="w-8 h-8 text-white fill-white" />
                    </div>
                  </a>
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="px-3 py-1 bg-ml-teja text-white text-[8px] font-black uppercase tracking-widest rounded-full mb-2 inline-block">Comunidad</span>
                    <h4 className="text-white font-black text-sm leading-tight uppercase tracking-tighter">{video.title}</h4>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Community, Culture & Sports - Compact Grid */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-ml-monte-verde tracking-tighter uppercase">Cultura y Deporte</h2>
              <div className="h-1 w-16 bg-ml-teja mt-1 rounded-full" />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3 md:gap-6">
            <Link to="/comunidad?area=sports" className="p-4 md:p-6 glass bg-white/60 rounded-[30px] md:rounded-[35px] flex flex-col items-center gap-3 md:gap-4 hover:bg-ml-monte-verde hover:text-white transition-all group shadow-lg">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-ml-monte-verde/10 rounded-xl md:rounded-2xl flex items-center justify-center text-ml-monte-verde group-hover:bg-white/20 group-hover:text-white transition-all">
                <Trophy className="w-5 h-5 md:w-7 md:h-7" />
              </div>
              <span className="text-[9px] md:text-xs font-black uppercase tracking-widest text-center">Deportes</span>
            </Link>
            <Link to="/comunidad?area=culture" className="p-4 md:p-6 glass bg-white/60 rounded-[30px] md:rounded-[35px] flex flex-col items-center gap-3 md:gap-4 hover:bg-ml-quebrada hover:text-white transition-all group shadow-lg">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-ml-quebrada/10 rounded-xl md:rounded-2xl flex items-center justify-center text-ml-quebrada group-hover:bg-white/20 group-hover:text-white transition-all">
                <Music className="w-5 h-5 md:w-7 md:h-7" />
              </div>
              <span className="text-[9px] md:text-xs font-black uppercase tracking-widest text-center">Cultura</span>
            </Link>
            <Link to="/comunidad" className="p-4 md:p-6 glass bg-white/60 rounded-[30px] md:rounded-[35px] flex flex-col items-center gap-3 md:gap-4 hover:bg-ml-teja hover:text-white transition-all group shadow-lg">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-ml-teja/10 rounded-xl md:rounded-2xl flex items-center justify-center text-ml-teja group-hover:bg-white/20 group-hover:text-white transition-all">
                <Users className="w-5 h-5 md:w-7 md:h-7" />
              </div>
              <span className="text-[9px] md:text-xs font-black uppercase tracking-widest text-center">Comunidad</span>
            </Link>
          </div>
        </div>

        {/* Blue Circle Banner - Final Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 mb-12"
        >
          <div className="glass bg-ml-monte-verde rounded-[40px] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative shadow-2xl">
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -left-20 -top-20 w-64 h-64 bg-ml-quebrada/20 rounded-full blur-3xl" />
            
            <div className="flex items-center gap-4 relative z-10 order-2 md:order-1">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-xl rounded-[25px] border border-white/20 flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
                <IconRenderer iconId="arepa" className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-xl rounded-[25px] border border-white/20 flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
                <IconRenderer iconId="nail-polish" className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
            </div>

            <div className="relative z-10 text-center md:text-right order-1 md:order-2">
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tighter uppercase mb-4">
                Recupera tu tiempo aquí,<br />
                <span className="text-ml-quebrada">haz todo aquí</span>
              </h2>
              <p className="text-white/70 text-sm font-bold uppercase tracking-widest">Simplifica tu vida en Paracotos</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
