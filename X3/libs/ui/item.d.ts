declare namespace ui.item {
	class btnItemComeFromJump extends fgui.GButton{
		public titleButtonJumpTo:fgui.GTextField;
	}
	class ItemComeFromIconView extends fgui.GComponent{
		public bgChoose:fgui.GImage;
		public iconItem:fgui.GLoader;
	}
	class ItemComeFromView extends fgui.GComponent{
		public background:fgui.GLoader;
		public foreground:fgui.GLoader;
		public labelItemTitle:fgui.GTextField;
		public labelDesc:fgui.GTextField;
		public labelHaveItemCount:fgui.GTextField;
		public title:fgui.GTextField;
		public comeFromList:fgui.GList;
		public itemList:fgui.GList;
	}
	class ItemOneGetWayView extends fgui.GComponent{
		public bgLock:fgui.GLoader;
		public bgUnlock:fgui.GLoader;
		public title:fgui.GTextField;
		public desc:fgui.GTextField;
		public lockTips:fgui.GTextField;
		public btnJump:ui.item.btnItemComeFromJump;
	}
	class ItemSmallTipsView extends fgui.GComponent{
		public tips:ui.item.components.tipsItemDetails;
	}
}
declare namespace ui.item.components {
	class tipsItemDetails extends fgui.GLabel{
		public bg:fgui.GLoader;
		public labelTitle:fgui.GTextField;
		public labelDescription:fgui.GTextField;
		public labelComeFrom:fgui.GTextField;
		public iconTipsArrowLeftTop:fgui.GImage;
		public iconTipsArrowRightTop:fgui.GImage;
		public G_btnTop:fgui.GGroup;
		public iconTipsArrowLeftBottom:fgui.GImage;
		public iconTipsArrowRightBottom:fgui.GImage;
		public G_btnDown:fgui.GGroup;
	}
}
declare namespace ui.item.win {
	class ItemSyntheticWin extends fgui.GComponent{
		public bg:fgui.GLoader;
		public labelTitle:fgui.GTextField;
		public labelItemName:fgui.GTextField;
		public labelContent:fgui.GTextField;
		public bgTitle:fgui.GImage;
		public labelCount:fgui.GTextField;
		public labelHoldCountTitle:fgui.GTextField;
		public labelHoldCount:fgui.GRichTextField;
		public G_all:fgui.GGroup;
		public itemBtn:ui.comm.item.ItemFrameBtn;
		public btnOk:ui.comm.btn.BtnChangGui1;
		public redDot:ui.comm.com.RedDot;
		public slider:ui.comm1.chat.countSlider.CommonCountSliderComp;
	}
}
