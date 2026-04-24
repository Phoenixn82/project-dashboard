@echo off
cd /d "C:\Users\thero\OneDrive\Desktop\claude_projects\project_dashboard"
start "" /b /min cmd /c "npm run dev >nul 2>&1"
:wait
timeout /t 1 /nobreak >nul
curl -s -o nul http://localhost:3000 && goto ready
goto wait
:ready
start "" /b "node_modules\.bin\electron.cmd" .
