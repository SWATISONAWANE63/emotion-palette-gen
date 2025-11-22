import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Heart, Zap, Cloud, Target, Focus, Smile, Plus } from "lucide-react";
import { Session } from "@supabase/supabase-js";
import { format } from "date-fns";

const moods = [
  { name: "happy", icon: Smile, color: "from-yellow-300 to-pink-300" },
  { name: "calm", icon: Cloud, color: "from-blue-300 to-teal-300" },
  { name: "energetic", icon: Zap, color: "from-orange-300 to-red-300" },
  { name: "sad", icon: Cloud, color: "from-blue-400 to-gray-400" },
  { name: "motivated", icon: Target, color: "from-purple-400 to-pink-400" },
  { name: "love", icon: Heart, color: "from-pink-400 to-rose-400" },
  { name: "focus", icon: Focus, color: "from-gray-400 to-slate-500" },
];

interface MoodEntry {
  id: string;
  mood: string;
  note: string;
  created_at: string;
}

const Journal = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [selectedMood, setSelectedMood] = useState<string>("happy");
  const [note, setNote] = useState("");
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      } else {
        fetchEntries();
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

  const fetchEntries = async () => {
    const { data, error } = await supabase
      .from("mood_entries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch mood entries",
        variant: "destructive",
      });
    } else {
      setEntries(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("mood_entries").insert({
        mood: selectedMood,
        note,
        user_id: session?.user.id,
      });

      if (error) throw error;

      toast({
        title: "Entry saved!",
        description: "Your mood has been logged successfully.",
      });

      setNote("");
      fetchEntries();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save entry",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
              Mood Journal
            </h1>
            <p className="text-lg text-muted-foreground">
              Track your emotions and reflect on your day
            </p>
          </div>

          {/* New Entry Form */}
          <div className="glass-card p-8 rounded-3xl mb-8 animate-fade-in">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Log Your Mood
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-3">How are you feeling?</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {moods.map((mood) => {
                    const Icon = mood.icon;
                    const isSelected = selectedMood === mood.name;
                    return (
                      <button
                        key={mood.name}
                        type="button"
                        onClick={() => setSelectedMood(mood.name)}
                        className={`p-3 rounded-2xl border-2 transition-all duration-300 ${
                          isSelected
                            ? "border-primary bg-primary/10 scale-105"
                            : "border-transparent bg-white/50 hover:border-primary/30"
                        }`}
                      >
                        <div className={`w-8 h-8 mx-auto mb-2 rounded-xl bg-gradient-to-br ${mood.color} flex items-center justify-center`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-sm font-medium capitalize">{mood.name}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label htmlFor="note" className="block text-sm font-medium mb-2">
                  What's on your mind? (optional)
                </label>
                <Textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Write your thoughts..."
                  className="min-h-[120px] bg-white/50 border-white/20 rounded-xl"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-white py-6 rounded-xl"
              >
                {loading ? "Saving..." : "Save Entry"}
              </Button>
            </form>
          </div>

          {/* Entries Timeline */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Your Mood Timeline</h2>
            
            {entries.length === 0 ? (
              <div className="glass-card p-8 rounded-3xl text-center">
                <p className="text-muted-foreground">
                  No entries yet. Start logging your moods!
                </p>
              </div>
            ) : (
              entries.map((entry) => {
                const mood = moods.find((m) => m.name === entry.mood);
                const Icon = mood?.icon || Heart;
                const color = mood?.color || "from-purple-400 to-pink-400";

                return (
                  <div
                    key={entry.id}
                    className="glass-card p-6 rounded-2xl animate-fade-in hover:scale-[1.02] transition-transform"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold capitalize">{entry.mood}</h3>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(entry.created_at), "MMM d, yyyy 'at' h:mm a")}
                          </span>
                        </div>
                        {entry.note && (
                          <p className="text-muted-foreground">{entry.note}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Journal;
