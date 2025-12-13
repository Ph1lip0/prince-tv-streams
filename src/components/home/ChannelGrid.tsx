import { useState, useEffect } from 'react';
import { Play, Tv } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { Channel } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

interface ChannelGridProps {
  category?: string;
  limit?: number;
}

export const ChannelGrid = ({ category, limit }: ChannelGridProps) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    fetchChannels();
  }, [category]);

  const fetchChannels = async () => {
    try {
      let query = supabase
        .from('channels')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (category) {
        query = query.eq('category', category);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      setChannels(data || []);
    } catch (error) {
      console.error('Error fetching channels:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Tv className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">{t('allChannels')}</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-video rounded-xl bg-secondary animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (channels.length === 0) {
    return (
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Tv className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">{t('allChannels')}</h3>
        </div>
        <div className="text-center py-12 rounded-2xl bg-card border border-border/50">
          <Tv className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">{t('noResults')}</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Tv className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">{t('allChannels')}</h3>
        </div>
        {limit && (
          <Button variant="ghost" size="sm" onClick={() => navigate('/channels')} className="text-primary hover:text-primary">
            View All →
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {channels.map((channel, index) => (
          <button
            key={channel.id}
            onClick={() => navigate(`/watch/${channel.id}`)}
            className="group relative aspect-video rounded-xl overflow-hidden bg-card border border-border/50 hover:border-primary/50 hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {channel.image_url ? (
              <img
                src={channel.image_url}
                alt={channel.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted">
                <span className="text-lg font-bold text-muted-foreground">
                  {channel.name.substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300">
                <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
              </div>
            </div>
            
            {/* Channel Name */}
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-background to-transparent">
              <p className="text-xs font-medium text-foreground line-clamp-1 drop-shadow">
                {channel.name}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
