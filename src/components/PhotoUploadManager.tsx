import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, X, Star, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface PhotoUpload {
  id: string;
  user_id: string;
  file_path: string;
  file_url: string;
  file_size: number;
  file_type: string;
  is_primary: boolean;
  is_verified: boolean;
  upload_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export const PhotoUploadManager = () => {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<PhotoUpload[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  // Fetch user photos
  const fetchPhotos = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('photo_uploads')
        .select('*')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos((data || []) as PhotoUpload[]);
    } catch (error) {
      console.error('Error fetching photos:', error);
      toast({
        title: "Error",
        description: "Failed to load photos",
        variant: "destructive",
      });
    }
  }, [user]);

  // Load photos on component mount
  useState(() => {
    fetchPhotos();
  });

  // Handle file upload
  const uploadPhoto = async (file: File) => {
    if (!user) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      // Save photo record to database
      const { data: photoData, error: dbError } = await supabase
        .from('photo_uploads')
        .insert({
          user_id: user.id,
          file_path: fileName,
          file_url: urlData.publicUrl,
          file_size: file.size,
          file_type: file.type,
          is_primary: photos.length === 0, // First photo is primary
          upload_status: 'pending'
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setPhotos(prev => [photoData as PhotoUpload, ...prev]);
      
      toast({
        title: "Photo uploaded",
        description: "Your photo is being reviewed and will be available soon",
      });

    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      uploadPhoto(files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  // Set primary photo
  const setPrimaryPhoto = async (photoId: string) => {
    if (!user) return;

    try {
      // Remove primary from all photos
      await supabase
        .from('photo_uploads')
        .update({ is_primary: false })
        .eq('user_id', user.id);

      // Set new primary
      const { error } = await supabase
        .from('photo_uploads')
        .update({ is_primary: true })
        .eq('id', photoId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setPhotos(prev => prev.map(photo => ({
        ...photo,
        is_primary: photo.id === photoId
      })));

      // Update profile avatar_url
      const primaryPhoto = photos.find(p => p.id === photoId);
      if (primaryPhoto) {
        await supabase
          .from('profiles')
          .update({ avatar_url: primaryPhoto.file_url })
          .eq('user_id', user.id);
      }

      toast({
        title: "Primary photo updated",
        description: "This photo is now your main profile picture",
      });
    } catch (error) {
      console.error('Error setting primary photo:', error);
      toast({
        title: "Error",
        description: "Failed to update primary photo",
        variant: "destructive",
      });
    }
  };

  // Delete photo
  const deletePhoto = async (photo: PhotoUpload) => {
    if (!user) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('profile-photos')
        .remove([photo.file_path]);

      if (storageError) console.error('Storage deletion error:', storageError);

      // Delete from database
      const { error: dbError } = await supabase
        .from('photo_uploads')
        .delete()
        .eq('id', photo.id)
        .eq('user_id', user.id);

      if (dbError) throw dbError;

      // Update local state
      setPhotos(prev => prev.filter(p => p.id !== photo.id));

      // If deleted photo was primary, set next photo as primary
      if (photo.is_primary && photos.length > 1) {
        const nextPhoto = photos.find(p => p.id !== photo.id);
        if (nextPhoto) {
          setPrimaryPhoto(nextPhoto.id);
        }
      }

      toast({
        title: "Photo deleted",
        description: "Photo has been removed from your profile",
      });
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast({
        title: "Error",
        description: "Failed to delete photo",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Pending Review';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Photo Manager
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload and manage your profile photos. All photos are reviewed before being published.
          </p>
        </CardHeader>
        <CardContent>
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver 
                ? 'border-primary bg-primary/10' 
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <div className="space-y-2">
              <p className="text-lg font-medium">Upload a photo</p>
              <p className="text-sm text-muted-foreground">
                Drag and drop an image here, or click to browse
              </p>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadPhoto(file);
                }}
                className="hidden"
                id="photo-upload"
              />
              <Label htmlFor="photo-upload">
                <Button variant="outline" disabled={uploading} asChild>
                  <span>Choose File</span>
                </Button>
              </Label>
            </div>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="mt-4">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-muted-foreground mt-2">Uploading...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Photos Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Your Photos ({photos.length}/6)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {photos.map((photo) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative group"
                >
                  <div className="aspect-square relative overflow-hidden rounded-lg border">
                    <img
                      src={photo.file_url}
                      alt="Profile photo"
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="flex gap-2">
                        {!photo.is_primary && photo.upload_status === 'approved' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setPrimaryPhoto(photo.id)}
                          >
                            <Star className="w-4 h-4" />
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <X className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete photo</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this photo? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deletePhoto(photo)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="absolute top-2 left-2 flex gap-2">
                      {photo.is_primary && (
                        <Badge variant="secondary" className="text-xs">
                          <Star className="w-3 h-3 mr-1" />
                          Primary
                        </Badge>
                      )}
                    </div>

                    <div className="absolute top-2 right-2">
                      <Badge 
                        variant={photo.upload_status === 'approved' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {getStatusIcon(photo.upload_status)}
                        <span className="ml-1">{getStatusText(photo.upload_status)}</span>
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-2 text-center">
                    <p className="text-sm text-muted-foreground">
                      {(photo.file_size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {photos.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Upload className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No photos uploaded</p>
              <p className="text-sm">Upload your first photo to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};