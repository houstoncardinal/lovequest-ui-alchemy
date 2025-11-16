import React from 'react';
import { Crown, Heart, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface LikeLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  resetTime: Date | null;
}

const LikeLimitModal: React.FC<LikeLimitModalProps> = ({ isOpen, onClose, resetTime }) => {
  const navigate = useNavigate();

  const formatResetTime = (resetTime: Date | null) => {
    if (!resetTime) return '24 hours';
    const now = new Date();
    const diff = resetTime.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleUpgrade = () => {
    onClose();
    navigate('/pricing');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md mx-auto bg-gradient-to-br from-white via-emerald-50 to-white border-2 border-emerald-200 shadow-2xl">
        <DialogHeader className="text-center pb-2">
          <div className="mx-auto mb-4 relative">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-xl animate-pulse">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center animate-bounce">
              <Crown className="w-4 h-4 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
            Daily Likes Used! 💚
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 text-center">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-emerald-200">
            <div className="flex items-center justify-center gap-2 text-amber-600 mb-3">
              <Clock className="w-5 h-5" />
              <span className="font-semibold text-sm">Free likes reset in:</span>
            </div>
            <div className="text-3xl font-bold text-emerald-700 mb-2">
              {formatResetTime(resetTime)}
            </div>
            <p className="text-xs text-gray-600">Come back tomorrow for 5 more free likes!</p>
          </div>

          <div className="space-y-4">
            <div className="text-left bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-4 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-lg">Upgrade to Premium</h3>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-300" />
                  <span>Unlimited daily likes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-300" />
                  <span>See who liked you</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-300" />
                  <span>Advanced filters</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-300" />
                  <span>Video messaging</span>
                </div>
              </div>
              
              <Badge className="mt-3 bg-amber-400 text-amber-900 px-3 py-1 text-xs font-bold">
                Starting at $19.99/month
              </Badge>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={onClose}
                variant="outline" 
                className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              >
                Wait 24h
              </Button>
              <Button 
                onClick={handleUpgrade}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade Now
              </Button>
            </div>
          </div>

          <p className="text-xs text-gray-500 leading-relaxed">
            Join thousands of members finding meaningful connections with premium features.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LikeLimitModal;