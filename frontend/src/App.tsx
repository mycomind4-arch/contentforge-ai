import { useState, useEffect, useRef, useCallback } from "react";
import { marked } from "marked";

// ─── Types ─────────────────────────────────────────────
type View = "dashboard" | "projects" | "ai-writer" | "templates" | "rewrite" | "seo" | "images" | "brand-voice" | "integrations" | "settings" | "editor";

type Project = {
  id: string;
  title: string;
  topic: string;
  type: string;
  tone: string;
  content: string;
  outline: { id: string; title: string; summary: string }[];
  createdDate: string;
  updatedDate: string;
  status: "draft" | "published";
};

type ContentType = "blog" | "review" | "listicle" | "howto";
type Tone = "professional" | "casual" | "enthusiastic" | "authoritative";
type Length = "short" | "medium" | "long";

const API_URL = "https://solas-c81d5219.base44.app/functions/aiGenerate";
const IMAGE_API_URL = "https://solas-c81d5219.base44.app/functions/aiImage";
const SEARCH_API_URL = "https://solas-c81d5219.base44.app/functions/searchImages";

const contentTypeLabels: Record<ContentType, string> = {
  blog: "Blog Post",
  review: "Product Review",
  listicle: "Listicle",
  howto: "How-To Guide",
};

// ─── Storage helpers ──────────────────────────────────
function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem("contentforge_projects");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveProjects(projects: Project[]) {
  localStorage.setItem("contentforge_projects", JSON.stringify(projects));
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ─── Markdown utilities ────────────────────────────────
function getImagesFromMarkdown(md: string): { alt: string; url: string }[] {
  const images: { alt: string; url: string }[] = [];
  const regex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let match;
  while ((match = regex.exec(md)) !== null) {
    images.push({ alt: match[1], url: match[2] });
  }
  return images;
}

function replaceImageInMarkdown(md: string, index: number, newUrl: string, newAlt: string): string {
  let count = 0;
  return md.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, _alt, _url) => {
    if (count === index) {
      count++;
      return `![${newAlt}](${newUrl})`;
    }
    count++;
    return match;
  });
}


function replaceTextBlockInMarkdown(md: string, oldText: string, newText: string): string {
  return md.replace(oldText, newText);
}

// Configure marked for preview rendering
marked.setOptions({
  breaks: true,
  gfm: true,
});

// ─── App ───────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState<View>("dashboard");
  const [projects, setProjects] = useState<Project[]>(loadProjects);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  // Seed a sample project on first load
  useEffect(() => {
    if (projects.length === 0) {
      const sample: Project = {
        id: uid(),
        title: "Welcome to ContentForge AI",
        topic: "content marketing",
        type: "blog",
        tone: "professional",
        content: "# Welcome to ContentForge AI\n\nThis is your first project! Click **New Project** to generate AI content, or use the **AI Writer** tab to write from scratch.\n\n## Getting Started\n\n1. Click **New Project** in the sidebar\n2. Enter your topic and choose a content type\n3. Hit **Generate** and watch the AI write for you\n4. Edit the content in the built-in editor\n5. Export or publish when you're happy\n\n## Features\n\n- AI content generation\n- Multiple content types (blog, review, how-to, listicle)\n- Tone and length controls\n- Built-in rich text editor\n- Auto-save to your browser",
        outline: [
          { id: "intro", title: "Introduction", summary: "Welcome to ContentForge AI." },
          { id: "getting-started", title: "Getting Started", summary: "How to create your first project." },
          { id: "features", title: "Features", summary: "What ContentForge can do." },
        ],
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
        status: "draft",
      };
      setProjects([sample]);
    }
  }, []); // eslint-disable-line

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const handleCreateProject = (project: Project) => {
    setProjects((prev) => [project, ...prev]);
    setActiveProject(project);
    setView("editor");
    setShowNewProject(false);
    showToast(`Created "${project.title}"`);
  };

  const handleOpenProject = (project: Project) => {
    setActiveProject(project);
    setView("editor");
  };

  const handleUpdateProject = (updates: Partial<Project>) => {
    if (!activeProject) return;
    const updated = { ...activeProject, ...updates, updatedDate: new Date().toISOString() };
    setActiveProject(updated);
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDeleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (activeProject?.id === id) {
      setActiveProject(null);
      setView("projects");
    }
    showToast("Project deleted");
  };

  const handlePublish = () => {
    if (!activeProject) return;
    handleUpdateProject({ status: "published" });
    showToast("Published successfully! 🚀");
  };

  const handleExport = () => {
    if (!activeProject) return;
    const blob = new Blob([activeProject.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeProject.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Exported as Markdown");
  };

  const navItems: { label: string; view: View; icon: React.ReactNode }[] = [
    { label: "Dashboard", view: "dashboard", icon: <DashboardIcon /> },
    { label: "Projects", view: "projects", icon: <FolderIcon /> },
    { label: "AI Writer", view: "ai-writer", icon: <PencilIcon /> },
    { label: "Templates", view: "templates", icon: <TemplateIcon /> },
    { label: "Rewrite", view: "rewrite", icon: <RefreshIcon /> },
    { label: "SEO", view: "seo", icon: <GlobeIcon /> },
    { label: "Image Library", view: "images", icon: <ImageIcon /> },
    { label: "Brand Voice", view: "brand-voice", icon: <VoiceIcon /> },
    { label: "Integrations", view: "integrations", icon: <SettingsIcon /> },
    { label: "Settings", view: "settings", icon: <SettingsIcon /> },
  ];

  return (
    <div className="app-shell">
      {/* ─── Sidebar ─── */}
      <aside className={`sidebar${sidebarOpen ? " is-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark" aria-hidden="true"><MarkIcon /></div>
          <div className="brand-copy"><span>ContentForge AI</span></div>
        </div>

        <button className="primary-action" type="button" onClick={() => setShowNewProject(true)}>
          <PlusIcon />
          <span>New Project</span>
        </button>

        <nav className="nav-list" aria-label="Primary">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`nav-item ${view === item.view ? "is-active" : ""}`}
              onClick={() => { setView(item.view); setSidebarOpen(false); }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <section className="plan-card">
          <div className="plan-badge">
            <RocketIcon />
            <div>
              <strong>Unlimited Plan</strong>
              <p>Resets in 23 days</p>
            </div>
          </div>
          <div className="usage-row">
            <span>Words</span>
            <strong>{(projects.reduce((a, p) => a + p.content.split(/\s+/).length, 0)).toLocaleString()} / 10M</strong>
          </div>
          <div className="usage-bar" aria-hidden="true"><span /></div>
          <button type="button" className="ghost-button" onClick={() => showToast("Upgrade coming soon!")}>
            Upgrade Plan
          </button>
        </section>

        <button type="button" className="profile-card" onClick={() => showToast("Profile menu coming soon!")}>
          <div className="avatar" aria-hidden="true">JD</div>
          <div className="profile-copy">
            <strong>John Doe</strong>
            <span>john@example.com</span>
          </div>
          <ChevronDownIcon />
        </button>
      </aside>

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} aria-hidden="true" />}

      {/* ─── Main content ─── */}
      <main className="workspace">
        {view !== "editor" && (
          <header className="topbar">
            <div className="topbar-left">
              <button type="button" className="menu-toggle" aria-label="Toggle sidebar" onClick={() => setSidebarOpen((v) => !v)}>
                <MenuIcon />
              </button>
              <div className="breadcrumbs">
                <strong style={{ textTransform: "capitalize" }}>{view.replace("-", " ")}</strong>
              </div>
            </div>
          </header>
        )}

        {/* ─── Dashboard ─── */}
        {view === "dashboard" && (
          <DashboardView projects={projects} onOpenProject={handleOpenProject} onNewProject={() => setShowNewProject(true)} />
        )}

        {/* ─── Projects ─── */}
        {view === "projects" && (
          <ProjectsView projects={projects} onOpenProject={handleOpenProject} onDeleteProject={handleDeleteProject} onNewProject={() => setShowNewProject(true)} />
        )}

        {/* ─── AI Writer ─── */}
        {view === "ai-writer" && (
          <AIWriterView
            onCreateProject={(project) => { handleCreateProject(project); }}
            showToast={showToast}
          />
        )}

        {/* ─── Editor ─── */}
        {view === "editor" && activeProject && (
          <EditorView
            project={activeProject}
            onUpdate={handleUpdateProject}
            onBack={() => { setView("projects"); setActiveProject(null); }}
            onPublish={handlePublish}
            onExport={handleExport}
            showToast={showToast}
          />
        )}

        {/* ─── Image Library ─── */}
        {view === "images" && (
          <ImageLibraryView showToast={showToast} />
        )}

        {/* ─── Placeholder views ─── */}
        {["templates", "rewrite", "seo", "brand-voice", "integrations", "settings"].includes(view) && (
          <div className="placeholder-panel" style={{ margin: "2rem", padding: "3rem" }}>
            <h2 style={{ textTransform: "capitalize" }}>{view.replace("-", " ")}</h2>
            <p>This section is coming soon. Use the AI Writer or New Project button to start creating content.</p>
            <button className="primary-action" style={{ marginTop: "1rem" }} onClick={() => setShowNewProject(true)}>
              <PlusIcon /><span>New Project</span>
            </button>
          </div>
        )}
      </main>

      {/* ─── New Project Modal ─── */}
      {showNewProject && (
        <NewProjectModal
          onClose={() => setShowNewProject(false)}
          onCreate={handleCreateProject}
        />
      )}

      {/* ─── Toast ─── */}
      {toast && (
        <div className="toast">{toast}</div>
      )}
    </div>
  );
}

// ─── Dashboard View ────────────────────────────────────
function DashboardView({ projects, onOpenProject, onNewProject }: {
  projects: Project[];
  onOpenProject: (p: Project) => void;
  onNewProject: () => void;
}) {
  const recent = [...projects].sort((a, b) => new Date(b.updatedDate).getTime() - new Date(a.updatedDate).getTime()).slice(0, 6);
  const totalWords = projects.reduce((a, p) => a + p.content.split(/\s+/).length, 0);
  const published = projects.filter((p) => p.status === "published").length;

  return (
    <div className="workspace-grid" style={{ display: "block", padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, margin: 0 }}>Dashboard</h1>
          <p style={{ color: "var(--muted-fg)", marginTop: ".25rem" }}>Welcome back! Here's your content overview.</p>
        </div>
        <button className="primary-action" onClick={onNewProject}>
          <PlusIcon /><span>New Project</span>
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <StatCard label="Total Projects" value={projects.length.toString()} />
        <StatCard label="Published" value={published.toString()} />
        <StatCard label="Drafts" value={(projects.length - published).toString()} />
        <StatCard label="Total Words" value={totalWords.toLocaleString()} />
      </div>

      {/* Recent projects */}
      <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "1rem" }}>Recent Projects</h2>
      {recent.length === 0 ? (
        <div className="empty-state">
          <p>No projects yet. Create your first one!</p>
          <button className="primary-action" onClick={onNewProject}><PlusIcon /><span>New Project</span></button>
        </div>
      ) : (
        <div className="project-grid">
          {recent.map((p) => (
            <div key={p.id} className="project-card" onClick={() => onOpenProject(p)}>
              <div className="project-card-type">{contentTypeLabels[p.type as ContentType] || p.type}</div>
              <h3>{p.title}</h3>
              <p className="project-card-topic">{p.topic}</p>
              <div className="project-card-meta">
                <span className={`status-badge ${p.status}`}>{p.status}</span>
                <span>{new Date(p.updatedDate).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel" style={{ padding: "1.25rem" }}>
      <p style={{ color: "var(--muted-fg)", fontSize: ".8rem", fontWeight: 500, margin: 0, textTransform: "uppercase", letterSpacing: ".05em" }}>{label}</p>
      <p style={{ fontSize: "1.75rem", fontWeight: 700, margin: ".5rem 0 0" }}>{value}</p>
    </div>
  );
}

// ─── Projects View ─────────────────────────────────────
function ProjectsView({ projects, onOpenProject, onDeleteProject, onNewProject }: {
  projects: Project[];
  onOpenProject: (p: Project) => void;
  onDeleteProject: (id: string) => void;
  onNewProject: () => void;
}) {
  const [search, setSearch] = useState("");
  const filtered = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.topic.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, margin: 0 }}>Projects</h1>
        <button className="primary-action" onClick={onNewProject}><PlusIcon /><span>New Project</span></button>
      </div>

      <input
        type="text"
        className="search-input"
        placeholder="Search projects..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%", marginBottom: "1.5rem", padding: ".75rem 1rem",
          background: "var(--panel-bg)", border: "1px solid var(--border)",
          borderRadius: "8px", color: "var(--fg)", fontSize: ".9rem", outline: "none"
        }}
      />

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>{search ? "No matching projects." : "No projects yet."}</p>
          {!search && <button className="primary-action" onClick={onNewProject}><PlusIcon /><span>New Project</span></button>}
        </div>
      ) : (
        <div className="project-grid">
          {filtered.map((p) => (
            <div key={p.id} className="project-card" onClick={() => onOpenProject(p)}>
              <div className="project-card-type">{contentTypeLabels[p.type as ContentType] || p.type}</div>
              <h3>{p.title}</h3>
              <p className="project-card-topic">{p.topic}</p>
              <div className="project-card-meta">
                <span className={`status-badge ${p.status}`}>{p.status}</span>
                <span>{new Date(p.updatedDate).toLocaleDateString()}</span>
              </div>
              <button
                className="project-card-delete"
                onClick={(e) => { e.stopPropagation(); onDeleteProject(p.id); }}
                aria-label="Delete project"
              >
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── AI Writer View ────────────────────────────────────
function AIWriterView({ onCreateProject, showToast }: {
  onCreateProject: (p: Project) => void;
  showToast: (msg: string) => void;
}) {
  const [topic, setTopic] = useState("");
  const [type, setType] = useState<ContentType>("blog");
  const [tone, setTone] = useState<Tone>("professional");
  const [length, setLength] = useState<Length>("medium");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ title: string; outline: any[]; content: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic first.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: topic, topic, type, tone, length }),
      });
      const data = await res.json();

      if (data.success) {
        setResult({ title: data.title, outline: data.outline, content: data.content });
        showToast("Content generated! ✨");
      } else {
        setError(data.error || "Generation failed. Please try again.");
      }
    } catch (err: any) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUseContent = () => {
    if (!result) return;
    const project: Project = {
      id: uid(),
      title: result.title,
      topic,
      type,
      tone,
      content: result.content,
      outline: result.outline,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      status: "draft",
    };
    onCreateProject(project);
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 700, margin: "0 0 .5rem" }}>AI Writer</h1>
      <p style={{ color: "var(--muted-fg)", marginBottom: "2rem" }}>Enter a topic and let AI generate structured content for you.</p>

      {/* Prompt panel */}
      <div className="panel" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
        <label style={{ display: "block", fontWeight: 600, marginBottom: ".5rem" }}>Topic / Prompt</label>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. The benefits of remote work for small businesses"
          rows={3}
          style={{
            width: "100%", padding: ".75rem", background: "var(--panel-bg)",
            border: "1px solid var(--border)", borderRadius: "8px",
            color: "var(--fg)", fontSize: ".9rem", resize: "vertical", outline: "none",
            fontFamily: "inherit"
          }}
        />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginTop: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: ".8rem", fontWeight: 600, marginBottom: ".4rem", color: "var(--muted-fg)" }}>Content Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as ContentType)} className="select-input">
              <option value="blog">Blog Post</option>
              <option value="review">Product Review</option>
              <option value="listicle">Listicle</option>
              <option value="howto">How-To Guide</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: ".8rem", fontWeight: 600, marginBottom: ".4rem", color: "var(--muted-fg)" }}>Tone</label>
            <select value={tone} onChange={(e) => setTone(e.target.value as Tone)} className="select-input">
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="enthusiastic">Enthusiastic</option>
              <option value="authoritative">Authoritative</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: ".8rem", fontWeight: 600, marginBottom: ".4rem", color: "var(--muted-fg)" }}>Length</label>
            <select value={length} onChange={(e) => setLength(e.target.value as Length)} className="select-input">
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
            </select>
          </div>
        </div>

        <button
          className="primary-action"
          onClick={handleGenerate}
          disabled={loading}
          style={{ marginTop: "1.25rem", width: "100%", justifyContent: "center" }}
        >
          {loading ? (
            <><SpinnerIcon /><span>Generating...</span></>
          ) : (
            <><SparklesIcon /><span>Generate Content</span></>
          )}
        </button>

        {error && (
          <div style={{ marginTop: "1rem", padding: ".75rem 1rem", background: "rgba(239, 68, 68, .1)", border: "1px solid rgba(239, 68, 68, .3)", borderRadius: "8px", color: "#ef4444", fontSize: ".85rem" }}>
            {error}
          </div>
        )}
      </div>

      {/* Result panel */}
      {loading && !result && (
        <div className="panel" style={{ padding: "3rem", textAlign: "center" }}>
          <div style={{ display: "inline-block" }}>
            <SpinnerIcon />
          </div>
          <p style={{ color: "var(--muted-fg)", marginTop: "1rem" }}>AI is writing your content...</p>
        </div>
      )}

      {result && (
        <div className="panel" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
            <div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0 0 .25rem" }}>{result.title}</h2>
              <p style={{ color: "var(--muted-fg)", fontSize: ".85rem", margin: 0 }}>
                {result.outline.length} sections · {result.content.split(/\s+/).length} words
              </p>
            </div>
            <button className="primary-action" onClick={handleUseContent}>
              <PlusIcon /><span>Use This Content</span>
            </button>
          </div>

          {/* Outline */}
          <div style={{ marginBottom: "1rem" }}>
            <h3 style={{ fontSize: ".85rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--muted-fg)", marginBottom: ".5rem" }}>Generated Outline</h3>
            {result.outline.map((s, i) => (
              <div key={s.id} style={{ display: "flex", gap: ".5rem", padding: ".4rem 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ color: "var(--muted-fg)", minWidth: "1.5rem" }}>{i + 1}.</span>
                <div>
                  <strong style={{ fontSize: ".9rem" }}>{s.title}</strong>
                  <p style={{ fontSize: ".8rem", color: "var(--muted-fg)", margin: ".2rem 0 0" }}>{s.summary}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Content preview */}
          <div style={{ background: "var(--panel-bg)", borderRadius: "8px", padding: "1.25rem", maxHeight: "400px", overflow: "auto", whiteSpace: "pre-wrap", fontSize: ".9rem", lineHeight: 1.7 }}>
            {result.content}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Editor View ───────────────────────────────────────
function EditorView({ project, onUpdate, onBack, onPublish, onExport, showToast }: {
  project: Project;
  onUpdate: (updates: Partial<Project>) => void;
  onBack: () => void;
  onPublish: () => void;
  onExport: () => void;
  showToast: (msg: string) => void;
}) {
  const [content, setContent] = useState(project.content);
  const [title, setTitle] = useState(project.title);
  const [editorMode, setEditorMode] = useState<"editor" | "preview">("preview");
  const [rightPanel, setRightPanel] = useState<"chat" | "images" | "selection">("chat");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [saved, setSaved] = useState(true);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Image generation state
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<{ prompt: string; url: string }[]>([]);

  // Image selection state
  const [selectedImage, setSelectedImage] = useState<{ index: number; alt: string; url: string } | null>(null);
  const [selectionTab, setSelectionTab] = useState<"ai" | "opensource">("ai");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ url: string; thumb: string; title: string; license: string; source: string }[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [altImages, setAltImages] = useState<string[]>([]);

  // Text rewrite state
  const [rewriteTarget, setRewriteTarget] = useState<string | null>(null);
  const [rewriteInstruction, setRewriteInstruction] = useState("");
  const [rewriteLoading, setRewriteLoading] = useState(false);

  // Auto-fill images
  const [autoFillLoading, setAutoFillLoading] = useState(false);

  // Auto-save
  useEffect(() => {
    setSaved(false);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      onUpdate({ title, content });
      setSaved(true);
    }, 800);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [title, content]); // eslint-disable-line

  const wordCount = content.split(/\s+/).filter(Boolean).length;

  // ─── AI Chat ───
  const handleAiChat = async () => {
    if (!aiPrompt.trim() || aiLoading) return;
    const userMsg = aiPrompt.trim();
    setAiMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setAiPrompt("");
    setAiLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userMsg,
          context: `Title: ${title}, Topic: ${project.topic}, Type: ${project.type}, Tone: ${project.tone}`,
          mode: "chat",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiMessages((prev) => [...prev, { role: "assistant", text: data.content }]);
        // If the response looks like content (has markdown headings), offer to insert
        const hasMarkdown = data.content.match(/^#{1,6}\s/m) || data.content.length > 200;
        if (hasMarkdown) {
          setContent((prev) => prev + "\n\n" + data.content.replace(/^#\s+.+\n/, "").trim());
          showToast("Content added to editor");
        }
      } else {
        setAiMessages((prev) => [...prev, { role: "assistant", text: `Sorry, I couldn't generate a response: ${data.error}` }]);
      }
    } catch {
      setAiMessages((prev) => [...prev, { role: "assistant", text: "Network error. Please try again." }]);
    } finally {
      setAiLoading(false);
    }
  };

  const insertAiContent = (text: string) => {
    const cleaned = text.replace(/^#\s+.+\n/, "").trim();
    setContent((prev) => prev + "\n\n" + cleaned);
    showToast("Content inserted into editor");
  };

  // ─── AI Image Generation ───
  const handleGenerateImage = async (prompt?: string) => {
    const p = (prompt || imagePrompt).trim();
    if (!p || imageLoading) return;
    if (!prompt) setImagePrompt("");
    setImageLoading(true);
    try {
      const res = await fetch(IMAGE_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: p }),
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedImages((prev) => [{ prompt: p, url: data.image }, ...prev]);
        if (selectedImage && prompt) {
          setAltImages((prev) => [data.image, ...prev]);
        }
        showToast("Image generated! ✨");
      } else {
        showToast(data.error || "Image generation failed");
      }
    } catch {
      showToast("Network error generating image");
    } finally {
      setImageLoading(false);
    }
  };

  const insertImage = (url: string, alt: string) => {
    const md = `\n\n![${alt}](${url})\n`;
    setContent((prev) => prev + md);
    showToast("Image inserted into editor");
  };

  // ─── Image Selection ───
  const handleImageClick = (index: number, alt: string, url: string) => {
    setSelectedImage({ index, alt, url });
    setSearchQuery(alt);
    setAltImages([]);
    setSelectionTab("ai");
    setRightPanel("selection");
    // Auto-search open source images
    handleSearchImages(alt);
    // Auto-generate an AI alternative
    handleGenerateImage(alt);
  };

  const handleSearchImages = async (query: string) => {
    if (!query.trim()) return;
    setSearchLoading(true);
    try {
      const res = await fetch(SEARCH_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.images || []);
      }
    } catch {
      showToast("Image search failed");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleReplaceImage = (newUrl: string, newAlt: string) => {
    if (!selectedImage) return;
    const updated = replaceImageInMarkdown(content, selectedImage.index, newUrl, newAlt);
    setContent(updated);
    setSelectedImage({ ...selectedImage, url: newUrl, alt: newAlt });
    showToast("Image replaced");
  };

  // ─── Text Rewrite ───
  const handleRewriteBlock = async () => {
    if (!rewriteTarget || rewriteLoading) return;
    setRewriteLoading(true);
    try {
      const instruction = rewriteInstruction.trim() || "Rewrite this to be clearer and more engaging:";
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "rewrite", text: rewriteTarget, instruction }),
      });
      const data = await res.json();
      if (data.success) {
        const updated = replaceTextBlockInMarkdown(content, rewriteTarget, data.content);
        setContent(updated);
        showToast("Text rewritten ✨");
      } else {
        showToast(data.error || "Rewrite failed");
      }
    } catch {
      showToast("Network error during rewrite");
    } finally {
      setRewriteLoading(false);
      setRewriteTarget(null);
      setRewriteInstruction("");
    }
  };

  // ─── Auto-fill Images ───
  const handleAutoFillImages = async () => {
    setAutoFillLoading(true);
    const headings = content.match(/^#{2,3}\s+.+$/gm) || [];
    const images = getImagesFromMarkdown(content);
    const existingCount = images.length;

    for (let i = 0; i < headings.length; i++) {
      const heading = headings[i].replace(/^#{2,3}\s+/, "");
      // Skip if there's already an image near this heading
      if (i < existingCount) continue;
      try {
        const res = await fetch(SEARCH_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: heading }),
        });
        const data = await res.json();
        if (data.success && data.images?.[0]) {
          const img = data.images[0];
          const imgMd = `\n\n![${heading}](${img.url})\n`;
          // Insert after the heading line
          const lines = content.split("\n");
          for (let j = 0; j < lines.length; j++) {
            if (lines[j].trim() === headings[i].trim()) {
              lines.splice(j + 1, 0, imgMd.trim());
              break;
            }
          }
          setContent(lines.join("\n"));
        }
      } catch { /* skip on error */ }
      // Small delay to avoid rate limiting
      await new Promise((r) => setTimeout(r, 300));
    }
    setAutoFillLoading(false);
    showToast("Auto-filled images for content sections");
  };

  // ─── Preview click handlers ───
  useEffect(() => {
    if (editorMode !== "preview" || !previewRef.current) return;
    const container = previewRef.current;

    // Image click handlers
    const imgs = container.querySelectorAll("img");
    imgs.forEach((img, i) => {
      img.style.cursor = "pointer";
      img.classList.add("preview-img");
      img.onclick = (e) => {
        e.stopPropagation();
        handleImageClick(i, img.alt || "image", img.src);
      };
    });

    // Text block click handlers
    const blocks = container.querySelectorAll("p, h1, h2, h3, h4, h5, h6, li");
    blocks.forEach((block) => {
      if (block.querySelector("img")) return; // Skip blocks with images
      block.classList.add("preview-text-block");
      (block as HTMLElement).onclick = (e) => {
        e.stopPropagation();
        const text = block.textContent || "";
        if (text.trim().length > 5) {
          setRewriteTarget(text.trim());
        }
      };
    });

    return () => {
      imgs.forEach((img) => { img.onclick = null; });
    };
  }, [content, editorMode]); // eslint-disable-line

  // Render preview HTML
  const previewHtml = editorMode === "preview" ? marked.parse(content) as string : "";

  // Apply formatting in editor
  const applyFormat = (format: string) => {
    const el = editorRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.substring(start, end);
    let wrapped = selected;
    switch (format) {
      case "bold": wrapped = `**${selected}**`; break;
      case "italic": wrapped = `*${selected}*`; break;
      case "h1": wrapped = `# ${selected}`; break;
      case "h2": wrapped = `## ${selected}`; break;
      case "h3": wrapped = `### ${selected}`; break;
      case "ul": wrapped = selected.split("\n").map((l) => `- ${l}`).join("\n"); break;
      case "link": wrapped = `[${selected}](url)`; break;
      default: break;
    }
    const newContent = content.substring(0, start) + wrapped + content.substring(end);
    setContent(newContent);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + wrapped.length, start + wrapped.length);
    }, 0);
    showToast(`Applied ${format}`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Topbar */}
      <header className="topbar" style={{ flexShrink: 0 }}>
        <div className="topbar-left">
          <button type="button" className="menu-toggle" aria-label="Toggle sidebar" onClick={() => {}}>
            <MenuIcon />
          </button>
          <div className="breadcrumbs">
            <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--muted-fg)", cursor: "pointer", fontSize: "inherit" }}>Projects</button>
            <ChevronRightIcon />
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled..."
              className="title-input"
              style={{ fontWeight: 700, fontSize: "1rem" }}
            />
          </div>
        </div>
        <div className="topbar-actions">
          <span style={{ fontSize: ".8rem", color: "var(--muted-fg)" }}>
            {saved ? "✓ Saved" : "Saving..."} · {wordCount} words
          </span>
          <button type="button" className="ghost-button" onClick={() => setEditorMode(editorMode === "editor" ? "preview" : "editor")}>
            {editorMode === "editor" ? <><EyeIcon /> <span>Preview</span></> : <><PencilIcon /> <span>Edit</span></>}
          </button>
          <button type="button" className="ghost-button" onClick={onExport}>
            <DownloadIcon />
            <span>Export</span>
          </button>
          <button type="button" className="primary-action" onClick={onPublish}>
            <RocketIcon />
            <span>Publish</span>
          </button>
        </div>
      </header>

      {/* Main editor area + right panel + tool rail */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 372px 72px", gap: "14px", flex: 1, overflow: "hidden", padding: "0 14px 14px 0" }}>
      {/* Editor / Preview area */}
      <section className="editor-main" style={{ display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
        {editorMode === "editor" ? (
          <>
            {/* Formatting toolbar */}
            <div className="format-toolbar" style={{ display: "flex", gap: ".25rem", padding: ".5rem 1rem", borderBottom: "1px solid var(--border)", background: "var(--panel-bg)" }}>
              {[
                { f: "bold", label: "B" },
                { f: "italic", label: "I" },
                { f: "h1", label: "H1" },
                { f: "h2", label: "H2" },
                { f: "h3", label: "H3" },
                { f: "ul", label: "• List" },
                { f: "link", label: "Link" },
              ].map(({ f, label }) => (
                <button key={f} type="button" className="format-btn" onClick={() => applyFormat(f)} style={{
                  padding: ".3rem .6rem", background: "none", border: "1px solid var(--border)", borderRadius: "6px",
                  color: "var(--fg)", fontSize: ".8rem", cursor: "pointer", fontWeight: 600,
                }}>{label}</button>
              ))}
              <div style={{ flex: 1 }} />
              <button type="button" className="format-btn" onClick={handleAutoFillImages} disabled={autoFillLoading} style={{
                padding: ".3rem .8rem", background: "var(--accent)", border: "none", borderRadius: "6px",
                color: "white", fontSize: ".8rem", cursor: "pointer", fontWeight: 600,
              }}>
                {autoFillLoading ? "Filling..." : "🖼 Auto-Fill Images"}
              </button>
            </div>
            <textarea
              ref={editorRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing or use the AI Chat to generate content..."
              style={{
                flex: 1, width: "100%", padding: "1.5rem", background: "transparent",
                border: "none", color: "var(--fg)", fontSize: ".95rem", lineHeight: 1.8,
                fontFamily: "monospace", resize: "none", outline: "none",
              }}
            />
          </>
        ) : (
          <div className="preview-container" ref={previewRef} style={{ flex: 1, overflow: "auto", padding: "2rem 3rem" }}>
            <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </div>
        )}

        {/* Rewrite floating panel */}
        {rewriteTarget && (
          <div className="rewrite-panel" style={{
            position: "fixed", bottom: "2rem", right: "2rem", zIndex: 100,
            background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "12px",
            padding: "1rem", boxShadow: "0 8px 24px rgba(0,0,0,.2)", maxWidth: "400px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ".5rem" }}>
              <strong style={{ fontSize: ".9rem" }}>✏️ Rewrite Block</strong>
              <button onClick={() => { setRewriteTarget(null); setRewriteInstruction(""); }} style={{ background: "none", border: "none", color: "var(--muted-fg)", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
            </div>
            <div style={{ fontSize: ".8rem", color: "var(--muted-fg)", marginBottom: ".5rem", maxHeight: "80px", overflow: "hidden", border: "1px solid var(--border)", borderRadius: "6px", padding: ".5rem", background: "var(--panel-bg)" }}>
              {rewriteTarget.slice(0, 200)}{rewriteTarget.length > 200 ? "..." : ""}
            </div>
            <input
              type="text"
              value={rewriteInstruction}
              onChange={(e) => setRewriteInstruction(e.target.value)}
              placeholder="How should I rewrite it? (optional)"
              style={{
                width: "100%", padding: ".5rem", marginBottom: ".5rem", background: "var(--panel-bg)",
                border: "1px solid var(--border)", borderRadius: "6px", color: "var(--fg)", fontSize: ".85rem", outline: "none",
              }}
            />
            <div style={{ display: "flex", gap: ".5rem" }}>
              <button type="button" className="primary-action" style={{ flex: 1, justifyContent: "center" }} onClick={handleRewriteBlock} disabled={rewriteLoading}>
                {rewriteLoading ? <><SpinnerIcon /><span>Rewriting...</span></> : <><RefreshIcon /><span>Rewrite</span></>}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Right panel: Chat / Images / Selection */}
      <aside className="image-panel panel" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div className="panel-tabs">
          <button type="button" className={`tab-button ${rightPanel === "chat" ? "is-active" : ""}`} onClick={() => setRightPanel("chat")}>AI Chat</button>
          <button type="button" className={`tab-button ${rightPanel === "images" ? "is-active" : ""}`} onClick={() => setRightPanel("images")}>AI Images</button>
          {selectedImage && (
            <button type="button" className={`tab-button ${rightPanel === "selection" ? "is-active" : ""}`} onClick={() => setRightPanel("selection")}>Selection</button>
          )}
        </div>

        {/* AI Chat */}
        {rightPanel === "chat" && (
          <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "1rem" }}>
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: ".75rem", marginBottom: ".75rem" }}>
              {aiMessages.length === 0 && (
                <div style={{ textAlign: "center", color: "var(--muted-fg)", padding: "2rem 1rem" }}>
                  <RobotIcon />
                  <p style={{ marginTop: ".5rem", fontSize: ".85rem" }}>Discuss your project with AI. Content will appear in the preview automatically.</p>
                </div>
              )}
              {aiMessages.map((msg, i) => (
                <div key={i} className={`ai-msg ${msg.role}`}>
                  <div className="ai-msg-text">{msg.text}</div>
                  {msg.role === "assistant" && (
                    <button className="ai-msg-action" onClick={() => insertAiContent(msg.text)}>
                      <PlusIcon /> Insert into editor
                    </button>
                  )}
                </div>
              ))}
              {aiLoading && (
                <div className="ai-msg assistant">
                  <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                    <SpinnerIcon /><span style={{ fontSize: ".85rem", color: "var(--muted-fg)" }}>AI is thinking...</span>
                  </div>
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: ".5rem" }}>
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAiChat(); }}
                placeholder="Ask AI to write..."
                style={{
                  flex: 1, padding: ".6rem .8rem", background: "var(--panel-bg)",
                  border: "1px solid var(--border)", borderRadius: "8px",
                  color: "var(--fg)", fontSize: ".85rem", outline: "none"
                }}
              />
              <button className="primary-action" style={{ padding: ".6rem .8rem" }} onClick={handleAiChat} disabled={aiLoading}>
                <SparklesIcon />
              </button>
            </div>
          </div>
        )}

        {/* AI Images */}
        {rightPanel === "images" && (
          <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "1rem" }}>
            <div style={{ display: "flex", gap: ".5rem", marginBottom: ".75rem" }}>
              <input
                type="text"
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleGenerateImage(); }}
                placeholder="Describe an image..."
                style={{
                  flex: 1, padding: ".6rem .8rem", background: "var(--panel-bg)",
                  border: "1px solid var(--border)", borderRadius: "8px",
                  color: "var(--fg)", fontSize: ".85rem", outline: "none"
                }}
              />
              <button className="primary-action" style={{ padding: ".6rem .8rem" }} onClick={() => handleGenerateImage()} disabled={imageLoading}>
                {imageLoading ? <SpinnerIcon /> : <ImageIcon />}
              </button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: ".75rem" }}>
              {imageLoading && generatedImages.length === 0 && (
                <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
                  <SpinnerIcon />
                  <p style={{ color: "var(--muted-fg)", fontSize: ".85rem", marginTop: ".5rem" }}>Generating image with FLUX AI...</p>
                </div>
              )}
              {generatedImages.length === 0 && !imageLoading && (
                <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
                  <ImageIcon />
                  <p style={{ color: "var(--muted-fg)", fontSize: ".85rem", marginTop: ".5rem" }}>Describe an image and generate it with FLUX AI.</p>
                </div>
              )}
              {generatedImages.map((img, i) => (
                <div key={i} style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border)" }}>
                  <img src={img.url} alt={img.prompt} style={{ width: "100%", display: "block" }} />
                  <div style={{ padding: ".5rem .75rem", background: "var(--panel-bg)" }}>
                    <p style={{ fontSize: ".75rem", color: "var(--muted-fg)", margin: "0 0 .4rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{img.prompt}</p>
                    <button
                      className="ai-msg-action"
                      style={{ width: "100%", justifyContent: "center" }}
                      onClick={() => insertImage(img.url, img.prompt)}
                    >
                      <PlusIcon /> Insert into editor
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Image Selection */}
        {rightPanel === "selection" && selectedImage && (
          <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "1rem" }}>
            {/* Current image */}
            <div style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border)", marginBottom: ".75rem" }}>
              <img src={selectedImage.url} alt={selectedImage.alt} style={{ width: "100%", display: "block" }} />
              <div style={{ padding: ".4rem .75rem", background: "var(--panel-bg)" }}>
                <p style={{ fontSize: ".75rem", color: "var(--muted-fg)", margin: 0 }}>Current image · {selectedImage.alt}</p>
              </div>
            </div>

            {/* Selection tabs */}
            <div style={{ display: "flex", gap: ".25rem", marginBottom: ".75rem" }}>
              <button
                type="button"
                style={{
                  flex: 1, padding: ".4rem", borderRadius: "6px", fontSize: ".8rem", fontWeight: 600, cursor: "pointer",
                  background: selectionTab === "ai" ? "var(--accent)" : "var(--panel-bg)",
                  border: "1px solid var(--border)", color: selectionTab === "ai" ? "white" : "var(--fg)",
                }}
                onClick={() => setSelectionTab("ai")}
              >AI Generated</button>
              <button
                type="button"
                style={{
                  flex: 1, padding: ".4rem", borderRadius: "6px", fontSize: ".8rem", fontWeight: 600, cursor: "pointer",
                  background: selectionTab === "opensource" ? "var(--accent)" : "var(--panel-bg)",
                  border: "1px solid var(--border)", color: selectionTab === "opensource" ? "white" : "var(--fg)",
                }}
                onClick={() => setSelectionTab("opensource")}
              >Open Source</button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: ".5rem" }}>
              {selectionTab === "ai" ? (
                <>
                  <button
                    className="primary-action"
                    style={{ justifyContent: "center", marginBottom: ".5rem" }}
                    onClick={() => handleGenerateImage(selectedImage.alt)}
                    disabled={imageLoading}
                  >
                    {imageLoading ? <><SpinnerIcon /><span>Generating...</span></> : <><SparklesIcon /><span>Regenerate with FLUX</span></>}
                  </button>
                  {altImages.map((url, i) => (
                    <div key={i} style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border)", cursor: "pointer" }}
                      onClick={() => handleReplaceImage(url, selectedImage.alt)}
                    >
                      <img src={url} alt="AI alternative" style={{ width: "100%", display: "block" }} />
                      <div style={{ padding: ".3rem .6rem", background: "var(--panel-bg)", textAlign: "center" }}>
                        <span style={{ fontSize: ".75rem", color: "var(--muted-fg)" }}>Click to use this</span>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <div style={{ display: "flex", gap: ".5rem", marginBottom: ".5rem" }}>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleSearchImages(searchQuery); }}
                      placeholder="Search open source..."
                      style={{
                        flex: 1, padding: ".4rem .6rem", background: "var(--panel-bg)",
                        border: "1px solid var(--border)", borderRadius: "6px",
                        color: "var(--fg)", fontSize: ".8rem", outline: "none",
                      }}
                    />
                    <button
                      className="ghost-button"
                      style={{ padding: ".4rem .6rem", fontSize: ".8rem" }}
                      onClick={() => handleSearchImages(searchQuery)}
                      disabled={searchLoading}
                    >
                      {searchLoading ? "..." : "Search"}
                    </button>
                  </div>
                  {searchResults.map((img, i) => (
                    <div key={i} style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border)", cursor: "pointer" }}
                      onClick={() => handleReplaceImage(img.url, img.title)}
                    >
                      <img src={img.url} alt={img.title} style={{ width: "100%", display: "block", maxHeight: "200px", objectFit: "cover" }} />
                      <div style={{ padding: ".3rem .6rem", background: "var(--panel-bg)" }}>
                        <p style={{ fontSize: ".7rem", color: "var(--muted-fg)", margin: 0 }}>{img.license} · {img.source}</p>
                      </div>
                    </div>
                  ))}
                  {!searchLoading && searchResults.length === 0 && (
                    <p style={{ textAlign: "center", color: "var(--muted-fg)", fontSize: ".85rem", padding: "1rem" }}>No results yet. Try searching above.</p>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </aside>

      {/* Tool rail */}
      <aside className="tool-rail" aria-label="Workspace tools">
        {[
          { label: "AI Chat", icon: <RobotIcon />, tool: "chat" },
          { label: "Images", icon: <ImageIcon />, tool: "images" },
          { label: "Text", icon: <TextIcon />, tool: "text" },
          { label: "SEO", icon: <MeterIcon />, tool: "seo" },
          { label: "Notes", icon: <NoteIcon />, tool: "notes" },
        ].map(({ label, icon, tool }) => (
          <button
            key={label}
            type="button"
            className={`tool-rail-btn ${rightPanel === tool || (tool === "chat" && rightPanel === "selection") ? "is-active" : ""}`}
            aria-label={label}
            onClick={() => {
              if (tool === "chat") setRightPanel("chat");
              else if (tool === "images") setRightPanel("images");
              else showToast(`${label} tools coming soon`);
            }}
          >
            {icon}
          </button>
        ))}
      </aside>
      </div>

      {/* Floating quick action */}
      <button type="button" className="floating-action" aria-label="Open quick actions" onClick={() => setRightPanel("chat")}>
        <SparklesIcon />
      </button>
    </div>
  );
}



// ─── New Project Modal ─────────────────────────────────
function NewProjectModal({ onClose, onCreate }: {
  onClose: () => void;
  onCreate: (p: Project) => void;
}) {
  const [topic, setTopic] = useState("");
  const [type, setType] = useState<ContentType>("blog");
  const [tone, setTone] = useState<Tone>("professional");
  const [length, setLength] = useState<Length>("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: topic, topic, type, tone, length }),
      });
      const data = await res.json();

      if (data.success) {
        const project: Project = {
          id: uid(),
          title: data.title,
          topic,
          type,
          tone,
          content: data.content,
          outline: data.outline,
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString(),
          status: "draft",
        };
        onCreate(project);
      } else {
        setError(data.error || "Generation failed.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>New Project</h2>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div style={{ padding: ".75rem 1rem", background: "rgba(239, 68, 68, .1)", border: "1px solid rgba(239, 68, 68, .3)", borderRadius: "8px", color: "#ef4444", fontSize: ".85rem", marginBottom: "1rem" }}>
              {error}
            </div>
          )}

          <label style={{ display: "block", fontWeight: 600, marginBottom: ".5rem" }}>Topic</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Benefits of meditation for productivity"
            autoFocus
            onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
            className="modal-input"
          />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginTop: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: ".8rem", fontWeight: 600, marginBottom: ".4rem", color: "var(--muted-fg)" }}>Type</label>
              <select value={type} onChange={(e) => setType(e.target.value as ContentType)} className="modal-input">
                <option value="blog">Blog Post</option>
                <option value="review">Review</option>
                <option value="listicle">Listicle</option>
                <option value="howto">How-To</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: ".8rem", fontWeight: 600, marginBottom: ".4rem", color: "var(--muted-fg)" }}>Tone</label>
              <select value={tone} onChange={(e) => setTone(e.target.value as Tone)} className="modal-input">
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="enthusiastic">Enthusiastic</option>
                <option value="authoritative">Authoritative</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: ".8rem", fontWeight: 600, marginBottom: ".4rem", color: "var(--muted-fg)" }}>Length</label>
              <select value={length} onChange={(e) => setLength(e.target.value as Length)} className="modal-input">
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="long">Long</option>
              </select>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="ghost-button" onClick={onClose} disabled={loading}>Cancel</button>
          <button type="button" className="primary-action" onClick={handleCreate} disabled={loading}>
            {loading ? <><SpinnerIcon /><span>Generating...</span></> : <><SparklesIcon /><span>Generate & Create</span></>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Image Library View ────────────────────────────────
function ImageLibraryView({ showToast }: { showToast: (msg: string) => void }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<{ prompt: string; url: string }[]>(() => {
    try {
      const raw = sessionStorage.getItem("contentforge_images");
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem("contentforge_images", JSON.stringify(images.slice(0, 20)));
    } catch { /* sessionStorage might be full with large base64 */ }
  }, [images]);

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    const p = prompt.trim();
    setPrompt("");
    setLoading(true);
    try {
      const res = await fetch(IMAGE_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: p }),
      });
      const data = await res.json();
      if (data.success) {
        setImages((prev) => [{ prompt: p, url: data.image }, ...prev].slice(0, 20));
        showToast("Image generated! ✨");
      } else {
        showToast(data.error || "Image generation failed");
      }
    } catch {
      showToast("Network error generating image");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (url: string, prompt: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = prompt.replace(/[^a-z0-9]/gi, "-").toLowerCase().slice(0, 40) + ".png";
    a.click();
    showToast("Image downloaded");
  };

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text).then(() => showToast("Prompt copied"));
  };

  const handleDelete = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    showToast("Image removed");
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1100px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 700, margin: "0 0 .5rem" }}>Image Library</h1>
      <p style={{ color: "var(--muted-fg)", marginBottom: "2rem" }}>Generate stunning images with FLUX AI. Powered by Cloudflare Workers AI.</p>

      {/* Prompt panel */}
      <div className="panel" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
        <label style={{ display: "block", fontWeight: 600, marginBottom: ".5rem" }}>Image Prompt</label>
        <div style={{ display: "flex", gap: ".75rem" }}>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleGenerate(); }}
            placeholder="e.g. A serene mountain landscape at sunset, digital art style"
            className="modal-input"
            style={{ flex: 1 }}
          />
          <button className="primary-action" onClick={handleGenerate} disabled={loading} style={{ flexShrink: 0 }}>
            {loading ? <><SpinnerIcon /><span>Generating...</span></> : <><ImageIcon /><span>Generate</span></>}
          </button>
        </div>
        <p style={{ fontSize: ".8rem", color: "var(--muted-fg)", marginTop: ".75rem" }}>Tip: Be descriptive — include style, mood, lighting, and composition for best results.</p>
      </div>

      {/* Loading state */}
      {loading && images.length === 0 && (
        <div className="panel" style={{ padding: "3rem", textAlign: "center" }}>
          <SpinnerIcon />
          <p style={{ color: "var(--muted-fg)", marginTop: "1rem" }}>FLUX AI is creating your image...</p>
        </div>
      )}

      {/* Empty state */}
      {images.length === 0 && !loading && (
        <div className="empty-state">
          <ImageIcon />
          <p style={{ marginTop: ".5rem", fontSize: ".95rem" }}>No images yet. Generate your first AI image above!</p>
        </div>
      )}

      {/* Image grid */}
      {images.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
          {images.map((img, i) => (
            <div key={i} className="panel" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ position: "relative", background: "var(--panel-bg)" }}>
                <img src={img.url} alt={img.prompt} style={{ width: "100%", display: "block" }} />
                <button
                  onClick={() => handleDelete(i)}
                  aria-label="Delete image"
                  style={{
                    position: "absolute", top: ".5rem", right: ".5rem",
                    background: "rgba(0,0,0,.6)", border: "none", borderRadius: "6px",
                    padding: ".3rem .4rem", cursor: "pointer", color: "white",
                    fontSize: ".75rem"
                  }}
                >✕</button>
              </div>
              <div style={{ padding: ".75rem 1rem" }}>
                <p style={{ fontSize: ".8rem", color: "var(--muted-fg)", margin: "0 0 .5rem", lineHeight: 1.4, maxHeight: "2.8rem", overflow: "hidden" }}>{img.prompt}</p>
                <div style={{ display: "flex", gap: ".5rem" }}>
                  <button className="ghost-button" style={{ flex: 1, fontSize: ".8rem", padding: ".4rem" }} onClick={() => handleDownload(img.url, img.prompt)}>
                    Download
                  </button>
                  <button className="ghost-button" style={{ flex: 1, fontSize: ".8rem", padding: ".4rem" }} onClick={() => handleCopyPrompt(img.prompt)}>
                    Copy Prompt
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Icon Components ──────────────────────────────────
function EyeIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" /></svg>;
}

function DownloadIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 4v12m0 0-4-4m4 4 4-4M4 20h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}


function MarkIcon() {
  return (
    <svg viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <path d="M12 31.5C12 18.5 20.5 11 30 11c4.5 0 7.5 2 9 5" stroke="url(#mark-grad)" strokeWidth="4.4" strokeLinecap="round" />
      <path d="M14 22c1.2-4.9 5.4-8.2 11-8.2 4.7 0 8.9 2 11 5.8" stroke="url(#mark-grad)" strokeWidth="4.4" strokeLinecap="round" opacity="0.8" />
      <defs>
        <linearGradient id="mark-grad" x1="11" y1="11" x2="37" y2="33" gradientUnits="userSpaceOnUse">
          <stop stopColor="#b46cff" /><stop offset="1" stopColor="#635bff" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function PlusIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>;
}

function DashboardIcon() {
  return <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="3.5" y="3.5" width="5" height="5" rx="1.4" stroke="currentColor" strokeWidth="1.5" /><rect x="11.5" y="3.5" width="5" height="5" rx="1.4" stroke="currentColor" strokeWidth="1.5" /><rect x="3.5" y="11.5" width="5" height="5" rx="1.4" stroke="currentColor" strokeWidth="1.5" /><rect x="11.5" y="11.5" width="5" height="5" rx="1.4" stroke="currentColor" strokeWidth="1.5" /></svg>;
}

function FolderIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h3.3c.7 0 1.4.3 1.8.9l.9 1.1c.4.5 1 .8 1.7.8H18a2.5 2.5 0 0 1 2.5 2.5v6.2A2.5 2.5 0 0 1 18 19H6.5A2.5 2.5 0 0 1 4 16.5v-9Z" stroke="currentColor" strokeWidth="1.8" /></svg>;
}

function TemplateIcon() {
  return <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="3" y="3" width="6" height="9" rx="1.4" stroke="currentColor" strokeWidth="1.5" /><rect x="11" y="3" width="6" height="5" rx="1.4" stroke="currentColor" strokeWidth="1.5" /><rect x="3" y="14" width="6" height="3" rx="1.4" stroke="currentColor" strokeWidth="1.5" /><rect x="11" y="10" width="6" height="7" rx="1.4" stroke="currentColor" strokeWidth="1.5" /></svg>;
}

function PencilIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 16.9V20h3.1L18 9.1l-3.1-3.1L4 16.9Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M13.1 6l4.9 4.9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
}

function RefreshIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5.5 12a6.5 6.5 0 0 1 11-4.6L19 9.9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M19 5.5v4.5h-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M18.5 12a6.5 6.5 0 0 1-11 4.6L5 14.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M5 18.5V14H9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
}

function GlobeIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" /><path d="M4 12h16M12 4c2 2.2 3 4.8 3 8s-1 5.8-3 8c-2-2.2-3-4.8-3-8s1-5.8 3-8Z" stroke="currentColor" strokeWidth="1.4" /></svg>;
}

function ImageIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2.2" stroke="currentColor" strokeWidth="1.8" /><path d="M8 13.5 10.5 11l2.2 2.2 1.5-1.6L18 15.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><circle cx="9" cy="9" r="1.2" fill="currentColor" /></svg>;
}

function VoiceIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5a3 3 0 0 0-3 3v4a3 3 0 0 0 6 0V8a3 3 0 0 0-3-3Z" stroke="currentColor" strokeWidth="1.8" /><path d="M6 11v1.2a6 6 0 0 0 12 0V11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M12 18v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
}

function SettingsIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 8.1A3.9 3.9 0 1 0 12 15.9 3.9 3.9 0 0 0 12 8.1Zm7 3.9-.8.5a1.4 1.4 0 0 0-.5 1.8l.3.5a1.4 1.4 0 0 1-1.2 2l-.6-.1a1.4 1.4 0 0 0-1.4.7l-.2.6a1.4 1.4 0 0 1-2.2.7l-.5-.4a1.4 1.4 0 0 0-1.7 0l-.5.4a1.4 1.4 0 0 1-2.2-.7l-.2-.6a1.4 1.4 0 0 0-1.4-.7l-.6.1a1.4 1.4 0 0 1-1.2-2l.3-.5a1.4 1.4 0 0 0-.5-1.8L5 12a1.4 1.4 0 0 1 0-2.4l.8-.5a1.4 1.4 0 0 0 .5-1.8l-.3-.5a1.4 1.4 0 0 1 1.2-2l.6.1a1.4 1.4 0 0 0 1.4-.7l.2-.6a1.4 1.4 0 0 1 2.2-.7l.5.4a1.4 1.4 0 0 0 1.7 0l.5-.4a1.4 1.4 0 0 1 2.2.7l.2.6a1.4 1.4 0 0 0 1.4.7l.6-.1a1.4 1.4 0 0 1 1.2 2l-.3.5a1.4 1.4 0 0 0 .5 1.8l.8.5a1.4 1.4 0 0 1 0 2.4Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></svg>;
}

function RocketIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14.9 4.8c1.7-.4 3.5.1 4.7 1.3 1.2 1.2 1.7 3 1.3 4.7-.5 2.1-1.7 4.3-3.8 6.5l-2.5-2.5 3-3.1-1.6-1.6-3.1 3-2.5-2.5c2.2-2.2 4.3-3.4 6.5-3.8Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><path d="M6.8 15.2 4 18l2.8-.5.6 2.7 2.7-2.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /><circle cx="15.8" cy="8.2" r="1.2" fill="currentColor" /></svg>;
}

function RobotIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="5" y="6" width="14" height="11" rx="3" stroke="currentColor" strokeWidth="1.8" /><path d="M12 3.5v2.5M8.5 11h.1M15.5 11h.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M8 15.5c1 .8 2.3 1.2 4 1.2s3-.4 4-1.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
}

function TextIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 7h14M9 7v10M15 7v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
}

function MeterIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5.5 15a6.5 6.5 0 1 1 13 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M12 12l3.8-2.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><circle cx="12" cy="15" r="1.4" fill="currentColor" /></svg>;
}

function NoteIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 4.5h9l3 3V19a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 19V6A1.5 1.5 0 0 1 6 4.5Z" stroke="currentColor" strokeWidth="1.8" /><path d="M15 4.5V8h3.5M7 11h10M7 14h10M7 17h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>;
}

function ChevronDownIcon() {
  return <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m5 8 5 5 5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function ChevronRightIcon() {
  return <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m8 5 4 5-4 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function TrashIcon() {
  return <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4.5 6h11M8 6V4.8A.8.8 0 0 1 8.8 4h2.4a.8.8 0 0 1 .8.8V6m-6.2 0 .5 9A1.2 1.2 0 0 0 7.5 16h5a1.2 1.2 0 0 0 1.2-1l.5-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
}

function SparklesIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3.5 13.7 8l4.5 1.7-4.5 1.7L12 15.9l-1.7-4.5L5.8 9.7 10.3 8 12 3.5Z" fill="currentColor" /><path d="M18 14.5 18.7 16.4 20.5 17l-1.8.6-.7 1.9-.7-1.9-1.8-.6 1.8-.6.7-1.9Z" fill="currentColor" /></svg>;
}

function SpinnerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="spin">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
}

function MenuIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
}
