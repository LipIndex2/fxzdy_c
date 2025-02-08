declare namespace ui.leagueBox {
	class leagueBoxGiftView extends fgui.GComponent{
		public list:fgui.GList;
		public noList:fgui.GTextField;
	}
	class leagueBoxMainView extends fgui.GComponent{
		public lbTip:fgui.GTextField;
		public footer:ui.comm.back.BackFooter;
		public giftListBtn:ui.leagueBox.btn.leagueBoxPageTab;
		public page:ui.leagueBox.leagueBoxPage;
	}
	class leagueBoxPage extends fgui.GComponent{
		public top_bg:fgui.GImage;
		public listReward:fgui.GList;
		public boxName:fgui.GTextField;
		public boxIcon:fgui.GLoader;
		public endTime:fgui.GTextField;
		public tabList:fgui.GList;
		public giftList:fgui.GList;
		public noGiftList:fgui.GTextField;
		public gGiftTip:fgui.GGroup;
		public gGift:fgui.GGroup;
		public taskList:fgui.GList;
		public noTaskList:fgui.GTextField;
		public gTaskTip:fgui.GGroup;
		public gTask:fgui.GGroup;
		public tweenItem:fgui.GLoader;
		public tips:fgui.GTextField;
		public leagueCoibIcon:fgui.GLoader;
		public leagueCoibTxt:fgui.GTextField;
		public limittxt1:fgui.GGroup;
		public expBar:ui.leagueBox.com.leagueBoxExpBar;
		public levelBoxIcon:ui.leagueBox.btn.leagueBoxBtn;
		public pGiftTip:ui.leagueBox.com.leagueBoxGiftTip;
		public ruleBtn:ui.comm.btn.BtnGth3;
		public btnRule:ui.comm.btn.BtnGth3;
	}
	class leagueBoxPreview extends fgui.GComponent{
		public boxIcon:fgui.GLoader;
		public boxName:fgui.GTextField;
		public iconLoader:fgui.GLoader;
		public keyLimitTxt:fgui.GTextField;
		public getRewardBtn:ui.comm.btn.BtnChangGui1;
		public rewardList:ui.comm.item.ItemListComp;
	}
}
declare namespace ui.leagueBox.btn {
	class leagueBoxBtn extends fgui.GButton{
	}
	class leagueBoxPageTab extends fgui.GButton{
		public redDot:ui.comm.com.RedDot;
	}
	class LeagueBoxTab extends fgui.GButton{
		public redDot:ui.comm.com.RedDot;
	}
}
declare namespace ui.leagueBox.com {
	class giftListCell extends fgui.GComponent{
		public boxName:fgui.GTextField;
		public boxIcon:ui.comm.btn.BaseBtn;
		public redDot:ui.comm.com.RedDot;
		public sendBtn:ui.comm.btn.BtnChangGui1;
	}
	class leagueBoxExpBar extends fgui.GProgressBar{
		public bar:fgui.GImage;
		public title:fgui.GTextField;
	}
	class leagueBoxGiftCell extends fgui.GComponent{
		public giftIcon:fgui.GLoader;
		public boxName:fgui.GTextField;
		public buyTips:fgui.GTextField;
		public timeTxt:fgui.GTextField;
		public keyIcon:fgui.GLoader;
		public keyCont:fgui.GTextField;
		public getRewardBtn:ui.comm.btn.BtnChangGui1;
	}
	class leagueBoxGiftTip extends fgui.GComponent{
		public lbTip:fgui.GTextField;
		public btnGoto:ui.comm.btn.BtnChangGui3;
	}
	class leagueBoxTaskCell extends fgui.GComponent{
		public taskDec:fgui.GTextField;
		public keyIcon:fgui.GLoader;
		public keyCount:fgui.GTextField;
		public complete:fgui.GGroup;
		public taskBar:ui.leagueBox.com.leagueTaskBar;
		public getRewardBtn:ui.comm.btn.BtnChangGui1;
		public reward:ui.comm.item.ItemFrameBtn;
		public jumpBtn:ui.comm1.league.btn.changgui3;
	}
	class leagueTaskBar extends fgui.GProgressBar{
		public bar:fgui.GImage;
		public title:fgui.GTextField;
	}
	class leaugeBoxLimitCom extends fgui.GComponent{
		public tips:fgui.GTextField;
		public leagueCoibIcon:fgui.GLoader;
		public leagueCoibTxt:fgui.GTextField;
		public limittxt1:fgui.GGroup;
	}
}
