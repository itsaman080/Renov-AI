// Material catalog with types, properties, and default rates

export const MATERIAL_CATALOG = {
  paint: {
    id: "paint",
    name: "Exterior Wall Paint",
    category: "Paint & Finish",
    icon: "🎨",
    applicableTo: ["wall", "parapet", "trim"],
    unit: "litres",
    coveragePerUnit: 120, // sqft per litre (2 coats)
    wastagePercent: 10,
    defaultRate: 35, // INR per sqft (material + labor)
    laborRate: 12,
    description: "Premium weather-proof exterior emulsion paint",
    finishes: ["Flat/Matte", "Satin", "Semi-Gloss"],
    colors: ["White", "Cream", "Off-White", "Light Grey", "Warm Beige", "Pale Yellow", "Sky Blue", "Sage Green", "Terracotta", "Custom"],
    maintenance: "Repaint every 5-7 years. Clean with mild soap.",
    durability: "5-7 years"
  },
  texture_paint: {
    id: "texture_paint",
    name: "Texture Paint / Finish",
    category: "Paint & Finish",
    icon: "🏔️",
    applicableTo: ["wall", "parapet"],
    unit: "kg",
    coveragePerUnit: 40, // sqft per kg
    wastagePercent: 15,
    defaultRate: 55,
    laborRate: 20,
    description: "Decorative textured coating for visual appeal",
    finishes: ["Sand Texture", "Bark Texture", "Pebble Dash", "Smooth Texture", "Lace Texture"],
    colors: ["Cream", "Off-White", "Warm Beige", "Stone Grey", "Earthy Brown", "Antique White"],
    maintenance: "Wipe with damp cloth. Repaint every 7-10 years.",
    durability: "7-10 years"
  },
  stone_cladding: {
    id: "stone_cladding",
    name: "Natural Stone Cladding",
    category: "Cladding",
    icon: "🪨",
    applicableTo: ["wall", "pillar", "parapet"],
    unit: "sqft",
    coveragePerUnit: 1,
    wastagePercent: 10,
    defaultRate: 200,
    laborRate: 70,
    description: "Natural stone panels for premium look",
    finishes: ["Sandstone", "Slate", "Granite", "Limestone", "Quartzite"],
    colors: ["Beige/Tan", "Grey", "Brown", "Black", "Multi-color", "Off-White"],
    maintenance: "Seal annually. Low maintenance.",
    durability: "20+ years"
  },
  ceramic_tiles: {
    id: "ceramic_tiles",
    name: "Ceramic / Vitrified Tiles",
    category: "Cladding",
    icon: "⬜",
    applicableTo: ["wall", "balcony", "parapet"],
    unit: "sqft",
    coveragePerUnit: 1,
    wastagePercent: 10,
    defaultRate: 100,
    laborRate: 40,
    description: "Durable ceramic or vitrified tiles for exterior",
    finishes: ["Matt", "Glossy", "Anti-Slip", "Wood-Look", "Marble-Look"],
    colors: ["White", "Off-White", "Grey", "Beige", "Charcoal", "Ivory"],
    maintenance: "Easy to clean. Grout sealing every 2 years.",
    durability: "15-20 years"
  },
  glass_railing: {
    id: "glass_railing",
    name: "Toughened Glass Railing",
    category: "Railing",
    icon: "🔷",
    applicableTo: ["balcony", "railing"],
    unit: "running_feet",
    coveragePerUnit: 1,
    wastagePercent: 5,
    defaultRate: 1000,
    laborRate: 200,
    description: "12mm toughened glass with SS fittings",
    finishes: ["Clear Glass", "Frosted Glass", "Tinted Glass"],
    colors: ["Clear", "Blue Tint", "Grey Tint", "Bronze Tint"],
    maintenance: "Clean with glass cleaner. Very low maintenance.",
    durability: "15+ years"
  },
  ss_railing: {
    id: "ss_railing",
    name: "Stainless Steel Railing",
    category: "Railing",
    icon: "🔩",
    applicableTo: ["balcony", "railing", "gate"],
    unit: "running_feet",
    coveragePerUnit: 1,
    wastagePercent: 5,
    defaultRate: 550,
    laborRate: 150,
    description: "SS 304 grade railing with vertical balusters",
    finishes: ["Mirror Polish", "Satin/Brushed", "Powder Coated"],
    colors: ["Silver", "Black", "Bronze", "Champagne Gold"],
    maintenance: "Wipe with dry cloth. Polish annually.",
    durability: "20+ years"
  },
  wood_panels: {
    id: "wood_panels",
    name: "WPC / Wood Panels",
    category: "Cladding",
    icon: "🪵",
    applicableTo: ["wall", "gate", "trim"],
    unit: "sqft",
    coveragePerUnit: 1,
    wastagePercent: 12,
    defaultRate: 280,
    laborRate: 80,
    description: "Wood-polymer composite panels (weather resistant)",
    finishes: ["Smooth", "Wood Grain Texture", "Brushed"],
    colors: ["Teak", "Walnut", "Oak", "Wenge", "Cedar"],
    maintenance: "Clean with mild soap. UV resistant.",
    durability: "10-15 years"
  },
  grc_jali: {
    id: "grc_jali",
    name: "GRC Jali / Perforated Panel",
    category: "Decorative",
    icon: "🔲",
    applicableTo: ["parapet", "trim", "gate"],
    unit: "sqft",
    coveragePerUnit: 1,
    wastagePercent: 8,
    defaultRate: 180,
    laborRate: 50,
    description: "Glass Reinforced Concrete decorative panels",
    finishes: ["Custom Jali Pattern", "Geometric", "Floral"],
    colors: ["White", "Off-White", "Grey", "Beige"],
    maintenance: "Paint every 5 years.",
    durability: "15-20 years"
  }
};

export const MATERIAL_CATEGORIES = [
  { id: "all", label: "All Materials" },
  { id: "Paint & Finish", label: "Paint & Finish" },
  { id: "Cladding", label: "Cladding" },
  { id: "Railing", label: "Railing" },
  { id: "Decorative", label: "Decorative" }
];

export const ZONE_COLORS = {
  wall: "#3B82F6",
  window: "#8B5CF6",
  door: "#6B7280",
  balcony: "#10B981",
  pillar: "#F59E0B",
  roof: "#EF4444",
  gate: "#84CC16",
  parapet: "#F97316",
  railing: "#06B6D4",
  trim: "#EC4899"
};

// Calculate quantities from area data
export function calculateQuantity(material, areaSqft) {
  const mat = MATERIAL_CATALOG[material];
  if (!mat) return null;

  const baseQuantity = areaSqft / mat.coveragePerUnit;
  const wastageAmount = baseQuantity * (mat.wastagePercent / 100);
  const totalQuantity = baseQuantity + wastageAmount;

  return {
    baseQuantity: Math.round(baseQuantity * 10) / 10,
    wastageAmount: Math.round(wastageAmount * 10) / 10,
    totalQuantity: Math.round(totalQuantity * 10) / 10,
    unit: mat.unit,
    wastagePercent: mat.wastagePercent
  };
}

// Format currency
export function formatINR(amount) {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}
