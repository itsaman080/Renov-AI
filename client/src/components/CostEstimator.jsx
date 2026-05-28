import React, { useState, useEffect } from "react";
import { DollarSign, Edit2, RefreshCw, ChevronRight, TrendingUp } from "lucide-react";
import { generateCostReport } from "../utils/aiService";
import { formatINR, MATERIAL_CATALOG } from "../utils/costEngine";

export default function CostEstimator({ redesign, zones, materialSelections, onReportReady }) {
  const [loading, setLoading] = useState(true);
  const [costReport, setCostReport] = useState(null);
  const [error, setError] = useState("");
  const [customRates, setCustomRates] = useState({});
  const [editingRates, setEditingRates] = useState(false);

  const fetchCostReport = (rates = customRates) => {
    setLoading(true);
    setError("");

    const projectDetails = {
      total_zones: zones.length,
      building_type: "residential",
      city: "India",
      selections: materialSelections.map(s => ({
        zone: s.zoneName,
        material: s.materialName,
        area: s.areasqft
      }))
    };

    generateCostReport(redesign?.material_quantities || [], rates, projectDetails)
      .then((result) => {
        setCostReport(result);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => { fetchCostReport(); }, []);

  const updateRate = (zoneName, field, value) => {
    setCustomRates(prev => ({
      ...prev,
      [zoneName]: { ...prev[zoneName], [field]: parseFloat(value) || 0 }
    }));
  };

  if (loading) {
    return (
      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "80px 24px", textAlign: "center"
      }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>💰</div>
        <h3 style={{ fontSize: 24, marginBottom: 8 }}>Calculating Costs</h3>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
          Generating detailed cost breakdown with Indian market rates...
        </p>
        <div className="spinner" style={{ margin: "24px auto", width: 32, height: 32, borderWidth: 3 }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: 48 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h3 style={{ marginBottom: 8 }}>Cost Calculation Failed</h3>
        <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>{error}</p>
        <button className="btn btn-primary" onClick={() => fetchCostReport()}>
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  const summary = costReport?.summary;

  return (
    <div className="fade-up">
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <h2 style={{ fontSize: 28, marginBottom: 8 }}>Renovation Cost Estimate</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
          Detailed cost breakdown based on current Indian market rates
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Material Cost", value: formatINR(summary?.total_material_cost || 0), icon: "📦", color: "var(--brand)" },
          { label: "Labour Cost", value: formatINR(summary?.total_labor_cost || 0), icon: "👷", color: "#6366F1" },
          { label: "Contingency (10%)", value: formatINR(summary?.contingency_amount || 0), icon: "🔧", color: "#F59E0B" },
          { label: "Grand Total", value: formatINR(summary?.grand_total || 0), icon: "💰", color: "var(--success)" }
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="card" style={{ padding: "16px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Cost items table */}
      <div className="card" style={{ marginBottom: 20, overflow: "hidden" }}>
        <div style={{
          padding: "14px 16px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          borderBottom: "1px solid var(--border)"
        }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>Itemized Cost Breakdown</div>
          <button
            onClick={() => setEditingRates(!editingRates)}
            className="btn btn-sm btn-ghost"
          >
            <Edit2 size={13} />
            {editingRates ? "Done Editing" : "Edit Rates"}
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
                {["Zone / Area", "Material", "Qty + Unit", "Rate/Unit", "Mat. Cost", "Labour", "Total"].map(h => (
                  <th key={h} style={{
                    padding: "10px 12px", textAlign: "left",
                    color: "var(--text-muted)", fontWeight: 500, fontSize: 12,
                    whiteSpace: "nowrap"
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(costReport?.cost_items || []).map((item, i) => (
                <tr key={i} style={{
                  borderBottom: "1px solid var(--border-light)",
                  background: i % 2 === 0 ? "transparent" : "var(--bg)"
                }}>
                  <td style={{ padding: "10px 12px", fontWeight: 500 }}>{item.zone_name}</td>
                  <td style={{ padding: "10px 12px", color: "var(--text-secondary)" }}>{item.material}</td>
                  <td style={{ padding: "10px 12px" }}>
                    {item.quantity} {item.unit?.replace("_", " ")}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {editingRates ? (
                      <input
                        type="number"
                        defaultValue={item.rate_per_unit}
                        onChange={(e) => updateRate(item.zone_name, "rate_per_unit", e.target.value)}
                        style={{ width: 80, padding: "4px 8px", fontSize: 12 }}
                      />
                    ) : (
                      <span>₹{item.rate_per_unit}</span>
                    )}
                  </td>
                  <td style={{ padding: "10px 12px" }}>₹{Math.round(item.material_cost).toLocaleString("en-IN")}</td>
                  <td style={{ padding: "10px 12px" }}>₹{Math.round(item.labor_cost).toLocaleString("en-IN")}</td>
                  <td style={{ padding: "10px 12px", fontWeight: 600, color: "var(--brand)" }}>
                    {formatINR(item.total_cost)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: "var(--brand-pale)", borderTop: "2px solid var(--brand-light)" }}>
                <td colSpan={6} style={{ padding: "12px 12px", fontWeight: 700, fontSize: 14 }}>
                  Grand Total (incl. 10% contingency)
                </td>
                <td style={{ padding: "12px 12px", fontWeight: 700, fontSize: 18, color: "var(--success)" }}>
                  {formatINR(summary?.grand_total || 0)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Recalculate button if rates edited */}
      {editingRates && (
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <button
            className="btn btn-secondary"
            onClick={() => { setEditingRates(false); fetchCostReport(customRates); }}
          >
            <RefreshCw size={16} />
            Recalculate with Custom Rates
          </button>
        </div>
      )}

      {/* Notes */}
      {costReport?.cost_notes && (
        <div style={{
          padding: "12px 16px", marginBottom: 20,
          background: "#FFF7ED", border: "1px solid #FED7AA",
          borderRadius: 10, fontSize: 13, color: "#92400E"
        }}>
          ⚠️ {costReport.cost_notes}
        </div>
      )}

      <div style={{
        padding: "12px 16px", marginBottom: 24,
        background: "var(--border-light)", borderRadius: 10,
        fontSize: 12, color: "var(--text-muted)"
      }}>
        📌 {costReport?.validity || "This estimate is advisory. Final costs may vary based on actual measurements and current market conditions."}
      </div>

      <div style={{ textAlign: "center" }}>
        <button
          className="btn btn-primary btn-lg"
          onClick={() => onReportReady(costReport)}
        >
          <TrendingUp size={18} />
          View & Download Full Report
        </button>
      </div>
    </div>
  );
}
