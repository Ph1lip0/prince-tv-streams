import { ReactNode } from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

interface AppLayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

export const AppLayout = ({ children, hideNav = false }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-60 h-60 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 right-20 w-40 h-40 bg-primary/10 rounded-full blur-2xl" />
      </div>
      
      <Header />
      <main className="relative pt-20">
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
};
