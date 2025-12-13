import { Tv, Trophy, Film, Music } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const categories = [
  { id: 'football', icon: Trophy, color: 'from-green-500 to-emerald-600' },
  { id: 'sports', icon: Tv, color: 'from-blue-500 to-cyan-600' },
  { id: 'movies', icon: Film, color: 'from-purple-500 to-pink-600' },
  { id: 'entertainment', icon: Music, color: 'from-orange-500 to-red-600' },
];

export const CategorySection = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <section className="mb-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">{t('categories')}</h3>
      <div className="grid grid-cols-4 gap-3">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => navigate(`/channels?category=${category.id}`)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card hover:scale-105 transition-transform"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-foreground" />
              </div>
              <span className="text-xs font-medium text-foreground">{t(category.id)}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};