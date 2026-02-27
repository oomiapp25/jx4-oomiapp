import { useState, useEffect, FormEvent } from 'react';
import { supabase, ServicePortfolio } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Wrench, User, Phone, Tag, ToggleLeft, ToggleRight, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminServices() {
  const [services, setServices] = useState<ServicePortfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServicePortfolio | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    provider_name: '',
    description: '',
    whatsapp: '',
    category: '',
    active: true
  });

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (editingService) {
      setFormData({
        title: editingService.title,
        provider_name: editingService.provider_name,
        description: editingService.description || '',
        whatsapp: editingService.whatsapp || '',
        category: editingService.category || '',
        active: editingService.active
      });
    } else {
      setFormData({ title: '', provider_name: '', description: '', whatsapp: '', category: '', active: true });
    }
  }, [editingService]);

  async function fetchServices() {
    const { data } = await supabase.from('services_portfolio').select('*').order('created_at', { ascending: false });
    if (data) setServices(data);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro?')) return;
    const { error } = await supabase.from('services_portfolio').delete().eq('id', id);
    if (error) alert('Error: ' + error.message);
    else fetchServices();
  }

  async function toggleActive(service: ServicePortfolio) {
    const { error } = await supabase.from('services_portfolio').update({ active: !service.active }).eq('id', service.id);
    if (error) alert('Error: ' + error.message);
    else fetchServices();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    let error;
    if (editingService) {
      const { error: updateError } = await supabase.from('services_portfolio').update(formData).eq('id', editingService.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('services_portfolio').insert(formData);
      error = insertError;
    }

    if (error) {
      alert('Error: ' + error.message);
    } else {
      setIsModalOpen(false);
      setEditingService(null);
      setFormData({ title: '', provider_name: '', description: '', whatsapp: '', category: '', active: true });
      fetchServices();
    }
    setSubmitting(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-stone-900">Portafolio de Servicios</h1>
        <button 
          onClick={() => { setEditingService(null); setIsModalOpen(true); }}
          className="bg-stone-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-600 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Nuevo Servicio
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
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                <h3 className="text-lg font-black text-stone-900">
                  {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-stone-50 rounded-full transition-colors">
                  <X className="w-5 h-5 text-stone-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 px-1">Título del Servicio</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2.5 bg-stone-50 border border-stone-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Ej. Plomería" />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 px-1">Nombre del Proveedor</label>
                  <input required type="text" value={formData.provider_name} onChange={e => setFormData({...formData, provider_name: e.target.value})} className="w-full px-4 py-2.5 bg-stone-50 border border-stone-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Ej. Juan Pérez" />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 px-1">Categoría</label>
                  <input required type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2.5 bg-stone-50 border border-stone-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Ej. Hogar, Reparaciones" />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 px-1">WhatsApp</label>
                  <input required type="text" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full px-4 py-2.5 bg-stone-50 border border-stone-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Ej. +58 412..." />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 px-1">Descripción</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2.5 bg-stone-50 border border-stone-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none" rows={3} />
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-stone-200 rounded-xl text-sm font-bold text-stone-600">Cancelar</button>
                  <button type="submit" disabled={submitting} className="flex-1 py-3 bg-stone-900 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {submitting ? 'Guardando...' : (editingService ? 'Guardar' : 'Crear')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {services.map((service) => (
          <div key={service.id} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-stone-50 rounded-xl text-stone-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                <Wrench className="w-6 h-6" />
              </div>
              <button 
                onClick={() => toggleActive(service)}
                className={`p-2 rounded-full transition-colors ${service.active ? 'text-emerald-500' : 'text-stone-300'}`}
              >
                {service.active ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
              </button>
            </div>

            <h3 className="font-bold text-stone-900 mb-1">{service.title}</h3>
            <p className="text-xs text-stone-400 mb-4">{service.provider_name}</p>
            
            <div className="flex items-center gap-2 mb-6">
              <span className="px-2 py-1 bg-stone-100 text-[10px] font-bold text-stone-500 rounded-md uppercase tracking-wider">
                {service.category}
              </span>
            </div>

            <div className="pt-4 border-t border-stone-50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-stone-400">
                <Phone className="w-3 h-3" />
                <span>{service.whatsapp}</span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setEditingService(service); setIsModalOpen(true); }} className="p-2 text-stone-400 hover:text-stone-900 transition-colors"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(service.id)} className="p-2 text-stone-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
