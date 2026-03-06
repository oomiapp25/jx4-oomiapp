import React, { useState, useEffect } from 'react';
import { supabase, CommunityEntry, CommunitySpace } from '../lib/supabase';
import { Trophy, Theater, Calendar, MapPin, Phone, Search, Filter, ChevronRight, Info, ExternalLink, Loader2, X, Home, Newspaper } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Community() {
  const [entries, setEntries] = useState<CommunityEntry[]>([]);
  const [spaces, setSpaces] = useState<CommunitySpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeArea, setActiveArea] = useState<'all' | 'sports' | 'culture'>('all');
  const [activeTab, setActiveTab] = useState<'news' | 'calendar' | 'directory'>('news');
  const [selectedEntry, setSelectedEntry] = useState<CommunityEntry | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [entriesRes, spacesRes] = await Promise.all([
        supabase.from('community_entries').select('*').eq('active', true).order('created_at', { ascending: false }),
        supabase.from('community_spaces').select('*').eq('active', true).order('name')
      ]);

      if (entriesRes.data) setEntries(entriesRes.data);
      if (spacesRes.data) setSpaces(spacesRes.data);
    } catch (error) {
      console.error('Error fetching community data:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredEntries = entries.filter(e => activeArea === 'all' || e.area === activeArea);
  const filteredSpaces = spaces.filter(s => activeArea === 'all' || s.area === activeArea);

  const newsEntries = filteredEntries.filter(e => e.type === 'news');
  const calendarEntries = filteredEntries.filter(e => e.type === 'event').sort((a, b) => {
    if (!a.event_date) return 1;
    if (!b.event_date) return -1;
    return new Date(a.event_date).getTime() - new Date(b.event_date).getTime();
  });

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* Hero Section */}
      <div className="bg-ml-monte-verde text-white py-6 sm:py-10 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-64 h-64 bg-ml-quebrada rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-ml-quebrada rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-xl sm:text-5xl md:text-6xl font-black mb-1 tracking-tight leading-none px-4 whitespace-nowrap overflow-hidden text-ellipsis">
            Comunidad <span className="text-ml-quebrada">Paracoteña</span>
          </h1>
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeArea}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-ml-quebrada font-bold text-[10px] uppercase tracking-widest mb-2"
            >
              {activeArea === 'all' && <Home className="w-3.5 h-3.5" />}
              {activeArea === 'sports' && <Trophy className="w-3.5 h-3.5" />}
              {activeArea === 'culture' && <Theater className="w-3.5 h-3.5" />}
              {activeArea === 'all' ? 'Todo' : activeArea === 'sports' ? 'Deporte' : 'Cultura'}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-20">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-3xl shadow-xl border border-stone-100 p-2 grid grid-cols-3 gap-2 mb-8">
          <button 
            onClick={() => setActiveArea('all')}
            className={`py-3 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${activeArea === 'all' ? 'bg-ml-monte-verde text-white' : 'text-stone-400 hover:bg-stone-50'}`}
          >
            <Home className="w-5 h-5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline text-[10px] sm:text-xs">Todo</span>
          </button>
          <button 
            onClick={() => setActiveArea('sports')}
            className={`py-3 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${activeArea === 'sports' ? 'bg-ml-monte-verde text-white' : 'text-stone-400 hover:bg-stone-50'}`}
          >
            <Trophy className="w-5 h-5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline text-[10px] sm:text-xs">Deporte</span>
          </button>
          <button 
            onClick={() => setActiveArea('culture')}
            className={`py-3 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${activeArea === 'culture' ? 'bg-ml-monte-verde text-white' : 'text-stone-400 hover:bg-stone-50'}`}
          >
            <Theater className="w-5 h-5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline text-[10px] sm:text-xs">Cultura</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
              <div className="p-4 bg-stone-50 border-b border-stone-100 hidden sm:block">
                <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Secciones</h3>
              </div>
              <div className="p-2 flex sm:flex-col gap-1 overflow-x-auto no-scrollbar">
                <button 
                  onClick={() => setActiveTab('news')}
                  className={`flex-shrink-0 sm:w-full flex items-center justify-between p-3 sm:p-4 rounded-2xl transition-all ${activeTab === 'news' ? 'bg-ml-monte-verde text-white' : 'text-stone-600 hover:bg-stone-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <Newspaper className="w-5 h-5 sm:w-4 sm:h-4" />
                    <span className="font-bold text-xs sm:text-sm">Noticias</span>
                  </div>
                  <ChevronRight className="hidden sm:block w-4 h-4" />
                </button>
                <button 
                  onClick={() => setActiveTab('calendar')}
                  className={`flex-shrink-0 sm:w-full flex items-center justify-between p-3 sm:p-4 rounded-2xl transition-all ${activeTab === 'calendar' ? 'bg-ml-monte-verde text-white' : 'text-stone-600 hover:bg-stone-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 sm:w-4 sm:h-4" />
                    <span className="font-bold text-xs sm:text-sm">Agenda</span>
                  </div>
                  <ChevronRight className="hidden sm:block w-4 h-4" />
                </button>
                <button 
                  onClick={() => setActiveTab('directory')}
                  className={`flex-shrink-0 sm:w-full flex items-center justify-between p-3 sm:p-4 rounded-2xl transition-all ${activeTab === 'directory' ? 'bg-ml-monte-verde text-white' : 'text-stone-600 hover:bg-stone-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 sm:w-4 sm:h-4" />
                    <span className="font-bold text-xs sm:text-sm">Directorio</span>
                  </div>
                  <ChevronRight className="hidden sm:block w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-ml-quebrada/20 p-6 rounded-3xl border border-ml-quebrada/30">
              <h3 className="text-sm font-black text-ml-monte-verde uppercase tracking-widest mb-3">¿Quieres publicar?</h3>
              <p className="text-xs text-ml-monte-verde/70 leading-relaxed mb-4">
                Si eres organizador de eventos deportivos o culturales, contáctanos para difundir tu actividad.
              </p>
              <a 
                href="https://wa.me/584242384014" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs font-black text-ml-monte-verde hover:underline"
              >
                Contactar <ChevronRight className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-stone-100">
                <Loader2 className="w-10 h-10 animate-spin text-ml-monte-verde mb-4" />
                <p className="text-stone-400 font-bold uppercase tracking-widest text-xs">Cargando comunidad...</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {activeTab === 'news' && (
                  <motion.div 
                    key="news"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    {newsEntries.length > 0 ? newsEntries.map((entry) => (
                      <div 
                        key={entry.id} 
                        onClick={() => setSelectedEntry(entry)}
                        className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden group hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="aspect-video relative overflow-hidden">
                          {entry.image_url ? (
                            <img src={entry.image_url} alt={entry.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full bg-stone-100 flex items-center justify-center">
                              {entry.area === 'sports' ? <Trophy className="w-12 h-12 text-stone-200" /> : <Theater className="w-12 h-12 text-stone-200" />}
                            </div>
                          )}
                          <div className="absolute top-4 left-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${entry.area === 'sports' ? 'bg-ml-monte-verde text-white' : 'bg-ml-quebrada text-ml-monte-verde'}`}>
                              {entry.area === 'sports' ? 'Deporte' : 'Cultura'}
                            </span>
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="flex items-center gap-2 text-[10px] text-stone-400 font-bold uppercase tracking-widest mb-2">
                            <Calendar className="w-3 h-3" />
                            {new Date(entry.created_at).toLocaleDateString()}
                            {entry.category && (
                              <>
                                <span className="w-1 h-1 bg-stone-200 rounded-full" />
                                {entry.category}
                              </>
                            )}
                          </div>
                          <h3 className="text-xl font-black text-stone-900 mb-3 leading-tight group-hover:text-ml-monte-verde transition-colors">{entry.title}</h3>
                          <p className="text-sm text-stone-500 line-clamp-3 leading-relaxed">{entry.content}</p>
                          <div className="mt-4 pt-4 border-t border-stone-50 flex items-center gap-2 text-[10px] font-black text-ml-monte-verde uppercase tracking-widest">
                            Leer más <ChevronRight className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-stone-100">
                        <Info className="w-12 h-12 mx-auto mb-4 text-stone-200" />
                        <p className="text-stone-400 font-bold uppercase tracking-widest text-xs">No hay noticias publicadas</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'calendar' && (
                  <motion.div 
                    key="calendar"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    {calendarEntries.length > 0 ? calendarEntries.map((event) => (
                      <div 
                        key={event.id} 
                        onClick={() => setSelectedEntry(event)}
                        className="bg-white rounded-3xl shadow-sm border border-stone-100 p-6 flex flex-col md:flex-row gap-6 items-center cursor-pointer hover:shadow-md transition-all group"
                      >
                        <div className="flex-shrink-0 w-24 h-24 bg-stone-50 rounded-2xl flex flex-col items-center justify-center border border-stone-100 group-hover:bg-ml-monte-verde group-hover:border-ml-monte-verde transition-colors">
                          <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest group-hover:text-white/70">
                            {event.event_date ? new Date(event.event_date).toLocaleString('es-ES', { month: 'short' }) : '---'}
                          </span>
                          <span className="text-3xl font-black text-stone-900 group-hover:text-white">
                            {event.event_date ? new Date(event.event_date).getDate() : '--'}
                          </span>
                        </div>
                        <div className="flex-grow text-center md:text-left">
                          <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-2">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${event.area === 'sports' ? 'bg-ml-monte-verde text-white' : 'bg-ml-quebrada text-ml-monte-verde'}`}>
                              {event.area === 'sports' ? 'Deporte' : 'Cultura'}
                            </span>
                            {event.category && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-stone-100 text-stone-500">
                                {event.category}
                              </span>
                            )}
                          </div>
                          <h3 className="text-xl font-black text-stone-900 mb-2 group-hover:text-ml-monte-verde transition-colors">{event.title}</h3>
                          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs text-stone-500 font-medium">
                            {event.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {event.location}
                              </div>
                            )}
                            {event.event_date && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(event.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                          <a 
                            href={`https://wa.me/584242384014?text=${encodeURIComponent(`Hola, me interesa el evento: ${event.title}`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-6 py-3 bg-stone-900 text-white rounded-2xl font-bold text-sm hover:bg-stone-800 transition-all flex items-center gap-2"
                          >
                            Más Info
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    )) : (
                      <div className="py-20 text-center bg-white rounded-3xl border border-stone-100">
                        <Calendar className="w-12 h-12 mx-auto mb-4 text-stone-200" />
                        <p className="text-stone-400 font-bold uppercase tracking-widest text-xs">No hay eventos programados</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'directory' && (
                  <motion.div 
                    key="directory"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    {filteredSpaces.length > 0 ? filteredSpaces.map((space) => (
                      <div key={space.id} className="bg-white rounded-3xl shadow-sm border border-stone-100 p-6 flex gap-4">
                        <div className="w-20 h-20 bg-stone-50 rounded-2xl border border-stone-100 flex-shrink-0 overflow-hidden">
                          {space.image_url ? (
                            <img src={space.image_url} alt={space.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <MapPin className="w-8 h-8 text-stone-200" />
                            </div>
                          )}
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-black text-stone-900 mb-1">{space.name}</h3>
                          <p className="text-xs text-stone-500 mb-3 line-clamp-2">{space.description}</p>
                          <div className="space-y-1">
                            {space.location && (
                              <div className="flex items-center gap-2 text-[10px] text-stone-400 font-bold">
                                <MapPin className="w-3 h-3" />
                                {space.location}
                              </div>
                            )}
                            {space.contact_info && (
                              <div className="flex items-center gap-2 text-[10px] text-stone-400 font-bold">
                                <Phone className="w-3 h-3" />
                                {space.contact_info}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-stone-100">
                        <MapPin className="w-12 h-12 mx-auto mb-4 text-stone-200" />
                        <p className="text-stone-400 font-bold uppercase tracking-widest text-xs">No hay espacios registrados</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-20 text-center">
        <p className="text-sm sm:text-base text-stone-400 max-w-2xl mx-auto leading-relaxed italic">
          El espacio donde celebramos el talento, la disciplina y las tradiciones de nuestra parroquia. Mantente al día con los eventos y movimientos locales.
        </p>
      </div>

      {/* Entry Detail Modal */}
      <AnimatePresence>
        {selectedEntry && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEntry(null)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-3xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <button 
                onClick={() => setSelectedEntry(null)}
                className="absolute top-6 right-6 z-10 p-2 bg-white/80 backdrop-blur-md rounded-full text-stone-900 hover:bg-white transition-all shadow-lg"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="overflow-y-auto">
                {selectedEntry.image_url && (
                  <div className="w-full aspect-video">
                    <img 
                      src={selectedEntry.image_url} 
                      alt={selectedEntry.title} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                <div className="p-8 md:p-12">
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedEntry.area === 'sports' ? 'bg-ml-monte-verde text-white' : 'bg-ml-quebrada text-ml-monte-verde'}`}>
                      {selectedEntry.area === 'sports' ? 'Deporte' : 'Cultura'}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                      <Calendar className="w-3 h-3" />
                      {new Date(selectedEntry.created_at).toLocaleDateString()}
                    </div>
                    {selectedEntry.category && (
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-stone-100 text-stone-500">
                        {selectedEntry.category}
                      </span>
                    )}
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-black text-stone-900 tracking-tight mb-8 leading-tight">
                    {selectedEntry.title}
                  </h2>
                  
                  <div className="prose prose-stone max-w-none">
                    <p className="text-lg text-stone-600 leading-relaxed whitespace-pre-wrap">
                      {selectedEntry.content}
                    </p>
                  </div>

                  {(selectedEntry.location || selectedEntry.contact_info) && (
                    <div className="mt-12 pt-8 border-t border-stone-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                      {selectedEntry.location && (
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-stone-50 rounded-xl flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-5 h-5 text-ml-monte-verde" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Ubicación</p>
                            <p className="text-sm font-bold text-stone-900">{selectedEntry.location}</p>
                          </div>
                        </div>
                      )}
                      {selectedEntry.contact_info && (
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-stone-50 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Phone className="w-5 h-5 text-ml-monte-verde" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Contacto</p>
                            <p className="text-sm font-bold text-stone-900">{selectedEntry.contact_info}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
