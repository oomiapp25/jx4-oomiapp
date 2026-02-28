import { useState, useEffect, FormEvent } from 'react';
import { supabase, Transport, TransportLine } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Truck, ShieldCheck, Phone, MapPin, Bus, Info, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminTransports() {
  const [transports, setTransports] = useState<Transport[]>([]);
  const [transportLines, setTransportLines] = useState<TransportLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'delivery' | 'public'>('delivery');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const [deliveryForm, setDeliveryForm] = useState({
    name: '',
    carrier_info: '',
    base_price: '',
    has_papers: false,
    vehicle_type: '',
    whatsapp: ''
  });

  const [lineForm, setLineForm] = useState({
    name: '',
    origin: '',
    destination: '',
    schedule: '',
    departure_time: '',
    arrival_time: '',
    price: '',
    news_update: '',
    whatsapp: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (editingItem) {
      if (activeTab === 'delivery') {
        setDeliveryForm({
          name: editingItem.name,
          carrier_info: editingItem.carrier_info || '',
          base_price: editingItem.base_price.toString(),
          has_papers: editingItem.has_papers,
          vehicle_type: editingItem.vehicle_type || '',
          whatsapp: editingItem.whatsapp || ''
        });
      } else {
        setLineForm({
          name: editingItem.name,
          origin: editingItem.origin,
          destination: editingItem.destination,
          schedule: editingItem.schedule || '',
          departure_time: editingItem.departure_time || '',
          arrival_time: editingItem.arrival_time || '',
          price: editingItem.price.toString(),
          news_update: editingItem.news_update || '',
          whatsapp: editingItem.whatsapp || ''
        });
      }
    } else {
      resetForms();
    }
  }, [editingItem, activeTab]);

  function resetForms() {
    setDeliveryForm({ name: '', carrier_info: '', base_price: '', has_papers: false, vehicle_type: '', whatsapp: '' });
    setLineForm({ name: '', origin: '', destination: '', schedule: '', departure_time: '', arrival_time: '', price: '', news_update: '', whatsapp: '' });
  }

  async function fetchData() {
    const { data: tData } = await supabase.from('transports').select('*');
    const { data: lData } = await supabase.from('transport_lines').select('*');
    if (tData) setTransports(tData);
    if (lData) setTransportLines(lData);
    setLoading(false);
  }

  async function handleDelete(id: string, table: string) {
    if (!confirm('¿Estás seguro?')) return;
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) alert('Error: ' + error.message);
    else fetchData();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const table = activeTab === 'delivery' ? 'transports' : 'transport_lines';
    const data = activeTab === 'delivery' ? {
      ...deliveryForm,
      base_price: parseFloat(deliveryForm.base_price)
    } : {
      ...lineForm,
      price: parseFloat(lineForm.price)
    };

    let error;
    if (editingItem) {
      const { error: updateError } = await supabase.from(table).update(data).eq('id', editingItem.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from(table).insert(data);
      error = insertError;
    }

    if (error) {
      alert('Error: ' + error.message);
    } else {
      setIsModalOpen(false);
      setEditingItem(null);
      resetForms();
      fetchData();
    }
    setSubmitting(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-stone-900">Gestión de Transporte</h1>
        <div className="flex bg-stone-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('delivery')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'delivery' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500'}`}
          >
            Delivery / Privado
          </button>
          <button 
            onClick={() => setActiveTab('public')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'public' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500'}`}
          >
            Líneas Públicas
          </button>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                <h3 className="text-lg font-black text-stone-900">
                  {editingItem ? 'Editar' : 'Añadir'} {activeTab === 'delivery' ? 'Transportista' : 'Línea'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-stone-50 rounded-full transition-colors">
                  <X className="w-5 h-5 text-stone-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {activeTab === 'delivery' ? (
                  <>
                    <div>
                      <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 px-1">Nombre / Empresa</label>
                      <input required type="text" value={deliveryForm.name} onChange={e => setDeliveryForm({...deliveryForm, name: e.target.value})} className="w-full px-4 py-2.5 bg-stone-50 border border-stone-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 px-1">Tipo de Vehículo</label>
                        <input type="text" value={deliveryForm.vehicle_type} onChange={e => setDeliveryForm({...deliveryForm, vehicle_type: e.target.value})} className="w-full px-4 py-2.5 bg-stone-50 border border-stone-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Ej. Moto, Camioneta" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 px-1">Tarifa Base ($)</label>
                        <input required type="number" step="0.01" value={deliveryForm.base_price} onChange={e => setDeliveryForm({...deliveryForm, base_price: e.target.value})} className="w-full px-4 py-2.5 bg-stone-50 border border-stone-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 px-1">WhatsApp</label>
                      <input type="text" value={deliveryForm.whatsapp} onChange={e => setDeliveryForm({...deliveryForm, whatsapp: e.target.value})} className="w-full px-4 py-2.5 bg-stone-50 border border-stone-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-stone-50 rounded-xl transition-colors">
                      <input type="checkbox" checked={deliveryForm.has_papers} onChange={e => setDeliveryForm({...deliveryForm, has_papers: e.target.checked})} className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500" />
                      <span className="text-sm font-bold text-stone-700">¿Papeles en regla?</span>
                    </label>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 px-1">Nombre de la Línea</label>
                      <input required type="text" value={lineForm.name} onChange={e => setLineForm({...lineForm, name: e.target.value})} className="w-full px-4 py-2.5 bg-stone-50 border border-stone-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 px-1">Origen</label>
                        <input required type="text" value={lineForm.origin} onChange={e => setLineForm({...lineForm, origin: e.target.value})} className="w-full px-4 py-2.5 bg-stone-50 border border-stone-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 px-1">Destino</label>
                        <input required type="text" value={lineForm.destination} onChange={e => setLineForm({...lineForm, destination: e.target.value})} className="w-full px-4 py-2.5 bg-stone-50 border border-stone-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 px-1">Pasaje ($)</label>
                        <input required type="number" step="0.01" value={lineForm.price} onChange={e => setLineForm({...lineForm, price: e.target.value})} className="w-full px-4 py-2.5 bg-stone-50 border border-stone-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 px-1">Horario General</label>
                        <input type="text" value={lineForm.schedule} onChange={e => setLineForm({...lineForm, schedule: e.target.value})} className="w-full px-4 py-2.5 bg-stone-50 border border-stone-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Ej. 6am - 8pm" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 px-1">Hora Salida</label>
                        <input type="text" value={lineForm.departure_time} onChange={e => setLineForm({...lineForm, departure_time: e.target.value})} className="w-full px-4 py-2.5 bg-stone-50 border border-stone-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Ej. 07:30 AM" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 px-1">Hora Llegada</label>
                        <input type="text" value={lineForm.arrival_time} onChange={e => setLineForm({...lineForm, arrival_time: e.target.value})} className="w-full px-4 py-2.5 bg-stone-50 border border-stone-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Ej. 08:45 AM" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 px-1">Noticia / Estado Actual</label>
                      <textarea value={lineForm.news_update} onChange={e => setLineForm({...lineForm, news_update: e.target.value})} className="w-full px-4 py-2.5 bg-stone-50 border border-stone-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none" rows={3} placeholder="Ej. Trabajando con normalidad..." />
                    </div>
                  </>
                )}

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-stone-200 rounded-xl text-sm font-bold text-stone-600">Cancelar</button>
                  <button type="submit" disabled={submitting} className="flex-1 py-3 bg-stone-900 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {submitting ? 'Guardando...' : (editingItem ? 'Guardar' : 'Crear')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {activeTab === 'delivery' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {transports.map((t) => (
            <div key={t.id} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm group">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-stone-50 rounded-xl flex items-center justify-center text-stone-400">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900">{t.name}</h3>
                    <p className="text-xs text-stone-400">{t.vehicle_type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditingItem(t); setIsModalOpen(true); }} className="p-2 text-stone-400 hover:text-stone-900"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(t.id, 'transports')} className="p-2 text-stone-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <ShieldCheck className={`w-4 h-4 ${t.has_papers ? 'text-emerald-500' : 'text-amber-500'}`} />
                  <span className="text-stone-600">Papeles en regla: {t.has_papers ? 'Sí' : 'No'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-stone-400" />
                  <span className="text-stone-600">{t.whatsapp}</span>
                </div>
                <div className="pt-4 border-t border-stone-50 flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Tarifa Base</span>
                  <span className="text-lg font-black text-stone-900">${t.base_price}</span>
                </div>
              </div>
            </div>
          ))}
          <button 
            onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
            className="aspect-[2/1] rounded-2xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center text-stone-400 hover:border-emerald-500 hover:text-emerald-600 transition-all"
          >
            <Plus className="w-8 h-8 mb-2" />
            <span className="text-sm font-bold">Añadir Transportista</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {transportLines.map((line) => (
            <div key={line.id} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                  <Bus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900">{line.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-stone-400 mt-1">
                    <MapPin className="w-3 h-3" />
                    <span>{line.origin}</span>
                    <span className="text-stone-300">→</span>
                    <span>{line.destination}</span>
                  </div>
                </div>
              </div>

              <div className="flex-grow max-w-md">
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                  <div className="flex items-center gap-2 text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">
                    <Info className="w-3 h-3" />
                    Última Noticia / Estado
                  </div>
                  <p className="text-xs text-stone-600 font-medium">{line.news_update || 'Sin novedades reportadas'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Pasaje</p>
                  <p className="text-lg font-black text-stone-900">${line.price}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <button onClick={() => { setEditingItem(line); setIsModalOpen(true); }} className="p-2 text-stone-400 hover:text-stone-900"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(line.id, 'transport_lines')} className="p-2 text-stone-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
          <button 
            onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
            className="py-8 rounded-2xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center text-stone-400 hover:border-emerald-500 hover:text-emerald-600 transition-all"
          >
            <Plus className="w-6 h-6 mb-2" />
            <span className="text-sm font-bold">Añadir Línea de Transporte</span>
          </button>
        </div>
      )}
    </div>
  );
}
