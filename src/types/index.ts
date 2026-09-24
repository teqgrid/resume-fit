// Shared TypeScript types for the whole app.
// Screens, API helpers, and navigation all import from here
// so the JSON from Gemini matches what the UI expects.

// Shape of the JSON we ask Gemini to return after comparing resume + JD.
export type ResumeAnalysis = {
  matchPercent: number; // 0–100 score shown as the big number
  summary: string; // short honest paragraph
  matchingSkills: string[]; // skills found in BOTH resume and JD
  missingSkills: string[]; // JD skills that are NOT on the resume
  experienceAlignment: string; // 1–2 lines about work history vs the role
  suggestedEdits: string[]; // exactly 3 resume changes (we slice to 3)
};

// What we keep after the user picks a PDF from the device.
export type PickedResume = {
  name: string; // file name shown on the upload card
  uri: string; // local file path we later convert to base64
  size?: number; // bytes, used to reject files over 5 MB
};

// React Navigation route map.
// Home takes no params. Result receives the analysis + file name.
export type RootStackParamList = {
  Home: undefined;
  Result: {analysis: ResumeAnalysis; fileName: string};
};
