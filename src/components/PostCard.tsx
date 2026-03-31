import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Share2, Bookmark, Hash } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import PostMenu from "@/components/PostMenu";

interface PostCardProps {
  post: {
    id: string;
    content: string;
    image_url?: string | null;
    location?: string | null;
    hashtags?: string[] | null;
    mood?: string | null;
    likes_count: number | null;
    comments_count: number | null;
    created_at: string;
    author_id: string;
    profiles?: {
      display_name?: string | null;
      photos?: string[] | null;
    } | null;
    user_liked?: boolean;
  };
  currentUserId?: string;
  onLike: (postId: string, isLiked: boolean) => void;
  onEdit: (post: any) => void;
  onDelete: (postId: string) => void;
  formatTimeAgo: (dateString: string) => string;
}

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

const PostCard = ({ post, currentUserId, onLike, onEdit, onDelete, formatTimeAgo }: PostCardProps) => {
  const [isLiked, setIsLiked] = useState(post.user_liked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count ?? 0);
  const [showHearts, setShowHearts] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [showPostDetail, setShowPostDetail] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  const handleLike = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);
    if (newLikedState) {
      setShowHearts(true);
      setTimeout(() => setShowHearts(false), 800);
    }
    onLike(post.id, isLiked);
  };

  const handlePostClick = () => {
    window.location.href = `/post/${post.id}`;
  };

  const handleBookmark = () => {
    const newState = !isBookmarked;
    setIsBookmarked(newState);
    const bookmarks = JSON.parse(localStorage.getItem('user_bookmarks') || '[]');
    if (newState) {
      bookmarks.push({ postId: post.id, timestamp: new Date().toISOString() });
      localStorage.setItem('user_bookmarks', JSON.stringify(bookmarks));
      toast({ title: "Saved", description: "Post bookmarked" });
    } else {
      localStorage.setItem('user_bookmarks', JSON.stringify(bookmarks.filter((b: any) => b.postId !== post.id)));
      toast({ title: "Removed", description: "Bookmark removed" });
    }
  };

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/post/${post.id}`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Check out this post', text: post.content.slice(0, 100), url: postUrl }); } catch {}
    } else {
      navigator.clipboard.writeText(postUrl);
      toast({ title: "Link copied!" });
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;
    try {
      const { error } = await supabase.from('post_comments').insert({ post_id: post.id, author_id: user.id, content: newComment.trim() });
      if (error) throw error;
      setNewComment('');
      toast({ title: "Comment added!" });
      if (showPostDetail) fetchComments();
    } catch { toast({ title: "Error", description: "Failed to comment.", variant: "destructive" }); }
  };

  const fetchComments = async () => {
    try {
      const { data } = await supabase
        .from('post_comments')
        .select('*')
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });
      setComments(data || []);
    } catch {}
  };

  const displayName = post.profiles?.display_name || 'Unknown User';
  const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2);
  const selectedMood = post.mood ? moods.find(m => m.id === post.mood) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-300 bg-card">
        {/* Header */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar className="w-9 h-9 ring-2 ring-primary/10 ring-offset-1 ring-offset-background flex-shrink-0">
                <AvatarImage src={post.profiles?.photos?.[0]} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-semibold text-foreground text-sm truncate">{displayName}</h3>
                  {selectedMood && (
                    <span className="text-xs text-muted-foreground">{selectedMood.emoji} {selectedMood.label}</span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  {post.location && <><span className="truncate max-w-[100px]">{post.location}</span><span>·</span></>}
                  <time>{formatTimeAgo(post.created_at)}</time>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              {(post.likes_count || 0) > 40 && (
                <Badge variant="secondary" className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 h-5">
                  ✨ Trending
                </Badge>
              )}
              {currentUserId === post.author_id && (
                <PostMenu postId={post.id} onEdit={() => onEdit(post)} onDelete={() => onDelete(post.id)} />
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-3">
          <p
            onClick={handlePostClick}
            className="text-foreground text-sm leading-relaxed whitespace-pre-wrap cursor-pointer"
          >
            {post.content}
          </p>
          
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {post.hashtags.map((tag, index) => (
                <span key={index} className="text-primary text-xs font-medium cursor-pointer hover:underline">
                  <Hash className="w-2.5 h-2.5 inline mr-0.5" />{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Image */}
        {post.image_url && (
          <div className="px-4 pb-3">
            <div className="relative overflow-hidden rounded-xl bg-muted">
              <img
                src={post.image_url}
                alt="Post"
                className="w-full h-auto max-h-80 object-cover transition-transform duration-500 hover:scale-[1.02] cursor-pointer"
                loading="lazy"
                onClick={handlePostClick}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="px-4 py-3 border-t border-border/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <motion.button
                onClick={handleLike}
                whileTap={{ scale: 0.9 }}
                className={`flex items-center gap-1.5 transition-colors duration-200 ${
                  isLiked ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'
                }`}
              >
                <div className="relative">
                  <Heart className={`w-5 h-5 transition-all duration-200 ${isLiked ? 'fill-current scale-110' : ''}`} />
                  <AnimatePresence>
                    {showHearts && (
                      <>
                        {[...Array(4)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0, y: 0 }}
                            animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], y: -20 - i * 5, x: (i - 1.5) * 8 }}
                            transition={{ duration: 0.6, delay: i * 0.08 }}
                            className="absolute inset-0 pointer-events-none"
                          >
                            <Heart className="w-2.5 h-2.5 fill-destructive text-destructive" />
                          </motion.div>
                        ))}
                      </>
                    )}
                  </AnimatePresence>
                </div>
                <span className="text-xs font-medium">{likesCount}</span>
              </motion.button>
              
              <button
                onClick={() => { setShowPostDetail(true); fetchComments(); }}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-xs font-medium">{post.comments_count ?? 0}</span>
              </button>
            </div>
            
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={handleShare} className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors">
                <Share2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBookmark}
                className={`h-8 w-8 hover:bg-primary/10 transition-colors ${isBookmarked ? 'text-primary' : ''}`}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Comment Dialog */}
      <Dialog open={showPostDetail} onOpenChange={setShowPostDetail}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-hidden rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base">Comments</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[55vh] overflow-y-auto">
            <div className="border border-border/30 rounded-xl p-3 bg-muted/30">
              <div className="flex items-center gap-2.5 mb-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={post.profiles?.photos?.[0]} />
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-sm">{displayName}</h4>
                  <p className="text-[11px] text-muted-foreground">{formatTimeAgo(post.created_at)}</p>
                </div>
              </div>
              <p className="text-sm whitespace-pre-wrap">{post.content}</p>
            </div>

            <div className="flex gap-2">
              <Textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 resize-none text-sm rounded-xl min-h-[2.5rem]"
                rows={2}
              />
              <Button onClick={handleAddComment} disabled={!newComment.trim()} size="sm" className="self-end rounded-xl">
                Post
              </Button>
            </div>

            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-2.5">
                  <Avatar className="w-7 h-7">
                    <AvatarFallback className="text-[10px]">U</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-muted/50 rounded-xl p-2.5">
                      <p className="text-sm">{comment.content}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 ml-1">{formatTimeAgo(comment.created_at)}</p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-6">No comments yet. Be the first!</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default PostCard;
