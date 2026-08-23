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
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  UserRound,
  X,
} from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

type Tab = { id: number; title: string; url: string };
type Panel = 'favorites' | 'history' | 'downloads' | 'settings' | null;

const quickLinks = [
  ['GitHub', 'https://github.com'],
  ['Vercel', 'https://vercel.com'],
  ['YouTube', 'https://youtube.com'],
  ['Outlook', 'https://outlook.live.com'],
  ['ChatGPT', 'https://chatgpt.com'],
  ['Maps', 'https://maps.google.com'],
];

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return 'https://www.bing.com';
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
  const [verticalTabs, setVerticalTabs] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(['https://github.com/Wickey23/BetterEdge']);
  const [history, setHistory] = useState<string[]>([]);
  const [notice, setNotice] = useState('');

  const activeTab = useMemo(() => tabs.find((tab) => tab.id === activeId) ?? tabs[0], [tabs, activeId]);
  const isNewTab = activeTab?.url === 'betteredge://newtab';

  function addTab() {
    const id = Date.now();
    setTabs((current) => [...current, { id, title: 'New tab', url: 'betteredge://newtab' }]);
    setActiveId(id);
    setAddress('');
  }

  function closeTab(id: number) {
    setTabs((current) => {
      if (current.length === 1) return [{ id: Date.now(), title: 'New tab', url: 'betteredge://newtab' }];
      const index = current.findIndex((tab) => tab.id === id);
      const next = current.filter((tab) => tab.id !== id);
      if (id === activeId) setActiveId(next[Math.max(0, index - 1)].id);
      return next;
    });
  }

  function navigate(raw: string) {
    const url = normalizeUrl(raw);
    const title = raw || 'New tab';
    setTabs((current) => current.map((tab) => (tab.id === activeId ? { ...tab, title, url } : tab)));
    setAddress(url);
    setHistory((current) => [url, ...current.filter((item) => item !== url)].slice(0, 25));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    navigate(address);
  }

  function openPanel(next: Panel) {
    setPanel((current) => (current === next ? null : next));
    setProfileOpen(false);
  }

  function addFavorite() {
    if (!activeTab || activeTab.url.startsWith('betteredge://')) return;
    setFavorites((current) => (current.includes(activeTab.url) ? current : [activeTab.url, ...current]));
    setNotice('Added to favorites');
    window.setTimeout(() => setNotice(''), 1600);
  }

  return (
    <main className="desktop">
      <section className={`browser ${verticalTabs ? 'vertical-mode' : ''}`}>
        <div className="titlebar">
          <button className="icon-button app-menu" aria-label="Tab actions" onClick={() => setVerticalTabs((value) => !value)}>
            <Menu size={18} />
          </button>
          {!verticalTabs && (
            <div className="tab-strip">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`tab ${tab.id === activeId ? 'active' : ''}`}
                  onClick={() => {
                    setActiveId(tab.id);
                    setAddress(tab.url.startsWith('betteredge://') ? '' : tab.url);
                  }}
                >
                  <span className="tab-favicon"><Sparkles size={14} /></span>
                  <span className="tab-title">{tab.title}</span>
                  <span className="tab-close" onClick={(event) => { event.stopPropagation(); closeTab(tab.id); }}><X size={14} /></span>
                </button>
              ))}
              <button className="new-tab" onClick={addTab} aria-label="New tab"><Plus size={18} /></button>
            </div>
          )}
          <div className="window-drag" />
          <div className="window-buttons"><span>—</span><span>□</span><span>×</span></div>
        </div>

        <div className="workspace-row">
          {verticalTabs && (
            <aside className="vertical-tabs">
              <button className="vertical-new" onClick={addTab}><Plus size={17} /><span>New tab</span></button>
              {tabs.map((tab) => (
                <button key={tab.id} className={`vertical-tab ${tab.id === activeId ? 'active' : ''}`} onClick={() => setActiveId(tab.id)}>
                  <Sparkles size={15} /><span>{tab.title}</span>
                  <X size={13} onClick={(event) => { event.stopPropagation(); closeTab(tab.id); }} />
                </button>
              ))}
            </aside>
          )}

          <div className="browser-main">
            <div className="toolbar">
              <div className="nav-buttons">
                <button className="icon-button" aria-label="Back"><ArrowLeft size={18} /></button>
                <button className="icon-button" aria-label="Forward"><ArrowRight size={18} /></button>
                <button className="icon-button" aria-label="Refresh"><RefreshCw size={17} /></button>
                <button className="icon-button" aria-label="Home" onClick={() => navigate('betteredge://newtab')}><House size={17} /></button>
              </div>

              <form className="omnibox" onSubmit={submit}>
                <ShieldCheck size={16} className="security-icon" />
                <input
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="Search or enter web address"
                  aria-label="Address bar"
                />
                <button type="button" className="inside-button" onClick={addFavorite}><Star size={17} /></button>
              </form>

              <div className="toolbar-actions">
                <button className="icon-button" onClick={() => openPanel('favorites')} title="Favorites"><Bookmark size={18} /></button>
                <button className="icon-button" onClick={() => openPanel('history')} title="History"><Clock3 size={18} /></button>
                <button className="icon-button" onClick={() => openPanel('downloads')} title="Downloads"><Download size={18} /></button>
                <button className="icon-button copilot" title="Assistant"><Sparkles size={18} /></button>
                <div className="profile-wrap">
                  <button className="avatar" onClick={() => setProfileOpen((value) => !value)}>S</button>
                  {profileOpen && (
                    <div className="profile-menu popover">
                      <div className="profile-head"><div className="large-avatar">S</div><div><strong>Profile 1</strong><span>Local profile</span></div></div>
                      <button><UserRound size={16} /> Manage profile</button>
                      <button><SlidersHorizontal size={16} /> Sync options</button>
                      <button onClick={() => openPanel('settings')}><Settings size={16} /> Profile settings</button>
                    </div>
                  )}
                </div>
                <button className="icon-button" onClick={() => openPanel('settings')} title="Settings and more"><Ellipsis size={20} /></button>
              </div>
            </div>

            <div className="content-shell">
              {isNewTab ? (
                <section className="new-tab-page">
                  <div className="new-tab-top"><span>BetterEdge</span><button onClick={() => openPanel('settings')}><Settings size={16} /></button></div>
                  <div className="hero">
                    <div className="brand-mark">B</div>
                    <h1>Where do you want to go?</h1>
                    <form className="hero-search" onSubmit={submit}>
                      <Search size={20} />
                      <input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Search the web" />
                      <button type="submit"><ArrowRight size={19} /></button>
                    </form>
                    <div className="quick-links">
                      {quickLinks.map(([label, url]) => (
                        <button key={label} onClick={() => navigate(url)}>
                          <span>{label.slice(0, 1)}</span>{label}
                        </button>
                      ))}
                      <button><span><Plus size={18} /></span>Add shortcut</button>
                    </div>
                  </div>
                  <div className="feed-preview">
                    <div className="feed-card"><span className="eyebrow">BETTEREDGE</span><h2>Your browser, built around you.</h2><p>This first-pass shell is ready for custom features, workspaces and desktop Chromium integration.</p></div>
                    <div className="feed-card"><span className="eyebrow">QUICK START</span><h3>Try the address bar</h3><p>Enter a search or URL above. Sites that allow embedding can be previewed directly in this Vercel prototype.</p></div>
                  </div>
                </section>
              ) : (
                <section className="webview-wrap">
                  <iframe src={activeTab?.url} title={activeTab?.title ?? 'Web page'} sandbox="allow-forms allow-modals allow-popups allow-same-origin allow-scripts" />
                  <div className="webview-note">Some websites block iframe embedding. The desktop Chromium build will not have this limitation.</div>
                </section>
              )}

              {panel && (
                <aside className="side-panel">
                  <div className="panel-head">
                    <strong>{panel === 'favorites' ? 'Favorites' : panel === 'history' ? 'History' : panel === 'downloads' ? 'Downloads' : 'Settings'}</strong>
                    <button className="icon-button" onClick={() => setPanel(null)}><X size={17} /></button>
                  </div>
                  {panel === 'favorites' && <div className="panel-list">{favorites.map((item) => <button key={item} onClick={() => navigate(item)}><Star size={15} /><span>{item}</span></button>)}</div>}
                  {panel === 'history' && <div className="panel-list">{history.length ? history.map((item) => <button key={item} onClick={() => navigate(item)}><Clock3 size={15} /><span>{item}</span></button>) : <p className="empty">No browsing history yet.</p>}</div>}
                  {panel === 'downloads' && <div className="empty-state"><Download size={32} /><strong>No downloads yet</strong><p>Desktop downloads will appear here.</p></div>}
                  {panel === 'settings' && (
                    <div className="settings-list">
                      <label><span>Vertical tabs</span><input type="checkbox" checked={verticalTabs} onChange={() => setVerticalTabs((value) => !value)} /></label>
                      <label><span>Startup page</span><select defaultValue="new"><option value="new">New tab</option><option value="restore">Continue where you left off</option></select></label>
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
