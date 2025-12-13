import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserCheck, UserX, Calendar } from 'lucide-react';
import type { Profile } from '@/lib/types';

const UsersAdmin = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Profile[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, expiresAt }: { id: string; status: 'pending' | 'active' | 'expired'; expiresAt?: string }) => {
      const updateData: { status: 'pending' | 'active' | 'expired'; subscription_expires_at?: string } = { status };
      if (expiresAt) {
        updateData.subscription_expires_at = expiresAt;
      }
      const { error } = await supabase.from('profiles').update(updateData).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'User updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error updating user', description: error.message, variant: 'destructive' });
    },
  });

  const activateUser = (userId: string) => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    updateStatusMutation.mutate({ 
      id: userId, 
      status: 'active', 
      expiresAt: expiresAt.toISOString() 
    });
  };

  const deactivateUser = (userId: string) => {
    updateStatusMutation.mutate({ id: userId, status: 'expired' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'expired':
        return <Badge className="bg-red-500">Expired</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Users</h1>

      <div className="grid gap-4">
        {users?.map((user) => (
          <Card key={user.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{user.full_name || 'No name'}</h3>
                  {getStatusBadge(user.status)}
                </div>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="text-sm text-muted-foreground">{user.phone || 'No phone'}</p>
                {user.subscription_expires_at && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Calendar className="w-3 h-3" />
                    Expires: {new Date(user.subscription_expires_at).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {user.status !== 'active' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => activateUser(user.id)}
                    disabled={updateStatusMutation.isPending}
                  >
                    <UserCheck className="w-4 h-4 mr-1" />
                    Activate (30 days)
                  </Button>
                )}
                {user.status === 'active' && (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => deactivateUser(user.id)}
                    disabled={updateStatusMutation.isPending}
                  >
                    <UserX className="w-4 h-4 mr-1" />
                    Deactivate
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {users?.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No users yet.</p>
        )}
      </div>
    </div>
  );
};

export default UsersAdmin;
