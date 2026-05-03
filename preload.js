const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('policygptRater', {
  runDemoQuote: (lineOfBusiness) => ipcRenderer.invoke('quote:runDemo', lineOfBusiness),

  getAllCarriers: () =>
    ipcRenderer.invoke('carriers:getAll'),

  getCarriersForLine: (lineOfBusiness) =>
    ipcRenderer.invoke('carriers:getForLine', lineOfBusiness),

  saveCarrier: (carrierInput) =>
    ipcRenderer.invoke('carriers:save', carrierInput),

  saveCredential: (key, value) =>
    ipcRenderer.invoke('cred:save', key, value),

  getCredential: (key) =>
    ipcRenderer.invoke('cred:get', key),

  deleteCredential: (key) =>
    ipcRenderer.invoke('cred:delete', key)
});
