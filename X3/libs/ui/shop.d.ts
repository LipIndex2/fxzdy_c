declare namespace ui.shop {
	class buyView extends fgui.GComponent{
		public buyNum:fgui.GTextField;
		public buyCost:ui.shop.component.buyCost;
		public jian_btn:ui.shop.btn.jian;
		public jia_btn:ui.shop.btn.jia;
		public maxBtn:ui.shop.btn.max;
		public buyBtn:ui.shop.component.buy_btn;
		public numSlider:ui.shop.component.buySlider;
		public goodsCell:ui.comm.item.ItemFrame;
	}
	class shop extends fgui.GComponent{
		public btnList:fgui.GList;
		public bottom:fgui.GGroup;
		public viewContainer:ui.comm.ViewContainer.ViewContainer;
		public closeBtn:ui.comm.back.BtnBack;
	}
	class shopPageContainer extends fgui.GComponent{
	}
}
declare namespace ui.shop.btn {
	class bgBtn extends fgui.GButton{
	}
	class buyBtn extends fgui.GButton{
		public soldPrice:fgui.GTextField;
		public countPrice:fgui.GTextField;
		public price:fgui.GTextField;
	}
	class closeBtn extends fgui.GButton{
	}
	class jia extends fgui.GButton{
	}
	class jian extends fgui.GButton{
	}
	class max extends fgui.GButton{
	}
	class shopCost_2 extends fgui.GButton{
		public costNum:fgui.GTextField;
		public costIcon:fgui.GLoader;
	}
	class slider extends fgui.GButton{
	}
	class updateBtn extends fgui.GButton{
		public costIcon:fgui.GLoader;
		public costNum:fgui.GTextField;
	}
}
declare namespace ui.shop.component {
	class buy_btn extends fgui.GButton{
	}
	class buyCost extends fgui.GComponent{
		public costNum:fgui.GTextField;
		public costIcon:fgui.GLoader;
	}
	class buySlider extends fgui.GSlider{
		public bar:fgui.GImage;
		public bar1:fgui.GImage;
		public grip:ui.shop.component.buySlider_grip;
	}
	class buySlider_grip extends fgui.GButton{
	}
	class buyViewBg extends fgui.GButton{
	}
	class goodsDiscount extends fgui.GComponent{
		public discount:fgui.GTextField;
	}
	class goodsLimit extends fgui.GComponent{
		public lbTip:fgui.GTextField;
		public lbLimit:fgui.GRichTextField;
	}
	class shopAutoCom extends fgui.GComponent{
		public autoUpdateLabel:fgui.GTextField;
	}
	class shopCost extends fgui.GButton{
		public costNum:fgui.GTextField;
		public costIcon:fgui.GLoader;
	}
	class shopListItem extends fgui.GComponent{
		public goodsList:fgui.GList;
	}
	class shopPageBtn extends fgui.GButton{
		public iconLoader:fgui.GLoader;
		public iconSelectLoader:fgui.GLoader;
		public redDot:ui.comm.com.RedDot;
	}
	class SpecialShopTypeItem extends fgui.GComponent{
		public itemList:fgui.GList;
		public ShopInfoBar:ui.shop.item.SpecialShopBar;
	}
}
declare namespace ui.shop.item {
	class DailyShopItem extends fgui.GButton{
		public bg:fgui.GLoader;
		public goodsIcon:fgui.GLoader;
		public goodsLv:fgui.GTextField;
		public goodsNum:fgui.GTextField;
		public sell:fgui.GImage;
		public hotLab:fgui.GTextField;
		public hot:fgui.GGroup;
		public costLabel:fgui.GTextField;
		public costIcon:fgui.GLoader;
		public cost:fgui.GGroup;
		public lbFree:fgui.GTextField;
		public free:fgui.GGroup;
		public lbAd:fgui.GTextField;
		public ad:fgui.GGroup;
		public lockMask:fgui.GImage;
		public cellContainer:fgui.GGroup;
		public limit:ui.shop.component.goodsLimit;
		public discount:ui.shop.component.goodsDiscount;
		public redDot:ui.comm.com.RedDot;
		public heroItem:ui.comm.item.HeroItem;
	}
	class SpecialShopBar extends fgui.GComponent{
		public timeImg:fgui.GImage;
		public typetTitle:fgui.GTextField;
		public timeLabel:fgui.GTextField;
	}
	class SpecialShopItem extends fgui.GComponent{
		public itemBg:fgui.GImage;
		public limitLabel:fgui.GRichTextField;
		public sell:fgui.GImage;
		public hotLab:fgui.GTextField;
		public hot:fgui.GGroup;
		public soldOutLayer:fgui.GGroup;
		public buyBtn:ui.shop.btn.buyBtn;
		public heroItem:ui.comm.item.HeroBaseItem;
		public itemFrame:ui.comm.item.ItemFrameBtn;
	}
}
declare namespace ui.shop.page {
	class DailyShopPage extends fgui.GComponent{
		public top_bg:fgui.GImage;
		public bottom_bg:fgui.GImage;
		public name1:fgui.GTextField;
		public name2:fgui.GTextField;
		public name3:fgui.GTextField;
		public goodsList:fgui.GList;
		public updateTime:fgui.GRichTextField;
		public updateBtn:ui.shop.btn.updateBtn;
		public cost0:ui.shop.component.shopCost;
		public cost1:ui.shop.component.shopCost;
		public autoCom:ui.shop.component.shopAutoCom;
	}
	class SpecialShopBuyPage extends fgui.GComponent{
	}
	class SpecialShopView extends fgui.GComponent{
		public closeTip:fgui.GTextField;
		public totalList:fgui.GList;
		public cost0:ui.shop.btn.shopCost_2;
		public cost1:ui.shop.btn.shopCost_2;
		public emptyBtn:ui.comm.btn.EmptyBtn;
	}
}
