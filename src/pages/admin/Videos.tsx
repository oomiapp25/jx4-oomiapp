import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Plus, 
  Search, 
  Video, 
  Trash2, 
  Edit2, 
  CheckCircle, 
  XCircle,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CommunityVideo {
  id: string;
  title: string;
  youtube_id: string;
  description: string;
  active: boolean;
  created_at: string;
}

export default function AdminVideos() {
  const [videos, setVideos] = useState<CommunityVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<CommunityVideo | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    youtube_id: '',
    description: '',
    active: true
  });

  useEffect(() => {
    fetchVideos();
  }, []);

  async function fetchVideos() {
    setLoading(true);
    const { data, error } = await supabase
      .from('community_videos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching videos:', error);
    else setVideos(data || []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const videoData = {
      ...formData,
    };

    if (editingVideo) {
      const { error } = await supabase
        .from('community_videos')
        .update(videoData)
        .eq('id', editingVideo.id);
      if (error) alert('Error actualizando video');
    } else {
      const { error } = await supabase
        .from('community_videos')
        .insert([videoData]);
      if (error) alert('Error creando video');
    }

    setIsModalOpen(false);
    setEditingVideo(null);
    setFormData({ title: '', youtube_id: '', description: '', active: true });
    fetchVideos();
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro de eliminar este video?')) return;
    const { error } = await supabase
      .from('community_videos')
      .delete()
      .eq('id', id);
    if (error) alert('Error eliminando video');
    else fetchVideos();
  }

  async function toggleStatus(video: CommunityVideo) {
    const { error } = await supabase
      .from('community_videos')
      .update({ active: !video.active })
      .eq('id', video.id);
    if (error) alert('Error actualizando estado');
    else fetchVideos();
  }

  const filteredVideos = videos.filter(v => 
    v.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-ml-monte-verde uppercase tracking-tighter">Administración de Videos</h1>
          <p className="text-xs text-ml-hierro font-bold uppercase opacity-60">Gestiona los videos de la comunidad en el inicio</p>
        </div>
        <button
          onClick={() => {
            setEditingVideo(null);
            setFormData({ title: '', youtube_id: '', description: '', active: true });
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-ml-monte-verde text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-ml-hierro transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Nuevo Video
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ml-hierro/40" />
        <input
          type="text"
          placeholder="BUSCAR VIDEOS..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-ml-white-cal rounded-2xl text-xs font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-ml-monte-verde/20 transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-64 bg-white rounded-[30px] animate-pulse border border-ml-white-cal" />
          ))
        ) : (
          filteredVideos.map((video) => (
            <motion.div
              layout
              key={video.id}
              className="bg-white rounded-[30px] border border-ml-white-cal overflow-hidden shadow-sm hover:shadow-md transition-all group"
            >
              <div className="aspect-video relative bg-stone-100">
                <img 
                  src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Video className="w-12 h-12 text-white" />
                </div>
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => toggleStatus(video)}
                    className={`p-2 rounded-xl backdrop-blur-md shadow-lg transition-all ${
                      video.active ? 'bg-ml-monte-verde text-white' : 'bg-ml-teja text-white'
                    }`}
                  >
                    {video.active ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-black text-ml-monte-verde uppercase tracking-tighter line-clamp-1">{video.title}</h3>
                  <p className="text-[10px] text-ml-hierro font-bold uppercase opacity-60 mt-1 line-clamp-2">{video.description}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-ml-white-cal">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingVideo(video);
                        setFormData({
                          title: video.title,
                          youtube_id: video.youtube_id,
                          description: video.description,
                          active: video.active
                        });
                        setIsModalOpen(true);
                      }}
                      className="p-2 text-ml-hierro hover:text-ml-monte-verde transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(video.id)}
                      className="p-2 text-ml-hierro hover:text-ml-teja transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <a 
                    href={`https://youtube.com/watch?v=${video.youtube_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[10px] font-black text-ml-monte-verde uppercase tracking-widest hover:underline"
                  >
                    Ver en YT
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))
        )}
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
              className="absolute inset-0 bg-ml-monte-verde/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-black text-ml-monte-verde uppercase tracking-tighter">
                    {editingVideo ? 'Editar Video' : 'Nuevo Video'}
                  </h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-ml-white-cal rounded-full transition-colors">
                    <XCircle className="w-6 h-6 text-ml-hierro" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-ml-hierro uppercase tracking-widest ml-1">Título del Video</label>
                    <input
                      required
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-6 py-4 bg-ml-white-cal rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-ml-monte-verde/20 transition-all"
                      placeholder="EJ. RESUMEN DEPORTIVO SEMANAL"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-ml-hierro uppercase tracking-widest ml-1">YouTube ID</label>
                    <input
                      required
                      type="text"
                      value={formData.youtube_id}
                      onChange={(e) => setFormData({ ...formData, youtube_id: e.target.value })}
                      className="w-full px-6 py-4 bg-ml-white-cal rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-ml-monte-verde/20 transition-all"
                      placeholder="EJ. dQw4w9WgXcQ"
                    />
                    <p className="text-[9px] text-ml-hierro/60 font-medium ml-1">El código que aparece después de v= en la URL de YouTube</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-ml-hierro uppercase tracking-widest ml-1">Descripción</label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-6 py-4 bg-ml-white-cal rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-ml-monte-verde/20 transition-all resize-none"
                      placeholder="BREVE DESCRIPCIÓN DEL VIDEO..."
                    />
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-ml-white-cal rounded-2xl">
                    <input
                      type="checkbox"
                      id="active"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="w-5 h-5 rounded-lg border-ml-hierro/20 text-ml-monte-verde focus:ring-ml-monte-verde"
                    />
                    <label htmlFor="active" className="text-xs font-bold text-ml-monte-verde uppercase tracking-widest cursor-pointer">Video Activo</label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 bg-ml-monte-verde text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-ml-hierro transition-all shadow-xl disabled:opacity-50"
                  >
                    {loading ? 'GUARDANDO...' : editingVideo ? 'ACTUALIZAR VIDEO' : 'CREAR VIDEO'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
