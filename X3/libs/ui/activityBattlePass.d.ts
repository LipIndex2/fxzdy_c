declare namespace ui.activityBattlePass {
	class BattlePassMainWin extends fgui.GComponent{
		public list_task:fgui.GList;
		public list_taskBtn:fgui.GList;
		public list_tab:fgui.GList;
		public list_award:fgui.GList;
		public T_time:fgui.GTextField;
		public T_level:fgui.GTextField;
		public T_bar:fgui.GTextField;
		public img_item:fgui.GLoader;
		public btn_get:ui.comm.btn.BtnChangGui1;
		public btn_buy:ui.comm.btn.BtnChangGui1;
		public btnRule:ui.comm.btn.BaseBtn;
		public bar_level:ui.activityBattlePass.bar.BattlePassLevelBar;
		public bigAwardItem:ui.activityBattlePass.item.BattlePassAwardItem3;
		public footer:ui.comm.back.BackFooter3;
	}
	class BattlePassPreviewWin extends fgui.GComponent{
		public list_desc1:fgui.GList;
		public list_desc2:fgui.GList;
		public list_award:fgui.GList;
		public btn_get1:ui.comm.btn.BtnChangGui1;
		public btn_get2:ui.comm.btn.BtnChangGui1;
	}
}
declare namespace ui.activityBattlePass.bar {
	class BattlePassLevelBar extends fgui.GProgressBar{
		public bg:fgui.GImage;
		public bar:fgui.GImage;
	}
	class BattlePassTaskBar extends fgui.GProgressBar{
		public bg:fgui.GImage;
		public bar:fgui.GImage;
	}
}
declare namespace ui.activityBattlePass.btn {
	class BattlePassTabBtn extends fgui.GButton{
		public bg:fgui.GLoader;
		public T_tips1:fgui.GTextField;
		public T_tips2:fgui.GTextField;
		public redDot:ui.comm.com.RedDot;
	}
	class TaskSelBtn extends fgui.GButton{
		public bg:fgui.GLoader;
		public T_tips1:fgui.GTextField;
		public T_tips2:fgui.GTextField;
		public redDot:ui.comm.com.RedDot;
	}
}
declare namespace ui.activityBattlePass.item {
	class BattlePassAwardItem1 extends fgui.GComponent{
		public list_award1:fgui.GList;
		public list_award2:fgui.GList;
		public T_level:fgui.GTextField;
	}
	class BattlePassAwardItem2 extends fgui.GComponent{
		public img_icon:fgui.GLoader;
		public T_Count:fgui.GTextField;
	}
	class BattlePassAwardItem3 extends fgui.GComponent{
		public list_award1:fgui.GList;
		public list_award2:fgui.GList;
		public T_level:fgui.GTextField;
	}
	class BattlePassTaskItem extends fgui.GComponent{
		public T_bar:fgui.GTextField;
		public T_taks:fgui.GTextField;
		public item:ui.comm.item.ItemFrameBtn;
		public btn_get:ui.comm.btn.BtnChangGui3;
		public bar:ui.activityBattlePass.bar.BattlePassTaskBar;
	}
	class BattlePassTextItem extends fgui.GComponent{
		public T_desc:fgui.GTextField;
		public img_icon:fgui.GLoader;
	}
}
