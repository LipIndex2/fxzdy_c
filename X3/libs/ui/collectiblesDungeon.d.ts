declare namespace ui.collectiblesDungeon.component {
	class CollectiblesDungeonBattleFailComp extends fgui.GComponent{
		public listCond:fgui.GList;
		public lbTip:fgui.GTextField;
		public gInfo:fgui.GGroup;
		public lbClose:fgui.GTextField;
		public modelNode:ui.comm.node.ModelNode;
		public star1:ui.collectiblesDungeon.component.CollectiblesDungeonStar;
		public star2:ui.collectiblesDungeon.component.CollectiblesDungeonStar;
		public star3:ui.collectiblesDungeon.component.CollectiblesDungeonStar;
		public btnData:ui.comm.btn.BtnData;
	}
	class CollectiblesDungeonBattleWinComp extends fgui.GComponent{
		public listCond:fgui.GList;
		public listReward:fgui.GList;
		public lbTip:fgui.GTextField;
		public gInfo:fgui.GGroup;
		public lbAutoTime:fgui.GTextField;
		public gNext:fgui.GGroup;
		public lbClose:fgui.GTextField;
		public modelNode:ui.comm.node.ModelNode;
		public btnNext:ui.comm.btn.BtnChangGui1;
		public star1:ui.collectiblesDungeon.component.CollectiblesDungeonStar;
		public star2:ui.collectiblesDungeon.component.CollectiblesDungeonStar;
		public star3:ui.collectiblesDungeon.component.CollectiblesDungeonStar;
		public btnGouXuan:ui.comm.btn.BtnGouXuan;
		public btnData:ui.comm.btn.BtnData;
	}
	class CollectiblesDungeonChapterStarBtn extends fgui.GButton{
		public box:fgui.GLoader;
		public boxOpen:fgui.GLoader;
		public lbStar:fgui.GTextField;
	}
	class CollectiblesDungeonChapterStarComp extends fgui.GComponent{
		public lbTotal:fgui.GTextField;
		public listStar:fgui.GList;
		public starBar:ui.collectiblesDungeon.component.CollectiblesDungeonProgressBar;
	}
	class CollectiblesDungeonProgressBar extends fgui.GProgressBar{
		public bar:fgui.GImage;
	}
	class CollectiblesDungeonRewardTip extends fgui.GComponent{
		public listReward:fgui.GList;
	}
	class CollectiblesDungeonStar extends fgui.GComponent{
	}
	class CollectiblesDungeonSweepBtn extends fgui.GComponent{
		public title:fgui.GTextField;
		public lbCnt:fgui.GTextField;
		public redDot:ui.comm.com.RedDot;
	}
}
declare namespace ui.collectiblesDungeon.item {
	class CollectiblesDungeonBattleCondItem extends fgui.GComponent{
		public lbCond:fgui.GTextField;
	}
	class CollectiblesDungeonChallCondItem extends fgui.GComponent{
		public lbCond:fgui.GTextField;
	}
	class CollectiblesDungeonChapterItem extends fgui.GComponent{
		public lbName:fgui.GTextField;
		public lbStar:fgui.GTextField;
		public gLock:fgui.GGroup;
		public btnGoto:ui.comm.btn.BtnBuZhen;
	}
	class CollectiblesDungeonLevelItem extends fgui.GButton{
		public iconLoader:fgui.GLoader;
		public lbName:fgui.GTextField;
		public gStar:fgui.GGroup;
		public star1:ui.collectiblesDungeon.component.CollectiblesDungeonStar;
		public star2:ui.collectiblesDungeon.component.CollectiblesDungeonStar;
		public star3:ui.collectiblesDungeon.component.CollectiblesDungeonStar;
	}
	class CollectiblesDungeonRewardItem extends fgui.GComponent{
		public itemFrameBtn:ui.comm.item.ItemFrameBtn;
	}
}
declare namespace ui.collectiblesDungeon.view {
	class CollectiblesDungeonBattleFailView extends fgui.GComponent{
		public failComp:ui.collectiblesDungeon.component.CollectiblesDungeonBattleFailComp;
	}
	class CollectiblesDungeonBattleWinView extends fgui.GComponent{
		public winComp:ui.collectiblesDungeon.component.CollectiblesDungeonBattleWinComp;
	}
	class CollectiblesDungeonChallengeWin extends fgui.GComponent{
		public listCond:fgui.GList;
		public bgEnemySchema:fgui.GLoader;
		public listReward:fgui.GList;
		public bgPower:fgui.GLoader;
		public labelPower:fgui.GTextField;
		public gAll:fgui.GGroup;
		public emptyBtn:ui.comm.btn.EmptyBtn;
		public modelNode1:ui.comm.node.ModelNode;
		public modelNode2:ui.comm.node.ModelNode;
		public modelNode3:ui.comm.node.ModelNode;
		public modelNode4:ui.comm.node.ModelNode;
		public modelNode5:ui.comm.node.ModelNode;
		public modelNode6:ui.comm.node.ModelNode;
		public btnChallenge:ui.comm.btn.BtnChangGui1;
		public star1:ui.collectiblesDungeon.component.CollectiblesDungeonStar;
		public star2:ui.collectiblesDungeon.component.CollectiblesDungeonStar;
		public star3:ui.collectiblesDungeon.component.CollectiblesDungeonStar;
	}
	class CollectiblesDungeonChapterWin extends fgui.GComponent{
		public listChapter:fgui.GList;
		public gAll:fgui.GGroup;
		public emptyBtn:ui.comm.btn.EmptyBtn;
	}
	class CollectiblesDungeonMainView extends fgui.GComponent{
		public bg:fgui.GLoader;
		public road:fgui.GLoader;
		public gLevel:fgui.GGroup;
		public lbTimes:fgui.GTextField;
		public pTimes:fgui.GGroup;
		public lbTitle:fgui.GTextField;
		public gCenter:fgui.GGroup;
		public bgBottom:fgui.GLoader;
		public gBottom:fgui.GGroup;
		public top_bg1:fgui.GImage;
		public bottom_bg1:fgui.GImage;
		public btnRule:ui.comm.btn.BtnGth3;
		public levelItem1:ui.collectiblesDungeon.item.CollectiblesDungeonLevelItem;
		public levelItem2:ui.collectiblesDungeon.item.CollectiblesDungeonLevelItem;
		public levelItem3:ui.collectiblesDungeon.item.CollectiblesDungeonLevelItem;
		public levelItem4:ui.collectiblesDungeon.item.CollectiblesDungeonLevelItem;
		public levelItem5:ui.collectiblesDungeon.item.CollectiblesDungeonLevelItem;
		public levelItem6:ui.collectiblesDungeon.item.CollectiblesDungeonLevelItem;
		public levelItem7:ui.collectiblesDungeon.item.CollectiblesDungeonLevelItem;
		public levelItem8:ui.collectiblesDungeon.item.CollectiblesDungeonLevelItem;
		public levelItem9:ui.collectiblesDungeon.item.CollectiblesDungeonLevelItem;
		public levelItem10:ui.collectiblesDungeon.item.CollectiblesDungeonLevelItem;
		public chapterStarComp:ui.collectiblesDungeon.component.CollectiblesDungeonChapterStarComp;
		public btnSweep:ui.collectiblesDungeon.component.CollectiblesDungeonSweepBtn;
		public rewardTip:ui.collectiblesDungeon.view.CollectiblesDungeonRewardTipView;
		public btnBack:ui.comm.btn.BtnFh2;
		public btnAd:ui.comm.btn.BtnAdLb;
		public btnChapter:ui.comm.btn.BtnEntrance;
		public btnRank:ui.comm.btn.BtnEntrance;
		public btnShop:ui.comm.btn.BtnEntrance;
	}
	class CollectiblesDungeonRewardTipView extends fgui.GComponent{
		public bg:ui.comm.btn.EmptyBtn;
		public rewardTip:ui.collectiblesDungeon.component.CollectiblesDungeonRewardTip;
	}
	class CollectiblesDungeonSweepWin extends fgui.GComponent{
		public listReward:fgui.GList;
		public lbTimes:fgui.GTextField;
		public lbChapter:fgui.GTextField;
		public gAll:fgui.GGroup;
		public emptyBtn:ui.comm.btn.EmptyBtn;
		public btnSweep:ui.comm.btn.BtnChangGui1;
	}
}
