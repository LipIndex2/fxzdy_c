declare namespace ui.totalChargeDay {
	class totalChargeDayView extends fgui.GComponent{
		public endTimeTxt:fgui.GTextField;
		public chargeDayTxt:fgui.GTextField;
		public top:fgui.GGroup;
		public list:fgui.GList;
		public btnRule:ui.comm.btn.BtnGth3;
		public headerItem:ui.comm.header.HeaderItem;
	}
}
declare namespace ui.totalChargeDay.com {
	class BtnChangGui3 extends fgui.GButton{
		public redDot:ui.comm.com.RedDot;
	}
	class totalChargeDayCell extends fgui.GComponent{
		public hasDraw:fgui.GImage;
		public progressTip:fgui.GTextField;
		public taskName:fgui.GRichTextField;
		public btn:ui.totalChargeDay.com.BtnChangGui3;
		public rewards:ui.comm.item.ItemListComp;
	}
}
