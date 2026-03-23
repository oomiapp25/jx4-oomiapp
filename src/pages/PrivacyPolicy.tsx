import React from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-ml-white-cal pb-20 pt-10 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-ml-monte-verde/10 rounded-3xl flex items-center justify-center text-ml-monte-verde mx-auto">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-ml-monte-verde uppercase tracking-tighter">Política de Privacidad</h1>
          <p className="text-xs text-ml-hierro font-bold uppercase opacity-60">Última actualización: 23 de Marzo, 2026</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass bg-white p-8 rounded-[40px] shadow-xl space-y-8 text-ml-hierro"
        >
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-ml-monte-verde">
              <Eye className="w-5 h-5" />
              <h2 className="text-lg font-black uppercase tracking-tighter">1. Información que Recopilamos</h2>
            </div>
            <p className="text-sm leading-relaxed">
              En JX4 Paracotos, recopilamos información básica para procesar tus pedidos y mejorar tu experiencia:
            </p>
            <ul className="list-disc list-inside text-sm space-y-2 ml-4">
              <li>Nombre completo y datos de contacto (Email, Teléfono).</li>
              <li>Dirección de entrega para servicios de delivery.</li>
              <li>Historial de compras y preferencias.</li>
              <li>Información técnica del dispositivo (para optimización de la PWA).</li>
            </ul>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-ml-monte-verde">
              <Lock className="w-5 h-5" />
              <h2 className="text-lg font-black uppercase tracking-tighter">2. Uso de los Datos</h2>
            </div>
            <p className="text-sm leading-relaxed">
              Tus datos se utilizan exclusivamente para:
            </p>
            <ul className="list-disc list-inside text-sm space-y-2 ml-4">
              <li>Gestionar tus pedidos y entregas en la parroquia.</li>
              <li>Mantener la seguridad de tu cuenta mediante Supabase Auth.</li>
              <li>Enviarte notificaciones sobre el estado de tus compras.</li>
              <li>Mejorar los servicios de la comunidad de Paracotos.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-ml-monte-verde">
              <FileText className="w-5 h-5" />
              <h2 className="text-lg font-black uppercase tracking-tighter">3. Protección de Datos</h2>
            </div>
            <p className="text-sm leading-relaxed">
              Utilizamos infraestructura de nivel empresarial (Supabase y PostgreSQL) con cifrado de datos para asegurar que tu información personal esté protegida contra accesos no autorizados. No vendemos ni compartimos tus datos con terceros para fines publicitarios.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-black uppercase tracking-tighter text-ml-monte-verde">4. Tus Derechos</h2>
            <p className="text-sm leading-relaxed">
              Puedes solicitar el acceso, corrección o eliminación de tus datos personales en cualquier momento a través de la configuración de tu perfil o contactando al administrador.
            </p>
          </section>

          <div className="pt-8 border-t border-ml-white-cal text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-ml-hierro/40">
              JX4 Paracotos - Haz todo aquí, recupera tu tiempo aquí.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
