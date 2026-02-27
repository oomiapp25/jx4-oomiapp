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
    <div className="max-w-5xl mx-auto py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-stone-900 tracking-tighter mb-4">Transporte Público</h1>
        <p className="text-stone-500">Consulta rutas, horarios y estados de las líneas que conectan a Paracotos.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {lines.length > 0 ? lines.map((line) => (
          <div key={line.id} className="bg-white p-8 rounded-[2rem] border border-stone-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <Bus className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-stone-900">{line.name}</h3>
                <div className="flex items-center gap-3 text-sm text-stone-400 mt-1 font-medium">
                  <MapPin className="w-4 h-4" />
                  <span>{line.origin}</span>
                  <span className="text-stone-300">→</span>
                  <span>{line.destination}</span>
                </div>
              </div>
            </div>

            <div className="flex-grow max-w-md">
              <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50">
                <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">
                  <Info className="w-3.5 h-3.5" />
                  Estado de la vía / Noticias
                </div>
                <p className="text-sm text-emerald-900 font-bold">{line.news_update || 'Operando con normalidad'}</p>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Pasaje</p>
                <p className="text-2xl font-black text-stone-900">${line.price}</p>
              </div>
              <a 
                href={`https://wa.me/${line.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="w-12 h-12 bg-stone-900 text-white rounded-xl flex items-center justify-center hover:bg-emerald-600 transition-all hover:scale-110"
              >
                <Phone className="w-5 h-5" />
              </a>
            </div>
          </div>
        )) : (
          <div className="py-20 text-center bg-white rounded-[2rem] border border-dashed border-stone-200">
            <Bus className="w-12 h-12 text-stone-200 mx-auto mb-4" />
            <p className="text-stone-400 font-medium">No hay líneas de transporte registradas actualmente.</p>
          </div>
        )}
      </div>
    </div>
  );
}
