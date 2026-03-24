import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { supabase, Department } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Building2, X, Loader2, Search, Upload, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AVAILABLE_ICONS, getIconById, isIconUrl } from '../../lib/icons';
import { uploadToImgBB } from '../../services/imgbbService';
import { IconRenderer } from '../../components/IconRenderer';

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
    icon: '',
    sector: '',
    image_url: ''
  });
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  async function handleIconUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingIcon(true);
    try {
      const url = await uploadToImgBB(file);
      setFormData({ ...formData, icon: url });
    } catch (err: any) {
      alert('Error al subir el icono: ' + err.message);
    } finally {
      setUploadingIcon(false);
    }
  }

  async function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await uploadToImgBB(file);
      setFormData({ ...formData, image_url: url });
    } catch (err: any) {
      alert('Error al subir la imagen: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  }

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (editingDepartment) {
      setFormData({
        name: editingDepartment.name,
        slug: editingDepartment.slug,
        whatsapp: editingDepartment.whatsapp || '',
        icon: editingDepartment.icon || '',
        sector: editingDepartment.sector || '',
        image_url: editingDepartment.image_url || ''
      });
    } else {
      setFormData({ name: '', slug: '', whatsapp: '', icon: '', sector: '', image_url: '' });
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
    if (error) {
      if (error.code === '23503') {
        alert('No se puede eliminar: Este departamento tiene productos asociados. Debes eliminar o cambiar de departamento los productos primero.');
      } else {
        alert('Error: ' + error.message);
      }
    } else {
      fetchDepartments();
    }
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
        icon: formData.icon,
        sector: formData.sector,
        image_url: formData.image_url
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
        setFormData({ name: '', slug: '', whatsapp: '', icon: '', sector: '', image_url: '' });
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
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 px-1">Sector / Dirección</label>
                  <input 
                    type="text" 
                    value={formData.sector}
                    onChange={e => setFormData({...formData, sector: e.target.value})}
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Ej. Sector El Centro, Calle Real"
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
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 px-1">Imagen de Fondo (Banner)</label>
                  <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                    <div className="w-20 h-12 rounded-lg bg-stone-200 overflow-hidden flex items-center justify-center border border-stone-100">
                      {uploadingImage ? (
                        <Loader2 className="w-5 h-5 animate-spin text-stone-400" />
                      ) : formData.image_url ? (
                        <img src={formData.image_url} className="w-full h-full object-cover" alt="Banner" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-stone-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="block">
                        <div className="px-4 py-2 bg-stone-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-emerald-600 transition-all flex items-center justify-center gap-2">
                          <Upload className="w-3 h-3" />
                          {formData.image_url ? 'Cambiar Imagen' : 'Subir Imagen'}
                        </div>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleImageUpload} 
                          className="hidden" 
                        />
                      </label>
                    </div>
                  </div>
                  <p className="text-[9px] text-stone-400 mt-1 px-1">Esta imagen se usará como fondo en la cuadrícula del inicio.</p>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 px-1">Icono</label>
                  
                  {/* Custom Icon Upload */}
                  <div className="mb-3 flex flex-col gap-3">
                    <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Vista Previa</span>
                        <div className="w-14 h-14 rounded-full bg-ml-white-cal flex items-center justify-center shadow-sm border border-stone-100 overflow-hidden">
                          {uploadingIcon ? (
                            <Loader2 className="w-5 h-5 animate-spin text-stone-400" />
                          ) : formData.icon ? (
                            <IconRenderer iconId={formData.icon} className="w-7 h-7 text-ml-hierro" />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-stone-300" />
                          )}
                        </div>
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <label className="block">
                          <div className="px-4 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-emerald-600 transition-all flex items-center justify-center gap-2">
                            <Upload className="w-3.5 h-3.5" />
                            {formData.icon && isIconUrl(formData.icon) ? 'Cambiar Logo' : 'Subir Logo Propio'}
                          </div>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleIconUpload} 
                            className="hidden" 
                          />
                        </label>
                        {formData.icon && (
                          <button 
                            type="button"
                            onClick={() => setFormData({ ...formData, icon: '' })}
                            className="w-full px-4 py-2 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-50 rounded-lg transition-colors"
                          >
                            Quitar Icono
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] font-bold text-stone-400 mb-2 text-center">O selecciona un icono del sistema:</div>
                  
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
          return (
            <div key={dept.id} className="bg-white rounded-2xl border border-stone-200 shadow-sm hover:border-emerald-500 transition-all group overflow-hidden">
              <div className="aspect-video w-full bg-ml-monte-verde/10 relative overflow-hidden">
                {dept.image_url ? (
                  <img src={dept.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={dept.name} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-300">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                <div className="absolute top-3 right-3 flex items-center gap-1">
                  <button 
                    onClick={() => openEditModal(dept)}
                    className="p-2 bg-white/90 backdrop-blur-md text-stone-900 rounded-lg hover:bg-white transition-colors shadow-lg"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => deleteDepartment(dept.id)}
                    className="p-2 bg-red-500/90 backdrop-blur-md text-white rounded-lg hover:bg-red-500 transition-colors shadow-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute bottom-3 left-3 p-2 bg-white/90 backdrop-blur-md rounded-lg shadow-lg">
                  <IconRenderer iconId={dept.icon} className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-stone-900">{dept.name}</h3>
                <p className="text-xs text-stone-400 font-bold mt-1 uppercase tracking-widest">{dept.sector || 'Sin sector'}</p>
                <p className="text-xs text-stone-400 font-mono mt-1">/{dept.slug}</p>
              </div>
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
