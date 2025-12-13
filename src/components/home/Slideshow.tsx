import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase, Slideshow as SlideshowType } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export const Slideshow = () => {
  const [slides, setSlides] = useState<SlideshowType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useLanguage();

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
      <div className="w-full h-48 rounded-2xl bg-secondary animate-pulse" />
    );
  }

  if (slides.length === 0) {
    return (
      <div className="w-full h-48 rounded-2xl bg-secondary flex items-center justify-center">
        <div className="text-center">
          <Play className="w-12 h-12 text-primary mx-auto mb-2" />
          <p className="text-muted-foreground">PRINCE TV</p>
        </div>
      </div>
    );
  }

  const currentSlide = slides[currentIndex];

  return (
    <div className="relative w-full h-48 sm:h-56 rounded-2xl overflow-hidden group">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-500"
        style={{ backgroundImage: `url(${currentSlide.image_url})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-4">
        <h2 className="text-xl font-bold text-foreground mb-1">{currentSlide.title}</h2>
        {currentSlide.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {currentSlide.description}
          </p>
        )}
        <Button
          onClick={() => handleSlideClick(currentSlide)}
          className="w-fit gradient-primary glow-primary"
          size="sm"
        >
          <Play className="w-4 h-4 mr-2" />
          {t('watchNow')}
        </Button>
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/50 text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/50 text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-2 right-4 flex gap-1">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentIndex
                  ? "bg-primary w-4"
                  : "bg-foreground/30"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};