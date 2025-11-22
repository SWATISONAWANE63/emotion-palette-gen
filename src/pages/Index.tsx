import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Sparkles, Heart, Zap, Cloud, Target, Focus, Smile } from "lucide-react";
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

const moods = [
  { name: "Happy", icon: Smile, color: "from-yellow-300 to-pink-300" },
  { name: "Calm", icon: Cloud, color: "from-blue-300 to-teal-300" },
  { name: "Energetic", icon: Zap, color: "from-orange-300 to-red-300" },
  { name: "Sad", icon: Cloud, color: "from-blue-400 to-gray-400" },
  { name: "Motivated", icon: Target, color: "from-purple-400 to-pink-400" },
  { name: "Love", icon: Heart, color: "from-pink-400 to-rose-400" },
  { name: "Focus", icon: Focus, color: "from-gray-400 to-slate-500" },
];

const Index = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleMoodSelect = (mood: string) => {
    if (session) {
      navigate("/generate", { state: { selectedMood: mood.toLowerCase() } });
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-32 pb-20">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">AI-Powered Wallpapers</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-text from-primary via-accent to-secondary leading-tight">
            Create Wallpapers Based
            <br />
            on Your Mood
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Choose your emotion, and let AI create a custom wallpaper just for you.
            Express yourself through beautiful, personalized designs.
          </p>

          <Button
            size="lg"
            onClick={() => session ? navigate("/generate") : navigate("/auth")}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Start Creating
          </Button>
        </div>

        {/* Mood Selection Grid */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-8">
            Select Your Mood
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {moods.map((mood, index) => {
              const Icon = mood.icon;
              return (
                <button
                  key={mood.name}
                  onClick={() => handleMoodSelect(mood.name)}
                  className="glass-card p-6 rounded-3xl hover:scale-105 transition-all duration-300 group"
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${mood.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-medium text-foreground">{mood.name}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-20">
          <div className="glass-card p-8 rounded-3xl text-center animate-fade-in">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Generated</h3>
            <p className="text-muted-foreground">
              Unique wallpapers created by advanced AI technology
            </p>
          </div>

          <div className="glass-card p-8 rounded-3xl text-center animate-fade-in" style={{ animationDelay: "100ms" }}>
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-teal-400 to-blue-400 flex items-center justify-center">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Mood Journal</h3>
            <p className="text-muted-foreground">
              Track your emotions and see patterns over time
            </p>
          </div>

          <div className="glass-card p-8 rounded-3xl text-center animate-fade-in" style={{ animationDelay: "200ms" }}>
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Instant Download</h3>
            <p className="text-muted-foreground">
              Download your wallpapers in high resolution
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
