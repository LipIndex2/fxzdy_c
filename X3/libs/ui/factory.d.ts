declare namespace ui.factory.component {
	class FactoryBattlePanel extends fgui.GComponent{
	}
	class FactoryBoxBtn extends fgui.GButton{
		public boxLoader:fgui.GLoader;
		public boxOpenLoader:fgui.GLoader;
		public iconLock:fgui.GImage;
	}
	class FactoryIcon extends fgui.GButton{
		public iconLoader:fgui.GLoader;
	}
	class FactoryMainPanel extends fgui.GComponent{
		public bg:fgui.GLoader;
		public top_bg1:fgui.GImage;
		public bottom_bg1:fgui.GImage;
		public topLoader:fgui.GLoader;
		public light1:fgui.GLoader;
		public light2:fgui.GLoader;
		public light3:fgui.GLoader;
		public light4:fgui.GLoader;
		public light5:fgui.GLoader;
		public light6:fgui.GLoader;
		public gQuality:fgui.GGroup;
		public shadow1:fgui.GImage;
		public shadow2:fgui.GImage;
		public shadow3:fgui.GImage;
		public shadow4:fgui.GImage;
		public shadow5:fgui.GImage;
		public shadow6:fgui.GImage;
		public gShadow:fgui.GGroup;
		public gHero:fgui.GGroup;
		public lbBoxTime:fgui.GTextField;
		public lbCanDraw:fgui.GTextField;
		public gBox:fgui.GGroup;
		public listOccupy:fgui.GList;
		public lbOccupyCnt:fgui.GTextField;
		public gOccupyCnt:fgui.GGroup;
		public spineTrans:ui.comm.node.ModelNode;
		public hero1:ui.comm.node.ModelNode;
		public hero2:ui.comm.node.ModelNode;
		public hero3:ui.comm.node.ModelNode;
		public hero4:ui.comm.node.ModelNode;
		public hero5:ui.comm.node.ModelNode;
		public hero6:ui.comm.node.ModelNode;
		public boxProgress:ui.factory.component.FactoryProgressBar;
		public btnAttack:ui.comm.btn.BtnChangGui1WithItem;
		public headerItem:ui.comm.header.HeaderItem;
		public pTrans:ui.factory.component.FactoryTransPanel;
		public btnBox:ui.factory.component.FactoryBoxBtn;
		public bubbleComp:ui.factory.component.FactoryOtherBubble;
	}
	class FactoryOtherBubble extends fgui.GComponent{
		public avatarLoader:fgui.GLoader;
		public lbOwer:fgui.GTextField;
		public gOwerTitle:fgui.GGroup;
		public lbName:fgui.GTextField;
		public tipComp:ui.factory.component.FactoryOtherBubbleTip;
		public emoComp:ui.factory.component.FactoryOtherBubbleSpine;
	}
	class FactoryOtherBubbleSpine extends fgui.GComponent{
		public bg:fgui.GImage;
		public spine:ui.factory.component.FactoryOtherBubbleSpineModel;
	}
	class FactoryOtherBubbleSpineModel extends fgui.GComponent{
		public modelNode:ui.comm.node.ModelNode;
	}
	class FactoryOtherBubbleTip extends fgui.GComponent{
		public bg:fgui.GImage;
		public lbTip:fgui.GRichTextField;
	}
	class FactoryProductLineContent extends fgui.GComponent{
		public pOwer:ui.factory.component.FactoryProductLineOwerPanel;
		public pReward:ui.factory.component.FactoryProductLineRewardPanel;
	}
	class FactoryProductLineOwerPanel extends fgui.GComponent{
		public listHero:fgui.GList;
		public lbOwer:fgui.GTextField;
		public gOwerTitle:fgui.GGroup;
		public lbName:fgui.GTextField;
		public lbFight:fgui.GTextField;
		public gOwer:fgui.GGroup;
		public lbTip:fgui.GTextField;
		public avatar:ui.comm.playerInfo.PlayerAvatar;
		public pCollections:ui.comm.formation.FormationSkillInfo;
		public pPet:ui.comm.formation.FormationSkillInfo;
	}
	class FactoryProductLineRewardPanel extends fgui.GComponent{
		public listReward:fgui.GList;
	}
	class FactoryProgressBar extends fgui.GProgressBar{
		public bar:fgui.GImage;
	}
	class FactoryTabBtn extends fgui.GButton{
		public redDot:ui.comm.com.RedDot;
	}
	class FactoryTransPanel extends fgui.GComponent{
	}
}
declare namespace ui.factory.item {
	class FactoryHeroItem extends fgui.GComponent{
		public qualityLoader:fgui.GLoader;
		public heroLoader:fgui.GLoader;
		public campLoader:fgui.GLoader;
		public listStar:fgui.GList;
		public lbName:fgui.GTextField;
		public lbLv:fgui.GTextField;
	}
	class FactoryOccupyItem extends fgui.GButton{
		public bg:fgui.GImage;
		public lbTime:fgui.GTextField;
		public lbState:fgui.GTextField;
		public lbLock:fgui.GTextField;
		public redDot:ui.comm.com.RedDot;
		public btnBox:ui.factory.component.FactoryBoxBtn;
	}
	class FactoryOthersItem extends fgui.GComponent{
		public rankLoader:fgui.GLoader;
		public lbProductLine:fgui.GTextField;
		public gProductLine:fgui.GGroup;
		public lbOccupied:fgui.GTextField;
		public gOccupied:fgui.GGroup;
		public lbName:fgui.GTextField;
		public lbFight:fgui.GTextField;
		public lbRank:fgui.GTextField;
		public gInfo:fgui.GGroup;
		public avatar:ui.comm.playerInfo.PlayerAvatar;
		public btnGoto:ui.comm.btn.BtnBuZhen;
	}
	class FactoryRecordItem extends fgui.GComponent{
		public bgUnread:fgui.GImage;
		public bgRead:fgui.GImage;
		public iconUnread:fgui.GImage;
		public iconRead:fgui.GImage;
		public lbTitle:fgui.GTextField;
		public lbContent:fgui.GTextField;
		public lbTime:fgui.GTextField;
	}
}
declare namespace ui.factory.view {
	class FactoryBattleResultWin extends fgui.GComponent{
		public lbName:fgui.GTextField;
		public lbSuccess:fgui.GTextField;
		public labelCloseTips:fgui.GTextField;
		public modelNode:ui.comm.node.ModelNode;
		public btnData:ui.comm.btn.BtnData;
	}
	class FactoryBuyPowerWin extends fgui.GComponent{
		public lbCurPower:fgui.GTextField;
		public lbNextTime:fgui.GTextField;
		public lbFullTime:fgui.GTextField;
		public inputCurCnt:fgui.GTextInput;
		public iconLoader:fgui.GLoader;
		public iconLoader2:fgui.GLoader;
		public lbCount:fgui.GTextField;
		public gBuyCount:fgui.GGroup;
		public gAll:fgui.GGroup;
		public emptyBtn:ui.comm.btn.EmptyBtn;
		public btnSub:ui.comm1.btn.BtnJian1;
		public btnAdd:ui.comm1.btn.BtnJia1;
		public btnBuy:ui.comm.btn.BtnChangGui1WithItem;
	}
	class FactoryMainView extends fgui.GComponent{
		public labelTitle:fgui.GTextField;
		public btnNear:ui.comm.btn.BtnEntrance;
		public btnRecord:ui.comm.btn.BtnEntrance;
		public btnBack:ui.comm.btn.BtnFh2;
		public btnRule:ui.comm.btn.BtnGth3;
		public pMain:ui.factory.component.FactoryMainPanel;
	}
	class FactoryOtherMainView extends fgui.GComponent{
		public gNext:fgui.GGroup;
		public gPrev:fgui.GGroup;
		public pMain:ui.factory.component.FactoryMainPanel;
		public avatarNext:ui.comm.playerInfo.PlayerAvatar;
		public avatarPrev:ui.comm.playerInfo.PlayerAvatar;
		public playerHead:ui.comm.view.PlayerCom;
		public btnNext:ui.comm.btn.BtnJianTou4;
		public btnPrev:ui.comm.btn.BtnJianTou4;
		public btnBack:ui.comm.btn.BtnFh2WithLb;
	}
	class FactoryOthersWin extends fgui.GComponent{
		public lbTitle:fgui.GTextField;
		public listTab:fgui.GList;
		public listRank:fgui.GList;
		public listFriend:fgui.GList;
		public gNone:fgui.GGroup;
		public gFriend:fgui.GGroup;
		public gAll:fgui.GGroup;
		public emptyBtn:ui.comm.btn.EmptyBtn;
	}
	class FactoryProductLineWin extends fgui.GComponent{
		public lbTitle:fgui.GTextField;
		public lbTimeTitle:fgui.GTextField;
		public lbTime:fgui.GTextField;
		public gAll:fgui.GGroup;
		public emptyBtn:ui.comm.btn.EmptyBtn;
		public btnGiveUp:ui.comm.btn.BtnChangGui3;
		public btnDraw:ui.comm.btn.BtnChangGui1WithItem;
		public btnAttack:ui.comm.btn.BtnChangGui1WithItem;
		public btnDef:ui.comm.btn.BtnChangGui1WithItem;
		public btnDraw2:ui.comm.btn.BtnChangGui1;
		public pContent:ui.factory.component.FactoryProductLineContent;
	}
	class FactoryRecordDetailWin extends fgui.GComponent{
		public lbTime:fgui.GTextField;
		public lbMsgTitle:fgui.GTextField;
		public lbMsg:fgui.GRichTextField;
		public lbMsgTime:fgui.GTextField;
		public lbTitle:fgui.GTextField;
		public lbTip:fgui.GTextField;
		public gAll:fgui.GGroup;
		public emptyBtn:ui.comm.btn.EmptyBtn;
		public btnDetail:ui.comm.btn.BtnChangGui3;
		public btnDelete:ui.comm.btn.BtnChangGui1;
		public pOwer:ui.factory.component.FactoryProductLineOwerPanel;
	}
	class FactoryRecordWin extends fgui.GComponent{
		public listRecord:fgui.GList;
		public gNone:fgui.GGroup;
		public gAll:fgui.GGroup;
		public emptyBtn:ui.comm.btn.EmptyBtn;
		public btnDelAll:ui.comm.btn.BtnChangGui3;
		public btnReadAll:ui.comm.btn.BtnChangGui1;
	}
}
