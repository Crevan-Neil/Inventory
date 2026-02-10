@echo off
cd /d "%~dp0"
start "" "http://localhost:400"
node app.js
