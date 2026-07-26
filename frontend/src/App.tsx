import { useState } from "react";

type NavItem = {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
};

type OutlineSection = {
  id: string;
  number?: string;
  title: string;
  summary: string;
};

type ToolItem = {
  label: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  { label: "Dashboard", icon: <DashboardIcon /> },
  { label: "Projects", icon: <FolderIcon />, active: true },
  { label: "Templates", icon: <TemplateIcon /> },
  { label: "AI Writer", icon: <PencilIcon /> },
  { label: "Rewrite", icon: <RefreshIcon /> },
  { label: "SEO", icon: <GlobeIcon /> },
  { label: "Image Library", icon: <ImageIcon /> },
  { label: "Brand Voice", icon: <VoiceIcon /> },
  { label: "Integrations", icon: <SettingsIcon /> },
  { label: "Settings", icon: <SettingsIcon /> },
];

const outlineSections: OutlineSection[] = [
  { id: "intro", title: "Introduction", summary: "Project overview and framing." },
  {
    id: "design-build",
    number: "1.",
    title: "Design & Build Quality",
    summary: "Premium materials, fit, and finish.",
  },
  {
    id: "display",
    number: "2.",
    title: "Display: Brighter and Sharper",
    summary: "Panel brightness, contrast, and smoothness.",
  },
  {
    id: "performance",
    number: "3.",
    title: "Performance & Hardware",
    summary: "Chipset, thermals, and durability.",
  },
  {
    id: "camera",
    number: "4.",
    title: "Camera System",
    summary: "Lens array and computational imaging.",
  },
  {
    id: "battery",
    number: "5.",
    title: "Battery Life & Charging",
    summary: "Runtime, charging speed, and efficiency.",
  },
  {
    id: "software",
    number: "6.",
    title: "Software & AI Features",
    summary: "On-device AI and productivity features.",
  },
  { id: "price", number: "7.", title: "Price & Variants", summary: "Colors, storage, and tiers." },
  { id: "pros", number: "8.", title: "Pros & Cons", summary: "Decision tradeoffs at a glance." },
  { id: "verdict", number: "9.", title: "Final Verdict", summary: "Recommendation and score." },
  { id: "faq", title: "FAQ", summary: "Quick answers to common questions." },
  { id: "conclusion", title: "Conclusion", summary: "Wrap-up and closing notes." },
];

const editorTabs = ["Editor", "Outline", "SEO", "Research", "Competitors"];
const imageTabs = ["AI Images", "Stock Images", "Uploads"];

const toolItems: ToolItem[] = [
  { label: "AI Chat", icon: <RobotIcon /> },
  { label: "Images", icon: <ImageIcon /> },
  { label: "Links", icon: <LinkIcon /> },
  { label: "Format", icon: <TextIcon /> },
  { label: "SEO Score", icon: <MeterIcon /> },
  { label: "Notes", icon: <NoteIcon /> },
  { label: "History", icon: <HistoryIcon /> },
];

const suggestionThumbs = [
  "deep graphite device angle",
  "green device on soft light",
  "silver device vertical crop",
  "rear camera cluster close-up",
];

export default function App() {
  const [selectedOutline, setSelectedOutline] = useState("design-build");
  const [selectedEditorTab, setSelectedEditorTab] = useState("Editor");
  const [selectedImageTab, setSelectedImageTab] = useState("AI Images");
  const [selectedTool, setSelectedTool] = useState("Images");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeSection =
    outlineSections.find((section) => section.id === selectedOutline) ??
    outlineSections[1];


  return (
    <div className="app-shell">
      <aside className={`sidebar${sidebarOpen ? " is-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <MarkIcon />
          </div>
          <div className="brand-copy">
            <span>ContentForge AI</span>
          </div>
        </div>

        <button className="primary-action" type="button">
          <PlusIcon />
          <span>New Project</span>
        </button>

        <nav className="nav-list" aria-label="Primary">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`nav-item ${item.active ? "is-active" : ""}`}
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
            <strong>2.4M / 10M</strong>
          </div>
          <div className="usage-bar" aria-hidden="true">
            <span />
          </div>

          <button type="button" className="ghost-button">
            Upgrade Plan
          </button>
        </section>

        <button type="button" className="profile-card">
          <div className="avatar" aria-hidden="true">
            JD
          </div>
          <div className="profile-copy">
            <strong>John Doe</strong>
            <span>john@example.com</span>
          </div>
          <ChevronDownIcon />
        </button>
      </aside>

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <main className="workspace">
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="menu-toggle"
              aria-label="Toggle sidebar"
              onClick={() => setSidebarOpen((v) => !v)}
            >
              <MenuIcon />
            </button>
            <div className="breadcrumbs">
            <span>Projects</span>
            <ChevronRightIcon />
            <strong>Samsung S25 Ultra Review</strong>
            </div>
          </div>

          <div className="topbar-actions">
            <div className="saved-state">
              <CheckCircleIcon />
              <span>Saved</span>
            </div>
            <button type="button" className="icon-button" aria-label="Undo">
              <UndoIcon />
            </button>
            <button type="button" className="icon-button" aria-label="Redo">
              <RedoIcon />
            </button>
            <button type="button" className="icon-button" aria-label="More">
              <MoreIcon />
            </button>
            <button type="button" className="menu-button">
              <span>Export</span>
              <ChevronDownIcon />
            </button>
            <button type="button" className="publish-button">
              <RocketIcon />
              <span>Publish</span>
            </button>
          </div>
        </header>

        <section className="workspace-grid">
          <aside className="outline-panel panel">
            <div className="panel-header">
              <h2>Document Outline</h2>
              <button type="button" className="icon-button small">
                <ExpandIcon />
              </button>
            </div>

            <div className="outline-list">
              {outlineSections.map((section) => {
                const isActive = section.id === selectedOutline;
                return (
                  <button
                    key={section.id}
                    type="button"
                    className={`outline-item ${isActive ? "is-active" : ""}`}
                    onClick={() => setSelectedOutline(section.id)}
                  >
                    <span className="outline-status" aria-hidden="true" />
                    <span className="outline-label">
                      {section.number ? `${section.number} ${section.title}` : section.title}
                    </span>
                  </button>
                );
              })}
            </div>

            <button type="button" className="add-section-button">
              <PlusIcon />
              <span>Add Section</span>
            </button>
          </aside>

          <section className="editor-panel panel">
            <div className="panel-tabs">
              {editorTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`tab-button ${tab === selectedEditorTab ? "is-active" : ""}`}
                  onClick={() => setSelectedEditorTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {selectedEditorTab === "Editor" ? (
              <>
                <div className="toolbar" aria-label="Text formatting">
                  <button type="button" className="select-button">
                    <span>Heading 2</span>
                    <ChevronDownIcon />
                  </button>
                  <div className="divider" />
                  <button type="button" className="toolbar-button is-strong">
                    <BoldIcon />
                  </button>
                  <button type="button" className="toolbar-button">
                    <ItalicIcon />
                  </button>
                  <button type="button" className="toolbar-button">
                    <UnderlineIcon />
                  </button>
                  <button type="button" className="toolbar-button">
                    <StrikeIcon />
                  </button>
                  <div className="divider" />
                  <button type="button" className="toolbar-button">
                    <ListIcon />
                  </button>
                  <button type="button" className="toolbar-button">
                    <ListBulletsIcon />
                  </button>
                  <button type="button" className="toolbar-button">
                    <AlignLeftIcon />
                  </button>
                  <button type="button" className="toolbar-button">
                    <AlignCenterIcon />
                  </button>
                  <button type="button" className="toolbar-button">
                    <AlignRightIcon />
                  </button>
                  <div className="divider" />
                  <button type="button" className="toolbar-button">
                    <LinkIcon />
                  </button>
                  <button type="button" className="toolbar-button">
                    <ImageIcon />
                  </button>
                  <button type="button" className="toolbar-button">
                    <TableIcon />
                  </button>
                  <button type="button" className="toolbar-button">
                    <MoreIcon />
                  </button>
                </div>

                <article className="article">
                  <h1>Samsung Galaxy S25 Ultra Review: The Ultimate Android Flagship?</h1>
                  <p className="lede">
                    The Samsung Galaxy S25 Ultra pushes the boundaries of smartphone innovation
                    with cutting-edge AI, a powerful camera system, and a stunning display. But
                    is it worth the upgrade? Let&apos;s find out.
                  </p>

                  <div className="section-head">
                    <div className="accent-bar" aria-hidden="true" />
                    <h2>
                      {activeSection.number ? `${activeSection.number} ${activeSection.title}` : activeSection.title}
                    </h2>
                    <div className="section-actions">
                      <button type="button" className="mini-action">
                        <ImageIcon />
                      </button>
                      <button type="button" className="mini-action">
                        <PencilIcon />
                      </button>
                      <button type="button" className="mini-action">
                        <TrashIcon />
                      </button>
                      <button type="button" className="mini-action">
                        <DragIcon />
                      </button>
                    </div>
                  </div>

                  <div className="section-content">
                    <div className="section-text">
                      <p>{activeSection.summary}</p>
                      <p>
                        The S25 Ultra continues Samsung&apos;s premium design language with a sleek
                        titanium frame, Gorilla Armor 2 protection, and IP68 resistance.
                      </p>
                    </div>

                    <div className="device-card device-card-dark" aria-label="Galaxy phone render">
                      <div className="device-topbar" />
                      <div className="device-camera-stack">
                        <span />
                        <span />
                        <span />
                        <span />
                      </div>
                      <div className="device-side" />
                      <div className="device-caption">Samsung Galaxy S25 Ultra in Titanium Black.</div>
                    </div>
                  </div>

                  <section className="image-section">
                    <h3>2. Display: Brighter and Sharper</h3>
                    <p>
                      The 6.9-inch Dynamic AMOLED 2X display is brighter than ever, offering vibrant
                      colors, deep blacks, and a buttery-smooth 120Hz refresh rate.
                    </p>
                    <div className="device-card device-card-scenic" aria-label="Landscape preview">
                      <div className="sky" />
                      <div className="mountains mountains-back" />
                      <div className="mountains mountains-front" />
                      <div className="display-phone">
                        <div className="display-phone-screen" />
                      </div>
                    </div>
                  </section>

                  <footer className="article-footer">
                    <span>Words: 2,156</span>
                    <span>Characters: 14,798</span>
                    <span>Readability: Grade 8</span>
                    <span>Saved 2 mins ago</span>
                  </footer>
                </article>
              </>
            ) : (
              <div className="placeholder-panel">
                <h3>{selectedEditorTab}</h3>
                <p>Editor tools for {selectedEditorTab.toLowerCase()} live here.</p>
              </div>
            )}
          </section>

          <aside className="image-panel panel">
            <div className="panel-tabs">
              {imageTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`tab-button ${tab === selectedImageTab ? "is-active" : ""}`}
                  onClick={() => setSelectedImageTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {selectedImageTab === "AI Images" ? (
              <>
                <div className="image-suggestions">
                  <div className="section-title">
                    <SparklesIcon />
                    <h3>AI Image Suggestions</h3>
                  </div>

                  <div className="suggestion-card">
                    <div className="suggestion-media suggestion-media-large">
                      <DeviceRender variant="hero" />
                    </div>
                    <div className="suggestion-copy">
                      <div className="suggestion-copy-header">
                        <strong>Design & Build Quality</strong>
                        <span className="pill">Recommended</span>
                      </div>
                      <p>Close-up of the Galaxy S25 Ultra showing the premium design.</p>
                      <div className="match-row">
                        <MatchIcon />
                        <span>96% Match</span>
                        <div className="thumb-actions">
                          <button type="button" className="thumb-button">
                            <ThumbUpIcon />
                          </button>
                          <button type="button" className="thumb-button">
                            <ThumbDownIcon />
                          </button>
                        </div>
                      </div>
                      <button type="button" className="generate-button">
                        Generate Image
                      </button>
                    </div>
                  </div>

                  <div className="suggestion-grid">
                    {suggestionThumbs.map((label, index) => (
                      <button type="button" key={label} className="thumb-card">
                        <DeviceRender variant={index % 2 === 0 ? "dark" : "silver"} compact />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="image-details">
                  <h3>Image Details</h3>
                  <label>
                    <span>Caption</span>
                    <input defaultValue="Samsung Galaxy S25 Ultra in Titanium Black." />
                  </label>
                  <label>
                    <span>Alt Text</span>
                    <textarea
                      rows={3}
                      defaultValue="Rear view of Samsung Galaxy S25 Ultra showing quad camera setup."
                    />
                  </label>
                  <div className="position-grid">
                    <span>Position</span>
                    <div className="position-controls" role="group" aria-label="Image position">
                      <button type="button" className="position-button">
                        <PositionIcon />
                      </button>
                      <button type="button" className="position-button is-active">
                        <PositionIcon variant="wide" />
                      </button>
                      <button type="button" className="position-button">
                        <PositionIcon />
                      </button>
                      <button type="button" className="position-button">
                        <PositionIcon variant="right" />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="placeholder-panel">
                <h3>{selectedImageTab}</h3>
                <p>Secondary media tools appear here.</p>
              </div>
            )}
          </aside>

          <aside className="tool-rail" aria-label="Workspace tools">
            {toolItems.map((tool) => {
              const isActive = tool.label === selectedTool;
              return (
                <button
                  key={tool.label}
                  type="button"
                  className={`rail-button ${isActive ? "is-active" : ""}`}
                  onClick={() => setSelectedTool(tool.label)}
                >
                  <span className="rail-icon">{tool.icon}</span>
                  <span className="rail-label">{tool.label}</span>
                  {tool.label === "SEO Score" ? <span className="score-ring">87</span> : null}
                </button>
              );
            })}

            <button type="button" className="floating-action" aria-label="Open quick actions">
              <SparklesIcon />
            </button>
          </aside>
        </section>
      </main>
    </div>
  );
}

function DeviceRender({ variant, compact }: { variant: "hero" | "dark" | "silver"; compact?: boolean }) {
  return (
    <div className={`device-render ${variant} ${compact ? "compact" : ""}`} aria-hidden="true">
      <div className="render-camera-stack">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="render-light" />
      <div className="render-body" />
    </div>
  );
}

function MarkIcon() {
  return (
    <svg viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <path
        d="M12 31.5C12 18.5 20.5 11 30 11c4.5 0 7.5 2 9 5"
        stroke="url(#mark-grad)"
        strokeWidth="4.4"
        strokeLinecap="round"
      />
      <path
        d="M14 22c1.2-4.9 5.4-8.2 11-8.2 4.7 0 8.9 2 11 5.8"
        stroke="url(#mark-grad)"
        strokeWidth="4.4"
        strokeLinecap="round"
        opacity="0.8"
      />
      <defs>
        <linearGradient id="mark-grad" x1="11" y1="11" x2="37" y2="33" gradientUnits="userSpaceOnUse">
          <stop stopColor="#b46cff" />
          <stop offset="1" stopColor="#635bff" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function DashboardIcon() {
  return <SquareGridIcon />;
}

function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 7.5A2.5 2.5 0 0 1 6.5 5h3.3c.7 0 1.4.3 1.8.9l.9 1.1c.4.5 1 .8 1.7.8H18a2.5 2.5 0 0 1 2.5 2.5v6.2A2.5 2.5 0 0 1 18 19H6.5A2.5 2.5 0 0 1 4 16.5v-9Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function TemplateIcon() {
  return <SquareGridIcon />;
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 16.9V20h3.1L18 9.1l-3.1-3.1L4 16.9Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M13.1 6l4.9 4.9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5.5 12a6.5 6.5 0 0 1 11-4.6L19 9.9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M19 5.5v4.5h-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M18.5 12a6.5 6.5 0 0 1-11 4.6L5 14.1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M5 18.5V14H9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 12h16M12 4c2 2.2 3 4.8 3 8s-1 5.8-3 8c-2-2.2-3-4.8-3-8s1-5.8 3-8Z" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="5" width="16" height="14" rx="2.2" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M8 13.5 10.5 11l2.2 2.2 1.5-1.6L18 15.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="9" r="1.2" fill="currentColor" />
    </svg>
  );
}

function VoiceIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 5a3 3 0 0 0-3 3v4a3 3 0 0 0 6 0V8a3 3 0 0 0-3-3Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M6 11v1.2a6 6 0 0 0 12 0V11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 18v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 8.1A3.9 3.9 0 1 0 12 15.9 3.9 3.9 0 0 0 12 8.1Zm7 3.9-.8.5a1.4 1.4 0 0 0-.5 1.8l.3.5a1.4 1.4 0 0 1-1.2 2l-.6-.1a1.4 1.4 0 0 0-1.4.7l-.2.6a1.4 1.4 0 0 1-2.2.7l-.5-.4a1.4 1.4 0 0 0-1.7 0l-.5.4a1.4 1.4 0 0 1-2.2-.7l-.2-.6a1.4 1.4 0 0 0-1.4-.7l-.6.1a1.4 1.4 0 0 1-1.2-2l.3-.5a1.4 1.4 0 0 0-.5-1.8L5 12a1.4 1.4 0 0 1 0-2.4l.8-.5a1.4 1.4 0 0 0 .5-1.8l-.3-.5a1.4 1.4 0 0 1 1.2-2l.6.1a1.4 1.4 0 0 0 1.4-.7l.2-.6a1.4 1.4 0 0 1 2.2-.7l.5.4a1.4 1.4 0 0 0 1.7 0l.5-.4a1.4 1.4 0 0 1 2.2.7l.2.6a1.4 1.4 0 0 0 1.4.7l.6-.1a1.4 1.4 0 0 1 1.2 2l-.3.5a1.4 1.4 0 0 0 .5 1.8l.8.5a1.4 1.4 0 0 1 0 2.4Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RocketIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M14.9 4.8c1.7-.4 3.5.1 4.7 1.3 1.2 1.2 1.7 3 1.3 4.7-.5 2.1-1.7 4.3-3.8 6.5l-2.5-2.5 3-3.1-1.6-1.6-3.1 3-2.5-2.5c2.2-2.2 4.3-3.4 6.5-3.8Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M6.8 15.2 4 18l2.8-.5.6 2.7 2.7-2.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m12.2 15.2-3.4 3.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="15.8" cy="8.2" r="1.2" fill="currentColor" />
    </svg>
  );
}

function RobotIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="6" width="14" height="11" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 3.5v2.5M8.5 11h.1M15.5 11h.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 15.5c1 .8 2.3 1.2 4 1.2s3-.4 4-1.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9.5 14.5 8 16a4 4 0 0 1-5.7-5.7l2.3-2.3A4 4 0 0 1 10 8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M14.5 9.5 16 8a4 4 0 0 1 5.7 5.7l-2.3 2.3A4 4 0 0 1 14 16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M9 12h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function TextIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 7h14M9 7v10M15 7v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function MeterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5.5 15a6.5 6.5 0 1 1 13 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M12 12l3.8-2.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="15" r="1.4" fill="currentColor" />
    </svg>
  );
}

function NoteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 4.5h9l3 3V19a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 19V6A1.5 1.5 0 0 1 6 4.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M15 4.5V8h3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M7 11h10M7 14h10M7 17h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6.5 7.5 4.8 9.2 6.5 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 9h7a6 6 0 1 1-4.2 10.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="m6.8 10.3 1.9 1.9 4.6-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UndoIcon() {
  return <ArrowTurnIcon direction="left" />;
}

function RedoIcon() {
  return <ArrowTurnIcon direction="right" />;
}

function MoreIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="4.5" cy="10" r="1.2" fill="currentColor" />
      <circle cx="10" cy="10" r="1.2" fill="currentColor" />
      <circle cx="15.5" cy="10" r="1.2" fill="currentColor" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="m5 8 5 5 5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="m8 5 4 5-4 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M7 3H3v4M13 3h4v4M3 13v4h4M17 13v4h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function BoldIcon() {
  return <span className="format-glyph">B</span>;
}

function ItalicIcon() {
  return <span className="format-glyph italic">I</span>;
}

function UnderlineIcon() {
  return <span className="format-glyph underline">U</span>;
}

function StrikeIcon() {
  return <span className="format-glyph strike">S</span>;
}

function ListIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M7 5h10M7 10h10M7 15h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="3.5" cy="5" r="0.9" fill="currentColor" />
      <circle cx="3.5" cy="10" r="0.9" fill="currentColor" />
      <circle cx="3.5" cy="15" r="0.9" fill="currentColor" />
    </svg>
  );
}

function ListBulletsIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M7 5h10M7 10h10M7 15h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="3.5" cy="5" r="1.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="3.5" cy="10" r="1.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="3.5" cy="15" r="1.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function AlignLeftIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 5h14M3 9h9M3 13h12M3 17h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function AlignCenterIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 5h12M6 9h8M3 13h14M4 17h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function AlignRightIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 5h14M8 9h9M6 13h11M3 17h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function TableIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 9h14M9.5 4v12" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4.5 6h11M8 6V4.8A.8.8 0 0 1 8.8 4h2.4a.8.8 0 0 1 .8.8V6m-6.2 0 .5 9A1.2 1.2 0 0 0 7.5 16h5a1.2 1.2 0 0 0 1.2-1l.5-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function DragIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="6" cy="6" r="1" fill="currentColor" />
      <circle cx="14" cy="6" r="1" fill="currentColor" />
      <circle cx="6" cy="10" r="1" fill="currentColor" />
      <circle cx="14" cy="10" r="1" fill="currentColor" />
      <circle cx="6" cy="14" r="1" fill="currentColor" />
      <circle cx="14" cy="14" r="1" fill="currentColor" />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3.5 13.7 8l4.5 1.7-4.5 1.7L12 15.9l-1.7-4.5L5.8 9.7 10.3 8 12 3.5Z" fill="currentColor" />
      <path d="M18 14.5 18.7 16.4 20.5 17l-1.8.6-.7 1.9-.7-1.9-1.8-.6 1.8-.6.7-1.9Z" fill="currentColor" />
    </svg>
  );
}

function MatchIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 4.5 14.4 6v4.2c0 2.8-1.7 4.8-4.4 5.8-2.7-1-4.4-3-4.4-5.8V6L10 4.5Z" stroke="currentColor" strokeWidth="1.4" />
      <path d="m7.6 10 1.5 1.5 3.4-3.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ThumbUpIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M8.4 8.3V5.7c0-.9.7-1.7 1.7-1.7l-.4 4.3h5.4c.8 0 1.4.6 1.4 1.4l-.7 4.2c-.1.9-.9 1.6-1.8 1.6H7.3c-.8 0-1.4-.6-1.4-1.4V8.3h2.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function ThumbDownIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ transform: "rotate(180deg)" }}>
      <path d="M8.4 8.3V5.7c0-.9.7-1.7 1.7-1.7l-.4 4.3h5.4c.8 0 1.4.6 1.4 1.4l-.7 4.2c-.1.9-.9 1.6-1.8 1.6H7.3c-.8 0-1.4-.6-1.4-1.4V8.3h2.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function PositionIcon({ variant = "center" }: { variant?: "center" | "wide" | "right" }) {
  return (
    <svg viewBox="0 0 40 28" fill="none" aria-hidden="true">
      <rect x="4" y="5" width="32" height="18" rx="2.8" stroke="currentColor" strokeWidth="1.5" />
      <rect
        x={variant === "wide" ? 11 : variant === "right" ? 18 : 14}
        y="9"
        width="12"
        height="10"
        rx="1.6"
        fill="currentColor"
        opacity="0.18"
      />
    </svg>
  );
}

function ArrowTurnIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d={direction === "left" ? "M9 5 5 9l4 4" : "M11 5l4 4-4 4"}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={direction === "left" ? "M15 15H8.5A3.5 3.5 0 0 1 5 11.5V9" : "M5 15h6.5A3.5 3.5 0 0 0 15 11.5V9"}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SquareGridIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3.5" y="3.5" width="5" height="5" rx="1.4" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11.5" y="3.5" width="5" height="5" rx="1.4" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3.5" y="11.5" width="5" height="5" rx="1.4" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11.5" y="11.5" width="5" height="5" rx="1.4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
