declare namespace ui.vip.component {
	class VipBuyBtn extends fgui.GButton{
		public lbPrice:fgui.GTextField;
		public lbCost:fgui.GTextField;
		public iconCost:fgui.GLoader;
		public pCost:fgui.GGroup;
		public redDot:ui.comm.com.RedDot;
	}
	class VipExpProgressBar extends fgui.GProgressBar{
		public bar:fgui.GImage;
		public title:fgui.GTextField;
	}
	class VipPageBtn extends fgui.GButton{
		public redDot:ui.comm.com.RedDot;
	}
}
declare namespace ui.vip.item {
	class VipAdditionItem extends fgui.GComponent{
		public iconNew:fgui.GImage;
		public iconRaise:fgui.GImage;
		public iconOld:fgui.GImage;
		public lbDes:fgui.GRichTextField;
	}
	class VipGoodsItem extends fgui.GComponent{
		public listReward:fgui.GList;
		public lbLimit:fgui.GTextField;
		public bgDiscount:fgui.GImage;
		public lbDiscount:fgui.GTextField;
		public lbDiscountValue:fgui.GTextField;
		public pDiscount:fgui.GGroup;
		public btnBuy:ui.vip.component.VipBuyBtn;
	}
}
declare namespace ui.vip.page {
	class VipContentPanel extends fgui.GComponent{
		public listGoods:fgui.GList;
		public listAddition:fgui.GList;
	}
	class VipPage extends fgui.GComponent{
		public top_bg:fgui.GImage;
		public bgTip:fgui.GImage;
		public bgCenter:fgui.GImage;
		public lbTitle:fgui.GTextField;
		public lbVipLv:fgui.GTextField;
		public lbDes:fgui.GTextField;
		public btnPrev:ui.vip.component.VipPageBtn;
		public btnNext:ui.vip.component.VipPageBtn;
		public panelContent:ui.vip.page.VipContentPanel;
		public expProgress:ui.vip.component.VipExpProgressBar;
		public headerItem:ui.comm.header.HeaderItem;
		public btnRule:ui.comm.btn.BaseBtn;
	}
}
