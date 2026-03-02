import { useState, useEffect } from 'react';
import { supabase, Product, Department } from '../lib/supabase';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ShoppingCart, CreditCard, Truck, ShieldCheck, Ticket, Smartphone, Store, Footprints, Package } from 'lucide-react';
import HeroCarousel from '../components/HeroCarousel';
import { getIconById } from '../lib/icons';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [productsRes, deptsRes] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('departments').select('*').order('name')
    ]);
    
    if (productsRes.data) setProducts(productsRes.data);
    if (deptsRes.data) setDepartments(deptsRes.data);
    setLoading(false);
  }

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
          {departments.map((dept) => {
            const DeptIcon = getIconById(dept.icon);
            return (
              <Link 
                key={dept.id} 
                to={`/departamento/${dept.slug}`}
                className="flex flex-col items-center gap-2 min-w-[80px] cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-full bg-ml-white-cal flex items-center justify-center group-hover:bg-ml-quebrada transition-colors">
                  <DeptIcon className="w-6 h-6 text-ml-hierro group-hover:text-white transition-colors" />
                </div>
                <span className="text-[11px] font-medium text-ml-hierro text-center">{dept.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Product Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-light text-ml-monte-verde">Basado en tu última visita</h2>
            <Link to="/" className="text-sm text-ml-hierro hover:underline">Ver historial</Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {products.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded overflow-hidden shadow-sm hover:shadow-md transition-shadow group border border-transparent hover:border-ml-white-cal"
              >
                <Link to={`/producto/${product.id}`} className="block aspect-square overflow-hidden bg-white relative p-4">
                  <img 
                    src={product.images[0] || 'https://picsum.photos/seed/product/400/400'} 
                    alt={product.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                </Link>
                <div className="p-4 border-t border-ml-white-cal">
                  <div className="flex flex-col gap-1">
                    <span className="text-xl font-normal text-ml-monte-verde">${product.price}</span>
                    <p className="text-xs text-ml-quebrada font-bold">Envío gratis</p>
                    <Link to={`/producto/${product.id}`} className="text-sm text-ml-monte-verde hover:text-ml-hierro transition-colors line-clamp-2 mt-1 leading-tight">
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
