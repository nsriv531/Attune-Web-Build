import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) return [];

    return await ctx.db
      .query("recommendations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(10);
  },
});

/**
 * A placeholder for a recommendation engine. 
 * In a real app, this might be called by an Action that uses an LLM 
 * or a rule-based system after a session ends.
 */
export const generateForSession = mutation({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) return null;

    let message = "Keep up the great work!";
    let type = "encouragement";
    let pills: { label: string }[] = [];

    if (session.focusScore < 70) {
      if (session.tags.includes("noise")) {
        message = "It looks like noise is a challenge. Try a different floor or noise-cancelling headphones next time.";
        type = "habit";
        pills = [{ label: "Try · Noise cancelling" }];
      } else if (session.tags.includes("tired")) {
        message = "You seem tired. Consider a shorter 25-minute session to keep your focus sharp.";
        type = "habit";
        pills = [{ label: "Try · 25min session" }];
      } else {
        message = "Tough session. Try defining a very small first step next time to build momentum.";
        type = "habit";
        pills = [{ label: "Try · Smaller steps" }];
      }
    } else if (session.focusScore > 90) {
      message = "Peak flow! This subject and duration are a great match for you.";
      type = "encouragement";
      pills = [{ label: `Peak · ${session.plannedDuration}min` }];
    }

    await ctx.db.insert("recommendations", {
      userId: session.userId,
      message,
      type,
      isRead: false,
      pills,
    });

    return message;
  },
});
