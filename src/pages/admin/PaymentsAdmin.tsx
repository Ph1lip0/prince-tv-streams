import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Check, X } from 'lucide-react';
import type { PaymentRequest, Profile } from '@/lib/types';

interface PaymentWithProfile extends PaymentRequest {
  profiles: Pick<Profile, 'email' | 'full_name'> | null;
}

const PaymentsAdmin = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: payments, isLoading } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      
      // Fetch profiles separately
      const userIds = [...new Set(data?.map(p => p.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      return (data || []).map(payment => ({
        ...payment,
        profiles: profileMap.get(payment.user_id) || null
      })) as PaymentWithProfile[];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (payment: PaymentWithProfile) => {
      // Update payment status
      const { error: paymentError } = await supabase
        .from('payment_requests')
        .update({ 
          status: 'approved', 
          approved_at: new Date().toISOString(),
          approved_by: user?.id
        })
        .eq('id', payment.id);
      
      if (paymentError) throw paymentError;

      // Activate user subscription for 30 days
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          status: 'active',
          subscription_expires_at: expiresAt.toISOString()
        })
        .eq('id', payment.user_id);
      
      if (profileError) throw profileError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'Payment approved and user activated for 30 days' });
    },
    onError: (error) => {
      toast({ title: 'Error approving payment', description: error.message, variant: 'destructive' });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      const { error } = await supabase
        .from('payment_requests')
        .update({ status: 'rejected' })
        .eq('id', paymentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      toast({ title: 'Payment rejected' });
    },
    onError: (error) => {
      toast({ title: 'Error rejecting payment', description: error.message, variant: 'destructive' });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Rejected</Badge>;
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
      <h1 className="text-3xl font-bold mb-8">Payments</h1>

      <div className="grid gap-4">
        {payments?.map((payment) => (
          <Card key={payment.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{payment.profiles?.full_name || 'Unknown User'}</h3>
                  {getStatusBadge(payment.status)}
                </div>
                <p className="text-sm text-muted-foreground">{payment.profiles?.email}</p>
                <p className="text-sm text-muted-foreground">Phone: {payment.phone_number}</p>
                <p className="text-sm font-semibold text-primary">Amount: {payment.amount.toLocaleString()} TSH</p>
                {payment.transaction_id && (
                  <p className="text-xs text-muted-foreground">Transaction ID: {payment.transaction_id}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Date: {new Date(payment.created_at).toLocaleString()}
                </p>
              </div>
              {payment.status === 'pending' && (
                <div className="flex gap-2">
                  <Button 
                    variant="default"
                    size="sm"
                    onClick={() => approveMutation.mutate(payment)}
                    disabled={approveMutation.isPending}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => rejectMutation.mutate(payment.id)}
                    disabled={rejectMutation.isPending}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {payments?.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No payment requests yet.</p>
        )}
      </div>
    </div>
  );
};

export default PaymentsAdmin;
