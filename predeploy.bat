@echo off
rd /s /q dist>nul
cd public/files
del /q /s hcqscript.js>nul
powershell wget https://himaquest.com/nandoku.js -O ./hcqscript.js>nul
cd ../../
yarn build
