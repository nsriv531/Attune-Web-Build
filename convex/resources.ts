import { mutation, query, action, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// ─── Queries ─────────────────────────────────────────────────────────────────

/**
 * Lists all resources, sorted by newest first.
 */
export const listAll = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("resources")
      .withIndex("by_published")
      .order("desc")
      .take(args.limit ?? 50);
  },
});

/**
 * Lists the IDs of all resources the authenticated user has bookmarked.
 */
export const getBookmarks = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) return [];

    const bookmarks = await ctx.db
      .query("bookmarkedResources")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return bookmarks.map((b) => b.resourceId);
  },
});

// ─── Mutations ───────────────────────────────────────────────────────────────

/**
 * Toggles a bookmark on or off for the authenticated user.
 */
export const toggleBookmark = mutation({
  args: { resourceId: v.id("resources") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) throw new Error("User not found");

    const existingBookmark = await ctx.db
      .query("bookmarkedResources")
      .withIndex("by_user_and_resource", (q) => 
        q.eq("userId", user._id).eq("resourceId", args.resourceId)
      )
      .unique();

    if (existingBookmark) {
      await ctx.db.delete(existingBookmark._id);
      return { status: "removed" };
    } else {
      await ctx.db.insert("bookmarkedResources", {
        userId: user._id,
        resourceId: args.resourceId,
      });
      return { status: "added" };
    }
  },
});

// ─── Sync Engine (Actions) ───────────────────────────────────────────────────

/**
 * Internal mutation called by the action to safely write the fetched data to the DB.
 */
export const internalUpsertResource = internalMutation({
  args: {
    title: v.string(),
    description: v.string(),
    url: v.string(),
    category: v.string(),
    externalId: v.string(),
    publishedAt: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if we already fetched this specific article
    const existing = await ctx.db
      .query("resources")
      .withIndex("by_external_id", (q) => q.eq("externalId", args.externalId))
      .unique();

    if (existing) {
      // Update it if it exists (in case title/description changed on the source site)
      await ctx.db.patch(existing._id, {
        title: args.title,
        description: args.description,
        url: args.url,
        category: args.category,
      });
      return existing._id;
    }

    // Insert new
    return await ctx.db.insert("resources", args);
  },
});

/**
 * Background action that reaches out to external APIs (like Mindshift),
 * parses the content, and pushes it into the Convex database.
 * This can be triggered manually via the dashboard or set up on a cron job.
 */
export const syncExternalResources = action({
  args: {},
  handler: async (ctx) => {
    console.log("Starting Wikipedia Concepts sync...");

    // We will pull core productivity and psychology concepts from Wikipedia
    // This API is extremely reliable, fast, and does not require an API key.
    const topics = [
      "Cognitive_behavioral_therapy",
      "Pomodoro_Technique",
      "Attention_span",
      "Flow_(psychology)",
      "Executive_dysfunction",
      "Time_management",
      "Neuroplasticity"
    ];

    let newCount = 0;

    for (const topic of topics) {
      try {
        const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${topic}`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          console.warn(`Wikipedia API failed for ${topic}: ${response.statusText}`);
          continue;
        }

        const data = await response.json();
        
        // Ensure we got a valid extract
        if (!data.title || !data.extract) continue;

        await ctx.runMutation(internal.resources.internalUpsertResource, {
          title: data.title,
          description: data.extract.substring(0, 300) + (data.extract.length > 300 ? "..." : ""),
          url: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${topic}`,
          category: "Concepts", 
          externalId: `wiki_${data.pageid || topic}`,
          publishedAt: Date.now() - (newCount * 1000), // Slight offset for sorting
        });
        
        newCount++;
      } catch (error) {
        console.error(`Error syncing topic ${topic}:`, error);
      }
    }

    console.log(`Sync complete. Processed ${newCount} external resources.`);
    return { success: true, processed: newCount };
  },
});