declare namespace ui.activityTotalCharge.item {
	class TotalChargeItem extends fgui.GComponent{
		public lbName:fgui.GTextField;
		public lbProgress:fgui.GTextField;
		public listReward:fgui.GList;
		public btnDraw:ui.comm.btn.BtnChangGui1;
		public btnGoto:ui.comm.btn.BtnChangGui3;
		public redDot:ui.comm.com.RedDot;
	}
}
declare namespace ui.activityTotalCharge.view {
	class TotalChargeView extends fgui.GComponent{
		public top_bg:fgui.GImage;
		public lbTime:fgui.GTextField;
		public lbTitle:fgui.GTextField;
		public list:fgui.GList;
		public btnRule:ui.comm.btn.BtnGth3;
		public headerItem:ui.comm.header.HeaderItem;
	}
}
