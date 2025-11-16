import { useState, useEffect } from 'react';
import { db, collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc, orderBy as firestoreOrderBy, getDoc } from '@/integrations/firebase';
import { storage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from '@/integrations/firebase';
import { updateUserProfile, getUserProfile } from '@/lib/firestore/users';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface PhotoUpload {
  id: string;
  userId: string;
  filePath: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
  isPrimary: boolean;
  isVerified: boolean;
  uploadStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
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
      const photosQuery = query(
        collection(db, 'photoUploads'),
        where('userId', '==', user.uid),
        firestoreOrderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(photosQuery);
      const photoUploads = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PhotoUpload[];

      setUploads(photoUploads);
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
      const fileName = `${user.uid}/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `profile-photos/${fileName}`;

      // Upload to Firebase Storage
      const fileRef = storageRef(storage, filePath);
      await uploadBytes(fileRef, file, {
        cacheControl: 'public, max-age=3600',
      });

      // Get public URL
      const publicUrl = await getDownloadURL(fileRef);

      // Create upload record
      const uploadRecord = {
        userId: user.uid,
        filePath: filePath,
        fileUrl: publicUrl,
        fileType: file.type,
        fileSize: file.size,
        isPrimary: isPrimary,
        isVerified: false,
        uploadStatus: 'pending' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'photoUploads'), uploadRecord);

      const photoUpload: PhotoUpload = {
        id: docRef.id,
        ...uploadRecord
      };

      // Sync with users.photos[] array (single source of truth)
      const userProfile = await getUserProfile(user.uid);
      const currentPhotos = userProfile?.photos || [];

      // Add new photo to the beginning of the array
      await updateUserProfile(user.uid, {
        photos: [publicUrl, ...currentPhotos]
      });

      // TODO: Trigger content moderation via Cloud Function
      console.log('Photo uploaded, moderation will be implemented via Cloud Functions');

      // Update local state
      setUploads(prev => [photoUpload, ...prev]);

      toast({
        title: "Photo uploaded",
        description: "Your photo has been added to your profile",
      });

      return photoUpload;

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

      // Delete from Firebase Storage
      try {
        const fileRef = storageRef(storage, upload.filePath);
        await deleteObject(fileRef);
      } catch (storageError) {
        console.warn('Failed to delete from storage:', storageError);
        // Continue with database deletion even if storage deletion fails
      }

      // Delete from Firestore
      await deleteDoc(doc(db, 'photoUploads', uploadId));

      // Sync with users.photos[] array - remove the photo URL
      const userProfile = await getUserProfile(user.uid);
      const currentPhotos = userProfile?.photos || [];
      const updatedPhotos = currentPhotos.filter(photoUrl => photoUrl !== upload.fileUrl);

      await updateUserProfile(user.uid, {
        photos: updatedPhotos
      });

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

      if (upload.uploadStatus !== 'approved') {
        toast({
          title: "Cannot set primary",
          description: "Photo must be approved before setting as primary",
          variant: "destructive",
        });
        return false;
      }

      // Unset current primary - query and update all user's photos
      const photosQuery = query(
        collection(db, 'photoUploads'),
        where('userId', '==', user.uid),
        where('isPrimary', '==', true)
      );
      const currentPrimaryDocs = await getDocs(photosQuery);

      for (const photoDoc of currentPrimaryDocs.docs) {
        await updateDoc(doc(db, 'photoUploads', photoDoc.id), {
          isPrimary: false,
          updatedAt: new Date().toISOString()
        });
      }

      // Set new primary
      await updateDoc(doc(db, 'photoUploads', uploadId), {
        isPrimary: true,
        updatedAt: new Date().toISOString()
      });

      // Sync with users.photos[] array - move primary photo to index 0
      const userProfile = await getUserProfile(user.uid);
      const currentPhotos = userProfile?.photos || [];

      // Remove the photo from its current position and add it to the beginning
      const updatedPhotos = [
        upload.fileUrl,
        ...currentPhotos.filter(photoUrl => photoUrl !== upload.fileUrl)
      ];

      await updateUserProfile(user.uid, {
        photos: updatedPhotos
      });

      // Update local state
      setUploads(prev => prev.map(u => ({
        ...u,
        isPrimary: u.id === uploadId
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
      await updateDoc(doc(db, 'photoUploads', uploadId), {
        uploadStatus: 'pending',
        updatedAt: new Date().toISOString()
      });

      // TODO: Trigger moderation again via Cloud Function
      console.log('Photo resubmitted, moderation will be implemented via Cloud Functions');

      // Update local state
      setUploads(prev => prev.map(u =>
        u.id === uploadId ? { ...u, uploadStatus: 'pending' } : u
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
    const approved = uploads.filter(u => u.uploadStatus === 'approved').length;
    const pending = uploads.filter(u => u.uploadStatus === 'pending').length;
    const rejected = uploads.filter(u => u.uploadStatus === 'rejected').length;
    const primaryPhoto = uploads.find(u => u.isPrimary);

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