declare namespace ui.leagueBoss {
	class leagueBossBattleSuccess extends fgui.GComponent{
		public adadas:fgui.GTextField;
		public sss:fgui.GImage;
		public totalDamage:fgui.GTextField;
		public newDamage:fgui.GImage;
		public modelNode:ui.comm.node.ModelNode;
		public rewards:ui.comm.item.ItemListComp;
		public btnData:ui.comm.btn.BtnData;
	}
	class leagueBossMainView extends fgui.GComponent{
		public top_bg:fgui.GImage;
		public bottom_bg:fgui.GImage;
		public bossBg:fgui.GGraph;
		public bossList:fgui.GList;
		public bossHead:fgui.GImage;
		public bossName:fgui.GTextField;
		public bossCareerIcon:fgui.GLoader;
		public bossUpTips:fgui.GTextField;
		public stageTxt:fgui.GTextField;
		public top1:ui.leagueBoss.component.leagueBossRankTop3;
		public top2:ui.leagueBoss.component.leagueBossRankTop3;
		public top3:ui.leagueBoss.component.leagueBossRankTop3;
		public bossHp:ui.leagueBoss.component.bossHpBar;
		public backGroud:ui.leagueBoss.component.leagueBossBackground;
		public closeBtn:ui.comm.btn.BtnFh2;
		public buzhen:ui.comm.btn.BtnBuZhen;
		public challengeBtn:ui.comm.btn.BtnChangGui1WithTime;
		public bossSpineNode:ui.comm.node.ModelNode;
		public btnAd:ui.comm.btn.BtnAdLb;
		public rawardBtn:ui.comm.btn.ComonBtn;
		public rankBtn:ui.comm.btn.ComonBtn;
		public ruleBtn:ui.comm.btn.BtnGth3;
	}
	class leagueBossNewStageView extends fgui.GComponent{
		public stageTxt:fgui.GTextField;
	}
	class leagueBossRankView extends fgui.GComponent{
		public tabList:fgui.GList;
		public rankList:fgui.GList;
		public myRank:ui.comm1.league.component.leagueRankCell;
	}
	class leagueBossRewardView extends fgui.GComponent{
		public killReward:fgui.GList;
		public everyReward:ui.comm.item.ItemListComp2;
	}
}
declare namespace ui.leagueBoss.btn {
	class leagueBossRankTab extends fgui.GButton{
		public iconImg:fgui.GLoader;
	}
}
declare namespace ui.leagueBoss.component {
	class bossCell extends fgui.GButton{
		public career:fgui.GLoader;
		public playerName:fgui.GTextField;
		public hpBar:ui.leagueBoss.component.bossCellHpBar;
		public bossSpineNode:ui.comm.node.ModelNode;
		public playerAvatar:ui.comm.playerInfo.PlayerAvatar;
	}
	class bossCellHpBar extends fgui.GProgressBar{
		public bar:fgui.GImage;
		public title:fgui.GTextField;
	}
	class bossHpBar extends fgui.GProgressBar{
		public bar:fgui.GImage;
		public title:fgui.GTextField;
	}
	class leagueBossBackground extends fgui.GComponent{
		public back:fgui.GGroup;
	}
	class leagueBossRankTop3 extends fgui.GComponent{
		public playerName:fgui.GTextField;
		public spineNode:ui.comm.node.ModelNode;
	}
	class rankBossRewardCell extends fgui.GComponent{
		public rankTxt:fgui.GTextField;
		public rewardList:ui.comm.item.ItemListComp;
	}
}
