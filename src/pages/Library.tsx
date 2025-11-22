import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Download, Sparkles } from "lucide-react";
import { Session } from "@supabase/supabase-js";

interface Wallpaper {
  id: string;
  mood: string;
  image_url: string;
  color_palette: string[];
  quote: string;
  is_featured: boolean;
}

const Library = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      } else {
        fetchWallpapers();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchWallpapers = async () => {
    try {
      const { data, error } = await supabase
        .from("wallpapers")
        .select("*")
        .eq("is_featured", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const typedData = (data || []).map(item => ({
        ...item,
        color_palette: Array.isArray(item.color_palette) 
          ? item.color_palette 
          : JSON.parse(item.color_palette as string)
      })) as Wallpaper[];
      
      setWallpapers(typedData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch wallpapers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (wallpaper: Wallpaper) => {
    const link = document.createElement("a");
    link.href = wallpaper.image_url;
    link.download = `moodscape-${wallpaper.mood}-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Downloaded!",
      description: `${wallpaper.mood} wallpaper downloaded successfully.`,
    });
  };

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Curated Collection</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text from-primary via-accent to-secondary">
              Wallpaper Library
            </h1>
            <p className="text-lg text-muted-foreground">
              Browse and download beautiful mood-based wallpapers
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : wallpapers.length === 0 ? (
            <div className="glass-card p-8 rounded-3xl text-center">
              <p className="text-muted-foreground">
                No wallpapers available yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wallpapers.map((wallpaper, index) => (
                <div
                  key={wallpaper.id}
                  className="glass-card rounded-3xl overflow-hidden group animate-fade-in hover:scale-[1.02] transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={wallpaper.image_url}
                      alt={`${wallpaper.mood} wallpaper`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold capitalize">
                        {wallpaper.mood}
                      </h3>
                      <div className="flex gap-1">
                        {wallpaper.color_palette?.slice(0, 3).map((color, i) => (
                          <div
                            key={i}
                            className="w-6 h-6 rounded-full border-2 border-white"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 italic">
                      "{wallpaper.quote}"
                    </p>

                    <Button
                      onClick={() => handleDownload(wallpaper)}
                      className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Library;
