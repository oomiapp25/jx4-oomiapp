import { useState, useEffect } from 'react';
import { supabase, TransportLine } from '../lib/supabase';
import { Bus, MapPin, Clock, Phone, Info } from 'lucide-react';

export default function TransportLines() {
  const [lines, setLines] = useState<TransportLine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLines();
  }, []);

  async function fetchLines() {
    const { data } = await supabase.from('transport_lines').select('*').eq('active', true);
    if (data) setLines(data);
    setLoading(false);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-stone-900 mb-2">Transporte Público</h1>
        <p className="text-stone-500">Consulta rutas, horarios y estados de las líneas que conectan a Paracotos.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {lines.length > 0 ? lines.map((line) => (
          <div key={line.id} className="bg-white p-6 rounded shadow-sm border border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-ml-blue">
                <Bus className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900">{line.name}</h3>
                <div className="flex items-center gap-2 text-sm text-stone-500 mt-1">
                  <MapPin className="w-4 h-4" />
                  <span>{line.origin}</span>
                  <span className="text-stone-300">→</span>
                  <span>{line.destination}</span>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-stone-400">
                    <Clock className="w-3.5 h-3.5" />
                    Salida: <span className="text-stone-700 font-medium">{line.departure_time || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-stone-400">
                    <Clock className="w-3.5 h-3.5" />
                    Llegada: <span className="text-stone-700 font-medium">{line.arrival_time || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-grow max-w-md">
              <div className="bg-stone-50 p-4 rounded border border-stone-100">
                <div className="flex items-center gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                  <Info className="w-3.5 h-3.5" />
                  Estado / Noticias
                </div>
                <p className="text-sm text-stone-700 font-medium">{line.news_update || 'Operando con normalidad'}</p>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Pasaje</p>
                <p className="text-2xl font-bold text-stone-900">${line.price}</p>
              </div>
              <a 
                href={`https://wa.me/${line.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="w-12 h-12 bg-ml-blue text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-all shadow-sm"
              >
                <Phone className="w-5 h-5" />
              </a>
            </div>
          </div>
        )) : (
          <div className="py-20 text-center bg-white rounded shadow-sm border border-stone-100">
            <Bus className="w-12 h-12 text-stone-200 mx-auto mb-4" />
            <p className="text-stone-400 font-medium">No hay líneas de transporte registradas actualmente.</p>
          </div>
        )}
      </div>
    </div>
  );
}
