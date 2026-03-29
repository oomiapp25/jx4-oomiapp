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

  if (loading) {
    return (
      <div className="relative w-full aspect-[2/1] sm:aspect-[21/9] md:h-[400px] bg-stone-200 animate-pulse overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-stone-200 via-stone-100 to-stone-200 animate-shimmer" />
      </div>
    );
  }

  if (ads.length === 0) return null;

  return (
    <div className="relative w-full aspect-[2/1] sm:aspect-[21/9] md:h-[400px] bg-stone-200 overflow-hidden group">
      <AnimatePresence mode="wait">
        <motion.div
          key={ads[currentIndex].id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <img 
            src={ads[currentIndex].image_url} 
            alt={ads[currentIndex].title || ''} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          
          {ads[currentIndex].title && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4 sm:p-12">
              <h2 className="text-lg sm:text-2xl md:text-4xl font-black text-white drop-shadow-lg leading-tight max-w-2xl">
                {ads[currentIndex].title}
              </h2>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      {ads.length > 1 && (
        <>
          <button 
            onClick={prev}
            className="absolute left-0 top-0 bottom-0 w-10 sm:w-16 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/10"
          >
            <ChevronLeft className="w-6 h-6 sm:w-10 sm:h-10" />
          </button>
          <button 
            onClick={next}
            className="absolute right-0 top-0 bottom-0 w-10 sm:w-16 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/10"
          >
            <ChevronRight className="w-6 h-6 sm:w-10 sm:h-10" />
          </button>
        </>
      )}
    </div>
  );
}
