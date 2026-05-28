import React, { useState } from "react";
import { Paintbrush, CheckCircle, Info, Filter } from "lucide-react";
import { MATERIAL_CATALOG, MATERIAL_CATEGORIES, ZONE_COLORS } from "../utils/costEngine";

export default function MaterialSelector({ zones, onMaterialsSelected }) {
  const [activeZone, setActiveZone] = useState(zones[0]?.id || null);
  const [selections, setSelections] = useState({});
  const [filterCategory, setFilterCategory] = useState("all");
  const [showOnlyCompatible, setShowOnlyCompatible] = useState(true); // NEW: toggle

  const activeZoneData = zones.find(z => z.id === activeZone);
  const selectedMaterial = activeZone ? selections[activeZone]?.materialId : null;

  const selectMaterial = (zoneId, materialId) => {
    const mat = MATERIAL_CATALOG[materialId];
    setSelections(prev => ({
      ...prev,
      [zoneId]: {
        materialId,
        materialName: mat.name,
        colorFinish: mat.colors[0],
        finish: mat.finishes[0]
      }
    }));
  };

  const updateSelection = (zoneId, field, value) => {
    setSelections(prev => ({ ...prev, [zoneId]: { ...prev[zoneId], [field]: value } }));
  };

  // ── FIXED: zoneMatch is now actually applied in the filter ─────────────────
  const filteredMaterials = Object.values(MATERIAL_CATALOG).filter(mat => {
    const categoryMatch = filterCategory === "all" || mat.category === filterCategory;
    const zoneMatch = !activeZoneData || mat.applicableTo.includes(activeZoneData.type);
    // If toggle is ON, require zone compatibility. If OFF, show all (filtered by category only).
    return categoryMatch && (showOnlyCompatible ? zoneMatch : true);
  });

  const completedCount = Object.keys(selections).length;

  const buildSelectionList = () =>
    Object.entries(selections).map(([zoneId, sel]) => {
      const zone = zones.find(z => z.id === zoneId);
      return { zoneId, zoneName: zone?.name || zoneId, zoneType: zone?.type || "wall", areasqft: zone?.estimated_area_sqft || 0, ...sel };
    });

  return (
    <div className="fade-up">
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <h2 style={{ fontSize: 28, marginBottom: 8 }}>Select Materials</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
          Click a zone on the left, then pick a compatible material on the right.
        </p>
        <div style={{ marginTop: 12 }}>
          <span className="badge badge-brand">{completedCount}/{zones.length} zones configured</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 20 }}>

        {/* ── Left: Zone list ─────────────────────────────────────────────── */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Zones ({zones.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {zones.map(zone => {
              const sel = selections[zone.id];
              const isActive = activeZone === zone.id;
              return (
                <button
                  key={zone.id}
                  onClick={() => { setActiveZone(zone.id); setFilterCategory("all"); }}
                  style={{
                    width: "100%", textAlign: "left", padding: "10px 12px",
                    background: isActive ? "var(--brand-pale)" : "var(--bg-card)",
                    border: `1.5px solid ${isActive ? "var(--brand)" : "var(--border)"}`,
                    borderRadius: 10, cursor: "pointer", transition: "all 0.15s"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: ZONE_COLORS[zone.type] || "#888", flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{zone.name}</span>
                    {sel
                      ? <CheckCircle size={14} color="var(--success)" />
                      : <div style={{ width: 14, height: 14, borderRadius: "50%", border: "1.5px solid var(--border)" }} />
                    }
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, paddingLeft: 16 }}>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{zone.type} • {zone.estimated_area_sqft} sqft</span>
                  </div>
                  {sel && (
                    <div style={{ fontSize: 11, color: "var(--brand)", marginTop: 2, paddingLeft: 16, fontWeight: 500 }}>
                      {MATERIAL_CATALOG[sel.materialId]?.icon} {sel.materialName}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Right: Material picker ──────────────────────────────────────── */}
        <div>
          {activeZoneData && (
            <>
              {/* Zone header */}
              <div style={{ padding: "12px 16px", marginBottom: 14, background: "var(--brand-pale)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: ZONE_COLORS[activeZoneData.type] || "#888" }} />
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{activeZoneData.name}</span>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{activeZoneData.estimated_area_sqft} sqft</span>
                </div>
                {/* Compatible-only toggle */}
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-secondary)", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={showOnlyCompatible}
                    onChange={e => setShowOnlyCompatible(e.target.checked)}
                    style={{ accentColor: "var(--brand)" }}
                  />
                  <Filter size={12} />
                  Compatible only
                </label>
              </div>

              {/* Category filter pills */}
              <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
                {MATERIAL_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setFilterCategory(cat.id)}
                    className="btn btn-sm"
                    style={{
                      background: filterCategory === cat.id ? "var(--brand)" : "var(--bg-card)",
                      color: filterCategory === cat.id ? "white" : "var(--text-secondary)",
                      border: `1px solid ${filterCategory === cat.id ? "var(--brand)" : "var(--border)"}`,
                      padding: "5px 12px"
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Count label */}
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>
                Showing {filteredMaterials.length} material{filteredMaterials.length !== 1 ? "s" : ""}
                {showOnlyCompatible && ` compatible with "${activeZoneData.type}" zones`}
              </div>

              {filteredMaterials.length === 0 ? (
                <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: 13, background: "var(--border-light)", borderRadius: 12 }}>
                  No materials match this filter.
                  <button onClick={() => setShowOnlyCompatible(false)} style={{ display: "block", margin: "8px auto 0", color: "var(--brand)", background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>
                    Show all materials →
                  </button>
                </div>
              ) : (
                /* Materials grid */
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                  {filteredMaterials.map(mat => {
                    const isSelected = selectedMaterial === mat.id;
                    const isCompatible = mat.applicableTo.includes(activeZoneData.type);
                    return (
                      <button
                        key={mat.id}
                        onClick={() => selectMaterial(activeZone, mat.id)}
                        style={{
                          textAlign: "left", padding: "14px",
                          background: isSelected ? "var(--brand-pale)" : "var(--bg-card)",
                          border: `1.5px solid ${isSelected ? "var(--brand)" : "var(--border)"}`,
                          borderRadius: 12, cursor: "pointer", transition: "all 0.15s",
                          opacity: (!isCompatible && !showOnlyCompatible) ? 0.6 : 1
                        }}
                      >
                        <div style={{ fontSize: 22, marginBottom: 6 }}>{mat.icon}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2, display: "flex", justifyContent: "space-between" }}>
                          {mat.name}
                          {!isCompatible && !showOnlyCompatible && (
                            <span style={{ fontSize: 10, color: "#D97706", background: "#FEF3C7", padding: "2px 6px", borderRadius: 4 }}>⚠ not ideal</span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>{mat.description}</div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span className="badge" style={{ background: "var(--border-light)", color: "var(--text-muted)", fontSize: 10 }}>{mat.durability}</span>
                          {isSelected && <CheckCircle size={14} color="var(--brand)" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Color & finish picker */}
              {selections[activeZone] && (
                <div className="card" style={{ padding: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
                    Customize: {selections[activeZone].materialName}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Color / Shade</label>
                      <select value={selections[activeZone].colorFinish} onChange={(e) => updateSelection(activeZone, "colorFinish", e.target.value)}>
                        {MATERIAL_CATALOG[selections[activeZone].materialId].colors.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Finish Type</label>
                      <select value={selections[activeZone].finish} onChange={(e) => updateSelection(activeZone, "finish", e.target.value)}>
                        {MATERIAL_CATALOG[selections[activeZone].materialId].finishes.map(f => <option key={f}>{f}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ marginTop: 10, fontSize: 12, color: "var(--text-muted)", display: "flex", gap: 6, alignItems: "center" }}>
                    <Info size={12} />
                    {MATERIAL_CATALOG[selections[activeZone].materialId].maintenance}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginTop: 32 }}>
        <button
          className="btn btn-primary btn-lg"
          disabled={completedCount === 0}
          onClick={() => onMaterialsSelected(buildSelectionList())}
        >
          <Paintbrush size={18} />
          Generate Redesign & Cost Estimate
          <span style={{ fontSize: 12, opacity: 0.8 }}>({completedCount}/{zones.length} zones)</span>
        </button>
      </div>
    </div>
  );
}
