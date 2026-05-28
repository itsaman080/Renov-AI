import React, { useState, useEffect } from "react";
import "./styles/globals.css";
import UploadStep from "./components/UploadStep";
import ZoneMapper from "./components/ZoneMapper";
import MaterialSelector from "./components/MaterialSelector";
import Visualization from "./components/Visualization";
import CostEstimator from "./components/CostEstimator";
import ReportView from "./components/ReportView";
import { saveProject, loadAllProjects, loadProject, deleteProject, formatSavedDate } from "./utils/projectStorage";

const STEPS = [
  { id: 1, label: "Upload",    icon: "📷" },
  { id: 2, label: "Analyze",   icon: "🔍" },
  { id: 3, label: "Materials", icon: "🎨" },
  { id: 4, label: "Visualize", icon: "✨" },
  { id: 5, label: "Cost",      icon: "💰" },
  { id: 6, label: "Report",    icon: "📄" },
];

const EMPTY_STATE = {
  currentStep: 1,
  imageFile: null,
  imagePreview: null,
  zones: [],
  analysis: null,
  materialSelections: [],
  redesign: null,
  costReport: null,
  projectId: null,
  projectName: "Untitled Project",
};

export default function App() {
  const [state, setState] = useState(EMPTY_STATE);
  const [savedProjects, setSavedProjects] = useState({});
  const [showProjectPanel, setShowProjectPanel] = useState(false);
  const [saveStatus, setSaveStatus] = useState(""); // "saving" | "saved" | ""

  // Load saved projects list on mount
  useEffect(() => {
    setSavedProjects(loadAllProjects());
  }, []);

  // Auto-save whenever meaningful state changes
  useEffect(() => {
    if (state.currentStep < 2 || !state.imagePreview) return;
    setSaveStatus("saving");
    const id = saveProject({
      id: state.projectId,
      projectName: state.projectName,
      currentStep: state.currentStep,
      imagePreview: state.imagePreview,  // base64/blob URL
      zones: state.zones,
      analysis: state.analysis,
      materialSelections: state.materialSelections,
      redesign: state.redesign,
      costReport: state.costReport,
    });
    setState(prev => ({ ...prev, projectId: id }));
    setSavedProjects(loadAllProjects());
    setTimeout(() => setSaveStatus("saved"), 400);
    setTimeout(() => setSaveStatus(""), 2200);
  }, [state.currentStep, state.zones, state.materialSelections, state.redesign, state.costReport]);

  const set = (patch) => setState(prev => ({ ...prev, ...patch }));

  const reset = () => {
    setState(EMPTY_STATE);
    setShowProjectPanel(false);
  };

  const resumeProject = (id) => {
    const p = loadProject(id);
    if (!p) return;
    setState({
      ...EMPTY_STATE,
      projectId: p.id,
      projectName: p.projectName || "Untitled Project",
      currentStep: p.currentStep || 1,
      imagePreview: p.imagePreview || null,
      zones: p.zones || [],
      analysis: p.analysis || null,
      materialSelections: p.materialSelections || [],
      redesign: p.redesign || null,
      costReport: p.costReport || null,
    });
    setShowProjectPanel(false);
  };

  const handleDeleteProject = (id, e) => {
    e.stopPropagation();
    deleteProject(id);
    setSavedProjects(loadAllProjects());
    if (state.projectId === id) reset();
  };

  const projectList = Object.values(savedProjects).sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header style={{ background: "white", borderBottom: "1px solid var(--border)", padding: "0 24px", position: "sticky", top: 0, zIndex: 100, boxShadow: "var(--shadow-sm)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", height: 60, justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, background: "var(--brand)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🏠</div>
            <div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, lineHeight: 1.2 }}>RenovAI</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1 }}>Exterior Renovation Planner</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Auto-save indicator */}
            {saveStatus && (
              <span style={{ fontSize: 12, color: saveStatus === "saved" ? "var(--success)" : "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                {saveStatus === "saving" ? "⏳ Saving..." : "✓ Saved"}
              </span>
            )}

            {/* Project name */}
            {state.currentStep > 1 && (
              <input
                value={state.projectName}
                onChange={e => set({ projectName: e.target.value })}
                style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "4px 10px", fontSize: 13, width: 160 }}
                placeholder="Project name"
              />
            )}

            {/* Saved projects panel toggle */}
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setShowProjectPanel(!showProjectPanel)}
              style={{ position: "relative" }}
            >
              📁 Projects
              {projectList.length > 0 && (
                <span style={{ background: "var(--brand)", color: "white", borderRadius: "50%", width: 16, height: 16, fontSize: 10, display: "inline-flex", alignItems: "center", justifyContent: "center", marginLeft: 4 }}>
                  {projectList.length}
                </span>
              )}
            </button>

            {state.currentStep > 1 && (
              <button className="btn btn-ghost btn-sm" onClick={reset}>+ New</button>
            )}
          </div>
        </div>
      </header>

      {/* ── Saved Projects Drawer ──────────────────────────────────────── */}
      {showProjectPanel && (
        <div style={{ background: "white", borderBottom: "1px solid var(--border)", padding: "16px 24px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: "var(--text-secondary)" }}>
              SAVED PROJECTS
            </div>
            {projectList.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No saved projects yet. Your work saves automatically as you progress.</p>
            ) : (
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {projectList.map(p => (
                  <div
                    key={p.id}
                    onClick={() => resumeProject(p.id)}
                    style={{
                      padding: "12px 14px", borderRadius: 10, cursor: "pointer",
                      border: `1.5px solid ${state.projectId === p.id ? "var(--brand)" : "var(--border)"}`,
                      background: state.projectId === p.id ? "var(--brand-pale)" : "var(--bg-card)",
                      minWidth: 180, position: "relative"
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{p.projectName || "Untitled"}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      Step {p.currentStep}/6 • {formatSavedDate(p.savedAt)}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                      {p.zones?.length || 0} zones • {p.materialSelections?.length || 0} materials
                    </div>
                    <button
                      onClick={e => handleDeleteProject(p.id, e)}
                      style={{ position: "absolute", top: 6, right: 6, background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "var(--text-muted)", padding: 2 }}
                      title="Delete project"
                    >×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Step indicator ──────────────────────────────────────────────── */}
      <div style={{ background: "white", borderBottom: "1px solid var(--border)", padding: "12px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0 }}>
            {STEPS.map((step, i) => {
              const done = state.currentStep > step.id;
              const active = state.currentStep === step.id;
              return (
                <React.Fragment key={step.id}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, opacity: done || active ? 1 : 0.4, minWidth: 64 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: "50%",
                      background: done ? "var(--success)" : active ? "var(--brand)" : "var(--border-light)",
                      color: done || active ? "white" : "var(--text-muted)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: done ? 16 : 15,
                      border: `2px solid ${done ? "var(--success)" : active ? "var(--brand)" : "var(--border)"}`,
                      transition: "all 0.3s"
                    }}>
                      {done ? "✓" : step.icon}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: active ? 600 : 400, color: active ? "var(--brand)" : "var(--text-muted)" }}>
                      {step.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ flex: 1, height: 2, maxWidth: 40, background: done ? "var(--success)" : "var(--border)", margin: "0 4px 20px", transition: "background 0.3s" }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <main style={{ flex: 1, padding: "40px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>

          {state.currentStep === 1 && (
            <UploadStep
              onImageReady={(file, preview) => set({ imageFile: file, imagePreview: preview, currentStep: 2 })}
            />
          )}

          {state.currentStep === 2 && (
            <ZoneMapper
              imageFile={state.imageFile}
              imagePreview={state.imagePreview}
              onZonesMapped={(z, a) => set({ zones: z, analysis: a, currentStep: 3 })}
            />
          )}

          {state.currentStep === 3 && (
            <MaterialSelector
              zones={state.zones}
              onMaterialsSelected={(sels) => set({ materialSelections: sels, currentStep: 4 })}
            />
          )}

          {state.currentStep === 4 && (
            <Visualization
              imageFile={state.imageFile}
              imagePreview={state.imagePreview}
              zones={state.zones}
              materialSelections={state.materialSelections}
              onVisualizationDone={(r) => set({ redesign: r, currentStep: 5 })}
            />
          )}

          {state.currentStep === 5 && (
            <CostEstimator
              redesign={state.redesign}
              zones={state.zones}
              materialSelections={state.materialSelections}
              onReportReady={(report) => set({ costReport: report, currentStep: 6 })}
            />
          )}

          {state.currentStep === 6 && (
            <ReportView
              imagePreview={state.imagePreview}
              zones={state.zones}
              materialSelections={state.materialSelections}
              redesign={state.redesign}
              costReport={state.costReport}
              onStartOver={reset}
            />
          )}

        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "14px 24px", textAlign: "center", fontSize: 12, color: "var(--text-muted)" }}>
        RenovAI — AI-powered exterior renovation planning · Powered by Groq Llama 4 Scout Vision · Created by Aman · Estimates are advisory only
      </footer>
    </div>
  );
}
