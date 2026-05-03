const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('policygptRater', {
  runDemoQuote: () => ipcRenderer.invoke('quote:runDemo')
});
