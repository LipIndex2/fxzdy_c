declare namespace ui.blackShop {
	class BlackShopSubView extends fgui.GComponent{
		public img_bg:fgui.GLoader;
		public T_restTime:fgui.GTextField;
		public T_title1:fgui.GTextField;
		public T_title2:fgui.GTextField;
		public rowList:fgui.GList;
		public btn_jumpBlack:fgui.GLoader;
		public G_black:fgui.GGroup;
		public desLab1:fgui.GRichTextField;
		public desLab2:fgui.GRichTextField;
		public btnRule:ui.comm.btn.BtnGth3;
		public headerItem:ui.comm.header.HeaderItem;
	}
	class DemoView extends fgui.GComponent{
	}
}
declare namespace ui.blackShop.btn {
	class BlackShopBuyBtn extends fgui.GButton{
		public labelPay:fgui.GTextField;
		public imgItem:fgui.GLoader;
		public labelCostItemCount:fgui.GTextField;
		public G_payItem:fgui.GGroup;
		public redDot:ui.comm.com.RedDot;
	}
	class BlackShopGoHangUpBtn extends fgui.GButton{
	}
	class BlackShopGoSecretLevelBtn extends fgui.GButton{
	}
}
declare namespace ui.blackShop.item {
	class BlackShopFreeBtn extends fgui.GComponent{
		public title:fgui.GTextField;
	}
	class BlackShopRowComp extends fgui.GComponent{
		public bg:fgui.GLoader;
		public T_title:fgui.GTextField;
		public T_titleCount:fgui.GRichTextField;
		public T_count:fgui.GTextField;
		public itemList:ui.comm.item.ItemListComp;
		public btn_free:ui.comm.btn.BtnChangGui1;
		public redDot:ui.comm.com.RedDot;
		public btn_buy:ui.blackShop.btn.BlackShopBuyBtn;
	}
}
