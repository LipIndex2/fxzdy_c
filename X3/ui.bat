@echo off

set client_path=%~dp0

set tempPath=%client_path%\..\_temp

::客户端项目路径
set projectDirPath=%client_path%
::ui输出路径
set outputDirPath=%client_path%\assets\resources\ui
::fgui路径
set toolPath=%client_path%\..\tools\fgui_export

echo %toolPath%  %projectDirPath% %outputDirPath%

cd /d %toolPath%
node index.js %projectDirPath% %outputDirPath% %tempPath%
pause