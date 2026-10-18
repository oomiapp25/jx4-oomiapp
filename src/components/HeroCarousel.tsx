import { useState, useEffect } from 'react';
import { supabase, Ad } from '../lib/supabase';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HeroCarousel() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    async function fetchAds() {
      const { data } = await supabase
        .from('ads')
        .select('*')
        .eq('active', true)
        .order('priority', { ascending: false });
      
      if (data && data.length > 0) {
        setAds(data);
        // Pre-carga inmediata de todas las imágenes del banner para evitar saltos o parpadeos
        data.forEach((ad) => {
          if (ad.image_url) {
            const img = new Image();
            img.src = ad.image_url;
          }
        });
      }
      setLoading(false);
    }
    fetchAds();
  }, []);

  useEffect(() => {
    if (ads.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [ads.length, isPaused]);

  const next = () => setCurrentIndex((prev) => (prev + 1) % ads.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length);

  if (loading) {
    return (
      <div className="relative w-full aspect-[2/1] sm:aspect-[21/9] md:aspect-[24/9] bg-stone-200 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-stone-200 via-stone-100 to-stone-200 animate-pulse" />
      </div>
    );
  }

  if (ads.length === 0) return null;

  return (
    <div 
      className="relative w-full aspect-[2/1] sm:aspect-[21/9] md:aspect-[24/9] bg-stone-900 overflow-hidden group select-none shadow-md"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Transición fluida tipo Cross-Fade sin desmontar ni dejar la pantalla en blanco */}
      {ads.map((ad, index) => {
        const isActive = index === currentIndex;
        return (
          <div
            key={ad.id}
            aria-hidden={!isActive}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out will-change-opacity ${
              isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img 
              src={ad.image_url} 
              alt={ad.title || 'Banner publicitario'} 
              className="w-full h-full object-cover"
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding="async"
              referrerPolicy="no-referrer"
            />
            
            {ad.title && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-4 sm:p-10 md:p-14 pointer-events-none">
                <h2 className="text-base sm:text-2xl md:text-4xl font-black text-white drop-shadow-lg leading-tight max-w-2xl uppercase tracking-tighter">
                  {ad.title}
                </h2>
              </div>
            )}
          </div>
        );
      })}

      {/* Indicadores de paginación (Dots) */}
      {ads.length > 1 && (
        <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2">
          {ads.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Ir al banner ${idx + 1}`}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex 
                  ? 'w-6 sm:w-8 bg-amber-400 shadow-md' 
                  : 'w-1.5 sm:w-2 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}

      {/* Flechas de navegación */}
      {ads.length > 1 && (
        <>
          <button 
            onClick={prev}
            aria-label="Anterior banner"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity active:scale-95 shadow-lg"
          >
            <ChevronLeft className="w-5 h-5 sm:w-7 sm:h-7" />
          </button>
          <button 
            onClick={next}
            aria-label="Siguiente banner"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity active:scale-95 shadow-lg"
          >
            <ChevronRight className="w-5 h-5 sm:w-7 sm:h-7" />
          </button>
        </>
      )}
    </div>
  );
}
