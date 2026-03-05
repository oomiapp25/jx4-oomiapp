import { useState, useEffect } from 'react';
import { supabase, Transport, Department, UserProfile } from '../lib/supabase';
import { Truck, Store, CheckCircle2, MapPin, Phone, ShieldCheck, ArrowRight, Loader2, Minus, Plus as PlusIcon, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Checkout() {
  const { cart, total, clearCart, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [method, setMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [transports, setTransports] = useState<Transport[]>([]);
  const [selectedTransport, setSelectedTransport] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  
  const [formData, setFormData] = useState({
    address: '',
    phone: '',
    receiver_name: '',
    notes: ''
  });

  useEffect(() => {
    fetchTransports();
    fetchExchangeRate();
    if (user) {
      setFormData(prev => ({
        ...prev,
        receiver_name: user.full_name || '',
        phone: user.phone_number || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user && formData.phone.length >= 10) {
        lookupPhone(formData.phone);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.phone, user]);

  async function lookupPhone(phone: string) {
    // Try to find an existing profile by phone to help guest users
    const { data } = await supabase
      .from('users')
      .select('full_name, address')
      .eq('phone_number', phone)
      .limit(1)
      .single();
    
    if (data) {
      setFormData(prev => ({
        ...prev,
        receiver_name: data.full_name || prev.receiver_name,
        address: data.address || prev.address
      }));
    }
  }

  async function fetchExchangeRate() {
    const { data } = await supabase.from('settings').select('*').eq('key', 'exchange_rate').single();
    if (data) setExchangeRate(parseFloat(data.value.rate));
  }

  async function fetchTransports() {
    const { data } = await supabase.from('transports').select('*');
    if (data) setTransports(data);
    setLoading(false);
  }

  const handleConfirmOrder = async () => {
    if (method === 'delivery' && !selectedTransport) {
      alert('Por favor selecciona un transportista');
      return;
    }
    if (!formData.phone || !formData.receiver_name) {
      alert('Por favor completa los datos de contacto');
      return;
    }
    if (method === 'delivery' && !formData.address) {
      alert('Por favor indica la dirección de entrega');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Save Order directly to Supabase
      const orderPayload = {
        user_id: user?.id || null,
        items: cart,
        total: total + (method === 'delivery' ? (transports.find(t => t.id === selectedTransport)?.base_price || 0) : 0),
        status: 'pending',
        transport_id: method === 'delivery' ? selectedTransport : null,
        address: method === 'pickup' ? 'RETIRO EN TIENDA' : formData.address,
        customer_name: formData.receiver_name,
        customer_phone: formData.phone
      };

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([orderPayload])
        .select()
        .single();

      if (orderError) {
        console.error('Error de Supabase:', orderError);
        throw new Error(orderError.message || 'Error al guardar el pedido en la base de datos');
      }

      const order = orderData;

      // 2. Route WhatsApp Messages by Department
      const departmentIds = [...new Set(cart.map(item => item.department_id))];
      
      // Fetch departments and their managers
      const { data: depts } = await supabase.from('departments').select('*').in('id', departmentIds);
      const { data: managers } = await supabase.from('users').select('*').in('department_id', departmentIds).eq('role', 'department_admin');

      for (const deptId of departmentIds) {
        const dept = depts?.find(d => d.id === deptId);
        const manager = managers?.find(m => m.department_id === deptId);
        const whatsapp = dept?.whatsapp || manager?.phone_number;

        if (whatsapp) {
          const deptItems = cart.filter(item => item.department_id === deptId);
          const itemsText = deptItems.map(item => `• ${item.title} x${item.quantity}`).join('\n');
          const deptSubtotal = deptItems.reduce((s, i) => s + (i.price * i.quantity), 0);
          const transportFee = method === 'delivery' ? (transports.find(t => t.id === selectedTransport)?.base_price || 0) : 0;
          const deptTotal = deptSubtotal + transportFee;
          const totalVES = deptTotal * exchangeRate;

          const message = `🛒*NUEVO PEDIDO - JX4 PARACOTOS*\n` +
            `📅 Fecha: ${new Date().toLocaleDateString('es-ES')}\n` +
            `👤*CLIENTE:*\n` +
            `• Nombre: ${formData.receiver_name.toUpperCase()}\n` +
            `• WhatsApp: ${formData.phone}\n` +
            `• Método: ${method === 'pickup' ? '🏪 Retiro en Tienda' : '🚚 Envío a Domicilio'}\n` +
            `🛍️*PRODUCTOS:*\n${itemsText}\n\n` +
            `Subtotal: USD ${deptSubtotal.toFixed(2)}\n` +
            `💵*TOTAL USD: USD ${deptTotal.toFixed(2)}*\n` +
            `💰*VES total:Bs.S ${totalVES.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 3 }) }*\n` +
            `(Tasa: ${exchangeRate.toFixed(2)})\n` +
            `📝*NOTAS:*_ ${formData.notes || 'Sin notas adicionales'} _`;

          const encodedMsg = encodeURIComponent(message);
          window.open(`https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodedMsg}`, '_blank');
        }
      }

      // 3. Clear Cart and Redirect
      clearCart();
      alert('¡Pedido confirmado! Se han abierto los chats de WhatsApp para coordinar con cada departamento.');
      navigate(user ? '/mis-pedidos' : '/');

    } catch (error: any) {
      alert('Error al procesar el pedido: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-ml-dark mb-4">Tu carrito está vacío</h2>
        <button onClick={() => navigate('/')} className="text-ml-acento font-bold hover:underline">Ir a comprar</button>
      </div>
    );
  }

  const deliveryFee = method === 'delivery' ? (transports.find(t => t.id === selectedTransport)?.base_price || 0) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Cart Items */}
          <section className="bg-white p-8 rounded shadow-sm border border-stone-100">
            <h2 className="text-xl font-bold text-stone-900 mb-6">Revisa tus productos</h2>
            <div className="divide-y divide-stone-100">
              {cart.map((item) => (
                <div key={item.id} className="py-4 flex items-center gap-4">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-16 h-16 object-cover rounded-lg border border-stone-100"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-grow">
                    <h3 className="text-sm font-bold text-ml-dark line-clamp-1">{item.title}</h3>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-ml-teja font-bold">${item.price.toFixed(2)}</p>
                      {exchangeRate > 0 && (
                        <p className="text-[10px] text-stone-400 font-bold">
                          Bs. {(item.price * exchangeRate).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-stone-50 text-stone-500 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-ml-dark">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-stone-50 text-stone-500 transition-colors"
                      >
                        <PlusIcon className="w-3 h-3" />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-stone-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Method Selection */}
          <section className="bg-white p-8 rounded shadow-sm border border-stone-100">
            <h2 className="text-xl font-bold text-stone-900 mb-6">¿Cómo quieres recibir o retirar tu compra?</h2>
            <div className="space-y-4">
              <button 
                onClick={() => setMethod('delivery')}
                className={`w-full p-6 rounded-lg border-2 transition-all flex items-center gap-4 ${method === 'delivery' ? 'border-ml-secundario bg-ml-neutral' : 'border-stone-100 bg-white hover:border-stone-200'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${method === 'delivery' ? 'bg-ml-secundario text-white' : 'bg-ml-neutral text-ml-principal'}`}>
                  <Truck className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className={`block font-bold ${method === 'delivery' ? 'text-ml-secundario' : 'text-ml-dark'}`}>Enviar a mi domicilio</span>
                  <span className="text-xs text-ml-principal/60">Llega a Paracotos en 24-48h</span>
                </div>
              </button>
              <button 
                onClick={() => setMethod('pickup')}
                className={`w-full p-6 rounded-lg border-2 transition-all flex items-center gap-4 ${method === 'pickup' ? 'border-ml-secundario bg-ml-neutral' : 'border-stone-100 bg-white hover:border-stone-200'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${method === 'pickup' ? 'bg-ml-secundario text-white' : 'bg-ml-neutral text-ml-principal'}`}>
                  <Store className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className={`block font-bold ${method === 'pickup' ? 'text-ml-secundario' : 'text-ml-dark'}`}>Retiro en tienda</span>
                  <span className="text-xs text-ml-principal/60">Gratis - Disponible hoy mismo</span>
                </div>
              </button>
            </div>
          </section>

          {/* Transport Selection */}
          {method === 'delivery' && (
            <motion.section 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white p-8 rounded shadow-sm border border-stone-100"
            >
              <h2 className="text-xl font-bold text-stone-900 mb-6">Selecciona un transportista</h2>
              <div className="space-y-3">
                {transports.map((t) => (
                  <button 
                    key={t.id}
                    onClick={() => setSelectedTransport(t.id)}
                    className={`w-full p-4 rounded-lg border transition-all text-left flex items-center justify-between ${selectedTransport === t.id ? 'border-ml-secundario bg-ml-neutral' : 'border-stone-100 bg-white hover:border-stone-200'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-ml-neutral rounded-full flex items-center justify-center text-ml-principal">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-ml-dark">{t.name}</p>
                        <p className="text-[10px] text-ml-principal/60 uppercase">{t.vehicle_type}</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-ml-dark">${t.base_price}</p>
                  </button>
                ))}
              </div>
            </motion.section>
          )}

          {/* Address Info */}
          <section className="bg-white p-8 rounded shadow-sm border border-stone-100">
            <h2 className="text-xl font-bold text-stone-900 mb-6">Datos de contacto y entrega</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1">Nombre de quien recibe</label>
                <input 
                  type="text"
                  value={formData.receiver_name}
                  onChange={e => setFormData({...formData, receiver_name: e.target.value})}
                  className="w-full px-4 py-2 bg-white border border-stone-200 rounded text-sm focus:ring-1 focus:ring-ml-secundario outline-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1">Teléfono de contacto</label>
                  <input 
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-2 bg-white border border-stone-200 rounded text-sm focus:ring-1 focus:ring-ml-secundario outline-none"
                    placeholder="Ej. 04241234567"
                  />
                </div>
                {method === 'delivery' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <label className="block text-xs font-bold text-stone-500 mb-1">Dirección (Referencia)</label>
                    <input 
                      type="text"
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                      className="w-full px-4 py-2 bg-white border border-stone-200 rounded text-sm focus:ring-1 focus:ring-ml-secundario outline-none"
                      placeholder="Ej. Calle principal, casa #5"
                    />
                  </motion.div>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1">Notas adicionales (Opcional)</label>
                <textarea 
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-4 py-2 bg-white border border-stone-200 rounded text-sm focus:ring-1 focus:ring-ml-secundario outline-none resize-none"
                  rows={2}
                  placeholder="Ej. Entregar en la puerta azul, llamar al llegar..."
                />
              </div>
            </div>
          </section>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded shadow-sm border border-stone-100 sticky top-32">
            <h3 className="text-lg font-bold mb-6 text-stone-900">Resumen de compra</h3>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm text-ml-dark/70">
                <span>Productos ({cart.length})</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-ml-dark/70">
                <span>Envío</span>
                <span className={method === 'pickup' ? 'text-ml-acento font-bold' : ''}>
                  {method === 'pickup' ? 'Gratis' : `$${deliveryFee.toFixed(2)}`}
                </span>
              </div>
              <div className="pt-4 border-t border-stone-100 flex flex-col items-end">
                <div className="flex justify-between w-full">
                  <span className="text-lg font-bold text-ml-dark">Total</span>
                  <span className="text-lg font-bold text-ml-dark">${(total + deliveryFee).toFixed(2)}</span>
                </div>
                {exchangeRate > 0 && (
                  <span className="text-sm font-bold text-ml-teja">
                    Bs. {((total + deliveryFee) * exchangeRate).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <button 
                onClick={handleConfirmOrder}
                disabled={submitting}
                className="w-full py-3 bg-ml-teja text-white rounded font-bold hover:bg-ml-teja/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Finalizar compra'}
              </button>
              <button 
                onClick={() => { if(confirm('¿Vaciar el carrito?')) { clearCart(); navigate('/'); } }}
                className="w-full py-2 text-xs font-bold text-stone-400 hover:text-red-500 transition-colors"
              >
                Vaciar carrito
              </button>
            </div>
            <div className="mt-6 p-4 bg-ml-white-cal rounded flex gap-3">
              <ShieldCheck className="w-5 h-5 text-ml-teja/60 flex-shrink-0" />
              <p className="text-[10px] text-ml-hierro leading-tight">
                Somos un catálogo digital. No nos responsabilizamos por transacciones económicas. La responsabilidad es directamente del vendedor.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
