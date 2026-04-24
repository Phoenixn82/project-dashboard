import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import { resolve } from "path";
import { existsSync } from "fs";

const PROJECTS_ROOT = resolve(process.cwd(), "..");

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

  // Ensure projectDir is within the projects root (prevent path traversal)
  if (!projectDir.startsWith(PROJECTS_ROOT)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 403 });
  }

  try {
    // On Windows, use 'start' to give the process its own console window.
    // Without this, detached + stdio:"ignore" strips console handles and
    // batch-file commands like timeout/pause break immediately.
    const child =
      process.platform === "win32"
        ? spawn("cmd", ["/c", "start", '""', "/D", projectDir, launchCommand], {
            detached: true,
            stdio: "ignore",
          })
        : spawn(launchCommand, {
            cwd: projectDir,
            shell: true,
            detached: true,
            stdio: "ignore",
          });

    child.unref();

    return NextResponse.json({
      ok: true,
      message: `Launched "${id}" with: ${launchCommand}`,
      pid: child.pid,
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to launch: ${err}` },
      { status: 500 }
    );
  }
}
