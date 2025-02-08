declare namespace ui.gvg {
	class GVGBattleResultView extends fgui.GComponent{
		public bgReward:fgui.GImage;
		public tips:fgui.GTextField;
		public labelChangeStar:fgui.GTextField;
		public star:fgui.GImage;
		public imgVs:fgui.GImage;
		public labelRewardTitle:fgui.GTextField;
		public G_all:fgui.GGroup;
		public modelNode:ui.comm.node.ModelNode;
		public playerL:ui.gvg.components.GVGPlayerBalanceComp;
		public playerR:ui.gvg.components.GVGPlayerBalanceComp;
		public itemListComp:ui.comm.item.ItemListComp;
		public btnData:ui.comm.btn.BtnData;
	}
	class GVGChallengeConfirmWin extends fgui.GComponent{
		public bg:fgui.GImage;
		public bg2:fgui.GImage;
		public fg:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public heroList:fgui.GList;
		public labelPlayerName:fgui.GTextField;
		public labelSuccessDefendCount:fgui.GTextField;
		public labelFightNum:fgui.GTextField;
		public labelChallengeCountTitle:fgui.GTextField;
		public labelChallengeCount:fgui.GTextField;
		public G_oppo:fgui.GGroup;
		public G_all:fgui.GGroup;
		public avatar:ui.comm.playerInfo.PlayerAvatar;
		public barHp:ui.gvg.bar.GVGChallengeHpBar;
		public barHpCount:ui.gvg.bar.GVGCircleBar;
		public btnChallenge:ui.gvg.btn.GVGChallengeBigBtn;
		public btnTeamLike:ui.gvg.btn.GVGTeamLikeBtn;
		public btnRecord:ui.gvg.btn.GVGSeeRecordBtn;
		public emptyBtn:ui.comm.btn.EmptyBtn;
	}
	class GVGChallengeView extends fgui.GComponent{
		public adapt_bg:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public G_top:fgui.GGroup;
		public itemList:fgui.GList;
		public G_footer:fgui.GGroup;
		public ruleBtn:ui.comm.btn.BtnGth3;
		public btnBack:ui.comm.back.BtnBack;
		public scorePanel:ui.gvg.components.GVGChallengeScorePanelComp;
	}
	class GVGMainView extends fgui.GComponent{
		public adapt_bg:fgui.GImage;
		public bgPlatform:fgui.GImage;
		public teamMy1:fgui.GTextField;
		public teamMy2:fgui.GTextField;
		public teamMy3:fgui.GTextField;
		public teamOppo1:fgui.GTextField;
		public teamOppo2:fgui.GTextField;
		public teamOppo3:fgui.GTextField;
		public G_hero:fgui.GGroup;
		public labelTime:fgui.GTextField;
		public labelMyCanChallengeCount:fgui.GTextField;
		public labelTitle:fgui.GTextField;
		public bgTitle:fgui.GImage;
		public bgRestTime:fgui.GImage;
		public labelRestTime:fgui.GRichTextField;
		public labelLeagueNameMy:fgui.GTextField;
		public labelStarCountMy:fgui.GTextField;
		public labelLeagueNameOther:fgui.GTextField;
		public labelStarCountOther:fgui.GTextField;
		public btnList:fgui.GList;
		public G_footer:fgui.GGroup;
		public btnChallenge1:ui.gvg.btn.GVGChallengeBtn;
		public btnChallenge2:ui.gvg.btn.GVGChallengeBtn;
		public btnChallenge3:ui.gvg.btn.GVGChallengeBtn;
		public btnRule:ui.comm.btn.BtnGth3;
		public chat:ui.comm1.chat.ChatComp;
		public btnBack:ui.comm.back.BtnBack;
		public btnMyLayer1:ui.comm.btn.EmptyBtn;
		public btnMyLayer2:ui.comm.btn.EmptyBtn;
		public btnMyLayer3:ui.comm.btn.EmptyBtn;
		public btnOppoLayer1:ui.comm.btn.EmptyBtn;
		public btnOppoLayer2:ui.comm.btn.EmptyBtn;
		public btnOppoLayer3:ui.comm.btn.EmptyBtn;
		public btnLeagueMy:ui.comm.btn.EmptyBtn;
		public btnLeagueOppo:ui.comm.btn.EmptyBtn;
		public imageLeagueLogoL:ui.comm1.league.LeagueFlagComp;
		public imageLeagueLogoR:ui.comm1.league.LeagueFlagComp;
	}
	class GVGOpenTipsWin extends fgui.GComponent{
		public bg:fgui.GImage;
		public fg1:fgui.GImage;
		public fg2:fgui.GImage;
		public logo:fgui.GImage;
		public labelContent:fgui.GTextField;
		public labelIsCanJoin:fgui.GTextField;
		public labelCdTimeTitle:fgui.GTextField;
		public labelCdTime:fgui.GTextField;
		public labelTitle:fgui.GTextField;
		public G_all:fgui.GGroup;
		public condition1:ui.gvg.components.GVGOpenConditionComp;
		public condition2:ui.gvg.components.GVGOpenConditionComp;
		public emptyBtn:ui.comm.btn.EmptyBtn;
	}
	class GVGRankWin extends fgui.GComponent{
		public bg:fgui.GImage;
		public fg:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public itemList:fgui.GList;
		public btnList:fgui.GList;
		public myRank:ui.gvg.components.GVGMyRankNumComp;
	}
	class GVGRecordWin extends fgui.GComponent{
		public bg:fgui.GImage;
		public fg:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public itemList:fgui.GList;
		public labelJustShowMe:fgui.GTextField;
		public G_all:fgui.GGroup;
		public btnGouXuan:ui.comm.btn.BtnGouXuan;
		public bgn:ui.comm.btn.EmptyBtn;
	}
	class GVGRewardPreviewWin extends fgui.GComponent{
		public bg:fgui.GImage;
		public fg:fgui.GImage;
		public textTitle:fgui.GTextField;
		public bg_my:fgui.GImage;
		public labelMy:fgui.GTextField;
		public labelMyWin:fgui.GTextField;
		public labelMyFail:fgui.GTextField;
		public bgLeague:fgui.GImage;
		public labelLeagueWin:fgui.GTextField;
		public labelLeagueFail:fgui.GTextField;
		public labelLeaguePart:fgui.GTextField;
		public G_all:fgui.GGroup;
		public itemListForMyWin:ui.comm.item.ItemListComp2;
		public itemListForMyFail:ui.comm.item.ItemListComp2;
		public itemListForLeagueWin:ui.comm.item.ItemListComp2;
		public itemListForLeagueFail:ui.comm.item.ItemListComp2;
	}
}
declare namespace ui.gvg.bar {
	class GVGChallengeHpBar extends fgui.GProgressBar{
		public bar:fgui.GImage;
		public title:fgui.GTextField;
	}
	class GVGCircleBar extends fgui.GProgressBar{
		public bar:fgui.GImage;
		public labelTitle:fgui.GTextField;
	}
	class GVGHpBar extends fgui.GProgressBar{
		public bar:fgui.GImage;
		public title:fgui.GTextField;
	}
}
declare namespace ui.gvg.btn {
	class GVGChallengeBigBtn extends fgui.GButton{
	}
	class GVGChallengeBtn extends fgui.GButton{
	}
	class GVGChooseLeagueBtn extends fgui.GButton{
		public bg:fgui.GImage;
		public bgChose:fgui.GImage;
	}
	class GVGSeeRecordBtn extends fgui.GButton{
	}
	class GVGTabItemBtn extends fgui.GButton{
		public imageLogo:fgui.GLoader;
		public labelTitle:fgui.GTextField;
	}
	class GVGTeamLikeBtn extends fgui.GButton{
	}
}
declare namespace ui.gvg.components {
	class GVGChallengeScorePanelComp extends fgui.GComponent{
		public bg:fgui.GImage;
		public imgStar:fgui.GImage;
		public labelChallengeCount:fgui.GTextField;
		public labelGain:fgui.GTextField;
		public labelStarCount:fgui.GTextField;
	}
	class GVGMyRankNumComp extends fgui.GComponent{
		public bg:fgui.GImage;
		public fg:fgui.GImage;
		public bgTitle:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public labelRankNum:fgui.GTextField;
		public labelPlayerName:fgui.GTextField;
		public labelHaveChallengeCount:fgui.GTextField;
		public labelStarCount:fgui.GTextField;
		public avatar:ui.comm.playerInfo.PlayerAvatar;
		public titleComp:ui.comm1.player.PlayerTitleSmallComp;
	}
	class GVGOpenConditionComp extends fgui.GComponent{
		public bg:fgui.GImage;
		public labelContent:fgui.GRichTextField;
	}
	class GVGPlayerBalanceComp extends fgui.GComponent{
		public labelPlayerName:fgui.GTextField;
		public labelChangeHp:fgui.GTextField;
		public avatar:ui.comm.playerInfo.PlayerAvatar;
		public bar:ui.gvg.bar.GVGHpBar;
	}
}
declare namespace ui.gvg.item {
	class GVGOneChallengeItemComp extends fgui.GComponent{
		public bgBase:fgui.GImage;
		public G_isLife:fgui.GGroup;
		public labelPlayerName:fgui.GTextField;
		public G_all:fgui.GGroup;
		public heroModel:ui.comm.node.ModelNode;
		public barHp:ui.gvg.bar.GVGChallengeHpBar;
		public btnChallenge:ui.gvg.btn.GVGChallengeBtn;
		public barCircleHp:ui.gvg.bar.GVGCircleBar;
		public btnFighterInfo:ui.comm.btn.EmptyBtn;
		public fightNumComp:ui.comm.fightNum.FightNumComp;
	}
	class GVGRankItemComp extends fgui.GComponent{
		public labelRankNum:fgui.GTextField;
		public labelPlayerName:fgui.GTextField;
		public labelHaveChallengeCount:fgui.GTextField;
		public labelStarCount:fgui.GTextField;
		public avatar:ui.comm.playerInfo.PlayerAvatar;
		public titleComp:ui.comm1.player.PlayerTitleSmallComp;
	}
	class GVGRecordTextItemComp extends fgui.GComponent{
		public textContent:fgui.GRichTextField;
	}
}
