import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase, TransportLine, Transport } from '../lib/supabase';
import { Bus, MapPin, Clock, Phone, Info, Truck, ShieldCheck, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function TransportLines() {
  const [searchParams] = useSearchParams();
  const [lines, setLines] = useState<TransportLine[]>([]);
  const [transports, setTransports] = useState<Transport[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'public' | 'private'>(searchParams.get('tab') === 'private' ? 'private' : 'public');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const [linesRes, transportsRes] = await Promise.all([
      supabase.from('transport_lines').select('*').eq('active', true),
      supabase.from('transports').select('*')
    ]);
    
    if (linesRes.data) setLines(linesRes.data);
    if (transportsRes.data) setTransports(transportsRes.data);
    setLoading(false);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-ml-monte-verde tracking-tighter uppercase">Transporte y Delivery</h1>
          <p className="text-ml-hierro text-sm mt-1">Consulta rutas públicas y servicios de delivery privado en Paracotos.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-xl border border-ml-white-cal shadow-sm">
          <button 
            onClick={() => setActiveTab('public')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'public' ? 'bg-ml-monte-verde text-white shadow-md' : 'text-stone-400 hover:text-stone-600'}`}
          >
            Líneas Públicas
          </button>
          <button 
            onClick={() => setActiveTab('private')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'private' ? 'bg-ml-teja text-white shadow-md' : 'text-stone-400 hover:text-stone-600'}`}
          >
            Delivery Privado
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'public' ? (
          <motion.div 
            key="public"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 gap-4"
          >
            {lines.length > 0 ? lines.map((line) => (
              <div key={line.id} className="bg-white p-6 rounded-2xl shadow-sm border border-ml-white-cal flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-ml-quebrada transition-all group">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-ml-white-cal rounded-2xl flex items-center justify-center text-ml-hierro group-hover:bg-ml-monte-verde group-hover:text-white transition-colors">
                    <Bus className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-ml-monte-verde">{line.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-ml-quebrada mt-1">
                      <MapPin className="w-4 h-4" />
                      <span>{line.origin}</span>
                      <span className="text-ml-quebrada/30">→</span>
                      <span>{line.destination}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1.5 text-xs text-ml-quebrada/60">
                        <Clock className="w-3.5 h-3.5" />
                        Salida: <span className="text-ml-monte-verde font-medium">{line.departure_time || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-ml-quebrada/60">
                        <Clock className="w-3.5 h-3.5" />
                        Llegada: <span className="text-ml-monte-verde font-medium">{line.arrival_time || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-grow max-w-md">
                  <div className={`p-4 rounded-xl border ${
                    line.status === 'normal' ? 'bg-ml-white-cal border-ml-quebrada/10' :
                    line.status === 'alerta' || line.status === 'accidente' ? 'bg-red-50 border-red-200' :
                    'bg-amber-50 border-amber-200'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider">
                        <Info className={`w-3.5 h-3.5 ${
                          line.status === 'normal' ? 'text-ml-quebrada' :
                          line.status === 'alerta' || line.status === 'accidente' ? 'text-red-600' :
                          'text-amber-600'
                        }`} />
                        <span className={
                          line.status === 'normal' ? 'text-ml-quebrada' :
                          line.status === 'alerta' || line.status === 'accidente' ? 'text-red-600' :
                          'text-amber-600'
                        }>
                          {line.status === 'retraso' ? 'Retraso' :
                           line.status === 'cola' ? 'Cola en la vía' :
                           line.status === 'salida' ? 'Salida / Despacho' :
                           line.status === 'accidente' ? 'Accidente vial' :
                           line.status === 'alerta' ? 'Alerta' : 'Estado / Noticias'}
                        </span>
                      </div>
                    </div>
                    <p className={`text-sm font-medium ${
                      line.status === 'normal' ? 'text-ml-monte-verde' :
                      line.status === 'alerta' || line.status === 'accidente' ? 'text-red-700' :
                      'text-amber-700'
                    }`}>
                      {line.news_update || 'Operando con normalidad'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-ml-quebrada uppercase tracking-widest mb-1">Pasaje</p>
                    <p className="text-2xl font-bold text-ml-monte-verde">${line.price}</p>
                  </div>
                  <a 
                    href={`https://wa.me/${line.whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-12 h-12 bg-ml-teja text-white rounded-2xl flex items-center justify-center hover:bg-ml-teja/90 transition-all shadow-sm"
                  >
                    <Phone className="w-5 h-5" />
                  </a>
                </div>
              </div>
            )) : (
              <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-stone-200">
                <Bus className="w-12 h-12 text-stone-200 mx-auto mb-4" />
                <p className="text-stone-400 font-medium">No hay líneas de transporte registradas.</p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="private"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {transports.length > 0 ? transports.map((transport) => (
              <div key={transport.id} className="bg-white p-6 rounded-3xl shadow-sm border border-ml-white-cal hover:border-ml-teja transition-all group">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-ml-white-cal rounded-2xl flex items-center justify-center text-ml-hierro group-hover:bg-ml-teja group-hover:text-white transition-colors">
                      <Truck className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-ml-monte-verde tracking-tight">{transport.name}</h3>
                      <p className="text-xs text-ml-hierro font-medium uppercase tracking-widest">{transport.vehicle_type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Base desde</p>
                    <p className="text-2xl font-black text-ml-monte-verde">${transport.base_price}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-ml-hierro">
                    <Info className="w-4 h-4 text-ml-quebrada" />
                    <span>{transport.carrier_info}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    {transport.has_papers ? (
                      <div className="flex items-center gap-2 text-emerald-600 font-bold">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Documentación al día</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-amber-600 font-bold">
                        <Info className="w-4 h-4" />
                        <span>Papeles en trámite</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-stone-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-stone-400" />
                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Pago Móvil / Efectivo</span>
                  </div>
                  <a 
                    href={`https://wa.me/${transport.whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-md active:scale-95"
                  >
                    <Phone className="w-4 h-4" />
                    Contactar
                  </a>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-stone-200">
                <Truck className="w-12 h-12 text-stone-200 mx-auto mb-4" />
                <p className="text-stone-400 font-medium">No hay servicios de delivery registrados.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
