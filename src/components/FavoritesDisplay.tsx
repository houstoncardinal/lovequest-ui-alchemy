import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { FAV_CATEGORIES, type FavCategory } from "./FavoritesEditor";

interface FavRow {
  id: string;
  category: FavCategory;
  title: string;
  subtitle: string | null;
}

interface Props {
  profileUserId: string;
}

const FavoritesDisplay = ({ profileUserId }: Props) => {
  const { user } = useAuth();
  const [theirs, setTheirs] = useState<FavRow[]>([]);
  const [mine, setMine] = useState<FavRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const ids = [profileUserId];
      if (user && user.id !== profileUserId) ids.push(user.id);
      const { data } = await supabase
        .from("profile_favorites")
        .select("id, user_id, category, title, subtitle")
        .in("user_id", ids);
      const rows = (data || []) as (FavRow & { user_id: string })[];
      setTheirs(rows.filter((r) => r.user_id === profileUserId));
      setMine(rows.filter((r) => r.user_id === user?.id));
      setLoading(false);
    })();
  }, [profileUserId, user]);

  if (loading) {
    return <p className="text-xs text-muted-foreground p-4">Loading favorites…</p>;
  }

  if (theirs.length === 0) {
    return (
      <div className="bg-card rounded-2xl shadow-sm border border-border/30 p-6 text-center">
        <p className="text-sm text-muted-foreground">No favorites shared yet.</p>
      </div>
    );
  }

  const mineKey = (r: FavRow) => `${r.category}|${r.title.trim().toLowerCase()}`;
  const mineSet = new Set(mine.map(mineKey));
  const sharedCount = theirs.filter((r) => mineSet.has(mineKey(r))).length;

  return (
    <div className="space-y-4">
      {sharedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
            <Heart className="w-4 h-4 text-primary fill-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              You share {sharedCount} favorite{sharedCount === 1 ? "" : "s"}
            </p>
            <p className="text-xs text-muted-foreground">A great place to start a conversation</p>
          </div>
        </motion.div>
      )}

      {FAV_CATEGORIES.map((cat) => {
        const items = theirs.filter((t) => t.category === cat.key);
        if (items.length === 0) return null;
        const Icon = cat.icon;
        return (
          <div key={cat.key} className="bg-card rounded-2xl shadow-sm border border-border/30 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="w-3.5 h-3.5 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{cat.label}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {items.map((item, i) => {
                const shared = mineSet.has(mineKey(item));
                return (
                  <motion.span
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      shared
                        ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/30"
                        : "bg-muted/40 text-foreground/80 border-border/40"
                    }`}
                  >
                    {shared && <Heart className="w-3 h-3 fill-current" />}
                    <span>{item.title}</span>
                    {item.subtitle && (
                      <span className={shared ? "opacity-80" : "text-muted-foreground"}>· {item.subtitle}</span>
                    )}
                  </motion.span>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FavoritesDisplay;
