# 📄 ResumeFit — Resume vs Job Match

<p align="center">
  <img src="src/assets/logo.png" alt="ResumeFit logo" width="120" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-0.87-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Gemini-Free_API-4285F4?style=for-the-badge&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/Platform-iOS%20%7C%20Android-lightgrey?style=for-the-badge" />
</p>

> Upload a PDF resume, paste a job description, and see how well they match — score, skills, and three concrete resume edits. Built with React Native CLI (**not Expo**) and the **Google Gemini free API**. No backend.

---

## 📸 Screenshots


  

<p>
  <img src="docs/screenshots/home.png" alt="Home — upload a PDF and paste a job description" width="200" />
  <img src="docs/screenshots/home-ready.png" alt="Home — resume selected and sample job description filled" width="200" />
  <img src="docs/screenshots/result.png" alt="Result — match score, summary, and matching skills" width="200" />
  <img src="docs/screenshots/result-skills.png" alt="Result — missing skills and suggested resume edits" width="200" /> 
  </p>

| 🏠 Home | ✅ Home (ready) | 📊 Result | 💡 Result (skills) |
|:-:|:-:|:-:|:-:|
| Upload card + job box | Selected PDF + sample JD | Score, summary, alignment | Skill chips + 3 edits |

---

## 🎯 Problem it solves

Applying for a job usually means a human opens your PDF and the job post, then decides “this person fits” or “this person is missing React Native.” ResumeFit automates that on a phone:

- 📄 Resume PDF in
- 📝 Job text in
- 🎯 Match out (0–100, matching / missing skills, 3 edits)

There is **no backend**. The phone talks to Gemini directly. In production you would hide the API key on a server.

---

## ✨ Features

| Screen | What it does |
|--------|-------------|
| 🏠 **Home** | Pick a PDF (5 MB max), paste a JD or tap **Use sample**, tap **Analyze match** |
| 📊 **Result** | Score bar, summary, experience alignment, green/red skill chips, 3 suggested edits |

- 📎 PDF only — Word files are rejected
- 🤖 Real Gemini analysis — no mock scores
- 🧪 Sample junior React Native JD for a live demo
- 🎓 Teaching script and slide deck in the repo

Seminar materials: [`SEMINAR.md`](./SEMINAR.md) · [`ResumeFit-Seminar.pptx`](./ResumeFit-Seminar.pptx)

---

## 🛠️ Tech stack

- **React Native 0.87** — CLI, iOS + Android
- **TypeScript** — shared types for navigation, picker, and Gemini JSON
- **React Navigation 7** — native stack (`Home` → `Result`)
- **@react-native-documents/picker** — system PDF picker + `keepLocalCopy`
- **Google Gemini 2.0 Flash** — `generateContent` with PDF `inline_data`
- **react-native-dotenv** — `GEMINI_API_KEY` from `.env` at build time

---

## 🏗️ Architecture

```
Phone: pick PDF + paste job description
        ↓
keepLocalCopy → file:// URI
        ↓
uriToBase64 → PDF as text inside JSON
        ↓
POST Gemini generateContent (prompt + inline PDF)
        ↓
parseModelJson → ResumeAnalysis
        ↓
Result screen
```

Screens never talk HTTP. They call helpers in `src/api/`. Gemini is treated like any other REST API: **URL, key, request, response, error, quota**.

### 📨 Request

One `generateContent` call with two parts:

1. **Text** — recruiter prompt + job description. Asks for JSON only, with the keys Result already renders.
2. **PDF** — `inline_data` with `mime_type: application/pdf` and base64 bytes.

Model: `gemini-2.0-flash`. Temperature `0.2`. `responseMimeType` is `application/json`. The parser still strips markdown fences (` ```json `).

### 📦 Response (`ResumeAnalysis`)

```ts
{
  matchPercent: number;          // clamped 0–100
  summary: string;
  matchingSkills: string[];
  missingSkills: string[];
  experienceAlignment: string;
  suggestedEdits: string[];      // sliced to 3
}
```

### 📁 Folder layout

```
App.tsx                         # Gesture + SafeArea wrappers
index.js                        # AppRegistry entry
src/
  api/
    pickResume.ts               # OS file picker → local PDF copy
    gemini.ts                   # key, prompt, base64, fetch, JSON parse
  screens/
    HomeScreen.tsx              # collect inputs, validate, call analyze
    ResultScreen.tsx            # render ResumeAnalysis
  components/                   # Logo, MatchScore, SkillChips
  navigation/index.tsx          # native stack: Home → Result
  types/index.ts                # shared TS types
  constants/sampleJob.ts        # demo JD
  theme/index.ts                # colors, spacing, radius
android/  ios/                  # native projects (React Native CLI)
.env.example                    # GEMINI_API_KEY=  (copy to .env, never commit)
```

| File | Responsibility |
|------|----------------|
| `src/api/pickResume.ts` | PDF picker + `keepLocalCopy` so the URI does not expire |
| `src/api/gemini.ts` | All Gemini work. Screens do not know HTTP details |
| `src/screens/HomeScreen.tsx` | Pick → validate → base64 → analyze → navigate |
| `src/screens/ResultScreen.tsx` | Display only. Receives `analysis` + `fileName` |
| `src/types/index.ts` | `ResumeAnalysis`, `PickedResume`, `RootStackParamList` |

### 🔄 Analyze flow

1. User picks a PDF. Word files and files over **5 MB** are rejected.
2. User pastes a JD or taps **Use sample**.
3. Home checks: resume, JD, and `GEMINI_API_KEY`.
4. `uriToBase64` reads the file and strips the `data:...;base64,` prefix.
5. `analyzeResumeMatch` POSTs to Gemini. Google’s error (quota, bad key, safety) is shown as-is.
6. `parseModelJson` clamps the score and fills missing arrays.
7. Navigation opens **Result**.

### 🔐 Secrets

`react-native-dotenv` injects `.env` as `@env` at **build** time. Changing the key requires a Metro restart. `.env` is gitignored. Commit only `.env.example`.

---

## 🚀 Getting started

### ✅ Prerequisites

- Node **22.11+**
- [React Native 0.87 environment](https://reactnative.dev/docs/set-up-your-environment)
  - **Android:** JDK 17+, Android Studio, SDK
  - **iOS (macOS):** Xcode, CocoaPods
- A free Gemini key from [Google AI Studio](https://aistudio.google.com/apikey)

### 💻 Installation

```bash
git clone https://github.com/Aishwaryaofficial/resume-fit.git
cd resume-fit
npm install

cp .env.example .env
# edit .env: GEMINI_API_KEY=your_key_here  (no quotes)

# iOS
bundle install
cd ios && bundle exec pod install && cd ..

npm start
# in another terminal
npm run ios
# or
npm run android
```

Restart Metro after any `.env` change.

---

## 📱 Run on a real phone

Keep the phone on the **same Wi‑Fi as the computer**, or use USB. Metro must stay running.

### 🤖 Android (USB)

1. Enable **Developer options** → **USB debugging**.
2. Plug in USB. Tap **Allow**.
3. Confirm the device: `adb devices`
4. `adb reverse tcp:8081 tcp:8081`
5. `npm run android`

### 🍎 iPhone (USB + Xcode)

1. Plug in, unlock, tap **Trust**. Turn on **Developer Mode** if asked.
2. Xcode → Settings → Accounts → add your Apple ID.
3. Open `ios/ResumeFit.xcworkspace` (the **workspace**, not `.xcodeproj`).
4. Signing & Capabilities → **Automatically manage signing** → choose your Team.
5. Run on the physical iPhone. Trust the developer certificate on the phone.
6. `npx react-native run-ios --device`

Allow **Local Network** the first time so JS can load from the computer.

### 🔴 “Could not connect to Metro”

- Android: `adb reverse tcp:8081 tcp:8081`, then shake → Reload
- iPhone: same Wi‑Fi, allow Local Network, shake → Reload
- Confirm Metro is running: `npm start`

---

## ▶️ Try the app

1. Tap **Upload resume** and pick a PDF.
2. Paste a job post or tap **Use sample**.
3. Tap **Analyze match**.
4. Result shows a 0–100 score, matching / missing skills, experience alignment, and 3 suggested edits.

---

## 🧪 Tests

```bash
npm test
npm run lint
```

| Test | What it proves |
|------|----------------|
| `__tests__/App.test.tsx` | App mounts (gesture-handler and navigator are mocked) |
| `__tests__/gemini.test.ts` | `parseModelJson` strips ```json fences |
| `__tests__/gemini.test.ts` | `matchPercent` of `140` is clamped to `100` |

Jest maps `@env` to `__mocks__/env.js` so tests do not read a real key.

---

## 📜 Scripts

| Command | What it does |
|---------|--------------|
| `npm start` | Metro bundler |
| `npm run android` | Build and run on Android |
| `npm run ios` | Build and run on iOS |
| `npm test` | Jest |
| `npm run lint` | ESLint |

---

## 📝 Notes

- PDF only, max 5 MB. Each person should use their **own** Gemini key.
- Do not commit `.env` or ship a public app with a hardcoded key.
- Gemini free-tier rate limits are fine for a demo, not for a production ATS.
- Teaching script: [`SEMINAR.md`](./SEMINAR.md). Open `src/api/gemini.ts`, `src/api/pickResume.ts`, `src/screens/HomeScreen.tsx`, `src/screens/ResultScreen.tsx`.

---

## 📄 License

MIT — free to use, fork, and learn from.
