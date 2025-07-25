import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Image, MapPin, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostCreated: () => void;
}

const CreatePostModal = ({ open, onOpenChange, onPostCreated }: CreatePostModalProps) => {
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `posts/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please write something to share",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let imageUrl = null;
      if (image) {
        imageUrl = await uploadImage(image);
      }

      const { error } = await supabase
        .from('posts')
        .insert({
          content: content.trim(),
          location: location.trim() || null,
          image_url: imageUrl,
          user_id: user.id,
        });

      if (error) throw error;

      toast({
        title: "Post created",
        description: "Your post has been shared with the community!",
      });

      setContent("");
      setLocation("");
      setImage(null);
      setImagePreview(null);
      onOpenChange(false);
      onPostCreated();

    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-primary">
              <Upload className="w-4 h-4 text-white" />
            </div>
            Create Post
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="content">What's on your mind?</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share something meaningful with the community..."
              className="min-h-[100px] resize-none"
              maxLength={1000}
            />
            <div className="text-xs text-muted-foreground text-right mt-1">
              {content.length}/1000
            </div>
          </div>

          <div>
            <Label htmlFor="location">Location (optional)</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Add a location..."
                className="pl-10"
                maxLength={100}
              />
            </div>
          </div>

          <div>
            <Label>Image (optional)</Label>
            {imagePreview ? (
              <div className="relative mt-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={removeImage}
                  className="absolute top-2 right-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="mt-2">
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    <Image className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload an image
                    </p>
                  </div>
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={uploading || !content.trim()}
            >
              {uploading ? "Posting..." : "Share Post"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;