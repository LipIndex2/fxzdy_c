@echo off
set client_path=%~dp0

:：目标表格文件夹路径
set tablePath=%client_path%\..\table
:: 输出表格.zipp 文件夹
set outputTablePath=%client_path%\assets\resources
:: 前端项目文件夹
set projectDirPath=%client_path%
:: 工具文件夹
set toolPath=%client_path%\..\tools\xlsx
::更新表格
::svn update %tablePath%

cd /d %toolPath%\xlsxexport
node index.js %tablePath% %outputTablePath% %projectDirPath%
pause