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
            className="relative z-10"
          >
            <Button
              onClick={onCreatePost}
              size="lg"
              className="rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 hover:shadow-lg hover:scale-105 transition-all duration-300 px-6 py-3 font-semibold text-white shadow-md border-0 animate-fade-in"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Post
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
            <TabsList className="grid w-full grid-cols-2 bg-muted/50 border border-border/30 p-1.5 rounded-2xl shadow-card">
              <TabsTrigger 
                value="trending" 
                className="flex items-center gap-2 rounded-xl text-foreground font-medium transition-all duration-300 hover:bg-muted/70 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-card data-[state=active]:border data-[state=active]:border-primary/20"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Trending</span>
              </TabsTrigger>
              <TabsTrigger 
                value="recent" 
                className="flex items-center gap-2 rounded-xl text-foreground font-medium transition-all duration-300 hover:bg-muted/70 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-card data-[state=active]:border data-[state=active]:border-primary/20"
              >
                <Clock className="w-4 h-4" />
                <span>Recent</span>
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