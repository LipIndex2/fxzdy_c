declare namespace ui.mapInstance.item {
	class AwardItem extends fgui.GComponent{
		public bg:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public list_award:fgui.GList;
		public btnData:ui.comm.btn.BtnData;
	}
	class miniMapItem extends fgui.GComponent{
		public MiniMap:ui.comm.miniMap.MiniMapItem;
	}
}
declare namespace ui.mapInstance.view {
	class BattleWinResultWin extends fgui.GComponent{
		public bg:fgui.GLoader;
		public labelTips:fgui.GTextField;
		public modelNode:ui.comm.node.ModelNode;
		public panel:ui.mapInstance.item.AwardItem;
	}
	class BossArriveView extends fgui.GComponent{
		public bg:fgui.GImage;
		public boss_bg1:fgui.GImage;
		public boss_bg2:fgui.GImage;
		public text_boss:fgui.GTextField;
	}
	class MapInstanceView extends fgui.GComponent{
		public text_heroName:fgui.GTextField;
		public group_help:fgui.GGroup;
		public img_jd:fgui.GImage;
		public img_jdt1:fgui.GImage;
		public img_anim1:fgui.GImage;
		public T_name:fgui.GTextField;
		public modelNode:ui.comm.node.ModelNode;
		public MiniMap:ui.comm.miniMap.MiniMapItem;
		public btnBack:ui.comm.back.BtnBack75;
		public buildingBtn:ui.comm.building.BuildingBtn;
	}
}
