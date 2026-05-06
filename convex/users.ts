import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Ensures the user exists in the database after they sign in via Clerk.
 * Returns the user document ID.
 */
export const store = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    age: v.number(),
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
      // If we do, maybe update their name/email/age if they changed
      if (user.name !== args.name || user.email !== args.email || user.age !== args.age) {
        await ctx.db.patch(user._id, { name: args.name, email: args.email, age: args.age });
      }
      return user._id;
    }

    // If not, create a new user
    const userId = await ctx.db.insert("users", {
      tokenIdentifier: identity.tokenIdentifier,
      name: args.name,
      email: args.email,
      age: args.age,
      xpScore: 0,
      streakDays: 0,
      totalSessions: 0,
    });

    // Initialize default avatar for the new user
    await ctx.db.insert("avatars", {
      userId,
      animalType: "cat",
      hairColor: "brown",
      skinColor: "fair",
      hat: "none",
      clothing: "none",
      accessory: "none",
    });

    return userId;
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

export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    
    if (!user) return null;

    const avatar = await ctx.db
      .query("avatars")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter(q => q.eq(q.field("status"), "active"))
      .first();

    return {
      ...user,
      avatar,
      isPremium: !!subscription,
    };
  },
});

export const updateAvatar = mutation({
  args: {
    animalType: v.optional(v.union(v.literal("cat"), v.literal("dog"), v.literal("fox"), v.literal("bear"), v.literal("rabbit"), v.literal("koala"))),
    hairColor: v.optional(v.union(v.literal("black"), v.literal("brown"), v.literal("blonde"), v.literal("red"), v.literal("blue"), v.literal("pink"), v.literal("white"))),
    skinColor: v.optional(v.union(v.literal("fair"), v.literal("tan"), v.literal("brown"), v.literal("dark"))),
    hat: v.optional(v.union(v.literal("none"), v.literal("cap"), v.literal("beanie"), v.literal("crown"), v.literal("wizard"))),
    clothing: v.optional(v.union(v.literal("none"), v.literal("shirt"), v.literal("hoodie"), v.literal("scarf"))),
    accessory: v.optional(v.union(v.literal("none"), v.literal("glasses"), v.literal("sunglasses"), v.literal("monocle"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) throw new Error("User not found");

    const avatar = await ctx.db
      .query("avatars")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!avatar) throw new Error("Avatar not found");

    await ctx.db.patch(avatar._id, args);
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

    if (!user) return;

    // Delete related records
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const session of sessions) {
      const feedbacks = await ctx.db
        .query("feedback")
        .withIndex("by_session", (q) => q.eq("sessionId", session._id))
        .collect();
      for (const f of feedbacks) await ctx.db.delete(f._id);
      await ctx.db.delete(session._id);
    }

    const avatar = await ctx.db
      .query("avatars")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();
    if (avatar) await ctx.db.delete(avatar._id);

    const subscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    for (const s of subscriptions) await ctx.db.delete(s._id);

    const sweetSpot = await ctx.db
      .query("insightsSweetSpot")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();
    if (sweetSpot) await ctx.db.delete(sweetSpot._id);

    const peak = await ctx.db
      .query("insightsPeakDaysHours")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();
    if (peak) await ctx.db.delete(peak._id);

    await ctx.db.delete(user._id);
  },
});
