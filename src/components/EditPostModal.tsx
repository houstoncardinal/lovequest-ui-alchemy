import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Post {
  id: string;
  content: string;
  location?: string;
  image_url?: string;
}

interface EditPostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: Post | null;
  onPostUpdated: () => void;
}

const EditPostModal = ({ open, onOpenChange, post, onPostUpdated }: EditPostModalProps) => {
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (post) {
      setContent(post.content);
      setLocation(post.location || "");
    }
  }, [post]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() || !post) {
      toast({
        title: "Content required",
        description: "Please write something to share",
        variant: "destructive",
      });
      return;
    }

    setUpdating(true);

    try {
      const { error } = await supabase
        .from('posts')
        .update({
          content: content.trim(),
          location: location.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', post.id);

      if (error) throw error;

      toast({
        title: "Post updated",
        description: "Your post has been updated successfully!",
      });

      onOpenChange(false);
      onPostUpdated();

    } catch (error) {
      console.error('Error updating post:', error);
      toast({
        title: "Error",
        description: "Failed to update post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-primary">
              <Edit className="w-4 h-4 text-white" />
            </div>
            Edit Post
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="content">Content</Label>
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

          {post?.image_url && (
            <div>
              <Label>Current Image</Label>
              <img
                src={post.image_url}
                alt="Post image"
                className="w-full h-40 object-cover rounded-lg mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Note: Image cannot be changed when editing
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={updating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={updating || !content.trim()}
            >
              {updating ? "Updating..." : "Update Post"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPostModal;