-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create mood_entries table
CREATE TABLE IF NOT EXISTS public.mood_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on mood_entries
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;

-- Mood entries policies
CREATE POLICY "Users can view their own mood entries"
  ON public.mood_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mood entries"
  ON public.mood_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mood entries"
  ON public.mood_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mood entries"
  ON public.mood_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Create wallpapers table (for library)
CREATE TABLE IF NOT EXISTS public.wallpapers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mood TEXT NOT NULL,
  image_url TEXT NOT NULL,
  color_palette JSONB,
  quote TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on wallpapers
ALTER TABLE public.wallpapers ENABLE ROW LEVEL SECURITY;

-- Wallpapers policies (public read access)
CREATE POLICY "Anyone can view wallpapers"
  ON public.wallpapers FOR SELECT
  USING (true);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert some featured wallpapers for the library
INSERT INTO public.wallpapers (mood, image_url, color_palette, quote, is_featured) VALUES
  ('happy', 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&q=80', '["#FFD93D", "#FFA8B6", "#B4E7FF"]', 'Choose happiness every day', true),
  ('calm', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80', '["#B8E1DD", "#E8D5C4", "#F4F1E0"]', 'Peace begins with a smile', true),
  ('energetic', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80', '["#FF6B9D", "#FFA07A", "#FFEB3B"]', 'Fuel your passion', true),
  ('motivated', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80', '["#6C63FF", "#F72585", "#4ECDC4"]', 'Dream big, work hard', true),
  ('focus', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&q=80', '["#4A5568", "#718096", "#A0AEC0"]', 'Focus on what matters', true),
  ('love', 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1920&q=80', '["#FFB6C1", "#FFC0CB", "#FFE4E1"]', 'Love is all you need', true)
ON CONFLICT DO NOTHING;