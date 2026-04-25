import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import { resolve } from "path";
import { existsSync, writeFileSync } from "fs";
import { tmpdir } from "os";

const PROJECTS_ROOT = resolve(process.cwd(), "..");

function extractPort(launchCommand: string): number {
  const match = launchCommand.match(/-p\s+(\d+)/);
  return match ? parseInt(match[1], 10) : 3000;
}

function launchWorkspace(projectDir: string, port: number) {
  const backtick = "`";
  const psScript = [
    "Add-Type -AssemblyName System.Windows.Forms",
    "Add-Type @\"\nusing System;\nusing System.Runtime.InteropServices;\npublic class Win32 {\n  [DllImport(\"user32.dll\")] public static extern bool SetForegroundWindow(IntPtr hWnd);\n  [DllImport(\"user32.dll\")] public static extern bool SetWindowPos(IntPtr hWnd, IntPtr after, int x, int y, int w, int h, uint flags);\n  [DllImport(\"user32.dll\")] public static extern bool ShowWindow(IntPtr hWnd, int cmd);\n}\n\"@",
    "",
    "$projectDir = '" + projectDir.replace(/'/g, "''") + "'",
    "$port = " + port,
    "",
    "# Open Antigravity",
    "Start-Process -FilePath 'antigravity.cmd' -ArgumentList $projectDir",
    "",
    "# Wait for window",
    "$agWnd = $null",
    "for ($i = 0; $i -lt 30; $i++) {",
    "  Start-Sleep -Seconds 1",
    "  $leaf = Split-Path $projectDir -Leaf",
    "  $procs = Get-Process -Name 'Antigravity' -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 -and $_.MainWindowTitle -match [regex]::Escape($leaf) }",
    "  if ($procs) { $agWnd = ($procs | Select-Object -First 1); break }",
    "}",
    "if (-not $agWnd) {",
    "  $agWnd = Get-Process -Name 'Antigravity' -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Sort-Object StartTime -Descending | Select-Object -First 1",
    "}",
    "",
    "if ($agWnd) {",
    "  [Win32]::SetForegroundWindow($agWnd.MainWindowHandle)",
    "  Start-Sleep -Milliseconds 500",
    "  # Ctrl+backtick to open terminal",
    "  [System.Windows.Forms.SendKeys]::SendWait('^{" + backtick + "}')",
    "  Start-Sleep -Seconds 2",
    "  [System.Windows.Forms.SendKeys]::SendWait('claude --dangerously-skip-permissions{ENTER}')",
    "}",
    "",
    "# Wait for dev server",
    "$ready = $false",
    "for ($i = 0; $i -lt 30; $i++) {",
    "  Start-Sleep -Seconds 1",
    "  try {",
    "    $null = Invoke-WebRequest -Uri \"http://localhost:$port\" -Method Head -TimeoutSec 2 -ErrorAction Stop",
    "    $ready = $true; break",
    "  } catch {}",
    "}",
    "",
    "if ($ready) {",
    "  Start-Process \"http://localhost:$port\"",
    "  Start-Sleep -Seconds 2",
    "",
    "  $screen = [System.Windows.Forms.Screen]::PrimaryScreen.WorkingArea",
    "  $halfW = [math]::Floor($screen.Width / 2)",
    "",
    "  $ag = Get-Process -Name 'Antigravity' -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Sort-Object StartTime -Descending | Select-Object -First 1",
    "  if ($ag) {",
    "    [Win32]::ShowWindow($ag.MainWindowHandle, 9)",
    "    [Win32]::SetWindowPos($ag.MainWindowHandle, [IntPtr]::Zero, $screen.X, $screen.Y, $halfW, $screen.Height, 0x0040)",
    "  }",
    "",
    "  foreach ($name in @('msedge','chrome','firefox','brave')) {",
    "    $br = Get-Process -Name $name -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Sort-Object StartTime -Descending | Select-Object -First 1",
    "    if ($br) {",
    "      [Win32]::ShowWindow($br.MainWindowHandle, 9)",
    "      [Win32]::SetWindowPos($br.MainWindowHandle, [IntPtr]::Zero, [int]($screen.X + $halfW), $screen.Y, $halfW, $screen.Height, 0x0040)",
    "      break",
    "    }",
    "  }",
    "}",
  ].join("\n");

  // Write script to temp file and execute
  const scriptPath = resolve(tmpdir(), "dashboard-launch-" + Date.now() + ".ps1");
  writeFileSync(scriptPath, psScript, "utf-8");

  spawn("powershell", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", scriptPath], {
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

    // Start the dev server (hidden)
    const server = spawn(launchCommand, {
      cwd: projectDir,
      shell: true,
      detached: true,
      stdio: "ignore",
      windowsHide: true,
    });
    server.unref();

    // PowerShell handles: open editor, terminal, claude, browser, snap
    launchWorkspace(projectDir, port);

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
