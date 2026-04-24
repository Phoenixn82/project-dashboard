import { NextRequest, NextResponse } from "next/server";
import { spawn, exec } from "child_process";
import { resolve } from "path";
import { existsSync } from "fs";

const PROJECTS_ROOT = resolve(process.cwd(), "..");

function extractPort(launchCommand: string): number {
  const match = launchCommand.match(/-p\s+(\d+)/);
  return match ? parseInt(match[1], 10) : 3000;
}

async function waitForServer(port: number, timeoutMs = 30000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await fetch(`http://localhost:${port}`, { method: "HEAD" });
      return true;
    } catch {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  return false;
}

function snapWindows() {
  // PowerShell script to snap Antigravity left, browser right
  const ps = `
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class Win32 {
  [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr hWnd, IntPtr after, int x, int y, int w, int h, uint flags);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int cmd);
}
"@
$screen = [System.Windows.Forms.Screen]::PrimaryScreen.WorkingArea
$halfW = [math]::Floor($screen.Width / 2)

# Find Antigravity window
$ag = Get-Process -Name "Antigravity" -ErrorAction SilentlyContinue | Select-Object -First 1
if ($ag -and $ag.MainWindowHandle -ne 0) {
  [Win32]::ShowWindow($ag.MainWindowHandle, 9)
  [Win32]::SetWindowPos($ag.MainWindowHandle, [IntPtr]::Zero, $screen.X, $screen.Y, $halfW, $screen.Height, 0x0040)
}

# Find browser window (most recent chrome/edge/firefox)
Start-Sleep -Milliseconds 500
foreach ($name in @("msedge","chrome","firefox","brave")) {
  $br = Get-Process -Name $name -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Sort-Object StartTime -Descending | Select-Object -First 1
  if ($br) {
    [Win32]::ShowWindow($br.MainWindowHandle, 9)
    [Win32]::SetWindowPos($br.MainWindowHandle, [IntPtr]::Zero, $screen.X + $halfW, $screen.Y, $halfW, $screen.Height, 0x0040)
    break
  }
}
`;

  spawn("powershell", ["-NoProfile", "-Command", ps], {
    detached: true,
    stdio: "ignore",
    windowsHide: true,
  }).unref();
}

export async function POST(req: NextRequest) {
  const { id, localPath, launchCommand } = await req.json();

  if (!id || !localPath || !launchCommand) {
    return NextResponse.json(
      { error: "Missing id, localPath, or launchCommand" },
      { status: 400 }
    );
  }

  const projectDir = resolve(PROJECTS_ROOT, localPath);

  if (!existsSync(projectDir)) {
    return NextResponse.json(
      { error: `Project directory not found: ${projectDir}` },
      { status: 404 }
    );
  }

  if (!projectDir.startsWith(PROJECTS_ROOT)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 403 });
  }

  try {
    const port = extractPort(launchCommand);

    // 1. Start the dev server (hidden)
    const server = spawn(launchCommand, {
      cwd: projectDir,
      shell: true,
      detached: true,
      stdio: "ignore",
      windowsHide: true,
    });
    server.unref();

    // 2. Open Antigravity at the project folder
    const editor = spawn("antigravity", [projectDir], {
      detached: true,
      stdio: "ignore",
      windowsHide: true,
    });
    editor.unref();

    // 3. Launch Claude in Antigravity's terminal via the CLI
    //    Small delay to let the editor window initialize
    setTimeout(() => {
      spawn(
        "antigravity",
        [
          "--reuse-window",
          "--command",
          `workbench.action.terminal.new`,
        ],
        { detached: true, stdio: "ignore", windowsHide: true }
      ).unref();

      // Type claude command into the new terminal
      setTimeout(() => {
        spawn(
          "powershell",
          [
            "-NoProfile",
            "-Command",
            `Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('claude --dangerously-skip-permissions{ENTER}')`,
          ],
          { detached: true, stdio: "ignore", windowsHide: true }
        ).unref();
      }, 2000);
    }, 3000);

    // 4. Wait for server, then open browser and snap windows
    waitForServer(port).then((ready) => {
      if (ready) {
        // Open in default browser
        spawn("cmd", ["/c", "start", `http://localhost:${port}`], {
          detached: true,
          stdio: "ignore",
          windowsHide: true,
        }).unref();

        // Snap windows after browser opens
        setTimeout(() => snapWindows(), 2000);
      }
    });

    return NextResponse.json({
      ok: true,
      message: `Launching "${id}" — editor + browser on :${port}`,
      pid: server.pid,
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to launch: ${err}` },
      { status: 500 }
    );
  }
}
