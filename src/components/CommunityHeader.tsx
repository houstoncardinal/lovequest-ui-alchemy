import { useState } from "react";
import { Sparkles, TrendingUp, Clock, Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

interface CommunityHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCreatePost: () => void;
  postsCount?: number;
}

const CommunityHeader = ({ activeTab, onTabChange, onCreatePost, postsCount = 0 }: CommunityHeaderProps) => {
  return (
    <div className="sticky top-0 z-20 backdrop-blur-xl bg-background/80 border-b border-border/50">
      <div className="max-w-md mx-auto px-6 py-4">
        {/* Header Title */}
        <div className="flex items-center justify-between mb-6">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              <div className="p-3 rounded-2xl bg-gradient-primary shadow-glow">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full animate-pulse-gentle"></div>
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-gradient">
                Community
              </h1>
              <p className="text-sm text-muted-foreground">
                {postsCount > 0 ? `${postsCount} posts shared` : "Share your moments"}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button
              onClick={onCreatePost}
              size="sm"
              className="rounded-full bg-gradient-primary hover:shadow-glow transition-all duration-300 px-4"
            >
              <Plus className="w-4 h-4 mr-1" />
              Post
            </Button>
          </motion.div>
        </div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/30 border border-border/50 p-1 rounded-2xl">
              <TabsTrigger 
                value="trending" 
                className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow transition-all duration-300"
              >
                <TrendingUp className="w-4 h-4" />
                <span className="font-medium">Trending</span>
              </TabsTrigger>
              <TabsTrigger 
                value="recent" 
                className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow transition-all duration-300"
              >
                <Clock className="w-4 h-4" />
                <span className="font-medium">Recent</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Community Stats */}
        <motion.div 
          className="flex items-center justify-center gap-6 mt-4 py-3 px-4 rounded-2xl bg-gradient-glow border border-border/30"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span className="text-xs font-medium">1.2k members</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-muted-foreground/50"></div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-medium">24 posts today</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CommunityHeader;