declare namespace ui.activityCareerTrials {
	class CareerTrialsBattlePassBuyTipsWin extends fgui.GComponent{
		public labelTitle:fgui.GTextField;
		public labelTips1:fgui.GTextField;
		public labelTips2:fgui.GTextField;
		public d21:fgui.GImage;
		public d22:fgui.GImage;
		public G_all:fgui.GGroup;
		public btnBuy:ui.comm.btn.BtnChangGui1;
		public itemList1:ui.comm.item.ItemListComp2;
		public itemList2:ui.comm.item.ItemListComp2;
	}
	class CareerTrialsBattlePassView extends fgui.GComponent{
		public top_bg:fgui.GImage;
		public img_hero:fgui.GLoader;
		public list_task:fgui.GList;
		public list_taskBtn:fgui.GList;
		public list_tab:fgui.GList;
		public list_award:fgui.GList;
		public T_level:fgui.GTextField;
		public T_bar:fgui.GTextField;
		public img_item:fgui.GLoader;
		public T_title_lan1:fgui.GTextField;
		public T_title_lan2:fgui.GTextField;
		public T_title_zi1:fgui.GTextField;
		public T_title_zi2:fgui.GTextField;
		public T_title_bai1:fgui.GTextField;
		public T_title_bai2:fgui.GTextField;
		public T_time:fgui.GRichTextField;
		public T_tips:fgui.GTextField;
		public bar_level:ui.activityCareerTrials.bar.BattlePassLevelBar;
		public bigAwardItem:ui.activityCareerTrials.item.TrialsBattlePassItem3;
		public btn_get:ui.comm.btn.BtnChangGui1;
		public btn_buy:ui.comm.btn.BtnChangGui1;
		public btnRule:ui.comm.btn.BtnGth3;
	}
	class CareerTrialsFundView extends fgui.GComponent{
		public img_bg:fgui.GLoader;
		public top_bg:fgui.GImage;
		public T_task:fgui.GTextField;
		public T_time:fgui.GRichTextField;
		public T_heroName:fgui.GTextField;
		public list_award:fgui.GList;
		public btn_goto:ui.activityCareerTrials.btn.demoBtn;
		public btnRule:ui.comm.btn.BtnGth3;
	}
	class CareerTrialsMainView extends fgui.GComponent{
		public btn_mod:fgui.GLoader;
		public list_tab:fgui.GList;
		public T_heroName:fgui.GTextField;
		public img_car:fgui.GLoader;
		public T_time:fgui.GRichTextField;
		public T_quality:fgui.GTextField;
		public T_tips:fgui.GTextField;
		public T_desc2:fgui.GTextField;
		public T_desc1:fgui.GRichTextField;
		public gp_award:fgui.GGroup;
		public gp_demo:fgui.GGroup;
		public mainpage:ui.activityCareerTrials.page.formationPage;
		public demoGetBtn:ui.activityCareerTrials.btn.DemoGetBtn;
		public demoBtn:ui.activityCareerTrials.btn.DemoGoBtn;
		public modelNode:ui.comm.node.ModelNode;
		public btn_open:ui.comm.btn.BtnChangGui1;
		public btnRule:ui.comm.btn.BtnGth3;
		public item_award:ui.comm.item.ItemFrameBtn;
	}
}
declare namespace ui.activityCareerTrials.bar {
	class BattlePassLevelBar extends fgui.GProgressBar{
		public bg:fgui.GImage;
		public bar:fgui.GImage;
	}
	class BattlePassTaskBar extends fgui.GProgressBar{
		public bg:fgui.GImage;
		public bar:fgui.GImage;
	}
}
declare namespace ui.activityCareerTrials.btn {
	class BattlePassTabBtn extends fgui.GButton{
		public bg:fgui.GLoader;
		public T_tips1:fgui.GTextField;
		public T_tips2:fgui.GTextField;
		public redDot:ui.comm.com.RedDot;
	}
	class demoBtn extends fgui.GButton{
	}
	class DemoGetBtn extends fgui.GButton{
		public demoRewardItem:fgui.GLoader;
		public demoRewardLab:fgui.GTextField;
		public redDot:ui.comm.com.RedDot;
	}
	class DemoGoBtn extends fgui.GButton{
	}
	class TaskSelBtn extends fgui.GButton{
		public bg:fgui.GLoader;
		public T_tips1:fgui.GTextField;
		public T_tips2:fgui.GTextField;
		public redDot:ui.comm.com.RedDot;
	}
}
declare namespace ui.activityCareerTrials.item {
	class tabItem extends fgui.GButton{
		public T_title1:fgui.GTextField;
		public T_title2:fgui.GTextField;
	}
	class TrialsBattlePassItem1 extends fgui.GComponent{
		public list_award1:fgui.GList;
		public list_award2:fgui.GList;
		public T_level:fgui.GTextField;
	}
	class TrialsBattlePassItem2 extends fgui.GComponent{
		public T_bar:fgui.GTextField;
		public T_taks:fgui.GTextField;
		public bar:ui.activityCareerTrials.bar.BattlePassTaskBar;
		public item:ui.comm.item.ItemFrameBtn;
		public btn_get:ui.comm.btn.BtnChangGui3;
	}
	class TrialsBattlePassItem3 extends fgui.GComponent{
		public list_award1:fgui.GList;
		public list_award2:fgui.GList;
		public T_level:fgui.GTextField;
	}
	class TrialsFundItem extends fgui.GComponent{
		public list_award2:fgui.GList;
		public list_award1:fgui.GList;
		public T_buyCount:fgui.GTextField;
		public T_task:fgui.GTextField;
		public img_sq1:fgui.GImage;
		public img_sq2:fgui.GImage;
		public btn_buy2:ui.comm.btn.BtnChangGui1;
		public btn_buy1:ui.comm.btn.BtnChangGui1;
		public item:ui.comm.item.HeroItem;
		public redDot:ui.comm.com.RedDot;
	}
}
declare namespace ui.activityCareerTrials.page {
	class formationPage extends fgui.GComponent{
		public heroItem2:ui.comm.item.HeroItem;
		public heroItem3:ui.comm.item.HeroItem;
		public heroItem4:ui.comm.item.HeroItem;
		public heroItem5:ui.comm.item.HeroItem;
		public heroItem0:ui.comm.hero.components.CommonHeroItemComp;
		public heroItem1:ui.comm.hero.components.CommonHeroItemComp;
	}
}
