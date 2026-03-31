import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, Image, MapPin, X, Hash, Smile } from "lucide-react";
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
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  // Predefined moods with emojis
  const moods = [
    { id: "happy", emoji: "😊", label: "Happy" },
    { id: "grateful", emoji: "🙏", label: "Grateful" },
    { id: "blessed", emoji: "✨", label: "Blessed" },
    { id: "excited", emoji: "🎉", label: "Excited" },
    { id: "peaceful", emoji: "☮️", label: "Peaceful" },
    { id: "thoughtful", emoji: "🤔", label: "Thoughtful" },
    { id: "inspired", emoji: "💡", label: "Inspired" },
    { id: "hopeful", emoji: "🌟", label: "Hopeful" },
  ];

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

  const addHashtag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const tag = hashtagInput.trim().replace('#', '');
      if (tag && !hashtags.includes(tag) && hashtags.length < 10) {
        setHashtags([...hashtags, tag]);
        setHashtagInput('');
      }
    }
  };

  const removeHashtag = (tagToRemove: string) => {
    setHashtags(hashtags.filter(tag => tag !== tagToRemove));
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
          hashtags: hashtags,
          mood: selectedMood,
          author_id: user.id,
        });

      if (error) throw error;

      toast({
        title: "Post created",
        description: "Your post has been shared with the community!",
      });

      setContent("");
      setLocation("");
      setHashtags([]);
      setHashtagInput("");
      setSelectedMood(null);
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
        <DialogHeader className="pb-4 border-b border-border/30 px-4 pt-6 sm:px-0 sm:pt-0">
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
          <div className="flex-1 overflow-y-auto space-y-6 pt-8 px-4 sm:px-0 pb-4">
            {/* Content Input */}
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

            {/* Mood Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">
                <Smile className="w-4 h-4 inline mr-2" />
                How are you feeling? (optional)
              </Label>
              <div className="flex flex-wrap gap-2">
                {moods.map((mood) => (
                  <Button
                    key={mood.id}
                    type="button"
                    variant={selectedMood === mood.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedMood(selectedMood === mood.id ? null : mood.id)}
                    className={`text-sm ${
                      selectedMood === mood.id 
                        ? 'bg-gradient-primary text-primary-foreground border-0' 
                        : 'border-border/50 hover:bg-primary/5'
                    }`}
                  >
                    <span className="mr-1">{mood.emoji}</span>
                    {mood.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Hashtags */}
            <div className="space-y-3">
              <Label htmlFor="hashtags" className="text-sm font-medium text-foreground">
                <Hash className="w-4 h-4 inline mr-2" />
                Hashtags (optional)
              </Label>
              <Input
                id="hashtags"
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                onKeyDown={addHashtag}
                placeholder="Type a hashtag and press Enter or Space..."
                className="border border-border/50 focus:border-primary/50 bg-background/50 py-3 rounded-xl"
                maxLength={50}
              />
              {hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {hashtags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer"
                      onClick={() => removeHashtag(tag)}
                    >
                      #{tag}
                      <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {hashtags.length}/10 hashtags • Click a hashtag to remove it
              </p>
            </div>

            {/* Location Input */}
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

            {/* Image Upload */}
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

            {/* Extra space to ensure content is not cut off */}
            <div className="h-24"></div>
          </div>
          
          {/* Action Buttons - Fixed at bottom */}
          <div className="flex gap-3 pt-6 border-t border-border/30 p-4 bg-white z-10 shadow-lg">
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
              className={`flex-1 font-medium rounded-xl border-0 transition-all duration-300 ${
                content.trim() 
                  ? 'bg-gradient-primary hover:shadow-glow text-primary-foreground opacity-100' 
                  : 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
              }`}
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