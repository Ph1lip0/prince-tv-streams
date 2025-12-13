import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tv, Trophy, Users, CreditCard, Loader2 } from 'lucide-react';

const Dashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [channels, matches, profiles, payments] = await Promise.all([
        supabase.from('channels').select('id', { count: 'exact' }),
        supabase.from('matches').select('id', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('payment_requests').select('id', { count: 'exact' }).eq('status', 'pending'),
      ]);

      return {
        channels: channels.count || 0,
        matches: matches.count || 0,
        users: profiles.count || 0,
        pendingPayments: payments.count || 0,
      };
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Channels', value: stats?.channels || 0, icon: Tv, color: 'text-blue-500' },
    { label: 'Total Matches', value: stats?.matches || 0, icon: Trophy, color: 'text-green-500' },
    { label: 'Total Users', value: stats?.users || 0, icon: Users, color: 'text-purple-500' },
    { label: 'Pending Payments', value: stats?.pendingPayments || 0, icon: CreditCard, color: 'text-orange-500' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
