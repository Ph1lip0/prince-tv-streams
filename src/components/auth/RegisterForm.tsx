import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Phone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export const RegisterForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signUp(email, password, fullName, phone);

    if (error) {
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: t('success'),
        description: t('language') === 'Lugha' 
          ? 'Akaunti yako imeundwa! Unaweza kutazama bure kwa dakika 2.'
          : 'Account created! You can watch free for 2 minutes.',
      });
      navigate('/');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder={t('fullName')}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="pl-10 bg-secondary border-border"
          required
        />
      </div>

      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="email"
          placeholder={t('email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="pl-10 bg-secondary border-border"
          required
        />
      </div>

      <div className="relative">
        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="tel"
          placeholder={t('phone')}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="pl-10 bg-secondary border-border"
          required
        />
      </div>

      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type={showPassword ? 'text' : 'password'}
          placeholder={t('password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="pl-10 pr-10 bg-secondary border-border"
          required
          minLength={6}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      <Button
        type="submit"
        className="w-full gradient-primary glow-primary"
        disabled={loading}
      >
        {loading ? t('loading') : t('register')}
      </Button>

      <p className="text-center text-muted-foreground text-sm">
        {t('language') === 'Lugha' ? "Una akaunti?" : "Have an account?"}{' '}
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="text-primary hover:underline"
        >
          {t('login')}
        </button>
      </p>
    </form>
  );
};