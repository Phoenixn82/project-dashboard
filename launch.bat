@echo off
cd /d "C:\Users\thero\OneDrive\Desktop\claude_projects\project_dashboard"
start "" /min cmd /c "npm run dev"
echo Waiting for server...
:wait
timeout /t 1 /nobreak >nul
curl -s -o nul http://localhost:3000 && goto ready
goto wait
:ready
start "" "node_modules\.bin\electron.cmd" .
