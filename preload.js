const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('policygptRater', {
  runDemoQuote: () => ipcRenderer.invoke('quote:runDemo'),

  saveCredential: (key, value) =>
    ipcRenderer.invoke('cred:save', key, value),

  getCredential: (key) =>
    ipcRenderer.invoke('cred:get', key),

  deleteCredential: (key) =>
    ipcRenderer.invoke('cred:delete', key)
});
