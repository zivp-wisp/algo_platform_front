@echo off
echo Updating backend repository...
cd /d "C:\WiSP\algo_platform_backend"
git pull origin main
git submodule update --init --recursive

echo Starting backend server...
start cmd /k "python server.py"

timeout /t 5 /nobreak

echo Updating frontend repository...
cd /d "C:\WiSP\algo_platform_front"
git pull origin main

echo Starting frontend server...
start cmd /k "npm run dev"

timeout /t 3 /nobreak

echo Opening browser...
start http://localhost:5173
exit
