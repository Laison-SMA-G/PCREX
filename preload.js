// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  request: async (method, url, data) => {
    return await ipcRenderer.invoke('api-request', { method, url, data });
  },
});
