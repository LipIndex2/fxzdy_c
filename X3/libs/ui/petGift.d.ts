declare namespace ui.petGift {
	class petGiftMainView extends fgui.GComponent{
		public bg:fgui.GLoader;
		public lbBuy:fgui.GTextField;
		public lbCd:fgui.GTextField;
		public tabList:fgui.GList;
		public btnList:fgui.GList;
		public buyBtn:ui.comm.btn.BtnChangGui1;
		public bubbleTip:ui.petGift.component.petGiftBubbleTip;
		public modelNode:ui.comm.node.ModelNode;
		public btnSpine:ui.comm.btn.EmptyBtn;
		public itemList:ui.comm.item.ItemListComp2;
		public btnClose:ui.comm.btn.CloseBtn;
	}
}
declare namespace ui.petGift.component {
	class petGiftBubbleTip extends fgui.GComponent{
		public bgTip:fgui.GImage;
		public lbBubble:fgui.GTextField;
	}
	class PetGiftDayBtn extends fgui.GButton{
		public bgLoader:fgui.GLoader;
		public iconLoader:fgui.GLoader;
		public labelTitle:fgui.GTextField;
		public starList:fgui.GList;
		public selImg:fgui.GImage;
	}
	class PetGiftPageBtn extends fgui.GButton{
		public selImg:fgui.GImage;
		public unselImg:fgui.GImage;
	}
	class PetGiftStarBtn extends fgui.GButton{
		public starImg:fgui.GLoader;
	}
}
