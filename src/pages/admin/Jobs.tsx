import { useState, useEffect, FormEvent } from 'react';
import { supabase, JobOffer } from '../../lib/supabase';
import { Plus, Briefcase, Calendar, Trash2, Edit2, X, Loader2, Building2, Phone, ToggleLeft, ToggleRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminJobs() {
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobOffer | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    contact_info: '',
    active: true
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (editingJob) {
      setFormData({
        title: editingJob.title,
        company: editingJob.company,
        description: editingJob.description || '',
        contact_info: editingJob.contact_info || '',
        active: editingJob.active
      });
    } else {
      setFormData({ title: '', company: '', description: '', contact_info: '', active: true });
    }
  }, [editingJob]);

  async function fetchJobs() {
    const { data } = await supabase.from('job_offers').select('*').order('created_at', { ascending: false });
    if (data) setJobs(data);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro?')) return;
    const { error } = await supabase.from('job_offers').delete().eq('id', id);
    if (error) alert('Error: ' + error.message);
    else fetchJobs();
  }

  async function toggleActive(job: JobOffer) {
    const { error } = await supabase.from('job_offers').update({ active: !job.active }).eq('id', job.id);
    if (error) alert('Error: ' + error.message);
    else fetchJobs();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    let error;
    if (editingJob) {
      const { error: updateError } = await supabase.from('job_offers').update(formData).eq('id', editingJob.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('job_offers').insert(formData);
      error = insertError;
    }

    if (error) {
      alert('Error: ' + error.message);
    } else {
      setIsModalOpen(false);
      setEditingJob(null);
      setFormData({ title: '', company: '', description: '', contact_info: '', active: true });
      fetchJobs();
    }
    setSubmitting(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-stone-900">Ofertas de Empleo</h1>
        <button 
          onClick={() => { setEditingJob(null); setIsModalOpen(true); }}
          className="bg-stone-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-600 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Nueva Vacante
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
                  {editingJob ? 'Editar Oferta' : 'Nueva Oferta'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-stone-50 rounded-full transition-colors">
                  <X className="w-5 h-5 text-stone-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 px-1">Título del Puesto</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2.5 bg-stone-50 border border-stone-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 px-1">Empresa</label>
                  <input required type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full px-4 py-2.5 bg-stone-50 border border-stone-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 px-1">Descripción</label>
                  <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2.5 bg-stone-50 border border-stone-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none" rows={4} />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 px-1">Info de Contacto</label>
                  <input required type="text" value={formData.contact_info} onChange={e => setFormData({...formData, contact_info: e.target.value})} className="w-full px-4 py-2.5 bg-stone-50 border border-stone-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Ej. WhatsApp o Correo" />
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-stone-200 rounded-xl text-sm font-bold text-stone-600">Cancelar</button>
                  <button type="submit" disabled={submitting} className="flex-1 py-3 bg-stone-900 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {submitting ? 'Guardando...' : (editingJob ? 'Guardar' : 'Crear')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {jobs.map((job) => (
          <div key={job.id} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-stone-50 rounded-xl flex items-center justify-center text-stone-400">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900">{job.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-stone-400">
                    <Building2 className="w-3 h-3" />
                    {job.company}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => toggleActive(job)}
                className={`p-2 rounded-full transition-colors ${job.active ? 'text-emerald-500' : 'text-stone-300'}`}
              >
                {job.active ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
              </button>
            </div>
            <p className="text-sm text-stone-500 line-clamp-3 mb-4">{job.description}</p>
            <div className="flex items-center justify-between pt-4 border-t border-stone-50">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                <Phone className="w-3 h-3" />
                {job.contact_info}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setEditingJob(job); setIsModalOpen(true); }} className="p-2 text-stone-400 hover:text-stone-900 transition-colors"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(job.id)} className="p-2 text-stone-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
