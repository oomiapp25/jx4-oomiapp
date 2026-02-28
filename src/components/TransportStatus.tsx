import { useState, useEffect } from 'react';
import { supabase, TransportLine } from '../lib/supabase';
import { Bus, Clock, MapPin, Info, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function TransportStatus() {
  const [lines, setLines] = useState<TransportLine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLines();
  }, []);

  async function fetchLines() {
    const { data } = await supabase
      .from('transport_lines')
      .select('*')
      .eq('active', true)
      .order('name');
    
    if (data) setLines(data);
    setLoading(false);
  }

  if (loading || lines.length === 0) return null;

  return (
    <div className="bg-white rounded shadow-sm border border-stone-100 p-8 overflow-hidden relative">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3 text-stone-900">
              <Bus className="w-6 h-6 text-ml-blue" />
              Estado del Transporte Público
            </h2>
            <p className="text-stone-500 text-sm mt-1">Horarios y noticias en tiempo real</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-blue-50 rounded-full border border-blue-100 text-[10px] font-bold uppercase tracking-widest text-ml-blue">
            <span className="w-2 h-2 bg-ml-blue rounded-full animate-pulse" />
            En Vivo
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lines.map((line) => (
            <motion.div 
              key={line.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-stone-50 border border-stone-100 rounded-lg p-5 hover:bg-white hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-stone-900">{line.name}</h3>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">Pasaje</span>
                  <span className="text-sm font-bold text-stone-900">${line.price}</span>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-3 text-xs text-stone-600">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  <div className="flex items-center gap-2">
                    <span>{line.origin}</span>
                    <ArrowRight className="w-3 h-3 text-stone-300" />
                    <span>{line.destination}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-stone-400">
                    <Clock className="w-3.5 h-3.5" />
                    Salida: <span className="text-stone-700 font-medium">{line.departure_time || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-stone-400">
                    <Clock className="w-3.5 h-3.5" />
                    Llegada: <span className="text-stone-700 font-medium">{line.arrival_time || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-stone-100 rounded p-3">
                <div className="flex items-center gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">
                  <Info className="w-3 h-3" />
                  Estado Actual
                </div>
                <p className="text-xs text-stone-600 line-clamp-2 italic">
                  "{line.news_update || 'Operando con normalidad'}"
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
