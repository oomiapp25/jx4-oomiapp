import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleLogin(e: any) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/');
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-3xl border border-stone-200 shadow-xl shadow-stone-200/50"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-stone-900">Bienvenido de nuevo</h1>
          <p className="text-stone-500 text-sm mt-2">Ingresa a tu cuenta de JX4 Paracotos</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 px-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-100 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                placeholder="tu@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 px-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-100 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-stone-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-stone-100 text-center">
          <p className="text-stone-500 text-xs">
            ¿No tienes cuenta? <Link to="/register" className="text-emerald-600 font-bold hover:underline">Regístrate aquí</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
