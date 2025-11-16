// ✅ MIGRATED TO FIREBASE - Terminal 1 - 2025-01-15
import { useState, useEffect } from 'react';
import { db, collection, query, where, getDocs, onSnapshot } from '@/integrations/firebase';
import { useAuth } from '@/contexts/AuthContext';

export const useNotificationCounts = () => {
  const { user } = useAuth();
  const [counts, setCounts] = useState({
    likeYou: 0,
    matches: 0,
    community: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchCounts = async () => {
    if (!user) {
      setCounts({ likeYou: 0, matches: 0, community: 0 });
      setLoading(false);
      return;
    }

    try {
      // Get likes received
      const likesQuery = query(
        collection(db, 'likes'),
        where('likedId', '==', user.uid)
      );
      const likesSnapshot = await getDocs(likesQuery);
      const likeYouCount = likesSnapshot.size;

      // Get unread messages count from matches
      const matchesQuery = query(
        collection(db, 'matches'),
        where('users', 'array-contains', user.uid)
      );
      const matchesSnapshot = await getDocs(matchesQuery);

      let unreadMessagesCount = 0;
      matchesSnapshot.forEach((doc) => {
        const matchData = doc.data();
        // Determine which unread count to use based on user position
        const unreadCount = matchData.user1Id === user.uid
          ? matchData.unreadCountUser1
          : matchData.unreadCountUser2;
        unreadMessagesCount += unreadCount || 0;
      });

      // Get community notifications (posts with new comments/likes)
      const postsQuery = query(
        collection(db, 'posts'),
        where('userId', '==', user.uid),
        where('likesCount', '>', 0)
      );
      const postsSnapshot = await getDocs(postsQuery);
      const communityCount = postsSnapshot.size;

      setCounts({
        likeYou: likeYouCount,
        matches: unreadMessagesCount,
        community: communityCount
      });
    } catch (error) {
      console.error('Error fetching notification counts:', error);
      setCounts({ likeYou: 0, matches: 0, community: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    fetchCounts();

    // Set up real-time subscriptions for live updates
    const likesQuery = query(
      collection(db, 'likes'),
      where('likedId', '==', user.uid)
    );
    const likesUnsubscribe = onSnapshot(likesQuery, () => fetchCounts());

    const matchesQuery = query(
      collection(db, 'matches'),
      where('users', 'array-contains', user.uid)
    );
    const matchesUnsubscribe = onSnapshot(matchesQuery, () => fetchCounts());

    const postsQuery = query(
      collection(db, 'posts'),
      where('userId', '==', user.uid)
    );
    const postsUnsubscribe = onSnapshot(postsQuery, () => fetchCounts());

    return () => {
      likesUnsubscribe();
      matchesUnsubscribe();
      postsUnsubscribe();
    };
  }, [user]);

  return { counts, loading, refetch: fetchCounts };
};