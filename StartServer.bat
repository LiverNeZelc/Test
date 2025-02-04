@echo off
D:
cd D:\GitHub\Test\Js
start npm start
timeout /t 5 /nobreak > nul
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /R "IPv4"') do (
    set IP_ADDRESS=%%i
)
set IP_ADDRESS=%IP_ADDRESS: =%
start http://%IP_ADDRESS%:3000/general/index.html
pause