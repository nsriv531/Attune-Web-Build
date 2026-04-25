import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // tasks table
  tasks: defineTable({
    text: v.string(),
    isCompleted: v.boolean(),
  }),
});