import { useState, useEffect } from 'react';
import { supabase, JobOffer } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Briefcase, Building, Phone, ToggleLeft, ToggleRight } from 'lucide-react';

export default function AdminJobs() {
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    const { data } = await supabase.from('job_offers').select('*').order('created_at', { ascending: false });
    if (data) setJobs(data);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-stone-900">Ofertas de Empleo</h1>
        <button className="bg-stone-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-600 transition-all active:scale-95">
          <Plus className="w-4 h-4" />
          Nueva Vacante
        </button>
      </div>

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
                    <Building className="w-3 h-3" />
                    <span>{job.company}</span>
                  </div>
                </div>
              </div>
              <button className={`p-2 rounded-full transition-colors ${job.active ? 'text-emerald-500' : 'text-stone-300'}`}>
                {job.active ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
              </button>
            </div>

            <p className="text-sm text-stone-600 mb-6 line-clamp-3">{job.description}</p>

            <div className="pt-4 border-t border-stone-50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-stone-400">
                <Phone className="w-3 h-3" />
                <span>{job.contact_info}</span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 text-stone-400 hover:text-stone-900"><Edit2 className="w-4 h-4" /></button>
                <button className="p-2 text-stone-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
