declare namespace ui.activitySummonHero {
	class awardItem extends fgui.GComponent{
		public T_pop:fgui.GTextField;
		public item:ui.comm.item.ItemFrameBtn;
	}
	class ChooseAwardItem extends fgui.GComponent{
		public T_count:fgui.GTextField;
		public T_Tips:fgui.GTextField;
		public item:ui.comm.item.ItemFrameBtn;
	}
	class demoBtn extends fgui.GButton{
	}
	class dialogBoxItem extends fgui.GComponent{
		public T_text:fgui.GRichTextField;
	}
	class DialogBoxPage extends fgui.GComponent{
		public scroll:ui.activitySummonHero.DialogBoxPageItem;
	}
	class DialogBoxPageItem extends fgui.GComponent{
	}
	class SummonHeroChooseBigRewardWin extends fgui.GComponent{
		public T_title:fgui.GTextField;
		public T_desc:fgui.GTextField;
		public T_chooseTips:fgui.GTextField;
		public itemList:fgui.GList;
		public T_round:fgui.GRichTextField;
		public emptyBtn:ui.comm.btn.EmptyBtn;
		public btnChooseBig:ui.comm.btn.EmptyBtn;
		public bigReward:ui.comm.item.ItemFrameBtn;
		public btnClose:ui.comm.btn.GoToBackButton_1;
	}
	class SummonHeroMainView extends fgui.GComponent{
		public T_name4:fgui.GTextField;
		public T_name1:fgui.GTextField;
		public T_name5:fgui.GTextField;
		public T_name2:fgui.GTextField;
		public T_name6:fgui.GTextField;
		public T_name3:fgui.GTextField;
		public T_time:fgui.GRichTextField;
		public T_name:fgui.GTextField;
		public T_count:fgui.GTextField;
		public T_count2:fgui.GTextField;
		public list_award:fgui.GList;
		public btn_shiwan:ui.activitySummonHero.demoBtn;
		public skipItem:ui.activitySummonHero.item.DrawSkipAnimItem;
		public dialogPage:ui.activitySummonHero.DialogBoxPage;
		public demoGetBtn:ui.activitySummonHero.btn.DemoGetBtn;
		public modelNode:ui.comm.node.ModelNode;
		public aniNode:ui.comm.node.ModelNode;
		public headerItem:ui.comm.header.HeaderItem;
		public btnRule:ui.comm.btn.BtnGth3;
		public btn_shuaxin:ui.comm.btn.BaseBtn0.8Scale;
		public awardItem:ui.comm.item.ItemFrameBtn;
		public btn_get1:ui.comm.btn.BtnChangGui1WithItem;
		public btn_get10:ui.comm.btn.BtnChangGui1WithItem;
	}
}
declare namespace ui.activitySummonHero.btn {
	class DemoGetBtn extends fgui.GButton{
		public demoRewardItem:fgui.GLoader;
		public demoRewardLab:fgui.GTextField;
		public redDot:ui.comm.com.RedDot;
	}
}
declare namespace ui.activitySummonHero.item {
	class DrawSkipAnimItem extends fgui.GComponent{
	}
}
