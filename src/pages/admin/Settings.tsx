import { useState, useEffect, FormEvent } from 'react';
import { supabase, UserProfile, Department } from '../../lib/supabase';
import { Save, DollarSign, Users, Plus, Trash2, Shield, AlertCircle, X, Loader2, Lock, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../hooks/useAuth';

export default function AdminSettings() {
  const { user: currentUser } = useAuth();
  const [exchangeRate, setExchangeRate] = useState('1');
  const [euroRate, setEuroRate] = useState('1');
  const [admins, setAdmins] = useState<UserProfile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [transportLines, setTransportLines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'admin',
    departmentId: '',
    transportLineId: '',
    phoneNumber: ''
  });

  useEffect(() => {
    fetchSettings();
    fetchAdmins();
    fetchDepartments();
    fetchTransportLines();
  }, []);

  async function fetchSettings() {
    const { data } = await supabase.from('settings').select('*').eq('key', 'exchange_rate').single();
    if (data) {
      setExchangeRate(data.value.rate);
      setEuroRate(data.value.euro_rate || (parseFloat(data.value.rate) * 1.08).toFixed(2));
    }
  }

  async function fetchAdmins() {
    const { data } = await supabase.from('users').select('*').neq('role', 'customer');
    if (data) setAdmins(data);
    setLoading(false);
  }

  async function fetchDepartments() {
    const { data } = await supabase.from('departments').select('*').order('name');
    if (data) setDepartments(data);
  }

  async function fetchTransportLines() {
    const { data } = await supabase.from('transport_lines').select('*').order('name');
    if (data) setTransportLines(data);
  }

  async function saveExchangeRate() {
    setSaving(true);
    const { error } = await supabase.from('settings').upsert({
      key: 'exchange_rate',
      value: { 
        rate: exchangeRate,
        euro_rate: euroRate 
      },
      updated_at: new Date().toISOString()
    });

    if (error) alert('Error al guardar: ' + error.message);
    else alert('Tasa cambiaria actualizada');
    setSaving(false);
  }

  async function handleCreateAdmin(e: FormEvent) {
    e.preventDefault();
    if (!currentUser) return;
    setSubmitting(true);

    try {
      const response = await fetch('/api/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          invitedBy: currentUser.id
        })
      });

      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch (e) {
        throw new Error('El servidor devolvió una respuesta no válida: ' + text.substring(0, 100));
      }

      if (!response.ok) throw new Error(result.error || 'Error desconocido');

      alert('Administrador creado exitosamente');
      setIsModalOpen(false);
      setFormData({
        email: '',
        password: '',
        fullName: '',
        role: 'admin',
        departmentId: '',
        transportLineId: '',
        phoneNumber: ''
      });
      fetchAdmins();
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Exchange Rate Card */}
        <div className="bg-white p-8 rounded-[2rem] border border-stone-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-ml-neutral text-ml-secundario rounded-2xl flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-ml-dark">Tasa Cambiaria</h3>
              <p className="text-xs text-ml-principal font-medium uppercase tracking-widest">Configuración Global</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-ml-principal uppercase tracking-widest mb-2 px-1">Tasa USD (1 USD = ? BS)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-ml-principal">Bs.</span>
                <input 
                  type="number" 
                  step="0.01"
                  value={exchangeRate}
                  onChange={e => setExchangeRate(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-ml-neutral border border-ml-principal/10 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-ml-secundario outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-ml-principal uppercase tracking-widest mb-2 px-1">Tasa EUR (1 EUR = ? BS)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-ml-principal">Bs.</span>
                <input 
                  type="number" 
                  step="0.01"
                  value={euroRate}
                  onChange={e => setEuroRate(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-ml-neutral border border-ml-principal/10 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-ml-secundario outline-none"
                />
              </div>
            </div>

            <button 
              onClick={saveExchangeRate}
              disabled={saving}
              className="w-full py-4 bg-ml-acento text-white rounded-2xl font-black text-sm hover:bg-ml-acento/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : 'Actualizar Tasa'}
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-ml-special p-8 rounded-[2rem] text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-ml-acento" />
              <span className="text-[10px] font-black uppercase tracking-widest text-ml-acento">Panel de Control Maestro</span>
            </div>
            <h2 className="text-2xl font-black mb-4">Gestión de la Plataforma</h2>
            <p className="text-white/70 text-sm leading-relaxed">
              Como Super Administrador, tienes control total sobre la tasa cambiaria, el personal administrativo y la configuración global de JX4 Paracotos.
            </p>
          </div>
          <div className="mt-8 flex items-center gap-3 text-xs font-bold bg-white/10 p-4 rounded-2xl border border-white/10">
            <AlertCircle className="w-4 h-4 text-ml-acento" />
            Los cambios en la tasa afectan a todos los productos en tiempo real.
          </div>
        </div>
      </div>

      {/* Admins Management */}
      <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-ml-dark text-white rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-ml-dark">Personal Administrativo</h3>
              <p className="text-xs text-ml-principal font-medium uppercase tracking-widest">Roles y Permisos</p>
            </div>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-ml-neutral text-ml-dark rounded-xl text-xs font-black hover:bg-ml-neutral/80 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nuevo Administrador
          </button>
        </div>

        {/* Create Admin Modal */}
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
                  <h3 className="text-lg font-black text-stone-900">Crear Nuevo Administrador</h3>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-stone-50 rounded-full transition-colors">
                    <X className="w-5 h-5 text-stone-400" />
                  </button>
                </div>

                <form onSubmit={handleCreateAdmin} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 px-1">Nombre Completo</label>
                      <input 
                        required
                        type="text" 
                        value={formData.fullName}
                        onChange={e => setFormData({...formData, fullName: e.target.value})}
                        className="w-full px-4 py-2.5 bg-stone-50 border border-stone-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        placeholder="Ej. Juan Pérez"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 px-1">Email</label>
                      <input 
                        required
                        type="email" 
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-2.5 bg-stone-50 border border-stone-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        placeholder="juan@ejemplo.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 px-1">Contraseña</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                        <input 
                          required
                          type="password" 
                          value={formData.password}
                          onChange={e => setFormData({...formData, password: e.target.value})}
                          className="w-full pl-10 pr-4 py-2.5 bg-ml-neutral border border-ml-principal/10 rounded-xl text-sm focus:ring-2 focus:ring-ml-secundario outline-none"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 px-1">Teléfono</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                        <input 
                          type="tel" 
                          value={formData.phoneNumber}
                          onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                          className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                          placeholder="+58 412..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 px-1">Rol</label>
                      <select 
                        value={formData.role}
                        onChange={e => setFormData({...formData, role: e.target.value})}
                        className="w-full px-4 py-2.5 bg-stone-50 border border-stone-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      >
                        <option value="admin">Administrador General</option>
                        <option value="category_admin">Admin Categoría</option>
                        <option value="department_admin">Admin Departamento</option>
                        <option value="transport_admin">Admin Transporte</option>
                        <option value="social_admin">Gestor Social (Alvert Sanz)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 px-1">Departamento</label>
                      <select 
                        value={formData.departmentId}
                        onChange={e => setFormData({...formData, departmentId: e.target.value})}
                        className="w-full px-4 py-2.5 bg-stone-50 border border-stone-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        disabled={formData.role !== 'department_admin'}
                      >
                        <option value="">Ninguno</option>
                        {departments.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 px-1">Línea de Transporte</label>
                      <select 
                        value={formData.transportLineId}
                        onChange={e => setFormData({...formData, transportLineId: e.target.value})}
                        className="w-full px-4 py-2.5 bg-stone-50 border border-stone-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        disabled={formData.role !== 'transport_admin'}
                      >
                        <option value="">Ninguna</option>
                        {transportLines.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
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
                      className="flex-1 py-3 bg-ml-acento text-white rounded-xl text-sm font-bold hover:bg-ml-acento/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                      {submitting ? 'Creando...' : 'Crear Administrador'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

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
                      admin.role === 'admin' ? 'bg-ml-neutral text-ml-secundario' : 'bg-ml-neutral text-ml-principal'
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
