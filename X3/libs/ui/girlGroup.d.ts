declare namespace ui.girlGroup {
	class GirlGroupAllBuyWin extends fgui.GComponent{
		public T_num:fgui.GTextField;
		public T_name:fgui.GTextField;
		public T_tips2:fgui.GTextField;
		public T_tips1:fgui.GTextField;
		public list_award:fgui.GList;
		public item:ui.comm.item.ItemFrameBtn;
	}
	class GirlGroupMainView extends fgui.GComponent{
		public T_roomName:fgui.GTextField;
		public T_peopleNum:fgui.GTextField;
		public T_title:fgui.GTextField;
		public T_time:fgui.GRichTextField;
		public list_tab:fgui.GList;
		public list_award:fgui.GList;
		public btnRule:ui.comm.btn.BtnGth3;
		public footer:ui.comm.back.BackFooter3;
		public btn_award1:ui.girlGroup.btn.GirlGroupBtn;
		public btn_award2:ui.girlGroup.btn.GirlGroupBtn;
		public dialogBoxPage:ui.girlGroup.page.DialogBoxPage;
		public playerPage:ui.girlGroup.page.GirlGroupPlayerPage;
	}
}
declare namespace ui.girlGroup.btn {
	class GirlGroupBtn extends fgui.GButton{
		public redDot:ui.comm.com.RedDot;
	}
	class GirlGroupTabBtn extends fgui.GButton{
		public T_day:fgui.GTextField;
		public T_day2:fgui.GTextField;
		public T_day3:fgui.GTextField;
		public img_suo:fgui.GImage;
		public img_tips:fgui.GLoader;
		public T_tips:fgui.GRichTextField;
		public gp_tips:fgui.GGroup;
		public redDot:ui.comm.com.RedDot;
	}
}
declare namespace ui.girlGroup.item {
	class dialogBoxItem extends fgui.GComponent{
		public img_bg:fgui.GLoader;
		public img_gift:fgui.GLoader;
		public T_text:fgui.GRichTextField;
	}
	class DialogBoxPageItem extends fgui.GComponent{
	}
	class GirlGroupAwardItem extends fgui.GComponent{
		public T_name:fgui.GTextField;
		public T_tips:fgui.GRichTextField;
		public T_discounts:fgui.GTextField;
		public gp_discounts:fgui.GGroup;
		public list_item:fgui.GList;
		public btn_buy:ui.comm.btn.BtnChangGui1;
	}
	class GirlGroupBuyItem extends fgui.GComponent{
		public T_desc:fgui.GTextField;
		public btn_get:ui.comm.btn.BtnChangGui1;
		public item:ui.comm.item.ItemFrameBtn;
		public item2:ui.comm.item.ItemFrameBtn;
		public bar:ui.girlGroup.item.ItemBar;
		public redDot:ui.comm.com.RedDot;
	}
	class GirlGroupPlayerDialogItem extends fgui.GComponent{
		public img_dialog:fgui.GLoader;
		public T_dialog:fgui.GTextField;
	}
	class headIconItem extends fgui.GComponent{
		public img_head:fgui.GLoader;
	}
	class heroModItem extends fgui.GButton{
		public modelNode:ui.comm.node.ModelNode;
	}
	class ItemBar extends fgui.GProgressBar{
		public bar:fgui.GImage;
		public title:fgui.GTextField;
	}
}
declare namespace ui.girlGroup.page {
	class DialogBoxPage extends fgui.GComponent{
		public scroll:ui.girlGroup.item.DialogBoxPageItem;
	}
	class GirlGroupPlayerPage extends fgui.GComponent{
		public T_mainName:fgui.GTextField;
		public list_mod:fgui.GList;
		public modelNode0:ui.comm.node.ModelNode;
		public modelNode1:ui.comm.node.ModelNode;
		public modelNode2:ui.comm.node.ModelNode;
		public modelNode3:ui.comm.node.ModelNode;
		public modelNode4:ui.comm.node.ModelNode;
		public modelNode5:ui.comm.node.ModelNode;
		public dialogItem:ui.girlGroup.item.GirlGroupPlayerDialogItem;
	}
}
