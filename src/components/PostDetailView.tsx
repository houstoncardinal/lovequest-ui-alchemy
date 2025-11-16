// Post detail view entrypoint; keep imports at the beginning to avoid syntax issues.
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Heart, MessageCircle, Share2, Bookmark, Send, MoreHorizontal, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

import PostMenu from "@/components/PostMenu";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Post {
  id: string;
  content: string;
  image_url?: string;
  location?: string;
  hashtags?: string[];
  mood?: string;
  is_trending: boolean;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_id: string;
  profiles?: {
    display_name?: string;
    avatar_url?: string;
    first_name?: string;
    last_name?: string;
  } | null;
  user_liked?: boolean;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: {
    display_name?: string;
    avatar_url?: string;
    first_name?: string;
    last_name?: string;
  } | null;
}

interface Like {
  id: string;
  created_at: string;
  user_id: string;
  profiles?: {
    display_name?: string;
    avatar_url?: string;
    first_name?: string;
    last_name?: string;
  } | null;
}

const PostDetailView = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [likes, setLikes] = useState<Like[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [likesLoading, setLikesLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

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

  useEffect(() => {
    if (postId) {
      fetchPost();
      fetchComments();
    }
  }, [postId]);

  const fetchPost = async () => {
    try {
      setLoading(true);

      // Use demo post data for now to avoid database errors
      const mockPost = createMockPost(postId!);
      setPost(mockPost);

      // Check if bookmarked
      const bookmarks = JSON.parse(localStorage.getItem('user_bookmarks') || '[]');
      setIsBookmarked(bookmarks.some((b: any) => b.postId === postId));
    } catch (error) {
      console.error('Error fetching post:', error);
      toast({
        title: "Error",
        description: "Failed to load post",
        variant: "destructive",
      });
      navigate('/community');
    } finally {
      setLoading(false);
    }
  };

  const createMockPost = (id: string): Post => {
    const mockPosts = [
      {
        id,
        content: "Alhamdulillah for another beautiful day! 🌅 Finding so much peace in the morning prayers and starting the day with Quran reflection. What's your favorite ayah right now? 🤲✨ #FaithJourney #IslamicLife",
        location: "New York, NY",
        hashtags: ["FaithJourney", "IslamicLife"],
        mood: "grateful",
        is_trending: true,
        likes_count: 24,
        comments_count: 7,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        user_id: "demo-user-1",
        profiles: {
          display_name: "Sarah Johnson",
          first_name: "Sarah",
          last_name: "Johnson",
          avatar_url: "/assets/profile-1.jpg"
        },
        user_liked: false
      }
    ];
    return mockPosts[0];
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
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) {
        // Use mock comments if database fails
        setComments([]);
      } else {
        setComments((data || []) as Comment[]);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    }
  };

  const fetchLikes = async () => {
    if (!postId || likesLoading) return;

    try {
      setLikesLoading(true);
      const { data, error } = await supabase
        .from('post_likes')
        .select(`
          *,
          profiles!post_likes_user_id_fkey (
            display_name,
            avatar_url,
            first_name,
            last_name
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error) {
        setLikes((data || []) as Like[]);
      } else {
        setLikes([]);
      }
    } catch (error) {
      console.error('Error fetching likes:', error);
      setLikes([]);
    } finally {
      setLikesLoading(false);
    }
  };

  const handleLike = async () => {
    if (!post || !user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like posts",
        variant: "destructive",
      });
      return;
    }

    try {
      const newLikedState = !isLiked;
      setIsLiked(newLikedState);
      setPost(prev => prev ? {
        ...prev,
        likes_count: newLikedState ? prev.likes_count + 1 : prev.likes_count - 1
      } : null);

      if (newLikedState) {
        await supabase
          .from('post_likes')
          .insert({ post_id: post.id, user_id: user.id });
      } else {
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);
      }
    } catch (error) {
      console.error('Error liking post:', error);
      // Revert on error
      setIsLiked(!isLiked);
      setPost(prev => prev ? {
        ...prev,
        likes_count: isLiked ? prev.likes_count + 1 : prev.likes_count - 1
      } : null);
      toast({
        title: "Error",
        description: "Failed to like/unlike post",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/post/${postId}`;
    const postText = `${post?.profiles?.display_name || 'Someone'}: ${post?.content?.slice(0, 100)}...`;

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
    const postUrl = `${window.location.origin}/post/${postId}`;
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

    if (newBookmarkState) {
      const bookmarks = JSON.parse(localStorage.getItem('user_bookmarks') || '[]');
      bookmarks.push({ postId: post?.id, timestamp: new Date().toISOString() });
      localStorage.setItem('user_bookmarks', JSON.stringify(bookmarks));

      toast({
        title: "Post bookmarked",
        description: "You can find this post in your saved posts",
      });
    } else {
      const bookmarks = JSON.parse(localStorage.getItem('user_bookmarks') || '[]');
      const filteredBookmarks = bookmarks.filter((b: any) => b.postId !== post?.id);
      localStorage.setItem('user_bookmarks', JSON.stringify(filteredBookmarks));

      toast({
        title: "Bookmark removed",
        description: "Post removed from your saved posts",
      });
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user || !postId) {
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
          post_id: postId,
          user_id: user.id,
          content: newComment.trim()
        });

      if (error) throw error;

      setNewComment('');
      setShowEmojiPicker(false);
      await fetchComments();

      // Update comment count
      setPost(prev => prev ? { ...prev, comments_count: prev.comments_count + 1 } : null);

      toast({
        title: "Comment added!",
        description: "Your comment has been posted",
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditPost = () => {
    // This would be implemented to edit the post
    toast({
      title: "Feature coming soon",
      description: "Post editing will be available soon",
    });
  };

  const handleDeletePost = () => {
    // This would be implemented to delete the post
    toast({
      title: "Feature coming soon",
      description: "Post deletion will be available soon",
    });
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewComment(prev => prev + emoji);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Post not found</p>
          <Button onClick={() => navigate('/community')} variant="outline">
            Back to Community
          </Button>
        </div>
      </div>
    );
  }

  const displayName = post.profiles?.display_name ||
    `${post.profiles?.first_name} ${post.profiles?.last_name}`.trim() ||
    'Unknown User';

  const initials = post.profiles?.first_name?.[0] + (post.profiles?.last_name?.[0] || '');
  const selectedMood = post.mood ? moods.find(mood => mood.id === post.mood) : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-subtle pb-24"
    >
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>

            {user?.id === post.user_id && (
              <PostMenu
                postId={post.id}
                onEdit={handleEditPost}
                onDelete={handleDeletePost}
              />
            )}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4">
        {/* Post Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-card rounded-2xl shadow-elegant border border-border/30 overflow-hidden my-4"
        >
          <div className="p-6 pb-4 bg-gradient-glow/20">
            {/* Author Info */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative group">
                <Avatar className="ring-2 ring-primary/20 ring-offset-2 ring-offset-background transition-all duration-300 group-hover:ring-primary/40">
                  <AvatarImage src={post.profiles?.avatar_url} className="object-cover" />
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {post.is_trending && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-primary rounded-full flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-background rounded-full"></div>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-bold text-foreground text-lg truncate">
                    {displayName}
                  </h2>
                  {selectedMood && (
                    <Badge variant="outline" className="bg-background/50 border-border/30 text-sm">
                      <span className="mr-1">{selectedMood.emoji}</span>
                      {selectedMood.label}
                    </Badge>
                  )}
                  {post.is_trending && (
                    <Badge variant="secondary" className="bg-gradient-primary/10 text-primary border-primary/20 text-sm shadow-sm">
                      ✨ Trending
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  {post.location && (
                    <>
                      <span className="truncate max-w-32">{post.location}</span>
                      <span>•</span>
                    </>
                  )}
                  <span>{formatTimeAgo(post.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Post Text */}
            <div className="mb-4">
              <p className="text-foreground leading-relaxed whitespace-pre-wrap text-base">
                {post.content}
              </p>

              {/* Hashtags */}
              {post.hashtags && post.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {post.hashtags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-primary/5 border-primary/20 text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                    >
                      <Hash className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Post Image */}
            {post.image_url && (
              <div className="mb-4">
                <div className="relative overflow-hidden rounded-xl bg-muted shadow-inner">
                  <img
                    src={post.image_url}
                    alt="Post image"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-border/30">
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
                      className={`w-6 h-6 transition-all duration-200 ${
                        isLiked ? 'fill-current scale-110' : ''
                      }`}
                    />
                  </div>
                  <span className="font-medium">{post.likes_count}</span>
                </motion.button>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <MessageCircle className="w-6 h-6" />
                  <span className="font-medium">{post.comments_count}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="h-10 w-10 p-0 hover:bg-primary/10 hover:text-primary transition-all duration-200"
                  title="Share post"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBookmark}
                  className={`h-10 w-10 p-0 hover:bg-accent/10 hover:text-accent transition-all duration-200 ${
                    isBookmarked ? 'text-accent' : ''
                  }`}
                  title={isBookmarked ? "Remove bookmark" : "Bookmark post"}
                >
                  <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Likes Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-card rounded-2xl shadow-elegant border border-border/30 p-6 mb-4"
        >
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start p-0 h-auto font-normal text-left"
                onClick={fetchLikes}
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-red-500 fill-current" />
                  <span className="font-semibold">{post.likes_count} likes</span>
                </div>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <div className="text-center py-4">
                <h3 className="font-semibold mb-4">People who liked this post</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {likes.map((like) => (
                    <div key={like.id} className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={like.profiles?.avatar_url} />
                        <AvatarFallback>
                          {like.profiles?.first_name?.[0]}{like.profiles?.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {like.profiles?.display_name ||
                           `${like.profiles?.first_name} ${like.profiles?.last_name}`.trim() ||
                           'User'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimeAgo(like.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}

                  {likesLoading && (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                      <p className="text-xs text-muted-foreground mt-2">Loading...</p>
                    </div>
                  )}

                  {!likesLoading && likes.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No likes yet. Be the first!
                    </p>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Comments Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-card rounded-2xl shadow-elegant border border-border/30 p-6 mb-24"
        >
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Comments ({comments.length})
          </h3>

          {/* Add Comment */}
          <div className="mb-6">
            <div className="flex gap-3">
              <Avatar className="w-10 h-10 flex-shrink-0">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback>
                  {user?.email?.[0].toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 relative">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-12 resize-none pr-12"
                />

                <div className="absolute bottom-3 right-3 flex gap-1">
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-muted"
                      title="Add emoji"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                      <span className="text-lg">😊</span>
                    </Button>

                    {showEmojiPicker && (
                      <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg border border-border p-2 w-56 grid grid-cols-6 gap-1">
                        {['😊', '😂', '🥰', '😍', '🤗', '🤔', '😘', '😉', '🙏', '💪', '❤️', '✨', '🔥', '⭐', '🌟', '💯', '👍', '👎'].map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => {
                              handleEmojiSelect(emoji);
                              setShowEmojiPicker(false);
                            }}
                            className="w-8 h-8 flex items-center justify-center text-lg hover:bg-muted rounded"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex gap-3"
              >
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarImage src={comment.profiles?.avatar_url} />
                  <AvatarFallback>
                    {comment.profiles?.first_name?.[0]}{comment.profiles?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="bg-muted/50 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm">
                        {comment.profiles?.display_name ||
                         `${comment.profiles?.first_name} ${comment.profiles?.last_name}`.trim() ||
                         'User'}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              </motion.div>
            ))}

            {comments.length === 0 && (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">
                  No comments yet. Be the first to share your thoughts!
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PostDetailView;
