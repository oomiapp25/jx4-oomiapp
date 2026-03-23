import React, { useState, useEffect } from 'react';
import { supabase, Product, Department } from '../lib/supabase';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, CreditCard, Truck, ShieldCheck, Ticket, Smartphone, Store, Footprints, Package, Plus, Search, Download, Play, Trophy, Music, Users } from 'lucide-react';
import HeroCarousel from '../components/HeroCarousel';
import { getIconById } from '../lib/icons';
import { IconRenderer } from '../components/IconRenderer';
import { useCart } from '../hooks/useCart';
import { usePWA } from '../hooks/usePWA';

export default function Home() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInstallable, installApp } = usePWA();
  const [products, setProducts] = useState<Product[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [communityVideos, setCommunityVideos] = useState<any[]>([]);
  const [exchangeRate, setExchangeRate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [productsRes, deptsRes, rateRes, videosRes] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('departments').select('*').order('name'),
      supabase.from('settings').select('*').eq('key', 'exchange_rate').single(),
      supabase.from('community_videos').select('*').eq('active', true).order('created_at', { ascending: false })
    ]);
    
    if (productsRes.data) setProducts(productsRes.data);
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
          className="max-w-3xl mx-auto mb-16"
        >
          <div className="relative group">
            <input 
              type="text" 
              placeholder="¿Qué estás buscando hoy en Paracotos?" 
              className="w-full pl-8 pr-16 py-6 glass bg-white/80 rounded-[35px] text-lg focus:ring-4 focus:ring-ml-monte-verde/20 transition-all placeholder:text-stone-400 font-bold shadow-2xl"
            />
            <button className="absolute right-3 top-3 bottom-3 px-8 bg-ml-monte-verde text-white rounded-[25px] hover:bg-ml-quebrada transition-all flex items-center gap-2 shadow-lg shadow-ml-monte-verde/20">
              <Search className="w-5 h-5" />
              <span className="hidden sm:inline text-xs font-black uppercase tracking-widest">Buscar</span>
            </button>
          </div>
        </motion.div>

        {/* Quick Access - Horizontal Scroll to minimize vertical scroll */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-ml-monte-verde uppercase tracking-tighter">Explora Paracotos</h3>
            <div className="h-1 w-12 bg-ml-teja rounded-full" />
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4">
            <Link to="/transporte?tab=private" className="flex flex-col items-center gap-3 min-w-[100px] group">
              <div className="w-20 h-20 rounded-[30px] bg-white shadow-xl flex items-center justify-center group-hover:bg-ml-teja transition-all group-hover:-translate-y-2 border border-stone-100">
                <Truck className="w-8 h-8 text-ml-teja group-hover:text-white" />
              </div>
              <span className="text-[10px] font-black text-ml-hierro uppercase tracking-tighter text-center">Delivery</span>
            </Link>
            {departments.map((dept) => (
              <Link key={dept.id} to={`/departamento/${dept.slug}`} className="flex flex-col items-center gap-3 min-w-[100px] group">
                <div className="w-20 h-20 rounded-[30px] bg-white shadow-xl flex items-center justify-center group-hover:bg-ml-monte-verde transition-all group-hover:-translate-y-2 border border-stone-100">
                  <IconRenderer iconId={dept.icon} className="w-8 h-8 text-ml-monte-verde group-hover:text-white" />
                </div>
                <span className="text-[10px] font-black text-ml-hierro uppercase tracking-tighter text-center">{dept.name}</span>
              </Link>
            ))}
          </div>
        </div>

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

        {/* Product Section - Bento Style */}
        <div className="mt-24">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-black text-ml-monte-verde tracking-tighter uppercase">Catálogo Premium</h2>
              <div className="h-1.5 w-24 bg-ml-teja mt-2 rounded-full" />
            </div>
            <Link to="/" className="text-xs font-black text-ml-hierro hover:text-ml-monte-verde uppercase tracking-widest border-b-2 border-ml-teja pb-1">Ver todo</Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bento-item glass bg-white/60 group"
              >
                <Link to={`/producto/${product.id}`} className="block aspect-square overflow-hidden relative p-6">
                  <img 
                    src={product.images[0] || 'https://picsum.photos/seed/product/400/400'} 
                    alt={product.title}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/80 backdrop-blur-md text-[9px] font-black uppercase tracking-widest rounded-full border border-white/50 text-ml-monte-verde shadow-sm">Nuevo</span>
                  </div>
                  <button
                    onClick={(e) => handleQuickAdd(e, product)}
                    className="absolute bottom-6 right-6 w-12 h-12 bg-ml-teja text-white rounded-2xl flex items-center justify-center shadow-2xl hover:scale-110 active:scale-90 transition-all z-10"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                </Link>
                <div className="p-8 pt-0">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-baseline gap-3">
                      <span className="text-2xl font-black text-ml-monte-verde">${product.price}</span>
                      {exchangeRate && (
                        <span className="text-[10px] font-black text-stone-400 uppercase tracking-tighter">
                          Bs. {(product.price * parseFloat(exchangeRate)).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                        </span>
                      )}
                    </div>
                    <Link to={`/producto/${product.id}`} className="text-sm font-bold text-ml-hierro hover:text-ml-monte-verde transition-colors line-clamp-2 leading-tight uppercase tracking-tighter">
                      {product.title}
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
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
