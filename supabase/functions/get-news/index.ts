import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Extract og:image from a URL
async function getOgImage(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; NewsBot/1.0)" },
    });
    clearTimeout(timeout);
    const html = await response.text();
    const match = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

// Fetch UK urban news from Perplexity
async function fetchUKNews(perplexityKey: string): Promise<any[]> {
  try {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${perplexityKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          {
            role: "system",
            content: "You are a UK urban music news curator. Return 8 recent news stories as a JSON array. Focus ONLY on UK artists: Central Cee, Stormzy, Dave, Little Simz, Skepta, Jorja Smith, Headie One, Digga D, Raye, Knucks, Aitch, Tion Wayne, ArrDee, Cat Burns, Mahalia, etc. Sources: GRM Daily, Link Up TV, BBC 1Xtra, NME, Clash Magazine, Complex UK. Each story: title, summary (2 sentences), source, url, timeAgo. Return ONLY valid JSON array.",
          },
          { role: "user", content: "Latest UK urban music news from the last 72 hours - grime, UK rap, UK drill, UK R&B, afroswing, British hip-hop" },
        ],
        max_tokens: 1500,
        temperature: 0.3,
      }),
    });
    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "[]";
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const news = JSON.parse(content);

    // Fetch og:images for UK news
    const images = await Promise.all(news.map((s: any) => s.url ? getOgImage(s.url) : null));

    // UK urban music fallback images (when og:image fails)
    const ukFallbacks = [
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop",
      "https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?w=800&h=400&fit=crop",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=400&fit=crop",
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&h=400&fit=crop",
    ];

    return news.map((story: any, i: number) => ({
      ...story,
      imageUrl: images[i] || ukFallbacks[i % ukFallbacks.length],
      isUK: true
    }));
  } catch (e) {
    console.error("UK news fetch error:", e);
    return [];
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { topic = "music" } = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check cache first
    const { data: cached } = await supabase
      .from("news_cache")
      .select("stories, fetched_at")
      .eq("topic", topic)
      .single();

    if (cached) {
      const age = Date.now() - new Date(cached.fetched_at).getTime();
      if (age < CACHE_DURATION) {
        console.log(`📦 Cache hit for ${topic}`);
        return new Response(JSON.stringify({ news: cached.stories, fromCache: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Fetch fresh news
    console.log(`🔄 Fetching fresh news for ${topic}...`);
    const newsApiKey = Deno.env.get("NEWS_API_KEY");
    const perplexityKey = Deno.env.get("PERPLEXITY_API_KEY");

    if (!newsApiKey) {
      throw new Error("NEWS_API_KEY not configured");
    }

    // Topic configurations for NewsAPI
    const topicConfig: Record<string, { domains: string; q: string; usePerplexity?: boolean }> = {
      // UK Urban - uses Perplexity only
      uk: {
        domains: "",
        q: "",
        usePerplexity: true
      },
      // Global Hip-Hop
      hiphop: {
        domains: "complex.com,hiphopdx.com,hotnewhiphop.com,rap-up.com,thefader.com,okayplayer.com,revolt.tv,billboard.com",
        q: "hip-hop OR rapper OR R&B OR afrobeats OR Drake OR Kendrick OR Travis Scott"
      },
      // Basketball / NBA
      basketball: {
        domains: "espn.com,bleacherreport.com,cbssports.com,nba.com,theathletic.com",
        q: "NBA OR Lakers OR Warriors OR Celtics OR Thunder OR Knicks OR LeBron OR Curry OR Durant OR Giannis OR Tatum"
      },
      // Football / Soccer
      football: {
        domains: "espn.com,skysports.com,bbc.co.uk,goal.com,theathletic.com,marca.com",
        q: "Premier League OR Champions League OR Barcelona OR Real Madrid OR Messi OR Ronaldo OR Manchester OR Arsenal OR Liverpool"
      },
      // Formula 1
      f1: {
        domains: "espn.com,skysports.com,bbc.co.uk,motorsport.com,autosport.com",
        q: "F1 OR Formula 1 OR Hamilton OR Verstappen OR Norris OR Mercedes OR Red Bull"
      },
      // Tech
      tech: {
        domains: "theverge.com,techcrunch.com,wired.com,arstechnica.com,engadget.com",
        q: "AI OR technology OR startup OR gadget OR Apple OR Google"
      },
      // Entertainment
      entertainment: {
        domains: "variety.com,deadline.com,hollywoodreporter.com,ew.com,bbc.co.uk",
        q: "movie OR TV OR celebrity OR film OR Netflix OR streaming"
      },
    };

    const config = topicConfig[topic] || topicConfig.hiphop;
    let news: any[] = [];

    // UK topic uses Perplexity only
    if (topic === "uk" && perplexityKey) {
      console.log("🇬🇧 Fetching UK urban news from Perplexity...");
      news = await fetchUKNews(perplexityKey);
      console.log(`🇬🇧 Got ${news.length} UK stories`);
    } else {
      // All other topics use NewsAPI
      const newsApiUrl = `https://newsapi.org/v2/everything?domains=${config.domains}&q=${encodeURIComponent(config.q)}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${newsApiKey}`;

      const response = await fetch(newsApiUrl);
      const data = await response.json();

      if (data.status !== "ok") {
        throw new Error(data.message || "NewsAPI error");
      }

      // Format NewsAPI articles
      news = data.articles.map((article: any) => {
        const published = new Date(article.publishedAt);
        const now = new Date();
        const diffMs = now.getTime() - published.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const timeAgo = diffHours < 1 ? "Just now" :
          diffHours < 24 ? `${diffHours}h ago` :
            `${Math.floor(diffHours / 24)}d ago`;

        return {
          title: article.title?.split(" - ")[0] || article.title,
          summary: article.description || article.content?.substring(0, 200) || "",
          source: article.source?.name || "Unknown",
          url: article.url,
          timeAgo,
          imageUrl: article.urlToImage,
        };
      }).filter((a: any) => a.title && a.imageUrl);
    }

    // Upsert to cache
    await supabase.from("news_cache").upsert(
      { topic, stories: news, fetched_at: new Date().toISOString() },
      { onConflict: "topic" }
    );
    console.log(`✅ Cached ${topic} (${news.length} stories)`);

    return new Response(JSON.stringify({ news, fromCache: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

