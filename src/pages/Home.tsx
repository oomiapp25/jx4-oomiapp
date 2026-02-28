import { useState, useEffect } from 'react';
import { supabase, Product } from '../lib/supabase';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ShoppingCart, CreditCard, Truck, ShieldCheck, Ticket, Smartphone, Store, Footprints } from 'lucide-react';
import HeroCarousel from '../components/HeroCarousel';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setProducts(data);
    setLoading(false);
  }

  const dynamicAccess = [
    { icon: Smartphone, label: 'Celulares', color: 'text-stone-600' },
    { icon: Store, label: 'Tiendas', color: 'text-stone-600' },
    { icon: Footprints, label: 'Zapatos', color: 'text-stone-600' },
    { icon: Ticket, label: 'Cupones', color: 'text-stone-600' },
    { icon: CreditCard, label: 'Pagar', color: 'text-stone-600' },
    { icon: Truck, label: 'Envíos', color: 'text-stone-600' },
    { icon: ShieldCheck, label: 'Seguro', color: 'text-stone-600' },
  ];

  if (loading) {
    return (
      <div className="space-y-8 pb-20">
        <div className="w-full aspect-[21/9] bg-stone-200 animate-pulse" />
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
    <div className="pb-20 space-y-8">
      <HeroCarousel />

      <div className="max-w-7xl mx-auto px-4">
        {/* Dynamic Access Bar */}
        <div className="bg-white p-6 rounded shadow-sm flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          {dynamicAccess.map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-2 min-w-[80px] cursor-pointer group">
              <div className="w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center group-hover:bg-ml-yellow transition-colors">
                <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <span className="text-[11px] font-medium text-stone-600">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Product Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-light text-stone-700">Basado en tu última visita</h2>
            <Link to="/categorias" className="text-sm text-ml-blue hover:underline">Ver historial</Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {products.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded overflow-hidden shadow-sm hover:shadow-md transition-shadow group border border-transparent hover:border-stone-100"
              >
                <Link to={`/producto/${product.id}`} className="block aspect-square overflow-hidden bg-white relative p-4">
                  <img 
                    src={product.images[0] || 'https://picsum.photos/seed/product/400/400'} 
                    alt={product.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                </Link>
                <div className="p-4 border-t border-stone-50">
                  <div className="flex flex-col gap-1">
                    <span className="text-xl font-normal text-stone-900">${product.price}</span>
                    <p className="text-xs text-emerald-600 font-bold">Envío gratis</p>
                    <Link to={`/producto/${product.id}`} className="text-sm text-stone-600 hover:text-ml-blue transition-colors line-clamp-2 mt-1 leading-tight">
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
