@echo off
cd /d "C:\WiSP\algo_platform_backend"
start cmd /k "python server.py"

timeout /t 5 /nobreak

cd /d "C:\WiSP\algo_platform_front
start cmd /k "npm run dev"

timeout /t 3 /nobreak

start http://localhost:5173
exit
