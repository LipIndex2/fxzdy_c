declare namespace ui.activityLifelong {
	class LifelongMainView extends fgui.GComponent{
		public T_title:fgui.GTextField;
		public list_task:fgui.GList;
		public list_tab:fgui.GList;
		public list_gift:fgui.GList;
		public list_award:fgui.GList;
		public gp_task:fgui.GGroup;
		public gp_gift:fgui.GGroup;
		public T_count:fgui.GTextField;
		public T_time:fgui.GTextField;
		public btnRule:ui.comm.btn.BtnGth3;
		public btn_jump:ui.comm.btn.BaseBtn0.8Scale;
	}
}
declare namespace ui.activityLifelong.btn {
	class tabBtn extends fgui.GButton{
		public redDot:ui.comm.com.RedDot;
	}
}
declare namespace ui.activityLifelong.item {
	class awardBar extends fgui.GProgressBar{
		public bar_v:fgui.GImage;
	}
	class awardItem extends fgui.GComponent{
		public T_num:fgui.GTextField;
		public list_award:fgui.GList;
		public bar:ui.activityLifelong.item.awardBar;
	}
	class giftItem extends fgui.GComponent{
		public list_award:fgui.GList;
		public T_name:fgui.GTextField;
		public T_count:fgui.GTextField;
		public btn_get:ui.comm.btn.BtnChangGui1;
	}
	class taskBar extends fgui.GProgressBar{
		public bar:fgui.GImage;
		public title:fgui.GTextField;
	}
	class taskItem extends fgui.GComponent{
		public T_taskDesc:fgui.GTextField;
		public bar:ui.activityLifelong.item.taskBar;
		public btn_goto:ui.comm.btn.BtnChangGui3;
		public item:ui.comm.item.ItemFrameBtn;
		public btn_get:ui.comm.btn.BtnChangGui1;
	}
}
