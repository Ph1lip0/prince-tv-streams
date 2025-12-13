import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { Slideshow as SlideshowType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import princeTvLogo from '@/assets/prince-tv-logo.jpg';

export const Slideshow = () => {
  const [slides, setSlides] = useState<SlideshowType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  useEffect(() => {
    fetchSlides();
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const fetchSlides = async () => {
    try {
      const { data, error } = await supabase
        .from('slideshows')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setSlides(data || []);
    } catch (error) {
      console.error('Error fetching slides:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSlideClick = (slide: SlideshowType) => {
    if (slide.link_type === 'channel' && slide.link_id) {
      navigate(`/watch/${slide.link_id}`);
    } else if (slide.link_type === 'match' && slide.link_id) {
      navigate(`/match/${slide.link_id}`);
    }
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  if (loading) {
    return (
      <div className="w-full aspect-[16/9] rounded-2xl bg-secondary animate-pulse" />
    );
  }

  if (slides.length === 0) {
    return (
      <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-secondary to-muted" />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <img 
            src={princeTvLogo} 
            alt="PRINCE TV" 
            className="w-24 h-24 rounded-2xl object-cover shadow-2xl mb-4 animate-pulse-glow"
          />
          <h2 className="text-2xl font-bold text-foreground mb-1">PRINCE TV</h2>
          <p className="text-sm text-muted-foreground">
            {language === 'sw' ? 'Burudani Yako, Popote Ulipo' : 'Your Entertainment, Anywhere'}
          </p>
        </div>
        {/* Decorative Elements */}
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      </div>
    );
  }

  const currentSlide = slides[currentIndex];

  return (
    <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden group shadow-lg">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 scale-105"
        style={{ backgroundImage: `url(${currentSlide.image_url})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-5">
        <div className="animate-fade-in">
          <h2 className="text-2xl font-bold text-foreground mb-2 drop-shadow-lg">{currentSlide.title}</h2>
          {currentSlide.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 max-w-[80%]">
              {currentSlide.description}
            </p>
          )}
          <Button
            onClick={() => handleSlideClick(currentSlide)}
            className="gradient-primary glow-primary hover:scale-105 transition-transform"
            size="lg"
          >
            <Play className="w-5 h-5 mr-2" />
            {t('watchNow')}
          </Button>
        </div>
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/70 backdrop-blur-sm text-foreground opacity-0 group-hover:opacity-100 transition-all hover:bg-background hover:scale-110"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/70 backdrop-blur-sm text-foreground opacity-0 group-hover:opacity-100 transition-all hover:bg-background hover:scale-110"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 right-5 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === currentIndex
                  ? "bg-primary w-6"
                  : "bg-foreground/40 w-2 hover:bg-foreground/60"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};
