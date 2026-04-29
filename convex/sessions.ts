import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const saveSession = mutation({
  args: {
    subject: v.string(),
    subjectId: v.optional(v.string()),
    plannedDuration: v.number(),
    actualDuration: v.number(),
    focusScore: v.number(),
    xpEarned: v.number(),
    status: v.union(v.literal("completed"), v.literal("abandoned")),
    feeling: v.optional(v.string()),
    tags: v.array(v.string()),
    note: v.optional(v.string()),
    startedAt: v.number(),
    distractions: v.array(
      v.object({
        type: v.string(),
        durationSeconds: v.number(),
        timestamp: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // 1. Insert the session
    const sessionId = await ctx.db.insert("sessions", {
      userId: user._id,
      subject: args.subject,
      subjectId: args.subjectId,
      plannedDuration: args.plannedDuration,
      actualDuration: args.actualDuration,
      focusScore: args.focusScore,
      xpEarned: args.xpEarned,
      status: args.status,
      feeling: args.feeling,
      tags: args.tags,
      note: args.note,
      startedAt: args.startedAt,
    });

    // 2. Insert distractions
    for (const d of args.distractions) {
      await ctx.db.insert("distractions", {
        sessionId,
        userId: user._id,
        type: d.type,
        durationSeconds: d.durationSeconds,
        timestamp: d.timestamp,
      });
    }

    // 3. Update User Stats (XP, Total Sessions, Streaks)
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    let newStreak = user.streakDays;

    if (!user.lastSessionDate) {
      newStreak = 1;
    } else if (user.lastSessionDate === today) {
      // Already studied today, keep streak same
      newStreak = user.streakDays;
    } else {
      const lastDate = new Date(user.lastSessionDate);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      if (user.lastSessionDate === yesterdayStr) {
        newStreak = user.streakDays + 1;
      } else {
        // Streak broken
        newStreak = 1;
      }
    }

    await ctx.db.patch(user._id, {
      xp: user.xp + args.xpEarned,
      totalSessions: user.totalSessions + 1,
      streakDays: newStreak,
      lastSessionDate: today,
    });

    return { sessionId, newStreak, totalXp: user.xp + args.xpEarned };
  },
});

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) return [];

    return await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(args.limit ?? 50);
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) return null;

    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const totalXp = user.xp;
    const streakDays = user.streakDays;
    const totalSessions = sessions.length;
    const avgFocusScore = totalSessions > 0 
      ? Math.round(sessions.reduce((acc, s) => acc + s.focusScore, 0) / totalSessions)
      : 0;

    return {
      totalXp,
      streakDays,
      totalSessions,
      avgFocusScore,
    };
  },
});
