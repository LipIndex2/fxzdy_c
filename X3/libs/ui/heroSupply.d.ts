declare namespace ui.heroSupply {
	class HeroSupplyBuyTipsWin extends fgui.GComponent{
		public labelTitle:fgui.GTextField;
		public labelTips1:fgui.GTextField;
		public labelTips2:fgui.GTextField;
		public d21:fgui.GImage;
		public d22:fgui.GImage;
		public G_all:fgui.GGroup;
		public btnBuy:ui.comm.btn.BtnChangGui1;
		public itemList1:ui.comm.item.ItemListComp2;
		public itemList2:ui.comm.item.ItemListComp2;
	}
	class HeroSupplySubView extends fgui.GComponent{
		public bg:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public labelRestTimeTitle:fgui.GTextField;
		public labelRestTime:fgui.GTextField;
		public labelKillPrice:fgui.GTextField;
		public G_header:fgui.GGroup;
		public G_noBuyBtn:fgui.GGroup;
		public fg:fgui.GImage;
		public itemList:fgui.GList;
		public labelBuyTipsCenter:fgui.GTextField;
		public G_t2:fgui.GGroup;
		public G_buyNoGain:fgui.GGroup;
		public labelNextGainTime:fgui.GTextField;
		public G_buyGain:fgui.GGroup;
		public btnInfo:ui.comm.btn.BtnGth3;
		public btnBuy:ui.comm.btn.BtnChangGui1;
		public btnGain:ui.comm.btn.BtnChangGui1;
	}
}
declare namespace ui.heroSupply.item {
	class HeroSupplyItemComp extends fgui.GComponent{
		public adapt_bg:fgui.GImage;
		public labelDayL:fgui.GTextField;
		public labelDay:fgui.GRichTextField;
		public labelDayR:fgui.GTextField;
		public labelItemCount:fgui.GTextField;
		public G_isGain:fgui.GGroup;
		public item:ui.comm.item.ItemFrameBtn;
		public redDot:ui.comm.com.RedDot;
		public emptyBtn:ui.comm.btn.EmptyBtn;
	}
}
