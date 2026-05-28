import React, { useRef, useState } from "react";
import { Download, RefreshCw, CheckCircle, FileText } from "lucide-react";
import { formatINR } from "../utils/costEngine";

export default function ReportView({ imagePreview, zones, materialSelections, redesign, costReport, onStartOver }) {
  const reportRef = useRef();
  const [downloading, setDownloading] = useState(false);

  const summary = costReport?.summary;

  const downloadPDF = async () => {
    setDownloading(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: html2canvas } = await import("html2canvas");

      const canvas = await html2canvas(reportRef.current, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: "#FAFAF8"
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const pageHeight = pdf.internal.pageSize.getHeight();
      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`RenovAI_Report_${new Date().toLocaleDateString("en-IN").replace(/\//g, "-")}.pdf`);
    } catch (e) {
      console.error("PDF download failed:", e);
      alert("PDF download failed. Try printing the page instead (Ctrl+P).");
    }
    setDownloading(false);
  };

  return (
    <div className="fade-up">
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
        <h2 style={{ fontSize: 28, marginBottom: 8 }}>Renovation Report Ready</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
          Your complete renovation plan. Download as PDF to share with contractors.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 16 }}>
          <button
            className="btn btn-primary btn-lg"
            onClick={downloadPDF}
            disabled={downloading}
          >
            {downloading ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : <Download size={18} />}
            {downloading ? "Generating PDF..." : "Download PDF Report"}
          </button>
          <button className="btn btn-ghost" onClick={onStartOver}>
            <RefreshCw size={16} /> Start New Project
          </button>
        </div>
      </div>

      {/* Printable report */}
      <div ref={reportRef} style={{ background: "#FAFAF8", padding: "32px", borderRadius: 16 }}>

        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          paddingBottom: 20, borderBottom: "2px solid #C4813A", marginBottom: 24
        }}>
          <div>
            <div style={{ fontSize: 28, fontFamily: "'DM Serif Display', serif", color: "#1A1612" }}>
              RenovAI
            </div>
            <div style={{ fontSize: 12, color: "#9C8A78", marginTop: 2 }}>
              Exterior Renovation Estimation Report
            </div>
          </div>
          <div style={{ textAlign: "right", fontSize: 12, color: "#9C8A78" }}>
            <div>Date: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</div>
            <div>Reference: RNV-{Date.now().toString().slice(-6)}</div>
          </div>
        </div>

        {/* House image */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: "#5C4E3E" }}>
            PROPERTY DETAILS
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <img
                src={imagePreview}
                alt="Original house"
                style={{ width: "100%", borderRadius: 10, objectFit: "cover", maxHeight: 220 }}
                crossOrigin="anonymous"
              />
              <div style={{ fontSize: 11, color: "#9C8A78", textAlign: "center", marginTop: 4 }}>Original Exterior</div>
            </div>
            <div>
              <div style={{ background: "#FDF8F2", border: "1px solid #E8E0D5", borderRadius: 10, padding: 16, height: "100%" }}>
                <div style={{ fontWeight: 600, marginBottom: 12, color: "#1A1612", fontSize: 14 }}>
                  Renovation Summary
                </div>
                <div style={{ fontSize: 13, color: "#5C4E3E", lineHeight: 1.8 }}>
                  <div>🏠 Type: Residential Exterior</div>
                  <div>🎨 Style: {redesign?.style_theme || "Contemporary"}</div>
                  <div>📐 Total Zones: {zones.length}</div>
                  <div>📦 Materials: {materialSelections.length}</div>
                  <div style={{ marginTop: 10, padding: "8px 12px", background: "#F5E6D3", borderRadius: 8 }}>
                    <div style={{ fontSize: 12, color: "#A36628" }}>Estimated Total Cost</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: "#C4813A" }}>
                      {formatINR(summary?.grand_total || 0)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Design vision */}
        {redesign?.redesign_description && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: "#5C4E3E" }}>
              RENOVATION DESIGN VISION
            </div>
            <div style={{
              padding: "16px", background: "#FDF8F2",
              border: "1px solid #E8E0D5", borderRadius: 10,
              fontSize: 13, color: "#5C4E3E", lineHeight: 1.7
            }}>
              {redesign.redesign_description}
            </div>
          </div>
        )}

        {/* Materials selected */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: "#5C4E3E" }}>
            MATERIAL SELECTIONS
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "#C4813A", color: "white" }}>
                {["Zone", "Material", "Color / Finish", "Area (sqft)"].map(h => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {materialSelections.map((sel, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#FDF8F2", borderBottom: "1px solid #E8E0D5" }}>
                  <td style={{ padding: "8px 12px", fontWeight: 500 }}>{sel.zoneName}</td>
                  <td style={{ padding: "8px 12px" }}>{sel.materialName}</td>
                  <td style={{ padding: "8px 12px", color: "#5C4E3E" }}>{sel.colorFinish} / {sel.finish}</td>
                  <td style={{ padding: "8px 12px" }}>{sel.areasqft}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cost breakdown */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: "#5C4E3E" }}>
            DETAILED COST ESTIMATE
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "#1A1612", color: "white" }}>
                {["Zone", "Material", "Quantity", "Rate", "Material", "Labour", "Total"].map(h => (
                  <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontWeight: 500, fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(costReport?.cost_items || []).map((item, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#FDF8F2", borderBottom: "1px solid #E8E0D5" }}>
                  <td style={{ padding: "7px 10px" }}>{item.zone_name}</td>
                  <td style={{ padding: "7px 10px" }}>{item.material}</td>
                  <td style={{ padding: "7px 10px" }}>{item.quantity} {item.unit?.replace("_", " ")}</td>
                  <td style={{ padding: "7px 10px" }}>₹{item.rate_per_unit}</td>
                  <td style={{ padding: "7px 10px" }}>₹{Math.round(item.material_cost).toLocaleString("en-IN")}</td>
                  <td style={{ padding: "7px 10px" }}>₹{Math.round(item.labor_cost).toLocaleString("en-IN")}</td>
                  <td style={{ padding: "7px 10px", fontWeight: 600 }}>₹{Math.round(item.total_cost).toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Cost summary */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: 0, marginTop: 2,
            border: "1px solid #E8E0D5", borderRadius: "0 0 8px 8px", overflow: "hidden"
          }}>
            {[
              { label: "Material Cost", value: formatINR(summary?.total_material_cost || 0) },
              { label: "Labour Cost", value: formatINR(summary?.total_labor_cost || 0) },
              { label: "Contingency (10%)", value: formatINR(summary?.contingency_amount || 0) },
              { label: "GRAND TOTAL", value: formatINR(summary?.grand_total || 0), highlight: true }
            ].map(({ label, value, highlight }) => (
              <div key={label} style={{
                padding: "12px 14px",
                background: highlight ? "#C4813A" : "#FDF8F2",
                color: highlight ? "white" : "#1A1612",
                borderLeft: "1px solid #E8E0D5"
              }}>
                <div style={{ fontSize: 11, opacity: highlight ? 0.85 : 0.7, marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: highlight ? 18 : 15, fontWeight: 700 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimers */}
        <div style={{ fontSize: 11, color: "#9C8A78", borderTop: "1px solid #E8E0D5", paddingTop: 16 }}>
          <strong>Disclaimer:</strong> This estimate is generated by AI and is advisory in nature. Actual costs may vary
          based on site conditions, material availability, contractor rates, and actual measurements. This document is
          intended as a pre-construction planning tool and should not be treated as a formal quotation.
          Generated by RenovAI — {new Date().toLocaleDateString("en-IN")}
        </div>
      </div>
    </div>
  );
}
