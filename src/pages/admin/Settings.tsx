import { useState, useEffect } from 'react';
import { supabase, UserProfile } from '../../lib/supabase';
import { Save, DollarSign, Users, Plus, Trash2, Shield, AlertCircle } from 'lucide-react';

export default function AdminSettings() {
  const [exchangeRate, setExchangeRate] = useState('1');
  const [admins, setAdmins] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchAdmins();
  }, []);

  async function fetchSettings() {
    const { data } = await supabase.from('settings').select('*').eq('key', 'exchange_rate').single();
    if (data) {
      setExchangeRate(data.value.rate);
    }
  }

  async function fetchAdmins() {
    const { data } = await supabase.from('users').select('*').neq('role', 'customer');
    if (data) setAdmins(data);
    setLoading(false);
  }

  async function saveExchangeRate() {
    setSaving(true);
    const { error } = await supabase.from('settings').upsert({
      key: 'exchange_rate',
      value: { rate: exchangeRate },
      updated_at: new Date().toISOString()
    });

    if (error) alert('Error al guardar: ' + error.message);
    else alert('Tasa cambiaria actualizada');
    setSaving(false);
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Exchange Rate Card */}
        <div className="bg-white p-8 rounded-[2rem] border border-stone-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900">Tasa Cambiaria</h3>
              <p className="text-xs text-stone-400 font-medium uppercase tracking-widest">Configuración Global</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 px-1">Tasa del día (1 USD = ? BS)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-stone-400">Bs.</span>
                <input 
                  type="number" 
                  step="0.01"
                  value={exchangeRate}
                  onChange={e => setExchangeRate(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>
            <button 
              onClick={saveExchangeRate}
              disabled={saving}
              className="w-full py-4 bg-stone-900 text-white rounded-2xl font-black text-sm hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : 'Actualizar Tasa'}
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-emerald-900 p-8 rounded-[2rem] text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Panel de Control Maestro</span>
            </div>
            <h2 className="text-2xl font-black mb-4">Gestión de la Plataforma</h2>
            <p className="text-emerald-100/70 text-sm leading-relaxed">
              Como Super Administrador, tienes control total sobre la tasa cambiaria, el personal administrativo y la configuración global de JX4 Paracotos.
            </p>
          </div>
          <div className="mt-8 flex items-center gap-3 text-xs font-bold bg-emerald-800/50 p-4 rounded-2xl border border-emerald-700/50">
            <AlertCircle className="w-4 h-4 text-emerald-400" />
            Los cambios en la tasa afectan a todos los productos en tiempo real.
          </div>
        </div>
      </div>

      {/* Admins Management */}
      <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-stone-900 text-white rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900">Personal Administrativo</h3>
              <p className="text-xs text-stone-400 font-medium uppercase tracking-widest">Roles y Permisos</p>
            </div>
          </div>
          <button className="px-6 py-3 bg-stone-100 text-stone-900 rounded-xl text-xs font-black hover:bg-stone-200 transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Invitar Administrador
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-stone-50 text-[10px] font-black text-stone-400 uppercase tracking-widest">
                <th className="px-8 py-4">Nombre</th>
                <th className="px-8 py-4">Email</th>
                <th className="px-8 py-4">Rol</th>
                <th className="px-8 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {admins.map((admin) => (
                <tr key={admin.id} className="text-sm hover:bg-stone-50 transition-colors">
                  <td className="px-8 py-4 font-bold text-stone-900">{admin.full_name}</td>
                  <td className="px-8 py-4 text-stone-500">{admin.email}</td>
                  <td className="px-8 py-4">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                      admin.role === 'admin' ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-600'
                    }`}>
                      {admin.role}
                    </span>
                  </td>
                  <td className="px-8 py-4">
                    <button className="p-2 text-stone-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
