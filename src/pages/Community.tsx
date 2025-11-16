// ✅ MIGRATED TO FIREBASE - Terminal 2 - 2025-11-15
import { useState, useEffect } from "react";
import { db } from "@/integrations/firebase";
import { collection, query, where, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc, setDoc, orderBy, limit } from "firebase/firestore";
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
  imageUrl?: string;
  location?: string;
  hashtags?: string[];
  mood?: string;
  isTrending: boolean;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  userId: string;
  profiles?: {
    displayName?: string;
    photoURL?: string;
    firstName?: string;
    lastName?: string;
  } | null;
  userLiked?: boolean;
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
      let postsQuery;

      if (activeTab === "trending") {
        postsQuery = query(
          collection(db, 'posts'),
          where('isTrending', '==', true),
          orderBy('likesCount', 'desc'),
          limit(20)
        );
      } else {
        postsQuery = query(
          collection(db, 'posts'),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
      }

      const postsSnapshot = await getDocs(postsQuery);
      const postsData = postsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];

      // Fetch profiles separately
      const userIds = [...new Set(postsData.map(post => post.userId))];
      const profilesData: any[] = [];

      for (const userId of userIds) {
        const profileQuery = query(
          collection(db, 'users'),
          where('uid', '==', userId),
          limit(1)
        );
        const profileSnapshot = await getDocs(profileQuery);
        if (!profileSnapshot.empty) {
          profilesData.push({
            userId,
            ...profileSnapshot.docs[0].data()
          });
        }
      }

      // Check which posts current user has liked
      const postsWithProfiles = await Promise.all(postsData.map(async (post) => {
        let userLiked = false;

        if (user) {
          // Check if user liked this post using subcollection pattern
          const likeDocRef = doc(db, 'posts', post.id, 'likes', user.uid);
          const likeDoc = await getDoc(likeDocRef);
          userLiked = likeDoc.exists();
        }

        return {
          ...post,
          profiles: profilesData.find(profile => profile.userId === post.userId) || null,
          userLiked
        };
      }));

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
        // Delete the like document from subcollection
        const likeDocRef = doc(db, 'posts', postId, 'likes', user.uid);
        await deleteDoc(likeDocRef);

        // Update post likesCount
        const postRef = doc(db, 'posts', postId);
        const post = posts.find(p => p.id === postId);
        if (post) {
          await updateDoc(postRef, {
            likesCount: Math.max(0, post.likesCount - 1)
          });
        }
      } else {
        // Add new like to subcollection using user ID as document ID
        const likeDocRef = doc(db, 'posts', postId, 'likes', user.uid);
        await setDoc(likeDocRef, {
          userId: user.uid,
          createdAt: new Date().toISOString()
        });

        // Update post likesCount
        const postRef = doc(db, 'posts', postId);
        const post = posts.find(p => p.id === postId);
        if (post) {
          await updateDoc(postRef, {
            likesCount: post.likesCount + 1
          });
        }
      }

      // Update local state
      setPosts(posts.map(post =>
        post.id === postId
          ? {
              ...post,
              likesCount: isLiked ? post.likesCount - 1 : post.likesCount + 1,
              userLiked: !isLiked
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
                    currentUserId={user?.uid}
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