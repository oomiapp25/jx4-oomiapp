import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users as UsersIcon, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const data = [
  { name: 'Lun', sales: 4000, orders: 24 },
  { name: 'Mar', sales: 3000, orders: 18 },
  { name: 'Mie', sales: 2000, orders: 12 },
  { name: 'Jue', sales: 2780, orders: 20 },
  { name: 'Vie', sales: 1890, orders: 15 },
  { name: 'Sab', sales: 2390, orders: 25 },
  { name: 'Dom', sales: 3490, orders: 30 },
];

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalUsers: 0,
    activeProducts: 0
  });

  useEffect(() => {
    setMounted(true);
    fetchStats();
  }, []);

  async function fetchStats() {
    // In a real app, these would be real queries
    const { count: productsCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
    const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: ordersCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
    
    setStats({
      totalSales: 12450.50, // Mock
      totalOrders: ordersCount || 0,
      totalUsers: usersCount || 0,
      activeProducts: productsCount || 0
    });
  }

  const statCards = [
    { label: 'Ventas Totales', value: `$${stats.totalSales}`, icon: DollarSign, trend: '+12.5%', up: true },
    { label: 'Pedidos', value: stats.totalOrders, icon: ShoppingBag, trend: '+5.2%', up: true },
    { label: 'Usuarios', value: stats.totalUsers, icon: UsersIcon, trend: '+2.4%', up: true },
    { label: 'Productos', value: stats.activeProducts, icon: TrendingUp, trend: '-1.1%', up: false },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-stone-50 rounded-lg">
                <stat.icon className="w-5 h-5 text-stone-600" />
              </div>
              <span className={`text-xs font-bold flex items-center gap-1 ${stat.up ? 'text-emerald-600' : 'text-red-500'}`}>
                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.trend}
              </span>
            </div>
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wider">{stat.label}</p>
            <h3 className="text-2xl font-black text-stone-900 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <h3 className="text-sm font-bold text-stone-900 mb-6 uppercase tracking-wider">Ventas Semanales</h3>
          <div className="h-80 w-full">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1c1917', border: 'none', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ color: '#10b981' }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <h3 className="text-sm font-bold text-stone-900 mb-6 uppercase tracking-wider">Pedidos por Día</h3>
          <div className="h-80 w-full">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ backgroundColor: '#1c1917', border: 'none', borderRadius: '12px', color: '#fff' }}
                  />
                  <Bar dataKey="orders" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Pedidos Recientes</h3>
          <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700">Ver todos</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-stone-50 text-[10px] font-black text-stone-400 uppercase tracking-widest">
                <th className="px-6 py-4">ID Pedido</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="text-sm hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-stone-500">#ORD-2026-00{i+1}</td>
                  <td className="px-6 py-4 font-medium text-stone-900">Cliente Ejemplo {i+1}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full uppercase">Completado</span>
                  </td>
                  <td className="px-6 py-4 font-bold">$120.00</td>
                  <td className="px-6 py-4 text-stone-500 text-xs">27 Feb 2026</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
