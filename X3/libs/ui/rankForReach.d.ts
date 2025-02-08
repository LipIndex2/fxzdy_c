declare namespace ui.rankForReach {
	class RankForReachMainView extends fgui.GComponent{
		public top_bg:fgui.GImage;
		public endTimeTxt:fgui.GTextField;
		public endTimeTxt2:fgui.GTextField;
		public gp_time2:fgui.GGroup;
		public T_title:fgui.GTextField;
		public T_desc:fgui.GTextField;
		public tabList:fgui.GList;
		public rewardList:fgui.GList;
		public rankList:fgui.GList;
		public myRankTxt:fgui.GTextField;
		public ruleBtn:ui.comm.btn.BtnGth3;
		public headerItem:ui.comm.header.HeaderItem;
		public top2:ui.rankForReach.com.RankTop3Comp;
		public top1:ui.rankForReach.com.RankTop3Comp;
		public top3:ui.rankForReach.com.RankTop3Comp;
		public myRankCom:ui.rankForReach.com.RankForReachValueRowComp;
	}
}
declare namespace ui.rankForReach.btn {
	class RankForReachTabBtn extends fgui.GButton{
		public title1:fgui.GTextField;
		public title2:fgui.GTextField;
	}
}
declare namespace ui.rankForReach.com {
	class RankForReachRewardRowComp extends fgui.GComponent{
		public rankTxt:fgui.GTextField;
		public imageRank1:fgui.GImage;
		public imageRank2:fgui.GImage;
		public imageRank3:fgui.GImage;
		public rewardList:ui.comm.item.ItemListComp;
	}
	class RankForReachValueRowComp extends fgui.GComponent{
		public rankContext2:fgui.GTextField;
		public nameTxt:fgui.GTextField;
		public rankContext1:fgui.GTextField;
		public rankContext3:fgui.GTextField;
		public myRank:fgui.GTextField;
		public noRank:fgui.GTextField;
		public rankTxt:fgui.GTextField;
		public playerAvatar:ui.comm.playerInfo.PlayerAvatar;
		public titleComp:ui.comm1.player.PlayerTitleSmallComp;
	}
	class RankTop3Comp extends fgui.GComponent{
		public imageRank1:fgui.GImage;
		public imageRank2:fgui.GImage;
		public imageRank3:fgui.GImage;
		public labelPlayerName:fgui.GTextField;
		public haveP:fgui.GGroup;
		public labelRankValue:fgui.GTextField;
		public rankValueP:fgui.GGroup;
		public labelNoPersonTips:fgui.GTextField;
		public noP:fgui.GGroup;
		public modelNode:ui.comm.node.ModelNode;
		public titleComp:ui.comm1.player.PlayerTitleSmallComp;
	}
}
