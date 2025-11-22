import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const moodPrompts: Record<string, string> = {
  happy: "A bright, cheerful landscape with vibrant colors, sunshine, blooming flowers, and joyful atmosphere. Ultra high resolution wallpaper, peaceful and uplifting.",
  calm: "A serene, peaceful scene with soft colors, gentle water, misty mountains, and tranquil atmosphere. Ultra high resolution wallpaper, calming and meditative.",
  energetic: "A dynamic, vibrant scene with bold colors, motion, energy, and excitement. Ultra high resolution wallpaper, powerful and motivating.",
  sad: "A gentle, comforting scene with soft blues and grays, rain, gentle waves, and peaceful solitude. Ultra high resolution wallpaper, soothing and contemplative.",
  motivated: "An inspiring landscape with sunrise, mountain peaks, powerful scenery, and ambitious atmosphere. Ultra high resolution wallpaper, empowering and determined.",
  love: "A romantic, warm scene with soft pinks and purples, hearts, gentle light, and tender atmosphere. Ultra high resolution wallpaper, loving and compassionate.",
  focus: "A minimalist, clean scene with geometric patterns, neutral colors, and organized composition. Ultra high resolution wallpaper, clear and concentrated.",
};

const moodQuotes: Record<string, string[]> = {
  happy: [
    "Choose happiness every day",
    "Joy is a choice you make",
    "Happiness blooms from within",
  ],
  calm: [
    "Peace begins with a smile",
    "In stillness, find your strength",
    "Breathe in calm, breathe out peace",
  ],
  energetic: [
    "Fuel your passion",
    "Energy flows where intention goes",
    "Be unstoppable",
  ],
  sad: [
    "It's okay to not be okay",
    "This too shall pass",
    "Be gentle with yourself",
  ],
  motivated: [
    "Dream big, work hard",
    "Your only limit is you",
    "Make it happen",
  ],
  love: [
    "Love is all you need",
    "Spread love everywhere you go",
    "Love yourself first",
  ],
  focus: [
    "Focus on what matters",
    "Clarity comes from stillness",
    "One thing at a time",
  ],
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mood } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompt = moodPrompts[mood] || moodPrompts.happy;
    const quotes = moodQuotes[mood] || moodQuotes.happy;
    const quote = quotes[Math.floor(Math.random() * quotes.length)];

    console.log("Generating wallpaper for mood:", mood);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Please add credits to continue using AI features." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      throw new Error(`AI generation failed: ${response.status}`);
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      throw new Error("No image generated");
    }

    // Generate color palette based on mood
    const colorPalettes: Record<string, string[]> = {
      happy: ["#FFD93D", "#FFA8B6", "#B4E7FF"],
      calm: ["#B8E1DD", "#E8D5C4", "#F4F1E0"],
      energetic: ["#FF6B9D", "#FFA07A", "#FFEB3B"],
      sad: ["#A4C2D4", "#8CA6C0", "#B8C9DA"],
      motivated: ["#6C63FF", "#F72585", "#4ECDC4"],
      love: ["#FFB6C1", "#FFC0CB", "#FFE4E1"],
      focus: ["#4A5568", "#718096", "#A0AEC0"],
    };

    return new Response(
      JSON.stringify({
        imageUrl,
        colorPalette: colorPalettes[mood] || colorPalettes.happy,
        quote,
        mood,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating wallpaper:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate wallpaper";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
