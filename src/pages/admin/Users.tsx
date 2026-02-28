import { useState, useEffect } from 'react';
import { supabase, Department } from '../../lib/supabase';
import { Plus, UserPlus, Shield, Mail, MoreVertical, Phone, Building2 } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-stone-900">Gestión de Usuarios</h1>
        <button className="bg-stone-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-600 transition-all active:scale-95">
          <UserPlus className="w-4 h-4" />
          Invitar Admin
        </button>
      </div>

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
