declare namespace ui.server {
	class ChooseServerWin extends fgui.GComponent{
		public serverList:fgui.GList;
		public myList:fgui.GList;
		public areaList:fgui.GList;
	}
}
declare namespace ui.server.com {
	class State4Com extends fgui.GComponent{
	}
	class StateCom extends fgui.GComponent{
	}
}
declare namespace ui.server.item {
	class AreaItem extends fgui.GButton{
		public areaName:fgui.GTextField;
	}
	class PlayerItem extends fgui.GComponent{
		public headIcon:fgui.GLoader;
		public roleName:fgui.GTextField;
		public serverName:fgui.GTextField;
		public fightTxt:fgui.GTextField;
		public fightGp:fgui.GGroup;
		public curGp:fgui.GGroup;
	}
	class ServerItem extends fgui.GComponent{
		public serverName:fgui.GTextField;
		public state:ui.server.com.StateCom;
	}
}
