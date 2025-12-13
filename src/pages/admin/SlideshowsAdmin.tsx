import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import type { Slideshow } from '@/lib/types';

const SlideshowsAdmin = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slideshow | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    link_type: '' as 'channel' | 'match' | 'external' | '',
    link_id: '',
    order_index: 0,
    is_active: true,
  });

  const { data: slideshows, isLoading } = useQuery({
    queryKey: ['admin-slideshows'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('slideshows')
        .select('*')
        .order('order_index');
      if (error) throw error;
      return data as Slideshow[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const insertData = {
        ...data,
        link_type: data.link_type || null,
        link_id: data.link_id || null,
      };
      const { error } = await supabase.from('slideshows').insert([insertData]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-slideshows'] });
      toast({ title: 'Slideshow created successfully' });
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Error creating slideshow', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const updateData = {
        ...data,
        link_type: data.link_type || null,
        link_id: data.link_id || null,
      };
      const { error } = await supabase.from('slideshows').update(updateData).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-slideshows'] });
      toast({ title: 'Slideshow updated successfully' });
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Error updating slideshow', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('slideshows').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-slideshows'] });
      toast({ title: 'Slideshow deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting slideshow', description: error.message, variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      link_type: '',
      link_id: '',
      order_index: 0,
      is_active: true,
    });
    setEditingSlide(null);
    setIsOpen(false);
  };

  const handleEdit = (slide: Slideshow) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title,
      description: slide.description || '',
      image_url: slide.image_url,
      link_type: (slide.link_type as 'channel' | 'match' | 'external' | '') || '',
      link_id: slide.link_id || '',
      order_index: slide.order_index,
      is_active: slide.is_active,
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSlide) {
      updateMutation.mutate({ id: editingSlide.id, data: formData });
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
        <h1 className="text-3xl font-bold">Slideshows</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Slide
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingSlide ? 'Edit Slide' : 'Add Slide'}</DialogTitle>
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
              <div>
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="link_type">Link Type</Label>
                <Select 
                  value={formData.link_type} 
                  onValueChange={(value) => setFormData({ ...formData, link_type: value as 'channel' | 'match' | 'external' | '' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select link type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="channel">Channel</SelectItem>
                    <SelectItem value="match">Match</SelectItem>
                    <SelectItem value="external">External</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.link_type && (
                <div>
                  <Label htmlFor="link_id">Link ID/URL</Label>
                  <Input
                    id="link_id"
                    value={formData.link_id}
                    onChange={(e) => setFormData({ ...formData, link_id: e.target.value })}
                    placeholder={formData.link_type === 'external' ? 'https://...' : 'ID'}
                  />
                </div>
              )}
              <div>
                <Label htmlFor="order_index">Order</Label>
                <Input
                  id="order_index"
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingSlide ? 'Update' : 'Create'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {slideshows?.map((slide) => (
          <Card key={slide.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <img src={slide.image_url} alt={slide.title} className="w-24 h-16 object-cover rounded" />
                <div>
                  <h3 className="font-semibold">{slide.title}</h3>
                  <p className="text-sm text-muted-foreground">{slide.description}</p>
                  <p className="text-xs text-muted-foreground">
                    Order: {slide.order_index} | {slide.is_active ? '✅ Active' : '❌ Inactive'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => handleEdit(slide)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button 
                  variant="destructive" 
                  size="icon" 
                  onClick={() => deleteMutation.mutate(slide.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {slideshows?.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No slideshows yet. Add your first slide!</p>
        )}
      </div>
    </div>
  );
};

export default SlideshowsAdmin;
