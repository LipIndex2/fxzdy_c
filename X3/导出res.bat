@echo off

set client_path=%~dp0

set tempPath=%client_path%\..\_temp
::================================ 图集 image ==================================
echo export image
::art目录路径
set imagePath=%client_path%\..\resource\res\image
::项目目录路径
set imageOutputPath=%client_path%\assets\resources2\image
::图集打包工具路径
set imageToolPath=%client_path%\..\tools\exportatlas

node %imageToolPath%/index.js %imagePath% %imageOutputPath% %tempPath%
::==================================================================

::=============================== 图集 序列帧 ===================================
echo export spriteFrame
::art目录路径
set spriteFramePath=%client_path%\..\resource\res\spriteFrame
::项目目录路径
set spriteFrameOutputPath=%client_path%\assets\resources3\spriteFrame
::图集打包工具路径
set spriteFrameToolPath=%client_path%\..\tools\exportSpriteFrame

node %spriteFrameToolPath%/index.js %spriteFramePath% %spriteFrameOutputPath% %tempPath%
::==================================================================

::============================ 其他资源 ======================================
echo export res
::资源拷贝工具路径
set toolPath=%client_path%\..\tools\exportRes

::============================ 地图修改工具 ===================================
set mapModifyToolPath=%client_path%\..\tools\modifyExportedRes

::art目录路径
set resPath=%client_path%\..\resource\res\
::art输出目录路径
set res_outputPath=%client_path%\assets\resources\
::art输出目录2路径
set res2_outputPath=%client_path%\assets\resources2\
::art输出目录3路径
set res3_outputPath=%client_path%\assets\resources3\


set targetName=login
node %toolPath%/index.js %resPath%%targetName% %res_outputPath%%targetName% %tempPath%

set targetName=spine
node %toolPath%/index.js %resPath%%targetName% %res3_outputPath%%targetName% %tempPath%

set targetName=audio
node %toolPath%/index.js %resPath%%targetName% %res2_outputPath%%targetName% %tempPath%

set targetName=video
node %toolPath%/index.js %resPath%%targetName% %res2_outputPath%%targetName% %tempPath%

::=========================== 地图 =======================================
echo export map
::地图目录路径
set mapPath=%client_path%\..\resource\map\tiledMap
:: 输出文件夹
set mapOutputPath=%client_path%\assets\resources3\tiledMap

node %toolPath%/index.js %mapPath% %mapOutputPath%  %tempPath%
::=========================== 修改地图 ====================================
echo modify map
:: 修改地图目录路径
set mapOutputPath=%client_path%\assets\resources3\tiledMap

node %mapModifyToolPath%/index.js %mapOutputPath% %tempPath%

::==================================================================

pause