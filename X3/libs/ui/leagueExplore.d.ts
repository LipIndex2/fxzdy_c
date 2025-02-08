declare namespace ui.leagueExplore.component {
	class LeagueExploreCardBtn extends fgui.GButton{
	}
	class LeagueExploreGotoBtn extends fgui.GButton{
	}
	class LeagueExploreMainBg extends fgui.GComponent{
		public bg1:fgui.GLoader;
		public bg2:fgui.GLoader;
	}
	class LeagueExploreMainBtn extends fgui.GComponent{
		public title:fgui.GTextField;
	}
	class LeagueExploreMarker extends fgui.GComponent{
		public bg:fgui.GImage;
		public lbWin:fgui.GTextField;
	}
	class LeagueExploreMiniContent extends fgui.GComponent{
		public mapItem:ui.leagueExplore.component.LeagueExploreMiniContentItem;
	}
	class LeagueExploreMiniContentItem extends fgui.GComponent{
		public mapItem:ui.comm.miniMap.MiniMapShowBuildingItem;
	}
	class LeagueExploreMiniMap extends fgui.GComponent{
		public lbName:fgui.GTextField;
		public mapItem:ui.comm.miniMap.MiniMapItem;
	}
	class LeagueExploreNightTimeTip extends fgui.GComponent{
		public lbNightTime:fgui.GTextField;
		public gTime:fgui.GGroup;
	}
	class LeagueExploreReportBtn extends fgui.GButton{
	}
	class LeagueExploreTabBtn extends fgui.GButton{
		public redDot:ui.comm.com.RedDot;
	}
	class LeagueExploreTabBtn2 extends fgui.GButton{
		public redDot:ui.comm.com.RedDot;
	}
}
declare namespace ui.leagueExplore.item {
	class LeagueExploreDefendItem extends fgui.GComponent{
		public lbOccupyTip:fgui.GTextField;
		public gNone:fgui.GGroup;
		public lbName:fgui.GTextField;
		public lbFight:fgui.GTextField;
		public gInfo:fgui.GGroup;
		public lbIdx:fgui.GTextField;
		public gIdx:fgui.GGroup;
		public iconMarker:ui.leagueExplore.component.LeagueExploreMarker;
		public btnTop:ui.comm.btn.BtnBuZhen;
		public avatar:ui.comm.playerInfo.PlayerAvatar;
	}
	class LeagueExploreIncomeItem extends fgui.GComponent{
		public iconLoader:fgui.GLoader;
		public lbValue:fgui.GTextField;
		public lbAddition:fgui.GTextField;
	}
	class LeagueExploreMainItem extends fgui.GComponent{
		public listPlanet:fgui.GList;
		public maskLoader:fgui.GLoader;
		public itemTitle:ui.leagueExplore.item.LeagueExploreMainTitleItem;
	}
	class LeagueExploreMainTitleItem extends fgui.GComponent{
		public lbName:fgui.GTextField;
		public lbTip:fgui.GRichTextField;
		public gTitle:fgui.GGroup;
	}
	class LeagueExploreMiniDetailItem extends fgui.GComponent{
		public bg:fgui.GImage;
		public iconLoader:fgui.GLoader;
		public lbLeague:fgui.GTextField;
		public lbBuilding:fgui.GTextField;
		public lbPlayer:fgui.GTextField;
		public btnGoto:ui.comm.btn.EmptyBtn;
		public avatar:ui.comm.playerInfo.PlayerAvatar;
	}
	class LeagueExploreMiniItem extends fgui.GComponent{
		public bgDetail:fgui.GImage;
		public listDetail:fgui.GList;
		public gDetail:fgui.GGroup;
		public bg:fgui.GImage;
		public iconLoader:fgui.GLoader;
		public lbName:fgui.GTextField;
		public lbLeague:fgui.GTextField;
		public lbCnt:fgui.GTextField;
		public line:fgui.GGraph;
		public gTitle:fgui.GGroup;
		public btnState:ui.comm.btn.EmptyBtn;
		public btnGoto:ui.comm.btn.EmptyBtn;
	}
	class LeagueExplorePlanetBtn extends fgui.GButton{
		public bg:fgui.GGraph;
		public iconLoader:fgui.GLoader;
		public lbUnlock:fgui.GTextField;
		public iconMyLeague:fgui.GImage;
		public lbName:fgui.GTextField;
		public lbProgress:fgui.GTextField;
		public gProgress:fgui.GGroup;
		public gInfo:fgui.GGroup;
		public gAll:fgui.GGroup;
		public iconMine:ui.leagueExplore.item.LeagueExploreSmallAvatar;
	}
	class LeagueExplorePlanetItem extends fgui.GComponent{
		public btnPlanet:ui.leagueExplore.item.LeagueExplorePlanetBtn;
	}
	class LeagueExploreQuickItem extends fgui.GComponent{
		public inputCurCnt:fgui.GTextInput;
		public listReward:fgui.GList;
		public btnDraw:ui.comm.btn.BtnChangGui1WithItem;
		public btnSub:ui.comm1.btn.BtnJian1;
		public btnAdd:ui.comm1.btn.BtnJia1;
	}
	class LeagueExploreRecordItem1 extends fgui.GComponent{
		public iconEnemyAttk:fgui.GImage;
		public iconMyAttk:fgui.GImage;
		public lbDes:fgui.GRichTextField;
		public lbMyName:fgui.GTextField;
		public lbMyLeague:fgui.GTextField;
		public lbEnemyName:fgui.GTextField;
		public lbEnemyLeague:fgui.GTextField;
		public btnReport:ui.leagueExplore.component.LeagueExploreReportBtn;
		public btnGoto:ui.comm.btn.EmptyBtn;
		public avatarMy:ui.comm.playerInfo.PlayerAvatar;
		public avatarEnemy:ui.comm.playerInfo.PlayerAvatar;
	}
	class LeagueExploreRecordItem2 extends fgui.GComponent{
		public lbTime:fgui.GTextField;
		public lbDes:fgui.GRichTextField;
	}
	class LeagueExploreRewardItem extends fgui.GComponent{
		public rankLoader:fgui.GLoader;
		public listReward:fgui.GList;
		public lbRank:fgui.GTextField;
	}
	class LeagueExploreShareItem extends fgui.GComponent{
		public lbChannel:fgui.GTextField;
		public btnGouXuan:ui.comm.btn.BtnGouXuan;
	}
	class LeagueExploreSmallAvatar extends fgui.GComponent{
		public imagePlayerAvatar:fgui.GLoader;
	}
}
declare namespace ui.leagueExplore.subView {
	class LeagueExploreIncomeSubView extends fgui.GComponent{
		public listIncome:fgui.GList;
		public listReward:fgui.GList;
		public iconBuilding:fgui.GLoader;
		public lbBuildingName:fgui.GTextField;
		public gBuilding:fgui.GGroup;
		public lbNoneTip:fgui.GTextField;
		public lbTime:fgui.GTextField;
		public lbAttkTimes:fgui.GTextField;
		public btnBuyCard:ui.leagueExplore.component.LeagueExploreCardBtn;
		public btnGoto:ui.leagueExplore.component.LeagueExploreGotoBtn;
		public btnZuan:ui.comm.btn.BtnBuZhen;
		public btnDraw:ui.comm.btn.BtnChangGui1;
		public btnRule:ui.comm.btn.BtnGth3;
	}
	class LeagueExploreRecordSubView1 extends fgui.GComponent{
		public lbTitle:fgui.GTextField;
		public listRecord:fgui.GList;
		public gNone:fgui.GGroup;
		public btnRule:ui.comm.btn.BtnGth3;
	}
	class LeagueExploreRecordSubView2 extends fgui.GComponent{
		public lbTitle:fgui.GTextField;
		public listRecord:fgui.GList;
		public gNone:fgui.GGroup;
		public btnRule:ui.comm.btn.BtnGth3;
	}
	class LeagueExploreRewardSubView extends fgui.GComponent{
		public listReward:fgui.GList;
		public lbTime:fgui.GRichTextField;
		public listRank:fgui.GList;
		public lbRank:fgui.GTextField;
		public lbTip:fgui.GTextField;
	}
}
declare namespace ui.leagueExplore.view {
	class LeagueExploreBuyAtkTimesWin extends fgui.GComponent{
		public lbTitle:fgui.GTextField;
		public lbTip:fgui.GTextField;
		public lbContent:fgui.GRichTextField;
		public gAll:fgui.GGroup;
		public emptyBtn:ui.comm.btn.EmptyBtn;
		public btnConfirm:ui.comm.btn.BtnChangGui1WithItem;
		public btnGouXuan:ui.comm.btn.BtnGouXuan;
		public btnCancel:ui.comm.btn.BtnChangGui3;
		public btnClose:ui.comm.btn.GoToBackButton_1;
	}
	class LeagueExploreExchangeConfirmWin extends fgui.GComponent{
		public bg:fgui.GLoader;
		public fg:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public labelContent:fgui.GRichTextField;
		public gAll:fgui.GGroup;
		public btnYes:ui.comm.btn.BtnChangGui1;
		public btnNo:ui.comm.btn.BtnChangGui3;
	}
	class LeagueExploreFactoryWin extends fgui.GComponent{
		public listDefend:fgui.GList;
		public listIncome:fgui.GList;
		public lbTitle:fgui.GTextField;
		public lbOccupyName:fgui.GTextField;
		public lbDefend:fgui.GTextField;
		public lbStateTime:fgui.GTextField;
		public gAll:fgui.GGroup;
		public emptyBtn:ui.comm.btn.EmptyBtn;
		public btnBuzhen:ui.comm.btn.BtnBuZhen;
		public btnZuan:ui.comm.btn.BtnBuZhen;
		public btnSure:ui.comm.btn.BtnChangGui1;
		public btnRule:ui.comm.btn.BtnGth3;
		public btnShare:ui.comm.btn.BtnEntrance;
	}
	class LeagueExploreIncomeWin extends fgui.GComponent{
		public listTab:fgui.GList;
		public gAll:fgui.GGroup;
		public viewContainer:ui.comm.ViewContainer.ViewContainer;
	}
	class LeagueExploreMainView extends fgui.GComponent{
		public listMain:fgui.GList;
		public gHeader:fgui.GGroup;
		public lbName:fgui.GTextField;
		public lbTime:fgui.GTextField;
		public bg:ui.leagueExplore.component.LeagueExploreMainBg;
		public btnRule:ui.comm.btn.BtnGth3;
		public btnMine:ui.comm.btn.BtnEntrance;
		public btnIncome:ui.comm.btn.BtnEntrance;
		public btnBack:ui.comm.btn.BtnFh2;
		public headerItem1:ui.comm.header.HeaderItem;
		public headerItem2:ui.comm.header.HeaderItem;
		public headerItem3:ui.comm.header.HeaderItem;
		public headerItem4:ui.comm.header.HeaderItem;
		public anim0:ui.comm.node.ModelNode;
	}
	class LeagueExploreMapView extends fgui.GComponent{
		public gHeader:fgui.GGroup;
		public lbAttackTime:fgui.GTextField;
		public gbuilding:fgui.GGroup;
		public btnMain:ui.leagueExplore.component.LeagueExploreMainBtn;
		public miniMap:ui.leagueExplore.component.LeagueExploreMiniMap;
		public nightTip:ui.leagueExplore.component.LeagueExploreNightTimeTip;
		public btnIncome:ui.comm.btn.BtnEntrance;
		public btnRank:ui.comm.btn.BtnEntrance;
		public btnBack:ui.comm.btn.BtnFh2;
		public chat:ui.comm1.chat.ChatComp;
		public headPlayer:ui.comm.view.PlayerCom;
		public headerItem1:ui.comm.header.HeaderItem;
		public headerItem2:ui.comm.header.HeaderItem;
		public headerItem3:ui.comm.header.HeaderItem;
		public headerItem4:ui.comm.header.HeaderItem;
		public buildingBtn:ui.comm.building.BuildingBtn;
	}
	class LeagueExploreMineWin extends fgui.GComponent{
		public iconLoader:fgui.GLoader;
		public listDefend:fgui.GList;
		public listIncome:fgui.GList;
		public lbOccupyPlayerTitle:fgui.GTextField;
		public lbTimeTitle:fgui.GTextField;
		public lbTitle:fgui.GTextField;
		public lbOccupyName:fgui.GTextField;
		public lbOccupyPlayer:fgui.GTextField;
		public lbTime:fgui.GTextField;
		public lbStateTime:fgui.GTextField;
		public gAll:fgui.GGroup;
		public emptyBtn:ui.comm.btn.EmptyBtn;
		public btnBuzhen:ui.comm.btn.BtnBuZhen;
		public btnZuan:ui.comm.btn.BtnBuZhen;
		public btnSure:ui.comm.btn.BtnChangGui1;
		public btnRule:ui.comm.btn.BtnGth3;
		public btnShare:ui.comm.btn.BtnEntrance;
	}
	class LeagueExploreMiniWin extends fgui.GComponent{
		public bgLoader:fgui.GLoader;
		public mapMask:fgui.GImage;
		public listFactory:fgui.GList;
		public listMine:fgui.GList;
		public lbTitle:fgui.GTextField;
		public gAll:fgui.GGroup;
		public map:ui.leagueExplore.component.LeagueExploreMiniContent;
		public btnRule:ui.comm.btn.BtnGth3;
	}
	class LeagueExploreQuickWin extends fgui.GComponent{
		public list:fgui.GList;
		public gAll:fgui.GGroup;
		public emptyBtn:ui.comm.btn.EmptyBtn;
	}
	class LeagueExploreRewardWin extends fgui.GComponent{
		public listTab:fgui.GList;
		public gAll:fgui.GGroup;
		public viewContainer:ui.comm.ViewContainer.ViewContainer;
	}
	class LeagueExploreShareWin extends fgui.GComponent{
		public listShare:fgui.GList;
		public gAll:fgui.GGroup;
		public emptyBtn:ui.comm.btn.EmptyBtn;
		public btnShare:ui.comm.btn.BtnChangGui1;
	}
}
