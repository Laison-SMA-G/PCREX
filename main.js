// main.js (ES Module)
import { app, BrowserWindow, ipcMain } from 'electron';
import axios from 'axios';
import cloudinary from './cloudinary.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Create __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

app.whenReady().then(createWindow);

// Cloudinary uploader via ipcMain
ipcMain.handle('upload-to-cloudinary', async (event, filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'products',
    });
    return { url: result.secure_url };
  } catch (err) {
    console.error('❌ Cloudinary upload failed:', err.message);
    return { error: err.message };
  }
});

// Quit when all windows are closed (except macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
