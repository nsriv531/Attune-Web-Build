import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getSweetSpot = query({
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
      .query("insightsSweetSpot")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();
  },
});

export const getPeakDaysHours = query({
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
      .query("insightsPeakDaysHours")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();
  },
});

/**
 * Triggered after a session or on a schedule to re-calculate insights.
 */
export const updateInsights = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) throw new Error("User not found");

    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Logic to calculate sweet spot (e.g., duration with highest focus score)
    const sweetSpotData = calculateSweetSpot(sessions);
    const existingSweetSpot = await ctx.db
      .query("insightsSweetSpot")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();
    
    if (existingSweetSpot) {
      await ctx.db.patch(existingSweetSpot._id, { data: sweetSpotData });
    } else {
      await ctx.db.insert("insightsSweetSpot", { userId: user._id, data: sweetSpotData });
    }

    // Logic to calculate peak days/hours
    const peakData = calculatePeakDaysHours(sessions);
    const existingPeak = await ctx.db
      .query("insightsPeakDaysHours")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();
    
    if (existingPeak) {
      await ctx.db.patch(existingPeak._id, { data: peakData });
    } else {
      await ctx.db.insert("insightsPeakDaysHours", { userId: user._id, data: peakData });
    }
  },
});

function calculateSweetSpot(sessions: any[]) {
  // Placeholder logic
  if (sessions.length === 0) return { bestDuration: 0, avgFocus: 0 };
  
  const durations = sessions.reduce((acc, s) => {
    const d = Math.round(s.timeOverall / 60);
    if (!acc[d]) acc[d] = { count: 0, totalFocus: 0 };
    acc[d].count++;
    acc[d].totalFocus += s.focusScore;
    return acc;
  }, {} as Record<number, { count: number, totalFocus: number }>);

  let bestDuration = 0;
  let maxAvg = 0;
  for (const [d, stats] of Object.entries(durations)) {
    const s = stats as { count: number, totalFocus: number };
    const avg = s.totalFocus / s.count;
    if (avg > maxAvg) {
      maxAvg = avg;
      bestDuration = Number(d);
    }
  }

  return { bestDuration, avgFocus: maxAvg };
}

function calculatePeakDaysHours(sessions: any[]) {
  // Placeholder logic
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const heatmap = Array.from({ length: 7 }, () => Array(24).fill(0));

  for (const s of sessions) {
    const date = new Date(s.startedAt);
    const day = (date.getDay() + 6) % 7;
    const hour = date.getHours();
    heatmap[day][hour] += s.focusScore;
  }

  return { heatmap };
}
