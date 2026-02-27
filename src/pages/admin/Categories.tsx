import { useState, useEffect } from 'react';
import { supabase, Category } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Folder } from 'lucide-react';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-stone-900">Categorías</h1>
        <button className="bg-stone-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-600 transition-all active:scale-95">
          <Plus className="w-4 h-4" />
          Nueva Categoría
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.length > 0 ? categories.map((cat) => (
          <div key={cat.id} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:border-emerald-500 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-stone-50 rounded-xl group-hover:bg-emerald-50 transition-colors">
                <Folder className="w-6 h-6 text-stone-400 group-hover:text-emerald-600" />
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 text-stone-400 hover:text-stone-900"><Edit2 className="w-4 h-4" /></button>
                <button className="p-2 text-stone-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <h3 className="text-lg font-bold text-stone-900">{cat.name}</h3>
            <p className="text-xs text-stone-400 font-mono mt-1">/{cat.slug}</p>
          </div>
        )) : (
          <div className="col-span-full py-20 bg-white rounded-2xl border border-dashed border-stone-200 flex flex-col items-center justify-center text-stone-400">
            <Folder className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-sm font-medium">No hay categorías registradas</p>
          </div>
        )}
      </div>
    </div>
  );
}
