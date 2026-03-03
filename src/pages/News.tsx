import { useState, useEffect } from 'react';
import { supabase, News } from '../lib/supabase';
import { Newspaper, Calendar, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  async function fetchNews() {
    const { data } = await supabase
      .from('news')
      .select('*')
      .eq('active', true)
      .order('published_at', { ascending: false });
    
    if (data) setNews(data);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-pulse text-stone-400 font-bold uppercase tracking-widest">Cargando noticias...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-black text-ml-monte-verde tracking-tighter uppercase">Noticias y Avisos</h1>
        <p className="text-ml-hierro text-sm mt-1">Mantente informado sobre lo que sucede en Paracotos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {news.length > 0 ? news.map((item) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl border border-ml-white-cal overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col"
          >
            {item.image_url && (
              <div className="aspect-video overflow-hidden cursor-pointer" onClick={() => setSelectedNews(item)}>
                <img 
                  src={item.image_url} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center gap-2 text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3">
                <Calendar className="w-3 h-3" />
                {new Date(item.published_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              <h3 className="text-xl font-black text-ml-monte-verde tracking-tight mb-3 line-clamp-2 cursor-pointer hover:text-ml-teja transition-colors" onClick={() => setSelectedNews(item)}>{item.title}</h3>
              <p className="text-sm text-ml-hierro line-clamp-3 mb-6 flex-grow">{item.excerpt}</p>
              
              <div className="pt-6 border-t border-stone-50">
                <button 
                  onClick={() => setSelectedNews(item)}
                  className="flex items-center gap-2 text-xs font-black text-ml-teja uppercase tracking-widest hover:gap-3 transition-all"
                >
                  Leer más
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )) : (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-stone-200">
            < Newspaper className="w-12 h-12 text-stone-200 mx-auto mb-4" />
            <p className="text-stone-400 font-medium">No hay noticias publicadas en este momento.</p>
          </div>
        )}
      </div>

      {/* News Detail Modal */}
      <AnimatePresence>
        {selectedNews && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNews(null)}
              className="absolute inset-0 bg-ml-monte-verde/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <button 
                onClick={() => setSelectedNews(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-md rounded-full text-ml-monte-verde hover:bg-white transition-all shadow-lg"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="overflow-y-auto">
                {selectedNews.image_url && (
                  <div className="w-full aspect-video md:aspect-[21/9]">
                    <img 
                      src={selectedNews.image_url} 
                      alt={selectedNews.title} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                <div className="p-6 md:p-12">
                  <div className="flex items-center gap-2 text-xs font-black text-stone-400 uppercase tracking-widest mb-6">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedNews.published_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-ml-monte-verde tracking-tighter uppercase mb-8 leading-none">
                    {selectedNews.title}
                  </h2>
                  <div className="prose prose-stone max-w-none">
                    <p className="text-lg text-ml-hierro leading-relaxed whitespace-pre-wrap">
                      {selectedNews.content}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
