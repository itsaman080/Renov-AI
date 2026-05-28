import React, { useState, useEffect } from "react";
import { Layers, Edit3, CheckCircle, Info, RotateCcw, Plus, Trash2 } from "lucide-react";
import { ZONE_COLORS } from "../utils/costEngine";
import { analyzeHouseImage } from "../utils/aiService";

const ZONE_TYPES = ["wall","window","door","balcony","pillar","roof","gate","parapet","railing","trim"];

export default function ZoneMapper({ imageFile, imagePreview, onZonesMapped }) {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");
  const [editingZone, setEditingZone] = useState(null);
  const [zones, setZones] = useState([]);
  const [loadingMsg, setLoadingMsg] = useState("Uploading image...");

  const LOADING_MSGS = [
    "Uploading image...",
    "Analyzing building structure...",
    "Identifying exterior zones...",
    "Calculating surface areas...",
    "Almost done..."
  ];

  useEffect(() => {
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % LOADING_MSGS.length;
      setLoadingMsg(LOADING_MSGS[idx]);
    }, 1800);

    analyzeHouseImage(imageFile)
      .then((result) => {
        clearInterval(interval);
        setAnalysis(result);
        setZones(result.zones || []);
        setLoading(false);
      })
      .catch((err) => {
        clearInterval(interval);
        setError(err.message);
        setLoading(false);
      });

    return () => clearInterval(interval);
  }, [imageFile]);

  // ── Zone CRUD ─────────────────────────────────────────────────────────────
  const updateZone = (id, field, value) => {
    setZones(prev => prev.map(z =>
      z.id === id
        ? { ...z, [field]: field === "estimated_area_sqft" ? parseFloat(value) || 0 : value }
        : z
    ));
  };

  const addZone = () => {
    const newId = `zone_custom_${Date.now()}`;
    setZones(prev => [...prev, {
      id: newId, name: "New Zone", type: "wall",
      description: "Manually added zone",
      estimated_area_sqft: 100, position: "center",
      suggested_materials: ["paint"]
    }]);
    setEditingZone(newId);
  };

  const deleteZone = (id) => {
    setZones(prev => prev.filter(z => z.id !== id));
    if (editingZone === id) setEditingZone(null);
  };

  const totalArea = zones.reduce((sum, z) => sum + (z.estimated_area_sqft || 0), 0);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px", textAlign: "center" }}>
        <div style={{ width: 80, height: 80, background: "var(--brand-light)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, position: "relative" }}>
          <Layers size={36} color="var(--brand)" />
          <div className="spinner" style={{ position: "absolute", inset: -4, width: "calc(100% + 8px)", height: "calc(100% + 8px)", borderWidth: 3 }} />
        </div>
        <h3 style={{ fontSize: 22, marginBottom: 8 }}>Analyzing Your House</h3>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>{loadingMsg}</p>
        <div style={{ marginTop: 24, width: 200 }}>
          <div style={{ height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", background: "var(--brand)", borderRadius: 2, animation: "progress 6s ease-in-out forwards" }} />
          </div>
        </div>
        <style>{`@keyframes progress { from { width: 0% } to { width: 90% } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: 48 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h3 style={{ marginBottom: 8 }}>Analysis Failed</h3>
        <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>{error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          <RotateCcw size={16} /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="fade-up">
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h2 style={{ fontSize: 28, marginBottom: 8 }}>Detected Renovation Zones</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
          AI identified {zones.length} zones. Edit names, types, areas — or add/remove zones as needed.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

        {/* Left: image + stats */}
        <div>
          <div className="card" style={{ overflow: "hidden" }}>
            <img src={imagePreview} alt="House" style={{ width: "100%", objectFit: "cover", display: "block", maxHeight: 350 }} />
            <div style={{ padding: "12px 16px", background: "var(--brand-pale)" }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>
                📋 {analysis?.building_description}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 16 }}>
            {[
              { label: "Type", value: analysis?.building_type?.replace(/_/g, " ") || "—" },
              { label: "Stories", value: analysis?.estimated_stories || "—" },
              { label: "Total Area", value: `~${Math.round(totalArea)} sqft` }
            ].map(({ label, value }) => (
              <div key={label} className="card" style={{ padding: "14px", textAlign: "center" }}>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 16, fontWeight: 600, textTransform: "capitalize" }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div style={{ marginTop: 16, padding: "12px 14px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>ZONE TYPE LEGEND</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {Object.entries(ZONE_COLORS).map(([type, color]) => (
                <div key={type} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--text-secondary)" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                  {type}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: editable zones list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 560, overflowY: "auto" }}>

          {zones.map((zone) => {
            const isEditing = editingZone === zone.id;
            return (
              <div
                key={zone.id}
                className="card"
                style={{ padding: "14px 16px", border: isEditing ? "1.5px solid var(--brand)" : "1px solid var(--border)" }}
              >
                {isEditing ? (
                  /* ── Full edit form ───────────────────────────────────── */
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <div style={{ flex: 2 }}>
                        <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 3 }}>Zone Name</label>
                        <input value={zone.name} onChange={e => updateZone(zone.id, "name", e.target.value)} style={{ fontSize: 13, padding: "6px 10px" }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 3 }}>Type</label>
                        <select value={zone.type} onChange={e => updateZone(zone.id, "type", e.target.value)} style={{ fontSize: 13, padding: "6px 8px" }}>
                          {ZONE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 3 }}>Area (sqft)</label>
                        <input type="number" value={zone.estimated_area_sqft} onChange={e => updateZone(zone.id, "estimated_area_sqft", e.target.value)} style={{ fontSize: 13, padding: "6px 10px" }} />
                      </div>
                      <div style={{ flex: 2 }}>
                        <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 3 }}>Description</label>
                        <input value={zone.description} onChange={e => updateZone(zone.id, "description", e.target.value)} style={{ fontSize: 13, padding: "6px 10px" }} />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <button onClick={() => deleteZone(zone.id)} className="btn btn-sm" style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
                        <Trash2 size={12} /> Delete
                      </button>
                      <button onClick={() => setEditingZone(null)} className="btn btn-sm" style={{ background: "var(--brand)", color: "white", border: "none" }}>
                        <CheckCircle size={13} /> Save
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── Compact view ─────────────────────────────────────── */
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", flexShrink: 0, background: ZONE_COLORS[zone.type] || "#888" }} />
                      <div style={{ flex: 1, fontWeight: 500, fontSize: 14 }}>{zone.name}</div>
                      <span className="badge" style={{ background: `${ZONE_COLORS[zone.type]}20`, color: ZONE_COLORS[zone.type] || "var(--text-secondary)", fontSize: 11 }}>
                        {zone.type}
                      </span>
                      <button onClick={() => setEditingZone(zone.id)} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--text-muted)", padding: 2 }}>
                        <Edit3 size={14} />
                      </button>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>{zone.description}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                        Est. Area: <strong>{zone.estimated_area_sqft} sqft</strong>
                      </span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {(zone.suggested_materials || []).slice(0, 2).map(m => (
                          <span key={m} className="badge" style={{ background: "var(--border-light)", color: "var(--text-muted)", fontSize: 10 }}>
                            {m.replace("_", " ")}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}

          {/* Add zone button */}
          <button
            onClick={addZone}
            style={{
              padding: "10px 16px", borderRadius: 10, cursor: "pointer",
              background: "var(--bg-card)", border: "1.5px dashed var(--border)",
              color: "var(--text-muted)", fontSize: 13,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              transition: "all 0.15s"
            }}
            onMouseEnter={e => { e.target.style.borderColor = "var(--brand)"; e.target.style.color = "var(--brand)"; }}
            onMouseLeave={e => { e.target.style.borderColor = "var(--border)"; e.target.style.color = "var(--text-muted)"; }}
          >
            <Plus size={14} /> Add Zone Manually
          </button>
        </div>
      </div>

      {analysis?.renovation_notes && (
        <div style={{ marginTop: 20, padding: "14px 16px", background: "var(--brand-pale)", borderRadius: 12, border: "1px solid var(--brand-light)", display: "flex", gap: 10, fontSize: 13, color: "var(--text-secondary)" }}>
          <Info size={16} color="var(--brand)" style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{analysis.renovation_notes}</span>
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: 32 }}>
        <button className="btn btn-primary btn-lg" disabled={zones.length === 0} onClick={() => onZonesMapped(zones, analysis)}>
          <CheckCircle size={18} />
          Confirm {zones.length} Zones & Select Materials
        </button>
      </div>
    </div>
  );
}
