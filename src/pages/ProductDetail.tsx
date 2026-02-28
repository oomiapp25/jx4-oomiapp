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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded shadow-sm border border-stone-100 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
          {/* Image Gallery */}
          <div className="md:col-span-8 p-8 border-r border-stone-100">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-square max-w-2xl mx-auto"
            >
              <img 
                src={product.images[0] || 'https://picsum.photos/seed/product/800/800'} 
                alt={product.title}
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            
            <div className="mt-12 border-t border-stone-100 pt-8">
              <h2 className="text-2xl font-normal text-stone-800 mb-6">Descripción</h2>
              <p className="text-stone-600 leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          </div>

          {/* Buy Box */}
          <div className="md:col-span-4 p-8">
            <div className="border border-stone-200 rounded-lg p-6 space-y-6">
              <div>
                <span className="text-xs text-stone-400">Nuevo | {product.stock} disponibles</span>
                <h1 className="text-2xl font-bold text-stone-900 mt-1 leading-tight">{product.title}</h1>
              </div>

              <div>
                <p className="text-4xl font-light text-stone-900">${product.price}</p>
                <p className="text-sm text-stone-500 mt-1">en 12x $ {(product.price / 12).toFixed(2)} sin interés</p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <Truck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-emerald-600 font-bold">Envío gratis a todo el país</p>
                    <p className="text-xs text-stone-400">Conoce los tiempos y las formas de envío.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <ShieldCheck className="w-5 h-5 text-stone-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-ml-blue">Compra Protegida</p>
                    <p className="text-xs text-stone-400">Recibe el producto que esperabas o te devolvemos tu dinero.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-sm font-medium">Cantidad:</span>
                  <select 
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="bg-stone-50 border border-stone-200 rounded px-2 py-1 text-sm outline-none"
                  >
                    {[...Array(Math.min(10, product.stock || 1))].map((_, i) => (
                      <option key={i+1} value={i+1}>{i+1} unidad{i > 0 ? 'es' : ''}</option>
                    ))}
                  </select>
                </div>

                <button 
                  onClick={handleAddToCart}
                  className="w-full py-3 bg-ml-blue text-white rounded font-bold hover:bg-blue-600 transition-colors"
                >
                  Comprar ahora
                </button>
                <button 
                  onClick={handleAddToCart}
                  className={`w-full py-3 rounded font-bold transition-colors border border-transparent ${added ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-blue-50 text-ml-blue hover:bg-blue-100'}`}
                >
                  {added ? '¡Agregado!' : 'Agregar al carrito'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
