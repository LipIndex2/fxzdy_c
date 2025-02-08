declare namespace ui.gameMode {
	class GameModeMainView extends fgui.GComponent{
		public content:fgui.GGroup;
		public itemList:fgui.GList;
		public fg:fgui.GImage;
		public footPart:fgui.GGroup;
	}
}
declare namespace ui.gameMode.components {
	class GameModeSubItemComp extends fgui.GComponent{
	}
	class GameModeTabComp extends fgui.GComponent{
		public bg:fgui.GLoader;
		public labelTitle:fgui.GTextField;
		public labelDesc:fgui.GTextField;
		public labelChildTitle1:fgui.GTextField;
		public labelChildValue1:fgui.GTextField;
		public labelChildTitle2:fgui.GTextField;
		public imageValue:fgui.GLoader;
		public labelChildValue2:fgui.GTextField;
		public iconStar:fgui.GImage;
		public G_type0:fgui.GGroup;
		public godItemList:fgui.GList;
		public G_type1:fgui.GGroup;
		public bgLock:fgui.GLoader;
		public labelLockTitle:fgui.GTextField;
		public imageLock:fgui.GImage;
		public lockP:fgui.GGroup;
		public mc:fgui.GGroup;
		public redDot:ui.comm.com.RedDot;
	}
}
