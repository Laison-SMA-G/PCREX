const { app, BrowserWindow, ipcMain } = require('electron');
const axios = require('axios');
import cloudinary from "./cloudinary.js";
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

app.whenReady().then(() => {
  createWindow();
});

// Handle Cloudinary upload
import cloudinary from "./cloudinary.js"; // make sure you have cloudinary.js

ipcMain.handle('upload-to-cloudinary', async (event, filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "products",
    });
    return { url: result.secure_url };
  } catch (err) {
    console.error("❌ Cloudinary upload failed:", err.message);
    return { error: err.message };
  }
});


app.whenReady().then(createWindow);
