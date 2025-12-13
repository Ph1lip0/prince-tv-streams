import { useState, useEffect } from 'react';
import { Clock, Play, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase, Match } from '@/lib/supabase';
import { format, isToday, isTomorrow } from 'date-fns';
import { cn } from '@/lib/utils';

const Matches = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'live' | 'upcoming'>('all');
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
        .order('match_time', { ascending: true });

      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMatches = matches.filter((match) => {
    if (filter === 'live') return match.is_live;
    if (filter === 'upcoming') return !match.is_live;
    return true;
  });

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return t('language') === 'Lugha' ? 'Leo' : 'Today';
    if (isTomorrow(date)) return t('language') === 'Lugha' ? 'Kesho' : 'Tomorrow';
    return format(date, 'EEE, MMM dd');
  };

  return (
    <AppLayout>
      <div className="space-y-4 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">{t('matches')}</h1>

        {/* Filter Pills */}
        <div className="flex gap-2">
          {(['all', 'live', 'upcoming'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                filter === f
                  ? "gradient-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              {f === 'all' ? (t('language') === 'Lugha' ? 'Zote' : 'All') : 
               f === 'live' ? (t('language') === 'Lugha' ? 'Moja kwa Moja' : 'Live') :
               t('upcoming')}
            </button>
          ))}
        </div>

        {/* Matches List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-secondary animate-pulse" />
            ))}
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{t('noResults')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMatches.map((match) => (
              <button
                key={match.id}
                onClick={() => match.channel_id && navigate(`/watch/${match.channel_id}`)}
                className="w-full p-4 rounded-xl bg-card hover:bg-card/80 transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  {/* Poster */}
                  <div
                    className="w-16 h-16 rounded-lg bg-cover bg-center flex-shrink-0"
                    style={{
                      backgroundImage: match.poster_url
                        ? `url(${match.poster_url})`
                        : 'linear-gradient(135deg, hsl(var(--secondary)), hsl(var(--muted)))'
                    }}
                  />

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {match.is_live && (
                        <span className="px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground text-xs font-medium flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-destructive-foreground animate-pulse" />
                          LIVE
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {getDateLabel(new Date(match.match_time))}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-foreground line-clamp-1">
                      {match.team_home} vs {match.team_away}
                    </h3>
                    
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(match.match_time), 'HH:mm')}
                    </div>
                  </div>

                  {/* Play Button */}
                  {match.channel_id && (
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                      <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Matches;