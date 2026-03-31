import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Hash } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

const PostCard = ({ post, currentUserId, onLike, onEdit, onDelete, formatTimeAgo }: PostCardProps) => {
  const [isLiked, setIsLiked] = useState(post.user_liked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [showHearts, setShowHearts] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [showPostDetail, setShowPostDetail] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  // Predefined moods with emojis (same as in CreatePostModal)
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

  const handleLike = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);

    if (newLikedState) {
      setShowHearts(true);
      setTimeout(() => setShowHearts(false), 1000);
    }

    onLike(post.id, isLiked);
  };

  const handlePostClick = () => {
    // Navigate to full post detail view instead of showing small dialog
    window.location.href = `/post/${post.id}`;
  };

  const handleBookmark = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to bookmark posts",
        variant: "destructive",
      });
      return;
    }

    const newBookmarkState = !isBookmarked;
    setIsBookmarked(newBookmarkState);

    // For MVP/demo: Store in localStorage or just show success
    // TODO: Implement database storage when tables are set up
    if (newBookmarkState) {
      // Store bookmark info (demo mode)
      const bookmarks = JSON.parse(localStorage.getItem('user_bookmarks') || '[]');
      bookmarks.push({ postId: post.id, timestamp: new Date().toISOString() });
      localStorage.setItem('user_bookmarks', JSON.stringify(bookmarks));

      toast({
        title: "Post bookmarked",
        description: "You can find this post in your saved posts",
      });
    } else {
      // Remove bookmark (demo mode)
      const bookmarks = JSON.parse(localStorage.getItem('user_bookmarks') || '[]');
      const filteredBookmarks = bookmarks.filter((b: any) => b.postId !== post.id);
      localStorage.setItem('user_bookmarks', JSON.stringify(filteredBookmarks));

      toast({
        title: "Bookmark removed",
        description: "Post removed from your saved posts",
      });
    }
  };

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/community/post/${post.id}`;
    const postText = `${displayName}: ${post.content.slice(0, 100)}...`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this post',
          text: postText,
          url: postUrl,
        });
        toast({
          title: "Post shared!",
          description: "Thanks for sharing",
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/community/post/${post.id}`;
    navigator.clipboard.writeText(postUrl).then(() => {
      toast({
        title: "Link copied!",
        description: "Post link copied to clipboard",
      });
    }).catch(() => {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    });
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) {
      toast({
        title: "Error",
        description: "Please enter a comment",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('post_comments')
        .insert({
          post_id: post.id,
          author_id: user.id,
          content: newComment.trim()
        });

      if (error) throw error;

      setNewComment('');
      toast({
        title: "Comment added!",
        description: "Your comment has been posted",
      });

      // Refresh comments if modal is open
      if (showPostDetail) {
        await fetchComments();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .select(`
          *,
          profiles!post_comments_user_id_fkey (
            display_name,
            avatar_url,
            first_name,
            last_name
          )
        `)
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const displayName = post.profiles?.display_name || 'Unknown User';
  const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2);

  const selectedMood = post.mood ? moods.find(mood => mood.id === post.mood) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <Card className="overflow-hidden border-0 shadow-elegant hover:shadow-glow transition-all duration-500 bg-card/80 backdrop-blur-sm border border-border/30">
        {/* Post Header */}
        <div className="p-5 pb-4 bg-gradient-glow/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative group">
                <Avatar className="ring-2 ring-primary/20 ring-offset-2 ring-offset-background transition-all duration-300 group-hover:ring-primary/40">
                  <AvatarImage src={post.profiles?.photos?.[0]} className="object-cover" />
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {(post.likes_count || 0) > 40 && (
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground text-sm truncate hover:text-primary transition-colors">
                    {displayName}
                  </h3>
                  {selectedMood && (
                    <Badge variant="outline" className="bg-background/50 border-border/30 text-xs">
                      <span className="mr-1">{selectedMood.emoji}</span>
                      {selectedMood.label}
                    </Badge>
                  )}
                  {(post.likes_count || 0) > 40 && (
                    <Badge variant="secondary" className="bg-gradient-primary/10 text-primary border-primary/20 text-xs shadow-sm">
                      ✨ Trending
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {post.location && (
                    <>
                      <span className="truncate max-w-24">{post.location}</span>
                      <span>•</span>
                    </>
                  )}
                  <time>{formatTimeAgo(post.created_at)}</time>
                </div>
              </div>
            </div>

            {currentUserId === post.author_id && (
              <PostMenu
                postId={post.id}
                onEdit={() => onEdit(post)}
                onDelete={() => onDelete(post.id)}
              />
            )}
          </div>
        </div>

        {/* Post Content */}
        <div className="px-5 pb-4 bg-gradient-to-b from-transparent to-card/20">
          <p
            onClick={handlePostClick}
            className="text-foreground leading-relaxed whitespace-pre-wrap text-sm line-clamp-3 hover:line-clamp-none transition-all duration-300 cursor-pointer"
          >
            {post.content}
          </p>
          
          {/* Hashtags */}
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {post.hashtags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-primary/5 border-primary/20 text-primary hover:bg-primary/10 transition-colors cursor-pointer text-xs"
                >
                  <Hash className="w-2.5 h-2.5 mr-0.5" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Post Image */}
        {post.image_url && (
          <div className="px-5 pb-4">
            <div className="relative overflow-hidden rounded-2xl bg-muted shadow-inner">
              <img
                src={post.image_url}
                alt="Post image"
                className="w-full h-auto max-h-96 object-cover transition-transform duration-500 hover:scale-105 cursor-pointer"
                loading="lazy"
                onClick={handlePostClick}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>
        )}

        {/* Post Actions */}
        <div className="px-5 py-4 border-t border-border/30 bg-gradient-to-r from-primary/5 via-transparent to-accent/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <motion.button
                onClick={handleLike}
                className={`flex items-center gap-2 transition-all duration-200 hover:scale-110 active:scale-95 ${
                  isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-400'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <div className="relative">
                  <Heart 
                    className={`w-5 h-5 transition-all duration-200 ${
                      isLiked ? 'fill-current scale-110' : ''
                    }`} 
                  />
                  <AnimatePresence>
                    {showHearts && (
                      <div className="absolute inset-0 pointer-events-none">
                        {[...Array(6)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ 
                              opacity: [0, 1, 0],
                              scale: [0, 1.2, 0],
                              x: Math.random() * 40 - 20,
                              y: -Math.random() * 30 - 10
                            }}
                            transition={{ 
                              duration: 0.8,
                              delay: i * 0.1,
                              ease: "easeOut"
                            }}
                            className="absolute"
                          >
                            <Heart className="w-3 h-3 fill-red-500 text-red-500" />
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </AnimatePresence>
                </div>
                <span className="font-medium text-sm">{likesCount}</span>
              </motion.button>
              
              <button
                onClick={() => {
                  setShowPostDetail(true);
                  fetchComments();
                }}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-105"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="font-medium text-sm">{post.comments_count}</span>
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="h-9 w-9 p-0 hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:scale-105"
              >
                <Share2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmark}
                className={`h-9 w-9 p-0 hover:bg-accent/10 hover:text-accent transition-all duration-200 hover:scale-105 ${
                  isBookmarked ? 'text-accent' : ''
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Post Detail Modal */}
      <Dialog open={showPostDetail} onOpenChange={setShowPostDetail}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Post Details</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Full Post Content */}
            <div className="border rounded-lg p-4 bg-card">
              <div className="flex items-center gap-3 mb-3">
                <Avatar>
                  <AvatarImage src={post.profiles?.photos?.[0]} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold">{displayName}</h4>
                  <p className="text-sm text-muted-foreground">{formatTimeAgo(post.created_at)}</p>
                </div>
              </div>

              <p className="text-sm mb-3 whitespace-pre-wrap">{post.content}</p>

              {post.image_url && (
                <img
                  src={post.image_url}
                  alt="Post image"
                  className="w-full rounded-lg mb-3"
                />
              )}

              {/* Post Stats */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{likesCount} likes</span>
                <span>{comments.length} comments</span>
              </div>
            </div>

            {/* Comments Section */}
            <div className="space-y-3">
              <h4 className="font-semibold">Comments</h4>

              {/* Add Comment */}
              <div className="flex gap-2">
                <Textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 resize-none"
                  rows={2}
                />
                <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                  Post
                </Button>
              </div>

              {/* Comments List */}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={comment.profiles?.avatar_url} />
                      <AvatarFallback>
                        {comment.profiles?.first_name?.[0]}{comment.profiles?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-muted rounded-lg p-3">
                        <p className="font-semibold text-sm">
                          {comment.profiles?.display_name ||
                           `${comment.profiles?.first_name} ${comment.profiles?.last_name}`.trim() ||
                           'User'}
                        </p>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimeAgo(comment.created_at)}
                      </p>
                    </div>
                  </div>
                ))}

                {comments.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No comments yet. Be the first to comment!
                  </p>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default PostCard;
