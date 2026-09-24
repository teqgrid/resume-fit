#!/usr/bin/env python3
"""Build the ResumeFit seminar deck."""

from pathlib import Path

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN
from pptx.oxml.ns import nsmap
from pptx.oxml.xmlchemy import OxmlElement
from pptx.util import Emu, Inches, Pt

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "ResumeFit-Seminar.pptx"
LOGO = ROOT / "src" / "assets" / "logo.png"

NAVY = RGBColor(0x0F, 0x17, 0x2A)
BLUE = RGBColor(0x25, 0x63, 0xEB)
BLUE_DARK = RGBColor(0x1D, 0x4E, 0xD8)
SLATE = RGBColor(0x47, 0x55, 0x69)
MUTED = RGBColor(0x64, 0x74, 0x8B)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
BG = RGBColor(0xF3, 0xF6, 0xFB)
CARD = RGBColor(0xFF, 0xFF, 0xFF)
LINE = RGBColor(0xE2, 0xE8, 0xF0)
GREEN = RGBColor(0x05, 0x96, 0x69)
AMBER = RGBColor(0xD9, 0x77, 0x06)
RED = RGBColor(0xDC, 0x26, 0x26)
LIGHT_BLUE = RGBColor(0xEE, 0xF3, 0xFF)

W = Inches(13.333)
H = Inches(7.5)


def _set_run(run, text, size=20, bold=False, color=NAVY, font="Calibri"):
    run.text = text
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = color
    run.font.name = font


def add_text(box, text, size=20, bold=False, color=NAVY, align=PP_ALIGN.LEFT):
    tf = box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.alignment = align
    _set_run(p.add_run() if p.runs else p.runs[0] if False else __import__("pptx.util", fromlist=["x"]), text, size, bold, color)


def set_para(p, text, size=20, bold=False, color=NAVY, align=PP_ALIGN.LEFT, space_after=8):
    p.clear()
    p.alignment = align
    p.space_after = Pt(space_after)
    run = p.add_run()
    _set_run(run, text, size, bold, color)


def fill(shape, color):
    shape.fill.solid()
    shape.fill.fore_color.rgb = color
    shape.line.fill.background()


def rect(slide, l, t, w, h, color):
    s = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, l, t, w, h)
    fill(s, color)
    return s


def round_rect(slide, l, t, w, h, color):
    s = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, l, t, w, h)
    fill(s, color)
    return s


def textbox(slide, l, t, w, h):
    return slide.shapes.add_textbox(l, t, w, h)


def write_box(slide, l, t, w, h, lines, default_size=20):
    """lines: list of str or (text, size, bold, color)."""
    box = textbox(slide, l, t, w, h)
    tf = box.text_frame
    tf.word_wrap = True
    for i, line in enumerate(lines):
        if isinstance(line, str):
            text, size, bold, color = line, default_size, False, NAVY
        else:
            text, size, bold, color = line[0], line[1], line[2], line[3]
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = PP_ALIGN.LEFT
        p.space_after = Pt(6)
        run = p.add_run()
        _set_run(run, text, size, bold, color)
    return box


def footer(slide, page, total=26):
    bar = rect(slide, 0, Inches(7.22), W, Inches(0.28), NAVY)
    box = textbox(slide, Inches(0.4), Inches(7.22), Inches(10), Inches(0.28))
    tf = box.text_frame
    p = tf.paragraphs[0]
    run = p.add_run()
    _set_run(run, "ResumeFit  ·  seminar", 11, False, WHITE)
    num = textbox(slide, Inches(11.6), Inches(7.22), Inches(1.4), Inches(0.28))
    p = num.text_frame.paragraphs[0]
    p.alignment = PP_ALIGN.RIGHT
    run = p.add_run()
    _set_run(run, f"{page}  /  {total}", 11, False, WHITE)


def accent_bar(slide):
    rect(slide, 0, 0, Inches(0.12), H, BLUE)


def blank(prs):
    return prs.slides.add_slide(prs.slide_layouts[6])


def title_slide(prs):
    s = blank(prs)
    rect(s, 0, 0, W, H, NAVY)
    rect(s, 0, 0, Inches(0.18), H, BLUE)
    if LOGO.exists():
        s.shapes.add_picture(str(LOGO), Inches(0.7), Inches(0.7), Inches(1.05), Inches(1.05))
    write_box(
        s,
        Inches(0.7),
        Inches(2.15),
        Inches(12),
        Inches(3.4),
        [
            ("HANDS-ON SEMINAR", 16, True, RGBColor(0x93, 0xC5, 0xFD)),
            ("ResumeFit", 54, True, WHITE),
            ("Match a resume to a job with a real AI API", 26, False, RGBColor(0xCB, 0xD5, 0xE1)),
            ("React Native + Google Gemini (free)", 18, False, RGBColor(0x94, 0xA3, 0xB8)),
        ],
    )


def section_slide(prs, kicker, title, time_label, page, total):
    s = blank(prs)
    rect(s, 0, 0, W, H, NAVY)
    rect(s, 0, 0, Inches(0.18), H, BLUE)
    write_box(
        s,
        Inches(0.8),
        Inches(2.3),
        Inches(11.5),
        Inches(3.2),
        [
            (time_label.upper(), 16, True, RGBColor(0x93, 0xC5, 0xFD)),
            (kicker, 18, False, RGBColor(0x94, 0xA3, 0xB8)),
            (title, 40, True, WHITE),
        ],
    )
    footer(s, page, total)


def content_slide(prs, kicker, title, bullets, page, total, note=None):
    s = blank(prs)
    rect(s, 0, 0, W, H, BG)
    accent_bar(s)
    write_box(s, Inches(0.55), Inches(0.28), Inches(12), Inches(0.35), [(kicker.upper(), 13, True, BLUE)])
    write_box(s, Inches(0.55), Inches(0.58), Inches(12.2), Inches(0.7), [(title, 30, True, NAVY)])
    lines = []
    for b in bullets:
        lines.append((f"  {b}", 20, False, SLATE))
    write_box(s, Inches(0.55), Inches(1.45), Inches(12.2), Inches(5.2 if not note else 4.4), lines)
    if note:
        card = round_rect(s, Inches(0.55), Inches(6.15), Inches(12.2), Inches(0.85), LIGHT_BLUE)
        write_box(s, Inches(0.75), Inches(6.28), Inches(11.8), Inches(0.65), [(note, 16, True, BLUE_DARK)])
    footer(s, page, total)
    return s


def two_col(prs, kicker, title, left_title, left_items, right_title, right_items, page, total):
    s = blank(prs)
    rect(s, 0, 0, W, H, BG)
    accent_bar(s)
    write_box(s, Inches(0.55), Inches(0.28), Inches(12), Inches(0.35), [(kicker.upper(), 13, True, BLUE)])
    write_box(s, Inches(0.55), Inches(0.58), Inches(12.2), Inches(0.65), [(title, 28, True, NAVY)])
    round_rect(s, Inches(0.5), Inches(1.45), Inches(5.9), Inches(5.4), WHITE)
    round_rect(s, Inches(6.9), Inches(1.45), Inches(5.9), Inches(5.4), WHITE)
    write_box(s, Inches(0.75), Inches(1.6), Inches(5.5), Inches(0.45), [(left_title, 18, True, BLUE)])
    write_box(s, Inches(7.15), Inches(1.6), Inches(5.5), Inches(0.45), [(right_title, 18, True, BLUE)])
    write_box(
        s,
        Inches(0.75),
        Inches(2.15),
        Inches(5.5),
        Inches(4.4),
        [(f"  {x}", 17, False, SLATE) for x in left_items],
    )
    write_box(
        s,
        Inches(7.15),
        Inches(2.15),
        Inches(5.5),
        Inches(4.4),
        [(f"  {x}", 17, False, SLATE) for x in right_items],
    )
    footer(s, page, total)


def cards_slide(prs, kicker, title, cards, page, total):
    """cards: list of (title, body) length 3 or 4."""
    s = blank(prs)
    rect(s, 0, 0, W, H, BG)
    accent_bar(s)
    write_box(s, Inches(0.55), Inches(0.28), Inches(12), Inches(0.35), [(kicker.upper(), 13, True, BLUE)])
    write_box(s, Inches(0.55), Inches(0.58), Inches(12.2), Inches(0.65), [(title, 28, True, NAVY)])
    n = len(cards)
    gap = Inches(0.28)
    left = Inches(0.5)
    usable = W - Inches(1.0)
    cw = int((usable - gap * (n - 1)) / n)
    for i, (ct, cb) in enumerate(cards):
        x = left + i * (cw + gap)
        round_rect(s, x, Inches(1.5), cw, Inches(5.35), WHITE)
        badge = s.shapes.add_shape(MSO_SHAPE.OVAL, x + Inches(0.28), Inches(1.75), Inches(0.42), Inches(0.42))
        fill(badge, BLUE)
        tb = textbox(s, x + Inches(0.28), Inches(1.78), Inches(0.42), Inches(0.4))
        p = tb.text_frame.paragraphs[0]
        p.alignment = PP_ALIGN.CENTER
        run = p.add_run()
        _set_run(run, str(i + 1), 14, True, WHITE)
        write_box(s, x + Inches(0.25), Inches(2.35), cw - Inches(0.5), Inches(4.2), [(ct, 20, True, NAVY), (cb, 16, False, SLATE)])
    footer(s, page, total)


def build():
    prs = Presentation()
    prs.slide_width = W
    prs.slide_height = H
    total = 26

    title_slide(prs)

    # 2 agenda
    s = blank(prs)
    rect(s, 0, 0, W, H, BG)
    accent_bar(s)
    write_box(s, Inches(0.55), Inches(0.28), Inches(12), Inches(0.35), [("TODAY", 13, True, BLUE)])
    write_box(s, Inches(0.55), Inches(0.58), Inches(12), Inches(0.6), [("Seven blocks.", 30, True, NAVY)])
    rows = [
        ("0–5", "Why this app", "A feature, not ChatGPT"),
        ("5–12", "How an AI API works", "URL, key, request, response"),
        ("12–22", "Prompt engineering", "Role, constraints, JSON contract"),
        ("22–32", "Live code walkthrough", "3 files only"),
        ("32–45", "Live demo", "PDF + JD → score"),
        ("45–52", "Architecture", "Honest: no backend today"),
        ("52–60", "Q&A", "Your questions"),
    ]
    y = Inches(1.4)
    for t, name, why in rows:
        round_rect(s, Inches(0.5), y, Inches(12.3), Inches(0.72), WHITE)
        write_box(s, Inches(0.7), y + Inches(0.14), Inches(1.4), Inches(0.45), [(t, 16, True, BLUE)])
        write_box(s, Inches(2.2), y + Inches(0.14), Inches(4.8), Inches(0.45), [(name, 18, True, NAVY)])
        write_box(s, Inches(7.2), y + Inches(0.14), Inches(5.3), Inches(0.45), [(why, 16, False, SLATE)])
        y += Inches(0.78)
    footer(s, 2, total)

    cards_slide(
        prs,
        "Outcomes",
        "You will leave with 3 skills",
        [
            ("Call a real AI API", "URL + key + JSON body. Same idea as a weather API — the reply is text we force into JSON."),
            ("Write a product prompt", "Role, task, guardrails, and an output contract the UI can render."),
            ("Show it on a phone", "React Native screens that display score, chips, and 3 edits. No fake data."),
        ],
        3,
        total,
    )

    section_slide(prs, "Block 1", "AI in a product is a feature", "0–5 minutes", 4, total)

    content_slide(
        prs,
        "0–5 min  ·  why",
        "ChatGPT in a browser is not a product",
        [
            "• A product is: user gives input  →  your app calls an API  →  user sees a result they can use.",
            "• We are not training a model. We are calling one.",
            "• Weather API returns temperature. Gemini returns text. We force that text to be JSON.",
            "• Today’s feature: does this resume match this job?",
        ],
        5,
        total,
        "Ask the room: what two inputs does this feature need?  Wait for: resume PDF + job description.",
    )

    two_col(
        prs,
        "0–5 min  ·  the app",
        "ResumeFit — a junior recruiter on a phone",
        "On the Home screen",
        [
            "1. Upload resume (PDF, 5 MB)",
            "2. Paste job description",
            "3. Tap Analyze match",
            "",
            "Do not tap Analyze yet.",
            "Curiosity first.",
        ],
        "What comes back",
        [
            "Match score 0–100",
            "Matching skills (green chips)",
            "Missing skills (red chips)",
            "Experience alignment",
            "3 concrete resume edits",
        ],
        6,
        total,
    )

    section_slide(prs, "Block 2", "How an AI API actually works", "5–12 minutes", 7, total)

    content_slide(
        prs,
        "5–12 min  ·  six words",
        "Memorize these six words",
        [
            "• URL — the doorbell. gemini-2.0-flash + generateContent",
            "• Key — a password for the API. Lives in .env. Never commit it.",
            "• Request — JSON body with contents → parts",
            "• Response — candidates[0].content.parts[0].text",
            "• Error — show Google’s real message. Quota, bad key, safety.",
            "• Quota — free APIs are not unlimited. 40 people on one key = 429.",
        ],
        8,
        total,
        "Open only src/api/gemini.ts  →  jump to analyzeResumeMatch.",
    )

    two_col(
        prs,
        "5–12 min  ·  analogy",
        "Think of the API call as a letter",
        "The letter",
        [
            "Address = URL",
            "Stamp / ID = API key",
            "Body = prompt + PDF",
            "Reply = JSON",
        ],
        "The two parts in one message",
        [
            "text = instructions + job description",
            "inline_data = the PDF",
            "   mime_type: application/pdf",
            "   data: <base64>",
            "",
            "Like WhatsApp: caption + document.",
        ],
        9,
        total,
    )

    content_slide(
        prs,
        "5–12 min  ·  flow",
        "What happens when they tap Analyze",
        [
            "1. Phone has a PDF + a job description",
            "2. App converts the PDF to base64 (JSON cannot carry a raw file)",
            "3. POST to Gemini generateContent",
            "4. Gemini reads both and returns JSON",
            "5. Result screen only displays that JSON",
            "",
            "There is no backend in this demo. The phone talks to Google.",
        ],
        10,
        total,
        "Ask: if there is no backend, where does the key live? Why is that OK in class and bad on Play Store?",
    )

    section_slide(prs, "Block 3", "Prompt engineering is the AI skill", "12–22 minutes", 11, total)

    two_col(
        prs,
        "12–22 min  ·  bad vs good",
        "The model is not a resume product. It follows the prompt.",
        "If we wrote…",
        [
            "“Analyze this resume”",
            "   → a paragraph. No score. UI breaks.",
            "",
            "“Give a score”",
            "   → number, no skills.",
            "",
            "“List skills”",
            "   → invents React Native because the JD asked for it.",
        ],
        "Our prompt does 4 jobs",
        [
            "1. Role — you are a recruiter",
            "2. Task — compare resume PDF to this JD",
            "3. Constraints — be honest; don’t invent skills; if not a resume, score 0",
            "4. Output contract — exact JSON keys the Result screen already uses",
        ],
        12,
        total,
    )

    content_slide(
        prs,
        "12–22 min  ·  read it out loud",
        "Every sentence in ANALYSIS_INSTRUCTION earns its place",
        [
            "• “You are a recruiter.” — role. Poet vs recruiter = different tone.",
            "• “Compare this resume PDF to the job description.” — one job, not rewrite my CV.",
            "• “Be honest.” — models like to please; otherwise everything is 90%.",
            "• “If not a resume, matchPercent = 0.” — guardrail.",
            "• “Do not invent skills.” — most important line. JD-only skills go in missingSkills.",
            "• Exact JSON keys + “exactly 3 suggestedEdits.” — the UI is a form.",
        ],
        13,
        total,
        "Ask: if we delete “don’t invent skills,” what do the green chips start showing?",
    )

    content_slide(
        prs,
        "12–22 min  ·  knobs",
        "Temperature and messy JSON",
        [
            "• temperature: 0.2 — 0 is rigid, 1 is creative. Scoring wants boring and repeatable.",
            "• responseMimeType: application/json — we ask for JSON.",
            "• parseModelJson still strips ```json fences. Models cheat. That is defensive engineering.",
            "• We clamp matchPercent to 0–100 so a wild 140 cannot break the bar.",
        ],
        14,
        total,
        "Live 2-min tweak: change “recruiter” to “strict hiring manager.” Same API, different score. That IS prompt engineering.",
    )

    section_slide(prs, "Block 4", "Practical integration — 3 files", "22–32 minutes", 15, total)

    cards_slide(
        prs,
        "22–32 min  ·  stay in three files",
        "Do not rewrite the app. Walk the working path.",
        [
            ("pickResume.ts", "System file picker. PDF only. Cancel returns null — that is not an error. Copy into cache because picker URIs expire."),
            ("gemini.ts", "Key → parts (text + inline_data) → fetch POST → error.message → parseModelJson."),
            ("HomeScreen.tsx", "Four states: resume, jobDescription, error, loading. Validate, then uriToBase64 → analyze → navigate."),
        ],
        16,
        total,
    )

    content_slide(
        prs,
        "22–32 min  ·  HomeScreen",
        "onAnalyze is the whole product recipe",
        [
            "1. Is there a PDF?",
            "2. Is there a job description?",
            "3. Is there a GEMINI_API_KEY?",
            "4. URI → base64",
            "5. POST Gemini",
            "6. Parse JSON",
            "7. Go to Result",
            "",
            "setLoading(true) BEFORE the network. finally { setLoading(false) } even if Gemini throws.",
        ],
        17,
        total,
        "Ask: if you forget finally, what does the user see after an error? A stuck spinner.",
    )

    section_slide(prs, "Block 5", "Live demonstration", "32–45 minutes", 18, total)

    content_slide(
        prs,
        "32–45 min  ·  demo A",
        "Narrate the data, not the animation",
        [
            "1. Tap Upload resume → pick the sample PDF.",
            "2. Tap Use sample or paste a real Naukri / LinkedIn JD.",
            "3. Tap Analyze match. While it spins, say:",
            "      PDF → base64 → leaving the phone → Gemini reads both → JSON → Result.",
            "4. On Result, point in order: score → summary → alignment → matching chips",
            "      → missing chips → 3 concrete edits.",
            "5. Challenge the room: is that matching skill actually on the PDF?",
        ],
        19,
        total,
        "The UI is dumb on purpose. It displays JSON. Wrong score → fix the prompt, not the stylesheet.",
    )

    two_col(
        prs,
        "32–45 min  ·  if it breaks",
        "Teach from the red banner. Do not skip failures.",
        "You see",
        [
            "Missing GEMINI_API_KEY",
            "API key not valid",
            "Quota / 429",
            "Could not parse JSON",
            "matchPercent = 0 on an invoice PDF",
        ],
        "You say",
        [
            "Key not in .env, or Metro not restarted.",
            "Wrong key, extra quotes, extra space.",
            "Free tier. Too many requests. Wait or new key.",
            "Model ignored the schema. Rare with our prompt.",
            "That guardrail sentence just saved a fake 80%.",
        ],
        20,
        total,
    )

    section_slide(prs, "Block 6", "Architecture — be honest", "45–52 minutes", 21, total)

    two_col(
        prs,
        "45–52 min  ·  layers",
        "What you actually built",
        "This classroom demo",
        [
            "Frontend: React Native screens + picker",
            "AI: Gemini generateContent",
            "Backend: none",
            "Database: none",
            "Key: inside the app (.env)",
        ],
        "If you shipped this",
        [
            "Same UI",
            "Same Gemini call",
            "A tiny server holds the key",
            "Phone calls YOUR server",
            "Server calls Gemini",
            "Key never sits in the APK",
        ],
        22,
        total,
    )

    content_slide(
        prs,
        "45–52 min  ·  recap",
        "Count on your fingers",
        [
            "1. Call a real AI API  —  fetch + key + JSON.",
            "2. Prompt engineering  —  role, constraints, output contract.",
            "3. Render structured output  —  score, chips, numbered edits.",
            "",
            "“Frontend → backend → AI” is the production version.",
            "Today you learned the middle so you could see a full feature.",
        ],
        23,
        total,
        "Ask: where would you put the API key if this went to the Play Store?",
    )

    section_slide(prs, "Block 7", "Questions", "52–60 minutes", 24, total)

    content_slide(
        prs,
        "52–60 min  ·  if the room is quiet",
        "Seed questions",
        [
            "• Why PDF, not Word?  —  one path; Gemini document understanding is built around PDF.",
            "• Why base64, not Drive?  —  Drive needs login. Base64 = one POST.",
            "• Shared key for 40 students?  —  quota dies. Each person uses their own free key.",
            "• Is the score “true”?  —  no. Model opinion under our prompt. Temperature 0.2 keeps it stable.",
            "• Match 3 jobs?  —  loop analyzeResumeMatch three times.",
            "• Scanned photo resume?  —  often yes. Prefer a real text PDF for the demo.",
        ],
        25,
        total,
    )

    s = blank(prs)
    rect(s, 0, 0, W, H, NAVY)
    rect(s, 0, 0, Inches(0.18), H, BLUE)
    if LOGO.exists():
        s.shapes.add_picture(str(LOGO), Inches(0.75), Inches(1.3), Inches(0.95), Inches(0.95))
    write_box(
        s,
        Inches(0.75),
        Inches(2.5),
        Inches(12),
        Inches(4.2),
        [
            ("Tonight", 16, True, RGBColor(0x93, 0xC5, 0xFD)),
            ("Clone. Paste your key. Change one prompt line.", 32, True, WHITE),
            ("aistudio.google.com/apikey", 22, False, RGBColor(0x93, 0xC5, 0xFD)),
            ("npm start    then    npm run android   /   npm run ios", 18, False, RGBColor(0xCB, 0xD5, 0xE1)),
            ("Watch the score move. That is the whole loop.", 18, False, RGBColor(0x94, 0xA3, 0xB8)),
        ],
    )
    footer(s, 26, total)

    prs.save(OUT)
    print(OUT)


if __name__ == "__main__":
    build()
