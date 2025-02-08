declare namespace ui.season {
	class SeasonContainerView extends fgui.GComponent{
		public listTab:fgui.GList;
		public footer:ui.comm.back.BackFooter3;
		public viewContainer:ui.comm.ViewContainer.ViewContainer;
	}
	class SeasonMainView extends fgui.GComponent{
		public lbN:fgui.GRichTextField;
		public lbOpenTips:fgui.GGroup;
		public lbTips:fgui.GTextField;
		public tipsG:fgui.GGroup;
		public rewardsG:fgui.GGroup;
		public imgN:fgui.GImage;
		public lbCd:fgui.GRichTextField;
		public reward1:ui.season.com.SeasonRewardCom;
		public reward2:ui.season.com.SeasonRewardCom;
		public reward3:ui.season.com.SeasonRewardCom;
		public bar2:ui.season.btn.SeasonBar;
		public bar:ui.season.btn.SeasonBar;
		public btnGo:ui.comm.btn.BtnChangGui1;
		public btnBack:ui.comm.back.BtnBack;
	}
	class SeasonMenuView extends fgui.GComponent{
		public lbRe:fgui.GTextField;
		public listMenu:fgui.GList;
		public lbCd:fgui.GRichTextField;
		public btnRule:ui.season.btn.SeasonRuleBtn;
		public itemBtn:ui.comm.item.ItemFrameBtn;
	}
	class SeasonRankView extends fgui.GComponent{
		public lbN:fgui.GTextField;
		public lbS:fgui.GTextField;
		public lbReward:fgui.GTextField;
		public lbTitle:fgui.GTextField;
		public imgTop:fgui.GLoader;
		public rankList:fgui.GList;
		public lbMyS:fgui.GTextField;
		public lbMyR:fgui.GTextField;
		public myG:fgui.GGroup;
		public lbCd:fgui.GRichTextField;
		public imgClick:fgui.GLoader;
		public btnPre:ui.season.btn.SeasonPreviewBtn;
		public itemBtn:ui.comm.item.ItemFrameBtn;
		public modelNode:ui.comm.node.ModelNode;
		public titleComp:ui.comm1.player.PlayerTitleSmallComp;
	}
}
declare namespace ui.season.btn {
	class SeasonBar extends fgui.GProgressBar{
		public bar:fgui.GImage;
	}
	class SeasonMenuBar extends fgui.GProgressBar{
		public bar:fgui.GImage;
	}
	class SeasonPreviewBtn extends fgui.GButton{
	}
	class SeasonRewardBtn extends fgui.GButton{
	}
	class SeasonRuleBtn extends fgui.GButton{
	}
}
declare namespace ui.season.com {
	class SeasonMenuItem extends fgui.GComponent{
		public bgIcon:fgui.GLoader;
		public lbDes:fgui.GTextField;
		public lbTitle:fgui.GTextField;
		public imgTitle:fgui.GImage;
		public lbState:fgui.GTextField;
		public lbS:fgui.GTextField;
		public imgTag:fgui.GImage;
		public redDot:ui.comm.com.RedDot;
		public bar:ui.season.btn.SeasonMenuBar;
		public btnGo:ui.comm.btn.BtnChangGui1;
		public lisitem:ui.comm.item.ItemListComp;
	}
	class SeasonRankItem extends fgui.GComponent{
		public rankTxt:fgui.GTextField;
		public imageRank:fgui.GLoader;
		public lbN:fgui.GTextField;
		public tag:fgui.GImage;
		public lbValue:fgui.GTextField;
		public rankG:fgui.GGroup;
		public noRank:fgui.GTextField;
		public titleComp:ui.comm1.player.PlayerTitleSmallComp;
		public avatar:ui.comm.playerInfo.PlayerAvatar;
	}
	class SeasonRewardCom extends fgui.GComponent{
		public bg:fgui.GLoader;
		public imgBox:fgui.GImage;
		public lb:fgui.GTextField;
		public img:fgui.GImage;
		public listItem1:fgui.GList;
		public btn:ui.season.btn.SeasonRewardBtn;
	}
}
declare namespace ui.season.component {
	class ChargeTabBtn extends fgui.GButton{
		public titleSelect:fgui.GTextField;
		public redDot:ui.comm.com.RedDot;
	}
}
