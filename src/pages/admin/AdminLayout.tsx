import React from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Tv, 
  Trophy, 
  Image, 
  Users, 
  CreditCard,
  LogOut,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminLayout = () => {
  const { isAdmin, loading } = useAdmin();
  const { user, signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/channels', icon: Tv, label: 'Channels' },
    { path: '/admin/matches', icon: Trophy, label: 'Matches' },
    { path: '/admin/slideshows', icon: Image, label: 'Slideshows' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/payments', icon: CreditCard, label: 'Payments' },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border p-4 flex flex-col">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-primary">PRINCE TV Admin</h1>
        </div>
        
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="pt-4 border-t border-border">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3"
            onClick={signOut}
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
