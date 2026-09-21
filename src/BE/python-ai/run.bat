@echo off
chcp 65001 > nul
cd /d "%~dp0"
title Sauna Alpaca - Python AI Server

echo =================================================================
echo   🌿 ĐANG KHỞI ĐỘNG PYTHON AI SERVER (PORT 8000)...
echo =================================================================

set "PY_EXE=%LOCALAPPDATA%\Python\bin\python.exe"

if exist "%PY_EXE%" (
    "%PY_EXE%" server.py
    goto end
)

where py >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    py server.py
    goto end
)

where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    python server.py
    goto end
)

echo [LỖI] Không tìm thấy Python trên máy tính.
echo Vui lòng kiểm tra Python tại: %LOCALAPPDATA%\Python\bin\python.exe

:end
pause
