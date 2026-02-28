import { useState, useEffect } from 'react';
import { supabase, Product } from '../lib/supabase';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Plus } from 'lucide-react';
import HeroCarousel from '../components/HeroCarousel';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setProducts(data);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="space-y-12">
        <div className="w-full aspect-[21/9] bg-stone-100 rounded-[2rem] animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-stone-200 p-4 animate-pulse">
              <div className="aspect-square bg-stone-100 rounded-xl mb-4" />
              <div className="h-4 bg-stone-100 rounded w-3/4 mb-2" />
              <div className="h-4 bg-stone-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <HeroCarousel />

      <div>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">Productos Destacados</h1>
          <div className="flex gap-2">
            {/* Categorías Filter (Simplified) */}
            <button className="px-4 py-1.5 bg-white border border-stone-200 rounded-full text-sm font-medium hover:border-emerald-500 transition-colors">Todos</button>
            <button className="px-4 py-1.5 bg-white border border-stone-200 rounded-full text-sm font-medium hover:border-emerald-500 transition-colors">Electrónica</button>
            <button className="px-4 py-1.5 bg-white border border-stone-200 rounded-full text-sm font-medium hover:border-emerald-500 transition-colors">Hogar</button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-xl hover:shadow-stone-200/50 transition-all duration-300"
          >
            <Link to={`/producto/${product.id}`} className="block aspect-square overflow-hidden bg-stone-100 relative">
              <img 
                src={product.images[0] || 'https://picsum.photos/seed/product/400/400'} 
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                  <span className="bg-stone-900 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">Agotado</span>
                </div>
              )}
            </Link>
            <div className="p-4">
              <div className="flex items-start justify-between mb-1">
                <Link to={`/producto/${product.id}`} className="text-sm font-bold text-stone-900 hover:text-emerald-600 transition-colors line-clamp-1">
                  {product.title}
                </Link>
                <span className="text-sm font-black text-stone-900">${product.price}</span>
              </div>
              <p className="text-xs text-stone-500 line-clamp-2 mb-4 h-8">
                {product.description}
              </p>
              <button 
                disabled={product.stock === 0}
                className="w-full py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 disabled:bg-stone-200 disabled:text-stone-400 transition-all active:scale-95"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Añadir al Carrito
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);
}
