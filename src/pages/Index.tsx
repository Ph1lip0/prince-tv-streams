import { AppLayout } from '@/components/layout/AppLayout';
import { Slideshow } from '@/components/home/Slideshow';
import { LiveMatches } from '@/components/home/LiveMatches';
import { CategorySection } from '@/components/home/CategorySection';
import { ChannelGrid } from '@/components/home/ChannelGrid';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Crown, Zap } from 'lucide-react';

const Index = () => {
  const { t, language } = useLanguage();
  const { profile, isSubscriptionActive } = useAuth();

  return (
    <AppLayout>
      <div className="px-4 pb-24 pt-4 space-y-6">
        {/* Welcome Banner */}
        {profile && !isSubscriptionActive() && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border border-primary/30 p-4">
            <div className="absolute -right-8 -top-8 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
            <div className="relative flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {language === 'sw' ? 'Dakika 2 za bure!' : '2 Free Minutes!'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {language === 'sw' 
                    ? 'Lipia TSh 5,000 kwa siku 30 za kutazama' 
                    : 'Pay TSh 5,000 for 30 days unlimited access'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Active Subscription Badge */}
        {profile && isSubscriptionActive() && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 border border-primary/30 w-fit">
            <Crown className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {language === 'sw' ? 'Premium Mtumiaji' : 'Premium User'}
            </span>
          </div>
        )}

        {/* Hero Slideshow */}
        <Slideshow />

        {/* Categories */}
        <CategorySection />

        {/* Featured Matches */}
        <LiveMatches />

        {/* All Channels Grid */}
        <ChannelGrid limit={9} />
      </div>
    </AppLayout>
  );
};

export default Index;
