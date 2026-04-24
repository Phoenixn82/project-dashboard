$projectDir = "C:\Users\thero\OneDrive\Desktop\claude_projects\project_dashboard"
Set-Location $projectDir

# Start Next.js dev server hidden
$nextJob = Start-Process -FilePath "C:\Program Files\nodejs\npm.cmd" -ArgumentList "run","dev" -WorkingDirectory $projectDir -WindowStyle Hidden -PassThru

# Wait for server to be ready
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 1
    try {
        $null = Invoke-WebRequest -Uri "http://localhost:3000" -Method Head -TimeoutSec 2 -ErrorAction Stop
        $ready = $true
        break
    } catch {}
}

if ($ready) {
    # Launch Electron (visible)
    $electronPath = Join-Path $projectDir "node_modules\.bin\electron.cmd"
    $electronProc = Start-Process -FilePath $electronPath -ArgumentList "." -WorkingDirectory $projectDir -PassThru
    $electronProc.WaitForExit()
}

# Kill Next.js server on exit
Stop-Process -Id $nextJob.Id -Force -ErrorAction SilentlyContinue
