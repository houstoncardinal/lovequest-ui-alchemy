import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Heart, MessageCircle, Share2, Bookmark, Send, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import PostMenu from "@/components/PostMenu";
import { getDemoPost, getDemoComments, type DemoPost, type DemoComment } from "@/data/demoData";

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

const PostDetailView = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [post, setPost] = useState<DemoPost | null>(null);
  const [comments, setComments] = useState<DemoComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (postId) {
      // Try to load from DB first, fall back to demo
      loadPost();
    }
  }, [postId]);

  const loadPost = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('posts').select('*').eq('id', postId).single();
      if (error || !data) {
        // Use demo data
        const demoPost = getDemoPost(postId!);
        setPost(demoPost);
        setComments(getDemoComments(postId!));
      } else {
        setPost(data as any);
        // Fetch real comments
        const { data: commentsData } = await supabase
          .from('post_comments')
          .select('*, profiles!post_comments_user_id_fkey(display_name, avatar_url, first_name, last_name)')
          .eq('post_id', postId)
          .order('created_at', { ascending: true });
        if (commentsData && commentsData.length > 0) {
          setComments(commentsData as any);
        } else {
          setComments(getDemoComments(postId!));
        }
      }
    } catch {
      const demoPost = getDemoPost(postId!);
      setPost(demoPost);
      setComments(getDemoComments(postId!));
    } finally {
      setLoading(false);
    }
  };

  const handleLike = () => {
    if (!post) return;
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setPost(prev => prev ? { ...prev, likes_count: newLiked ? prev.likes_count + 1 : prev.likes_count - 1 } : null);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast({ title: isBookmarked ? "Bookmark removed" : "Post bookmarked ✓" });
  };

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/post/${postId}`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Check out this post', url: postUrl }); } catch {}
    } else {
      navigator.clipboard.writeText(postUrl);
      toast({ title: "Link copied!" });
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    // Add to local state immediately for responsiveness
    const newC: DemoComment = {
      id: `c-new-${Date.now()}`,
      content: newComment.trim(),
      created_at: new Date().toISOString(),
      user_id: user?.id || "me",
      profiles: { display_name: "You", avatar_url: "", first_name: "You", last_name: "" },
    };
    setComments(prev => [...prev, newC]);
    setPost(prev => prev ? { ...prev, comments_count: prev.comments_count + 1 } : null);
    setNewComment('');

    // Also try to persist
    if (user && postId) {
      try {
        await supabase.from('post_comments').insert({ post_id: postId, author_id: user.id, content: newC.content });
      } catch {}
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const diffMin = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000);
    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h ago`;
    return `${Math.floor(diffMin / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Post not found</p>
          <Button onClick={() => navigate('/community')} variant="outline">Back to Community</Button>
        </div>
      </div>
    );
  }

  const displayName = post.profiles?.display_name || 'Unknown';
  const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2);
  const selectedMood = post.mood ? moods.find(m => m.id === post.mood) : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5 mr-2" />Back
          </Button>
          <span className="text-sm font-medium text-foreground">Post</span>
          <div className="w-16" />
        </div>
      </div>

      {/* Post Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-4">
          {/* Author */}
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
              <AvatarImage src={post.profiles?.avatar_url} />
              <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">{displayName}</h3>
                {selectedMood && (
                  <Badge variant="outline" className="text-xs"><span className="mr-1">{selectedMood.emoji}</span>{selectedMood.label}</Badge>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {post.location && <><span>{post.location}</span><span>•</span></>}
                <time>{formatTimeAgo(post.created_at)}</time>
              </div>
            </div>
          </div>

          {/* Content */}
          <p className="text-foreground leading-relaxed whitespace-pre-wrap mb-4">{post.content}</p>

          {/* Hashtags */}
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {post.hashtags.map((tag, i) => (
                <Badge key={i} variant="outline" className="bg-primary/5 border-primary/20 text-primary text-xs cursor-pointer">
                  <Hash className="w-2.5 h-2.5 mr-0.5" />{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Image */}
          {post.image_url && (
            <div className="rounded-2xl overflow-hidden mb-4">
              <img src={post.image_url} alt="Post" className="w-full h-auto max-h-96 object-cover" loading="lazy" />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between py-3 border-y border-border/30 mb-4">
            <div className="flex items-center gap-6">
              <motion.button onClick={handleLike} className={`flex items-center gap-2 ${isLiked ? 'text-red-500' : 'text-muted-foreground'}`} whileTap={{ scale: 0.9 }}>
                <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                <span className="font-medium text-sm">{post.likes_count}</span>
              </motion.button>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MessageCircle className="w-6 h-6" />
                <span className="font-medium text-sm">{comments.length}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleShare} className="h-9 w-9 p-0"><Share2 className="w-5 h-5" /></Button>
              <Button variant="ghost" size="sm" onClick={handleBookmark} className={`h-9 w-9 p-0 ${isBookmarked ? 'text-primary' : ''}`}>
                <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Comments */}
          <h4 className="font-semibold text-foreground mb-4">Comments ({comments.length})</h4>
          <div className="space-y-4 mb-4">
            {comments.map((comment) => {
              const cName = comment.profiles?.display_name || 'User';
              const cInitials = (comment.profiles?.first_name?.[0] || '') + (comment.profiles?.last_name?.[0] || '');
              return (
                <motion.div key={comment.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={comment.profiles?.avatar_url} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">{cInitials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 bg-muted/50 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-foreground">{cName}</span>
                      <span className="text-xs text-muted-foreground">{formatTimeAgo(comment.created_at)}</span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{comment.content}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Comment Input - Fixed bottom */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border/30 p-4">
        <div className="max-w-lg mx-auto flex items-end gap-3">
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 resize-none min-h-[44px] max-h-[120px] rounded-2xl"
            rows={1}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment(); } }}
          />
          <Button onClick={handleAddComment} disabled={!newComment.trim()} size="sm" className="rounded-full h-11 w-11 p-0 bg-gradient-primary">
            <Send className="w-4 h-4 text-primary-foreground" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PostDetailView;
