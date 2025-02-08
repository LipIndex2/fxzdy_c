declare namespace ui.secretArea.battleView {
	class BattleResultWin extends fgui.GComponent{
		public bg:fgui.GLoader;
		public T_dieCount:fgui.GTextField;
		public T_jindu:fgui.GTextField;
		public group1:fgui.GGroup;
		public labelTips:fgui.GTextField;
		public panel:ui.secretArea.battleView.JumpItem;
		public modelNode:ui.comm.node.ModelNode;
		public btnData:ui.comm.btn.BtnData;
	}
	class BattleWinWin extends fgui.GComponent{
		public bg:fgui.GLoader;
		public T_dieCount:fgui.GTextField;
		public T_jindu:fgui.GTextField;
		public T_level:fgui.GTextField;
		public T_time:fgui.GTextField;
		public img_xjl:fgui.GImage;
		public group1:fgui.GGroup;
		public list_award:fgui.GList;
		public group2:fgui.GGroup;
		public modelNode:ui.comm.node.ModelNode;
		public btnData:ui.comm.btn.BtnData;
	}
	class JumpItem extends fgui.GComponent{
		public bg:fgui.GImage;
		public list_jump:fgui.GList;
		public labelTitle:fgui.GTextField;
	}
	class SecretAreaBattleView extends fgui.GComponent{
		public img_jd:fgui.GImage;
		public img_jdt1:fgui.GImage;
		public img_anim1:fgui.GImage;
		public img_jdt2:fgui.GImage;
		public img_anim2:fgui.GImage;
		public T_name:fgui.GTextField;
		public img_time:fgui.GImage;
		public T_time1:fgui.GTextField;
		public btnBack:ui.comm.back.BtnBack75;
		public MiniMap:ui.comm.miniMap.MiniMapItem;
		public buildingBtn:ui.comm.building.BuildingBtn;
	}
}
declare namespace ui.secretArea.btn {
	class BtnChangGui1WithItem extends fgui.GButton{
		public lbTip:fgui.GTextField;
	}
	class firstChallengeBtn extends fgui.GButton{
	}
	class rankBtn extends fgui.GButton{
	}
	class ticketsBtn extends fgui.GComponent{
		public ticket:ui.comm.header.HeaderItem;
	}
}
declare namespace ui.secretArea.item {
	class awardListItem extends fgui.GComponent{
		public T_rank:fgui.GTextField;
		public list_award:fgui.GList;
	}
	class miniMapItem extends fgui.GComponent{
		public MiniMap:ui.comm.miniMap.MiniMapItem;
	}
	class skillIconMask extends fgui.GComponent{
		public img_skill:fgui.GLoader;
	}
	class SkillItem extends fgui.GComponent{
		public bg:fgui.GLoader;
		public T_level:fgui.GTextField;
		public img_bs:fgui.GImage;
		public img_skill:ui.secretArea.item.skillIconMask;
	}
	class unlockCondition extends fgui.GComponent{
		public T_cond:fgui.GTextField;
	}
}
declare namespace ui.secretArea.page {
	class secretAreaInfoPanel extends fgui.GComponent{
		public dropPage:ui.secretArea.page.SecretAreaMainPage;
		public unlockPage:ui.secretArea.page.SecretAreaUnlockPage;
		public btn_firstChallenge:ui.secretArea.btn.firstChallengeBtn;
		public btn_cantSweep:ui.secretArea.btn.BtnChangGui1WithItem;
		public btn_sweep:ui.comm.btn.BtnChangGui1WithItem;
		public btn_challenge:ui.comm.btn.BtnChangGui1WithItem;
		public btnAd:ui.comm.btn.BtnAdLb;
	}
	class SecretAreaMainPage extends fgui.GComponent{
		public list_award_first:fgui.GList;
		public list_award_draw:fgui.GList;
		public list_hero:fgui.GList;
		public btn_formation:ui.comm.btn.BtnBlue;
		public btn_award:ui.comm.btn.BaseBtn;
	}
	class SecretAreaUnlockPage extends fgui.GComponent{
		public list:fgui.GList;
	}
}
declare namespace ui.secretArea.view {
	class SecretAreaAwardView extends fgui.GComponent{
		public list_award:fgui.GList;
		public footer:ui.comm.back.BackFooter;
	}
	class SecretAreaMainView extends fgui.GComponent{
		public bottom_bg1:fgui.GImage;
		public top_bg1:fgui.GImage;
		public TL:fgui.GGroup;
		public TR:fgui.GGroup;
		public T_add:fgui.GTextField;
		public T_level:fgui.GTextField;
		public T_level2:fgui.GTextField;
		public T_factor:fgui.GTextField;
		public bottom:fgui.GGroup;
		public btn_rank:ui.secretArea.btn.rankBtn;
		public infoPanel:ui.secretArea.page.secretAreaInfoPanel;
		public dailyTicket:ui.secretArea.btn.ticketsBtn;
		public extraticket:ui.secretArea.btn.ticketsBtn;
		public btn_jtR:ui.secretArea.view.SecretAreaPageBtn;
		public btn_jtL:ui.secretArea.view.SecretAreaPageBtn;
		public btn_gth:ui.comm.btn.BaseBtn;
		public redDot:ui.comm.com.RedDot;
		public btn_close:ui.comm.back.BtnBack;
	}
	class SecretAreaPageBtn extends fgui.GButton{
		public redDot:ui.comm.com.RedDot;
	}
}
declare namespace ui.secretArea.win {
	class SecretAreaBossWin extends fgui.GComponent{
		public bg:fgui.GImage;
		public boss_bg1:fgui.GImage;
		public boss_bg2:fgui.GImage;
		public text_boss:fgui.GTextField;
	}
	class SecretAreaSweepWin extends fgui.GComponent{
		public T_LVName:fgui.GTextField;
		public dropLIst:fgui.GList;
		public btn_sweep:ui.comm.btn.BtnChangGui1WithItem;
		public bar:ui.comm1.chat.countSlider.CommonCountSliderComp;
		public emptyBtn:ui.comm.btn.EmptyBtn;
	}
	class SecretAreaTipsWin extends fgui.GComponent{
		public bg:fgui.GLoader;
		public fg:fgui.GImage;
		public labelContent:fgui.GTextField;
		public labelTitle:fgui.GTextField;
		public img_item:fgui.GLoader;
		public T_item:fgui.GTextField;
		public btnNo:ui.comm.btn.BtnChangGui3;
		public btnYes:ui.comm.btn.BtnChangGui1WithItem;
		public btn_goon:ui.comm.btn.BtnChangGui1;
	}
	class SecretAreaUnlockWin extends fgui.GComponent{
		public T_levelDesc:fgui.GTextField;
	}
}
