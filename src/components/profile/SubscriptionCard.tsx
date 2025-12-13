import { useState } from 'react';
import { Crown, Clock, Phone, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export const SubscriptionCard = () => {
  const [phone, setPhone] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  
  const { user, profile, getSubscriptionStatus, refreshProfile } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  const status = getSubscriptionStatus();

  const handlePaymentRequest = async () => {
    if (!user || !phone) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.from('payment_requests').insert({
        user_id: user.id,
        amount: 5000,
        phone_number: phone,
        transaction_id: transactionId || null,
        status: 'pending'
      });

      if (error) throw error;

      toast({
        title: t('success'),
        description: t('paymentPending'),
      });
      
      setShowPaymentForm(false);
      setPhone('');
      setTransactionId('');
      await refreshProfile();
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'active': return 'text-primary bg-primary/10 border-primary/20';
      case 'pending': return 'text-warning bg-warning/10 border-warning/20';
      case 'expired': return 'text-destructive bg-destructive/10 border-destructive/20';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'active': return <CheckCircle className="w-5 h-5" />;
      case 'pending': return <Clock className="w-5 h-5" />;
      case 'expired': return <AlertCircle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Crown className="w-5 h-5 text-primary" />
          {t('subscription')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Badge */}
        <div className={cn("flex items-center gap-2 p-3 rounded-xl border", getStatusColor())}>
          {getStatusIcon()}
          <div className="flex-1">
            <p className="font-medium">{t(status)}</p>
            {status === 'active' && profile?.subscription_expires_at && (
              <p className="text-xs opacity-80">
                {t('expiresOn')}: {format(new Date(profile.subscription_expires_at), 'MMM dd, yyyy')}
              </p>
            )}
          </div>
        </div>

        {/* Subscription Info */}
        <div className="p-4 rounded-xl bg-secondary/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Package</span>
            <span className="font-semibold text-foreground">Premium</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Price</span>
            <span className="font-semibold text-primary">TSh 5,000</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Duration</span>
            <span className="font-semibold text-foreground">30 Days</span>
          </div>
        </div>

        {status !== 'active' && !showPaymentForm && (
          <Button
            onClick={() => setShowPaymentForm(true)}
            className="w-full gradient-primary glow-primary"
          >
            {t('subscribe')} - {t('subscriptionPrice')}
          </Button>
        )}

        {showPaymentForm && (
          <div className="space-y-4 p-4 rounded-xl bg-secondary/30 border border-border">
            <h4 className="font-semibold text-foreground">{t('paymentInstructions')}</h4>
            <div className="text-sm text-muted-foreground whitespace-pre-line">
              {t('mpesaInstructions')}
            </div>

            <div className="space-y-3 pt-2">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="tel"
                  placeholder="M-Pesa Number (e.g. 0712345678)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10 bg-background border-border"
                />
              </div>

              <Input
                type="text"
                placeholder="Transaction ID (Optional)"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="bg-background border-border"
              />

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowPaymentForm(false)}
                  className="flex-1"
                >
                  {t('cancel')}
                </Button>
                <Button
                  onClick={handlePaymentRequest}
                  disabled={loading || !phone}
                  className="flex-1 gradient-primary"
                >
                  {loading ? t('loading') : t('requestPayment')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};