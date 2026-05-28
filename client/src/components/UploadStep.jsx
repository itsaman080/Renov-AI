import React, { useState, useRef, useCallback } from "react";
import { Upload, ImageIcon, CheckCircle, AlertCircle, X, Eye } from "lucide-react";

// ── Image quality check using canvas ─────────────────────────────────────────
// Returns a score 0-100. Checks: resolution, brightness variance (blur proxy),
// average brightness (too dark / washed out).
function assessImageQuality(file) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      // Downscale to 200×150 for fast pixel analysis
      canvas.width = 200;
      canvas.height = 150;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, 200, 150);
      const { data } = ctx.getImageData(0, 0, 200, 150);

      let totalBrightness = 0;
      let brightnessValues = [];

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
        totalBrightness += brightness;
        brightnessValues.push(brightness);
      }

      const pixelCount = brightnessValues.length;
      const avgBrightness = totalBrightness / pixelCount;

      // Variance = measure of contrast / detail (low variance = blurry or flat)
      const variance =
        brightnessValues.reduce((sum, v) => sum + Math.pow(v - avgBrightness, 2), 0) / pixelCount;

      // Resolution check
      const megapixels = (img.naturalWidth * img.naturalHeight) / 1_000_000;

      let issues = [];
      let score = 100;

      if (megapixels < 0.05) { issues.push("Resolution too low (minimum ~300×200 px)"); score -= 50; }
      if (avgBrightness < 35) { issues.push("Image is too dark — try a daytime photo"); score -= 35; }
      if (avgBrightness > 230) { issues.push("Image is overexposed / too bright"); score -= 25; }
      if (variance < 150) { issues.push("Image appears blurry or has very low detail"); score -= 30; }

      URL.revokeObjectURL(url);
      resolve({ score: Math.max(0, score), issues, avgBrightness, variance, megapixels });
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve({ score: 50, issues: [], avgBrightness: 128, variance: 500, megapixels: 1 }); };
    img.src = url;
  });
}

export default function UploadStep({ onImageReady }) {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [qualityInfo, setQualityInfo] = useState(null);
  const [checking, setChecking] = useState(false);
  const inputRef = useRef();

  const validateAndSetFile = useCallback(async (f) => {
    setError("");
    setWarning("");
    setQualityInfo(null);
    if (!f) return;

    // ── 1. Type check ─────────────────────────────────────────────────────
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(f.type)) {
      setError("Please upload a JPG, PNG, or WebP image.");
      return;
    }
    // ── 2. Size check ─────────────────────────────────────────────────────
    if (f.size > 20 * 1024 * 1024) {
      setError("Image must be under 20MB.");
      return;
    }

    // ── 3. Quality check ──────────────────────────────────────────────────
    setChecking(true);
    const url = URL.createObjectURL(f);
    setPreview(url);

    const quality = await assessImageQuality(f);
    setChecking(false);
    setQualityInfo(quality);

    if (quality.score < 40) {
      // Hard reject — too poor to use
      setError(
        `Image quality too low (score: ${quality.score}/100). Issues: ${quality.issues.join("; ")}. Please upload a clearer photo.`
      );
      setPreview(null);
      setFile(null);
      URL.revokeObjectURL(url);
      return;
    }

    if (quality.score < 70) {
      // Soft warning — allow but warn
      setWarning(
        `Image quality is acceptable but not ideal (score: ${quality.score}/100). ${quality.issues.join("; ")}. Results may be less accurate.`
      );
    }

    setFile(f);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    validateAndSetFile(e.dataTransfer.files[0]);
  }, [validateAndSetFile]);

  const handleClear = () => {
    setPreview(null);
    setFile(null);
    setError("");
    setWarning("");
    setQualityInfo(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const qualityColor = qualityInfo
    ? qualityInfo.score >= 70 ? "var(--success)" : qualityInfo.score >= 40 ? "#D97706" : "#DC2626"
    : null;

  return (
    <div className="fade-up" style={{ maxWidth: 640, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h2 style={{ fontSize: 28, color: "var(--text-primary)", marginBottom: 8 }}>
          Upload Your House Photo
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
          Upload a clear exterior photo of your house. Our AI will analyze the structure and identify renovation zones.
        </p>
      </div>

      {!preview ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? "var(--brand)" : "var(--border)"}`,
            borderRadius: 20, padding: "64px 32px",
            textAlign: "center", cursor: "pointer",
            background: dragOver ? "var(--brand-pale)" : "var(--bg-card)",
            transition: "all 0.2s ease",
          }}
        >
          <input ref={inputRef} type="file" accept="image/*" onChange={(e) => validateAndSetFile(e.target.files[0])} style={{ display: "none" }} />
          <div style={{ width: 72, height: 72, background: "var(--brand-light)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Upload size={32} color="var(--brand)" />
          </div>
          <h3 style={{ fontSize: 18, marginBottom: 8 }}>Drop your image here</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 16 }}>or click to browse files</p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {["JPG", "PNG", "WebP"].map(t => <span key={t} className="badge badge-brand">{t}</span>)}
            <span className="badge" style={{ background: "var(--border-light)", color: "var(--text-secondary)" }}>Max 20MB</span>
          </div>
        </div>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ position: "relative" }}>
            {checking && (
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 10, gap: 10 }}>
                <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3, borderColor: "rgba(255,255,255,0.3)", borderTopColor: "white" }} />
                <span style={{ color: "white", fontSize: 13 }}>Checking image quality...</span>
              </div>
            )}
            <img src={preview} alt="House preview" style={{ width: "100%", maxHeight: 380, objectFit: "cover", display: "block" }} />
            <button onClick={handleClear} style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white" }}>
              <X size={16} />
            </button>
          </div>

          {/* Quality meter */}
          {qualityInfo && !error && (
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>Image Quality</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: qualityColor }}>{qualityInfo.score}/100 — {qualityInfo.score >= 70 ? "Good ✓" : "Acceptable ⚠"}</span>
              </div>
              <div style={{ height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${qualityInfo.score}%`, background: qualityColor, borderRadius: 3, transition: "width 0.5s ease" }} />
              </div>
              <div style={{ display: "flex", gap: 16, marginTop: 6, fontSize: 11, color: "var(--text-muted)" }}>
                <span>📐 {(qualityInfo.megapixels).toFixed(2)} MP</span>
                <span>☀️ Brightness: {Math.round(qualityInfo.avgBrightness)}/255</span>
                <span>🔍 Detail: {Math.round(qualityInfo.variance)}</span>
              </div>
            </div>
          )}

          <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <CheckCircle size={18} color={file ? "var(--success)" : "var(--text-muted)"} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{file?.name || "Checking..."}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB • Ready to analyze` : "Quality check in progress"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hard error */}
      {error && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 16px", marginTop: 12, background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, color: "#B91C1C", fontSize: 14 }}>
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Soft warning */}
      {warning && !error && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 16px", marginTop: 12, background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 10, color: "#92400E", fontSize: 13 }}>
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{warning}</span>
        </div>
      )}

      {/* Photo tips */}
      <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[
          { icon: "☀️", tip: "Daytime, natural lighting — avoid night photos" },
          { icon: "📐", tip: "Capture the full front facade top-to-bottom" },
          { icon: "🎯", tip: "Front-facing straight-on shot works best" },
          { icon: "📏", tip: "Include gate, compound wall and surroundings" }
        ].map(({ icon, tip }) => (
          <div key={tip} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "12px 14px", background: "var(--brand-pale)", borderRadius: 10, fontSize: 13, color: "var(--text-secondary)" }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
            <span>{tip}</span>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: 32 }}>
        <button
          className="btn btn-primary btn-lg"
          disabled={!file || checking}
          onClick={() => file && onImageReady(file, preview)}
        >
          {checking ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <ImageIcon size={18} />}
          {checking ? "Checking quality..." : "Analyze House Structure"}
        </button>
      </div>
    </div>
  );
}
