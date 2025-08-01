import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface PhotoUpload {
  id: string;
  user_id: string;
  file_path: string;
  file_url: string;
  file_type?: string;
  file_size?: number;
  is_primary: boolean;
  is_verified: boolean;
  upload_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export const usePhotoVerification = () => {
  const { user } = useAuth();
  const [uploads, setUploads] = useState<PhotoUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUploads();
    }
  }, [user]);

  const fetchUploads = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('photo_uploads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUploads(data as PhotoUpload[] || []);
    } catch (error) {
      console.error('Error fetching uploads:', error);
      toast({
        title: "Error",
        description: "Failed to fetch photo uploads",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadPhoto = async (
    file: File, 
    isPrimary: boolean = false
  ): Promise<PhotoUpload | null> => {
    if (!user || !file) return null;

    setUploading(true);

    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        throw new Error('File size must be less than 10MB');
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      // Create upload record
      const uploadRecord = {
        user_id: user.id,
        file_path: uploadData.path,
        file_url: publicUrl,
        file_type: file.type,
        file_size: file.size,
        is_primary: isPrimary,
        is_verified: false,
        upload_status: 'pending' as const,
      };

      const { data: photoUpload, error: dbError } = await supabase
        .from('photo_uploads')
        .insert(uploadRecord)
        .select()
        .single();

      if (dbError) throw dbError;

      // Trigger content moderation
      try {
        const { data: moderationResult } = await supabase.functions.invoke('content-moderation', {
          body: {
            action: 'moderate_image',
            image_url: publicUrl,
            upload_id: photoUpload.id,
            user_id: user.id
          }
        });

        console.log('Photo submitted for moderation:', moderationResult);
      } catch (moderationError) {
        console.warn('Failed to trigger moderation:', moderationError);
        // Don't fail the upload if moderation fails
      }

      // Update local state
      setUploads(prev => [photoUpload as PhotoUpload, ...prev]);

      toast({
        title: "Photo uploaded",
        description: "Your photo is being reviewed and will be available soon",
      });

      return photoUpload as PhotoUpload;

    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload photo",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = async (uploadId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const upload = uploads.find(u => u.id === uploadId);
      if (!upload) throw new Error('Photo not found');

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('profile-photos')
        .remove([upload.file_path]);

      if (storageError) {
        console.warn('Failed to delete from storage:', storageError);
        // Continue with database deletion even if storage deletion fails
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('photo_uploads')
        .delete()
        .eq('id', uploadId)
        .eq('user_id', user.id);

      if (dbError) throw dbError;

      // Update local state
      setUploads(prev => prev.filter(u => u.id !== uploadId));

      toast({
        title: "Photo deleted",
        description: "Photo has been removed from your profile",
      });

      return true;

    } catch (error) {
      console.error('Error deleting photo:', error);
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete photo",
        variant: "destructive",
      });
      return false;
    }
  };

  const setPrimaryPhoto = async (uploadId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const upload = uploads.find(u => u.id === uploadId);
      if (!upload) throw new Error('Photo not found');

      if (upload.upload_status !== 'approved') {
        toast({
          title: "Cannot set primary",
          description: "Photo must be approved before setting as primary",
          variant: "destructive",
        });
        return false;
      }

      // Unset current primary
      await supabase
        .from('photo_uploads')
        .update({ is_primary: false })
        .eq('user_id', user.id)
        .eq('is_primary', true);

      // Set new primary
      const { error } = await supabase
        .from('photo_uploads')
        .update({ is_primary: true })
        .eq('id', uploadId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update profile avatar
      await supabase
        .from('profiles')
        .update({ avatar_url: upload.file_url })
        .eq('user_id', user.id);

      // Update local state
      setUploads(prev => prev.map(u => ({
        ...u,
        is_primary: u.id === uploadId
      })));

      toast({
        title: "Primary photo updated",
        description: "Your profile photo has been updated",
      });

      return true;

    } catch (error) {
      console.error('Error setting primary photo:', error);
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update primary photo",
        variant: "destructive",
      });
      return false;
    }
  };

  const resubmitPhoto = async (uploadId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const upload = uploads.find(u => u.id === uploadId);
      if (!upload) throw new Error('Photo not found');

      // Reset status to pending
      const { error } = await supabase
        .from('photo_uploads')
        .update({ 
          upload_status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', uploadId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Trigger moderation again
      try {
        await supabase.functions.invoke('content-moderation', {
          body: {
            action: 'moderate_image',
            image_url: upload.file_url,
            upload_id: uploadId,
            user_id: user.id
          }
        });
      } catch (moderationError) {
        console.warn('Failed to trigger moderation:', moderationError);
      }

      // Update local state
      setUploads(prev => prev.map(u => 
        u.id === uploadId ? { ...u, upload_status: 'pending' } : u
      ));

      toast({
        title: "Photo resubmitted",
        description: "Your photo is being reviewed again",
      });

      return true;

    } catch (error) {
      console.error('Error resubmitting photo:', error);
      toast({
        title: "Resubmit failed",
        description: error instanceof Error ? error.message : "Failed to resubmit photo",
        variant: "destructive",
      });
      return false;
    }
  };

  const getUploadStats = () => {
    const total = uploads.length;
    const approved = uploads.filter(u => u.upload_status === 'approved').length;
    const pending = uploads.filter(u => u.upload_status === 'pending').length;
    const rejected = uploads.filter(u => u.upload_status === 'rejected').length;
    const primaryPhoto = uploads.find(u => u.is_primary);

    return {
      total,
      approved,
      pending,
      rejected,
      primaryPhoto,
      hasApprovedPhotos: approved > 0,
      needsPrimaryPhoto: approved > 0 && !primaryPhoto
    };
  };

  return {
    uploads,
    loading,
    uploading,
    uploadPhoto,
    deletePhoto,
    setPrimaryPhoto,
    resubmitPhoto,
    getUploadStats,
    refetch: fetchUploads,
  };
};