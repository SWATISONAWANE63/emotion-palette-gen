import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, LogOut, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";

export const Navbar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
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

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    } else {
      navigate("/auth");
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-0 border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <Sparkles className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
          <span className="text-xl font-bold gradient-text from-primary to-accent">
            MoodScape
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {session ? (
            <>
              <Link to="/generate">
                <Button variant="ghost" className="hover:bg-primary/10">
                  Generate
                </Button>
              </Link>
              <Link to="/journal">
                <Button variant="ghost" className="hover:bg-primary/10">
                  Journal
                </Button>
              </Link>
              <Link to="/library">
                <Button variant="ghost" className="hover:bg-primary/10">
                  Library
                </Button>
              </Link>
              <Button
                variant="outline"
                size="icon"
                onClick={handleLogout}
                className="border-primary/20 hover:bg-primary/10"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button className="bg-primary hover:bg-primary/90 text-white">
                <User className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
