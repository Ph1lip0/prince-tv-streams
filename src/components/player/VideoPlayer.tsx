import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Maximize, Volume2, VolumeX, ArrowLeft, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Hls from 'hls.js';

interface VideoPlayerProps {
  streamUrl: string;
  title: string;
  channelId: string;
}

const TRIAL_DURATION = 120; // 2 minutes in seconds

export const VideoPlayer = ({ streamUrl, title }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [trialTimeLeft, setTrialTimeLeft] = useState(TRIAL_DURATION);
  const [trialEnded, setTrialEnded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  const navigate = useNavigate();
  const { isSubscriptionActive, getSubscriptionStatus } = useAuth();
  const { t } = useLanguage();
  
  const isPending = getSubscriptionStatus() === 'pending';

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isPending && isPlaying && !trialEnded) {
      timer = setInterval(() => {
        setTrialTimeLeft((prev) => {
          if (prev <= 1) {
            setTrialEnded(true);
            setIsPlaying(false);
            if (videoRef.current) {
              videoRef.current.pause();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isPending, isPlaying, trialEnded]);

  useEffect(() => {
    let hideTimer: NodeJS.Timeout;
    
    if (showControls && isPlaying) {
      hideTimer = setTimeout(() => setShowControls(false), 3000);
    }

    return () => clearTimeout(hideTimer);
  }, [showControls, isPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (trialEnded && isPending) return;
    
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      try {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.error('Error attempting fullscreen:', err);
      }
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // HLS stream handling
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    let hls: Hls | null = null;
    setIsLoading(true);
    setHasError(false);

    const isHlsStream = streamUrl.includes('.m3u8') || streamUrl.includes('.m3u');

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handleError = () => {
      setIsLoading(false);
      setHasError(true);
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    if (isHlsStream) {
      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          xhrSetup: (xhr) => {
            xhr.withCredentials = false;
          },
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('HLS manifest loaded');
          setIsLoading(false);
        });
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('HLS error:', data);
          if (data.fatal) {
            setHasError(true);
            setIsLoading(false);
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log('Network error, trying to recover...');
                hls?.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('Media error, trying to recover...');
                hls?.recoverMediaError();
                break;
              default:
                hls?.destroy();
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native HLS support
        video.src = streamUrl;
      } else {
        setHasError(true);
        setIsLoading(false);
      }
    } else {
      // Non-HLS streams (MP4, etc.)
      video.src = streamUrl;
    }

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      if (hls) {
        hls.destroy();
      }
    };
  }, [streamUrl]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative bg-background rounded-xl overflow-hidden",
        isFullscreen ? "fixed inset-0 z-50" : "aspect-video"
      )}
      onClick={() => setShowControls(true)}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain bg-black"
        playsInline
        crossOrigin="anonymous"
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error State */}
      {hasError && !isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black text-center p-4">
          <p className="text-destructive mb-2">Unable to load stream</p>
          <p className="text-muted-foreground text-sm">Please check the stream URL or try again later</p>
        </div>
      )}

      {/* Trial Timer */}
      {isPending && !trialEnded && (
        <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-warning/90 text-background text-sm font-medium">
          {t('trialTimeRemaining')}: {formatTime(trialTimeLeft)}
        </div>
      )}

      {/* Trial Ended Overlay */}
      {trialEnded && isPending && (
        <div className="absolute inset-0 bg-background/95 flex flex-col items-center justify-center p-6 text-center">
          <Lock className="w-16 h-16 text-primary mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">
            {t('freeTrialEnded')}
          </h3>
          <p className="text-muted-foreground mb-6">
            {t('subscriptionPrice')}
          </p>
          <Button
            onClick={() => navigate('/profile')}
            className="gradient-primary glow-primary"
          >
            {t('upgradeNow')}
          </Button>
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/40 transition-opacity",
          showControls || !isPlaying ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-foreground"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h2 className="text-foreground font-semibold flex-1 line-clamp-1">
            {title}
          </h2>
        </div>

        {/* Center Play Button */}
        {!isPlaying && !trialEnded && (
          <button
            onClick={togglePlay}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full gradient-primary glow-primary flex items-center justify-center"
          >
            <Play className="w-10 h-10 text-primary-foreground ml-1" />
          </button>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePlay}
            className="text-foreground"
            disabled={trialEnded && isPending}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </Button>

          <div className="flex-1" />

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="text-foreground"
          >
            {isMuted ? (
              <VolumeX className="w-6 h-6" />
            ) : (
              <Volume2 className="w-6 h-6" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="text-foreground"
          >
            <Maximize className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};