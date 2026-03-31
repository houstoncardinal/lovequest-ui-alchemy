import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, X, Star, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

export const PhotoUploadManager = () => {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchPhotos = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('photos')
        .eq('user_id', user.id)
        .single();
      if (error) throw error;
      setPhotos(data?.photos || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const uploadPhoto = async (file: File) => {
    if (!user) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File Too Large", description: "Max 10MB.", variant: "destructive" });
      return;
    }

    setUploading(true);
    setUploadProgress(30);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('user-photos')
        .upload(fileName, file);
      if (uploadError) throw uploadError;

      setUploadProgress(70);

      const { data: { publicUrl } } = supabase.storage
        .from('user-photos')
        .getPublicUrl(fileName);

      const newPhotos = [...photos, publicUrl];
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ photos: newPhotos })
        .eq('user_id', user.id);
      if (updateError) throw updateError;

      setPhotos(newPhotos);
      setUploadProgress(100);
      toast({ title: "Photo Uploaded", description: "Your photo has been added." });
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({ title: "Upload Failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removePhoto = async (index: number) => {
    if (!user) return;
    try {
      const newPhotos = photos.filter((_, i) => i !== index);
      await supabase
        .from('profiles')
        .update({ photos: newPhotos })
        .eq('user_id', user.id);
      setPhotos(newPhotos);
      toast({ title: "Photo Removed" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to remove photo", variant: "destructive" });
    }
  };

  const setPrimaryPhoto = async (index: number) => {
    if (!user || index === 0) return;
    const newPhotos = [...photos];
    const [photo] = newPhotos.splice(index, 1);
    newPhotos.unshift(photo);
    try {
      await supabase.from('profiles').update({ photos: newPhotos }).eq('user_id', user.id);
      setPhotos(newPhotos);
      toast({ title: "Primary Photo Set" });
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Photos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {uploading && <Progress value={uploadProgress} className="w-full" />}
        
        <div className="grid grid-cols-3 gap-3">
          <AnimatePresence>
            {photos.map((photo, index) => (
              <motion.div
                key={photo}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative aspect-square rounded-lg overflow-hidden group"
              >
                <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                {index === 0 && (
                  <div className="absolute top-1 left-1 bg-primary text-primary-foreground rounded-full p-1">
                    <Star className="w-3 h-3" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {index !== 0 && (
                    <Button size="sm" variant="secondary" onClick={() => setPrimaryPhoto(index)}>
                      <Star className="w-3 h-3" />
                    </Button>
                  )}
                  <Button size="sm" variant="destructive" onClick={() => removePhoto(index)}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {photos.length < 6 && (
            <label className="aspect-square border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
              <Upload className="w-6 h-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground mt-1">Add Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0])}
                className="hidden"
                disabled={uploading}
              />
            </label>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
