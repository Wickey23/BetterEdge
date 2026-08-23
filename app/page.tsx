'use client';

import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  ChevronDown,
  Clock3,
  Download,
  Ellipsis,
  House,
  Menu,
  PanelRight,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  SplitSquareHorizontal,
  Star,
  UserRound,
  X,
} from 'lucide-react';
import { FormEvent, MouseEvent, useMemo, useState } from 'react';

type Tab = { id: number; title: string; url: string };
type Panel = 'favorites' | 'history' | 'downloads' | 'settings' | null;

const quickLinks = [
  ['Microsoft 365', 'https://www.microsoft365.com'],
  ['Outlook', 'https://outlook.live.com'],
  ['YouTube', 'https://youtube.com'],
  ['GitHub', 'https://github.com'],
  ['Vercel', 'https://vercel.com'],
  ['ChatGPT', 'https://chatgpt.com'],
];

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return 'betteredge://newtab';
  if (trimmed.startsWith('betteredge://')) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.includes('.') && !trimmed.includes(' ')) return `https://${trimmed}`;
  return `https://www.bing.com/search?q=${encodeURIComponent(trimmed)}`;
}

export default function Home() {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: 1, title: 'New tab', url: 'betteredge://newtab' },
  ]);
  const [activeId, setActiveId] = useState(1);
  const [address, setAddress] = useState('');
  const [panel, setPanel] = useState<Panel>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [verticalTabs, setVerticalTabs] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [favorites, setFavorites] = useState<string[]>(['https://github.com/Wickey23/BetterEdge']);
  const [history, setHistory] = useState<string[]>([]);
  const [notice, setNotice] = useState('');

  const activeTab = useMemo(() => tabs.find((tab) => tab.id === activeId) ?? tabs[0], [tabs, activeId]);
  const isNewTab = activeTab?.url === 'betteredge://newtab';

  function activateTab(tab: Tab) {
    setActiveId(tab.id);
    setAddress(tab.url.startsWith('betteredge://') ? '' : tab.url);
  }

  function addTab() {
    const id = Date.now();
    setTabs((current) => [...current, { id, title: 'New tab', url: 'betteredge://newtab' }]);
    setActiveId(id);
    setAddress('');
    setPanel(null);
  }

  function closeTab(id: number, event?: MouseEvent) {
    event?.stopPropagation();
    setTabs((current) => {
      if (current.length === 1) {
        const replacement = { id: Date.now(), title: 'New tab', url: 'betteredge://newtab' };
        setActiveId(replacement.id);
        setAddress('');
        return [replacement];
      }
      const index = current.findIndex((tab) => tab.id === id);
      const next = current.filter((tab) => tab.id !== id);
      if (id === activeId) {
        const replacement = next[Math.min(index, next.length - 1)];
        setActiveId(replacement.id);
        setAddress(replacement.url.startsWith('betteredge://') ? '' : replacement.url);
      }
      return next;
    });
  }

  function navigate(raw: string) {
    const url = normalizeUrl(raw);
    if (url === 'betteredge://newtab') {
      setTabs((current) => current.map((tab) => tab.id === activeId ? { ...tab, title: 'New tab', url } : tab));
      setAddress('');
      return;
    }
    const label = raw.replace(/^https?:\/\//, '').split('/')[0] || 'New tab';
    setTabs((current) => current.map((tab) => tab.id === activeId ? { ...tab, title: label, url } : tab));
    setAddress(url);
    setHistory((current) => [url, ...current.filter((item) => item !== url)].slice(0, 30));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    navigate(address);
  }

  function openPanel(next: Panel) {
    setPanel((current) => current === next ? null : next);
    setProfileOpen(false);
    setMenuOpen(false);
  }

  function addFavorite() {
    if (!activeTab || activeTab.url.startsWith('betteredge://')) return;
    setFavorites((current) => current.includes(activeTab.url) ? current : [activeTab.url, ...current]);
    setNotice('Added to favorites');
    window.setTimeout(() => setNotice(''), 1400);
  }

  return (
    <main className="desktop">
      <section className={`browser ${verticalTabs ? 'vertical-mode' : ''}`}>
        <div className="titlebar">
          <button className="tab-actions-button" aria-label="Tab actions menu" onClick={() => setVerticalTabs((value) => !value)}>
            <Menu size={16} />
            <ChevronDown size={11} />
          </button>

          {!verticalTabs && (
            <div className="tab-strip">
              {tabs.map((tab) => (
                <button key={tab.id} className={`tab ${tab.id === activeId ? 'active' : ''}`} onClick={() => activateTab(tab)}>
                  <span className="tab-favicon">{tab.url.startsWith('betteredge://') ? <Sparkles size={14} /> : <span className="site-dot" />}</span>
                  <span className="tab-title">{tab.title}</span>
                  <span className="tab-close" onClick={(event) => closeTab(tab.id, event)}><X size={13} /></span>
                </button>
              ))}
              <button className="new-tab" onClick={addTab} aria-label="New tab"><Plus size={17} /></button>
            </div>
          )}

          <div className="window-drag" />
          <button className="workspace-pill"><span className="workspace-icon">W</span><span>Workspaces</span></button>
          <div className="window-buttons" aria-hidden="true"><span>—</span><span>□</span><span>×</span></div>
        </div>

        <div className="workspace-row">
          {verticalTabs && (
            <aside className="vertical-tabs">
              <div className="vertical-tabs-head">
                <button className="vertical-new" onClick={addTab}><Plus size={16} /><span>New tab</span></button>
              </div>
              {tabs.map((tab) => (
                <button key={tab.id} className={`vertical-tab ${tab.id === activeId ? 'active' : ''}`} onClick={() => activateTab(tab)}>
                  <Sparkles size={14} /><span>{tab.title}</span>
                  <X size={12} onClick={(event) => closeTab(tab.id, event)} />
                </button>
              ))}
            </aside>
          )}

          <div className="browser-main">
            <div className="toolbar">
              <div className="nav-buttons">
                <button className="icon-button" aria-label="Back"><ArrowLeft size={17} /></button>
                <button className="icon-button disabled" aria-label="Forward"><ArrowRight size={17} /></button>
                <button className="icon-button" aria-label="Refresh"><RefreshCw size={16} /></button>
                <button className="icon-button" aria-label="Home" onClick={() => navigate('betteredge://newtab')}><House size={16} /></button>
              </div>

              <form className="omnibox" onSubmit={submit}>
                <ShieldCheck size={15} className="security-icon" />
                <input
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="Search or enter web address"
                  aria-label="Address bar"
                />
                <button type="button" className="inside-button" onClick={addFavorite} title="Add this page to favorites"><Star size={16} /></button>
              </form>

              <div className="toolbar-actions">
                <button className="icon-button" title="Split screen"><SplitSquareHorizontal size={17} /></button>
                <button className="icon-button" onClick={() => openPanel('favorites')} title="Favorites"><Bookmark size={17} /></button>
                <button className="icon-button" onClick={() => openPanel('history')} title="History"><Clock3 size={17} /></button>
                <button className="icon-button" onClick={() => openPanel('downloads')} title="Downloads"><Download size={17} /></button>
                <button className="copilot-button" title="Assistant"><Sparkles size={17} /></button>
                <div className="profile-wrap">
                  <button className="avatar" onClick={() => { setProfileOpen((value) => !value); setMenuOpen(false); }}>S</button>
                  {profileOpen && (
                    <div className="profile-menu popover">
                      <div className="profile-head"><div className="large-avatar">S</div><div><strong>Profile 1</strong><span>Local profile</span></div></div>
                      <button><UserRound size={16} /> Manage profile settings</button>
                      <button onClick={() => openPanel('settings')}><Settings size={16} /> Customize your browser</button>
                    </div>
                  )}
                </div>
                <div className="menu-wrap">
                  <button className="icon-button" onClick={() => { setMenuOpen((value) => !value); setProfileOpen(false); }} title="Settings and more"><Ellipsis size={20} /></button>
                  {menuOpen && (
                    <div className="edge-menu popover">
                      <button onClick={addTab}><Plus size={16} /><span>New tab</span><kbd>Ctrl+T</kbd></button>
                      <button><span className="incognito-glyph">◉</span><span>New private window</span><kbd>Ctrl+Shift+N</kbd></button>
                      <div className="menu-separator" />
                      <button onClick={() => openPanel('favorites')}><Star size={16} /><span>Favorites</span><kbd>Ctrl+Shift+O</kbd></button>
                      <button onClick={() => openPanel('history')}><Clock3 size={16} /><span>History</span><kbd>Ctrl+H</kbd></button>
                      <button onClick={() => openPanel('downloads')}><Download size={16} /><span>Downloads</span><kbd>Ctrl+J</kbd></button>
                      <div className="menu-separator" />
                      <button onClick={() => openPanel('settings')}><Settings size={16} /><span>Settings</span></button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="favorites-bar">
              <button className="favorites-bar-item" onClick={() => openPanel('favorites')}><Star size={13} /><span>Favorites</span></button>
              <button className="favorites-bar-item" onClick={() => navigate('https://github.com/Wickey23/BetterEdge')}><span className="mini-favicon">G</span><span>BetterEdge</span></button>
            </div>

            <div className="content-shell">
              {isNewTab ? (
                <section className="new-tab-page">
                  <div className="new-tab-controls">
                    <div />
                    <div className="new-tab-control-buttons">
                      <button title="Page settings"><Settings size={17} /></button>
                    </div>
                  </div>

                  <div className="new-tab-hero">
                    <div className="search-brand"><span className="brand-swoosh">B</span></div>
                    <form className="new-tab-search" onSubmit={submit}>
                      <Search size={20} />
                      <input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Search the web" />
                      <button type="submit" aria-label="Search"><ArrowRight size={18} /></button>
                    </form>

                    <div className="quick-links">
                      {quickLinks.map(([label, url]) => (
                        <button key={label} onClick={() => navigate(url)}>
                          <span className="quick-icon">{label.slice(0, 1)}</span>
                          <span className="quick-label">{label}</span>
                        </button>
                      ))}
                      <button onClick={() => setNotice('Shortcut editor will be connected in desktop build')}>
                        <span className="quick-icon"><Plus size={18} /></span>
                        <span className="quick-label">Add shortcut</span>
                      </button>
                    </div>
                  </div>

                  <div className="ntp-bottom">
                    <div className="ntp-tabs"><button className="selected">Discover</button><button>Following</button><button>Gaming</button></div>
                    <div className="news-grid">
                      <article className="news-card feature"><span>BetterEdge</span><h2>A browser shell built to feel familiar from the first click.</h2><p>This preview is being aligned to the current Edge layout before desktop Chromium integration.</p></article>
                      <article className="news-card"><span>Browser</span><h3>Tabs, favorites, history and downloads</h3><p>Core interaction surfaces are already wired for the desktop version.</p></article>
                      <article className="news-card"><span>Next</span><h3>Native Chromium window</h3><p>The Windows build will remove iframe restrictions and provide real browser behavior.</p></article>
                    </div>
                  </div>
                </section>
              ) : (
                <section className="webview-wrap">
                  <iframe src={activeTab?.url} title={activeTab?.title ?? 'Web page'} sandbox="allow-forms allow-modals allow-popups allow-same-origin allow-scripts" />
                  <div className="webview-note">This Vercel preview is web-hosted. Sites that block embedding will work normally in the desktop Chromium build.</div>
                </section>
              )}

              {sidebarOpen && (
                <nav className="edge-sidebar" aria-label="Sidebar">
                  <button className="sidebar-copilot" title="Assistant"><Sparkles size={18} /></button>
                  <button title="Search"><Search size={18} /></button>
                  <button title="Favorites" onClick={() => openPanel('favorites')}><Star size={18} /></button>
                  <button title="Tools"><PanelRight size={18} /></button>
                  <div className="sidebar-spacer" />
                  <button title="Customize sidebar" onClick={() => setSidebarOpen(false)}><Plus size={18} /></button>
                </nav>
              )}

              {!sidebarOpen && <button className="restore-sidebar" onClick={() => setSidebarOpen(true)}><PanelRight size={16} /></button>}

              {panel && (
                <aside className="side-panel">
                  <div className="panel-head">
                    <strong>{panel === 'favorites' ? 'Favorites' : panel === 'history' ? 'History' : panel === 'downloads' ? 'Downloads' : 'Settings'}</strong>
                    <button className="icon-button" onClick={() => setPanel(null)}><X size={16} /></button>
                  </div>
                  {panel === 'favorites' && <div className="panel-list">{favorites.map((item) => <button key={item} onClick={() => navigate(item)}><Star size={15} /><span>{item}</span></button>)}</div>}
                  {panel === 'history' && <div className="panel-list">{history.length ? history.map((item) => <button key={item} onClick={() => navigate(item)}><Clock3 size={15} /><span>{item}</span></button>) : <p className="empty">Your browsing history appears here.</p>}</div>}
                  {panel === 'downloads' && <div className="empty-state"><Download size={30} /><strong>No downloads yet</strong><p>Files you download will show here.</p></div>}
                  {panel === 'settings' && (
                    <div className="settings-list">
                      <label><span>Use vertical tabs</span><input type="checkbox" checked={verticalTabs} onChange={() => setVerticalTabs((value) => !value)} /></label>
                      <label><span>Show sidebar</span><input type="checkbox" checked={sidebarOpen} onChange={() => setSidebarOpen((value) => !value)} /></label>
                      <label><span>Startup behavior</span><select defaultValue="new"><option value="new">Open the new tab page</option><option value="restore">Open tabs from previous session</option></select></label>
                      <label><span>Search engine</span><select defaultValue="bing"><option value="bing">Bing</option><option value="google">Google</option><option value="duck">DuckDuckGo</option></select></label>
                    </div>
                  )}
                </aside>
              )}
            </div>
          </div>
        </div>
        {notice && <div className="toast">{notice}</div>}
      </section>
    </main>
  );
}
