require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const Groq = require("groq-sdk");
const sharp = require("sharp");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: [
    "https://renov-ai-beta.vercel.app",
    "http://localhost:3000"
  ]
}));
app.use(express.json({ limit: "50mb" }));

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── Helper: Resize image to stay under Groq base64 limit (4MB) ──────────
async function prepareImageBase64(buffer, mimeType) {
  try {
    const resized = await sharp(buffer)
      .resize({ width: 1024, withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();
    return { base64: resized.toString("base64"), mimeType: "image/jpeg" };
  } catch (e) {
    return { base64: buffer.toString("base64"), mimeType };
  }
}

// Helper: safely extract JSON from AI response text
function extractJSON(text) {
  const clean = text.replace(/```json|```/gi, "").trim();
  const match = clean.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON found in AI response");
  return JSON.parse(match[0]);
}

// ─── ROUTE 1: Analyze house image → detect zones ──────────────────────────
app.post("/api/analyze-house", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "Image file is required." });
    }
    const { base64, mimeType } = await prepareImageBase64(req.file.buffer, req.file.mimetype);

    const prompt = `You are an expert architectural image analyzer. Analyze this exterior house image carefully.

Respond ONLY with a valid JSON object. No markdown, no explanation, no extra text. Just raw JSON.

{
  "building_description": "1-2 sentence description of the building",
  "building_type": "independent_house or bungalow or apartment or villa",
  "estimated_stories": 1,
  "zones": [
    {
      "id": "zone_1",
      "name": "Main Front Wall",
      "type": "wall",
      "description": "large plastered front facade",
      "estimated_area_sqft": 320,
      "position": "center",
      "suggested_materials": ["paint", "texture_paint", "stone_cladding"]
    }
  ],
  "total_estimated_area_sqft": 650,
  "renovation_notes": "any important notes about renovation"
}

Zone types allowed: wall, window, door, balcony, pillar, roof, gate, parapet, railing, trim

Identify ALL visible zones: main walls, side walls visible, all windows (count them), doors, balconies, pillars, roof edges, parapet walls, gate areas, compound walls.

For area estimates assume a typical single-story house facade = 400-800 sqft total.
- Standard door = 20 sqft
- Standard window = 12 sqft  
- Balcony railing = estimate running feet
Be realistic and specific.`;

    const response = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      max_completion_tokens: 2000,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64}` } },
            { type: "text", text: prompt }
          ]
        }
      ]
    });

    const text = response.choices[0].message.content.trim();
    const analysisData = extractJSON(text);

    res.json({ success: true, analysis: analysisData });
  } catch (error) {
    console.error("Analysis error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── ROUTE 2: Generate redesign + material quantities ─────────────────────
app.post("/api/generate-redesign", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "Image file is required." });
    }
    const { base64, mimeType } = await prepareImageBase64(req.file.buffer, req.file.mimetype);
    const { materialSelections, zones } = JSON.parse(req.body.data);

    const materialSummary = materialSelections
      .map((s) => `- Zone "${s.zoneName}" (type: ${s.zoneType}, area: ${s.areasqft} sqft): Apply ${s.materialName} in "${s.colorFinish}" color, "${s.finish}" finish`)
      .join("\n");

    const prompt = `You are an expert architectural designer and renovation specialist.

Looking at this house image, the user wants these materials applied:
${materialSummary}

Respond ONLY with valid JSON. No markdown, no explanation, just raw JSON.

{
  "redesign_description": "vivid 3-4 sentence description of how the house will look after renovation",
  "color_palette": ["#C4813A", "#F5F0E8", "#4A4A4A"],
  "style_theme": "modern",
  "material_quantities": [
    {
      "zone_id": "zone_1",
      "zone_name": "Main Front Wall",
      "material": "Exterior Wall Paint",
      "area_sqft": 320,
      "quantity": 2.7,
      "unit": "litres",
      "wastage_percent": 10,
      "quantity_with_wastage": 3.0
    }
  ],
  "design_tips": ["tip1", "tip2", "tip3"],
  "maintenance_notes": "maintenance advice for selected materials"
}

Quantity calculation rules:
- Paint: 1 litre covers 120 sqft (2 coats), add 10% wastage
- Texture paint: 1 kg covers 40 sqft, add 15% wastage
- Stone cladding: area in sqft directly, add 10% wastage
- Ceramic tiles: area in sqft, add 10% wastage
- Glass railing: running feet, add 5% wastage
- SS/Metal railing: running feet, add 5% wastage
- Wood/WPC panels: area in sqft, add 12% wastage
- GRC Jali: area in sqft, add 8% wastage

Use actual hex color codes in color_palette array.`;

    const response = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      max_completion_tokens: 3000,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64}` } },
            { type: "text", text: prompt }
          ]
        }
      ]
    });

    const text = response.choices[0].message.content.trim();
    const redesignData = extractJSON(text);

    res.json({ success: true, redesign: redesignData });
  } catch (error) {
    console.error("Redesign error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── ROUTE 3: Generate cost report (text only, no image) ──────────────────
app.post("/api/generate-cost-report", async (req, res) => {
  try {
    const { materialQuantities, customRates, projectDetails } = req.body;

    const prompt = `You are a construction cost estimation expert in India (2024 market rates).

Material quantities to cost:
${JSON.stringify(materialQuantities, null, 2)}

User custom rates (use these if provided, else use standard rates):
${JSON.stringify(customRates, null, 2)}

Project info:
${JSON.stringify(projectDetails, null, 2)}

Respond ONLY with valid JSON. No markdown, no explanation, just raw JSON.

{
  "cost_items": [
    {
      "zone_name": "Main Front Wall",
      "material": "Exterior Wall Paint",
      "quantity": 3.0,
      "unit": "litres",
      "rate_per_unit": 420,
      "material_cost": 1260,
      "labor_cost": 3840,
      "total_cost": 5100,
      "currency": "INR"
    }
  ],
  "summary": {
    "total_material_cost": 0,
    "total_labor_cost": 0,
    "subtotal": 0,
    "contingency_percent": 10,
    "contingency_amount": 0,
    "grand_total": 0,
    "currency": "INR"
  },
  "cost_notes": "notes about the estimate",
  "validity": "This estimate is valid for 30 days subject to market rate changes"
}

Indian market rates 2024 (use if no custom rate given):
- Exterior wall paint: ₹380-450/litre material + ₹12/sqft labor
- Texture paint: ₹180-220/kg material + ₹20/sqft labor
- Stone cladding: ₹130-180/sqft material + ₹70/sqft labor
- Ceramic/vitrified tiles: ₹60-90/sqft material + ₹40/sqft labor
- Glass railing (12mm): ₹800-950/running ft material + ₹200/ft labor
- SS railing: ₹380-480/running ft material + ₹150/ft labor
- WPC wood panels: ₹200-260/sqft material + ₹80/sqft labor
- GRC jali panels: ₹130-160/sqft material + ₹50/sqft labor

Calculate summary totals correctly. Grand total = subtotal + contingency.`;

    const response = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      max_completion_tokens: 2500,
      response_format: { type: "json_object" },
      messages: [
        { role: "user", content: prompt }
      ]
    });

    const text = response.choices[0].message.content.trim();
    const costData = extractJSON(text);

    res.json({ success: true, costReport: costData });
  } catch (error) {
    console.error("Cost report error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── ROUTE: Health check ──────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "RenovAI server running with Groq Llama 4 Scout Vision" });
});

app.listen(PORT, () => {
  console.log(`\n🏠 RenovAI Server running on http://localhost:${PORT}`);
  console.log(`🤖 AI Provider: Groq — Llama 4 Scout Vision`);
  console.log(`📡 API endpoints ready\n`);
});
