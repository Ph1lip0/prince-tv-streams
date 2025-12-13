import { Tv, Trophy, Film, Music } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const categories = [
  { id: 'football', icon: Trophy, gradient: 'from-emerald-500 to-green-600', bgGlow: 'bg-emerald-500/20' },
  { id: 'sports', icon: Tv, gradient: 'from-blue-500 to-cyan-600', bgGlow: 'bg-blue-500/20' },
  { id: 'movies', icon: Film, gradient: 'from-purple-500 to-pink-600', bgGlow: 'bg-purple-500/20' },
  { id: 'entertainment', icon: Music, gradient: 'from-orange-500 to-red-600', bgGlow: 'bg-orange-500/20' },
];

export const CategorySection = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <section>
      <h3 className="text-lg font-semibold text-foreground mb-4">{t('categories')}</h3>
      <div className="grid grid-cols-4 gap-3">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => navigate(`/channels?category=${category.id}`)}
              className="group relative flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/50 hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              {/* Glow Effect */}
              <div className={`absolute inset-0 ${category.bgGlow} opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300`} />
              
              <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                <Icon className="w-6 h-6 text-foreground" />
              </div>
              <span className="relative text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                {t(category.id)}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
