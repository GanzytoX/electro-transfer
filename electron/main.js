const { app, BrowserWindow, dialog } = require("electron");
const path = require("path");

// Manejo de errores global antes de cualquier otra cosa
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  dialog.showErrorBox(
    "Error inesperado",
    `Ocurrió un error y la aplicación debe cerrarse:\n\n${error.message}`,
  );
  app.quit();
});

// Habilitar remote para dialog
require("@electron/remote/main").initialize();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    resizable: false,
    maximizable: false,
    frame: false, // Sin marco nativo
    titleBarStyle: "hidden", // Ocultar barra de título nativa
    icon: path.join(
      __dirname,
      process.env.VITE_DEV_SERVER_URL
        ? "../src/shared/assets/app_logo.png"
        : "../assets/icon.png",
    ),
    backgroundColor: "#f8f9fa",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    show: false,
  });

  // Habilitar remote para esta ventana
  require("@electron/remote/main").enable(mainWindow.webContents);

  // En desarrollo, carga desde Vite. En producción, carga el build
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist-react/index.html"));
  }

  // Mostrar ventana cuando esté lista
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

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

app.on("render-process-gone", (event, webContents, details) => {
  console.error("Render process gone:", details);
});
