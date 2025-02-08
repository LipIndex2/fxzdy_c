declare namespace ui.pvp {
	class PVPBattleResultView extends fgui.GComponent{
		public tipsExit:fgui.GTextField;
		public modelNode:ui.comm.node.ModelNode;
		public rankPart:ui.pvp.components.PVPBattleResultRankComp;
		public rewardPart:ui.pvp.components.PVPBattleResultRewardComp;
		public btnData:ui.comm.btn.BtnData;
	}
	class PVPChooseOppoView extends fgui.GComponent{
		public bg:fgui.GImage;
		public fg:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public labelMyPowerNum:fgui.GTextField;
		public oppoList:fgui.GList;
		public btnRefresh:ui.pvp.btn.PVPRefreshOppoBtn;
	}
	class PVPDefendView extends fgui.GComponent{
		public bg:fgui.GLoader;
		public fg:fgui.GLoader;
		public labelTitle:fgui.GTextField;
		public labelPlayerName:fgui.GTextField;
		public labelPowerNum:fgui.GTextField;
		public heroList:fgui.GList;
		public all:fgui.GGroup;
		public collectionsComp:ui.comm.formation.FormationSkillInfo;
		public petComp:ui.comm.formation.FormationSkillInfo;
		public avatar:ui.comm.playerInfo.PlayerAvatar;
	}
	class PVPMainRankInfoComp extends fgui.GButton{
		public labelRankLogoName:fgui.GTextField;
		public dialogComp:ui.pvp.components.PVPRankLvDialogComp;
		public barForRankScore:ui.pvp.bar.PVPRankScoreBar;
		public logoRank:ui.pvp.logo.PVPRankBigLogoComp;
	}
	class PVPMainView extends fgui.GComponent{
		public bg:fgui.GImage;
		public bottom_bg1:fgui.GImage;
		public top_bg1:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public tabList:fgui.GList;
		public labelResetTime:fgui.GTextField;
		public labelTitleForBalanceReward:fgui.GTextField;
		public headerP:fgui.GGroup;
		public imageHeroGo:fgui.GLoader;
		public labelWeeklyRewardTitle:fgui.GTextField;
		public weekP:fgui.GGroup;
		public lbTimes:fgui.GRichTextField;
		public footerP:fgui.GGroup;
		public maskForClickSettleRewards:ui.comm.btn.EmptyBtn;
		public btnWeeklyChallengeBox:ui.pvp.components.PVPChallengeRewardBoxComp;
		public maskForWeek:ui.comm.btn.EmptyBtn;
		public btnChallenge:ui.pvp.btn.PVPChallengeBtnWithCount;
		public btnSetUpFormation:ui.pvp.btn.PVPSetUpFormationBtn;
		public dailyRewardComp2:ui.pvp.components.PVPDailyRewardTipsComp;
		public dailyRewardComp1:ui.pvp.components.PVPDailyRewardTipsComp;
		public weekRewardComp:ui.pvp.components.PVPWeeklyChallengeRewardComp;
		public mainInfoComp:ui.pvp.PVPMainRankInfoComp;
		public top1:ui.pvp.components.PVPRankTop3Comp;
		public top2:ui.pvp.components.PVPRankTop3Comp;
		public top3:ui.pvp.components.PVPRankTop3Comp;
		public btnRule:ui.comm.btn.BtnGth3;
		public header1:ui.comm.header.HeaderItem;
		public btnBack:ui.comm.back.BtnBack;
	}
	class PVPRankLvUpView extends fgui.GComponent{
		public labelClickExitTips:fgui.GTextField;
		public btnFightData:fgui.GImage;
		public imageRankLvUp:fgui.GImage;
		public bgTitle:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public bgItemList:fgui.GImage;
		public itemList:fgui.GList;
		public rewardP:fgui.GGroup;
		public imageRankLogo1:fgui.GLoader;
		public labelRankName1:fgui.GTextField;
		public imageRankLogo2:fgui.GLoader;
		public labelRankName2:fgui.GTextField;
		public starComp1:ui.pvp.components.PVPRankStarListComp;
		public starComp2:ui.pvp.components.PVPRankStarListComp;
	}
	class PVPRankRewardView extends fgui.GComponent{
		public bg:fgui.GImage;
		public fg:fgui.GImage;
		public rankList:fgui.GList;
		public labelTitle:fgui.GTextField;
		public labelExit:fgui.GTextField;
		public labelRankLogoName:fgui.GTextField;
		public labelRankScoreRange:fgui.GTextField;
		public rankStage:fgui.GGroup;
		public btnLeftSide:ui.comm.btn.BtnJianTou4;
		public btnRightSide:ui.comm.btn.BtnJianTou4;
		public settleDailyComp:ui.pvp.components.PVPRankSettleTabComp;
		public settleWeeklyComp:ui.pvp.components.PVPRankSettleTabComp;
		public settleFirstReachComp:ui.pvp.components.PVPRankSettleTabComp;
		public dialogComp:ui.pvp.components.PVPRankLvDialogComp2;
	}
	class PVPRecordView extends fgui.GComponent{
		public bg:fgui.GImage;
		public fg:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public recordList:fgui.GList;
		public labelNoRecord:fgui.GTextField;
		public tipsExit:fgui.GTextField;
	}
}
declare namespace ui.pvp.bar {
	class PVPRankScoreBar extends fgui.GProgressBar{
		public bar:fgui.GImage;
		public labelTitle:fgui.GTextField;
	}
}
declare namespace ui.pvp.btn {
	class PVPChallengeBtnWithCount extends fgui.GButton{
		public bg:fgui.GImage;
		public labelHaveCost:fgui.GTextField;
		public labelCount:fgui.GTextField;
		public imageSmallItem:fgui.GLoader;
		public costP:fgui.GGroup;
		public redDot:ui.comm.com.RedDot;
	}
	class PVPChallengeOtherBtn extends fgui.GButton{
	}
	class PVPRefreshOppoBtn extends fgui.GButton{
	}
	class PVPSetUpFormationBtn extends fgui.GButton{
	}
	class PVPTabBtn extends fgui.GButton{
		public imageTab:fgui.GLoader;
	}
}
declare namespace ui.pvp.components {
	class PVPBattleResultRankComp extends fgui.GComponent{
		public labelRankScore:fgui.GRichTextField;
		public labelTitle:fgui.GTextField;
		public labelAddRankScore:fgui.GTextField;
		public barRankScore:ui.pvp.bar.PVPRankScoreBar;
		public logo:ui.pvp.logo.PVPRankBigLogoComp;
	}
	class PVPBattleResultRewardComp extends fgui.GComponent{
		public bgTitle:fgui.GImage;
		public labelRewardTitle:fgui.GTextField;
		public bgItemList:fgui.GImage;
		public itemList:fgui.GList;
		public lbTip:fgui.GTextField;
	}
	class PVPChallengeOtherOneRowComp extends fgui.GComponent{
		public bg:fgui.GImage;
		public labelName:fgui.GTextField;
		public labelPower:fgui.GTextField;
		public labelRankScore:fgui.GTextField;
		public imagePvpRank:fgui.GLoader;
		public rankStarList:ui.pvp.components.PVPRankStarListComp;
		public btnShowInfo:ui.comm.btn.EmptyBtn;
		public btnChallenge:ui.pvp.btn.PVPChallengeOtherBtn;
		public avatarComp:ui.comm.playerInfo.PlayerAvatar;
		public btnShowInfoTips:ui.comm.btn.BtnGth3;
	}
	class PVPChallengeRewardBoxComp extends fgui.GButton{
		public labelTitle:fgui.GTextField;
		public notGainP:fgui.GGroup;
		public labelCanGain:fgui.GTextField;
		public canGainP:fgui.GGroup;
		public modelNode:ui.comm.node.ModelNode;
		public redDot:ui.comm.com.RedDot;
	}
	class PVPDailyRewardTipsComp extends fgui.GComponent{
		public bg:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public itemList:fgui.GList;
	}
	class PVPRankLvDialogComp extends fgui.GComponent{
		public bg:fgui.GImage;
		public labelCount:fgui.GTextField;
		public imageIcon:fgui.GLoader;
	}
	class PVPRankLvDialogComp2 extends fgui.GComponent{
		public bg:fgui.GImage;
		public labelCount:fgui.GTextField;
		public imageIcon:fgui.GLoader;
	}
	class PVPRankSettleTabComp extends fgui.GComponent{
		public labelTitle:fgui.GTextField;
		public itemList:fgui.GList;
		public imageHaveGain:fgui.GImage;
	}
	class PVPRankStarListComp extends fgui.GComponent{
		public bg:fgui.GImage;
		public starList:fgui.GList;
	}
	class PVPRankTop3Comp extends fgui.GComponent{
		public bg:fgui.GImage;
		public rankTop3:ui.comm.rank.RankTop3Comp;
	}
	class PVPWeeklyChallengeRewardComp extends fgui.GComponent{
		public labelDesc:fgui.GTextField;
		public tabList:fgui.GList;
		public labelTitle:fgui.GTextField;
		public labelResetTime:fgui.GTextField;
	}
}
declare namespace ui.pvp.list {
	class PVPItemComp extends fgui.GComponent{
		public imageItem:fgui.GLoader;
		public labelCount:fgui.GTextField;
	}
	class PVPRankStarComp extends fgui.GComponent{
		public bg:fgui.GImage;
		public fg:fgui.GImage;
	}
	class PVPRecordOneRowComp extends fgui.GComponent{
		public labelPlayerName:fgui.GTextField;
		public labelScore:fgui.GRichTextField;
		public labelTime:fgui.GRichTextField;
		public logoRank:ui.pvp.logo.PVPRankSmallLogoComp;
		public avatar:ui.comm.playerInfo.PlayerAvatar;
		public btnData:ui.comm.btn.BtnData;
	}
	class PVPTaskListItemComp extends fgui.GComponent{
		public bg:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public listReward:fgui.GList;
	}
}
declare namespace ui.pvp.logo {
	class PVPCurrentTitleComp extends fgui.GComponent{
		public labelCurrent:fgui.GTextField;
	}
	class PVPRankBigLogoChooseComp extends fgui.GButton{
		public curP:fgui.GGroup;
		public logo:ui.pvp.logo.PVPRankBigLogoComp;
		public curComp:ui.pvp.logo.PVPCurrentTitleComp;
	}
	class PVPRankBigLogoComp extends fgui.GComponent{
		public imageRankLogo:fgui.GLoader;
		public starComp:ui.pvp.components.PVPRankStarListComp;
	}
	class PVPRankSmallLogoComp extends fgui.GComponent{
		public imageRankLogo:fgui.GLoader;
		public starComp:ui.pvp.components.PVPRankStarListComp;
	}
}
