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
      <DialogContent className="sm:max-w-md bg-white border border-border/50 shadow-lg h-screen max-h-screen flex flex-col p-0 sm:p-6 rounded-none sm:rounded-lg">
        <DialogHeader className="pb-4 border-b border-border/30">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-xl bg-gradient-primary shadow-elegant">
              <Upload className="w-5 h-5 text-primary-foreground" />
            </div>
            Create Post
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Share something meaningful with the community
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto space-y-6 pt-6 px-4 sm:px-0">
            <div className="space-y-3">
              <Label htmlFor="content" className="text-sm font-medium text-foreground">
                What's on your mind?
              </Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share something meaningful with the community..."
                className="min-h-[120px] resize-none border-border/50 focus:border-primary/50 bg-background/50"
                maxLength={1000}
              />
              <div className="text-xs text-muted-foreground text-right">
                {content.length}/1000
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="location" className="text-sm font-medium text-foreground">
                Location (optional)
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Add a location..."
                  className="pl-10 border border-border/50 focus:border-primary/50 bg-background/50 py-3 rounded-xl"
                  maxLength={100}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">Image (optional)</Label>
              {imagePreview ? (
                <div className="relative mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-xl border border-border/30"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={removeImage}
                    className="absolute top-3 right-3 h-8 w-8 rounded-full bg-background/80 hover:bg-background border border-border/50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="mt-2">
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <div className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 bg-gradient-glow">
                      <Image className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-sm font-medium text-foreground mb-1">
                        Click to upload an image
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG up to 10MB
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
          </div>
          <div className="flex gap-3 pt-6 border-t border-border/30 p-4 bg-white sticky bottom-0 left-0 w-full z-10 shadow-lg rounded-b-xl">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-border/50 hover:bg-muted/50"
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-primary hover:shadow-glow transition-all duration-300 text-primary-foreground font-medium rounded-xl border-0"
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