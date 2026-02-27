import { useState, useEffect } from 'react';
import { supabase, ServicePortfolio } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Wrench, User, Phone, Tag, ToggleLeft, ToggleRight } from 'lucide-react';

export default function AdminServices() {
  const [services, setServices] = useState<ServicePortfolio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    const { data } = await supabase.from('services_portfolio').select('*').order('created_at', { ascending: false });
    if (data) setServices(data);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-stone-900">Portafolio de Servicios</h1>
        <button className="bg-stone-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-600 transition-all active:scale-95">
          <Plus className="w-4 h-4" />
          Nuevo Servicio
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {services.map((service) => (
          <div key={service.id} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-stone-50 rounded-xl text-stone-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                <Wrench className="w-6 h-6" />
              </div>
              <button className={`p-2 rounded-full transition-colors ${service.active ? 'text-emerald-500' : 'text-stone-300'}`}>
                {service.active ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
              </button>
            </div>

            <h3 className="font-bold text-stone-900 mb-1">{service.title}</h3>
            <p className="text-xs text-stone-400 mb-4">{service.provider_name}</p>
            
            <div className="flex items-center gap-2 mb-6">
              <span className="px-2 py-1 bg-stone-100 text-[10px] font-bold text-stone-500 rounded-md uppercase tracking-wider">
                {service.category}
              </span>
            </div>

            <div className="pt-4 border-t border-stone-50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-stone-400">
                <Phone className="w-3 h-3" />
                <span>{service.whatsapp}</span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 text-stone-400 hover:text-stone-900"><Edit2 className="w-4 h-4" /></button>
                <button className="p-2 text-stone-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
