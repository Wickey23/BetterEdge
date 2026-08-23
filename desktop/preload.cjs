const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('betterEdge', {
  onState: (callback) => ipcRenderer.on('browser:state', (_e, state) => callback(state)),
  newTab: (url) => ipcRenderer.invoke('browser:new-tab', url),
  activateTab: (id) => ipcRenderer.invoke('browser:activate-tab', id),
  closeTab: (id) => ipcRenderer.invoke('browser:close-tab', id),
  navigate: (value) => ipcRenderer.invoke('browser:navigate', value),
  back: () => ipcRenderer.invoke('browser:back'),
  forward: () => ipcRenderer.invoke('browser:forward'),
  reload: () => ipcRenderer.invoke('browser:reload'),
  stop: () => ipcRenderer.invoke('browser:stop'),
  devtools: () => ipcRenderer.invoke('browser:devtools'),
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximizeToggle: () => ipcRenderer.invoke('window:maximize-toggle'),
  close: () => ipcRenderer.invoke('window:close'),
});
