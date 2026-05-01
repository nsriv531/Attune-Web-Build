import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Ensures the user exists in the database after they sign in via Clerk.
 * Returns the user document ID.
 */
export const store = mutation({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called storeUser without authentication");
    }

    // Check if we already have this user
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (user !== null) {
      // If we do, maybe update their name/email if they changed
      if (user.name !== args.name || user.email !== args.email) {
        await ctx.db.patch(user._id, { name: args.name, email: args.email });
      }
      return user._id;
    }

    // If not, create a new user
    return await ctx.db.insert("users", {
      tokenIdentifier: identity.tokenIdentifier,
      name: args.name,
      email: args.email,
      xp: 0,
      streakDays: 0,
      totalSessions: 0,
      isPremium: false,
    });
  },
});

export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
  },
});

export const updateSpotifyTokens = mutation({
  args: {
    accessToken: v.string(),
    refreshToken: v.string(),
    expiresIn: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      spotifyAccessToken: args.accessToken,
      spotifyRefreshToken: args.refreshToken,
      spotifyTokenExpiresAt: Date.now() + args.expiresIn * 1000,
    });
  },
});

export const deleteAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) return; // User already deleted or doesn't exist

    // Delete related sessions
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const session of sessions) {
      // Delete distractions related to each session
      const distractions = await ctx.db
        .query("distractions")
        .withIndex("by_session", (q) => q.eq("sessionId", session._id))
        .collect();
      for (const d of distractions) {
        await ctx.db.delete(d._id);
      }
      await ctx.db.delete(session._id);
    }

    // Delete recommendations
    const recommendations = await ctx.db
      .query("recommendations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    
    for (const rec of recommendations) {
      await ctx.db.delete(rec._id);
    }

    // Finally, delete the user
    await ctx.db.delete(user._id);
  },
});
