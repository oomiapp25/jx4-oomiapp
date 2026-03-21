import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react';

export default function Login() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccess('¡Registro exitoso! Ahora puedes iniciar sesión.');
    }
  }, [searchParams]);

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
      // Fetch profile to check role
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('roles')
          .eq('id', session.user.id)
          .single();
        
        const userRoles = profile?.roles || [];
        const userEmail = session.user.email?.toLowerCase() || '';
        const isSuperAdmin = userEmail === 'jjtovar1510@gmail.com';
        const hasAdminRole = userRoles.includes('admin') || userRoles.some((r: string) => r.includes('_admin'));

        if (hasAdminRole || isSuperAdmin) {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        navigate('/');
      }
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
          <h1 className="text-2xl font-bold text-ml-dark">¡Hola! Ingresa tu e-mail y contraseña</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-ml-principal mb-1">E-mail</label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-stone-200 rounded text-sm focus:ring-1 focus:ring-ml-secundario outline-none"
              placeholder="ejemplo@correo.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ml-principal mb-1">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-stone-200 rounded text-sm focus:ring-1 focus:ring-ml-secundario outline-none"
              placeholder="••••••••"
            />
          </div>

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded text-xs text-emerald-600 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {success}
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded text-xs text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-ml-acento text-white rounded font-bold hover:bg-ml-acento/90 transition-all disabled:opacity-50"
            >
              {loading ? 'Iniciando...' : 'Ingresar'}
            </button>
            <Link 
              to="/registro" 
              className="block w-full py-3 text-center text-ml-secundario font-bold hover:bg-ml-neutral rounded transition-all"
            >
              Crear cuenta
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
