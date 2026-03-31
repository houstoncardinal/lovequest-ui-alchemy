import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const usePhotoVerification = () => {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchUploads = useCallback(async () => {
    if (!user) return;
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }, [user]);

  const uploadPhoto = async (file: File, isPrimary = false) => {
    if (!user || !file) return null;
    setUploading(true);
    try {
      if (!file.type.startsWith('image/')) throw new Error('Please select an image file');
      if (file.size > 10 * 1024 * 1024) throw new Error('File must be under 10MB');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('user-photos').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('user-photos').getPublicUrl(fileName);

      const newPhotos = isPrimary ? [publicUrl, ...photos] : [...photos, publicUrl];
      await supabase.from('profiles').update({ photos: newPhotos }).eq('user_id', user.id);
      setPhotos(newPhotos);
      toast({ title: "Photo uploaded" });
      return { id: fileName, file_url: publicUrl };
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({ title: "Upload failed", variant: "destructive" });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = async (uploadId: string) => {
    if (!user) return false;
    const index = photos.indexOf(uploadId);
    if (index === -1) return false;
    const newPhotos = photos.filter((_, i) => i !== index);
    await supabase.from('profiles').update({ photos: newPhotos }).eq('user_id', user.id);
    setPhotos(newPhotos);
    return true;
  };

  const setPrimaryPhoto = async (uploadId: string) => {
    if (!user) return false;
    const index = photos.indexOf(uploadId);
    if (index <= 0) return false;
    const newPhotos = [...photos];
    const [photo] = newPhotos.splice(index, 1);
    newPhotos.unshift(photo);
    await supabase.from('profiles').update({ photos: newPhotos }).eq('user_id', user.id);
    setPhotos(newPhotos);
    return true;
  };

  const getUploadStats = () => ({
    total: photos.length,
    approved: photos.length,
    pending: 0,
    rejected: 0,
    primaryPhoto: photos[0] ? { file_url: photos[0] } : null,
    hasApprovedPhotos: photos.length > 0,
    needsPrimaryPhoto: false
  });

  return {
    uploads: photos.map((url, i) => ({ id: url, file_url: url, is_primary: i === 0 })),
    loading,
    uploading,
    uploadPhoto,
    deletePhoto,
    setPrimaryPhoto,
    resubmitPhoto: async () => true,
    getUploadStats,
    refetch: fetchUploads,
  };
};
