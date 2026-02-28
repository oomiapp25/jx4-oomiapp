import { useState, useEffect } from 'react';
import { supabase, Transport, Department, UserProfile } from '../lib/supabase';
import { Truck, Store, CheckCircle2, MapPin, Phone, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Checkout() {
  const { cart, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [method, setMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [transports, setTransports] = useState<Transport[]>([]);
  const [selectedTransport, setSelectedTransport] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    address: '',
    phone: '',
    receiver_name: ''
  });

  useEffect(() => {
    fetchTransports();
  }, []);

  async function fetchTransports() {
    const { data } = await supabase.from('transports').select('*');
    if (data) setTransports(data);
    setLoading(false);
  }

  const handleConfirmOrder = async () => {
    if (!user) return;
    if (method === 'delivery' && !selectedTransport) {
      alert('Por favor selecciona un transportista');
      return;
    }
    if (!formData.address || !formData.phone || !formData.receiver_name) {
      alert('Por favor completa los datos de envío');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Save Order to DB
      const { data: order, error: orderError } = await supabase.from('orders').insert({
        user_id: user.id,
        items: cart,
        total: total + (method === 'delivery' ? (transports.find(t => t.id === selectedTransport)?.base_price || 0) : 0),
        status: 'pending',
        transport_id: method === 'delivery' ? selectedTransport : null,
        address: formData.address
      }).select().single();

      if (orderError) throw orderError;

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
          const itemsText = deptItems.map(item => `- ${item.title} (x${item.quantity})`).join('\n');
          const message = `*Nuevo Pedido JX4 - Dept: ${dept?.name}*\n\n` +
            `*Cliente:* ${formData.receiver_name}\n` +
            `*Teléfono:* ${formData.phone}\n` +
            `*Dirección:* ${formData.address}\n` +
            `*Método:* ${method === 'delivery' ? 'Delivery' : 'Retiro'}\n\n` +
            `*Productos:*\n${itemsText}\n\n` +
            `*Total Dept:* $${deptItems.reduce((s, i) => s + (i.price * i.quantity), 0).toFixed(2)}`;

          const encodedMsg = encodeURIComponent(message);
          window.open(`https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodedMsg}`, '_blank');
        }
      }

      // 3. Clear Cart and Redirect
      clearCart();
      alert('¡Pedido confirmado! Se han abierto los chats de WhatsApp para coordinar con cada departamento.');
      navigate('/mis-pedidos');

    } catch (error: any) {
      alert('Error al procesar el pedido: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-stone-900 mb-4">Tu carrito está vacío</h2>
        <button onClick={() => navigate('/')} className="text-emerald-600 font-bold hover:underline">Ir a comprar</button>
      </div>
    );
  }

  const deliveryFee = method === 'delivery' ? (transports.find(t => t.id === selectedTransport)?.base_price || 0) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Method Selection */}
          <section className="bg-white p-8 rounded shadow-sm border border-stone-100">
            <h2 className="text-xl font-bold text-stone-900 mb-6">¿Cómo quieres recibir o retirar tu compra?</h2>
            <div className="space-y-4">
              <button 
                onClick={() => setMethod('delivery')}
                className={`w-full p-6 rounded-lg border-2 transition-all flex items-center gap-4 ${method === 'delivery' ? 'border-ml-blue bg-blue-50/30' : 'border-stone-100 bg-white hover:border-stone-200'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${method === 'delivery' ? 'bg-ml-blue text-white' : 'bg-stone-100 text-stone-400'}`}>
                  <Truck className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className={`block font-bold ${method === 'delivery' ? 'text-ml-blue' : 'text-stone-700'}`}>Enviar a mi domicilio</span>
                  <span className="text-xs text-stone-400">Llega a Paracotos en 24-48h</span>
                </div>
              </button>
              <button 
                onClick={() => setMethod('pickup')}
                className={`w-full p-6 rounded-lg border-2 transition-all flex items-center gap-4 ${method === 'pickup' ? 'border-ml-blue bg-blue-50/30' : 'border-stone-100 bg-white hover:border-stone-200'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${method === 'pickup' ? 'bg-ml-blue text-white' : 'bg-stone-100 text-stone-400'}`}>
                  <Store className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className={`block font-bold ${method === 'pickup' ? 'text-ml-blue' : 'text-stone-700'}`}>Retiro en tienda</span>
                  <span className="text-xs text-stone-400">Gratis - Disponible hoy mismo</span>
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
                    className={`w-full p-4 rounded-lg border transition-all text-left flex items-center justify-between ${selectedTransport === t.id ? 'border-ml-blue bg-blue-50/20' : 'border-stone-100 bg-white hover:border-stone-200'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center text-stone-400">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-stone-900">{t.name}</p>
                        <p className="text-[10px] text-stone-400 uppercase">{t.vehicle_type}</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-stone-900">${t.base_price}</p>
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
                  className="w-full px-4 py-2 bg-white border border-stone-200 rounded text-sm focus:ring-1 focus:ring-ml-blue outline-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1">Teléfono de contacto</label>
                  <input 
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-2 bg-white border border-stone-200 rounded text-sm focus:ring-1 focus:ring-ml-blue outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1">Dirección (Referencia)</label>
                  <input 
                    type="text"
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    className="w-full px-4 py-2 bg-white border border-stone-200 rounded text-sm focus:ring-1 focus:ring-ml-blue outline-none"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded shadow-sm border border-stone-100 sticky top-32">
            <h3 className="text-lg font-bold mb-6 text-stone-900">Resumen de compra</h3>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm text-stone-600">
                <span>Productos ({cart.length})</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-stone-600">
                <span>Envío</span>
                <span className={method === 'pickup' ? 'text-emerald-600 font-bold' : ''}>
                  {method === 'pickup' ? 'Gratis' : `$${deliveryFee.toFixed(2)}`}
                </span>
              </div>
              <div className="pt-4 border-t border-stone-100 flex justify-between">
                <span className="text-lg font-bold text-stone-900">Total</span>
                <span className="text-lg font-bold text-stone-900">${(total + deliveryFee).toFixed(2)}</span>
              </div>
            </div>
            <button 
              onClick={handleConfirmOrder}
              disabled={submitting}
              className="w-full py-3 bg-ml-blue text-white rounded font-bold hover:bg-blue-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar compra'}
            </button>
            <div className="mt-6 p-4 bg-stone-50 rounded flex gap-3">
              <ShieldCheck className="w-5 h-5 text-stone-400 flex-shrink-0" />
              <p className="text-[10px] text-stone-500 leading-tight">
                Tu compra está protegida. Si no recibes lo que esperabas, te devolvemos el dinero.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
