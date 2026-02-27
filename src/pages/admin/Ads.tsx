import { useState, useEffect } from 'react';
import { supabase, Ad } from '../../lib/supabase';
import { Plus, Image as ImageIcon, ExternalLink, Calendar, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

export default function AdminAds() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAds();
  }, []);

  async function fetchAds() {
    const { data } = await supabase.from('ads').select('*').order('priority', { ascending: false });
    if (data) setAds(data);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-stone-900">Banners Publicitarios</h1>
        <button className="bg-stone-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-600 transition-all active:scale-95">
          <Plus className="w-4 h-4" />
          Nuevo Banner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ads.map((ad) => (
          <div key={ad.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm group">
            <div className="aspect-[21/9] bg-stone-100 relative">
              <img src={ad.image_url} alt="" className="w-full h-full object-cover" />
              <div className="absolute top-4 right-4 flex gap-2">
                <button className={`p-2 rounded-full shadow-lg transition-colors ${ad.active ? 'bg-emerald-500 text-white' : 'bg-stone-200 text-stone-500'}`}>
                  {ad.active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-widest">
                  <ImageIcon className="w-3 h-3" />
                  Prioridad: {ad.priority}
                </div>
                <button className="p-2 text-stone-400 hover:text-red-500 transition-colors">
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
