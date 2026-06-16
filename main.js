const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, screen } = require('electron')
const path = require('path')
const fs   = require('fs')

let mainWindow
let tray
let Anthropic

// Lazy-load SDK so app starts even without it installed yet
function getAnthropic(apiKey) {
  if (!Anthropic) Anthropic = require('@anthropic-ai/sdk').default || require('@anthropic-ai/sdk')
  return new Anthropic({ apiKey })
}

// ---- Persistent data ----
const dataPath = path.join(app.getPath('userData'), 'kira-data.json')

function loadData() {
  try { return JSON.parse(fs.readFileSync(dataPath, 'utf8')) }
  catch { return { name: '', apiKey: '', tasks: [], history: [] } }
}

function saveData(data) {
  try { fs.writeFileSync(dataPath, JSON.stringify(data, null, 2)) }
  catch (e) { console.error('Save failed:', e.message) }
}

// ---- Window dimensions ----
const COMPACT_W  = 210
const COMPACT_H  = 330
const EXPANDED_W = 590
const EXPANDED_H = 460

function createWindow() {
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize

  mainWindow = new BrowserWindow({
    width:  COMPACT_W,
    height: COMPACT_H,
    x: sw - COMPACT_W - 20,
    y: sh - COMPACT_H - 20,
    transparent: true,
    frame:       false,
    alwaysOnTop: true,
    resizable:   false,
    skipTaskbar: true,
    hasShadow:   false,
    webPreferences: {
      preload:          path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration:  false,
    },
  })

  mainWindow.loadFile('index.html')
  // mainWindow.webContents.openDevTools({ mode: 'detach' })

  mainWindow.on('closed', () => { mainWindow = null })
}

function createTray() {
  const iconPath = path.join(__dirname, 'assets', 'tray-icon.png')
  const icon = nativeImage.createFromPath(iconPath).resize({ width: 22, height: 22 })
  tray = new Tray(icon)

  const menu = Menu.buildFromTemplate([
    { label: 'Show Kira',    click: () => mainWindow?.show() },
    { label: 'Hide Kira',    click: () => mainWindow?.hide() },
    { type: 'separator' },
    { label: 'Quit PocketAI', click: () => app.quit() },
  ])

  tray.setToolTip('PocketAI — Kira')
  tray.setContextMenu(menu)
  tray.on('click', () => {
    if (mainWindow) mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
  })
}

// ---- IPC handlers ----

// Expand/collapse the window
ipcMain.handle('set-expanded', (_, expanded) => {
  if (!mainWindow) return
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize
  const w = expanded ? EXPANDED_W : COMPACT_W
  const h = expanded ? EXPANDED_H : COMPACT_H
  const x = sw - w - 20
  const y = sh - h - 20
  mainWindow.setBounds({ x, y, width: w, height: h }, true)
})

// Chat with Claude
ipcMain.handle('chat', async (_, { messages, systemPrompt, apiKey }) => {
  if (!apiKey) return { ok: false, error: 'No API key set' }
  try {
    const client = getAnthropic(apiKey)
    const res = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system:     systemPrompt,
      messages,
    })
    return { ok: true, text: res.content[0].text }
  } catch (e) {
    return { ok: false, error: e.message }
  }
})

// Data persistence
ipcMain.handle('load-data', ()          => loadData())
ipcMain.handle('save-data', (_, data)  => { saveData(data); return true })

// ---- App lifecycle ----
app.whenReady().then(() => {
  createWindow()
  createTray()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
