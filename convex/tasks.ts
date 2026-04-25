import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// fetch data
export const get = query({
  handler: async (ctx) => {
    return await ctx.db.query("tasks").collect();
  },
});

//insert data
export const addTask = mutation({
  args: { text: v.string() }, handler: async (ctx, args) => {
    await ctx.db.insert("tasks", { text: args.text, isCompleted: false });
  },
});