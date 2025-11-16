import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Users, MessageSquare } from "lucide-react";

const CommunityLoadingSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header Skeleton */}
      <div className="sticky top-0 z-20 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="max-w-md mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-primary/20 animate-pulse-gentle">
                <div className="w-6 h-6 bg-muted rounded"></div>
              </div>
              <div>
                <div className="h-6 w-32 bg-muted rounded-lg animate-shimmer mb-1"></div>
                <div className="h-4 w-24 bg-muted/50 rounded"></div>
              </div>
            </div>
            <div className="h-8 w-16 bg-muted rounded-full animate-pulse-gentle"></div>
          </div>
          
          <div className="h-10 w-full bg-muted/30 rounded-2xl animate-pulse-gentle"></div>
        </div>
      </div>

      {/* Posts Skeleton */}
      <div className="max-w-md mx-auto p-6 space-y-6">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
            className="bg-card/50 backdrop-blur-sm rounded-2xl shadow-elegant overflow-hidden"
          >
            {/* Post Header Skeleton */}
            <div className="p-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-primary/20 rounded-full animate-pulse-gentle"></div>
                <div className="flex-1">
                  <div className="h-4 w-24 bg-muted rounded mb-1"></div>
                  <div className="h-3 w-16 bg-muted/50 rounded"></div>
                </div>
              </div>
            </div>

            {/* Content Skeleton */}
            <div className="px-5 pb-4 space-y-2">
              <div className="h-4 w-full bg-muted rounded"></div>
              <div className="h-4 w-3/4 bg-muted rounded"></div>
              <div className="h-4 w-1/2 bg-muted rounded"></div>
            </div>

            {/* Image Skeleton */}
            <div className="px-5 pb-4">
              <div className="h-48 w-full bg-muted/50 rounded-xl animate-pulse-gentle"></div>
            </div>

            {/* Actions Skeleton */}
            <div className="px-5 py-4 border-t border-border/50 bg-gradient-glow/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-muted rounded"></div>
                    <div className="h-4 w-6 bg-muted rounded"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-muted rounded"></div>
                    <div className="h-4 w-6 bg-muted rounded"></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-muted rounded"></div>
                  <div className="w-8 h-8 bg-muted rounded"></div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom padding */}
      <div className="h-24"></div>
    </div>
  );
};

export default CommunityLoadingSkeleton;