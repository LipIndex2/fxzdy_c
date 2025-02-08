declare namespace ui.guardShip.component {
	class GuardShipBuffSelectDesc extends fgui.GComponent{
		public lbDes:fgui.GRichTextField;
	}
	class GuardShipBuffShowDesc extends fgui.GComponent{
		public lbDes:fgui.GRichTextField;
	}
	class GuardShipFloorInfo extends fgui.GComponent{
		public listCondition:fgui.GList;
		public gLock:fgui.GGroup;
		public listFirst:fgui.GList;
		public listReward:fgui.GList;
		public gUnlock:fgui.GGroup;
	}
	class GuardShipHeros extends fgui.GComponent{
		public shadow1:fgui.GImage;
		public shadow2:fgui.GImage;
		public shadow3:fgui.GImage;
		public shadow4:fgui.GImage;
		public shadow5:fgui.GImage;
		public shadow6:fgui.GImage;
		public pos1:ui.comm.node.ModelNode;
		public pos6:ui.comm.node.ModelNode;
		public pos2:ui.comm.node.ModelNode;
		public pos3:ui.comm.node.ModelNode;
		public pos4:ui.comm.node.ModelNode;
		public pos5:ui.comm.node.ModelNode;
	}
	class GuardShipPlayBtn extends fgui.GButton{
	}
	class GuardShipProgress extends fgui.GProgressBar{
		public bg:fgui.GImage;
		public bar:fgui.GImage;
	}
	class GuardShipRefreshBuffBtn extends fgui.GButton{
		public imageItem:fgui.GLoader;
		public lbNeed:fgui.GTextField;
		public labelCount:fgui.GTextField;
		public gLabel:fgui.GGroup;
	}
}
declare namespace ui.guardShip.item {
	class GuardShipBuffItem extends fgui.GComponent{
		public iconLoader:fgui.GLoader;
		public lbCount:fgui.GTextField;
	}
	class GuardShipBuffSelectItem extends fgui.GButton{
		public bgLoader:fgui.GLoader;
		public buffBgLoader:fgui.GLoader;
		public buffSwapLoader:fgui.GLoader;
		public buffLoader:fgui.GLoader;
		public targetLoader:fgui.GLoader;
		public lbName:fgui.GTextField;
		public lbDes:ui.guardShip.component.GuardShipBuffSelectDesc;
	}
	class GuardShipBuffShowItem extends fgui.GButton{
		public bgLoader:fgui.GLoader;
		public buffBgLoader:fgui.GLoader;
		public buffSwapLoader:fgui.GLoader;
		public buffLoader:fgui.GLoader;
		public targetLoader:fgui.GLoader;
		public lbName:fgui.GTextField;
		public lbDes:ui.guardShip.component.GuardShipBuffShowDesc;
	}
	class GuardShipLockItem extends fgui.GComponent{
		public lbDes:fgui.GTextField;
	}
	class GuardShipPropItem extends fgui.GButton{
		public iconLoader:fgui.GLoader;
	}
	class GuardShipRewardItem extends fgui.GComponent{
		public rankLoader:fgui.GLoader;
		public listReward:fgui.GList;
		public lbRank:fgui.GTextField;
		public lbCur:fgui.GTextField;
		public gNow:fgui.GGroup;
	}
}
declare namespace ui.guardShip.test {
	class BtnTestHero extends fgui.GButton{
	}
	class GuardShipHeroAttrWin extends fgui.GComponent{
		public bg:ui.comm.btn.EmptyBtn;
		public pAttr:ui.guardShip.test.GuardShopHeroAttrPanel;
	}
	class GuardShopHeroAttrItem extends fgui.GComponent{
		public lbName:fgui.GTextField;
		public lbValue:fgui.GTextField;
	}
	class GuardShopHeroAttrPanel extends fgui.GComponent{
		public bg:fgui.GGraph;
		public lbName:fgui.GTextField;
		public listAttr:fgui.GList;
		public btnPrev:ui.comm.btn.BtnKaoBei;
		public btnNext:ui.comm.btn.BtnKaoBei;
	}
}
declare namespace ui.guardShip.view {
	class GuardShipBattleView extends fgui.GComponent{
		public lbLv:fgui.GTextField;
		public lbTime:fgui.GTextField;
		public lbTRound:fgui.GTextField;
		public lbRound:fgui.GTextField;
		public pTop:fgui.GGroup;
		public listBuff:fgui.GList;
		public listProp:fgui.GList;
		public progressLv:ui.guardShip.component.GuardShipProgress;
		public btnPlay:ui.guardShip.component.GuardShipPlayBtn;
		public btnHero:ui.guardShip.test.BtnTestHero;
		public btnBack:ui.comm.back.BtnBack75;
	}
	class GuardShipBuffSelectWin extends fgui.GComponent{
		public bgTitle:fgui.GImage;
		public lbTitle:fgui.GTextField;
		public listBuff:fgui.GList;
		public gAll:fgui.GGroup;
		public btnRefresh:ui.guardShip.component.GuardShipRefreshBuffBtn;
	}
	class GuardShipBuffShowWin extends fgui.GComponent{
		public bgTitle:fgui.GImage;
		public lbTitle:fgui.GTextField;
		public listBuff:fgui.GList;
		public btnBack:ui.comm.back.BtnBack;
	}
	class GuardShipMainView extends fgui.GComponent{
		public bg:fgui.GLoader;
		public top_bg:fgui.GImage;
		public bottom_bg:fgui.GImage;
		public lbName:fgui.GTextField;
		public lbTime:fgui.GTextField;
		public gBtn:fgui.GGroup;
		public lbHard:fgui.GTextField;
		public lbFloor:fgui.GTextField;
		public lbFloorCopy:fgui.GTextField;
		public gFloor:fgui.GGroup;
		public headerItem:ui.comm.header.HeaderItem;
		public headerItem2:ui.comm.header.HeaderItem;
		public btnReward:ui.comm.btn.BtnEntrance;
		public btnRank:ui.comm.btn.BtnEntrance;
		public btnChallengeFirst:ui.comm.btn.BtnChangGui1;
		public btnSweep:ui.comm.btn.BtnChangGui1WithItem;
		public btnChallenge:ui.comm.btn.BtnChangGui1WithItem;
		public btnBuZhen:ui.comm.btn.BtnBuZhen;
		public btnBack:ui.comm.btn.BtnFh2;
		public pInfo:ui.guardShip.component.GuardShipFloorInfo;
		public heros:ui.guardShip.component.GuardShipHeros;
		public btnRule:ui.comm.btn.BaseBtn;
		public btnPrev:ui.comm.btn.BtnJianTou4;
		public btnNext:ui.comm.btn.BtnJianTou4;
	}
	class GuardShipRewardWin extends fgui.GComponent{
		public lbTip:fgui.GTextField;
		public lbTitle:fgui.GTextField;
		public lbTime:fgui.GTextField;
		public listReward:fgui.GList;
		public gAll:fgui.GGroup;
		public emptyBtn:ui.comm.btn.EmptyBtn;
	}
}
