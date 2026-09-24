# ResumeFit — teaching script

Use this as a speaker script. For each block: **what** to explain, **how** to explain it, **what to say**, **what to show**, **what to ask**.

**Setup before people sit:** simulator on Home screen, Metro running, Gemini key in `.env`, one sample PDF resume on the machine (not only in iCloud). Whiteboard ready.

**Teaching style:** one idea, then one file, then one question. Do not open 8 files. The only files you need are `src/api/gemini.ts`, `src/api/pickResume.ts`, `src/screens/HomeScreen.tsx`, `src/screens/ResultScreen.tsx`.

---

## 0–5 min — Why we are building this

### What to explain
AI in a real product is not ChatGPT in a browser. It is a **feature**: the user gives input, our app calls an API, we show a result they can use.

Today’s feature: **does this resume match this job?**

They will see three skills, not 20:

1. Call a real AI API.
2. Write a prompt that returns JSON the UI can render.
3. Show that JSON on a phone.

### How to explain
Start from the **user**, not from Gemini.

Hold up the phone. Point at the two boxes: upload + job description. Say the app is a junior recruiter that reads both and scores the fit.

Do **not** analyze yet. Curiosity first.

### Say this
> If you apply on Naukri, a human opens your PDF and the job post and decides “this person fits” or “this person is missing React Native.” We are going to automate that in a mobile app.
>
> We are not training a model. We are **calling** a model, the same way you call a weather API. The difference: the weather API returns temperature; this API returns text, and we force that text to be JSON.

### Show
Home screen only. Point at:

- **Choose PDF**
- **Paste job description** (sample JD already there)
- **Analyze match** (below the fold — scroll to it)

### Ask
> Before we code: what two inputs does this feature need?  
Wait for: resume file + job description.

### If they look lost
Use food delivery: you pick a restaurant (input), the app calls an API, you see ETA (output). Same shape. AI is just a smarter API.

---

## 5–12 min — How an AI API actually works

### What to explain
Six words they must leave with: **URL, key, request, response, error, quota.**

Also: this demo has **no backend**. The phone talks to Google. That is simpler for class. In production you would hide the key on a server.

### How to explain
Draw the flow **slowly**, one arrow at a time. After each arrow, look at the room.

```
Phone: PDF + job description
           ↓  convert PDF to base64 (text that can travel in JSON)
Google Gemini
           ↓  JSON: score, skills, 3 edits
Result screen
```

Then open **one file**: `src/api/gemini.ts`. Do not scroll randomly. Jump to `analyzeResumeMatch`.

Explain like a letter:

- **Address** = URL
- **Stamp / ID** = API key
- **Body of the letter** = prompt + PDF
- **Reply** = JSON

### Say this, in this order

**1. API key**
> The key is a password for the API. Google knows it is *our* classroom project. Anyone with the key can spend *our* free quota. So it lives in `.env`, not in GitHub. Each of you should create your own key at aistudio.google.com/apikey.

Point at `getGeminiApiKey()` and the early `throw` if it is empty.

**2. URL / model**
> This string is the doorbell: model `gemini-2.0-flash`, method `generateContent`. Flash = fast and cheap. Good for a demo.

Point at `GEMINI_URL`.

**3. Request body**
> Gemini does not have a special “resume endpoint.” There is only “here is content, generate a reply.” We send two parts in one message.

Point at `parts`:

- First part `text`: our instructions + the job description.
- Second part `inline_data`: the PDF. `mime_type` tells Gemini “this is a PDF,” `data` is the file as base64.

**Analogy:** WhatsApp: you send a caption *and* a document in the same chat. Caption = prompt. Document = resume.

**4. Base64, in one sentence**
> JSON cannot carry a raw PDF. Base64 is the PDF rewritten as letters and numbers so it can sit inside JSON. The model turns it back into a document on their side. You do not need to read the base64 string. Treat it as “the file, packaged.”

Point at the comment above `inline_data`.

**5. Response**
> The useful text is nested: `candidates[0].content.parts[0].text`. That is the model’s answer. We parse it as JSON. If Google sent an `error` object, we show `error.message` on the red banner. Never swallow it.

**6. Quota**
> Free APIs are not unlimited. If 40 people hammer one key, you will see a 429 / quota error. That is a real production lesson: one key does not scale.

### Ask
> If there is no backend, where does the key live?  
> Why is that OK today and a bad idea if we put this on Play Store?

Wait for: on the phone / in the app. Anyone can extract it from the APK.

### What not to do
Do not explain OAuth, embeddings, tokens in depth, or fine-tuning. If someone asks “how does the model read PDF,” say: *Gemini has native document understanding. We send the file; they parse it. Our job is the request and the UI.*

---

## 12–22 min — Prompt engineering (this is the “AI” skill)

### What to explain
The model is not a resume parser product. It is a **next-text machine**. Quality comes from the prompt, not from a magic HR API.

A good product prompt does four jobs:

1. **Role** — who is speaking.
2. **Task** — compare resume to JD.
3. **Constraints** — don’t invent skills; if not a resume, score 0.
4. **Output contract** — exact JSON keys the UI already expects.

If the prompt is vague (“analyze this resume”), the UI cannot draw chips. If the prompt is strict, `ResultScreen` is easy.

### How to explain
Open `ANALYSIS_INSTRUCTION` in `src/api/gemini.ts`. Read it **out loud**, one sentence, then why.

Teach with “bad prompt vs our prompt.”

| If we wrote… | What goes wrong |
|---|---|
| “Analyze this resume” | A paragraph. No score. UI breaks. |
| “Give a score” | Score with no skills. Incomplete. |
| “List skills” | Invents React Native because the JD asked for it. |
| Our prompt | JSON with only skills that appear in the PDF. |

### Say this (line by line)

**“You are a recruiter.”**
> Role. The same input scored by a poet vs a recruiter will sound different. We want hiring language, not essays.

**“Compare this resume PDF to the job description.”**
> Two inputs, one job. Not “rewrite my resume,” not “write a cover letter.”

**“Be honest.”**
> Models like to please you. If we don’t say this, a weak resume becomes 90%.

**“If the file is not a resume, summary says so and matchPercent is 0.”**
> Guardrail. We will try this later with a random PDF.

**“Do not invent skills that are not in the resume.”**
> This is the most important sentence. The JD says TypeScript; the resume does not. It must go in `missingSkills`, not `matchingSkills`. That is hallucination control.

**JSON shape**
> We are not chatting. We are filling a form. `matchPercent`, `summary`, `matchingSkills`, `missingSkills`, `experienceAlignment`, `suggestedEdits`. The Result screen is written against these names. If Gemini renames a key, that section goes empty.

**“Exactly 3 suggestedEdits.”**
> Demos need a predictable UI. Three bullets always.

Then point at `generationConfig`:

- **`temperature: 0.2`** — 0 is rigid, 1 is creative. For scoring, we want boring and repeatable.
- **`responseMimeType: application/json`** — we *ask* for JSON.
- **`parseModelJson`** — models still wrap JSON in ` ```json `. We strip fences. That is defensive engineering, not a trick.

### Live 2-minute tweak (do it)
Change only the first line to: `You are a strict hiring manager. Be harsh.` Tell them: *same API, same PDF, different prompt = different score.* That *is* prompt engineering. You can re-run in the demo block.

### Ask
> If I delete “do not invent skills,” what will the matching-skills chips start showing?  
Wait for: skills from the JD that are not on the resume.

---

## 22–32 min — Practical API integration (live walkthrough)

### What to explain
Integration = **glue**. Three steps, three files. Plus the states that make it look like a product: empty, loading, error.

Do not rewrite the app from scratch in 10 minutes. Walk existing code. Freshers learn faster from a working path than from a blank file.

### How to explain
Keep Cursor/VS Code in a split: left = file, right = phone. After each file, point at the phone: “this button runs that function.”

---

### File 1 — `src/api/pickResume.ts` (the input)

**What:** Get a PDF off the device.

**How:** Tell a story: Android/iOS do not give you a Python `open('resume.pdf')`. You get a picker, then a URI.

Walk:

1. `pick({ type: [types.pdf] })` — the system file sheet, PDF only.
2. If name ends with `.doc` / `.docx` → throw `Please upload PDF`. Gemini’s document vision is built for PDF in this demo.
3. `keepLocalCopy` — copy into app cache so we can read bytes. The picker URI can expire.
4. If the user hits Cancel → return `null`. That is not an error. Don’t show a red banner.

**Say this**
> First rule of file APIs: cancelling is normal. Second rule: never trust the file. Check type and size.

Then jump to `HomeScreen` `onPickResume`: if `size > 5MB`, show “Please choose a PDF smaller than 5 MB.”

**Ask**
> Why 5 MB?  
Because we send the whole file in the JSON body. Huge PDFs = slow, expensive, easy to hit limits.

---

### File 2 — `uriToBase64` + `analyzeResumeMatch` in `src/api/gemini.ts` (the call)

**What:** Turn the file into a string, POST it, parse the reply.

**How:** Narrate `onAnalyze` as a recipe, then show the functions.

Recipe on the board:

```
1. Is there a PDF?
2. Is there a JD?
3. Is there a key?
4. URI → base64
5. POST Gemini
6. Parse JSON
7. Go to Result
```

Walk `analyzeResumeMatch` in that same order:

1. Empty key → throw a **human** message, not a stack trace.
2. Build `payload.contents[0].parts`.
3. `fetch(url + key)`, method POST, `Content-Type: application/json`.
4. `json.error` → throw `json.error.message` (quota, invalid key, safety block).
5. Dig out `candidates[0]...text`.
6. `parseModelJson` — clamp score 0–100, default arrays to `[]` so the UI never crashes.

**Say this**
> This is the whole AI integration. There is no extra library called “ResumeAI.” It is `fetch`, a JSON body, and careful parsing.
>
> `parseModelJson` is paranoid on purpose. AI output is messy. UI code should be boring.

**Ask**
> What should we show if Google returns a 429?  
The real message. Students should see quota. Hiding it teaches nothing.

---

### File 3 — `src/screens/HomeScreen.tsx` (the product)

**What:** State + validation + navigation.

Point at the four `useState`s:

| State | Job |
|---|---|
| `resume` | which file |
| `jobDescription` | the JD text |
| `error` | red banner |
| `loading` | spinner, disable buttons |

Walk `onAnalyze` **without rushing**:

- No file → “Upload a PDF resume first.”
- Empty JD → “Paste a job description first.”
- No key → tell them to copy `.env.example`.
- `setLoading(true)` **before** the network call.
- `finally { setLoading(false) }` — even if Gemini throws. Otherwise the button spins forever.

**Say this**
> Loading and error are not polish. They are API integration. Network is slow and it fails.

Point at the sample JD in `src/constants/sampleJob.ts`:
> The demo must work even if nobody copied a Naukri post. That’s why a placeholder JD is already filled.

**Ask**
> If I forget `finally`, what does the user see after an error?  
A stuck spinner.

---

## 32–45 min — Live demonstration (do not skip failures)

### What to explain
This is the “working AI-powered feature.” You are proving the previous 30 minutes. Narrate the **data**, not the animations.

### How to explain
Stand next to the simulator. Speak in the present tense. If it fails, that is the lesson — do not restart the talk.

### Demo A — happy path (main)

1. Tap **Choose PDF**. Pick the sample resume. Point: filename replaces “Choose PDF.”
2. Scroll the JD. Say: this can be any LinkedIn/Naukri post.
3. Tap **Analyze match**. While the spinner is on:

> Right now the PDF is becoming base64. Then it leaves the phone to Gemini. Gemini is reading the pages and the JD together. When JSON comes back, we only then open Result.

4. On Result, point in this order (same as `ResultScreen.tsx`):

   - **Big number** — `matchPercent`. Green 75+, amber 50–74, red below 50.
   - **Summary** — one honest paragraph.
   - **Experience alignment** — 1–2 lines, not a biography.
   - **Matching skills** — green chips. Challenge the room: “is this skill actually on the PDF?”
   - **Missing skills** — red chips. “This is what you would learn or add.”
   - **Suggested edits** — three concrete resume changes, not generic “be more confident.”

**Say this**
> The UI is dumb on purpose. It does not decide the score. It **displays** the JSON. If the score is wrong, we fix the prompt, not the stylesheet.

### Demo B — guardrail (if time, 2 min)

Upload a random PDF (invoice, notes). Expect `matchPercent: 0` and a summary that says this is not a resume.

**Say this**
> That sentence in the prompt just saved us from a fake 80% score.

### If the API errors
Read the red banner out loud.

| You see | You say |
|---|---|
| Missing GEMINI_API_KEY | Key is not in `.env`, or Metro wasn’t restarted after editing `.env`. |
| API key not valid | Wrong key, extra quotes, extra space. |
| Quota / 429 | Free tier. Too many requests. Wait or use another key. |
| Could not parse JSON | Model ignored the schema. Show `parseModelJson`. Rare with our prompt. |

Do not blame “AI is down” and move on.

### Optional: prompt tweak replay
If you changed “strict hiring manager” earlier, run the **same** PDF + JD again. Compare scores. Same integration, different prompt.

---

## 45–52 min — Architecture recap (honest)

### What to explain
Name the layers so they can repeat them in an interview.

```
Frontend (React Native)
  HomeScreen, ResultScreen, document picker
        ↓ HTTPS
Gemini (Google)
  generateContent
        ↓ JSON
Frontend again
  chips, score bar
```

There is **no backend** in this project. Say that clearly so nobody invents a Node box they didn’t see.

### How to explain
Table on the board:

| Layer | This demo | If we shipped it |
|---|---|---|
| UI | React Native | Same |
| Secrets | Key inside the app | Key on a server |
| AI | Gemini | Same, called from the server |
| Database | None | Save past analyses if you want |

**Say this**
> The TEQGRID line “frontend to backend to AI” is the **production** version. Today you learned the middle: how the AI API is called and how a prompt becomes UI. A backend would be one extra `fetch` from the phone to *your* server, and *your* server would call Gemini so the key never sits in the APK.
>
> We skipped that so you could see a full feature.

### Recap the three skills (count on your fingers)
1. Call a real AI API (`fetch` + key + JSON).
2. Prompt engineering (role, constraints, output contract).
3. Render structured output (score, chips, list).

### Ask
> Where would you put the API key if this went to the Play Store?  
Their laptop / a server / environment variables on a backend — not in the app.

---

## 52–60 min — Q&A

### How to run it
Silence is normal. Ask **one** seed question, wait 5 seconds, then answer if nobody does.

### Seed questions and short answers

**Why PDF, not Word?**
> Gemini document understanding is built around PDF. Word would mean extra extraction. We kept one path so the demo fits in an hour.

**Why base64, not Google Drive?**
> Drive would need login and another API. Base64 is one POST. Classroom-friendly.

**What if 40 students share one key?**
> You hit quota. Each person should use their own free key.

**Is the score “true”?**
> No. It is the model’s opinion under our prompt. Two runs can differ slightly. That’s why temperature is 0.2, not 1.

**How do I match one resume to 3 jobs?**
> Loop three JDs, three requests, three cards. Same function `analyzeResumeMatch`.

**Can it read a scanned photo of a resume?**
> Often yes, because Gemini looks at PDF pages. Still prefer a real text PDF for the demo.

**What is temperature again?**
> Creativity knob. Low = stable demo. High = messy JSON.

**Where do I get a key?**
> aistudio.google.com/apikey — free tier, no credit card for this classroom use.

### Close
> Clone ResumeFit. Put your key in `.env`. Run `npm start` and `npm run ios` or `npm run android`. Change one line of the prompt tonight and see the score move. That is the whole loop.

Mention the participation certificate if TEQGRID is issuing one. That is not part of the app.

---

## One-page cheat sheet (keep this beside the laptop)

| Time | You are teaching | Phone / editor |
|---|---|---|
| 0–5 | Feature, not ChatGPT | Home screen, don’t tap Analyze |
| 5–12 | URL, key, request, response | `analyzeResumeMatch` |
| 12–22 | Role, constraints, JSON contract | `ANALYSIS_INSTRUCTION` |
| 22–32 | Picker → base64 → fetch → parse | 3 files only |
| 32–45 | Working feature | Full analyze + Result |
| 45–52 | No backend; key would move to a server | Board table |
| 52–60 | Q&A | Seed questions |

**If you are running late:** skip Demo B and the strict-manager tweak. Never skip the happy-path analyze — that is the proof.
