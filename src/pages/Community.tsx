import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

// Components
import CreatePostModal from "@/components/CreatePostModal";
import EditPostModal from "@/components/EditPostModal";
import CommunityHeader from "@/components/CommunityHeader";
import PostCard from "@/components/PostCard";
import CommunityLoadingSkeleton from "@/components/CommunityLoadingSkeleton";
import CommunityEmptyState from "@/components/CommunityEmptyState";

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

const Community = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("trending");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, [activeTab]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('posts')
        .select('*');

      if (activeTab === "trending") {
        query = query.eq('is_trending', true).order('likes_count', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data: postsData, error } = await query.limit(20);

      if (error) throw error;

      // Fetch profiles separately for now
      const userIds = postsData?.map(post => post.user_id) || [];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url, first_name, last_name')
        .in('user_id', userIds);

      // Check which posts current user has liked
      let userLikes = [];
      if (user) {
        const { data: likesData } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postsData?.map(p => p.id) || []);
        
        userLikes = likesData?.map(like => like.post_id) || [];
      }

      // Combine posts with profiles and like status
      const postsWithProfiles = postsData?.map(post => ({
        ...post,
        profiles: profilesData?.find(profile => profile.user_id === post.user_id) || null,
        user_liked: userLikes.includes(post.id)
      })) || [];

      setPosts(postsWithProfiles);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load posts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string, isLiked: boolean) => {
    try {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to like posts",
          variant: "destructive",
        });
        return;
      }

      if (isLiked) {
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id });
      }

      // Update local state
      setPosts(posts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              likes_count: isLiked ? post.likes_count - 1 : post.likes_count + 1,
              user_liked: !isLiked 
            }
          : post
      ));

    } catch (error) {
      console.error('Error liking post:', error);
      toast({
        title: "Error",
        description: "Failed to like post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setShowEditModal(true);
  };

  const handleDeletePost = (deletedPostId: string) => {
    setPosts(posts.filter(post => post.id !== deletedPostId));
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
    return <CommunityLoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <CommunityHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onCreatePost={() => setShowCreateModal(true)}
        postsCount={posts.length}
      />

      {/* Posts Feed */}
      <div className="max-w-md mx-auto px-6 pb-6">
        <AnimatePresence mode="wait">
          {posts.length === 0 ? (
            <CommunityEmptyState onCreatePost={() => setShowCreateModal(true)} />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 pt-6"
            >
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <PostCard
                    post={post}
                    currentUserId={user?.id}
                    onLike={handleLike}
                    onEdit={handleEditPost}
                    onDelete={handleDeletePost}
                    formatTimeAgo={formatTimeAgo}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom padding for navigation */}
      <div className="h-24"></div>

      {/* Create Post Modal */}
      <CreatePostModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onPostCreated={fetchPosts}
      />

      {/* Edit Post Modal */}
      <EditPostModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        post={editingPost}
        onPostUpdated={fetchPosts}
      />
    </div>
  );
};

export default Community;