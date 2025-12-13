import { useState, useEffect } from 'react';
import { Play, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase, Match } from '@/lib/supabase';
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
      <section className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">{t('liveNow')}</h3>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {[1, 2, 3].map((i) => (
            <div key={i} className="min-w-[280px] h-40 rounded-xl bg-secondary animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (matches.length === 0) return null;

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">{t('featured')}</h3>
        <Button variant="ghost" size="sm" onClick={() => navigate('/matches')}>
          {t('allChannels')}
        </Button>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
        {matches.map((match) => (
          <div
            key={match.id}
            onClick={() => match.channel_id && navigate(`/watch/${match.channel_id}`)}
            className="min-w-[280px] rounded-xl overflow-hidden bg-card cursor-pointer hover:scale-[1.02] transition-transform"
          >
            <div
              className="h-28 bg-cover bg-center relative"
              style={{ 
                backgroundImage: match.poster_url 
                  ? `url(${match.poster_url})` 
                  : 'linear-gradient(135deg, hsl(var(--secondary)), hsl(var(--muted)))' 
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
              {match.is_live && (
                <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-destructive text-destructive-foreground text-xs font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-destructive-foreground animate-pulse" />
                  LIVE
                </div>
              )}
            </div>
            
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-foreground">{match.team_home}</span>
                <span className="text-xs text-muted-foreground">VS</span>
                <span className="text-sm font-semibold text-foreground">{match.team_away}</span>
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {format(new Date(match.match_time), 'MMM dd, HH:mm')}
                </div>
                <div className="flex items-center gap-1 text-primary">
                  <Play className="w-3 h-3" />
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