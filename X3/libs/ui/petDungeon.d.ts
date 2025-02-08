declare namespace ui.petDungeon.component {
	class PetDungeonBattleFailComp extends fgui.GComponent{
		public lbClose:fgui.GTextField;
		public heroComp:ui.petDungeon.component.PetDungeonBattleHeroList;
		public modelNode:ui.comm.node.ModelNode;
		public pFail:ui.commBattle.battle.components.CommonFailPanel;
	}
	class PetDungeonBattleHeroList extends fgui.GComponent{
		public lbTitle:fgui.GTextField;
		public listHero:fgui.GList;
	}
	class PetDungeonBattleWinComp extends fgui.GComponent{
		public itemList:fgui.GList;
		public lbNoneRewardTip:fgui.GTextField;
		public gInfo:fgui.GGroup;
		public lbAutoTime:fgui.GTextField;
		public gNext:fgui.GGroup;
		public lbClose:fgui.GTextField;
		public heroComp:ui.petDungeon.component.PetDungeonBattleHeroList;
		public btnNext:ui.comm.btn.BtnChangGui1;
		public modelNode:ui.comm.node.ModelNode;
		public btnData:ui.comm.btn.BtnData;
		public btnGouXuan:ui.comm.btn.BtnGouXuan;
	}
	class PetDungeonBoxBtn extends fgui.GButton{
		public redDot:ui.comm.com.RedDot;
	}
	class PetDungeonCareerSelectBtn extends fgui.GButton{
	}
	class PetDungeonCareerSelectList extends fgui.GComponent{
		public listCareer:fgui.GList;
		public btnAll:ui.petDungeon.component.PetDungeonCareerSelectBtn;
	}
	class PetDungeonHeroHp extends fgui.GProgressBar{
		public bar:fgui.GImage;
		public title:fgui.GTextField;
	}
	class PetDungeonTitleComp extends fgui.GComponent{
		public lbTime:fgui.GRichTextField;
		public btnRule:ui.comm.btn.BtnGth3;
	}
	class PetDungeonToyBoxBtn extends fgui.GButton{
		public redDot:ui.comm.com.RedDot;
	}
	class PetDungeonToyCellBg extends fgui.GComponent{
	}
	class PetDungeonToyCellContainer extends fgui.GComponent{
	}
	class PetDungeonToyDelBtn extends fgui.GButton{
		public iconDel:ui.petDungeon.component.PetDungeonToyDelIcon;
	}
	class PetDungeonToyDelIcon extends fgui.GComponent{
	}
	class PetDungeonToyDragComp extends fgui.GComponent{
	}
	class PetDungeonToyIcon extends fgui.GComponent{
		public iconLoader:fgui.GLoader;
	}
}
declare namespace ui.petDungeon.item {
	class PetDungeonHeroItem extends fgui.GComponent{
		public bgLoader:fgui.GLoader;
		public iconLoader:fgui.GLoader;
		public careerLoader:fgui.GLoader;
		public listStar:fgui.GList;
		public hpBar:ui.petDungeon.component.PetDungeonHeroHp;
	}
	class PetDungeonSelectHeroItem extends fgui.GComponent{
		public bgLoader:fgui.GLoader;
		public iconLoader:fgui.GLoader;
		public careerLoader:fgui.GLoader;
		public listStar:fgui.GList;
		public lbName:fgui.GTextField;
		public lbLv:fgui.GTextField;
		public gSelect:fgui.GGroup;
	}
	class PetDungeonToyAttrItem extends fgui.GComponent{
		public lbTitle:fgui.GTextField;
		public lbValue:fgui.GTextField;
	}
	class PetDungeonToyBoxItem extends fgui.GComponent{
		public toyRect:fgui.GGraph;
		public lbLv:fgui.GTextField;
		public lbAttr:fgui.GRichTextField;
		public lbTip:fgui.GTextField;
		public gTip:fgui.GGroup;
	}
	class PetDungeonToyCellItem extends fgui.GComponent{
	}
	class PetDungeonToyIconItem extends fgui.GComponent{
		public lbLv:fgui.GTextField;
	}
	class PetDungeonUpHeroItem extends fgui.GComponent{
		public bgLoader:fgui.GLoader;
		public iconLoader:fgui.GLoader;
		public careerLoader:fgui.GLoader;
		public iconUpLock:fgui.GImage;
		public listStar:fgui.GList;
		public gHero:fgui.GGroup;
		public gEmpty:fgui.GGroup;
		public lockBgLoader:fgui.GLoader;
		public lbLockTip:fgui.GTextField;
		public lbLock:fgui.GTextField;
		public gLock:fgui.GGroup;
	}
}
declare namespace ui.petDungeon.view {
	class PetDungeonBattleFailView extends fgui.GComponent{
		public failComp:ui.petDungeon.component.PetDungeonBattleFailComp;
	}
	class PetDungeonBattleWinView extends fgui.GComponent{
		public winComp:ui.petDungeon.component.PetDungeonBattleWinComp;
	}
	class PetDungeonChallengeWin extends fgui.GComponent{
		public bg:fgui.GLoader;
		public fg:fgui.GLoader;
		public labelTitle:fgui.GTextField;
		public bgTitle:fgui.GImage;
		public labelLevelTitle:fgui.GTextField;
		public levelTitle:fgui.GGroup;
		public bgEnemySchema:fgui.GLoader;
		public bgPower:fgui.GLoader;
		public labelPower:fgui.GTextField;
		public listReward:fgui.GList;
		public all:fgui.GGroup;
		public btnChallenge:ui.comm.btn.BtnChangGui1;
		public btnEdit:ui.comm.btn.BtnBuZhen;
		public modelNode1:ui.comm.node.ModelNode;
		public modelNode2:ui.comm.node.ModelNode;
		public modelNode3:ui.comm.node.ModelNode;
		public modelNode4:ui.comm.node.ModelNode;
		public modelNode5:ui.comm.node.ModelNode;
		public modelNode6:ui.comm.node.ModelNode;
	}
	class PetDungeonMainView extends fgui.GComponent{
		public bg:fgui.GLoader;
		public top_bg1:fgui.GImage;
		public bottom_bg1:fgui.GImage;
		public bgEnter:fgui.GLoader;
		public bg2:fgui.GLoader;
		public lbNextChapter:fgui.GRichTextField;
		public lbChapter:fgui.GRichTextField;
		public gInfo:fgui.GGroup;
		public gHeader:fgui.GGroup;
		public tilteComp:ui.petDungeon.component.PetDungeonTitleComp;
		public btnEnter:ui.comm.btn.BtnChangGui1;
		public btnBack:ui.comm.btn.BtnFh2;
		public btnShop:ui.comm.btn.BtnEntrance;
		public btnRank:ui.comm.btn.BtnEntrance;
		public headerItem1:ui.comm.header.HeaderItem;
		public headerItem2:ui.comm.header.HeaderItem;
		public headerItem3:ui.comm.header.HeaderItem;
		public headerItem4:ui.comm.header.HeaderItem;
	}
	class PetDungeonMapView extends fgui.GComponent{
		public listHero:fgui.GList;
		public gHero:fgui.GGroup;
		public gHeader:fgui.GGroup;
		public tilteComp:ui.petDungeon.component.PetDungeonTitleComp;
		public btnBox:ui.petDungeon.component.PetDungeonBoxBtn;
		public btnGo:ui.comm.btn.BtnChangGui1;
		public btnBack:ui.comm.btn.BtnFh2;
		public btnReset:ui.comm.btn.BtnBuZhen;
		public btnEdit:ui.comm.btn.BtnBuZhen;
		public btnShop:ui.comm.btn.BtnEntrance;
		public btnRank:ui.comm.btn.BtnEntrance;
		public headerItem1:ui.comm.header.HeaderItem;
		public headerItem2:ui.comm.header.HeaderItem;
		public headerItem3:ui.comm.header.HeaderItem;
		public headerItem4:ui.comm.header.HeaderItem;
	}
	class PetDungeonSelectHeroWin extends fgui.GComponent{
		public listUp:fgui.GList;
		public listSelect:fgui.GList;
		public gAll:fgui.GGroup;
		public careerComp:ui.petDungeon.component.PetDungeonCareerSelectList;
		public btnLock:ui.comm.btn.BtnChangGui1;
		public emptyBtn:ui.comm.btn.EmptyBtn;
	}
	class PetDungeonToyBoxWin extends fgui.GComponent{
		public listToy:fgui.GList;
		public lbTimes:fgui.GTextField;
		public gAll:fgui.GGroup;
		public btnBox:ui.petDungeon.component.PetDungeonToyBoxBtn;
		public btnDel:ui.petDungeon.component.PetDungeonToyDelBtn;
		public dragComp:ui.petDungeon.component.PetDungeonToyDragComp;
		public btnRefresh:ui.comm.btn.BtnChangGui1;
		public emptyBtn:ui.comm.btn.EmptyBtn;
		public btnAd:ui.comm.btn.BtnChangGui3;
	}
	class PetDungeonToyDelWin extends fgui.GComponent{
		public iconLoader:fgui.GLoader;
		public lbLv:fgui.GTextField;
		public lbAttr:fgui.GRichTextField;
		public gAll:fgui.GGroup;
		public btnSure:ui.comm.btn.BtnChangGui1;
		public emptyBtn:ui.comm.btn.EmptyBtn;
		public btnGouXuan:ui.comm.btn.BtnGouXuan;
		public btnCancel:ui.comm.btn.BtnChangGui3;
	}
	class PetDungeonToyInfoWin extends fgui.GComponent{
		public iconLoader:fgui.GLoader;
		public lbLv:fgui.GTextField;
		public lbAttr:fgui.GRichTextField;
		public gAll:fgui.GGroup;
		public emptyBtn:ui.comm.btn.EmptyBtn;
	}
	class PetDungeonToyWin extends fgui.GComponent{
		public bgWear:fgui.GLoader;
		public listToy:fgui.GList;
		public listAttr:fgui.GList;
		public listCell:fgui.GList;
		public gTip:fgui.GGroup;
		public lbNoneTip:fgui.GTextField;
		public gAll:fgui.GGroup;
		public btnBox:ui.petDungeon.component.PetDungeonToyBoxBtn;
		public btnDel:ui.petDungeon.component.PetDungeonToyDelBtn;
		public cellContainer:ui.petDungeon.component.PetDungeonToyCellContainer;
		public dragComp:ui.petDungeon.component.PetDungeonToyDragComp;
		public btnBack:ui.comm.btn.BtnFh2;
	}
}
