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

function launchWorkspace(projectDir: string, launchCommand: string, port: number) {
  const backtick = "`";
  const psScript = [
    "Add-Type -AssemblyName System.Windows.Forms",
    'Add-Type @"\nusing System;\nusing System.Runtime.InteropServices;\npublic class Win32 {\n  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);\n}\n"@',
    "",
    "$projectDir = '" + projectDir.replace(/'/g, "''") + "'",
    "$port = " + port,
    "",
    "# Start dev server completely hidden",
    "Start-Process -FilePath 'cmd.exe' -ArgumentList '/c " + launchCommand.replace(/'/g, "''") + "' -WorkingDirectory $projectDir -WindowStyle Hidden",
    "",
    "# Open Antigravity",
    "Start-Process -FilePath 'antigravity.cmd' -ArgumentList $projectDir",
    "",
    "# Wait for Antigravity window with this project",
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
    "  # Focus Antigravity and open terminal with Claude",
    "  [Win32]::SetForegroundWindow($agWnd.MainWindowHandle)",
    "  Start-Sleep -Milliseconds 500",
    "  [System.Windows.Forms.SendKeys]::SendWait('^{" + backtick + "}')",
    "  Start-Sleep -Seconds 2",
    "  [System.Windows.Forms.SendKeys]::SendWait('claude --dangerously-skip-permissions{ENTER}')",
    "  Start-Sleep -Milliseconds 500",
    "",
    "  # Snap Antigravity to LEFT half with Win+Left",
    "  [Win32]::SetForegroundWindow($agWnd.MainWindowHandle)",
    "  Start-Sleep -Milliseconds 300",
    "  [System.Windows.Forms.SendKeys]::SendWait('#{LEFT}')",
    "}",
    "",
    "# Wait for dev server",
    "$ready = $false",
    "for ($i = 0; $i -lt 30; $i++) {",
    "  Start-Sleep -Seconds 1",
    "  try {",
    '    $null = Invoke-WebRequest -Uri "http://localhost:$port" -Method Head -TimeoutSec 2 -ErrorAction Stop',
    "    $ready = $true; break",
    "  } catch {}",
    "}",
    "",
    "if ($ready) {",
    "  # Open browser",
    '  Start-Process "http://localhost:$port"',
    "  Start-Sleep -Seconds 3",
    "",
    "  # Snap browser to RIGHT half with Win+Right",
    "  # The browser should be the foreground window after opening",
    "  [System.Windows.Forms.SendKeys]::SendWait('#{RIGHT}')",
    "}",
  ].join("\n");

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
    launchWorkspace(projectDir, launchCommand, port);

    return NextResponse.json({
      ok: true,
      message: `Launching "${id}" — editor + browser on :${port}`,
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to launch: ${err}` },
      { status: 500 }
    );
  }
}
