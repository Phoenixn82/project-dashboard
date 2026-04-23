const { app, BrowserWindow } = require("electron");
const { spawn } = require("child_process");
const path = require("path");

let mainWindow;
let nextProcess;

function startNextServer() {
  const projectRoot = path.resolve(__dirname, "..");
  nextProcess = spawn("npm", ["run", "dev"], {
    cwd: projectRoot,
    shell: true,
    stdio: "pipe",
  });

  return new Promise((resolve) => {
    nextProcess.stdout.on("data", (data) => {
      const output = data.toString();
      if (output.includes("Ready in") || output.includes("localhost:3000")) {
        resolve();
      }
    });

    nextProcess.stderr.on("data", (data) => {
      // Next.js logs some info to stderr
      const output = data.toString();
      if (output.includes("Ready in") || output.includes("localhost:3000")) {
        resolve();
      }
    });

    // Fallback timeout
    setTimeout(resolve, 8000);
  });
}

async function createWindow() {
  await startNextServer();

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "Project Dashboard",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL("http://localhost:3000");
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (nextProcess) {
    nextProcess.kill();
  }
  app.quit();
});

app.on("before-quit", () => {
  if (nextProcess) {
    nextProcess.kill();
  }
});
