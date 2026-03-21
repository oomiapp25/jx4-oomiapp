import React, { useState, useEffect } from 'react';
import { supabase, Product, Department } from '../lib/supabase';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, CreditCard, Truck, ShieldCheck, Ticket, Smartphone, Store, Footprints, Package, Plus, Search, Download } from 'lucide-react';
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
        <div className="bento-grid">
          {/* Featured Video / News - Large */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bento-item bento-item-large bg-ml-quebrada group"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-ml-quebrada via-transparent to-transparent z-10" />
            <img 
              src="https://picsum.photos/seed/paracotos/800/800" 
              className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700"
              alt="Featured"
            />
            <div className="absolute bottom-8 left-8 right-8 z-20">
              <span className="px-4 py-1.5 bg-ml-teja text-white text-[10px] font-black uppercase tracking-widest rounded-full mb-4 inline-block">Destacado</span>
              <h3 className="text-3xl font-black text-white leading-tight mb-4">Descubre lo mejor de nuestra parroquia</h3>
              <Link to="/noticias" className="inline-flex items-center gap-2 text-white font-bold hover:gap-4 transition-all">
                Leer más <Plus className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>

          {/* Quick Access - Wide */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bento-item bento-item-wide glass bg-white/40 p-8 flex flex-col justify-between"
          >
            <h3 className="text-xl font-black text-ml-monte-verde uppercase tracking-tighter">Categorías</h3>
            <div className="flex gap-6 overflow-x-auto no-scrollbar pb-2">
              <Link to="/transporte?tab=private" className="flex flex-col items-center gap-3 min-w-[90px] group">
                <div className="w-16 h-16 rounded-[22px] bg-white shadow-xl flex items-center justify-center group-hover:bg-ml-teja transition-all group-hover:-translate-y-2">
                  <Truck className="w-7 h-7 text-ml-teja group-hover:text-white" />
                </div>
                <span className="text-[11px] font-black text-ml-hierro uppercase tracking-tighter">Delivery</span>
              </Link>
              {departments.map((dept) => (
                <Link key={dept.id} to={`/departamento/${dept.slug}`} className="flex flex-col items-center gap-3 min-w-[90px] group">
                  <div className="w-16 h-16 rounded-[22px] bg-white shadow-xl flex items-center justify-center group-hover:bg-ml-monte-verde transition-all group-hover:-translate-y-2">
                    <IconRenderer iconId={dept.icon} className="w-7 h-7 text-ml-monte-verde group-hover:text-white" />
                  </div>
                  <span className="text-[11px] font-black text-ml-hierro uppercase tracking-tighter text-center">{dept.name}</span>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Stats / Info - Small */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bento-item bg-ml-teja p-8 flex flex-col justify-between text-white"
          >
            <Ticket className="w-10 h-10 opacity-50" />
            <div>
              <div className="text-4xl font-black mb-1">100%</div>
              <div className="text-xs font-bold uppercase tracking-widest opacity-80">Seguridad Paracoteña</div>
            </div>
          </motion.div>

          {/* App Download / PWA - Small */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onClick={() => isInstallable && installApp()}
            className={`bento-item p-8 flex flex-col justify-between text-white transition-all duration-500 ${isInstallable ? 'bg-ml-monte-verde cursor-pointer hover:bg-ml-quebrada hover:scale-[1.02] shadow-ml-monte-verde/30' : 'bg-stone-400 opacity-60 cursor-default'}`}
          >
            <div className="flex justify-between items-start">
              <Smartphone className="w-10 h-10 opacity-50" />
              {isInstallable && (
                <motion.div 
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="bg-white/20 p-2 rounded-full backdrop-blur-md"
                >
                  <Download className="w-4 h-4" />
                </motion.div>
              )}
            </div>
            <div>
              <div className="text-xl font-black leading-tight mb-2">
                {isInstallable ? 'Instalar App Ahora' : 'App Instalada'}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                {isInstallable ? 'Experiencia PWA Fluida' : 'Ya estás en la App'}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Video Section - Bento Style */}
        <div className="mt-24">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-black text-ml-monte-verde tracking-tighter uppercase">Videos de la Comunidad</h2>
              <div className="h-1.5 w-24 bg-ml-teja mt-2 rounded-full" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-[40px] overflow-hidden shadow-2xl aspect-video bg-stone-900 border-4 border-white"
            >
              <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?modestbranding=1&rel=0" 
                title="YouTube video player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              />
            </motion.div>
            <div className="flex flex-col justify-center gap-6">
              <h3 className="text-2xl font-black text-ml-quebrada uppercase tracking-tighter">Vive la experiencia JX4</h3>
              <p className="text-ml-hierro font-medium leading-relaxed">
                Conoce las historias, eventos y el día a día de nuestra parroquia a través de contenido exclusivo creado por y para paracoteños.
              </p>
              <button className="bg-ml-monte-verde text-white px-8 py-4 rounded-[25px] font-black uppercase tracking-widest text-xs self-start hover:bg-ml-quebrada transition-all shadow-xl shadow-ml-monte-verde/20">
                Ver canal de YouTube
              </button>
            </div>
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
