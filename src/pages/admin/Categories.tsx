import { useState, useEffect, FormEvent } from 'react';
import { supabase, Category } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Folder, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AVAILABLE_ICONS, getIconById } from '../../lib/icons';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name,
        slug: editingCategory.slug,
        icon: editingCategory.icon || ''
      });
    } else {
      setFormData({ name: '', slug: '', icon: '' });
    }
  }, [editingCategory]);

  async function fetchCategories() {
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
    setLoading(false);
  }

  function openCreateModal() {
    setEditingCategory(null);
    setIsModalOpen(true);
  }

  function openEditModal(cat: Category) {
    setEditingCategory(cat);
    setIsModalOpen(true);
  }

  async function deleteCategory(id: string) {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) alert('Error: ' + error.message);
    else fetchCategories();
  }

  function generateSlug(name: string) {
    return name.toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async function updateRating(id: string, delta: number) {
    const cat = categories.find(c => c.id === id);
    if (!cat) return;
    const newRating = (cat.rating || 0) + delta;
    const { error } = await supabase.from('categories').update({ rating: newRating }).eq('id', id);
    if (error) alert('Error: ' + error.message);
    else fetchCategories();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const slug = formData.slug || generateSlug(formData.name);
      const data = { name: formData.name, slug, icon: formData.icon };

      let error;
      if (editingCategory) {
        const { error: updateError } = await supabase
          .from('categories')
          .update(data)
          .eq('id', editingCategory.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('categories')
          .insert(data);
        error = insertError;
      }

      if (error) {
        alert('Error: ' + error.message);
      } else {
        setIsModalOpen(false);
        setEditingCategory(null);
        setFormData({ name: '', slug: '', icon: '' });
        await fetchCategories();
      }
    } catch (err: any) {
      console.error('Error in handleSubmit:', err);
      alert('Ocurrió un error inesperado: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-stone-900">Categorías</h1>
        <button 
          onClick={openCreateModal}
          className="bg-stone-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-600 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Nueva Categoría
        </button>
      </div>

      {/* Modal */}
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
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                <h3 className="text-lg font-black text-stone-900">
                  {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-stone-50 rounded-full transition-colors">
                  <X className="w-5 h-5 text-stone-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 px-1">Nombre</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Ej. Celulares"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 px-1">Slug (URL)</label>
                  <input 
                    type="text" 
                    value={formData.slug}
                    onChange={e => setFormData({...formData, slug: e.target.value})}
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="ej-celulares (opcional)"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 px-1">Icono</label>
                  <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto p-2 border border-stone-100 rounded-xl">
                    {AVAILABLE_ICONS.map((item) => {
                      const IconComp = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, icon: item.id })}
                          className={`p-3 rounded-lg flex items-center justify-center transition-all ${
                            formData.icon === item.id 
                              ? 'bg-emerald-500 text-white' 
                              : 'bg-stone-50 text-stone-400 hover:bg-stone-100'
                          }`}
                          title={item.label}
                        >
                          <IconComp className="w-5 h-5" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 border border-stone-200 rounded-xl text-sm font-bold text-stone-600 hover:bg-stone-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 bg-stone-900 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {submitting ? 'Guardando...' : (editingCategory ? 'Guardar' : 'Crear')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.length > 0 ? categories.map((cat) => {
          const CatIcon = getIconById(cat.icon);
          return (
            <div key={cat.id} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:border-emerald-500 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-stone-50 rounded-xl group-hover:bg-emerald-50 transition-colors">
                  <CatIcon className="w-6 h-6 text-stone-400 group-hover:text-emerald-600" />
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => openEditModal(cat)}
                    className="p-2 text-stone-400 hover:text-stone-900 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => deleteCategory(cat.id)}
                    className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-stone-900">{cat.name}</h3>
              <p className="text-xs text-stone-400 font-mono mt-1">/{cat.slug}</p>
              
              <div className="mt-6 pt-4 border-t border-stone-50 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Reputación</p>
                  <p className={`text-lg font-black ${ (cat.rating || 0) >= 0 ? 'text-ml-quebrada' : 'text-ml-teja'}`}>
                    {cat.rating || 0}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => updateRating(cat.id, 5)}
                    className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold hover:bg-emerald-100 transition-colors"
                    title="Aumentar reputación (+5)"
                  >
                    +5
                  </button>
                  <button 
                    onClick={() => updateRating(cat.id, -5)}
                    className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold hover:bg-red-100 transition-colors"
                    title="Disminuir reputación (-5)"
                  >
                    -5
                  </button>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="col-span-full py-20 bg-white rounded-2xl border border-dashed border-stone-200 flex flex-col items-center justify-center text-stone-400">
            <Folder className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-sm font-medium">No hay categorías registradas</p>
          </div>
        )}
      </div>
    </div>
  );
}
