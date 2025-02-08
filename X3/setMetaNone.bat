@echo off

set client_path=%~dp0

set tempPath=%client_path%\..\_temp

::客户端项目路径
set projectDirPath=%client_path%
::资源路径
set targetDirPath=%client_path%\assets\
::工具路径
set toolPath=%client_path%\..\tools\setCocosMeta

echo %toolPath%  %targetDirPath%

cd /d %toolPath%

set resDir=resources
::node index.js %targetDirPath%%resDir%  %tempPath%

set resDir=resources2
::node index.js %targetDirPath%%resDir%  %tempPath%

set resDir=resources3
node index.js %targetDirPath%%resDir%  %tempPath%

pause