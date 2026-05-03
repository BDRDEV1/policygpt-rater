const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { runDemoQuote } = require('./src/automation/engine');
const {
  saveCredential,
  getCredential,
  deleteCredential
} = require('./src/services/credentials');

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
    const result = await runDemoQuote();

    return {
      ok: true,
      message: result.result,
      result
    };
  } catch (error) {
    return {
      ok: false,
      message: error.message || 'Automation failed.'
    };
  }
});

ipcMain.handle('cred:save', async (event, key, value) => {
  await saveCredential(key, value);
  return { ok: true };
});

ipcMain.handle('cred:get', async (event, key) => {
  const value = await getCredential(key);
  return value;
});

ipcMain.handle('cred:delete', async (event, key) => {
  const deleted = await deleteCredential(key);
  return { ok: deleted };
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
