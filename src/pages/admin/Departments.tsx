import { useState, useEffect, FormEvent } from 'react';
import { supabase, Department } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Building2, X, Loader2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AVAILABLE_ICONS, getIconById } from '../../lib/icons';

export default function AdminDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    whatsapp: '',
    icon: ''
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (editingDepartment) {
      setFormData({
        name: editingDepartment.name,
        slug: editingDepartment.slug,
        whatsapp: editingDepartment.whatsapp || '',
        icon: editingDepartment.icon || ''
      });
    } else {
      setFormData({ name: '', slug: '', whatsapp: '', icon: '' });
    }
  }, [editingDepartment]);

  async function fetchDepartments() {
    const { data } = await supabase.from('departments').select('*').order('name');
    if (data) setDepartments(data);
    setLoading(false);
  }

  function openCreateModal() {
    setEditingDepartment(null);
    setIsModalOpen(true);
  }

  function openEditModal(dept: Department) {
    setEditingDepartment(dept);
    setIsModalOpen(true);
  }

  async function deleteDepartment(id: string) {
    if (!confirm('¿Estás seguro de eliminar este departamento?')) return;
    const { error } = await supabase.from('departments').delete().eq('id', id);
    if (error) alert('Error: ' + error.message);
    else fetchDepartments();
  }

  function generateSlug(name: string) {
    return name.toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const slug = formData.slug || generateSlug(formData.name);
      const data = { 
        name: formData.name, 
        slug,
        whatsapp: formData.whatsapp,
        icon: formData.icon
      };

      let error;
      if (editingDepartment) {
        const { error: updateError } = await supabase
          .from('departments')
          .update(data)
          .eq('id', editingDepartment.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('departments')
          .insert(data);
        error = insertError;
      }

      if (error) {
        alert('Error: ' + error.message);
      } else {
        setIsModalOpen(false);
        setEditingDepartment(null);
        setFormData({ name: '', slug: '', whatsapp: '', icon: '' });
        await fetchDepartments();
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
        <h1 className="text-xl font-black text-stone-900">Departamentos</h1>
        <button 
          onClick={openCreateModal}
          className="bg-stone-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-600 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Nuevo Departamento
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
                  {editingDepartment ? 'Editar Departamento' : 'Nuevo Departamento'}
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
                    placeholder="Ej. Tecnología"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 px-1">WhatsApp del Encargado</label>
                  <input 
                    type="text" 
                    value={formData.whatsapp}
                    onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="+58 412... (opcional)"
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
                    {submitting ? 'Guardando...' : (editingDepartment ? 'Guardar' : 'Crear')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {departments.length > 0 ? departments.map((dept) => {
          const DeptIcon = getIconById(dept.icon);
          return (
            <div key={dept.id} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:border-emerald-500 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-stone-50 rounded-xl group-hover:bg-emerald-50 transition-colors">
                  <DeptIcon className="w-6 h-6 text-stone-400 group-hover:text-emerald-600" />
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => openEditModal(dept)}
                    className="p-2 text-stone-400 hover:text-stone-900 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => deleteDepartment(dept.id)}
                    className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-stone-900">{dept.name}</h3>
              <p className="text-xs text-stone-400 font-mono mt-1">/{dept.slug}</p>
            </div>
          );
        }) : (
          <div className="col-span-full py-20 bg-white rounded-2xl border border-dashed border-stone-200 flex flex-col items-center justify-center text-stone-400">
            <Building2 className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-sm font-medium">No hay departamentos registrados</p>
          </div>
        )}
      </div>
    </div>
  );
}
