import { User, LogOut, Globe, ChevronRight, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { SubscriptionCard } from '@/components/profile/SubscriptionCard';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Profile = () => {
  const { user, profile, signOut, isAdmin } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Profile Header */}
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
            <User className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            {profile?.full_name || 'User'}
          </h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          {profile?.phone && (
            <p className="text-sm text-muted-foreground">{profile.phone}</p>
          )}
        </div>

        {/* Subscription Card */}
        <SubscriptionCard />

        {/* Settings */}
        <Card className="bg-card border-border">
          <CardContent className="p-0">
            {/* Admin Panel */}
            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="w-full flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors border-b border-border"
              >
                <Shield className="w-5 h-5 text-primary" />
                <span className="flex-1 text-left font-medium text-foreground">
                  {t('admin')} Panel
                </span>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            )}

            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'sw' ? 'en' : 'sw')}
              className="w-full flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors border-b border-border"
            >
              <Globe className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 text-left font-medium text-foreground">
                {t('language')}
              </span>
              <span className="text-sm text-muted-foreground">
                {language === 'sw' ? 'Kiswahili' : 'English'}
              </span>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Logout */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-4 p-4 hover:bg-destructive/10 transition-colors text-destructive"
            >
              <LogOut className="w-5 h-5" />
              <span className="flex-1 text-left font-medium">{t('logout')}</span>
            </button>
          </CardContent>
        </Card>

        {/* App Info */}
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>PRINCE TV v1.0.0</p>
          <p>© 2024 All rights reserved</p>
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;