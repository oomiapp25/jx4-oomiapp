import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase, Product, Category } from '../lib/supabase';
import { motion } from 'motion/react';
import { Package, ArrowLeft, Star, Plus } from 'lucide-react';
import { getIconById } from '../lib/icons';
import { useCart } from '../hooks/useCart';

export default function CategoryDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [exchangeRate, setExchangeRate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [slug]);

  async function fetchData() {
    setLoading(true);
    // 1. Fetch Category
    const { data: catData } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (catData) {
      setCategory(catData);
      // 2. Fetch Products and Exchange Rate
      const [prodRes, rateRes] = await Promise.all([
        supabase
          .from('products')
          .select('*')
          .eq('category_id', catData.id)
          .order('created_at', { ascending: false }),
        supabase.from('settings').select('*').eq('key', 'exchange_rate').single()
      ]);
      
      if (prodRes.data) setProducts(prodRes.data);
      if (rateRes.data) setExchangeRate(rateRes.data.value.rate);
    }
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
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-pulse text-stone-400 font-medium">Cargando categoría...</div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-ml-dark mb-4">Categoría no encontrada</h2>
        <Link to="/" className="text-ml-acento font-bold hover:underline">Volver al inicio</Link>
      </div>
    );
  }

  const CatIcon = getIconById(category.icon);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-ml-monte-verde">
            <CatIcon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-ml-monte-verde tracking-tighter">{category.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Star className="w-4 h-4 text-ml-quebrada fill-ml-quebrada" />
              <span className="text-sm font-bold text-ml-hierro">Reputación: {category.rating || 0}</span>
            </div>
          </div>
        </div>
        <Link to="/" className="flex items-center gap-2 text-sm font-bold text-ml-hierro hover:text-ml-monte-verde transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>
      </div>

      {products.length > 0 ? (
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
                {/* Quick Add Button */}
                <button
                  onClick={(e) => handleQuickAdd(e, product)}
                  className="absolute bottom-2 right-2 w-8 h-8 bg-ml-teja text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10"
                  title="Agregar al carrito"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </Link>
              <div className="p-4 border-t border-ml-white-cal">
                <div className="flex flex-col gap-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-normal text-ml-monte-verde">${product.price}</span>
                    {exchangeRate && (
                      <span className="text-[10px] font-bold text-stone-400">
                        Bs. {(product.price * parseFloat(exchangeRate)).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-ml-hierro font-bold">Envío Parroquial</p>
                  <Link to={`/producto/${product.id}`} className="text-sm text-ml-monte-verde hover:text-ml-hierro transition-colors line-clamp-2 mt-1 leading-tight">
                    {product.title}
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-stone-200">
          <Package className="w-16 h-16 text-stone-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-ml-dark mb-2">No hay productos aún</h3>
          <p className="text-sm text-ml-hierro">Vuelve pronto para ver las novedades de esta categoría.</p>
        </div>
      )}
    </div>
  );
}
