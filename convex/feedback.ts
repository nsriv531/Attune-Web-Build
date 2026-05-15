import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addFeedback = mutation({
  args: {
    sessionId: v.id("sessions"),
    rating: v.number(), // 1-4
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) throw new Error("User not found");

    return await ctx.db.insert("feedback", {
      userId: user._id,
      sessionId: args.sessionId,
      rating: args.rating,
      comment: args.comment,
    });
  },
});

export const getForSession = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("feedback")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .unique();
  },
});
