import { useState, useEffect } from 'react';
import { supabase, ServicePortfolio } from '../lib/supabase';
import { Wrench, User, Phone, Tag, Star, MessageSquare } from 'lucide-react';

export default function Services() {
  const [services, setServices] = useState<ServicePortfolio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    const { data } = await supabase.from('services_portfolio').select('*').eq('active', true);
    if (data) setServices(data);
    setLoading(false);
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-stone-900 tracking-tighter mb-4">Servicios Profesionales</h1>
        <p className="text-stone-500">Directorio de expertos y servicios técnicos en nuestra comunidad.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.length > 0 ? services.map((service) => (
          <div key={service.id} className="bg-white rounded-[2.5rem] border border-stone-100 shadow-sm overflow-hidden group hover:shadow-2xl transition-all">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 bg-stone-50 text-stone-400 rounded-2xl flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                  <Wrench className="w-7 h-7" />
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-xs font-black text-stone-900">4.9</span>
                </div>
              </div>

              <h3 className="text-xl font-black text-stone-900 mb-2">{service.title}</h3>
              <div className="flex items-center gap-2 text-sm text-stone-400 font-bold mb-4">
                <User className="w-4 h-4" />
                <span>{service.provider_name}</span>
              </div>

              <p className="text-stone-500 text-sm leading-relaxed mb-6 line-clamp-3">
                {service.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-8">
                <span className="px-3 py-1.5 bg-stone-100 text-[10px] font-black text-stone-500 rounded-lg uppercase tracking-widest">
                  {service.category}
                </span>
              </div>

              <a 
                href={`https://wa.me/${service.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-3 w-full py-4 bg-stone-900 text-white rounded-2xl font-black hover:bg-emerald-600 transition-all active:scale-95"
              >
                <MessageSquare className="w-5 h-5" />
                Contactar por WhatsApp
              </a>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border border-dashed border-stone-200">
            <Wrench className="w-12 h-12 text-stone-200 mx-auto mb-4" />
            <p className="text-stone-400 font-medium">No hay servicios registrados en este momento.</p>
          </div>
        )}
      </div>
    </div>
  );
}
