import { useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase, Channel } from '@/lib/supabase';
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
      <section className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">{t('allChannels')}</h3>
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
      <section className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">{t('allChannels')}</h3>
        <div className="text-center py-8 text-muted-foreground">
          {t('noResults')}
        </div>
      </section>
    );
  }

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">{t('allChannels')}</h3>
        {limit && (
          <Button variant="ghost" size="sm" onClick={() => navigate('/channels')}>
            View All
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {channels.map((channel) => (
          <button
            key={channel.id}
            onClick={() => navigate(`/watch/${channel.id}`)}
            className="group relative aspect-video rounded-xl overflow-hidden bg-card hover:scale-105 transition-transform"
          >
            {channel.image_url ? (
              <img
                src={channel.image_url}
                alt={channel.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-secondary">
                <span className="text-xs font-medium text-muted-foreground">
                  {channel.name.substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
              <Play className="w-6 h-6 text-primary" />
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-background to-transparent">
              <p className="text-xs font-medium text-foreground line-clamp-1">
                {channel.name}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};