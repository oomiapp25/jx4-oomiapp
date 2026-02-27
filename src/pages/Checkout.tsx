import { useState, useEffect } from 'react';
import { supabase, Transport } from '../lib/supabase';
import { Truck, Store, CheckCircle2, MapPin, Phone, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function Checkout() {
  const [method, setMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [transports, setTransports] = useState<Transport[]>([]);
  const [selectedTransport, setSelectedTransport] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransports();
  }, []);

  async function fetchTransports() {
    const { data } = await supabase.from('transports').select('*').eq('has_papers', true);
    if (data) setTransports(data);
    setLoading(false);
  }

  return (
    <div className="max-w-4xl mx-auto py-12">
      <h1 className="text-4xl font-black text-stone-900 mb-12 tracking-tighter">Finalizar Compra</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* Method Selection */}
          <section>
            <h2 className="text-xs font-black text-stone-400 uppercase tracking-[0.2em] mb-6">1. Método de Entrega</h2>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setMethod('delivery')}
                className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-4 ${method === 'delivery' ? 'border-emerald-600 bg-emerald-50' : 'border-stone-100 bg-white hover:border-stone-200'}`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${method === 'delivery' ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-400'}`}>
                  <Truck className="w-6 h-6" />
                </div>
                <span className={`font-bold ${method === 'delivery' ? 'text-emerald-900' : 'text-stone-500'}`}>Delivery</span>
              </button>
              <button 
                onClick={() => setMethod('pickup')}
                className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-4 ${method === 'pickup' ? 'border-emerald-600 bg-emerald-50' : 'border-stone-100 bg-white hover:border-stone-200'}`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${method === 'pickup' ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-400'}`}>
                  <Store className="w-6 h-6" />
                </div>
                <span className={`font-bold ${method === 'pickup' ? 'text-emerald-900' : 'text-stone-500'}`}>Retiro en Tienda</span>
              </button>
            </div>
          </section>

          {/* Transport Selection */}
          {method === 'delivery' && (
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-xs font-black text-stone-400 uppercase tracking-[0.2em] mb-6">2. Seleccionar Transportista</h2>
              <div className="space-y-4">
                {transports.map((t) => (
                  <button 
                    key={t.id}
                    onClick={() => setSelectedTransport(t.id)}
                    className={`w-full p-6 rounded-3xl border-2 transition-all text-left flex items-center justify-between ${selectedTransport === t.id ? 'border-emerald-600 bg-emerald-50' : 'border-stone-100 bg-white hover:border-stone-200'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center text-stone-400">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-stone-900">{t.name}</p>
                        <div className="flex items-center gap-2 text-xs text-stone-400 mt-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-500" />
                          <span>Papeles en regla</span>
                          <span className="opacity-50">•</span>
                          <span>{t.vehicle_type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-stone-900">${t.base_price}</p>
                      <p className="text-[10px] font-bold text-stone-400 uppercase">Tarifa</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.section>
          )}

          {/* Address Info */}
          <section>
            <h2 className="text-xs font-black text-stone-400 uppercase tracking-[0.2em] mb-6">3. Datos de Envío</h2>
            <div className="bg-white p-8 rounded-3xl border border-stone-100 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 px-1">Dirección Exacta</label>
                <textarea 
                  rows={3}
                  className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                  placeholder="Ej: Calle principal, casa #45, frente a la plaza..."
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 px-1">Teléfono</label>
                  <input 
                    type="tel"
                    className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="+58 412..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 px-1">Nombre Receptor</label>
                  <input 
                    type="text"
                    className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Nombre completo"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-stone-900 text-white p-8 rounded-[2.5rem] sticky top-32 shadow-2xl">
            <h3 className="text-lg font-black mb-8 tracking-tight">Resumen</h3>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm text-stone-400">
                <span>Subtotal</span>
                <span className="text-white font-bold">$120.00</span>
              </div>
              <div className="flex justify-between text-sm text-stone-400">
                <span>Envío</span>
                <span className="text-white font-bold">{method === 'pickup' ? 'Gratis' : '$5.00'}</span>
              </div>
              <div className="pt-4 border-t border-white/10 flex justify-between">
                <span className="font-bold">Total</span>
                <span className="text-2xl font-black text-emerald-400">$125.00</span>
              </div>
            </div>
            <button className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-500 transition-all active:scale-95 flex items-center justify-center gap-3">
              Confirmar Pedido
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[10px] text-stone-500 text-center mt-6 italic">
              Al confirmar, un asesor te contactará por WhatsApp para coordinar el pago.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
