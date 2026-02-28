import { useState, useEffect } from 'react';
import { supabase, Ad } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

export default function HeroCarousel() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAds() {
      const { data } = await supabase
        .from('ads')
        .select('*')
        .eq('active', true)
        .order('priority', { ascending: false });
      
      if (data) setAds(data);
      setLoading(false);
    }
    fetchAds();
  }, []);

  useEffect(() => {
    if (ads.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [ads]);

  const next = () => setCurrentIndex((prev) => (prev + 1) % ads.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length);

  if (loading || ads.length === 0) return null;

  return (
    <div className="relative w-full aspect-[21/9] md:aspect-[25/9] bg-stone-100 overflow-hidden rounded-[2rem] shadow-xl group">
      <AnimatePresence mode="wait">
        <motion.div
          key={ads[currentIndex].id}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img 
            src={ads[currentIndex].image_url} 
            alt={ads[currentIndex].title || ''} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          
          {/* Overlay Content */}
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900/80 via-stone-900/40 to-transparent flex flex-col justify-center px-8 md:px-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-xl"
            >
              {ads[currentIndex].title && (
                <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight drop-shadow-lg">
                  {ads[currentIndex].title}
                </h2>
              )}
              {ads[currentIndex].description && (
                <p className="text-stone-200 text-sm md:text-lg font-medium mb-8 drop-shadow-md line-clamp-2">
                  {ads[currentIndex].description}
                </p>
              )}
              {ads[currentIndex].link && (
                <a 
                  href={ads[currentIndex].link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-stone-900 px-8 py-3 rounded-2xl font-black text-sm hover:bg-emerald-500 hover:text-white transition-all active:scale-95 shadow-xl"
                >
                  Ver Más
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      {ads.length > 1 && (
        <>
          <button 
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:text-stone-900"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:text-stone-900"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {ads.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${currentIndex === i ? 'w-8 bg-emerald-500' : 'bg-white/40 hover:bg-white/60'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
