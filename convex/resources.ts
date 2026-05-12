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
    console.log("Starting resource sync...");

    // STUB: This is where you will do a fetch() to the Mindshift API or RSS feed.
    // Example: const response = await fetch("https://api.mindshift.com/v1/articles");
    // const data = await response.json();
    
    // For now, we will simulate receiving an array of articles from an external source:
    const mockExternalData = [
      {
        id: "mindshift-article-101",
        title: "The Neuroscience of Deep Work",
        summary: "How minimizing context-switching literally changes your brain chemistry over 30 days.",
        link: "https://example.com/deep-work",
        category: "Science",
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
      },
      {
        id: "mindshift-article-102",
        title: "The 5-Minute Break Rule",
        summary: "Why resting your eyes on distant objects is more effective than closing them.",
        link: "https://example.com/break-rule",
        category: "Techniques",
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 5, // 5 days ago
      }
    ];

    let newCount = 0;

    for (const article of mockExternalData) {
      await ctx.runMutation(internal.resources.internalUpsertResource, {
        title: article.title,
        description: article.summary,
        url: article.link,
        category: article.category,
        externalId: article.id,
        publishedAt: article.timestamp,
      });
      newCount++;
    }

    console.log(`Sync complete. Processed ${newCount} external resources.`);
    return { success: true, processed: newCount };
  },
});