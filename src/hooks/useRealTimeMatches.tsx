import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
}

export const useRealTimeMatches = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    if (!user) return;

    // Set up real-time subscription for new matches
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'matches',
          filter: `user1_id=eq.${user.id},user2_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('New match!', payload);
          
          // Get the other user's profile
          const newMatch = payload.new as Match;
          const otherUserId = newMatch.user1_id === user.id ? newMatch.user2_id : newMatch.user1_id;
          
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('display_name, first_name, last_name')
              .eq('user_id', otherUserId)
              .single();

            if (profile) {
              const displayName = profile.display_name || `${profile.first_name} ${profile.last_name}`;
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

          setMatches(prev => [...prev, newMatch]);
        }
      )
      .subscribe();

    // Fetch existing matches
    const fetchMatches = async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      if (!error && data) {
        setMatches(data);
      }
    };

    fetchMatches();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  return { matches };
};