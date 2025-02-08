declare namespace ui.dailySale {
	class DailySaleMainView extends fgui.GComponent{
		public ui:ui.dailySale.page.DailySalePage;
		public btnBack:ui.dailySale.btn.RedCloseBtn;
	}
}
declare namespace ui.dailySale.btn {
	class buyBtn extends fgui.GButton{
		public redDot:ui.comm.com.RedDot;
	}
	class emptyBg extends fgui.GButton{
	}
	class packGiftBtn extends fgui.GButton{
	}
	class RedCloseBtn extends fgui.GButton{
	}
	class shopBtn extends fgui.GButton{
		public modelNodeTop:ui.comm.node.ModelNode;
		public modelNodeBottom:ui.comm.node.ModelNode;
	}
}
declare namespace ui.dailySale.item {
	class DailySaleItem extends fgui.GComponent{
		public list_bg_img:fgui.GImage;
		public gift_img:fgui.GImage;
		public listReward:fgui.GList;
		public lbLimit:fgui.GTextField;
		public iconBuy:fgui.GImage;
		public btnDraw:ui.dailySale.btn.buyBtn;
	}
	class DailySalePackItem extends fgui.GComponent{
		public tip1_bg_img:fgui.GImage;
		public lbTip2:fgui.GTextField;
		public tip12_bg_img:fgui.GImage;
		public lbTip1:fgui.GTextField;
		public tip2_image:fgui.GImage;
		public packShowBtn:ui.dailySale.btn.packGiftBtn;
		public btnBuyPack:ui.comm.btn.BtnChangGui1;
	}
}
declare namespace ui.dailySale.page {
	class DailySalePage extends fgui.GComponent{
		public bg:fgui.GImage;
		public title:fgui.GImage;
		public listBg:fgui.GImage;
		public shop_label:fgui.GTextField;
		public list:fgui.GList;
		public itemPack:ui.dailySale.item.DailySalePackItem;
		public shopBtn:ui.dailySale.btn.shopBtn;
	}
}
