import { useState, useEffect } from "react";
import { Search, Heart, Plus } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { DEMO_POSTS } from "@/data/demoData";

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

      // Use demo posts for development or when no real data is available
      if (error || !postsData || postsData.length === 0) {
        console.log('Using demo posts for community feed');
        setPosts(DEMO_POSTS.map(post => ({
          ...post,
          user_liked: false // Reset liked status for demo posts
        })));
      } else {
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
      }
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
      {/* Desktop Layout */}
      <div className="hidden md:block">
        {/* Enhanced Desktop Header */}
        <div className="bg-card/98 backdrop-blur-xl border-b border-border/60 shadow-lg sticky top-0 z-30">
          <div className="max-w-screen-2xl mx-auto px-8 py-6">
            {/* Primary Row - Main Controls */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-4">
                  <Heart className="w-10 h-10 text-primary" />
                  <div>
                    <h1 className="text-3xl font-bold text-foreground bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                      Community Feed
                    </h1>
                    <p className="text-sm text-primary font-medium">Connect & share with the community</p>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-3 px-6 py-3 bg-card/60 rounded-2xl border border-border/50">
                  <button
                    onClick={() => setActiveTab("trending")}
                    className={`px-5 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                      activeTab === "trending"
                        ? "bg-gradient-to-r from-primary to-primary text-white shadow-lg"
                        : "text-gray-700 hover:bg-primary/10 hover:text-primary"
                    }`}
                  >
                    🔥 Trending
                    <Badge className={`text-xs ${activeTab === "trending" ? "bg-primary/15 text-primary" : "bg-primary/15 text-primary"}`}>
                      {posts.filter(p => p.is_trending).length}
                    </Badge>
                  </button>
                  <button
                    onClick={() => setActiveTab("latest")}
                    className={`px-5 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                      activeTab === "latest"
                        ? "bg-gradient-to-r from-primary to-primary text-white shadow-lg"
                        : "text-gray-700 hover:bg-primary/10 hover:text-primary"
                    }`}
                  >
                    🆕 Latest
                    <Badge className={`text-xs ${activeTab === "latest" ? "bg-primary/15 text-primary" : "bg-primary/15 text-primary"}`}>
                      {posts.filter(p => !p.is_trending).length}
                    </Badge>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Search Bar */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Search className="w-5 h-5 text-primary/60" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search posts..."
                    className="pl-10 pr-4 py-3 bg-card/80 border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-border transition-all duration-200 w-80 text-sm"
                  />
                </div>

                {/* Create Post */}
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-primary to-primary text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 group"
                >
                  <span className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Create Post
                  </span>
                </button>
              </div>
            </div>

            {/* Secondary Row - Stats & Quick Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                {/* Quick Stats */}
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground bg-card/60 px-4 py-2 rounded-xl border border-border">
                    <span className="font-bold text-primary">{posts.length}</span> posts shared
                  </div>
                  <div className="text-sm text-muted-foreground bg-card/60 px-4 py-2 rounded-xl border border-border">
                    <span className="font-bold text-blue-600">{posts.filter(p => p.is_trending).length}</span> trending now
                  </div>
                  <div className="text-sm text-muted-foreground bg-card/60 px-4 py-2 rounded-xl border border-border">
                    <span className="font-bold text-purple-600">{new Set(posts.flatMap(p => p.hashtags || [])).size}</span> topics discussed
                  </div>
                </div>

                {/* Active Filter Indicator */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  Showing <span className="font-semibold text-primary">{activeTab === "trending" ? "trending" : "latest"}</span> posts
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Sort Options */}
                <select className="px-3 py-2 bg-card/80 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring/30">
                  <option>Most Recent</option>
                  <option>Most Liked</option>
                  <option>Most Commented</option>
                  <option>My Network</option>
                </select>

                {/* View Options */}
                <div className="flex items-center gap-2 bg-card/60 rounded-xl border border-border/50">
                  <button className="px-3 py-2 rounded-lg bg-primary/15 text-primary text-sm font-medium">
                    📱 Feed
                  </button>
                  <button className="px-3 py-2 rounded-lg text-muted-foreground hover:bg-primary/10 text-sm transition-colors">
                    📊 Cards
                  </button>
                  <button className="px-3 py-2 rounded-lg text-muted-foreground hover:bg-primary/10 text-sm transition-colors">
                    📈 Analytics
                  </button>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2">
                  <button
                    title="Bookmarks"
                    className="p-2 rounded-lg bg-primary/10 hover:bg-primary/15 transition-colors"
                  >
                    📚
                  </button>
                  <button
                    title="Notifications"
                    className="p-2 rounded-lg bg-primary/10 hover:bg-primary/15 transition-colors"
                  >
                    🔔
                  </button>
                  <button
                    title="Settings"
                    className="p-2 rounded-lg bg-primary/10 hover:bg-primary/15 transition-colors"
                  >
                    ⚙️
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Main Content */}
        <div className="max-w-screen-xl mx-auto px-8 py-8">
          <div className="grid gap-8" style={{ gridTemplateColumns: '1fr 320px' }}>
            {/* Main Feed */}
            <div>
              <AnimatePresence mode="wait">
                {posts.length === 0 ? (
                  <CommunityEmptyState onCreatePost={() => setShowCreateModal(true)} />
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    {posts.map((post, index) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        className="bg-card rounded-3xl shadow-xl border border-border/60 hover:shadow-2xl transition-all duration-500 relative overflow-hidden group hover:border-border"
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

            {/* Desktop Sidebar */}
            <div className="space-y-6 sticky top-32">
              {/* Quick Stats */}
              <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
                <h3 className="font-bold text-foreground mb-4">Community Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Active Members</span>
                    <span className="font-semibold text-primary">1,247</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Posts This Week</span>
                    <span className="font-semibold text-primary">{posts.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Trending Topics</span>
                    <span className="font-semibold text-primary">8</span>
                  </div>
                </div>
              </div>

              {/* Trending Hashtags */}
              <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
                <h3 className="font-bold text-foreground mb-4">Trending Hashtags</h3>
                <div className="flex flex-wrap gap-2">
                  {["FaithJourney", "IslamicLife", "HalalBeauty", "Community", "FaithFirst"].map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full border border-border hover:bg-primary/15 cursor-pointer transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-r from-primary to-primary rounded-2xl shadow-lg border border-primary/50 p-6 text-white">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <span>🚀</span>
                  Share Your Story
                </h3>
                <p className="text-emerald-100 mb-4 text-sm">
                  Join the conversation and connect with fellow believers
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="w-full bg-white text-primary font-semibold py-3 px-4 rounded-xl hover:bg-muted transition-colors"
                >
                  📝 Write Post
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
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
      </div>

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
