declare namespace ui.activityOpenCharge {
	class openChargeView extends fgui.GComponent{
		public tabList:fgui.GList;
		public viewContainer:ui.comm.ViewContainer.ViewContainer;
		public footer:ui.comm.back.BackFooter3;
	}
}
declare namespace ui.activityOpenCharge.btn {
	class tabBtn extends fgui.GButton{
		public iconDown:fgui.GLoader;
		public iconUp:fgui.GLoader;
		public redDot:ui.comm.com.RedDot;
	}
}
