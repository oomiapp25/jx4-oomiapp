import { useAuth } from '../hooks/useAuth';
import { User, Mail, Shield, Calendar, Phone, MapPin } from 'lucide-react';
import { motion } from 'motion/react';

export default function Profile() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] border border-ml-white-cal shadow-sm overflow-hidden"
      >
        {/* Header/Cover */}
        <div className="h-32 bg-ml-monte-verde relative">
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 bg-white rounded-3xl shadow-lg flex items-center justify-center border-4 border-white">
              <User className="w-12 h-12 text-ml-monte-verde" />
            </div>
          </div>
        </div>

        <div className="pt-16 pb-8 px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-ml-monte-verde tracking-tight">
                {user.full_name || user.email?.split('@')[0]}
              </h1>
              <p className="text-ml-hierro font-medium flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4" />
                {user.email}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${
              user.role === 'admin' ? 'bg-ml-teja text-white' : 'bg-ml-quebrada text-white'
            }`}>
              Rol: {user.role}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <div className="space-y-6">
              <h3 className="text-xs font-black text-ml-hierro uppercase tracking-[0.2em] border-b border-ml-white-cal pb-2">
                Información Personal
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-ml-white-cal rounded-xl flex items-center justify-center text-ml-monte-verde">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-ml-hierro uppercase tracking-widest">Teléfono</p>
                    <p className="text-sm font-bold text-ml-monte-verde">{user.phone_number || 'No registrado'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-ml-white-cal rounded-xl flex items-center justify-center text-ml-monte-verde">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-ml-hierro uppercase tracking-widest">Miembro desde</p>
                    <p className="text-sm font-bold text-ml-monte-verde">
                      {new Date(user.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xs font-black text-ml-hierro uppercase tracking-[0.2em] border-b border-ml-white-cal pb-2">
                Seguridad y Cuenta
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-ml-white-cal rounded-xl flex items-center justify-center text-ml-monte-verde">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-ml-hierro uppercase tracking-widest">Estado de Cuenta</p>
                    <p className="text-sm font-bold text-ml-quebrada">Verificada</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-ml-white-cal rounded-xl flex items-center justify-center text-ml-monte-verde">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-ml-hierro uppercase tracking-widest">Ubicación Principal</p>
                    <p className="text-sm font-bold text-ml-monte-verde">Paracotos, Venezuela</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-ml-white-cal">
            <button 
              onClick={() => window.history.back()}
              className="px-8 py-3 bg-ml-white-cal text-ml-monte-verde rounded-2xl text-sm font-black hover:bg-ml-monte-verde hover:text-white transition-all"
            >
              Volver
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
