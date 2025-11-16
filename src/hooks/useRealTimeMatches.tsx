// ✅ MIGRATED TO FIREBASE - Terminal 1 - 2025-01-15
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db, collection, query, where, onSnapshot } from '@/integrations/firebase';
import { getUserProfile } from '@/lib/firestore/users';
import { useToast } from '@/hooks/use-toast';

interface Match {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: string;
}

export const useRealTimeMatches = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    if (!user) return;

    // Set up real-time Firestore subscription for matches
    const matchesQuery = query(
      collection(db, 'matches'),
      where('users', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(matchesQuery, async (snapshot) => {
      const currentMatches: Match[] = [];

      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const matchData = { id: change.doc.id, ...change.doc.data() } as Match;

          // Get the other user's ID
          const otherUserId = matchData.user1Id === user.uid ? matchData.user2Id : matchData.user1Id;

          // Fetch other user's profile and show toast for new matches
          try {
            const profile = await getUserProfile(otherUserId);
            if (profile) {
              const displayName = profile.displayName || `${profile.firstName} ${profile.lastName}`;
              toast({
                title: "🎉 It's a Match!",
                description: `You and ${displayName} liked each other!`,
                duration: 5000,
              });
            }
          } catch (error) {
            console.error('Error fetching match profile:', error);
            toast({
              title: "🎉 It's a Match!",
              description: "You have a new match!",
              duration: 5000,
            });
          }
        }
      });

      // Update all matches
      snapshot.forEach((doc) => {
        currentMatches.push({ id: doc.id, ...doc.data() } as Match);
      });

      setMatches(currentMatches);
    });

    return () => {
      unsubscribe();
    };
  }, [user, toast]);

  return { matches };
};