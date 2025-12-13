import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import type { Match, Channel } from '@/lib/types';

const MatchesAdmin = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    team_home: '',
    team_away: '',
    match_time: '',
    poster_url: '',
    channel_id: '',
    is_live: false,
    is_featured: false,
  });

  const { data: matches, isLoading } = useQuery({
    queryKey: ['admin-matches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('match_time', { ascending: false });
      if (error) throw error;
      return data as Match[];
    },
  });

  const { data: channels } = useQuery({
    queryKey: ['admin-channels-list'],
    queryFn: async () => {
      const { data, error } = await supabase.from('channels').select('id, name');
      if (error) throw error;
      return data as Pick<Channel, 'id' | 'name'>[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const insertData = {
        ...data,
        channel_id: data.channel_id || null,
      };
      const { error } = await supabase.from('matches').insert([insertData]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-matches'] });
      toast({ title: 'Match created successfully' });
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Error creating match', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const updateData = {
        ...data,
        channel_id: data.channel_id || null,
      };
      const { error } = await supabase.from('matches').update(updateData).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-matches'] });
      toast({ title: 'Match updated successfully' });
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Error updating match', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('matches').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-matches'] });
      toast({ title: 'Match deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting match', description: error.message, variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      team_home: '',
      team_away: '',
      match_time: '',
      poster_url: '',
      channel_id: '',
      is_live: false,
      is_featured: false,
    });
    setEditingMatch(null);
    setIsOpen(false);
  };

  const handleEdit = (match: Match) => {
    setEditingMatch(match);
    setFormData({
      title: match.title,
      team_home: match.team_home,
      team_away: match.team_away,
      match_time: match.match_time.slice(0, 16),
      poster_url: match.poster_url || '',
      channel_id: match.channel_id || '',
      is_live: match.is_live,
      is_featured: match.is_featured,
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMatch) {
      updateMutation.mutate({ id: editingMatch.id, data: formData });
    } else {
      createMutation.mutate(formData);
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Matches</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Match
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingMatch ? 'Edit Match' : 'Add Match'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="team_home">Home Team</Label>
                  <Input
                    id="team_home"
                    value={formData.team_home}
                    onChange={(e) => setFormData({ ...formData, team_home: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="team_away">Away Team</Label>
                  <Input
                    id="team_away"
                    value={formData.team_away}
                    onChange={(e) => setFormData({ ...formData, team_away: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="match_time">Match Time</Label>
                <Input
                  id="match_time"
                  type="datetime-local"
                  value={formData.match_time}
                  onChange={(e) => setFormData({ ...formData, match_time: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="channel_id">Channel</Label>
                <Select value={formData.channel_id} onValueChange={(value) => setFormData({ ...formData, channel_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a channel" />
                  </SelectTrigger>
                  <SelectContent>
                    {channels?.map((channel) => (
                      <SelectItem key={channel.id} value={channel.id}>
                        {channel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="poster_url">Poster URL</Label>
                <Input
                  id="poster_url"
                  value={formData.poster_url}
                  onChange={(e) => setFormData({ ...formData, poster_url: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_live"
                    checked={formData.is_live}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_live: checked })}
                  />
                  <Label htmlFor="is_live">Live</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                  <Label htmlFor="is_featured">Featured</Label>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingMatch ? 'Update' : 'Create'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {matches?.map((match) => (
          <Card key={match.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                {match.poster_url && (
                  <img src={match.poster_url} alt={match.title} className="w-16 h-16 object-cover rounded" />
                )}
                <div>
                  <h3 className="font-semibold">{match.title}</h3>
                  <p className="text-sm text-muted-foreground">{match.team_home} vs {match.team_away}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(match.match_time).toLocaleString()}
                    {match.is_live && ' 🔴 LIVE'}
                    {match.is_featured && ' ⭐ Featured'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => handleEdit(match)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button 
                  variant="destructive" 
                  size="icon" 
                  onClick={() => deleteMutation.mutate(match.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {matches?.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No matches yet. Add your first match!</p>
        )}
      </div>
    </div>
  );
};

export default MatchesAdmin;
