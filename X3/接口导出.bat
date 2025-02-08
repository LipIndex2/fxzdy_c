::@echo off
set client_path=%~dp0

::客户端项目目录
set projectDirPath=%client_path%
::错误码导出目录
set projectErrorPath=%client_path%\..\table\error.txt
::服务端接口目录
set outputDirPath=%client_path%\..\interface\module
::本工具所在目录
set toolPath=%client_path%\..\tools\InterfaceCreator

cd /d %toolPath%\lib
java -jar SG3InterfaceCreator.jar %projectDirPath% %projectErrorPath% %outputDirPath%

pause