// ✅ MIGRATED TO FIREBASE - Terminal 3 - 2025-01-15
import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { usePhotoVerification } from '@/hooks/usePhotoVerification';
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
  userId: string;
  filePath: string;
  fileUrl: string;
  fileSize?: number;
  fileType?: string;
  isPrimary: boolean;
  isVerified: boolean;
  uploadStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export const PhotoUploadManager = () => {
  const {
    uploads: photos,
    uploading,
    uploadPhoto: uploadPhotoHook,
    deletePhoto: deletePhotoHook,
    setPrimaryPhoto: setPrimaryPhotoHook
  } = usePhotoVerification();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  // Handle file upload
  const uploadPhoto = async (file: File) => {
    setUploadProgress(0);
    const isPrimary = photos.length === 0; // First photo is primary
    await uploadPhotoHook(file, isPrimary);
    setUploadProgress(100);
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
    await setPrimaryPhotoHook(photoId);
  };

  // Delete photo
  const deletePhoto = async (photo: PhotoUpload) => {
    await deletePhotoHook(photo.id);
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
                      src={photo.fileUrl}
                      alt="Profile photo"
                      className="w-full h-full object-cover"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="flex gap-2">
                        {!photo.isPrimary && photo.uploadStatus === 'approved' && (
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
                      {photo.isPrimary && (
                        <Badge variant="secondary" className="text-xs">
                          <Star className="w-3 h-3 mr-1" />
                          Primary
                        </Badge>
                      )}
                    </div>

                    <div className="absolute top-2 right-2">
                      <Badge
                        variant={photo.uploadStatus === 'approved' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {getStatusIcon(photo.uploadStatus)}
                        <span className="ml-1">{getStatusText(photo.uploadStatus)}</span>
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-2 text-center">
                    <p className="text-sm text-muted-foreground">
                      {photo.fileSize ? (photo.fileSize / 1024 / 1024).toFixed(1) : '0'} MB
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