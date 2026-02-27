import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleRegister(e: any) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
      navigate('/login');
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-3xl border border-stone-200 shadow-xl shadow-stone-200/50"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-stone-900">Crea tu cuenta</h1>
          <p className="text-stone-500 text-sm mt-2">Únete a la comunidad de JX4 Paracotos</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 px-1">Nombre Completo</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-100 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                placeholder="Juan Pérez"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 px-1">Correo Electrónico</label>
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
                placeholder="Mínimo 6 caracteres"
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
            {loading ? 'Registrando...' : 'Registrarse'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-stone-100 text-center">
          <p className="text-stone-500 text-xs">
            ¿Ya tienes cuenta? <Link to="/login" className="text-emerald-600 font-bold hover:underline">Inicia sesión aquí</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
