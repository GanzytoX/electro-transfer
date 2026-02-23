import { app, BrowserWindow, dialog, screen, ipcMain } from "electron";
import path from "path";
import fs from "fs";
import os from "os";

process.on("uncaughtException", (error: Error) => {
  console.error("Uncaught Exception:", error);
  dialog.showErrorBox(
    "Error inesperado",
    `Ocurrió un error y la aplicación debe cerrarse:\n\n${error.message}`,
  );
  app.quit();
});

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  const { width: screenWidth, height: screenHeight } =
    screen.getPrimaryDisplay().workAreaSize;

  const windowWidth = Math.min(
    Math.max(Math.floor(screenWidth * 0.85), 800),
    1200,
  );
  const windowHeight = Math.min(
    Math.max(Math.floor(screenHeight * 0.85), 600),
    900,
  );

  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    resizable: false,
    maximizable: false,
    frame: false,
    titleBarStyle: "hidden",
    icon: path.join(
      __dirname,
      process.env.VITE_DEV_SERVER_URL
        ? "../src/shared/assets/app_logo.png"
        : "../assets/icon.png",
    ),
    backgroundColor: "#f8f9fa",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false,
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist-react/index.html"));
  }

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// ── IPC Handlers ──

ipcMain.on("window:minimize", (event) => {
  BrowserWindow.fromWebContents(event.sender)?.minimize();
});

ipcMain.on("window:close", (event) => {
  BrowserWindow.fromWebContents(event.sender)?.close();
});

ipcMain.handle("file:save", async (_event, content: string) => {
  const defaultPath = path.join(os.homedir(), "layout_transferencias.txt");

  const result = await dialog.showSaveDialog({
    title: "Guardar Layout",
    defaultPath,
    filters: [{ name: "Archivos de Texto", extensions: ["txt"] }],
  });

  if (!result.canceled && result.filePath) {
    fs.writeFileSync(result.filePath, content, "utf-8");
    return { success: true, filePath: result.filePath };
  }

  return { success: false };
});

// ── App lifecycle ──

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("render-process-gone", (_event, _webContents, details) => {
  console.error("Render process gone:", details);
});
