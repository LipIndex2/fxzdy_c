declare namespace ui.gain {
	class GainItemBag extends fgui.GComponent{
		public iconBag:fgui.GImage;
		public modelNode:ui.comm.node.ModelNode;
	}
	class GainItemEffectView extends fgui.GComponent{
		public bagNode:ui.gain.GainItemBag;
		public startNode:ui.comm.btn.EmptyBtn;
	}
	class GainItemFrame extends fgui.GComponent{
	}
	class GainItemIcon extends fgui.GComponent{
		public iconLoader:fgui.GLoader;
	}
	class GainItemPopUpView extends fgui.GComponent{
		public bg:fgui.GImage;
		public imageTitle:fgui.GImage;
		public itemList:fgui.GList;
		public gAd:fgui.GGroup;
		public modelNode:ui.comm.node.ModelNode;
		public btnDraw:ui.comm.btn.BtnDrawClose;
		public btnPlay:ui.comm.btn.BtnAd;
	}
}
