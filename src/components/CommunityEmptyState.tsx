import { motion } from "framer-motion";
import { Sparkles, Plus, Camera, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface EmptyStateProps {
  onCreatePost: () => void;
}

const CommunityEmptyState = ({ onCreatePost }: EmptyStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center min-h-[50vh] px-6"
    >
      <Card className="p-8 text-center max-w-sm mx-auto bg-gradient-glow border-border/50 shadow-elegant">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-20 h-20 mx-auto mb-6 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow"
        >
          <Sparkles className="w-10 h-10 text-primary-foreground" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-xl font-bold text-foreground mb-3">
            No posts yet
          </h3>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Be the first to share something beautiful with our community! 
            Your story matters.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-4"
        >
          <Button
            onClick={onCreatePost}
            className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Post
          </Button>
          
          <div className="flex items-center justify-center gap-6 text-muted-foreground text-sm">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              <span>Share photos</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-muted-foreground/50"></div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span>Tell stories</span>
            </div>
          </div>
        </motion.div>
      </Card>
    </motion.div>
  );
};

export default CommunityEmptyState;