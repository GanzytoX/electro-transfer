const { app, BrowserWindow, dialog, screen } = require("electron");
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
  // Obtener dimensiones de la pantalla
  const { width: screenWidth, height: screenHeight } =
    screen.getPrimaryDisplay().workAreaSize;

  // Calcular tamaño de ventana (85% de la pantalla)
  // Con límites mínimos: 800x600 y máximos: 1200x900
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
