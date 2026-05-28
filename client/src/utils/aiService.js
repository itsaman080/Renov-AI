// All API calls to the backend proxy which calls Groq

const API_BASE = "";  // Uses CRA proxy to localhost:3001

export async function analyzeHouseImage(file) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${API_BASE}/api/analyze-house`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  if (!data.success) throw new Error(data.error || "Analysis failed");
  return data.analysis;
}

export async function generateRedesign(file, materialSelections, zones) {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("data", JSON.stringify({ materialSelections, zones }));

  const response = await fetch(`${API_BASE}/api/generate-redesign`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  if (!data.success) throw new Error(data.error || "Redesign generation failed");
  return data.redesign;
}

export async function generateCostReport(materialQuantities, customRates, projectDetails) {
  const response = await fetch(`${API_BASE}/api/generate-cost-report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ materialQuantities, customRates, projectDetails }),
  });

  const data = await response.json();
  if (!data.success) throw new Error(data.error || "Cost report generation failed");
  return data.costReport;
}
