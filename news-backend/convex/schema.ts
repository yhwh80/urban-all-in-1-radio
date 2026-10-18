import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // One row per topic. Rewritten in place each time a topic's feeds are refetched,
  // so this table never grows beyond the number of topics.
  newsCache: defineTable({
    topic: v.string(),
    fetchedAt: v.number(),
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
  }).index("by_topic", ["topic"]),
});
