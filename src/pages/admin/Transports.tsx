import { useState, useEffect } from 'react';
import { supabase, Transport, TransportLine } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Truck, ShieldCheck, Phone, MapPin, Bus, Info } from 'lucide-react';

export default function AdminTransports() {
  const [transports, setTransports] = useState<Transport[]>([]);
  const [transportLines, setTransportLines] = useState<TransportLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'delivery' | 'public'>('delivery');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: tData } = await supabase.from('transports').select('*');
    const { data: lData } = await supabase.from('transport_lines').select('*');
    if (tData) setTransports(tData);
    if (lData) setTransportLines(lData);
    setLoading(false);
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
                  <button className="p-2 text-stone-400 hover:text-stone-900"><Edit2 className="w-4 h-4" /></button>
                  <button className="p-2 text-stone-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
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
          <button className="aspect-[2/1] rounded-2xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center text-stone-400 hover:border-emerald-500 hover:text-emerald-600 transition-all">
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
                  <button className="p-2 text-stone-400 hover:text-stone-900"><Edit2 className="w-4 h-4" /></button>
                  <button className="p-2 text-stone-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
          <button className="py-8 rounded-2xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center text-stone-400 hover:border-emerald-500 hover:text-emerald-600 transition-all">
            <Plus className="w-6 h-6 mb-2" />
            <span className="text-sm font-bold">Añadir Línea de Transporte</span>
          </button>
        </div>
      )}
    </div>
  );
}
