// lib/claude.ts
// Calls your Supabase Edge Function which proxies to the Claude API.
// Keep the API key server-side only — never ship it in the app bundle.

import type { Session, SmartSuggestion } from '@/types';

// ─── Prompt template (mirrored in the Edge Function) ─────────────────────────
// This is the system prompt used server-side. Keep it here as reference.
export const SAGE_SYSTEM_PROMPT = `
You are Soli, a warm and encouraging sun-ring fox study companion inside a focus app called StudyLoop.
Your personality: warm, precise, radiating focus. You speak in short sentences. 
You never shame the user for distractions — you frame everything as data and opportunity.

You receive a JSON array of the user's last 30 study sessions. Each session has:
- subject, duration_minutes, focus_score (0–100), distraction_count, feeling, started_at

Your job: analyse the sessions and return a JSON object with:
{
  "message": "<2-3 sentences of insight about their patterns, written directly to them>",
  "pills": [
    { "label": "<subject> · <duration>min · <time>" },
    { "label": "<subject> · <duration>min · <time>" }
  ]
}

Rules:
- Identify their 1–2 peak focus time windows from started_at timestamps
- Suggest tomorrow's sessions based on those windows
- If they've done the same subject 5+ times in a row, gently suggest alternating
- Focus score below 70 → suggest shorter sessions
- Keep message under 40 words
`.trim();

export async function generateSageSuggestion(sessions: Session[], userName: string): Promise<SmartSuggestion> {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase credentials not found");
  }

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/generate-suggestion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ sessions, userName }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as SmartSuggestion;
  } catch (error) {
    console.error("Sage analysis failed:", error);
    // Fallback if AI fails
    return {
      message: `Keep it up, ${userName}. Your consistency is your superpower. Every session counts toward your goal.`,
      pills: [
        { label: "Deep Work · 25min · 9am" },
        { label: "Focus · 45min · 2pm" }
      ]
    };
  }
}
