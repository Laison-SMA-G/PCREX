const { app, BrowserWindow, ipcMain } = require('electron');
const axios = require('axios');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile(path.join(__dirname, 'frontend/dist/index.html'));
}

ipcMain.handle('api-request', async (event, { method, url, data }) => {
  try {
    const response = await axios({
      method,
      url: `http://127.0.0.1:5175${url}`,
      data,
    });
    return response.data;
  } catch (err) {
    console.error('❌ Backend connection failed:', err.message);
    return { error: err.message };
  }
});

app.whenReady().then(createWindow);
