import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Download, RefreshCw, Heart, Zap, Cloud, Target, Focus, Smile } from "lucide-react";
import { Session } from "@supabase/supabase-js";

const moods = [
  { name: "happy", icon: Smile, color: "from-yellow-300 to-pink-300" },
  { name: "calm", icon: Cloud, color: "from-blue-300 to-teal-300" },
  { name: "energetic", icon: Zap, color: "from-orange-300 to-red-300" },
  { name: "sad", icon: Cloud, color: "from-blue-400 to-gray-400" },
  { name: "motivated", icon: Target, color: "from-purple-400 to-pink-400" },
  { name: "love", icon: Heart, color: "from-pink-400 to-rose-400" },
  { name: "focus", icon: Focus, color: "from-gray-400 to-slate-500" },
];

interface WallpaperResult {
  imageUrl: string;
  colorPalette: string[];
  quote: string;
  mood: string;
}

const Generate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [selectedMood, setSelectedMood] = useState<string>(
    location.state?.selectedMood || "happy"
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WallpaperResult | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
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

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-wallpaper", {
        body: { mood: selectedMood },
      });

      if (error) throw error;

      setResult(data);
      toast({
        title: "Wallpaper Generated!",
        description: "Your custom wallpaper is ready to download.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate wallpaper",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    
    const link = document.createElement("a");
    link.href = result.imageUrl;
    link.download = `moodscape-${selectedMood}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Downloaded!",
      description: "Your wallpaper has been downloaded.",
    });
  };

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text from-primary via-accent to-secondary">
              Generate Your Wallpaper
            </h1>
            <p className="text-lg text-muted-foreground">
              Select a mood and let AI create something beautiful for you
            </p>
          </div>

          {/* Mood Selection */}
          <div className="glass-card p-8 rounded-3xl mb-8 animate-fade-in">
            <h2 className="text-xl font-semibold mb-6">Choose Your Mood</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {moods.map((mood) => {
                const Icon = mood.icon;
                const isSelected = selectedMood === mood.name;
                return (
                  <button
                    key={mood.name}
                    onClick={() => setSelectedMood(mood.name)}
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                      isSelected
                        ? "border-primary bg-primary/10 scale-105"
                        : "border-transparent bg-white/50 hover:border-primary/30"
                    }`}
                  >
                    <div className={`w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br ${mood.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="font-medium capitalize">{mood.name}</p>
                  </button>
                );
              })}
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full mt-6 bg-primary hover:bg-primary/90 text-white py-6 rounded-xl text-lg"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Wallpaper
                </>
              )}
            </Button>
          </div>

          {/* Result Display */}
          {result && (
            <div className="glass-card p-8 rounded-3xl animate-fade-in">
              <h2 className="text-xl font-semibold mb-6">Your Wallpaper</h2>
              
              <div className="relative rounded-2xl overflow-hidden mb-6 shadow-2xl">
                <img
                  src={result.imageUrl}
                  alt="Generated wallpaper"
                  className="w-full h-auto"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Mood Quote
                  </h3>
                  <p className="text-2xl font-semibold italic">"{result.quote}"</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Color Palette
                  </h3>
                  <div className="flex gap-2">
                    {result.colorPalette.map((color, index) => (
                      <div
                        key={index}
                        className="w-12 h-12 rounded-xl shadow-lg"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={handleDownload}
                    className="flex-1 bg-primary hover:bg-primary/90 text-white py-6 rounded-xl"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download Wallpaper
                  </Button>
                  <Button
                    onClick={handleGenerate}
                    variant="outline"
                    className="flex-1 border-primary/20 hover:bg-primary/10 py-6 rounded-xl"
                  >
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Generate Again
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Generate;
