import React from 'react';
import { Heart, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLikesLimit } from '@/hooks/useLikesLimit';

const LikesCounter: React.FC = () => {
  const { likesUsage, loading } = useLikesLimit();

  if (loading || likesUsage.isUnlimited) return null;

  const remainingLikes = likesUsage.maxDailyLikes - likesUsage.dailyLikes;
  const isLow = remainingLikes <= 2;

  return (
    <Badge 
      className={`
        px-3 py-1 text-xs font-medium shadow-sm
        ${isLow 
          ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white animate-pulse' 
          : 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-700'
        }
      `}
    >
      <Heart className="w-3 h-3 mr-1" />
      {remainingLikes} likes left
      {isLow && <Crown className="w-3 h-3 ml-1" />}
    </Badge>
  );
};

export default LikesCounter;