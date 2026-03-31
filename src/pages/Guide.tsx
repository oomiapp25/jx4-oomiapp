import React from 'react';
import { motion } from 'motion/react';
import { Info, BookOpen, Star, Palette, CheckCircle2, ShoppingBag, MapPin, Users, Briefcase, Newspaper, Bus, Heart } from 'lucide-react';

export default function Guide() {
  const sections = [
    {
      id: 'caracteristicas',
      title: 'Características Principales',
      icon: <Info className="w-6 h-6 text-ml-monte-verde" />,
      items: [
        { title: 'Catálogo Digital', desc: 'Acceso completo a productos de tiendas locales en Paracotos.', icon: <ShoppingBag /> },
        { title: 'Compras Directas', desc: 'Proceso de compra simplificado y seguro.', icon: <CheckCircle2 /> },
        { title: 'Información Local', desc: 'Noticias, empleos y servicios de transporte actualizados.', icon: <MapPin /> },
        { title: 'Comunidad', desc: 'Espacio dedicado a la interacción y ayuda social.', icon: <Users /> }
      ]
    },
    {
      id: 'uso',
      title: 'Forma de Uso',
      icon: <BookOpen className="w-6 h-6 text-ml-quebrada" />,
      items: [
        { title: 'Explora', desc: 'Navega por las categorías y departamentos desde el inicio.', icon: <SearchIcon /> },
        { title: 'Selecciona', desc: 'Añade productos a tu carrito de compras con un clic.', icon: <PlusIcon /> },
        { title: 'Compra', desc: 'Completa tu pedido y coordina la entrega directa.', icon: <CreditCardIcon /> },
        { title: 'Participa', desc: 'Consulta noticias, empleos y servicios comunitarios.', icon: <HeartIcon /> }
      ]
    },
    {
      id: 'beneficios',
      title: 'Beneficios para Ti',
      icon: <Star className="w-6 h-6 text-ml-teja" />,
      items: [
        { title: 'Apoyo Local', desc: 'Impulsa la economía de nuestra parroquia Paracotos.', icon: <TrophyIcon /> },
        { title: 'Comodidad', desc: 'Encuentra todo lo que necesitas sin salir de casa.', icon: <HomeIcon /> },
        { title: 'Información Real', desc: 'Datos actualizados sobre transporte y servicios.', icon: <InfoIcon /> },
        { title: 'Conexión', desc: 'Mantente al tanto de lo que sucede en tu comunidad.', icon: <UsersIcon /> }
      ]
    }
  ];

  const colors = [
    { name: 'Monte Verde', hex: '#065F46', desc: 'Naturaleza y Esperanza', class: 'bg-ml-monte-verde' },
    { name: 'Quebrada', hex: '#1E3A8A', desc: 'Profundidad y Confianza', class: 'bg-ml-quebrada' },
    { name: 'Teja', hex: '#F59E0B', desc: 'Calidez y Tradición', class: 'bg-ml-teja' },
    { name: 'Hierro', hex: '#374151', desc: 'Solidez y Estructura', class: 'bg-ml-hierro' }
  ];

  return (
    <div className="min-h-screen bg-ml-white-cal pt-12 pb-24">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-ml-monte-verde rounded-[30px] shadow-2xl mb-6">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black text-ml-monte-verde tracking-tighter mb-4 uppercase">
            Guía JX4 <span className="text-ml-quebrada">Paracotos</span>
          </h1>
          <p className="text-ml-hierro font-medium max-w-2xl mx-auto">
            Descubre cómo nuestra plataforma digital conecta a la comunidad de Paracotos con el comercio local y servicios esenciales.
          </p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-20">
          {sections.map((section, idx) => (
            <motion.section 
              key={section.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-white rounded-2xl shadow-sm border border-stone-100">
                  {section.icon}
                </div>
                <h2 className="text-2xl font-black text-ml-hierro uppercase tracking-tight">
                  {section.title}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {section.items.map((item, i) => (
                  <div key={i} className="glass bg-white/60 p-6 rounded-[30px] border border-white/40 shadow-sm hover:shadow-md transition-all group">
                    <div className="w-12 h-12 bg-ml-white-cal rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      {React.cloneElement(item.icon as React.ReactElement, { className: "w-6 h-6 text-ml-monte-verde" })}
                    </div>
                    <h3 className="text-lg font-black text-ml-hierro mb-2 uppercase tracking-tighter">{item.title}</h3>
                    <p className="text-sm text-stone-500 font-medium leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.section>
          ))}

          {/* Color Palette Section */}
          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-stone-100">
                <Palette className="w-6 h-6 text-ml-teja" />
              </div>
              <h2 className="text-2xl font-black text-ml-hierro uppercase tracking-tight">
                Identidad Visual
              </h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {colors.map((color, i) => (
                <div key={i} className="glass bg-white/60 p-4 rounded-[30px] border border-white/40 shadow-sm flex flex-col items-center text-center">
                  <div className={`w-full aspect-square rounded-2xl mb-4 shadow-inner ${color.class}`} />
                  <h3 className="text-sm font-black text-ml-hierro uppercase tracking-tighter mb-1">{color.name}</h3>
                  <code className="text-[10px] font-mono text-stone-400 mb-2">{color.hex}</code>
                  <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">{color.desc}</p>
                </div>
              ))}
            </div>
          </motion.section>
        </div>

        {/* Footer CTA */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-24 p-12 bg-ml-monte-verde rounded-[40px] text-center text-white shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="relative z-10">
            <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter">¿Listo para comenzar?</h2>
            <p className="text-white/80 font-medium mb-8 max-w-md mx-auto">
              Únete a la red digital de Paracotos y descubre todo lo que tenemos para ofrecerte.
            </p>
            <button className="px-8 py-4 bg-white text-ml-monte-verde rounded-2xl font-black uppercase tracking-widest hover:bg-ml-teja hover:text-white transition-all shadow-xl">
              Explorar Catálogo
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Simple Icons to avoid missing imports
function SearchIcon({ className }: { className?: string }) { return <ShoppingBag className={className} />; }
function PlusIcon({ className }: { className?: string }) { return <PlusIconInternal className={className} />; }
function PlusIconInternal({ className }: { className?: string }) { return <CheckCircle2 className={className} />; }
function CreditCardIcon({ className }: { className?: string }) { return <CheckCircle2 className={className} />; }
function HeartIcon({ className }: { className?: string }) { return <Heart className={className} />; }
function TrophyIcon({ className }: { className?: string }) { return <CheckCircle2 className={className} />; }
function HomeIcon({ className }: { className?: string }) { return <CheckCircle2 className={className} />; }
function InfoIcon({ className }: { className?: string }) { return <Info className={className} />; }
function UsersIcon({ className }: { className?: string }) { return <Users className={className} />; }
