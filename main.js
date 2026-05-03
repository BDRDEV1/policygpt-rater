const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { runDemoQuote } = require('./src/automation/engine');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    title: 'PolicyGPT Comparative Rater',
    backgroundColor: '#080b10',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile('src/ui/index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

ipcMain.handle('quote:runDemo', async () => {
  try {
    await runDemoQuote();
    return {
      ok: true,
      message: 'Demo quote automation completed.'
    };
  } catch (error) {
    return {
      ok: false,
      message: error.message || 'Automation failed.'
    };
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
