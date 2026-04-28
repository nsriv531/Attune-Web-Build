import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";

export const exchangeCode = action({
  args: {
    code: v.string(),
    redirectUri: v.string(),
  },
  handler: async (ctx, args) => {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET in environment variables");
    }

    const params = new URLSearchParams({
      grant_type: "authorization_code",
      code: args.code,
      redirect_uri: args.redirectUri,
    });

    const response = await fetch(SPOTIFY_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + Buffer.from(clientId + ":" + clientSecret).toString("base64"),
      },
      body: params.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Spotify token exchange failed", data);
      throw new Error(data.error_description || "Failed to exchange code for token");
    }

    // Save the tokens using the mutation we created earlier
    await ctx.runMutation(api.users.updateSpotifyTokens, {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    });

    return { success: true };
  },
});

export const getValidToken = action({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.runQuery(api.users.currentUser);
    if (!user || !user.spotifyAccessToken || !user.spotifyRefreshToken) {
      return null;
    }

    // Check if token is expired (with 5 min buffer)
    const isExpired = user.spotifyTokenExpiresAt 
      ? Date.now() > user.spotifyTokenExpiresAt - 300000 
      : true;

    if (!isExpired) {
      return user.spotifyAccessToken;
    }

    // Refresh token
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    const params = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: user.spotifyRefreshToken,
    });

    const response = await fetch(SPOTIFY_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + Buffer.from(clientId + ":" + clientSecret).toString("base64"),
      },
      body: params.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Spotify token refresh failed", data);
      return null;
    }

    // Update the database with new token
    await ctx.runMutation(api.users.updateSpotifyTokens, {
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? user.spotifyRefreshToken, // Spotify might not return a new refresh token
      expiresIn: data.expires_in,
    });

    return data.access_token;
  },
});
