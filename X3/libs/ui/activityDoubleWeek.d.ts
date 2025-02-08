declare namespace ui.activityDoubleWeek {
	class DoubleWeekMainView extends fgui.GComponent{
		public img_bg:fgui.GLoader;
		public T_title:fgui.GTextField;
		public list_award:fgui.GList;
		public T_time:fgui.GRichTextField;
		public headerItem1:ui.comm.header.HeaderItem;
		public btnRule:ui.comm.btn.BtnGth3;
		public btn_jump:ui.comm.btn.BaseBtn;
		public footer:ui.comm.back.BackFooter;
	}
	class DoubleWeekTaskTipsWin extends fgui.GComponent{
		public T_name:fgui.GTextField;
		public T_desc:fgui.GTextField;
		public bar:ui.activityDoubleWeek.item.awardBar2;
	}
}
declare namespace ui.activityDoubleWeek.item {
	class awardBar extends fgui.GProgressBar{
		public title:fgui.GTextField;
		public bar:fgui.GLoader;
	}
	class awardBar2 extends fgui.GProgressBar{
		public bar:fgui.GLoader;
		public title:fgui.GTextField;
	}
	class DoubleWeekAwardItem extends fgui.GComponent{
		public T_desc:fgui.GTextField;
		public list_award:fgui.GList;
		public bar:ui.activityDoubleWeek.item.awardBar;
		public btn_get:ui.comm.btn.BtnChangGui1;
		public btn_gotu:ui.comm.btn.BtnChangGui3;
		public redDot:ui.comm.com.RedDot;
	}
}
