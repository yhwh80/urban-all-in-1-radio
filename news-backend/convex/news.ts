import { v } from "convex/values";
import { internalQuery, internalMutation } from "./_generated/server";

export type Story = {
  title: string;
  summary: string;
  source: string;
  url: string;
  pubDate: number;
  image?: string;
};

/**
 * Feeds per topic. Every one of these was checked live on 2026-10-18 and returned
 * a parseable feed. Sources that are dead or bot-blocked are listed at the bottom
 * so nobody wastes time re-adding them.
 */
export type Feed = { name: string; url: string; filter?: boolean };

const FEED_TIMEOUT_MS = 6000;
const OG_TIMEOUT_MS = 5000;

/**
 * Feeds per topic. Every one was checked live on 2026-10-18 and returned a
 * parseable feed.
 *
 * `filter: true` means the feed is general-interest and its items must pass the
 * topic keyword test below. Feeds without it are already genre-specific — the
 * Guardian's per-genre tag feeds, for instance — so filtering them would only
 * discard good stories.
 */
export const FEEDS: Record<string, Feed[]> = {
  uk: [
    { name: "The Guardian", url: "https://www.theguardian.com/music/grime/rss" },
    { name: "The Guardian", url: "https://www.theguardian.com/music/afrobeats/rss" },
    { name: "Clash", url: "https://www.clashmusic.com/feed/", filter: true },
    { name: "NME", url: "https://www.nme.com/news/music/feed", filter: true },
    { name: "DJ Mag", url: "https://djmag.com/rss.xml", filter: true },
  ],
  hiphop: [
    { name: "The Guardian", url: "https://www.theguardian.com/music/hip-hop/rss" },
    { name: "The Guardian", url: "https://www.theguardian.com/music/rap/rss" },
    { name: "Rated R&B", url: "https://ratedrnb.com/feed/" },
    { name: "Billboard", url: "https://www.billboard.com/feed/", filter: true },
    { name: "Rolling Stone", url: "https://www.rollingstone.com/music/feed/", filter: true },
    { name: "Stereogum", url: "https://www.stereogum.com/feed/", filter: true },
    { name: "Pitchfork", url: "https://pitchfork.com/feed/feed-news/rss", filter: true },
  ],
  basketball: [
    { name: "BBC Sport", url: "https://feeds.bbci.co.uk/sport/basketball/rss.xml" },
    { name: "ESPN", url: "https://www.espn.com/espn/rss/nba/news" },
  ],
  football: [
    { name: "BBC Sport", url: "https://feeds.bbci.co.uk/sport/football/rss.xml" },
  ],
  f1: [
    { name: "BBC Sport", url: "https://feeds.bbci.co.uk/sport/formula1/rss.xml" },
  ],
  tech: [
    { name: "The Verge", url: "https://www.theverge.com/rss/index.xml" },
    { name: "TechCrunch", url: "https://techcrunch.com/feed/" },
  ],
  entertainment: [
    { name: "Variety", url: "https://variety.com/feed/" },
    { name: "BBC News", url: "https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml" },
  ],
};
// Dead as of 2026-10-18 — do not re-add without re-checking:
//   GRM Daily (403, Cloudflare bot block), Link Up TV (404), Complex (404),
//   HipHopDX (410 Gone), HotNewHipHop (404), The FADER (404), Okayplayer (404),
//   Mixmag (404), GUAP (no DNS), Trench (404), Resident Advisor (404),
//   guardian tags rnbandsoul / dancemusic / urban (404).

/**
 * `uk` and `hiphop` draw on general music feeds, so they are keyword-filtered down
 * to the genres the station actually plays. The other topics are already specific
 * enough that filtering would only throw away good stories.
 */
const KEYWORDS: Record<string, string[]> = {
  uk: [
    "grime", "drill", "uk rap", "afrobeat", "afroswing", "garage", "amapiano",
    "stormzy", "central cee", "dave", "little simz", "skepta", "jorja smith",
    "headie one", "digga d", "raye", "knucks", "aitch", "tion wayne", "arrdee",
    "cat burns", "mahalia", "ghetts", "kano", "wretch 32", "j hus", "nines",
    "fredo", "potter payper", "bashy", "pa salieu", "shygirl", "flo",
  ],
  hiphop: [
    "hip-hop", "hip hop", "rap", "rapper", "r&b", "rnb", "afrobeat", "drill",
    "drake", "kendrick", "travis scott", "cardi", "nicki minaj", "tyler the creator",
    "j. cole", "j cole", "megan thee stallion", "doja cat", "sza",
    "21 savage", "lil wayne", "asap", "playboi carti", "gunna", "latto", "ice spice",
  ],
};

const ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  "#8216": "‘", "#8217": "’", "#8220": "“", "#8221": "”",
  "#8211": "–", "#8212": "—", "#038": "&", "#039": "'", "#8230": "…",
};

function decode(s: string): string {
  return s
    .replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z]+);/g, (m, code: string) => {
      if (ENTITIES[code]) return ENTITIES[code];
      if (code.startsWith("#x")) return String.fromCodePoint(parseInt(code.slice(2), 16));
      if (code.startsWith("#")) return String.fromCodePoint(parseInt(code.slice(1), 10));
      return m;
    })
    .trim();
}

function tag(block: string, name: string): string {
  // Matches <name>…</name> and <ns:name>…</ns:name>, CDATA or plain.
  const re = new RegExp(`<(?:[a-zA-Z0-9]+:)?${name}[^>]*>([\\s\\S]*?)</(?:[a-zA-Z0-9]+:)?${name}>`, "i");
  const m = block.match(re);
  if (!m) return "";
  const raw = m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
  return decode(raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " "));
}

function image(block: string): string | undefined {
  // BBC uses media:thumbnail / media:content; WordPress feeds embed an <img> in the description.
  const direct =
    block.match(/<media:(?:thumbnail|content)[^>]*\burl=["']([^"']+)["']/i) ||
    block.match(/<enclosure[^>]*\burl=["']([^"']+)["'][^>]*type=["']image/i) ||
    block.match(/<img[^>]*\bsrc=["']([^"']+)["']/i);
  if (!direct) return undefined;
  const url = decode(direct[1]);
  return url.startsWith("http") ? url : undefined;
}

function parseFeed(xml: string, source: string): Story[] {
  const blocks = xml.match(/<(item|entry)\b[\s\S]*?<\/\1>/gi) ?? [];
  const out: Story[] = [];
  for (const b of blocks) {
    const title = tag(b, "title");
    // Atom puts the URL in <link href="…"/> rather than as element text.
    const link = tag(b, "link") || b.match(/<link[^>]*\bhref=["']([^"']+)["']/i)?.[1] || "";
    if (!title || !link) continue;
    const dateStr = tag(b, "pubDate") || tag(b, "updated") || tag(b, "published");
    const parsed = dateStr ? Date.parse(dateStr) : NaN;
    const body = tag(b, "description") || tag(b, "summary") || tag(b, "content");
    out.push({
      title,
      summary: body.length > 260 ? body.slice(0, 257).trimEnd() + "…" : body,
      source,
      url: decode(link),
      pubDate: Number.isNaN(parsed) ? Date.now() : parsed,
      image: image(b),
    });
  }
  return out;
}

/**
 * Word-boundary matching, not substring. A plain `includes` matched "rap" inside
 * "Strapless" and "dave" inside "Davey", which put Taylor Swift gown coverage on
 * the hip-hop tab. Boundaries are built per keyword and cached.
 */
const BOUNDARY_CACHE = new Map<string, RegExp>();

function boundaryRe(keyword: string): RegExp {
  let re = BOUNDARY_CACHE.get(keyword);
  if (!re) {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // \b is unreliable next to "&" or "." (as in "r&b", "j. cole"), so assert on
    // a non-word character or string edge instead.
    re = new RegExp(`(^|[^a-z0-9])${escaped}($|[^a-z0-9])`, "i");
    BOUNDARY_CACHE.set(keyword, re);
  }
  return re;
}

export function matchesTopic(story: Story, topic: string): boolean {
  const words = KEYWORDS[topic];
  if (!words) return true;
  const hay = (story.title + " " + story.summary).toLowerCase();
  return words.some((w) => boundaryRe(w).test(hay));
}

/** Exported for the HTTP action; kept here so the feed list and parser live together. */
/**
 * Some feeds carry no images at all — Rated R&B publishes none, and Rolling Stone's
 * items omit them — so the article page is asked for its og:image instead. Checked
 * 2026-10-18: this recovered an image for 6 of 6 otherwise-imageless stories.
 *
 * Only ever called for stories already trimmed to the returned 12, and the result is
 * cached for 15 minutes with them, so it is at most 12 extra fetches per topic per
 * refresh — not one per page view.
 */
async function ogImage(pageUrl: string): Promise<string | undefined> {
  try {
    const res = await fetch(pageUrl, {
      signal: AbortSignal.timeout(OG_TIMEOUT_MS),
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; UrbanRadioBot/1.0; +https://urbanallin1radio.co.uk)",
        Accept: "text/html",
      },
    });
    if (!res.ok) return undefined;

    // Only the <head> is needed; article bodies can be hundreds of KB.
    const html = (await res.text()).slice(0, 120_000);
    const meta =
      html.match(/<meta[^>]*\b(?:property|name)=["'](?:og:image(?::url)?|twitter:image)["'][^>]*\bcontent=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]*\bcontent=["']([^"']+)["'][^>]*\b(?:property|name)=["'](?:og:image(?::url)?|twitter:image)["']/i);
    if (!meta) return undefined;

    const raw = decode(meta[1]);
    // og:image is often protocol-relative or site-root-relative.
    if (raw.startsWith("//")) return "https:" + raw;
    if (raw.startsWith("/")) return new URL(raw, pageUrl).href;
    return raw.startsWith("http") ? raw : undefined;
  } catch {
    return undefined;
  }
}

export async function fetchTopic(topic: string): Promise<Story[]> {
  const feeds = FEEDS[topic] ?? FEEDS.uk;

  // One slow feed must not sink the whole topic, so failures resolve to [].
  const results = await Promise.all(
    feeds.map(async (f) => {
      try {
        const res = await fetch(f.url, {
          // DJ Mag took 13s unaided, which the whole page then waited on. Feeds are
          // fetched in parallel, so a slow one now simply drops out of this refresh.
          signal: AbortSignal.timeout(FEED_TIMEOUT_MS),
          headers: {
            // Several of these 403 a bare fetch with no UA.
            "User-Agent": "Mozilla/5.0 (compatible; UrbanRadioBot/1.0; +https://urbanallin1radio.co.uk)",
            Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml",
          },
        });
        if (!res.ok) return [];
        const stories = parseFeed(await res.text(), f.name);
        // Genre-specific feeds are already on-topic; only general ones get filtered.
        return f.filter ? stories.filter((st) => matchesTopic(st, topic)) : stories;
      } catch {
        return [];
      }
    }),
  );

  const seen = new Set<string>();
  const stories = results
    .flat()
    .filter((s) => {
      // Same story syndicated to several feeds — dedupe on title.
      const key = s.title.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => b.pubDate - a.pubDate)
    .slice(0, 12);

  // Backfill images only for the stories actually being returned.
  await Promise.all(
    stories.map(async (s) => {
      if (!s.image) s.image = await ogImage(s.url);
    }),
  );

  return stories;
}

export const readCache = internalQuery({
  args: { topic: v.string() },
  handler: async (ctx, { topic }) =>
    await ctx.db.query("newsCache").withIndex("by_topic", (q) => q.eq("topic", topic)).unique(),
});

export const writeCache = internalMutation({
  args: {
    topic: v.string(),
    stories: v.array(
      v.object({
        title: v.string(),
        summary: v.string(),
        source: v.string(),
        url: v.string(),
        pubDate: v.number(),
        image: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, { topic, stories }) => {
    const existing = await ctx.db
      .query("newsCache")
      .withIndex("by_topic", (q) => q.eq("topic", topic))
      .unique();
    const row = { topic, stories, fetchedAt: Date.now() };
    if (existing) await ctx.db.patch(existing._id, row);
    else await ctx.db.insert("newsCache", row);
  },
});

/**
 * Ops helper: drop a topic's cached row (or every row) so the next request refetches.
 * Needed after changing the feed list or the parser — otherwise the old rows keep
 * serving for up to 15 minutes and it looks like the deploy did nothing.
 *   npx convex run --prod news:clearCache '{"topic":"hiphop"}'
 *   npx convex run --prod news:clearCache '{}'
 */
export const clearCache = internalMutation({
  args: { topic: v.optional(v.string()) },
  handler: async (ctx, { topic }) => {
    const rows = topic
      ? await ctx.db.query("newsCache").withIndex("by_topic", (q) => q.eq("topic", topic)).collect()
      : await ctx.db.query("newsCache").collect();
    for (const r of rows) await ctx.db.delete(r._id);
    return { cleared: rows.length };
  },
});
