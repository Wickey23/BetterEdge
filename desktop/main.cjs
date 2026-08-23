const { app, BrowserWindow, WebContentsView, ipcMain, session, shell } = require('electron');
const path = require('path');

let win;
let tabs = new Map();
let activeId = null;
let nextId = 1;
const CHROME_HEIGHT = 132;

function normalizeUrl(value='') {
  const v = String(value).trim();
  if (!v) return 'https://www.bing.com/';
  if (/^https?:\/\//i.test(v)) return v;
  if (v.includes('.') && !v.includes(' ')) return `https://${v}`;
  return `https://www.bing.com/search?q=${encodeURIComponent(v)}`;
}

function sendState() {
  if (!win || win.isDestroyed()) return;
  const payload = {
    activeId,
    tabs: [...tabs.entries()].map(([id, t]) => ({
      id,
      title: t.title || 'New tab',
      url: t.url || '',
      loading: !!t.loading,
      canGoBack: t.view.webContents.canGoBack(),
      canGoForward: t.view.webContents.canGoForward(),
    }))
  };
  win.webContents.send('browser:state', payload);
}

function fitActiveView() {
  if (!win || activeId == null) return;
  const tab = tabs.get(activeId);
  if (!tab) return;
  const [width, height] = win.getContentSize();
  tab.view.setBounds({ x: 0, y: CHROME_HEIGHT, width, height: Math.max(0, height - CHROME_HEIGHT) });
}

function attachActiveView() {
  if (!win) return;
  for (const [id, tab] of tabs) {
    try { win.contentView.removeChildView(tab.view); } catch {}
  }
  const tab = tabs.get(activeId);
  if (!tab) return;
  win.contentView.addChildView(tab.view);
  fitActiveView();
}

function createTab(initialUrl = 'https://www.bing.com/', makeActive = true) {
  const id = nextId++;
  const view = new WebContentsView({
    webPreferences: {
      partition: 'persist:betteredge-default',
      sandbox: true,
      contextIsolation: true,
    }
  });
  const tab = { id, view, title: 'New tab', url: initialUrl, loading: false };
  tabs.set(id, tab);

  view.webContents.setWindowOpenHandler(({ url }) => {
    createTab(url, true);
    return { action: 'deny' };
  });
  view.webContents.on('will-navigate', (_e, url) => { tab.url = url; sendState(); });
  view.webContents.on('did-start-loading', () => { tab.loading = true; sendState(); });
  view.webContents.on('did-stop-loading', () => { tab.loading = false; tab.url = view.webContents.getURL(); sendState(); });
  view.webContents.on('page-title-updated', (_e, title) => { tab.title = title || tab.title; sendState(); });
  view.webContents.on('did-navigate', (_e, url) => { tab.url = url; sendState(); });
  view.webContents.on('did-navigate-in-page', (_e, url) => { tab.url = url; sendState(); });
  view.webContents.on('render-process-gone', () => { tab.title = 'Page crashed'; sendState(); });

  if (makeActive) {
    activeId = id;
    attachActiveView();
  }
  view.webContents.loadURL(normalizeUrl(initialUrl));
  sendState();
  return id;
}

function closeTab(id) {
  const tab = tabs.get(id);
  if (!tab) return;
  try { win.contentView.removeChildView(tab.view); } catch {}
  tab.view.webContents.close();
  tabs.delete(id);
  if (activeId === id) {
    activeId = tabs.size ? [...tabs.keys()][Math.max(0, tabs.size - 1)] : null;
    if (activeId == null) createTab(); else attachActiveView();
  }
  sendState();
}

function createWindow() {
  win = new BrowserWindow({
    width: 1500,
    height: 930,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#202124',
    title: 'BetterEdge',
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    }
  });

  win.loadFile(path.join(__dirname, 'chrome.html'));
  win.on('resize', fitActiveView);
  win.on('maximize', fitActiveView);
  win.on('unmaximize', fitActiveView);
  win.on('closed', () => { win = null; });

  win.webContents.once('did-finish-load', () => createTab('https://www.bing.com/'));
}

ipcMain.handle('browser:new-tab', (_e, url) => createTab(url || 'https://www.bing.com/', true));
ipcMain.handle('browser:activate-tab', (_e, id) => { if (tabs.has(id)) { activeId = id; attachActiveView(); sendState(); } });
ipcMain.handle('browser:close-tab', (_e, id) => closeTab(id));
ipcMain.handle('browser:navigate', (_e, value) => { const t = tabs.get(activeId); if (t) t.view.webContents.loadURL(normalizeUrl(value)); });
ipcMain.handle('browser:back', () => { const t = tabs.get(activeId); if (t?.view.webContents.canGoBack()) t.view.webContents.goBack(); });
ipcMain.handle('browser:forward', () => { const t = tabs.get(activeId); if (t?.view.webContents.canGoForward()) t.view.webContents.goForward(); });
ipcMain.handle('browser:reload', () => { const t = tabs.get(activeId); if (t) t.view.webContents.reload(); });
ipcMain.handle('browser:stop', () => { const t = tabs.get(activeId); if (t) t.view.webContents.stop(); });
ipcMain.handle('browser:devtools', () => { const t = tabs.get(activeId); if (t) t.view.webContents.openDevTools({ mode: 'detach' }); });
ipcMain.handle('window:minimize', () => win?.minimize());
ipcMain.handle('window:maximize-toggle', () => { if (!win) return; win.isMaximized() ? win.unmaximize() : win.maximize(); });
ipcMain.handle('window:close', () => win?.close());
ipcMain.handle('browser:external', (_e, url) => shell.openExternal(url));

app.whenReady().then(() => {
  session.defaultSession.setPermissionRequestHandler((_wc, _permission, callback) => callback(false));
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
