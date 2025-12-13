import { RegisterForm } from '@/components/auth/RegisterForm';
import { useLanguage } from '@/contexts/LanguageContext';
import princeTvLogo from '@/assets/prince-tv-logo.jpg';

const Register = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <img 
            src={princeTvLogo} 
            alt="PRINCE TV" 
            className="w-10 h-10 rounded-xl object-cover"
          />
          <span className="font-bold text-lg text-foreground">PRINCE TV</span>
        </div>
        <button
          onClick={() => setLanguage(language === 'sw' ? 'en' : 'sw')}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          {language === 'sw' ? 'English' : 'Kiswahili'}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div className="w-full max-w-sm space-y-8">
          {/* Logo */}
          <div className="text-center">
            <img 
              src={princeTvLogo} 
              alt="PRINCE TV" 
              className="w-24 h-24 mx-auto mb-4 rounded-2xl object-cover shadow-lg"
            />
            <h1 className="text-2xl font-bold text-foreground">PRINCE TV</h1>
            <p className="text-muted-foreground mt-2">
              {language === 'sw' 
                ? 'Jisajili kutazama moja kwa moja' 
                : 'Register to watch live'}
            </p>
          </div>

          <RegisterForm />

          {/* Subscription Info */}
          <div className="p-4 rounded-xl bg-secondary/50 border border-border">
            <p className="text-sm text-center text-muted-foreground">
              {language === 'sw' 
                ? '✨ Dakika 2 za bure kwa kila mtumiaji mpya!' 
                : '✨ 2 minutes free trial for new users!'}
            </p>
            <p className="text-xs text-center text-primary mt-2">
              TSh 5,000 / 30 {language === 'sw' ? 'siku' : 'days'}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 text-center text-xs text-muted-foreground">
        © 2024 PRINCE TV. All rights reserved.
      </div>
    </div>
  );
};

export default Register;
