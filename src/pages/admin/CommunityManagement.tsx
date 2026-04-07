import React, { useState, useEffect } from 'react';
import { supabase, CommunityEntry, CommunitySpace } from '../../lib/supabase';
import { Trophy, Music, Calendar, MapPin, Phone, Plus, Trash2, Edit2, Search, Filter, X, Loader2, Camera, Upload, FileText, CheckCircle, Church, Palmtree, Play, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { uploadToImgBB } from '../../services/imgbbService';
import { fetchTikTokMetadata } from '../../services/tiktokService';

export default function CommunityManagement() {
  const [entries, setEntries] = useState<CommunityEntry[]>([]);
  const [spaces, setSpaces] = useState<CommunitySpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'entries' | 'spaces'>('entries');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'entry' | 'space'>('entry');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form states
  const [entryForm, setEntryForm] = useState({
    title: '',
    content: '',
    image_url: '',
    video_url: '',
    video_platform: 'youtube' as 'youtube' | 'tiktok',
    creator_name: '',
    area: 'sports' as 'sports' | 'culture' | 'religion' | 'tourism',
    type: 'news' as 'news' | 'event' | 'profile',
    category: '',
    event_date: '',
    location: '',
    contact_info: '',
    active: true
  });

  const [spaceForm, setSpaceForm] = useState({
    name: '',
    description: '',
    location: '',
    contact_info: '',
    image_url: '',
    video_url: '',
    video_platform: 'youtube' as 'youtube' | 'tiktok',
    creator_name: '',
    area: 'sports' as 'sports' | 'culture' | 'religion' | 'tourism',
    active: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [entriesRes, spacesRes] = await Promise.all([
        supabase.from('community_entries').select('*').order('created_at', { ascending: false }),
        supabase.from('community_spaces').select('*').order('name')
      ]);

      if (entriesRes.data) setEntries(entriesRes.data);
      if (spacesRes.data) setSpaces(spacesRes.data);
    } catch (error) {
      console.error('Error fetching community data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleTikTokFetch(url: string, type: 'entry' | 'space') {
    if (!url.includes('tiktok.com')) return;
    
    setUploading(true);
    try {
      const data = await fetchTikTokMetadata(url);
      if (data) {
        if (type === 'entry') {
          setEntryForm(prev => ({ 
            ...prev, 
            image_url: data.thumbnail_url,
            creator_name: data.author_name,
            title: prev.title || data.title,
            video_url: data.id // Store the ID for the player
          }));
        } else {
          setSpaceForm(prev => ({ 
            ...prev, 
            image_url: data.thumbnail_url,
            creator_name: data.author_name,
            name: prev.name || data.title,
            video_url: data.id // Store the ID for the player
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching TikTok data:', error);
    } finally {
      setUploading(false);
    }
  }
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, type: 'entry' | 'space') {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadToImgBB(file);
      if (type === 'entry') {
        setEntryForm({ ...entryForm, image_url: url });
      } else {
        setSpaceForm({ ...spaceForm, image_url: url });
      }
    } catch (error: any) {
      alert('Error al subir imagen: ' + error.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleEntrySubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const dataToInsert = {
        ...entryForm,
        event_date: entryForm.event_date || null
      };
      const { error } = await supabase.from('community_entries').insert([dataToInsert]);
      if (error) throw error;
      setIsModalOpen(false);
      setEntryForm({
        title: '',
        content: '',
        image_url: '',
        video_url: '',
        video_platform: 'youtube',
        creator_name: '',
        area: 'sports',
        type: 'news',
        category: '',
        event_date: '',
        location: '',
        contact_info: '',
        active: true
      });
      fetchData();
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSpaceSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase.from('community_spaces').insert([spaceForm]);
      if (error) throw error;
      setIsModalOpen(false);
      setSpaceForm({
        name: '',
        description: '',
        location: '',
        contact_info: '',
        image_url: '',
        video_url: '',
        video_platform: 'youtube',
        creator_name: '',
        area: 'sports',
        active: true
      });
      fetchData();
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleEntryActive(id: string, current: boolean) {
    try {
      const { error } = await supabase.from('community_entries').update({ active: !current }).eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  }

  async function deleteEntry(id: string) {
    if (!confirm('¿Estás seguro de eliminar esta entrada?')) return;
    try {
      const { error } = await supabase.from('community_entries').delete().eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-stone-900 uppercase tracking-tight">Gestión Comunitaria</h1>
          <p className="text-stone-500 text-sm">Administra noticias, eventos y espacios de Deporte, Cultura, Religión y Turismo</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => { setModalType('entry'); setIsModalOpen(true); }}
            className="px-6 py-3 bg-ml-monte-verde text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-ml-monte-verde/90 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nueva Entrada
          </button>
          <button 
            onClick={() => { setModalType('space'); setIsModalOpen(true); }}
            className="px-6 py-3 bg-stone-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-stone-800 transition-all flex items-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            Nuevo Espacio
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-stone-100">
        <button 
          onClick={() => setActiveTab('entries')}
          className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'entries' ? 'text-ml-monte-verde' : 'text-stone-400'}`}
        >
          Entradas (Noticias/Eventos)
          {activeTab === 'entries' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-ml-monte-verde rounded-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('spaces')}
          className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'spaces' ? 'text-ml-monte-verde' : 'text-stone-400'}`}
        >
          Directorio de Espacios
          {activeTab === 'spaces' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-ml-monte-verde rounded-full" />}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-ml-monte-verde" />
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100">
                <th className="px-6 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">Información</th>
                <th className="px-6 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">Área / Tipo</th>
                <th className="px-6 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">Estado</th>
                <th className="px-6 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {activeTab === 'entries' ? entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-stone-100 rounded-xl overflow-hidden flex-shrink-0">
                        {entry.image_url ? (
                          <img src={entry.image_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : entry.youtube_id ? (
                          <img 
                            src={`https://img.youtube.com/vi/${entry.youtube_id}/mqdefault.jpg`} 
                            alt="" 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FileText className="w-6 h-6 text-stone-300" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-stone-900">{entry.title}</p>
                        <p className="text-xs text-stone-400">{new Date(entry.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex w-fit px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        entry.area === 'sports' ? 'bg-ml-monte-verde text-white' : 
                        entry.area === 'culture' ? 'bg-ml-quebrada text-ml-monte-verde' : 
                        entry.area === 'religion' ? 'bg-ml-teja text-white' :
                        'bg-ml-monte-verde text-white'
                      }`}>
                        {entry.area === 'sports' ? 'Deporte' : entry.area === 'culture' ? 'Cultura' : entry.area === 'religion' ? 'Religión' : 'Turismo'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{entry.type}</span>
                        {entry.video_url && <Play className="w-3 h-3 text-ml-monte-verde" />}
                        {entry.video_platform === 'tiktok' && <Video className="w-3 h-3 text-stone-900" />}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleEntryActive(entry.id, entry.active)}
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${entry.active ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-400'}`}
                    >
                      {entry.active ? 'Activo' : 'Oculto'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => deleteEntry(entry.id)}
                      className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )) : spaces.map((space) => (
                <tr key={space.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-stone-100 rounded-xl overflow-hidden flex-shrink-0">
                        {space.image_url ? (
                          <img src={space.image_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : space.youtube_id ? (
                          <img 
                            src={`https://img.youtube.com/vi/${space.youtube_id}/mqdefault.jpg`} 
                            alt="" 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-stone-300" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-stone-900">{space.name}</p>
                        <p className="text-xs text-stone-400">{space.location}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        space.area === 'sports' ? 'bg-ml-monte-verde text-white' : 
                        space.area === 'culture' ? 'bg-ml-quebrada text-ml-monte-verde' : 
                        space.area === 'religion' ? 'bg-ml-teja text-white' :
                        'bg-ml-monte-verde text-white'
                      }`}>
                        {space.area === 'sports' ? 'Deporte' : space.area === 'culture' ? 'Cultura' : space.area === 'religion' ? 'Religión' : 'Turismo'}
                      </span>
                      {space.video_url && <Play className="w-3 h-3 text-ml-monte-verde" />}
                      {space.video_platform === 'tiktok' && <Video className="w-3 h-3 text-stone-900" />}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700">
                      Activo
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-stone-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                <h2 className="text-xl font-black text-stone-900 uppercase tracking-tight">
                  {modalType === 'entry' ? 'Nueva Entrada Comunitaria' : 'Nuevo Espacio / Directorio'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-stone-50 rounded-full transition-colors">
                  <X className="w-5 h-5 text-stone-400" />
                </button>
              </div>

              <form onSubmit={modalType === 'entry' ? handleEntrySubmit : handleSpaceSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {modalType === 'entry' ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 px-1">Área</label>
                        <select 
                          value={entryForm.area}
                          onChange={e => setEntryForm({...entryForm, area: e.target.value as any})}
                          className="w-full px-5 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl text-sm outline-none"
                        >
                          <option value="sports">Deporte</option>
                          <option value="culture">Cultura</option>
                          <option value="religion">Religión</option>
                          <option value="tourism">Turismo</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Plataforma de Video</label>
                        <select 
                          value={entryForm.video_platform}
                          onChange={e => setEntryForm({...entryForm, video_platform: e.target.value as any})}
                          className="w-full px-5 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl text-sm outline-none"
                        >
                          <option value="youtube">YouTube</option>
                          <option value="tiktok">TikTok</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">URL / ID de Video</label>
                        <input 
                          type="text"
                          value={entryForm.video_url}
                          onChange={e => {
                            const val = e.target.value;
                            setEntryForm({...entryForm, video_url: val});
                            if (entryForm.video_platform === 'tiktok') handleTikTokFetch(val, 'entry');
                          }}
                          placeholder={entryForm.video_platform === 'youtube' ? "Ej: dQw4w9WgXcQ" : "URL completa de TikTok"}
                          className="w-full px-5 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl text-sm outline-none"
                        />
                      </div>
                      {entryForm.creator_name && (
                        <div>
                          <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Creador (Créditos)</label>
                          <input 
                            type="text"
                            value={entryForm.creator_name}
                            onChange={e => setEntryForm({...entryForm, creator_name: e.target.value})}
                            className="w-full px-5 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl text-sm outline-none"
                          />
                        </div>
                      )}
                      <div>
                        <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 px-1">Tipo de Entrada</label>
                        <select 
                          value={entryForm.type}
                          onChange={e => setEntryForm({...entryForm, type: e.target.value as any})}
                          className="w-full px-5 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl text-sm outline-none"
                        >
                          <option value="news">Noticia</option>
                          <option value="event">Evento / Agenda</option>
                          <option value="profile">Perfil de Movimiento</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 px-1">Título</label>
                      <input 
                        required
                        type="text" 
                        value={entryForm.title}
                        onChange={e => setEntryForm({...entryForm, title: e.target.value})}
                        className="w-full px-5 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl text-sm focus:ring-2 focus:ring-ml-monte-verde outline-none"
                        placeholder="Ej. Gran Final de Fútbol Paracotos"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 px-1">Contenido / Descripción</label>
                      <textarea 
                        required
                        rows={4}
                        value={entryForm.content}
                        onChange={e => setEntryForm({...entryForm, content: e.target.value})}
                        className="w-full px-5 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl text-sm focus:ring-2 focus:ring-ml-monte-verde outline-none resize-none"
                        placeholder="Escribe los detalles aquí..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 px-1">Categoría (Opcional)</label>
                        <input 
                          type="text" 
                          value={entryForm.category}
                          onChange={e => setEntryForm({...entryForm, category: e.target.value})}
                          className="w-full px-5 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl text-sm outline-none"
                          placeholder="Ej. Fútbol, Danza, etc."
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 px-1">Imagen</label>
                        <div className="relative">
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={e => handleImageUpload(e, 'entry')}
                            className="hidden"
                            id="entry-image"
                          />
                          <label 
                            htmlFor="entry-image"
                            className="w-full px-5 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl text-sm flex items-center gap-2 cursor-pointer hover:bg-stone-100 transition-colors"
                          >
                            {uploading ? <Loader2 className="w-4 h-4 animate-spin text-ml-monte-verde" /> : <Camera className="w-4 h-4 text-stone-400" />}
                            <span className="text-stone-500 truncate">{entryForm.image_url ? 'Imagen lista ✅' : 'Subir imagen'}</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {entryForm.type === 'event' && (
                      <div className="grid grid-cols-2 gap-4 p-4 bg-stone-50 rounded-3xl border border-stone-100">
                        <div>
                          <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 px-1">Fecha y Hora</label>
                          <input 
                            type="datetime-local" 
                            value={entryForm.event_date}
                            onChange={e => setEntryForm({...entryForm, event_date: e.target.value})}
                            className="w-full px-4 py-2 bg-white border border-stone-100 rounded-xl text-sm outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 px-1">Ubicación</label>
                          <input 
                            type="text" 
                            value={entryForm.location}
                            onChange={e => setEntryForm({...entryForm, location: e.target.value})}
                            className="w-full px-4 py-2 bg-white border border-stone-100 rounded-xl text-sm outline-none"
                            placeholder="Ej. Cancha de la plaza"
                          />
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 px-1">Nombre del Espacio</label>
                        <input 
                          required
                          type="text" 
                          value={spaceForm.name}
                          onChange={e => setSpaceForm({...spaceForm, name: e.target.value})}
                          className="w-full px-5 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl text-sm outline-none"
                          placeholder="Ej. Estadio Municipal"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 px-1">Área</label>
                        <select 
                          value={spaceForm.area}
                          onChange={e => setSpaceForm({...spaceForm, area: e.target.value as any})}
                          className="w-full px-5 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl text-sm outline-none"
                        >
                          <option value="sports">Deporte</option>
                          <option value="culture">Cultura</option>
                          <option value="religion">Religión</option>
                          <option value="tourism">Turismo</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Plataforma de Video</label>
                        <select 
                          value={spaceForm.video_platform}
                          onChange={e => setSpaceForm({...spaceForm, video_platform: e.target.value as any})}
                          className="w-full px-5 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl text-sm outline-none"
                        >
                          <option value="youtube">YouTube</option>
                          <option value="tiktok">TikTok</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">URL / ID de Video</label>
                        <input 
                          type="text"
                          value={spaceForm.video_url}
                          onChange={e => {
                            const val = e.target.value;
                            setSpaceForm({...spaceForm, video_url: val});
                            if (spaceForm.video_platform === 'tiktok') handleTikTokFetch(val, 'space');
                          }}
                          placeholder={spaceForm.video_platform === 'youtube' ? "Ej: dQw4w9WgXcQ" : "URL completa de TikTok"}
                          className="w-full px-5 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl text-sm outline-none"
                        />
                      </div>
                      {spaceForm.creator_name && (
                        <div>
                          <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Creador (Créditos)</label>
                          <input 
                            type="text"
                            value={spaceForm.creator_name}
                            onChange={e => setSpaceForm({...spaceForm, creator_name: e.target.value})}
                            className="w-full px-5 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl text-sm outline-none"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 px-1">Descripción</label>
                      <textarea 
                        rows={3}
                        value={spaceForm.description}
                        onChange={e => setSpaceForm({...spaceForm, description: e.target.value})}
                        className="w-full px-5 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl text-sm outline-none resize-none"
                        placeholder="Breve descripción del lugar..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 px-1">Ubicación</label>
                        <input 
                          type="text" 
                          value={spaceForm.location}
                          onChange={e => setSpaceForm({...spaceForm, location: e.target.value})}
                          className="w-full px-5 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl text-sm outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 px-1">Imagen</label>
                        <div className="relative">
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={e => handleImageUpload(e, 'space')}
                            className="hidden"
                            id="space-image"
                          />
                          <label 
                            htmlFor="space-image"
                            className="w-full px-5 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl text-sm flex items-center gap-2 cursor-pointer hover:bg-stone-100 transition-colors"
                          >
                            {uploading ? <Loader2 className="w-4 h-4 animate-spin text-ml-monte-verde" /> : <Camera className="w-4 h-4 text-stone-400" />}
                            <span className="text-stone-500 truncate">{spaceForm.image_url ? 'Imagen lista ✅' : 'Subir imagen'}</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <button 
                  type="submit"
                  disabled={submitting || uploading}
                  className="w-full py-4 bg-ml-monte-verde text-white rounded-2xl font-black text-sm hover:bg-ml-monte-verde/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? 'Guardando...' : 'Guardar Entrada'}
                  <CheckCircle className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
