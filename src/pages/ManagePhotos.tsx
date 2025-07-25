import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Plus, X, Upload, Loader2 } from "lucide-react";
import InteractiveMenu from "@/components/ui/modern-mobile-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import profile1 from "@/assets/profile-1.jpg";
import profile2 from "@/assets/profile-2.jpg";
import profile3 from "@/assets/profile-3.jpg";

const ManagePhotos = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState([
    { id: 1, url: profile1, isMain: true },
    { id: 2, url: profile2, isMain: false },
    { id: 3, url: profile3, isMain: false },
  ]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchUserPhotos();
  }, [user]);

  const handleSetMain = (id: number) => {
    setPhotos(photos.map(photo => ({
      ...photo,
      isMain: photo.id === id
    })));
  };

  const fetchUserPhotos = async () => {
    if (!user) return;
    
    try {
      // In a real app, you'd fetch photos from storage/database
      // For now, keeping the static photos as placeholders
    } catch (error) {
      console.error('Error fetching photos:', error);
    }
  };

  const handleRemovePhoto = async (id: number) => {
    try {
      // In a real app, you'd delete from storage here
      setPhotos(photos.filter(photo => photo.id !== id));
      
      toast({
        title: "Photo removed",
        description: "Photo has been successfully removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove photo. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Add new photo to the list
      const newPhoto = {
        id: photos.length + 1,
        url: data.publicUrl,
        isMain: photos.length === 0
      };

      setPhotos([...photos, newPhoto]);

      toast({
        title: "Photo uploaded",
        description: "Your photo has been successfully uploaded.",
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
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="flex items-center justify-between p-4">
          <button onClick={() => navigate("/account")}>
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Manage Photos</h1>
          <div></div>
        </div>
      </div>

      <div className="p-4">
        {/* Instructions */}
        <div className="bg-blue-50 rounded-2xl p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Photo Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Upload 2-6 high-quality photos</li>
            <li>• Your first photo will be your main profile picture</li>
            <li>• Show your face clearly in at least one photo</li>
            <li>• Avoid group photos as your main picture</li>
          </ul>
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {photos.map((photo, index) => (
            <div key={photo.id} className="relative">
              <div className="aspect-square bg-gray-200 rounded-2xl overflow-hidden">
                <img 
                  src={photo.url} 
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Photo Controls */}
              <div className="absolute top-2 left-2 right-2 flex justify-between">
                {photo.isMain && (
                  <div className="bg-primary text-white px-2 py-1 rounded-lg text-xs font-medium">
                    Main
                  </div>
                )}
                <div className="ml-auto">
                  <button
                    onClick={() => handleRemovePhoto(photo.id)}
                    className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Set as Main Button */}
              {!photo.isMain && (
                <button
                  onClick={() => handleSetMain(photo.id)}
                  className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-sm text-gray-900 py-2 rounded-lg text-sm font-medium"
                >
                  Set as Main
                </button>
              )}
            </div>
          ))}

          {/* Add Photo Button */}
          {photos.length < 6 && (
            <button
              onClick={handleFileSelect}
              disabled={uploading}
              className="aspect-square border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="w-8 h-8 text-gray-400 mb-2 animate-spin" />
              ) : (
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
              )}
              <span className="text-sm text-gray-500">
                {uploading ? "Uploading..." : "Add Photo"}
              </span>
            </button>
          )}
          
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Photo Count */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            {photos.length} of 6 photos added
          </p>
        </div>
      </div>

      <InteractiveMenu />
    </div>
  );
};

export default ManagePhotos;