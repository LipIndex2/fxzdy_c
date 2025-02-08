@echo off
chcp 65001

set client_path=%~dp0

set /p targetPack=请输入包名：
set /p isDelete=是否需要删除未使用资源（默认为false）：

::客户端项目路径
set projectDirPath=%client_path%
::ui输出路径
set targetDirPath=%client_path%\fgui\assets\%targetPack%
::fgui路径
set toolPath=%client_path%\..\tools\fgui-res-check\dist

echo %toolPath%  %targetDirPath%

cd /d %toolPath%
node index.js %targetDirPath% %isDelete%
pause