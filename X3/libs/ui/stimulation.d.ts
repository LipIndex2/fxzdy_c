declare namespace ui.stimulation.component {
	class StimulationAdBtn extends fgui.GButton{
		public redDot:ui.comm.com.RedDot;
	}
	class StimulationMainBottom extends fgui.GComponent{
		public bg:fgui.GImage;
		public listPos:fgui.GList;
		public lbLv:fgui.GTextField;
		public lbLvNext:fgui.GTextField;
		public gLv:fgui.GGroup;
		public lbCapacity:fgui.GTextField;
		public lbCapacityAdd:fgui.GTextField;
		public gCapacity:fgui.GGroup;
		public lbSpeed:fgui.GTextField;
		public lbSpeedAdd:fgui.GTextField;
		public Gspeed:fgui.GGroup;
		public lbUnlock:fgui.GTextField;
		public lbFull:fgui.GTextField;
		public gFull:fgui.GGroup;
		public lbTime:fgui.GTextField;
		public gUpgrading:fgui.GGroup;
		public gBotom:fgui.GGroup;
		public btnRecycle:ui.stimulation.component.StimulationRecycleBtn;
		public btnAd:ui.stimulation.component.StimulationAdBtn;
		public btnUp:ui.comm.btn.BtnChangGui1WithItem;
		public btnSkip:ui.comm.btn.BtnChangGui1WithItem;
		public btnAuto:ui.comm.btn.BtnBuZhen;
	}
	class StimulationMainTop extends fgui.GComponent{
		public lbTitle:fgui.GTextField;
		public lbAddSpeed:fgui.GTextField;
		public lbAllCapacityT:fgui.GTextField;
		public iconLoader:fgui.GLoader;
		public lbAllCapacity:fgui.GTextField;
		public gAllCapacity:fgui.GGroup;
		public gTop:fgui.GGroup;
	}
	class StimulationRecycleBtn extends fgui.GButton{
		public iconLock:fgui.GImage;
	}
}
declare namespace ui.stimulation.item {
	class StimulationHeroItem extends fgui.GComponent{
		public lbCapacity:fgui.GTextField;
		public gAdd:fgui.GGroup;
		public heroItem:ui.comm.item.HeroItem;
	}
	class StimulationPosItem extends fgui.GComponent{
		public iconAdd:fgui.GImage;
		public lbNeedLv:fgui.GTextField;
		public gLock:fgui.GGroup;
		public heroItem:ui.stimulation.item.StimulationHeroItem;
	}
}
declare namespace ui.stimulation.view {
	class StimulationDispatchWin extends fgui.GComponent{
		public listHero:fgui.GList;
		public listPos:fgui.GList;
		public lbTitle:fgui.GTextField;
		public gAll:fgui.GGroup;
		public btnRule:ui.comm.btn.BtnGth3;
		public emptyBtn:ui.comm.btn.EmptyBtn;
	}
	class StimulationMainView extends fgui.GComponent{
		public buildingPos:fgui.GGraph;
		public pBottom:ui.stimulation.component.StimulationMainBottom;
		public pTop:ui.stimulation.component.StimulationMainTop;
		public spineLvUp:ui.comm.node.ModelNode;
		public footer:ui.comm.back.BackFooter3;
	}
	class StimulationRecycleWin extends fgui.GComponent{
		public lbTitle:fgui.GTextField;
		public lbTip:fgui.GTextField;
		public inputCurCnt:fgui.GTextInput;
		public gAll:fgui.GGroup;
		public btnSub:ui.comm1.btn.BtnJian1;
		public emptyBtn:ui.comm.btn.EmptyBtn;
		public btnMax:ui.comm1.btn.BtnZuiDa2;
		public btnAdd:ui.comm1.btn.BtnJia1;
		public btnRecycle:ui.comm.btn.BtnChangGui1WithItem;
		public headerCost:ui.comm.header.HeaderItem;
		public headerReward:ui.comm.header.HeaderItem;
		public itemCost:ui.comm.item.ItemFrameBtn;
		public itemReward:ui.comm.item.ItemFrameBtn;
	}
}
