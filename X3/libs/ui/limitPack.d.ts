declare namespace ui.limitPack.component {
	class LimitPackBtn extends fgui.GComponent{
		public lbPriceLock:fgui.GTextField;
		public pLock:fgui.GGroup;
		public lbPrice:fgui.GTextField;
	}
	class LimitPackBtn2 extends fgui.GComponent{
		public lbPriceLock:fgui.GTextField;
		public lbPrice:fgui.GTextField;
	}
	class LimitPackDiscount extends fgui.GComponent{
		public lbDiscount:fgui.GTextField;
	}
	class LimitPackPageBtn extends fgui.GButton{
	}
	class LimitPackPageBtn2 extends fgui.GButton{
	}
}
declare namespace ui.limitPack.item {
	class LimitPackItem1 extends fgui.GComponent{
		public bgPrice:fgui.GImage;
		public bgFree:fgui.GImage;
		public arrow:fgui.GImage;
		public listReward:fgui.GList;
		public btnBuy:ui.limitPack.component.LimitPackBtn;
		public discount:ui.limitPack.component.LimitPackDiscount;
	}
	class LimitPackItem2 extends fgui.GComponent{
		public arrow:fgui.GImage;
		public item1:ui.limitPack.item.LimitPackSmallItem2;
		public item2:ui.limitPack.item.LimitPackSmallItem2;
	}
	class LimitPackSmallItem2 extends fgui.GComponent{
		public bgPrice:fgui.GImage;
		public bgFree:fgui.GImage;
		public listReward:fgui.GList;
		public sellout:fgui.GImage;
		public pSellout:fgui.GGroup;
		public arrow:fgui.GImage;
		public btnBuy:ui.limitPack.component.LimitPackBtn2;
	}
}
declare namespace ui.limitPack.page {
	class LimitPackPage1 extends fgui.GComponent{
		public picTitle:fgui.GLoader;
		public lbTime:fgui.GTextField;
		public list:fgui.GList;
		public bgTip:fgui.GImage;
		public lbTip:fgui.GTextField;
		public panelTip:fgui.GGroup;
		public modelNode:ui.comm.node.ModelNode;
	}
	class LimitPackPage2 extends fgui.GComponent{
		public picTitle:fgui.GLoader;
		public lbTime:fgui.GTextField;
		public lbTip2:fgui.GTextField;
		public list:fgui.GList;
		public bgTip:fgui.GImage;
		public lbTip:fgui.GTextField;
		public panelTip:fgui.GGroup;
		public modelNode:ui.comm.node.ModelNode;
	}
	class LimitPackPage3 extends fgui.GComponent{
		public iconLoader:fgui.GLoader;
		public bgTip:fgui.GImage;
		public lbTip:fgui.GTextField;
		public panelTip:fgui.GGroup;
		public lbTime:fgui.GTextField;
		public listReward:fgui.GList;
		public lbDes:fgui.GTextField;
		public lbName:fgui.GTextField;
		public lbFight:fgui.GTextField;
		public gAll:fgui.GGroup;
		public btnBuy:ui.comm.btn.BtnChangGui1;
	}
	class LimitPackPage4 extends fgui.GComponent{
		public cdLb:fgui.GTextField;
		public modelNode:ui.comm.node.ModelNode;
		public buyBtn:ui.comm.btn.BtnChangGui1;
		public itemList:ui.comm.item.ItemListComp2;
	}
}
declare namespace ui.limitPack.view {
	class LimitPackMainWin extends fgui.GComponent{
		public listTab:fgui.GList;
		public page1:ui.limitPack.page.LimitPackPage1;
		public page2:ui.limitPack.page.LimitPackPage2;
		public page3:ui.limitPack.page.LimitPackPage3;
		public page4:ui.limitPack.page.LimitPackPage4;
		public btnPrev:ui.limitPack.component.LimitPackPageBtn;
		public btnNext:ui.limitPack.component.LimitPackPageBtn;
	}
}
