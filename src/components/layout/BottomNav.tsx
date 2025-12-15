import { Home, Tv, Trophy, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: Home, labelKey: 'home' },
  { path: '/channels', icon: Tv, labelKey: 'channels' },
  { path: '/matches', icon: Trophy, labelKey: 'matches' },
  { path: '/profile', icon: User, labelKey: 'profile' },
];

export const BottomNav = () => {
  const { t } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass safe-bottom">
      <div className="flex items-center justify-around py-2 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200",
                  isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{t(item.labelKey)}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
export default BottomNav;