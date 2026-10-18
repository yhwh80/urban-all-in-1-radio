import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { FEEDS, fetchTopic } from "./news";

// Matches the 15 minutes the old Supabase function used, so the feel is unchanged.
const CACHE_MS = 15 * 60 * 1000;

const ALLOWED_ORIGINS = new Set([
  "https://urbanallin1radio.co.uk",
  "https://www.urbanallin1radio.co.uk",
  "http://localhost:3000",
  "http://127.0.0.1:5500",
]);

function cors(origin: string | null): Record<string, string> {
  return {
    "Access-Control-Allow-Origin":
      origin && ALLOWED_ORIGINS.has(origin) ? origin : "https://urbanallin1radio.co.uk",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

const news = httpAction(async (ctx, request) => {
  const origin = request.headers.get("Origin");
  const headers = { ...cors(origin), "Content-Type": "application/json" };

  const topic = new URL(request.url).searchParams.get("topic") ?? "uk";
  if (!(topic in FEEDS)) {
    return new Response(
      JSON.stringify({ error: `Unknown topic. Valid: ${Object.keys(FEEDS).join(", ")}` }),
      { status: 400, headers },
    );
  }

  const cached = await ctx.runQuery(internal.news.readCache, { topic });
  if (cached && Date.now() - cached.fetchedAt < CACHE_MS) {
    return new Response(
      JSON.stringify({ news: cached.stories, cached: true, fetchedAt: cached.fetchedAt }),
      { headers: { ...headers, "Cache-Control": "public, max-age=300" } },
    );
  }

  let stories;
  try {
    stories = await fetchTopic(topic);
  } catch {
    // Serving yesterday's stories beats showing CONNECTION_ERROR, which is what
    // the old Supabase-backed page did every single time once its backend vanished.
    if (cached) {
      return new Response(
        JSON.stringify({ news: cached.stories, cached: true, stale: true }),
        { headers },
      );
    }
    return new Response(JSON.stringify({ error: "Could not reach any news feed" }), {
      status: 502,
      headers,
    });
  }

  if (stories.length > 0) {
    await ctx.runMutation(internal.news.writeCache, { topic, stories });
  }
  return new Response(
    JSON.stringify({ news: stories, cached: false, fetchedAt: Date.now() }),
    { headers: { ...headers, "Cache-Control": "public, max-age=300" } },
  );
});

const http = httpRouter();
http.route({ path: "/news", method: "GET", handler: news });
http.route({
  path: "/news",
  method: "OPTIONS",
  handler: httpAction(
    async (_ctx, request) =>
      new Response(null, { status: 204, headers: cors(request.headers.get("Origin")) }),
  ),
});

export default http;
