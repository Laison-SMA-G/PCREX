// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  
  // Call backend API
  request: async (method, url, data) => {
    return await ipcRenderer.invoke('api-request', { method, url, data });
  },

  // Upload an image to Cloudinary
  uploadImage: async (filePath) => {
    return await ipcRenderer.invoke('upload-to-cloudinary', filePath);
  },
});
