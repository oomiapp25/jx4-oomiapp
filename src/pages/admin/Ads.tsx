import { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import { supabase, Ad } from '../../lib/supabase';
import { Plus, Image as ImageIcon, ExternalLink, Calendar, Trash2, ToggleLeft, ToggleRight, X, Loader2, Upload, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { uploadToImgBB } from '../../services/imgbbService';

export default function AdminAds() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    image_url: '',
    title: '',
    description: '',
    link: '',
    priority: 0,
    ends_at: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAds();
  }, []);

  useEffect(() => {
    if (editingAd) {
      setFormData({
        image_url: editingAd.image_url,
        title: editingAd.title || '',
        description: editingAd.description || '',
        link: editingAd.link || '',
        priority: editingAd.priority || 0,
        ends_at: editingAd.ends_at ? new Date(editingAd.ends_at).toISOString().split('T')[0] : ''
      });
    } else {
      setFormData({ image_url: '', title: '', description: '', link: '', priority: 0, ends_at: '' });
    }
  }, [editingAd]);

  async function fetchAds() {
    const { data } = await supabase.from('ads').select('*').order('priority', { ascending: false });
    if (data) setAds(data);
    setLoading(false);
  }

  function openCreateModal() {
    setEditingAd(null);
    setIsModalOpen(true);
  }

  function openEditModal(ad: Ad) {
    setEditingAd(ad);
    setIsModalOpen(true);
  }

  async function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadToImgBB(file);
      setFormData({ ...formData, image_url: url });
    } catch (error) {
      alert('Error al subir imagen');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    const data = {
      image_url: formData.image_url,
      title: formData.title,
      description: formData.description,
      link: formData.link,
      priority: formData.priority,
      ends_at: formData.ends_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      active: editingAd ? editingAd.active : true,
      starts_at: editingAd ? editingAd.starts_at : new Date().toISOString()
    };

    let error;
    if (editingAd) {
      const { error: updateError } = await supabase
        .from('ads')
        .update(data)
        .eq('id', editingAd.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('ads')
        .insert(data);
      error = insertError;
    }

    if (error) {
      alert('Error: ' + error.message);
    } else {
      setIsModalOpen(false);
      setEditingAd(null);
      setFormData({ image_url: '', title: '', description: '', link: '', priority: 0, ends_at: '' });
      fetchAds();
    }
    setLoading(false);
  }

  async function deleteAd(id: string) {
    if (!confirm('¿Estás seguro de eliminar este banner?')) return;
    const { error } = await supabase.from('ads').delete().eq('id', id);
    if (error) alert('Error: ' + error.message);
    else fetchAds();
  }

  async function toggleAd(id: string, currentStatus: boolean) {
    const { error } = await supabase.from('ads').update({ active: !currentStatus }).eq('id', id);
    if (error) alert('Error: ' + error.message);
    else fetchAds();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-stone-900">Banners Publicitarios</h1>
        <button 
          onClick={openCreateModal}
          className="bg-stone-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-600 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Nuevo Banner
        </button>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8"
            >
              <h3 className="text-xl font-black mb-6">{editingAd ? 'Editar Banner' : 'Nuevo Banner'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-[21/9] rounded-2xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center text-stone-400 hover:border-emerald-500 hover:text-emerald-600 transition-all cursor-pointer overflow-hidden relative"
                >
                  {formData.image_url ? (
                    <img src={formData.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      {uploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Upload className="w-8 h-8" />}
                      <span className="text-xs font-bold mt-2">{uploading ? 'Subiendo...' : 'Subir Imagen'}</span>
                    </>
                  )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 px-1">Título</label>
                    <input 
                      type="text" 
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      className="w-full px-4 py-2 bg-stone-50 border border-stone-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Título del banner"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 px-1">Descripción</label>
                    <input 
                      type="text" 
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full px-4 py-2 bg-stone-50 border border-stone-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Breve descripción"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 px-1">Enlace (URL)</label>
                  <input 
                    type="url" 
                    value={formData.link}
                    onChange={e => setFormData({...formData, link: e.target.value})}
                    className="w-full px-4 py-2 bg-stone-50 border border-stone-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="https://..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 px-1">Prioridad</label>
                    <input 
                      type="number" 
                      value={isNaN(formData.priority) ? '' : formData.priority}
                      onChange={e => setFormData({...formData, priority: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-2 bg-stone-50 border border-stone-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 px-1">Fecha Fin</label>
                    <input 
                      type="date" 
                      value={formData.ends_at}
                      onChange={e => setFormData({...formData, ends_at: e.target.value})}
                      className="w-full px-4 py-2 bg-stone-50 border border-stone-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-stone-200 rounded-xl text-sm font-bold text-stone-600">Cancelar</button>
                  <button type="submit" disabled={loading || uploading} className="flex-1 py-3 bg-stone-900 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all disabled:opacity-50">
                    {loading ? 'Guardando...' : 'Crear Banner'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ads.map((ad) => (
          <div key={ad.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm group">
            <div className="aspect-[21/9] bg-stone-100 relative">
              <img src={ad.image_url} alt="" className="w-full h-full object-cover" />
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={() => toggleAd(ad.id, ad.active)}
                  className={`p-2 rounded-full shadow-lg transition-colors ${ad.active ? 'bg-emerald-500 text-white' : 'bg-stone-200 text-stone-500'}`}
                >
                  {ad.active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
                <button 
                  onClick={() => openEditModal(ad)}
                  className="p-2 bg-white text-stone-600 rounded-full shadow-lg hover:text-stone-900 transition-colors"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              {ad.title && <h4 className="text-sm font-black text-stone-900 mb-1">{ad.title}</h4>}
              {ad.description && <p className="text-xs text-stone-500 mb-4">{ad.description}</p>}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-widest">
                  <ImageIcon className="w-3 h-3" />
                  Prioridad: {ad.priority}
                </div>
                <button 
                  onClick={() => deleteAd(ad.id)}
                  className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2 text-sm text-stone-600 mb-2">
                <ExternalLink className="w-4 h-4" />
                <a href={ad.link} target="_blank" className="hover:text-emerald-600 truncate">{ad.link}</a>
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-400">
                <Calendar className="w-4 h-4" />
                <span>{new Date(ad.starts_at).toLocaleDateString()} - {new Date(ad.ends_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
