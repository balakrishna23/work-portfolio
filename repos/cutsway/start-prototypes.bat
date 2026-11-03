@echo off
rem Starts a local server for the Cutsway prototypes and opens the gallery.
rem prototypes\ holds Raw Pile and Night Shift; other-prototypes\ holds everything else.
rem Close this window to stop the server.
cd /d "%~dp0"
start "" http://localhost:8765/prototypes/
python -m http.server 8765
