import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, Product } from '../lib/supabase';
import { ShoppingCart, ArrowLeft, ShieldCheck, Truck, RefreshCw, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { useCart } from '../hooks/useCart';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  async function fetchProduct() {
    const { data } = await supabase.from('products').select('*').eq('id', id).single();
    if (data) setProduct(data);
    setLoading(false);
  }

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  if (loading) return <div className="animate-pulse h-96 bg-stone-100 rounded-3xl" />;
  if (!product) return <div className="text-center py-20">Producto no encontrado</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-stone-500 hover:text-stone-900 mb-8 transition-colors text-sm font-bold">
        <ArrowLeft className="w-4 h-4" />
        Volver
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="aspect-square rounded-3xl overflow-hidden bg-white border border-stone-200"
        >
          <img 
            src={product.images[0] || 'https://picsum.photos/seed/product/800/800'} 
            alt={product.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col"
        >
          <div className="mb-6">
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded">Nuevo</span>
            <h1 className="text-4xl font-black text-stone-900 mt-4 leading-tight">{product.title}</h1>
            <p className="text-2xl font-bold text-stone-900 mt-2">${product.price}</p>
          </div>

          <p className="text-stone-600 leading-relaxed mb-8">
            {product.description}
          </p>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-sm text-stone-600">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Garantía de calidad JX4</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-stone-600">
              <Truck className="w-5 h-5 text-emerald-600" />
              <span>Envío disponible a todo Paracotos</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-stone-600">
              <RefreshCw className="w-5 h-5 text-emerald-600" />
              <span>Devoluciones fáciles en 7 días</span>
            </div>
          </div>

          <div className="mt-auto flex gap-4">
            <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-3 hover:bg-stone-50 transition-colors font-bold"
              >-</button>
              <span className="px-4 py-3 font-bold text-sm min-w-[40px] text-center">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-3 hover:bg-stone-50 transition-colors font-bold"
              >+</button>
            </div>
            <button 
              onClick={handleAddToCart}
              className={`flex-grow py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 ${added ? 'bg-emerald-600 text-white' : 'bg-stone-900 text-white hover:bg-emerald-600'}`}
            >
              {added ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
              {added ? '¡Añadido!' : 'Añadir al Carrito'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
