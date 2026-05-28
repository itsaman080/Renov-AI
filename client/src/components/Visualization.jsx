import React, { useState, useEffect } from "react";
import { Sparkles, RotateCcw, ChevronRight, Eye, EyeOff } from "lucide-react";
import { generateRedesign } from "../utils/aiService";
import { MATERIAL_CATALOG } from "../utils/costEngine";

export default function Visualization({ imageFile, imagePreview, zones, materialSelections, onVisualizationDone }) {
  const [loading, setLoading] = useState(true);
  const [redesign, setRedesign] = useState(null);
  const [error, setError] = useState("");
  const [showOriginal, setShowOriginal] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("Generating your renovation design...");

  const LOADING_MSGS = [
    "Generating your renovation design...",
    "Applying selected materials...",
    "Calculating material quantities...",
    "Creating your renovation vision...",
    "Almost ready..."
  ];

  useEffect(() => {
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % LOADING_MSGS.length;
      setLoadingMsg(LOADING_MSGS[idx]);
    }, 2000);

    generateRedesign(imageFile, materialSelections, zones)
      .then((result) => {
        clearInterval(interval);
        setRedesign(result);
        setLoading(false);
      })
      .catch((err) => {
        clearInterval(interval);
        setError(err.message);
        setLoading(false);
      });

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "80px 24px", textAlign: "center"
      }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>✨</div>
        <h3 style={{ fontSize: 24, marginBottom: 8 }}>Creating Your Renovation Vision</h3>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 32 }}>{loadingMsg}</p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", maxWidth: 400 }}>
          {materialSelections.slice(0, 4).map((sel, i) => (
            <div key={i} style={{
              padding: "8px 14px",
              background: "var(--brand-pale)",
              border: "1px solid var(--brand-light)",
              borderRadius: 20, fontSize: 12,
              color: "var(--text-secondary)"
            }}>
              {MATERIAL_CATALOG[sel.materialId]?.icon} {sel.materialName}
            </div>
          ))}
        </div>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
        <div style={{ marginTop: 32, display: "flex", gap: 8, animation: "pulse 1.5s infinite" }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "var(--brand)",
              animationDelay: `${i * 0.2}s`
            }} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: 48 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h3 style={{ marginBottom: 8 }}>Generation Failed</h3>
        <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>{error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          <RotateCcw size={16} /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="fade-up">
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <h2 style={{ fontSize: 28, marginBottom: 8 }}>Your Renovation Design</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
          AI-generated renovation concept based on your material selections
        </p>
      </div>

      {/* Image comparison */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase" }}>
            Original
          </div>
          <div className="card" style={{ overflow: "hidden" }}>
            <img
              src={imagePreview}
              alt="Original house"
              style={{ width: "100%", objectFit: "cover", display: "block", maxHeight: 280 }}
            />
          </div>
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--brand)", marginBottom: 8, textTransform: "uppercase" }}>
            After Renovation (AI Vision)
          </div>
          <div className="card" style={{ overflow: "hidden", position: "relative" }}>
            {/* Redesign visualization overlay */}
            <div style={{ position: "relative" }}>
              <img
                src={imagePreview}
                alt="Redesigned house"
                style={{
                  width: "100%", objectFit: "cover", display: "block", maxHeight: 280,
                  filter: "brightness(1.05) saturate(1.2)"
                }}
              />
              {/* Color overlay to simulate new look */}
              <div style={{
                position: "absolute", inset: 0,
                background: `linear-gradient(135deg, ${
                  redesign?.color_palette?.[0] ? `${redesign.color_palette[0]}18` : "rgba(196,129,58,0.1)"
                }, transparent)`,
                pointerEvents: "none"
              }} />
            </div>
            <div style={{
              position: "absolute", top: 8, right: 8,
              background: "rgba(0,0,0,0.7)",
              color: "white", fontSize: 11, padding: "4px 10px",
              borderRadius: 20
            }}>
              ✨ AI Concept
            </div>
          </div>
        </div>
      </div>

      {/* Redesign description */}
      <div className="card" style={{
        padding: "20px 24px", marginBottom: 20,
        background: "var(--brand-pale)",
        border: "1px solid var(--brand-light)"
      }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <Sparkles size={20} color="var(--brand)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>Design Vision</div>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>
              {redesign?.redesign_description}
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        {/* Color palette */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Color Palette</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(redesign?.color_palette || []).map((color, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 6,
                  background: color.toLowerCase(),
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-sm)"
                }} />
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{color}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10 }}>
            <span className="badge badge-brand">Style: {redesign?.style_theme}</span>
          </div>
        </div>

        {/* Design tips */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Design Tips</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {(redesign?.design_tips || []).slice(0, 3).map((tip, i) => (
              <div key={i} style={{ fontSize: 12, color: "var(--text-secondary)", display: "flex", gap: 6 }}>
                <span style={{ color: "var(--brand)", fontWeight: 600 }}>•</span>
                {tip}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Material quantities preview */}
      <div className="card" style={{ padding: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
          Material Quantities Summary
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Zone", "Material", "Area", "Qty (incl. wastage)", "Unit"].map(h => (
                  <th key={h} style={{ padding: "8px 10px", textAlign: "left", color: "var(--text-muted)", fontWeight: 500, fontSize: 12 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(redesign?.material_quantities || []).map((item, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <td style={{ padding: "8px 10px", fontWeight: 500 }}>{item.zone_name}</td>
                  <td style={{ padding: "8px 10px", color: "var(--text-secondary)" }}>{item.material}</td>
                  <td style={{ padding: "8px 10px" }}>{item.area_sqft} sqft</td>
                  <td style={{ padding: "8px 10px", fontWeight: 600, color: "var(--brand)" }}>
                    {item.quantity_with_wastage}
                  </td>
                  <td style={{ padding: "8px 10px", color: "var(--text-muted)" }}>{item.unit?.replace("_", " ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {redesign?.maintenance_notes && (
        <div style={{
          padding: "12px 16px", marginBottom: 24,
          background: "#EAF4EE", borderRadius: 10,
          border: "1px solid #BBE0C8",
          fontSize: 13, color: "#2D7A4F"
        }}>
          🔧 <strong>Maintenance:</strong> {redesign.maintenance_notes}
        </div>
      )}

      <div style={{ textAlign: "center" }}>
        <button
          className="btn btn-primary btn-lg"
          onClick={() => onVisualizationDone(redesign)}
        >
          <ChevronRight size={18} />
          Generate Full Cost Estimate
        </button>
      </div>
    </div>
  );
}
