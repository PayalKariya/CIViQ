import { NextRequest, NextResponse } from 'next/server';
import { DOMAINS } from '@/lib/complaint-categories';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const MAX_MESSAGES = 20;
const MAX_MESSAGE_CHARS = 3500;

/** Compact list only — full department/issue trees were huge and burned free-tier tokens per request. */
function buildDomainKnowledge(): string {
  return DOMAINS.map((d) => `${d.label} (\`${d.id}\`)`).join(', ');
}

/** Models to try in order when one returns 429/404 (free tier and availability vary by project). */
const DEFAULT_MODEL_CANDIDATES = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-2.0-flash',
] as const;

function buildSystemInstruction(userRole: string, userName: string): string {
  return `You are the in-app AI assistant for **CIViQ+**, a civic and institutional complaint management platform. You help real signed-in users succeed with the product.

## Current user (personalize briefly when natural)
- Name: ${userName}
- Role: ${userRole} (one of: citizen, authority, admin)

## What CIViQ+ does
Users file structured complaints by **domain** → **department** → **issue type**, with title, description, priority, and location (including optional photo evidence). Authorities work assigned complaints, update status, and use maps. Citizens track submissions, see stats, and use an interactive map. Notifications exist in the header (bell).

## App routes (use these exact paths when directing users)
- **Auth**: /login, /signup; marketing/landing: /
- **Citizen** (role citizen): /citizen (dashboard with totals, pending, in progress, escalated, resolved), /citizen/submit (new complaint), /citizen/complaints (list + stat cards: Total, Submitted, In Progress, Escalated, Resolved, Rejected), /citizen/complaints/[id] (detail), /citizen/complaints/[id]/feedback (after resolved), /citizen/map (Leaflet map + filters: domain, status, priority)
- **Authority** (role authority): /authority (dashboard), /authority/pending (assigned / pending work), /authority/map (map scoped to their access level)
- **Admin** (role admin): /admin (system overview / management)
- **Legal**: /terms, /privacy

## Complaint workflow & statuses
- **submitted** → **assigned** → **in_progress** → **resolved** OR **rejected**
- **escalated**: forwarded for higher attention; citizen dashboard and My Complaints show an Escalated count
Explain statuses in plain language when asked.

## Priorities
**critical**, **high**, **medium**, **low** — guide users to pick honestly; critical is for emergencies or severe harm.

## Domains in this app (submit flow: domain → department → issue type)
Top-level domains: ${buildDomainKnowledge()}.
Users choose a specific department and issue on **Submit Complaint**; do not list every issue ID unless the user asks for examples.

## Map (citizen / authority)
Interactive map with markers/clusters; filter by domain, status, priority; marker colors reflect urgency; click markers/tooltips for previews. Map is for visibility and planning—not a substitute for emergency services.

## Trust score
Citizens see a **trust score** (0–100) on the dashboard; it reflects constructive use of the platform. Do not invent a user’s score—if they ask for their number, tell them it is shown on their dashboard/profile area.

## Boundaries & safety
- You are **not** emergency services. For immediate danger, tell them to call local emergency numbers.
- Do **not** invent features, API behavior, or data about this user’s complaints. If something requires their account data they should look in **My Complaints** or complaint detail pages.
- For **bugs** (errors, crashes, not loading, broken uploads, map blank), be helpful with troubleshooting (refresh, browser, network) and note that the app may surface admin alerts when users report technical problems.
- Stay focused on CIViQ+ usage, civic/institutional complaints, navigation, and workflows. For unrelated topics, answer only briefly and steer back to how you can help with the app.

## Style
Friendly, clear, concise; step-by-step when explaining flows; optional light emoji sparingly. Use markdown lists when they help readability.`;
}

function shouldAlertAdmin(text: string): boolean {
  const lower = text.toLowerCase();
  const bugKeywords = [
    'bug',
    'error',
    'not working',
    'broken',
    'crash',
    'problem with app',
    'issue with',
    'cant load',
    "can't load",
    'not loading',
    'not displaying',
    'does not load',
    'won\'t load',
  ];
  return bugKeywords.some((keyword) => lower.includes(keyword));
}

function sanitizeMessages(messages: Message[]): Message[] {
  const trimmed = messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({
      role: m.role,
      content: m.content.slice(0, MAX_MESSAGE_CHARS).trim(),
    }))
    .filter((m) => m.content.length > 0);

  return trimmed.slice(-MAX_MESSAGES);
}

function toGeminiContents(messages: Message[]): Array<{ role: string; parts: { text: string }[] }> {
  const contents: Array<{ role: string; parts: { text: string }[] }> = [];
  let i = 0;
  if (messages.length > 0 && messages[0].role === 'assistant') {
    contents.push({ role: 'user', parts: [{ text: '(User opened the chat.)' }] });
    contents.push({ role: 'model', parts: [{ text: messages[0].content }] });
    i = 1;
  }
  for (; i < messages.length; i++) {
    const m = messages[i];
    contents.push({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    });
  }
  return contents;
}

function buildModelCandidates(): string[] {
  const preferred = process.env.GEMINI_MODEL?.trim();
  const rest = DEFAULT_MODEL_CANDIDATES.filter((m) => m !== preferred);
  return preferred ? [preferred, ...rest] : [...DEFAULT_MODEL_CANDIDATES];
}

async function generateWithModel(
  model: string,
  apiKey: string,
  systemInstruction: string,
  contents: Array<{ role: string; parts: { text: string }[] }>
): Promise<{ ok: true; text: string } | { ok: false; status: number; body: string }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: {
        role: 'system',
        parts: [{ text: systemInstruction }],
      },
      contents,
      generationConfig: {
        temperature: 0.65,
        maxOutputTokens: 1024,
      },
    }),
  });

  const raw = await res.text();

  if (!res.ok) {
    return { ok: false, status: res.status, body: raw };
  }

  let data: {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    promptFeedback?: { blockReason?: string };
  };
  try {
    data = JSON.parse(raw);
  } catch {
    return { ok: false, status: 502, body: 'Invalid JSON from Gemini' };
  }

  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ??
    (Array.isArray(data?.candidates?.[0]?.content?.parts)
      ? data.candidates![0].content!.parts!.map((p) => p.text ?? '').join('')
      : '');

  if (!text?.trim()) {
    const blockReason = data?.promptFeedback?.blockReason;
    return {
      ok: false,
      status: 502,
      body: blockReason ? `Blocked: ${blockReason}` : 'Empty response from model',
    };
  }

  return { ok: true, text: text.trim() };
}

async function callGeminiChat(
  systemInstruction: string,
  messages: Message[]
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY_MISSING');
  }

  const contents = toGeminiContents(sanitizeMessages(messages));
  if (contents.length === 0) {
    throw new Error('No valid messages to send');
  }

  const models = buildModelCandidates();
  let lastError = '';

  for (const model of models) {
    const result = await generateWithModel(model, apiKey, systemInstruction, contents);
    if (result.ok) {
      if (model !== models[0]) {
        console.info(`[chatbot] Gemini succeeded with fallback model: ${model}`);
      }
      return result.text;
    }

    lastError = result.body;
    const is429 = result.status === 429;
    const is404 = result.status === 404;
    const isRetryable =
      is429 ||
      is404 ||
      /RESOURCE_EXHAUSTED|quota|rate limit|not found|NOT_FOUND/i.test(result.body);

    if (isRetryable) {
      console.warn(`[chatbot] Gemini model ${model} failed (${result.status}), trying next…`);
      continue;
    }

    throw new Error(`Gemini API error: ${result.status} ${result.body}`);
  }

  throw new Error(`GEMINI_QUOTA:${lastError}`);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, userRole, userName } = body as {
      messages: Message[];
      userRole?: string;
      userName?: string;
    };

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error:
            'The AI assistant is not configured. Add GEMINI_API_KEY to your server environment (see .env.example).',
        },
        { status: 503 }
      );
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Invalid message format' }, { status: 400 });
    }

    const last = messages[messages.length - 1];
    if (!last || last.role !== 'user') {
      return NextResponse.json({ error: 'Invalid message format' }, { status: 400 });
    }

    const alertAdmin = shouldAlertAdmin(last.content);

    const systemInstruction = buildSystemInstruction(
      (userRole || 'citizen').toLowerCase(),
      userName?.trim() || 'User'
    );

    const aiText = await callGeminiChat(systemInstruction, messages);

    return NextResponse.json({ message: aiText, alertAdmin });
  } catch (error) {
    console.error('Chatbot API error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    if (msg === 'GEMINI_API_KEY_MISSING') {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not set on the server.' },
        { status: 503 }
      );
    }
    if (msg.startsWith('GEMINI_QUOTA:')) {
      return NextResponse.json(
        {
          error:
            'Google Gemini quota or rate limit was reached for all tried models. Wait a few minutes, set GEMINI_MODEL to another model (see .env.example), or enable billing in Google AI Studio. Details: https://ai.google.dev/gemini-api/docs/rate-limits',
        },
        { status: 429 }
      );
    }
    return NextResponse.json(
      {
        error:
          'The assistant could not complete this reply. Please try again in a moment. If this keeps happening, check GEMINI_API_KEY and GEMINI_MODEL.',
      },
      { status: 502 }
    );
  }
}
