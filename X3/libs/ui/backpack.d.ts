declare namespace ui.backpack {
	class BackpackView extends fgui.GComponent{
		public background:fgui.GLoader;
		public foreground:fgui.GImage;
		public title:fgui.GTextField;
		public itemList:fgui.GList;
		public equipList:fgui.GList;
		public weaponList:fgui.GList;
		public itemTypeList:fgui.GList;
		public all:fgui.GGroup;
		public btn_recycle:ui.comm.btn.BtnBlue;
	}
	class buttonItemType extends fgui.GButton{
		public imageNoChoose:fgui.GImage;
		public imageChoose:fgui.GImage;
		public laelTitle:fgui.GTextField;
	}
}
declare namespace ui.backpack.components {
	class BackpackItemComp extends fgui.GButton{
		public bg:fgui.GLoader;
		public itemIcon:fgui.GLoader;
		public itemChooseMask:fgui.GImage;
		public itemChooseForeground:fgui.GImage;
		public itemCount:fgui.GTextField;
		public redDot:ui.comm.com.RedDot;
	}
}
