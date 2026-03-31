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

    const channel = supabase
      .channel('matches-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'matches' },
        async (payload) => {
          const newMatch = payload.new as Match;
          if (newMatch.user1_id !== user.id && newMatch.user2_id !== user.id) return;

          const otherUserId = newMatch.user1_id === user.id ? newMatch.user2_id : newMatch.user1_id;
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('display_name')
              .eq('user_id', otherUserId)
              .single();
            toast({
              title: "🎉 It's a Match!",
              description: `You and ${profile?.display_name || 'someone'} liked each other!`,
              duration: 5000,
            });
          } catch {
            toast({ title: "🎉 It's a Match!", description: "You have a new match!", duration: 5000 });
          }
          setMatches(prev => [...prev, newMatch]);
        }
      )
      .subscribe();

    const fetchMatches = async () => {
      const { data } = await supabase
        .from('matches')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
      if (data) setMatches(data);
    };

    fetchMatches();

    return () => { supabase.removeChannel(channel); };
  }, [user, toast]);

  return { matches };
};
