declare namespace ui.charge.component {
	class ChargeLimitBuyBtn extends fgui.GButton{
		public iconAd:fgui.GImage;
		public lbPrice:fgui.GTextField;
		public gPrice:fgui.GGroup;
	}
	class ChargePrivilegeBtn extends fgui.GButton{
	}
	class ChargeProgress extends fgui.GProgressBar{
		public bar:fgui.GImage;
	}
	class ChargeTabBtn extends fgui.GButton{
		public titleSelect:fgui.GTextField;
		public redDot:ui.comm.com.RedDot;
	}
}
declare namespace ui.charge.item {
	class ChargeLimitIconItem extends fgui.GButton{
		public bg:fgui.GLoader;
		public itemIcon:fgui.GLoader;
		public itemCount:fgui.GTextField;
	}
	class ChargeLimitItem extends fgui.GComponent{
		public lbLimit:fgui.GTextField;
		public listReward:fgui.GList;
		public iconLoader:fgui.GLoader;
		public pSellOut:fgui.GGroup;
		public redDot:ui.comm.com.RedDot;
		public emptyBtn:ui.comm.btn.EmptyBtn;
		public btnBuy:ui.charge.component.ChargeLimitBuyBtn;
		public cornerMark:ui.comm.view.CornerMark;
	}
	class ChargeLimitItem2 extends fgui.GComponent{
		public lbLimit:fgui.GTextField;
		public lbName:fgui.GTextField;
		public listReward:fgui.GList;
		public pSellOut:fgui.GGroup;
		public btnBuy:ui.comm.btn.BtnChangGui1;
		public emptyBtn:ui.comm.btn.EmptyBtn;
		public cornerMark:ui.comm.view.CornerMark;
	}
	class ChargeLimitPageItem extends fgui.GComponent{
		public lbTitle:fgui.GTextField;
		public list:fgui.GList;
		public list2:fgui.GList;
		public lbTime:fgui.GTextField;
		public pTime:fgui.GGroup;
	}
	class ChargeNormalItem extends fgui.GComponent{
		public iconLoader:fgui.GLoader;
		public lbName:fgui.GTextField;
		public bgFirst:fgui.GImage;
		public lbFristReward:fgui.GTextField;
		public fristIconLoader:fgui.GLoader;
		public pFirst:fgui.GGroup;
		public btnBuy:ui.comm.btn.BtnChangGui1;
	}
	class ChargeNormalRowItem extends fgui.GComponent{
		public list:fgui.GList;
	}
}
declare namespace ui.charge.page {
	class ChargeLimitPage extends fgui.GComponent{
		public list:fgui.GList;
		public top_bg:fgui.GImage;
		public headerItem:ui.comm.header.HeaderItem;
	}
	class ChargeNormalPage extends fgui.GComponent{
		public iconTitle:fgui.GImage;
		public lbVipDes:fgui.GTextField;
		public lbVip:fgui.GTextField;
		public list:fgui.GList;
		public panel:fgui.GGroup;
		public top_bg:fgui.GImage;
		public headerItem:ui.comm.header.HeaderItem;
		public progressVip:ui.charge.component.ChargeProgress;
		public btnPrivilege:ui.charge.component.ChargePrivilegeBtn;
	}
}
declare namespace ui.charge.view {
	class ChargeMainWin extends fgui.GComponent{
		public listTab:fgui.GList;
		public footer:ui.comm.back.BackFooter3;
		public viewContainer:ui.comm.ViewContainer.ViewContainer;
	}
}
