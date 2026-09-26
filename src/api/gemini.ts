// All Gemini API work lives here: key, prompt, base64, fetch, JSON parse.
// The screens only call these functions. They do not know HTTP details.

import {GEMINI_API_KEY} from '@env'; // injected from .env by react-native-dotenv
import {ResumeAnalysis} from '../types';

// 5 MB cap because the whole PDF rides inside the JSON request body.
export const MAX_RESUME_BYTES = 5 * 1024 * 1024;

// Flash = fast + cheap. Good for a classroom demo.
export const GEMINI_MODEL = 'gemini-3.1-flash-lite';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// This prompt IS the product logic.
// Role + task + guardrails + exact JSON keys the Result screen already uses.
const ANALYSIS_INSTRUCTION = `You are a recruiter. Compare this resume PDF to the job description.
Be honest. If the file is not a resume, say so in "summary" and set "matchPercent" to 0.
Do not invent skills that are not in the resume.
Return JSON only with this exact shape:
{
  "matchPercent": 0,
  "summary": "",
  "matchingSkills": [],
  "missingSkills": [],
  "experienceAlignment": "",
  "suggestedEdits": []
}
"suggestedEdits" must contain exactly 3 concrete resume edits that would improve fit for this job.`;

// Only the fields we actually read from Google's reply.
type GeminiResponse = {
  error?: {message?: string; status?: string; code?: number};
  candidates?: Array<{
    content?: {parts?: Array<{text?: string}>};
  }>;
};

// Empty string if .env is missing or the key is only spaces.
export const getGeminiApiKey = () => (GEMINI_API_KEY ?? '').trim();

// Turn the model's text into a safe ResumeAnalysis object.
export function parseModelJson(raw: string): ResumeAnalysis {
  const trimmed = raw.trim();
  // Models often wrap JSON in markdown fences like ```json ... ```
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = (fenced ? fenced[1] : trimmed).trim();
  const parsed = JSON.parse(body) as Partial<ResumeAnalysis>;

  // Clamp so a wild 140 or "abc" cannot break the score bar.
  const matchPercent = Math.max(
    0,
    Math.min(100, Number(parsed.matchPercent) || 0),
  );

  // Default missing fields so the UI never crashes on undefined.
  return {
    matchPercent,
    summary: String(parsed.summary ?? ''),
    matchingSkills: Array.isArray(parsed.matchingSkills)
      ? parsed.matchingSkills.map(String)
      : [],
    missingSkills: Array.isArray(parsed.missingSkills)
      ? parsed.missingSkills.map(String)
      : [],
    experienceAlignment: String(parsed.experienceAlignment ?? ''),
    suggestedEdits: Array.isArray(parsed.suggestedEdits)
      ? parsed.suggestedEdits.map(String).slice(0, 3)
      : [],
  };
}

// JSON cannot carry a raw PDF. Base64 is the file rewritten as text.
export async function uriToBase64(uri: string): Promise<string> {
  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error(`Could not read the resume file (${response.status}).`);
  }
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Could not convert the resume to base64.'));
        return;
      }
      // readAsDataURL returns "data:application/pdf;base64,AAAA..."
      // Gemini only wants the part after the comma.
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () =>
      reject(new Error('Could not convert the resume to base64.'));
    reader.readAsDataURL(blob);
  });
}

// One POST: prompt + PDF. Returns structured analysis for ResultScreen.
export async function analyzeResumeMatch(
  pdfBase64: string,
  jobDescription: string,
): Promise<ResumeAnalysis> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error(
      'Missing GEMINI_API_KEY. Copy .env.example to .env and paste your Google AI Studio key.',
    );
  }

  // Gemini has no special "resume endpoint".
  // We send two parts in one chat message: text instructions + the PDF.
  const payload = {
    contents: [
      {
        parts: [
          {
            text: `${ANALYSIS_INSTRUCTION}\n\nJob description:\n${jobDescription}`,
          },
          // inline_data = WhatsApp-style "caption + document" in one message.
          {
            inline_data: {
              mime_type: 'application/pdf',
              data: pdfBase64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2, // low = more consistent scores for a live demo
      responseMimeType: 'application/json', // ask for JSON (we still fence-strip)
    },
  };

  const response = await fetch(`${GEMINI_URL}?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload),
  });

  const json = (await response.json()) as GeminiResponse;
  // Show Google's real message (quota, bad key, safety) — do not hide it.
  if (!response.ok || json.error) {
    throw new Error(
      json.error?.message || `Gemini request failed (${response.status}).`,
    );
  }

  // The useful text is nested: candidates[0].content.parts[].text
  const text = json.candidates?.[0]?.content?.parts
    ?.map(part => part.text ?? '')
    .join('')
    .trim();

  if (!text) {
    throw new Error('Gemini returned an empty response.');
  }

  try {
    return parseModelJson(text);
  } catch {
    throw new Error('Gemini returned JSON that could not be parsed.');
  }
}
