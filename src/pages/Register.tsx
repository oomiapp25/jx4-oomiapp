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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white p-10 rounded shadow-sm border border-stone-100"
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-stone-900">Completa tus datos para crear tu cuenta</h1>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-stone-500 mb-1">Nombre Completo</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-stone-200 rounded text-sm focus:ring-1 focus:ring-ml-blue outline-none"
              placeholder="Juan Pérez"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 mb-1">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-stone-200 rounded text-sm focus:ring-1 focus:ring-ml-blue outline-none"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 mb-1">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-stone-200 rounded text-sm focus:ring-1 focus:ring-ml-blue outline-none"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded text-xs text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-ml-blue text-white rounded font-bold hover:bg-blue-600 transition-all disabled:opacity-50"
            >
              {loading ? 'Registrando...' : 'Crear cuenta'}
            </button>
            <Link 
              to="/login" 
              className="block w-full py-3 text-center text-ml-blue font-bold hover:bg-blue-50 rounded transition-all"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
