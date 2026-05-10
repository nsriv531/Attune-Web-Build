import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createOrUpdateSubscription = mutation({
  args: {
    platform: v.union(v.literal("ios"), v.literal("android")),
    productId: v.string(),
    originalTransactionId: v.string(),
    status: v.union(v.literal("active"), v.literal("expired"), v.literal("grace_period")),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) throw new Error("User not found");

    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter(q => q.eq(q.field("originalTransactionId"), args.originalTransactionId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        endDate: args.endDate,
      });
      return existing._id;
    }

    return await ctx.db.insert("subscriptions", {
      userId: user._id,
      ...args,
    });
  },
});

export const getActiveSubscription = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) return null;

    return await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter(q => q.eq(q.field("status"), "active"))
      .first();
  },
});
