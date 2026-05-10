import { useEffect, useState } from "react";
import { Plus, X, Loader2, Film, Tv, Music, Disc3, BookOpen, Mic2, Gamepad2, UtensilsCrossed, Plane, Sparkles, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type FavCategory =
  | "movies" | "tv_shows" | "music_artists" | "songs" | "books"
  | "podcasts" | "games" | "foods" | "travel_destinations" | "hobbies" | "sports_teams";

export const FAV_CATEGORIES: { key: FavCategory; label: string; icon: any; placeholder: string; subPlaceholder?: string }[] = [
  { key: "movies", label: "Movies", icon: Film, placeholder: "Movie title", subPlaceholder: "Director / year (optional)" },
  { key: "tv_shows", label: "TV Shows", icon: Tv, placeholder: "Show name" },
  { key: "music_artists", label: "Artists", icon: Music, placeholder: "Artist or band" },
  { key: "songs", label: "Songs", icon: Disc3, placeholder: "Song title", subPlaceholder: "Artist (optional)" },
  { key: "books", label: "Books", icon: BookOpen, placeholder: "Book title", subPlaceholder: "Author (optional)" },
  { key: "podcasts", label: "Podcasts", icon: Mic2, placeholder: "Podcast name" },
  { key: "games", label: "Games", icon: Gamepad2, placeholder: "Game title" },
  { key: "foods", label: "Foods", icon: UtensilsCrossed, placeholder: "Cuisine or dish" },
  { key: "travel_destinations", label: "Travel", icon: Plane, placeholder: "Destination" },
  { key: "hobbies", label: "Hobbies", icon: Sparkles, placeholder: "Hobby or passion" },
  { key: "sports_teams", label: "Sports Teams", icon: Trophy, placeholder: "Team name" },
];

interface FavRow {
  id: string;
  category: FavCategory;
  title: string;
  subtitle: string | null;
}

const FavoritesEditor = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<FavRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState<FavCategory>("movies");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profile_favorites")
        .select("id, category, title, subtitle")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      setFavorites((data as FavRow[]) || []);
      setLoading(false);
    })();
  }, [user]);

  const addFavorite = async () => {
    if (!user || !title.trim()) return;
    setAdding(true);
    const { data, error } = await supabase
      .from("profile_favorites")
      .insert({ user_id: user.id, category: activeCat, title: title.trim(), subtitle: subtitle.trim() || null })
      .select("id, category, title, subtitle")
      .single();
    setAdding(false);
    if (error) {
      toast({ title: "Couldn't add", description: error.message, variant: "destructive" });
      return;
    }
    setFavorites((prev) => [...prev, data as FavRow]);
    setTitle("");
    setSubtitle("");
  };

  const removeFavorite = async (id: string) => {
    const prev = favorites;
    setFavorites((f) => f.filter((x) => x.id !== id));
    const { error } = await supabase.from("profile_favorites").delete().eq("id", id);
    if (error) {
      setFavorites(prev);
      toast({ title: "Couldn't remove", variant: "destructive" });
    }
  };

  const cat = FAV_CATEGORIES.find((c) => c.key === activeCat)!;
  const items = favorites.filter((f) => f.category === activeCat);

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-xl bg-gradient-primary">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Favorites</h3>
          <p className="text-xs text-muted-foreground">Movies, music, books & more — match over what you love.</p>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {FAV_CATEGORIES.map((c) => {
          const Icon = c.icon;
          const count = favorites.filter((f) => f.category === c.key).length;
          const active = c.key === activeCat;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setActiveCat(c.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                active
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card text-foreground/70 border-border hover:border-primary/40"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {c.label}
              {count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? "bg-primary-foreground/20" : "bg-muted"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Add row */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder={cat.placeholder}
            value={title}
            maxLength={100}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFavorite(); } }}
          />
          {cat.subPlaceholder && (
            <Input
              placeholder={cat.subPlaceholder}
              value={subtitle}
              maxLength={100}
              onChange={(e) => setSubtitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFavorite(); } }}
            />
          )}
          <Button type="button" onClick={addFavorite} disabled={!title.trim() || adding} className="shrink-0">
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add
          </Button>
        </div>
      </div>

      {/* Items */}
      <div className="flex flex-wrap gap-2 min-h-[40px]">
        {loading ? (
          <p className="text-xs text-muted-foreground">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-xs text-muted-foreground">No {cat.label.toLowerCase()} added yet.</p>
        ) : (
          items.map((item) => (
            <Badge
              key={item.id}
              variant="secondary"
              className="pl-3 pr-1 py-1.5 gap-1.5 text-xs font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15"
            >
              <span>{item.title}</span>
              {item.subtitle && <span className="text-muted-foreground font-normal">· {item.subtitle}</span>}
              <button
                type="button"
                onClick={() => removeFavorite(item.id)}
                className="ml-1 rounded-full p-0.5 hover:bg-primary/20 transition-colors"
                aria-label="Remove"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))
        )}
      </div>
    </Card>
  );
};

export default FavoritesEditor;
