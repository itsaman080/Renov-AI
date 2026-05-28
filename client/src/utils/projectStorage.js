// ── Project persistence using localStorage ────────────────────────────────
// Saves all project state so the user can resume after closing the browser.

const STORAGE_KEY = "renovai_projects";
const CURRENT_KEY = "renovai_current_project";

export function saveProject(projectData) {
  try {
    const projects = loadAllProjects();
    const id = projectData.id || `proj_${Date.now()}`;
    const project = {
      ...projectData,
      id,
      savedAt: new Date().toISOString(),
      // Don't store the raw File object — store preview URL only
      imageFile: null,
    };
    projects[id] = project;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    localStorage.setItem(CURRENT_KEY, id);
    return id;
  } catch (e) {
    console.warn("Could not save project:", e);
    return null;
  }
}

export function loadAllProjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function loadProject(id) {
  const projects = loadAllProjects();
  return projects[id] || null;
}

export function loadLastProject() {
  const id = localStorage.getItem(CURRENT_KEY);
  if (!id) return null;
  return loadProject(id);
}

export function deleteProject(id) {
  try {
    const projects = loadAllProjects();
    delete projects[id];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    const currentId = localStorage.getItem(CURRENT_KEY);
    if (currentId === id) localStorage.removeItem(CURRENT_KEY);
  } catch (e) {
    console.warn("Could not delete project:", e);
  }
}

export function clearAllProjects() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(CURRENT_KEY);
}

export function formatSavedDate(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
