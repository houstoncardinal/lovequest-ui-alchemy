import { TrendingUp, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CommunityHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCreatePost: () => void;
  postsCount?: number;
}

const CommunityHeader = ({ activeTab, onTabChange, onCreatePost }: CommunityHeaderProps) => {
  return (
    <div className="sticky top-0 z-20 backdrop-blur-xl bg-background/90 border-b border-border/50">
      <div className="max-w-md mx-auto px-4 py-2.5">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-bold text-foreground">Community</h1>
          <Button
            onClick={onCreatePost}
            size="sm"
            className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-4 h-8 text-xs font-medium shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Post
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-xl h-9">
            <TabsTrigger 
              value="trending" 
              className="flex items-center gap-1.5 rounded-lg text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Trending
            </TabsTrigger>
            <TabsTrigger 
              value="recent" 
              className="flex items-center gap-1.5 rounded-lg text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              <Clock className="w-3.5 h-3.5" />
              Recent
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};

export default CommunityHeader;
