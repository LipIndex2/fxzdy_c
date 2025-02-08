declare namespace ui.activityReachStandard {
	class ReachStandardMainView extends fgui.GComponent{
		public img_bg:fgui.GLoader;
		public T_title:fgui.GTextField;
		public T_count:fgui.GRichTextField;
		public T_time:fgui.GRichTextField;
		public list_tab:fgui.GList;
		public list_Goods:fgui.GList;
		public list_task:fgui.GList;
		public G_drawCard:fgui.GGroup;
		public G_sec:fgui.GGroup;
		public G_black:fgui.GGroup;
		public btnRule:ui.comm.btn.BtnGth3;
		public btn_jump:ui.comm.btn.BaseBtn;
		public btn_jumpBlack:ui.activityReachStandard.btn.WeekCycleGoHangUpBtn;
		public btn_jumpSec:ui.activityReachStandard.btn.WeekCycleGoSecretLevelBtn;
		public btn_left:ui.activityReachStandard.item.btn_jt;
		public btn_right:ui.activityReachStandard.item.btn_jt;
		public headerItem2:ui.comm.header.HeaderItem;
	}
	class ReachStandardTaskView extends fgui.GComponent{
		public img_bg:fgui.GLoader;
		public T_title:fgui.GTextField;
		public T_count:fgui.GRichTextField;
		public T_time:fgui.GRichTextField;
		public list_task:fgui.GList;
		public btnRule:ui.comm.btn.BtnGth3;
		public btn_jump:ui.comm.btn.BaseBtn;
		public btn_left:ui.activityReachStandard.item.btn_jt;
		public btn_right:ui.activityReachStandard.item.btn_jt;
		public headerItem2:ui.comm.header.HeaderItem;
	}
}
declare namespace ui.activityReachStandard.btn {
	class tabBtn extends fgui.GButton{
		public T_title1:fgui.GTextField;
		public T_title2:fgui.GTextField;
		public redDot:ui.comm.com.RedDot;
	}
	class WeekCycleGoHangUpBtn extends fgui.GButton{
	}
	class WeekCycleGoSecretLevelBtn extends fgui.GButton{
	}
}
declare namespace ui.activityReachStandard.item {
	class btn_jt extends fgui.GButton{
		public redDot:ui.comm.com.RedDot;
	}
	class ReachStandardGoodsItem extends fgui.GComponent{
		public list_award:fgui.GList;
		public T_count:fgui.GRichTextField;
		public T_name:fgui.GTextField;
		public btn_get:ui.comm.btn.BtnChangGui1;
		public redDot:ui.comm.com.RedDot;
		public btn_buy:ui.comm.btn.BtnChangGui1WithItem;
	}
	class ReachStandardTaskItem extends fgui.GComponent{
		public T_taskName:fgui.GTextField;
		public T_count:fgui.GTextField;
		public list_award:fgui.GList;
		public btn_get:ui.comm.btn.BtnChangGui1;
		public btn_goto:ui.comm.btn.BtnChangGui3;
		public redDot:ui.comm.com.RedDot;
	}
}
