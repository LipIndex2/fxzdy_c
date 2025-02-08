declare namespace ui.activityPass.Win {
	class FundRewardPreview extends fgui.GComponent{
		public list_canGetReward:fgui.GList;
		public list_reward:fgui.GList;
		public btn_buy:ui.comm.btn.BtnChangGui1;
		public textItem:ui.activityPass.item.PassTextItem;
	}
	class PassGroupWin extends fgui.GComponent{
		public pGroup:ui.activityPass.panel.PassGroupPanel;
	}
	class PassMainWin extends fgui.GComponent{
		public img_light:fgui.GLoader;
		public img_bg:fgui.GLoader;
		public img_title:fgui.GLoader;
		public T_tips:fgui.GRichTextField;
		public T_discount:fgui.GTextField;
		public list_awaed:fgui.GList;
		public T_buy:fgui.GTextField;
		public btn_buy:ui.comm.btn.BtnChangGui1;
		public btn_get:ui.comm.btn.BtnChangGui1;
		public btnRule:ui.comm.btn.BaseBtn;
	}
}
declare namespace ui.activityPass.btn {
	class PassSelectBtn extends fgui.GButton{
		public T_title:fgui.GTextField;
		public redDot:ui.comm.com.RedDot;
	}
}
declare namespace ui.activityPass.item {
	class PassAwardItem extends fgui.GComponent{
		public img_suo:fgui.GImage;
		public item:ui.comm.item.ItemFrameBtn;
	}
	class PassAwardListItem extends fgui.GComponent{
		public img_jdt:fgui.GImage;
		public T_level:fgui.GTextField;
		public T_desc:fgui.GTextField;
		public list_award:fgui.GList;
		public img_hui:fgui.GImage;
		public item:ui.activityPass.item.PassAwardItem;
	}
	class PassGroupItem extends fgui.GComponent{
		public Img_bg:fgui.GLoader;
		public T_title:fgui.GTextField;
		public redDot:ui.comm.com.RedDot;
	}
	class PassTextItem extends fgui.GComponent{
		public lbDes:fgui.GRichTextField;
	}
}
declare namespace ui.activityPass.monthCard.component {
	class MonthCardDiscount extends fgui.GComponent{
		public lbDiscount:fgui.GTextField;
		public lbTitle:fgui.GTextField;
	}
	class MonthCardFree2Btn extends fgui.GButton{
	}
	class MonthCardFreeBtn extends fgui.GButton{
		public redDot:ui.comm.com.RedDot;
	}
	class MonthCardMineCenterPanel extends fgui.GComponent{
		public bg:fgui.GLoader;
		public listCard:fgui.GList;
		public pMonthCard:fgui.GGroup;
	}
	class MonthCardMinePanel extends fgui.GComponent{
		public pCenter:ui.activityPass.monthCard.component.MonthCardMineCenterPanel;
	}
}
declare namespace ui.activityPass.monthCard.item {
	class MonthCardAdditionItem extends fgui.GComponent{
		public lbDes:fgui.GRichTextField;
	}
	class MonthCardItem extends fgui.GComponent{
		public bg:fgui.GLoader;
		public iconActive:fgui.GLoader;
		public lbName:fgui.GTextField;
		public lbDes:fgui.GTextField;
		public lbNoActive:fgui.GTextField;
		public lbActive:fgui.GTextField;
		public redDot:ui.comm.com.RedDot;
	}
}
declare namespace ui.activityPass.monthCard.view {
	class MonthCardBuyWin extends fgui.GComponent{
		public itemGp:fgui.GGroup;
		public lbTitle:fgui.GTextField;
		public lbDes:fgui.GTextField;
		public lbTip1:fgui.GTextField;
		public lbCount:fgui.GTextField;
		public lbTime:fgui.GTextField;
		public lbTitle2:fgui.GTextField;
		public iconReward:fgui.GLoader;
		public listAddition:fgui.GList;
		public lbCount2:fgui.GTextField;
		public iconReward2:fgui.GLoader;
		public pDiscount:ui.activityPass.monthCard.component.MonthCardDiscount;
		public btnDraw:ui.comm.btn.BtnChangGui1;
		public btnBuy:ui.comm.btn.BtnChangGui1;
		public btnItemUse:ui.activityPass.monthCard.component.MonthCardFree2Btn;
		public useItem:ui.comm.item.ItemFrameBtn;
		public emptyBtn:ui.comm.btn.EmptyBtn;
	}
	class MonthCardForeverBuyWin extends fgui.GComponent{
		public lbTip1:fgui.GTextField;
		public lbDes:fgui.GTextField;
		public lbCount:fgui.GTextField;
		public lbTitle2:fgui.GTextField;
		public lbTitle:fgui.GTextField;
		public iconReward:fgui.GLoader;
		public listAddition:fgui.GList;
		public lbBuyTip:fgui.GRichTextField;
		public pDiscount:ui.activityPass.monthCard.component.MonthCardDiscount;
		public btnBuy:ui.comm.btn.BtnChangGui1;
		public btnDraw:ui.comm.btn.BtnChangGui3;
		public emptyBtn:ui.comm.btn.EmptyBtn;
	}
	class MonthCardMainWin extends fgui.GComponent{
		public bg:fgui.GLoader;
		public lbTitleFree:fgui.GTextField;
		public listFreeReward:fgui.GList;
		public listCard:fgui.GList;
		public pMonthCard:fgui.GGroup;
		public btnFree:ui.activityPass.monthCard.component.MonthCardFreeBtn;
		public btnDrawAll:ui.comm.btn.BtnChangGui1;
		public redDot:ui.comm.com.RedDot;
		public btnRule:ui.comm.btn.BaseBtn;
	}
	class MonthCardMineBuyWin extends fgui.GComponent{
		public lbTip1:fgui.GTextField;
		public lbDes:fgui.GTextField;
		public lbCount:fgui.GTextField;
		public lbTitle2:fgui.GTextField;
		public lbTitle:fgui.GTextField;
		public iconReward:fgui.GLoader;
		public listAddition:fgui.GList;
		public lbTime:fgui.GTextField;
		public pDiscount:ui.activityPass.monthCard.component.MonthCardDiscount;
		public btnBuy:ui.comm.btn.BtnChangGui1;
		public btnRenew:ui.comm.btn.BtnChangGui1;
		public btnDraw:ui.comm.btn.BtnChangGui3;
		public emptyBtn:ui.comm.btn.EmptyBtn;
	}
	class MonthCardMineMainWin extends fgui.GComponent{
		public pCenter:ui.activityPass.monthCard.component.MonthCardMinePanel;
	}
}
declare namespace ui.activityPass.panel {
	class PassCenterPanel extends fgui.GComponent{
		public list_tab:fgui.GList;
		public panel1:ui.activityPass.panel.PassEnterPanel;
		public panel2:ui.activityPass.monthCard.view.MonthCardMainWin;
	}
	class PassEnterPanel extends fgui.GComponent{
		public bg:fgui.GLoader;
		public list_pass:fgui.GList;
	}
	class PassGroupPanel extends fgui.GComponent{
		public pCenter:ui.activityPass.panel.PassCenterPanel;
	}
}
