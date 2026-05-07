import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ─── Focus score algorithm ───────────────────────────────────────────────────
function calculateFocusScore(distractions: any[], durationSeconds: number): number {
  let penalty = 0;
  for (const d of distractions) {
    // Logic adapted from frontend sessionStore.ts
    // For the new schema, distractionTime is the primary metric
    penalty += d.distractionTime > 60 ? 8 : d.distractionTime > 30 ? 5 : 2;
  }
  const minutes = durationSeconds / 60;
  const densityMultiplier = Math.min(1 + (distractions.length / (Math.max(minutes, 1) * 2)), 2);
  return Math.max(0, Math.round(100 - penalty * densityMultiplier));
}

// ─── XP formula ─────────────────────────────────────────────────────────────
function calculateXP(durationMinutes: number, focusScore: number): number {
  const base = Math.floor(durationMinutes);
  const bonus = focusScore >= 90 ? 20 : focusScore >= 75 ? 10 : focusScore >= 60 ? 5 : 0;
  return base + bonus;
}

export const saveSession = mutation({
  args: {
    subject: v.optional(v.string()),
    subjectId: v.optional(v.string()),
    timeOverall: v.number(),
    compiledDistractionTime: v.number(),
    categoryMusic: v.optional(v.string()),
    breakTime: v.optional(v.number()),
    resumeTime: v.optional(v.number()),
    distractionLogs: v.array(
      v.object({
        timeLeft: v.number(),
        timeCameBack: v.number(),
        distractionTime: v.number(),
      })
    ),
    startedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) throw new Error("User not found");

    const focusScore = calculateFocusScore(args.distractionLogs, args.timeOverall);
    const xpEarned = calculateXP(args.timeOverall / 60, focusScore);
    const coinsEarned = Math.floor(xpEarned / 2); // 1 coin per 2 XP

    const sessionId = await ctx.db.insert("sessions", {
      userId: user._id,
      subject: args.subject,
      subjectId: args.subjectId,
      timeOverall: args.timeOverall,
      compiledDistractionTime: args.compiledDistractionTime,
      categoryMusic: args.categoryMusic,
      breakTime: args.breakTime,
      resumeTime: args.resumeTime,
      focusScore,
      distractionLogs: args.distractionLogs,
      startedAt: args.startedAt,
    });

    // Update User Stats
    const today = new Date().toISOString().split("T")[0];
    let newStreak = user.streakDays || 0;

    if (!user.lastSessionDate) {
      newStreak = 1;
    } else if (user.lastSessionDate === today) {
      // Already studied today
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];
      newStreak = user.lastSessionDate === yesterdayStr ? (user.streakDays || 0) + 1 : 1;
    }

    await ctx.db.patch(user._id, {
      xpScore: user.xpScore + xpEarned,
      coins: (user.coins || 0) + coinsEarned,
      totalSessions: (user.totalSessions || 0) + 1,
      streakDays: newStreak,
      lastSessionDate: today,
    });

    return { sessionId, xpEarned, focusScore, newStreak, coinsEarned };
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

    const totalXp = user.xpScore;
    let streakDays = user.streakDays || 0;
    
    // Check if streak is broken
    if (user.lastSessionDate && streakDays > 0) {
      const today = new Date();
      // Reset hours to strictly compare dates
      today.setHours(0, 0, 0, 0);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const lastSessionStr = user.lastSessionDate;
      const todayStr = today.toISOString().split("T")[0];
      const yesterdayStr = yesterday.toISOString().split("T")[0];
      
      // If the last session wasn't today and wasn't yesterday, the streak is broken.
      if (lastSessionStr !== todayStr && lastSessionStr !== yesterdayStr) {
        streakDays = 0;
      }
    }

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

export const enforceStreak = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user || !user.lastSessionDate || !user.streakDays) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastSessionStr = user.lastSessionDate;
    const todayStr = today.toISOString().split("T")[0];
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    
    if (lastSessionStr !== todayStr && lastSessionStr !== yesterdayStr) {
      await ctx.db.patch(user._id, { streakDays: 0 });
    }
  },
});
