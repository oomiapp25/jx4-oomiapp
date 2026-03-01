import { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import { supabase, News } from '../../lib/supabase';
import { Plus, Newspaper, Calendar, Trash2, Edit2, X, Loader2, Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { uploadToImgBB } from '../../services/imgbbService';

export default function AdminNews() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    image_url: '',
    active: true
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    if (editingNews) {
      setFormData({
        title: editingNews.title,
        excerpt: editingNews.excerpt || '',
        content: editingNews.content || '',
        image_url: editingNews.image_url || '',
        active: editingNews.active
      });
    } else {
      setFormData({ title: '', excerpt: '', content: '', image_url: '', active: true });
    }
  }, [editingNews]);

  async function fetchNews() {
    const { data } = await supabase.from('news').select('*').order('published_at', { ascending: false });
    if (data) setNews(data);
    setLoading(false);
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

  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro?')) return;
    const { error } = await supabase.from('news').delete().eq('id', id);
    if (error) alert('Error: ' + error.message);
    else fetchNews();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const data = {
      ...formData,
      published_at: editingNews ? editingNews.published_at : new Date().toISOString()
    };

    let error;
    if (editingNews) {
      const { error: updateError } = await supabase.from('news').update(data).eq('id', editingNews.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('news').insert(data);
      error = insertError;
    }

    if (error) {
      alert('Error: ' + error.message);
    } else {
      setIsModalOpen(false);
      setEditingNews(null);
      setFormData({ title: '', excerpt: '', content: '', image_url: '', active: true });
      fetchNews();
    }
    setSubmitting(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-stone-900">Noticias y Avisos</h1>
        <button 
          onClick={() => { setEditingNews(null); setIsModalOpen(true); }}
          className="bg-stone-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-600 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Nueva Noticia
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
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                <h3 className="text-lg font-black text-stone-900">
                  {editingNews ? 'Editar Noticia' : 'Nueva Noticia'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-stone-50 rounded-full transition-colors">
                  <X className="w-5 h-5 text-stone-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {!process.env.IMGBB_API_KEY && (
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-2 text-[10px] text-amber-700 font-bold">
                    <AlertCircle className="w-3 h-3" />
                    IMGBB_API_KEY no configurada. Sube por URL manual o configura el servicio.
                  </div>
                )}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-video rounded-2xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center text-stone-400 hover:border-emerald-500 hover:text-emerald-600 transition-all cursor-pointer overflow-hidden relative"
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

                <div>
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 px-1">Título</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2.5 bg-stone-50 border border-stone-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 px-1">Resumen Corto</label>
                  <input type="text" value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} className="w-full px-4 py-2.5 bg-stone-50 border border-stone-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 px-1">Contenido</label>
                  <textarea required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full px-4 py-2.5 bg-stone-50 border border-stone-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none" rows={6} />
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-stone-200 rounded-xl text-sm font-bold text-stone-600">Cancelar</button>
                  <button type="submit" disabled={submitting || uploading} className="flex-1 py-3 bg-stone-900 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {submitting ? 'Guardando...' : (editingNews ? 'Guardar' : 'Crear')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {news.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm group">
            {item.image_url && (
              <div className="aspect-video bg-stone-100">
                <img src={item.image_url} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-widest">
                  <Calendar className="w-3 h-3" />
                  {new Date(item.published_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => { setEditingNews(item); setIsModalOpen(true); }} className="p-2 text-stone-400 hover:text-stone-900 transition-colors"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 text-stone-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">{item.title}</h3>
              <p className="text-sm text-stone-500 line-clamp-2">{item.excerpt}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
