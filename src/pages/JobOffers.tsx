import { useState, useEffect } from 'react';
import { supabase, JobOffer } from '../lib/supabase';
import { Briefcase, Building, Phone, Calendar, ArrowRight } from 'lucide-react';

export default function JobOffers() {
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    const { data } = await supabase.from('job_offers').select('*').eq('active', true).order('created_at', { ascending: false });
    if (data) setJobs(data);
    setLoading(false);
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-ml-monte-verde tracking-tighter mb-4">Bolsa de Empleo</h1>
        <p className="text-ml-hierro">Encuentra oportunidades laborales en Paracotos y sus alrededores.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {jobs.length > 0 ? jobs.map((job) => (
          <div key={job.id} className="bg-white p-8 rounded-[2rem] border border-ml-white-cal shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all group">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-ml-monte-verde text-white rounded-2xl flex items-center justify-center">
                <Briefcase className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-black text-ml-monte-verde">{job.title}</h3>
                <div className="flex items-center gap-2 text-sm text-ml-quebrada font-bold">
                  <Building className="w-4 h-4" />
                  <span>{job.company}</span>
                </div>
              </div>
            </div>

            <p className="text-ml-hierro text-sm leading-relaxed mb-8 line-clamp-4">
              {job.description}
            </p>

            <div className="flex items-center justify-between pt-6 border-t border-ml-white-cal">
              <div className="flex items-center gap-2 text-xs text-ml-quebrada font-bold">
                <Calendar className="w-4 h-4" />
                <span>Publicado: {new Date(job.created_at).toLocaleDateString()}</span>
              </div>
              <a 
                href={`https://wa.me/${job.contact_info}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-ml-white-cal text-ml-hierro rounded-xl text-sm font-black hover:bg-ml-teja hover:text-white transition-all"
              >
                Postularse
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border border-dashed border-ml-white-cal">
            <Briefcase className="w-12 h-12 text-ml-white-cal mx-auto mb-4" />
            <p className="text-ml-hierro font-medium">No hay ofertas de empleo disponibles en este momento.</p>
          </div>
        )}
      </div>
    </div>
  );
}
