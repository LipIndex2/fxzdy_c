declare namespace ui.rushRank {
	class rushRankFirstRewardWin extends fgui.GComponent{
		public list_reward:fgui.GList;
		public listTab:fgui.GList;
	}
	class rushRankView extends fgui.GComponent{
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
		public headerItem:ui.comm.header.HeaderItem;
		public top2:ui.rushRank.com.RankTop3Comp;
		public top1:ui.rushRank.com.RankTop3Comp;
		public top3:ui.rushRank.com.RankTop3Comp;
		public myRankCom:ui.rushRank.com.rushRankRankCell;
		public btn_first:ui.comm.btn.ComonBtn;
		public ruleBtn:ui.comm.btn.BtnGth3;
	}
}
declare namespace ui.rushRank.btn {
	class rushRankTab extends fgui.GButton{
		public title1:fgui.GTextField;
		public title2:fgui.GTextField;
	}
}
declare namespace ui.rushRank.com {
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
	class rushRankRankCell extends fgui.GComponent{
		public rankContext1:fgui.GTextField;
		public rankContext2:fgui.GTextField;
		public nameTxt:fgui.GTextField;
		public rankContext3:fgui.GTextField;
		public rankValueOne:fgui.GTextField;
		public myRank:fgui.GTextField;
		public noRank:fgui.GTextField;
		public rankTxt:fgui.GTextField;
		public titleComp:ui.comm1.player.PlayerTitleSmallComp;
		public playerAvatar:ui.comm.playerInfo.PlayerAvatar;
	}
	class rushRankRewardCell extends fgui.GComponent{
		public rankTxt:fgui.GTextField;
		public imageRank1:fgui.GImage;
		public imageRank2:fgui.GImage;
		public imageRank3:fgui.GImage;
		public rewardList:fgui.GList;
	}
}
declare namespace ui.rushRank.component {
	class tabBtn extends fgui.GButton{
		public redDot:ui.comm.com.RedDot;
	}
}
declare namespace ui.rushRank.item {
	class firstAwardItem extends fgui.GComponent{
		public T_name:fgui.GTextField;
		public T_time:fgui.GTextField;
		public T_title:fgui.GRichTextField;
		public btn_get:ui.comm.btn.BtnChangGui1;
		public redDot:ui.comm.com.RedDot;
		public avatar:ui.comm.playerInfo.PlayerAvatar;
		public item2:ui.comm.item.ItemFrameBtn;
		public item:ui.comm.item.ItemFrameBtn;
	}
}
