declare namespace ui.activityRookieSale.item {
	class RookieSaleGrayItem extends fgui.GComponent{
		public img_gray:fgui.GGroup;
	}
	class RookieSaleItem extends fgui.GComponent{
		public lb_dis:fgui.GTextField;
		public grp_dis:fgui.GGroup;
		public lb_name:fgui.GTextField;
		public lb_limit:fgui.GTextField;
		public btn_buy:fgui.GGraph;
		public listReward:fgui.GList;
		public lb_price:fgui.GTextField;
		public lb_sym:fgui.GTextField;
		public gPrice:fgui.GGroup;
		public lb_free:fgui.GTextField;
		public gFree:fgui.GGroup;
		public iconCost:fgui.GLoader;
		public lbCost:fgui.GTextField;
		public gCost:fgui.GGroup;
		public redDot:ui.comm.com.RedDot;
		public img_gray:ui.activityRookieSale.item.RookieSaleGrayItem;
		public cornerMark:ui.comm.view.CornerMark;
	}
	class RookieSaleScrItem extends fgui.GComponent{
		public item_0:ui.activityRookieSale.item.RookieSaleItem;
		public item_1:ui.activityRookieSale.item.RookieSaleItem;
		public item_2:ui.activityRookieSale.item.RookieSaleItem;
		public item_3:ui.activityRookieSale.item.RookieSaleItem;
		public item_4:ui.activityRookieSale.item.RookieSaleItem;
		public item_6:ui.activityRookieSale.item.RookieSaleItem;
		public item_7:ui.activityRookieSale.item.RookieSaleSpeItem;
		public item_5:ui.activityRookieSale.item.RookieSaleSpeItem;
	}
	class RookieSaleShowItem extends fgui.GComponent{
		public img_frame:fgui.GLoader;
		public img_item:fgui.GLoader;
		public btn_show:fgui.GImage;
	}
	class RookieSaleSpeGrayItem extends fgui.GComponent{
		public img_gray:fgui.GGroup;
	}
	class RookieSaleSpeItem extends fgui.GComponent{
		public img_red2:fgui.GImage;
		public lb_red2:fgui.GTextField;
		public grp_red2:fgui.GGroup;
		public img_red:fgui.GImage;
		public lb_red:fgui.GTextField;
		public grp_red:fgui.GGroup;
		public img_yellew:fgui.GImage;
		public lb_yellew:fgui.GTextField;
		public grp_yellow:fgui.GGroup;
		public lb_dis:fgui.GTextField;
		public lb_limit:fgui.GTextField;
		public btn_buy:fgui.GGraph;
		public listReward:fgui.GList;
		public lb_price:fgui.GTextField;
		public lb_sym:fgui.GTextField;
		public gPrice:fgui.GGroup;
		public lb_free:fgui.GTextField;
		public gFree:fgui.GGroup;
		public iconCost:fgui.GLoader;
		public lbCost:fgui.GTextField;
		public gCost:fgui.GGroup;
		public modelNode:ui.comm.node.ModelNode;
		public item_0:ui.activityRookieSale.item.RookieSaleShowItem;
		public item_4:ui.activityRookieSale.item.RookieSaleShowItem;
		public item_1:ui.activityRookieSale.item.RookieSaleShowItem;
		public item_3:ui.activityRookieSale.item.RookieSaleShowItem;
		public item_2:ui.activityRookieSale.item.RookieSaleShowItem;
		public img_gray:ui.activityRookieSale.item.RookieSaleSpeGrayItem;
	}
}
declare namespace ui.activityRookieSale.view {
	class RookieSaleView extends fgui.GComponent{
		public img_bg:fgui.GImage;
		public top_bg:fgui.GImage;
		public lb_time:fgui.GTextField;
		public headerItem:ui.comm.header.HeaderItem;
		public scr_item:ui.activityRookieSale.item.RookieSaleScrItem;
	}
}
