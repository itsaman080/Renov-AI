# RenovAI — AI Exterior Renovation & Cost Estimator

RenovAI is a full‑stack web app that lets homeowners upload an exterior photo, apply renovation materials, and receive quantity + cost estimates with a downloadable report.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 |
| Backend | Node.js + Express |
| LLM | Groq — Llama 4 Scout Vision |
| Styling | Plain CSS (design tokens) |
| PDF | jsPDF + html2canvas |

## Project Structure

```
Renov_AI/
├── server/
│   └── index.js              # Express API (Groq Vision + cost)
├── client/
│   ├── public/
│   └── src/
│       ├── components/       # UI steps
│       ├── styles/           # globals.css
│       └── utils/            # aiService, costEngine, projectStorage
├── sample-input/             # sample image
├── .env.example
├── package.json
└── README.md
```

## Quick Start

### 1) Get a free Groq API key
Sign up at https://console.groq.com/keys and create a key.

### 2) Install dependencies

```
npm run install:all
```

### 3) Configure environment

```
cp .env.example .env
```

```
GROQ_API_KEY=your_groq_key_here
PORT=3001
```

### 4) Run the app

```
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Core Features

- Upload exterior photo with quality checks
- AI zone detection + editable areas
- Material selection per zone (color + finish)
- AI redesign description + quantity estimates
- Cost estimation with editable rates + contingency
- PDF report download
- Auto‑save and resume projects

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | /api/analyze-house | Detect zones and estimate areas |
| POST | /api/generate-redesign | Redesign description + quantities |
| POST | /api/generate-cost-report | Itemized cost breakdown |
| GET | /api/health | Health check |


## How It Works (Simple Flow)

1. User uploads a photo → quality check runs
2. Frontend calls `/api/analyze-house`
3. User edits zones and selects materials
4. Frontend calls `/api/generate-redesign`
5. Frontend calls `/api/generate-cost-report`
6. Report is rendered and downloadable as PDF

## Environment Variables

Create `.env` from `.env.example`:

- `GROQ_API_KEY` — required
- `PORT` — backend port (default 3001)

## Image Limits (Groq)

- Base64 image input must be ≤ 4MB
- Server auto‑resizes images to reduce size

## Troubleshooting

- 400 image error: check file type/size or quality
- 413 image too large: try a smaller image
- 401/403: invalid Groq API key

## License

MIT

| | |
|---|---|
| **Input** | User clicks zones + picks from catalog |
| **Output** | Map of zone → { material, color, finish } |

Available materials:

| # | Material | Category | Best For |
|---|---|---|---|
| 1 | Exterior Wall Paint | Paint & Finish | wall, parapet, trim |
| 2 | Texture Paint | Paint & Finish | wall, parapet |
| 3 | Natural Stone Cladding | Cladding | wall, pillar, parapet |
| 4 | Ceramic / Vitrified Tiles | Cladding | wall, balcony, parapet |
| 5 | Toughened Glass Railing | Railing | balcony, railing |
| 6 | Stainless Steel Railing | Railing | balcony, railing, gate |
| 7 | WPC / Wood Panels | Cladding | wall, gate, trim |
| 8 | GRC Jali / Perforated Panel | Decorative | parapet, trim, gate |

---

### STEP 4 — Redesign + Quantities

| | |
|---|---|
| **Input** | Photo + material selections sent to Groq |
| **AI Call** | `POST /api/generate-redesign` |
| **Output** | Design description, color palette, style theme, material quantity table |

Quantity calculation:
```
Base Qty  = Area ÷ Coverage per unit
Wastage   = Base Qty × Wastage %
Final Qty = Base Qty + Wastage
```

| Material | Coverage Rate | Wastage |
|---|---|---|
| Exterior Paint | 120 sqft/litre (2 coats) | 10% |
| Texture Paint | 40 sqft/kg | 15% |
| Stone Cladding | 1 sqft/sqft | 10% |
| Tiles | 1 sqft/sqft | 10% |
| Glass Railing | 1 running ft | 5% |
| SS Railing | 1 running ft | 5% |
| WPC Panels | 1 sqft/sqft | 12% |
| GRC Jali | 1 sqft/sqft | 8% |

---

### STEP 5 — Cost Estimation

| | |
|---|---|
| **Input** | Material quantities + optional custom rates |
| **AI Call** | `POST /api/generate-cost-report` |
| **Output** | Itemized cost table (material + labor per zone) + grand total in INR |

Cost formula:
```
Material Cost = Quantity × Material Rate per Unit
Labour Cost   = Area × Labour Rate per sqft
Item Total    = Material Cost + Labour Cost
Subtotal      = Σ all item totals
Contingency   = Subtotal × 10%
Grand Total   = Subtotal + Contingency
```

Indian market rates (2024) used:
| Material | Rate |
|---|---|
| Exterior Paint | ₹380–450/litre + ₹12/sqft labor |
| Texture Paint | ₹180–220/kg + ₹20/sqft labor |
| Stone Cladding | ₹130–180/sqft + ₹70/sqft labor |
| Tiles | ₹60–90/sqft + ₹40/sqft labor |
| Glass Railing | ₹800–950/ft + ₹200/ft labor |
| SS Railing | ₹380–480/ft + ₹150/ft labor |
| WPC Panels | ₹200–260/sqft + ₹80/sqft labor |
| GRC Jali | ₹130–160/sqft + ₹50/sqft labor |

---

### STEP 6 — PDF Report

| | |
|---|---|
| **Input** | All collected data from Steps 1–5 |
| **Output** | Downloadable PDF report |

Report contains:
- Project header with date and reference number
- Original house photograph
- Renovation summary (type, style, total zones, total cost)
- AI design vision paragraph
- Material selections table (zone, material, color, finish, area)
- Itemized cost table (qty, rate, material cost, labor, total)
- Cost summary with grand total
- Legal disclaimer

---

## 📸 What Kind of Image to Upload

### ✅ Good Input Images

```
IDEAL SHOT:

     ┌─────────────────────────────────────┐
     │           [CLEAR SKY]               │
     │   ┌─────────────────────────────┐   │
     │   │  ROOF VISIBLE TOP TO BOTTOM │   │
     │   │   ┌────┐   ┌────┐           │   │
     │   │   │WIN │   │WIN │  BALCONY  │   │
     │   │   └────┘   └────┘           │   │
     │   │        MAIN WALL            │   │
     │   │   ┌────┐   ┌──────────┐    │   │
     │   │   │WIN │   │  DOOR    │    │   │
     │   │   └────┘   └──────────┘    │   │
     │   └─────────────────────────────┘   │
     │       GROUND / DRIVEWAY             │
     └─────────────────────────────────────┘

```

| Criteria | Requirement |
|---|---|
| **Angle** | Straight front-facing, not at a steep angle |
| **Time** | Daytime — natural daylight, no artificial lighting only |
| **Coverage** | Full house top to bottom, left to right |
| **Distance** | House takes up 60–80% of the frame |
| **Clarity** | Sharp, not blurry — phone camera is fine |
| **Format** | JPG, PNG, or WebP |
| **Min size** | ~300×200 pixels minimum |

### ❌ What to Avoid

| Problem | Why |
|---|---|
| Night photo | AI cannot distinguish zones, quality check rejects or warns |
| Angled/side shot | Cannot estimate front wall areas correctly |
| Cropped (roof/ground cut off) | Missing zones |
| Blurry photo | Low variance score → quality warning or rejection |
| Trees/cars blocking house | Zones cannot be identified |
| Interior photo | Wrong use case entirely |

### Where to Find a Good Test Image
- Take a photo of any house from the street
- Google Street View screenshot of a residential address
- A real estate listing photo (front exterior)
- The provided `sample-input/sample_house.jpg` in this project

---

## 📁 Project File Structure

```
renovai/
│
├── server/
│   └── index.js                  ← Express server + 3 Groq API routes
│
├── client/
│   ├── public/
│   │   └── index.html            ← HTML shell + Google Fonts
│   └── src/
│       ├── App.jsx               ← 6-step wizard + project save/load
│       ├── index.js              ← React entry point
│       │
│       ├── styles/
│       │   └── globals.css       ← Full design system (CSS variables)
│       │
│       ├── components/
│       │   ├── UploadStep.jsx         ← Step 1: Upload + image quality check
│       │   ├── ZoneMapper.jsx         ← Step 2: AI zone detection + edit/add/delete
│       │   ├── MaterialSelector.jsx   ← Step 3: Material catalog + zone filter
│       │   ├── Visualization.jsx      ← Step 4: Redesign + quantity table
│       │   ├── CostEstimator.jsx      ← Step 5: Cost breakdown + rate editor
│       │   └── ReportView.jsx         ← Step 6: Final report + PDF download
│       │
│       └── utils/
│           ├── aiService.js           ← All fetch() calls to backend
│           ├── costEngine.js          ← Material catalog + quantity formulas
│           └── projectStorage.js      ← localStorage save/load/resume
│
├── sample-input/
│   └── sample_house.jpg          ← Sample image for testing
│
├── .env.example                  ← Copy to .env → add API key
├── .gitignore
├── package.json                  ← Root deps + dev scripts
└── README.md                     ← This file
```

---

## ⚙️ Setup & Installation

### Prerequisites
- **Node.js 18+** — https://nodejs.org
- **Groq API key** — see section below

### Install

```bash
# 1. Enter project folder
cd renovai

# 2. Install all dependencies (server + React client)
npm run install:all

# 3. Create environment file
cp .env.example .env
```

Open `.env` and add your key:
```
GROQ_API_KEY=your_groq_key_here
PORT=3001
```

### Run

```bash
npm run dev
```

Opens:
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:3001

---

## 🔑 How to Get Groq API Key

1. Go to **https://console.groq.com/keys**
2. Sign in with Google/GitHub
3. Click **"Create API Key"**
4. Copy the key
5. Paste it in `.env` file as `GROQ_API_KEY=...`

---

## 📐 How the Estimation Works

### 1. Area Estimation (AI Vision)
Groq Llama 4 Scout Vision analyzes the uploaded photo and estimates each zone's area based on:
- Visible proportions of structural elements
- Standard reference sizes (door ≈ 20 sqft, window ≈ 12 sqft)
- Typical residential building dimensions
- Users can override any estimate with exact measurements

### 2. Material Quantity Formula
```
Base Quantity = Area (sqft) ÷ Coverage per Unit
Wastage       = Base Quantity × Wastage %
Final Qty     = Base Quantity + Wastage
```

### 3. Cost Formula
```
Material Cost = Final Qty × Material Rate per Unit
Labour Cost   = Area (sqft) × Labour Rate per sqft
Item Total    = Material Cost + Labour Cost
Grand Total   = Σ Items + 10% Contingency
```

---

## 🎓 How to Evaluate / Demo for Assignment

### Demo Checklist (run through these during evaluation)

**1. Image Upload & Quality Check**
- Upload `sample-input/sample_house.jpg` → should score 70+ and proceed
- Try uploading a very dark/blurry image → should show warning or rejection
- Try uploading a PDF or .txt file → should show type error

**2. Zone Detection**
- After upload, click "Analyze House Structure"
- Verify zones are shown: walls, windows, door, balcony, etc.
- Click edit (pencil icon) on any zone → change its name, type, area → save
- Click "Add Zone Manually" → add a new custom zone
- Delete a zone using the trash icon

**3. Material Selection**
- Click a wall zone → verify paint/texture/stone/tiles are shown as compatible
- Click a balcony zone → verify glass railing / SS railing appear
- Toggle "Compatible only" OFF → verify all 8 materials appear
- Select a material, change its color and finish

**4. Redesign**
- Click "Generate Redesign" — wait ~10 seconds
- Verify design description appears
- Verify color palette is shown
- Verify material quantities table is populated with correct units

**5. Cost Estimation**
- Verify 4 summary cards show INR amounts
- Verify itemized table has material + labor + total per row
- Click "Edit Rates" → change a rate → click "Recalculate" → verify totals update

**6. Report & PDF**
- Click "View & Download Full Report"
- Verify report shows: image, design vision, materials table, cost table
- Click "Download PDF" → verify PDF is downloaded
- Open PDF → verify it has all sections

**7. Save & Resume**
- After Step 3, close and reopen browser
- Click "📁 Projects" in header → verify your project is saved
- Click the project → verify it resumes from where you left off
- Rename project using the text input in the header

### What the AI Does vs What the Code Does

| Task | Done by AI (Groq) | Done by Code |
|---|---|---|
| Identify zones from photo | ✅ | — |
| Estimate zone areas | ✅ | — |
| Generate redesign description | ✅ | — |
| Calculate material quantities | ✅ (prompted with formulas) | Also in `costEngine.js` |
| Calculate costs | ✅ (prompted with rates) | Validated in frontend |
| Image quality check | — | ✅ Canvas pixel analysis |
| Zone editing/adding/deleting | — | ✅ React state management |
| Material filtering by zone type | — | ✅ `applicableTo` matching |
| Rate editing + recalculate | — | ✅ Re-calls AI with new rates |
| PDF generation | — | ✅ html2canvas + jsPDF |
| Project save/resume | — | ✅ localStorage |

---

## ⚠️ Known Limitations

| Limitation | Details |
|---|---|
| No true AI image generation | "After" view is original photo + color overlay + AI text description. Realistic photorealistic rendering requires Stable Diffusion or DALL-E (paid). This is noted as a prototype limitation. |
| Area estimates are approximate | AI estimates from photo proportions, not actual measurements. For accurate cost, user should measure and override. |
| Single view at a time | Only one facade photo at a time. For side + rear walls, upload and run separately. |
| Cost estimates are advisory | Real quotes from contractors will vary. This is a planning tool. |
| localStorage only | Projects saved in browser. Clearing browser data deletes projects. No cloud sync. |
| Image size limits | Groq vision accepts base64 images up to 4MB. The server auto-resizes to fit, but very large images may still fail. |
| Needs good internet | All AI calls go to Groq's API. Offline mode not available. |

---

*RenovAI — Pre-construction exterior renovation planning assistant.*
*Estimates are advisory only and not legally binding.*
