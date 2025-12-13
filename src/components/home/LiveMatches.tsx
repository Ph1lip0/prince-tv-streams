import { useState, useEffect } from 'react';
import { Play, Clock, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { Match } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

export const LiveMatches = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('is_featured', true)
        .order('match_time', { ascending: true })
        .limit(5);

      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">{t('featured')}</h3>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="min-w-[300px] h-44 rounded-2xl bg-secondary animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (matches.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-primary animate-pulse" />
          <h3 className="text-lg font-semibold text-foreground">{t('featured')}</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate('/matches')} className="text-primary hover:text-primary">
          {t('allChannels')} →
        </Button>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4">
        {matches.map((match, index) => (
          <div
            key={match.id}
            onClick={() => match.channel_id && navigate(`/watch/${match.channel_id}`)}
            className="min-w-[300px] rounded-2xl overflow-hidden bg-card border border-border/50 cursor-pointer hover:border-primary/50 hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div
              className="h-32 bg-cover bg-center relative"
              style={{ 
                backgroundImage: match.poster_url 
                  ? `url(${match.poster_url})` 
                  : 'linear-gradient(135deg, hsl(var(--secondary)), hsl(var(--muted)))' 
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
              {match.is_live && (
                <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center gap-1.5 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-destructive-foreground animate-pulse" />
                  LIVE
                </div>
              )}
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center shadow-lg">
                  <Play className="w-6 h-6 text-primary-foreground ml-1" />
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-foreground">{match.team_home}</span>
                <div className="px-2 py-1 rounded-lg bg-secondary">
                  <span className="text-xs font-medium text-muted-foreground">VS</span>
                </div>
                <span className="text-sm font-bold text-foreground">{match.team_away}</span>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  {format(new Date(match.match_time), 'MMM dd, HH:mm')}
                </div>
                <div className="flex items-center gap-1.5 text-primary font-medium">
                  <Play className="w-3.5 h-3.5" />
                  {t('watchNow')}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
