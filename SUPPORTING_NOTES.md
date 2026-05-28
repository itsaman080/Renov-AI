# Supporting Notes — RenovAI

## Purpose
RenovAI is a pre‑construction planning assistant for exterior house renovation. It helps homeowners visualize material choices, estimate quantities, and obtain a transparent cost breakdown before contacting contractors.

## What This Prototype Demonstrates
- Image upload with quality checks (resolution, brightness, blur proxy).
- AI‑assisted zone detection (walls, windows, balconies, pillars, parapet, gate).
- Per‑zone material selection with finishes and color palettes.
- AI‑generated redesign description and material quantities with wastage.
- Detailed cost estimate with editable rates and contingency.
- Downloadable PDF report suitable for contractor discussion.
- Local project save/resume via browser storage.

## System Architecture (High‑Level)
- **Frontend:** React SPA with a 6‑step wizard.
- **Backend:** Node.js + Express API.
- **AI Provider:** Groq Vision model (`meta-llama/llama-4-scout-17b-16e-instruct`).
- **PDF:** jsPDF + html2canvas.

## Data Flow
1. Upload image → `/api/analyze-house`
2. Review/adjust zones → select materials
3. Generate redesign + quantities → `/api/generate-redesign`
4. Generate cost report → `/api/generate-cost-report`
5. Render and download PDF report

## Estimation Logic (Summary)
- **Area estimation:** AI visual estimation, editable by user.
- **Quantity:** based on coverage rules + wastage.
- **Cost:** per‑unit material rates + labor rates, plus 10% contingency.

## Known Limitations
- No photorealistic re‑rendering; redesign is text + color overlay.
- Area estimates are approximate and should be verified on site.
- Single‑facade analysis per image.
- Projects are stored in browser localStorage only.
- Vision input limited by Groq base64 image size; server auto‑resizes to reduce failures.

## How to Demo (Quick Steps)
1. Upload sample image from `sample-input/sample_house.jpg`.
2. Confirm/adjust zones.
3. Select materials and finishes.
4. Generate redesign, then cost report.
5. Download PDF report.

## Environment Variables
- `GROQ_API_KEY`: Groq API key for vision model access.
- `PORT`: Backend server port (default 3001).
