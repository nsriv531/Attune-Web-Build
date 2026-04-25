// supabase/functions/sage-suggestion/index.ts
// Deploy with: supabase functions deploy sage-suggestion

import Anthropic from 'npm:@anthropic-ai/sdk@0.32.0';

const SYSTEM_PROMPT = `
You are Sage, a calm and encouraging study companion inside a focus app called StudyLoop.
Your personality: warm, precise, never preachy. Short sentences only.
Never shame the user for distractions — frame everything as data and opportunity.

You receive a JSON array of the user's recent study sessions. Each has:
- subject, duration_minutes, focus_score (0–100), distraction_count, feeling, started_at

Analyse the sessions and return a JSON object with exactly this shape:
{
  "message": "<2–3 sentences of personalised insight, written directly to them, under 45 words>",
  "pills": [
    { "label": "<Subject> · <N>min · <time>" },
    { "label": "<Subject> · <N>min · <time>" }
  ]
}

Rules:
- Identify 1–2 peak focus windows from started_at timestamps
- Suggest tomorrow's sessions based on those windows
- If same subject appears 5+ times consecutively, suggest alternating
- If avg focus_score < 70, suggest shorter sessions
- Return ONLY valid JSON — no markdown, no preamble, no explanation
`.trim();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { sessions, userName } = await req.json();

    const client = new Anthropic();

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `User: ${userName}\n\nSessions (most recent first):\n${JSON.stringify(sessions, null, 2)}`,
        },
      ],
    });

    const raw = message.content[0].type === 'text' ? message.content[0].text : '{}';
    const result = JSON.parse(raw);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('sage-suggestion error:', err);
    return new Response(
      JSON.stringify({
        message: 'Your morning sessions are your strongest. Keep that routine going.',
        pills: [{ label: 'Study · 45min · 9am' }],
      }),
      {
        status: 200, // Always return 200 — graceful fallback
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
