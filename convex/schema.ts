import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(), // Stable identifier from Clerk/Auth
    name: v.string(),
    email: v.optional(v.string()),
    xp: v.number(),
    streakDays: v.number(),
    totalSessions: v.number(),
    lastSessionDate: v.optional(v.string()), // YYYY-MM-DD for streak calculation
    isPremium: v.boolean(),
    // Spotify Integration
    spotifyAccessToken: v.optional(v.string()),
    spotifyRefreshToken: v.optional(v.string()),
    spotifyTokenExpiresAt: v.optional(v.number()), // Unix timestamp
  }).index("by_token", ["tokenIdentifier"]),

  sessions: defineTable({
    userId: v.id("users"),
    subject: v.string(),
    subjectId: v.optional(v.string()),
    plannedDuration: v.number(), // in minutes
    actualDuration: v.number(),  // in seconds
    focusScore: v.number(),      // 0-100
    xpEarned: v.number(),
    status: v.union(v.literal("completed"), v.literal("abandoned")),
    // Reflection
    feeling: v.optional(v.string()), // e.g., "focused", "tired", "anxious"
    tags: v.array(v.string()),       // phone, noise, etc.
    note: v.optional(v.string()),
    startedAt: v.number(),           // timestamp
  }).index("by_user", ["userId"]),

  distractions: defineTable({
    sessionId: v.id("sessions"),
    userId: v.id("users"),
    type: v.string(), // "app-switch", "idle", "scroll-burst"
    durationSeconds: v.number(),
    timestamp: v.number(),
  }).index("by_session", ["sessionId"])
    .index("by_user", ["userId"]),

  recommendations: defineTable({
    userId: v.id("users"),
    message: v.string(),
    type: v.string(), // "habit", "encouragement", "streak-alert"
    isRead: v.boolean(),
  }).index("by_user", ["userId"]),
});
