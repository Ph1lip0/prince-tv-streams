import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { VideoPlayer } from '@/components/player/VideoPlayer';
import { ChannelGrid } from '@/components/home/ChannelGrid';
import { supabase, Channel } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';

const Watch = () => {
  const { channelId } = useParams();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    if (channelId) {
      fetchChannel();
    }
  }, [channelId]);

  const fetchChannel = async () => {
    try {
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .eq('id', channelId)
        .single();

      if (error) throw error;
      setChannel(data);
    } catch (error) {
      console.error('Error fetching channel:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-16 h-16 rounded-xl gradient-primary animate-pulse-glow" />
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground">{t('error')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Video Player */}
      <VideoPlayer
        streamUrl={channel.stream_url}
        title={channel.name}
        channelId={channel.id}
      />

      {/* Channel Info */}
      <div className="p-4 space-y-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">{channel.name}</h1>
          {channel.description && (
            <p className="text-sm text-muted-foreground mt-1">{channel.description}</p>
          )}
        </div>

        {/* Related Channels */}
        <div className="pt-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {t('language') === 'Lugha' ? 'Vituo Vingine' : 'Other Channels'}
          </h3>
          <ChannelGrid category={channel.category} limit={6} />
        </div>
      </div>
    </div>
  );
};

export default Watch;