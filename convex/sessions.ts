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
    plannedDuration: v.optional(v.number()),
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
      plannedDuration: args.plannedDuration,
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

export const deleteLastSession = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) throw new Error("User not found");

    // Get the most recent session
    const lastSession = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .first();

    if (!lastSession) {
      throw new Error("No sessions found to delete");
    }

    // Reverse the XP and coins calculation
    const xpEarned = calculateXP(lastSession.timeOverall / 60, lastSession.focusScore);
    const coinsEarned = Math.floor(xpEarned / 2);

    await ctx.db.patch(user._id, {
      xpScore: Math.max(0, user.xpScore - xpEarned),
      coins: Math.max(0, user.coins - coinsEarned),
      totalSessions: Math.max(0, (user.totalSessions || 1) - 1),
    });

    // Delete feedback associated with the session
    const feedbacks = await ctx.db
      .query("feedback")
      .withIndex("by_session", (q) => q.eq("sessionId", lastSession._id))
      .collect();
    for (const f of feedbacks) {
      await ctx.db.delete(f._id);
    }

    // Delete the session itself
    await ctx.db.delete(lastSession._id);

    return { success: true, deletedSessionId: lastSession._id };
  },
});

/**
 * DEV ONLY: Generates a fake history of sessions for testing insights.
 * Can be run from the Convex Dashboard.
 */
export const seedFakeHistory = mutation({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    let user;

    if (args.userId) {
      user = await ctx.db.get(args.userId);
    } else {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) throw new Error("Not authenticated. Please provide a userId argument.");

      user = await ctx.db
        .query("users")
        .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
        .unique();
    }

    if (!user) throw new Error("User not found");

    console.log("Seeding fake sessions for user:", user._id);

    let totalXpGained = 0;
    let sessionsAdded = 0;

    const SUBJECTS = [
      { id: "math-101", name: "Calculus III" },
      { id: "cs-201", name: "Data Structures" },
      { id: "bio-101", name: "Cell Biology" },
      { id: "eng-101", name: "Creative Writing" },
      { id: "phys-201", name: "Quantum Mechanics" },
      { id: "work-1", name: "Deep Work" }
    ];
    
    const MUSIC = ["lofi", "rain", "forest", "white-noise", "silence"];

    // Generate 15 fake sessions spread over the last 14 days
    for (let i = 0; i < 15; i++) {
      // Random days ago (0 to 14)
      const daysAgo = Math.floor(Math.random() * 14);
      
      // Random start hour (favoring 9am - 5pm)
      const hour = Math.floor(Math.random() * 8) + 9;
      
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      date.setHours(hour, 0, 0, 0);

      // Random duration: 15, 25, or 45 mins
      const durations = [15, 25, 45];
      const plannedDuration = durations[Math.floor(Math.random() * durations.length)];
      
      // Focus score (mostly good, some bad)
      const focusScore = Math.floor(Math.random() * 40) + 60; // 60 to 100
      
      const xpEarned = calculateXP(plannedDuration, focusScore);
      totalXpGained += xpEarned;
      sessionsAdded++;

      const randomSubject = SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)];
      const randomMusic = MUSIC[Math.floor(Math.random() * MUSIC.length)];

      await ctx.db.insert("sessions", {
        userId: user._id,
        subject: randomSubject.name,
        subjectId: randomSubject.id,
        plannedDuration: plannedDuration,
        timeOverall: plannedDuration * 60, // Assume they stayed the whole time
        compiledDistractionTime: (100 - focusScore) * 2, // Fake distraction time based on score
        categoryMusic: randomMusic,
        breakTime: 0,
        resumeTime: 0,
        focusScore: focusScore,
        distractionLogs: [], // Too complex to fake realistically, leave empty for insights
        startedAt: date.getTime(),
      });
    }

    // Update user stats
    await ctx.db.patch(user._id, {
      xpScore: user.xpScore + totalXpGained,
      coins: user.coins + Math.floor(totalXpGained / 2),
      totalSessions: (user.totalSessions || 0) + sessionsAdded,
    });

    return `Successfully generated ${sessionsAdded} fake sessions!`;
  },
});
