import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
  path: "/revenuecat",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Optional: Verify RevenueCat webhook signature via Authorization header
    const authHeader = request.headers.get("Authorization");
    const secret = process.env.REVENUECAT_WEBHOOK_SECRET;
    
    if (secret && authHeader !== secret) {
      return new Response("Unauthorized", { status: 401 });
    }

    try {
      const payload = await request.json();
      const event = payload.event;
      
      if (!event) {
          return new Response("No event data", { status: 400 });
      }

      // We expect the frontend to pass the Convex user ID as the RevenueCat app_user_id
      const userId = event.app_user_id; 
      
      let status = "unknown";
      if (event.type === "INITIAL_PURCHASE" || event.type === "RENEWAL" || event.type === "UNCANCELLATION" || event.type === "NON_RENEWING_PURCHASE") {
        status = "active";
      } else if (event.type === "CANCELLATION") {
        // CANCELLATION just means auto-renew is off. It's still active until expiration.
        // We rely on the EXPIRATION event to actually revoke access.
        status = "active"; 
      } else if (event.type === "EXPIRATION" || event.type === "BILLING_ISSUE") {
        status = "expired";
      }

      // If we don't have an expiration date (e.g. lifetime purchase), set it far in the future
      const endDate = event.expiration_at_ms 
        ? new Date(event.expiration_at_ms).getTime() 
        : Date.now() + 1000 * 60 * 60 * 24 * 365 * 100; // +100 years

      await ctx.runMutation(internal.subscriptions.processWebhook, {
        userId: userId as any,
        platform: event.store === "APP_STORE" ? "ios" : event.store === "PLAY_STORE" ? "android" : event.store === "WEB" ? "web" : "unknown",
        productId: event.product_id,
        originalTransactionId: event.original_transaction_id ?? event.transaction_id ?? "unknown_transaction",
        status: status as any,
        startDate: new Date(event.purchased_at_ms).getTime(),
        endDate: endDate,
      });

      return new Response(null, { status: 200 });
    } catch (error) {
      console.error("Webhook processing failed", error);
      // Even if our processing fails (e.g., user not found), return 200 so RevenueCat doesn't keep retrying forever
      return new Response("Webhook processed with internal errors", { status: 200 });
    }
  }),
});

export default http;