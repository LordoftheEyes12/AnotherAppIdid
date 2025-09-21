// ---------- Theme (manual toggle wins) ----------
const root = document.documentElement;
const THEME_KEY = "apfelsaft-theme";

function applySavedTheme(){
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "light" || saved === "dark") {
    root.setAttribute("data-theme", saved);
  } else {
    root.removeAttribute("data-theme"); // fall back to system
  }
}
applySavedTheme();

const toggleBtn = document.getElementById("themeToggle");
if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    const current = root.getAttribute("data-theme"); // "light" | "dark" | null
    const next = current === "dark" ? "light" : "dark"; // just flip
    root.setAttribute("data-theme", next);
    localStorage.setItem(THEME_KEY, next);
  });
}

// ---------- Utilities ----------
function normalizeArticles(rows) {
  if (!rows || !Array.isArray(rows)) return [];
  if (rows.length && Array.isArray(rows[0])) {
    return rows.map(r => ({ title: r[0], content: r[1] }));
  }
  return rows.map(r => ({ title: r.title, content: r.content }));
}
function snippet(text, max = 220) {
  if (!text) return "";
  const clean = String(text).replace(/\s+/g, " ").trim();
  return clean.length > max ? clean.slice(0, max - 1) + "…" : clean;
}
function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[m]);
}
function toReaderHTML(text) {
  const trimmed = String(text || "").replace(/^\s+/, "").replace(/\s+$/, "");
  const paras = trimmed
    .split(/\n{2,}/)
    .map(p => `<p>${escapeHTML(p).replace(/\n/g, "<br>")}</p>`)
    .join("");
  return paras || "<p></p>";
}

// ---------- DOM ----------
const grid = document.getElementById("articlesGrid");
const emptyState = document.getElementById("emptyState");
const refreshBtn = document.getElementById("refreshBtn");
const viewer = document.getElementById("viewer");
const viewerTitle = document.getElementById("viewerTitle");
const viewerContent = document.getElementById("viewerContent");
const viewerClose = document.getElementById("viewerClose");

// ---------- State ----------
let currentArticles = [];

// ---------- Render ----------
function renderArticles(list) {
  grid.innerHTML = "";
  if (!list.length) {
    emptyState.classList.remove("hidden");
    return;
  }
  emptyState.classList.add("hidden");
  const tpl = document.getElementById("articleCardTpl");
  list.forEach(({ title, content }) => {
    const node = tpl.content.firstElementChild.cloneNode(true);
    node.querySelector(".card-title").textContent = title;
    node.querySelector(".card-snippet").textContent = snippet(content, 220);
    node.querySelector(".card-open").addEventListener("click", () => openViewer(title, content));
    node.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openViewer(title, content); }
    });
    grid.appendChild(node);
  });
}

function openViewer(title, content) {
  viewerTitle.textContent = title;
  viewerContent.innerHTML = toReaderHTML(content);
  (viewer.showModal ? viewer.showModal() : viewer.setAttribute("open",""));
}
function closeViewer(){ if (viewer.open) viewer.close(); }
viewerClose?.addEventListener("click", closeViewer);
viewer?.addEventListener("click", (e) => {
  const rect = viewer.querySelector(".reader")?.getBoundingClientRect?.();
  if (!rect) return;
  const outside = e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom;
  if (outside) closeViewer();
});
window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeViewer(); });

// ---------- Data ----------
async function fetchAll() {
  const res = await fetch("/readArticle", { headers: { "Accept": "application/json" } });
  if (!res.ok) throw new Error(`Failed to fetch articles: ${res.status}`);
  const raw = await res.json();
  const list = normalizeArticles(raw);
  currentArticles = list;
  renderArticles(list);
}

// ---------- Events ----------
refreshBtn?.addEventListener("click", () => fetchAll().catch(console.error));

// ---------- Init ----------
fetchAll().catch(err => { console.error(err); renderArticles([]); });
