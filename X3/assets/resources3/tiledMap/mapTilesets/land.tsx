<?xml version="1.0" encoding="UTF-8"?>
<tileset version="1.10" tiledversion="1.10.2" name="land" tilewidth="200" tileheight="120" tilecount="40" columns="5">
 <image source="land.png" trans="ff00ff" width="1000" height="960"/>
 <tile id="16">
  <objectgroup draworder="index" id="2">
   <object id="1" x="50.2177" y="0.463714" width="63.0677" height="120"/>
  </objectgroup>
 </tile>
 <wangsets>
  <wangset name="道路" type="mixed" tile="-1">
   <wangcolor name="" color="#ff0000" tile="-1" probability="1"/>
   <wangcolor name="" color="#00ff00" tile="-1" probability="1"/>
   <wangtile tileid="29" wangid="1,2,1,1,1,1,1,1"/>
   <wangtile tileid="30" wangid="1,2,1,1,1,2,1,1"/>
   <wangtile tileid="31" wangid="2,2,1,1,1,2,2,2"/>
   <wangtile tileid="32" wangid="1,2,1,2,1,1,1,1"/>
   <wangtile tileid="33" wangid="1,1,1,1,1,2,1,2"/>
   <wangtile tileid="34" wangid="1,1,1,2,2,2,1,1"/>
   <wangtile tileid="35" wangid="2,2,1,1,1,1,1,2"/>
   <wangtile tileid="37" wangid="1,2,1,2,1,2,1,2"/>
   <wangtile tileid="38" wangid="1,1,1,1,1,1,1,2"/>
   <wangtile tileid="39" wangid="1,1,1,2,1,1,1,2"/>
  </wangset>
  <wangset name="草地" type="mixed" tile="-1">
   <wangcolor name="" color="#ff0000" tile="-1" probability="1"/>
   <wangcolor name="" color="#00ff00" tile="-1" probability="1"/>
   <wangtile tileid="16" wangid="2,2,2,0,1,1,1,0"/>
   <wangtile tileid="17" wangid="2,2,2,2,2,1,1,1"/>
   <wangtile tileid="18" wangid="1,0,2,2,2,0,1,1"/>
   <wangtile tileid="19" wangid="2,2,2,1,1,1,2,2"/>
   <wangtile tileid="20" wangid="2,2,2,2,2,2,2,2"/>
   <wangtile tileid="21" wangid="1,1,2,2,2,2,2,1"/>
   <wangtile tileid="22" wangid="2,0,1,1,1,0,2,2"/>
   <wangtile tileid="23" wangid="2,1,1,1,2,2,2,2"/>
   <wangtile tileid="24" wangid="1,1,1,0,2,2,2,0"/>
  </wangset>
 </wangsets>
</tileset>
