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
  const [exchangeRate, setExchangeRate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [productsRes, deptsRes, rateRes] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('departments').select('*').order('name'),
      supabase.from('settings').select('*').eq('key', 'exchange_rate').single()
    ]);
    
    if (productsRes.data) setProducts(productsRes.data);
    if (deptsRes.data) setDepartments(deptsRes.data);
    if (rateRes.data) setExchangeRate(rateRes.data.value.rate);
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

      {/* Security Banner - Prominent */}
      <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-30">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass bg-white/90 backdrop-blur-xl p-4 md:p-6 rounded-[30px] border border-white/40 shadow-xl flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-ml-monte-verde/10 rounded-2xl flex items-center justify-center text-ml-monte-verde">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-sm font-black text-ml-monte-verde uppercase tracking-tighter">100% Seguridad Paracoteña</h4>
              <p className="text-[10px] text-ml-hierro font-bold uppercase opacity-60">Tu confianza es nuestra prioridad</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-ml-monte-verde/10 rounded-full text-ml-monte-verde text-[10px] font-black uppercase tracking-widest">
            Verificado
          </div>
        </motion.div>
      </div>

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

        {/* Bento Grid Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Featured Video / News - Large */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="md:col-span-2 aspect-[16/10] md:aspect-auto rounded-[40px] overflow-hidden relative bg-ml-quebrada group shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-ml-quebrada via-transparent to-transparent z-10" />
            <img 
              src="https://picsum.photos/seed/paracotos/800/800" 
              className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700"
              alt="Featured"
            />
            <div className="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-10 md:right-10 z-20">
              <span className="px-4 py-1.5 bg-ml-teja text-white text-[10px] font-black uppercase tracking-widest rounded-full mb-4 inline-block shadow-lg">Destacado</span>
              <h3 className="text-2xl md:text-4xl font-black text-white leading-tight mb-4 tracking-tighter uppercase">Descubre lo mejor de nuestra parroquia</h3>
              <Link to="/noticias" className="inline-flex items-center gap-2 text-white font-black text-xs uppercase tracking-widest hover:gap-4 transition-all bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
                Leer más <Plus className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-1 gap-4 md:gap-6">
            {/* Stats / Info - Small */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-[40px] bg-ml-teja p-6 md:p-8 flex flex-col justify-between text-white shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-24 h-24" />
              </div>
              <ShieldCheck className="w-8 h-8 md:w-10 md:h-10 opacity-50" />
              <div>
                <div className="text-3xl md:text-5xl font-black mb-1 tracking-tighter">100%</div>
                <div className="text-[10px] md:text-xs font-black uppercase tracking-widest opacity-80 leading-tight">Seguridad Paracoteña</div>
              </div>
            </motion.div>

            {/* App Download / PWA - Small */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              onClick={() => isInstallable && installApp()}
              className={`rounded-[40px] p-6 md:p-8 flex flex-col justify-between text-white transition-all duration-500 shadow-2xl relative overflow-hidden group ${isInstallable ? 'bg-ml-monte-verde cursor-pointer hover:bg-ml-quebrada hover:scale-[1.02]' : 'bg-stone-400 opacity-60 cursor-default'}`}
            >
              <div className="absolute -right-4 -top-4 opacity-10 group-hover:rotate-12 transition-transform">
                <Smartphone className="w-24 h-24" />
              </div>
              <div className="flex justify-between items-start">
                <Smartphone className="w-8 h-8 md:w-10 md:h-10 opacity-50" />
                {isInstallable && (
                  <motion.div 
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="bg-white/20 p-2 rounded-full backdrop-blur-md border border-white/30"
                  >
                    <Download className="w-4 h-4" />
                  </motion.div>
                )}
              </div>
              <div>
                <div className="text-lg md:text-2xl font-black leading-tight mb-1 tracking-tighter uppercase">
                  {isInstallable ? 'Instalar App' : 'App Lista'}
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest opacity-80 leading-tight">
                  {isInstallable ? 'Experiencia Fluida' : 'Disfruta JX4'}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

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
        <div className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-ml-monte-verde tracking-tighter uppercase">Videos de la Comunidad</h2>
              <div className="h-1 w-16 bg-ml-teja mt-1 rounded-full" />
            </div>
            <button className="text-[10px] font-black text-ml-hierro uppercase tracking-widest bg-stone-100 px-4 py-2 rounded-full hover:bg-ml-monte-verde hover:text-white transition-all">Ver todos</button>
          </div>
          
          <div className="flex gap-6 overflow-x-auto no-scrollbar pb-6 -mx-4 px-4">
            {[1, 2, 3].map((i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="min-w-[280px] md:min-w-[400px] aspect-video rounded-[30px] overflow-hidden relative group shadow-xl border-2 border-white"
              >
                <img src={`https://picsum.photos/seed/video${i}/800/450`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Video thumbnail" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                    <Play className="w-8 h-8 text-white fill-white" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="px-3 py-1 bg-ml-teja text-white text-[8px] font-black uppercase tracking-widest rounded-full mb-2 inline-block">Comunidad</span>
                  <h4 className="text-white font-black text-sm leading-tight uppercase tracking-tighter">Evento Especial en Paracotos #{i}</h4>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

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
      </div>
    </div>
  );
}
