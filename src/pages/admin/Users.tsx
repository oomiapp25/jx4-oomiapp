import { useState, useEffect, FormEvent } from 'react';
import { supabase, Department } from '../../lib/supabase';
import { Plus, UserPlus, Shield, Mail, MoreVertical, Phone, Building2, X, Loader2, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../hooks/useAuth';

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'customer',
    departmentId: '',
    phoneNumber: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [usersRes, deptsRes] = await Promise.all([
      supabase.from('users').select('*').order('created_at', { ascending: false }),
      supabase.from('departments').select('*').order('name')
    ]);

    if (usersRes.data) setUsers(usersRes.data);
    if (deptsRes.data) setDepartments(deptsRes.data);
    setLoading(false);
  }

  async function updateUser(userId: string, updates: any) {
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId);

    if (error) alert('Error: ' + error.message);
    else fetchData();
  }

  async function handleCreateUser(e: FormEvent) {
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

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Error desconocido');

      alert('Usuario creado exitosamente');
      setIsModalOpen(false);
      setFormData({
        email: '',
        password: '',
        fullName: '',
        role: 'customer',
        departmentId: '',
        phoneNumber: ''
      });
      fetchData();
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-stone-900">Gestión de Usuarios</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-stone-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-600 transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          Nuevo Usuario
        </button>
      </div>

      {/* Create User Modal */}
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
                <h3 className="text-lg font-black text-stone-900">Crear Nuevo Usuario</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-stone-50 rounded-full transition-colors">
                  <X className="w-5 h-5 text-stone-400" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
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
                        className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
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
                      <option value="customer">Cliente</option>
                      <option value="admin">Administrador</option>
                      <option value="category_admin">Admin Categoría</option>
                      <option value="department_admin">Admin Departamento</option>
                      <option value="transport_admin">Admin Transporte</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 px-1">Departamento</label>
                    <select 
                      value={formData.departmentId}
                      onChange={e => setFormData({...formData, departmentId: e.target.value})}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="">Ninguno</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
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
                    className="flex-1 py-3 bg-stone-900 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {submitting ? 'Creando...' : 'Crear Usuario'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-stone-50 text-[10px] font-black text-stone-400 uppercase tracking-widest">
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4">Departamento</th>
                <th className="px-6 py-4">Teléfono</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {users.map((user) => (
                <tr key={user.id} className="text-sm hover:bg-stone-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center font-bold text-stone-500 text-xs">
                        {user.full_name?.[0] || 'U'}
                      </div>
                      <span className="font-bold text-stone-900">{user.full_name || 'Sin nombre'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={user.role}
                      onChange={(e) => updateUser(user.id, { role: e.target.value })}
                      className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase outline-none cursor-pointer ${
                        user.role === 'admin' ? 'bg-purple-50 text-purple-600' : 
                        user.role === 'customer' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                      }`}
                    >
                      <option value="customer">Customer</option>
                      <option value="admin">Admin</option>
                      <option value="category_admin">Cat Admin</option>
                      <option value="department_admin">Dept Admin</option>
                      <option value="transport_admin">Trans Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={user.department_id || ''}
                      onChange={(e) => updateUser(user.id, { department_id: e.target.value || null })}
                      className="text-xs bg-stone-50 border border-stone-100 rounded-lg px-2 py-1 outline-none"
                    >
                      <option value="">Ninguno</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 text-stone-400" />
                      <input 
                        type="text"
                        defaultValue={user.phone_number || ''}
                        onBlur={(e) => updateUser(user.id, { phone_number: e.target.value })}
                        placeholder="Sin teléfono"
                        className="bg-transparent border-none p-0 text-xs focus:ring-0 w-24"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-stone-500 font-medium">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3" />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-stone-400 hover:text-stone-900 transition-colors">
                      <MoreVertical className="w-4 h-4" />
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
