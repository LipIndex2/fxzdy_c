declare namespace ui.funcOpen {
	class FuncOpenItem extends fgui.GComponent{
		public bgItem:fgui.GImage;
		public iconLoader:fgui.GLoader;
		public nameLab:fgui.GTextField;
		public modelNode2:ui.comm.node.ModelNode;
		public modelNode3:ui.comm.node.ModelNode;
	}
	class funcOpenView extends fgui.GComponent{
		public modelNode1:ui.comm.node.ModelNode;
		public openItem:ui.funcOpen.FuncOpenItem;
	}
}
