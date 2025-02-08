declare namespace ui.activityEntrance {
	class EntranceMainView extends fgui.GComponent{
		public tabList:fgui.GList;
		public btnBack:ui.comm.back.BtnBack;
		public viewContainer:ui.comm.ViewContainer.ViewContainer;
		public footer:ui.comm.back.BackFooter3;
	}
}
declare namespace ui.activityEntrance.btn {
	class tabBtn extends fgui.GButton{
		public iconDown:fgui.GLoader;
		public iconUp:fgui.GLoader;
		public redDot:ui.comm.com.RedDot;
	}
}
