@echo off

set client_path=%~dp0


::输入markdown路径
set inputMarkdownPath=%client_path%\..\interface\GameEnumDes.md
::输出ts路径
set outputEnumTsFilePath=%client_path%\assets\scripts\libs\extras\ServerEnums.ts
::fgui路径
set toolPath=%client_path%\..\tools\ts-enum-from-markdown

echo '------------ start export enums from markdown -----------'
echo %toolPath% 
echo %outputEnumTsFilePath% 
echo %outputDirPath%
echo '------------ /start export enums from markdown -----------'

cd /d %toolPath%

@REM :: 檢查是否已安裝
@REM echo '------------ npm dependency -----------'
@REM if not exist "node_modules" (
@REM   echo 'Installing npm dependencies...'
@REM   call npm run installAll && echo 'Installation complete'
@REM ) else (
@REM   echo 'Dependencies already installed.'
@REM )
@REM echo '------------ /npm dependency -----------'

@REM echo 'start generate enums from markdown'
@REM npm run generate -- %inputMarkdownPath% %outputEnumTsFilePath%
@REM echo '/end'


node ./src/ts-enum-from-markdown.js %inputMarkdownPath% %outputEnumTsFilePath%


pause