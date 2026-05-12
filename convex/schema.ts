import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    tokenIdentifier: v.string(), // Unique Clerk auth token
    age: v.number(),
    spotifyId: v.optional(v.string()),
    spotifyAccessToken: v.optional(v.string()),
    spotifyRefreshToken: v.optional(v.string()),
    spotifyTokenExpiresAt: v.optional(v.number()),
    xpScore: v.number(), // default 0
    coins: v.number(), // default 500
    unlockedItems: v.array(v.string()), // Shop item IDs
    equippedItems: v.any(), // Record<ClothingItem, string>

    // Keep these for internal logic if needed, but primary focus is the new fields
    streakDays: v.optional(v.number()),
    totalSessions: v.optional(v.number()),
    lastSessionDate: v.optional(v.string()),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_email", ["email"]),

  avatars: defineTable({
    userId: v.id("users"),
    animalType: v.union(
      v.literal("cat"),
      v.literal("dog"),
      v.literal("fox"),
      v.literal("bear"),
      v.literal("rabbit"),
      v.literal("koala")
    ),
    hairColor: v.union(
      v.literal("black"),
      v.literal("brown"),
      v.literal("blonde"),
      v.literal("red"),
      v.literal("blue"),
      v.literal("pink"),
      v.literal("white")
    ),
    skinColor: v.union(
      v.literal("fair"),
      v.literal("tan"),
      v.literal("brown"),
      v.literal("dark")
    ),
    hat: v.union(
      v.literal("none"),
      v.literal("cap"),
      v.literal("beanie"),
      v.literal("crown"),
      v.literal("wizard")
    ),
    clothing: v.union(
      v.literal("none"),
      v.literal("shirt"),
      v.literal("hoodie"),
      v.literal("scarf")
    ),
    accessory: v.union(
      v.literal("none"),
      v.literal("glasses"),
      v.literal("sunglasses"),
      v.literal("monocle")
    ),
  }).index("by_user", ["userId"]),

  subscriptions: defineTable({
    userId: v.id("users"),
    platform: v.union(v.literal("ios"), v.literal("android")),
    productId: v.string(), // IAP SKU
    originalTransactionId: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("expired"),
      v.literal("grace_period")
    ),
    startDate: v.number(), // timestamp
    endDate: v.number(),   // timestamp
  }).index("by_user", ["userId"]),

  sessions: defineTable({
    userId: v.id("users"),
    subject: v.optional(v.string()), // Restored for UI
    subjectId: v.optional(v.string()), // Restored for UI
    timeOverall: v.number(), // total duration
    compiledDistractionTime: v.number(),
    categoryMusic: v.optional(v.string()),
    breakTime: v.optional(v.number()),
    resumeTime: v.optional(v.number()),
    focusScore: v.number(),
    distractionLogs: v.array(
      v.object({
        timeLeft: v.number(),
        timeCameBack: v.number(),
        distractionTime: v.number(),
      })
    ),
    startedAt: v.number(),
  }).index("by_user", ["userId"]),

  feedback: defineTable({
    sessionId: v.id("sessions"),
    userId: v.id("users"),
    rating: v.number(), // integer 1-4
    comment: v.optional(v.string()),
  })
    .index("by_session", ["sessionId"])
    .index("by_user", ["userId"]),

  insightsSweetSpot: defineTable({
    userId: v.id("users"),
    data: v.any(), // dynamic focus metrics
  }).index("by_user", ["userId"]),

  insightsPeakDaysHours: defineTable({
    userId: v.id("users"),
    data: v.any(), // productivity timing metrics
  }).index("by_user", ["userId"]),

  resources: defineTable({
    title: v.string(),
    description: v.string(),
    url: v.string(),
    category: v.string(),
    externalId: v.optional(v.string()), // Used to prevent duplicates from external APIs
    publishedAt: v.number(),
  }).index("by_published", ["publishedAt"])
    .index("by_external_id", ["externalId"]),

  bookmarkedResources: defineTable({
    userId: v.id("users"),
    resourceId: v.id("resources"),
  }).index("by_user", ["userId"])
    .index("by_user_and_resource", ["userId", "resourceId"]),
});
