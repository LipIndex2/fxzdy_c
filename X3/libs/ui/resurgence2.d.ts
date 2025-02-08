declare namespace ui.resurgence2 {
	class backBtn extends fgui.GComponent{
	}
	class btn_goto extends fgui.GButton{
	}
	class btnData extends fgui.GButton{
	}
	class reliveBtn extends fgui.GComponent{
		public imLoader:fgui.GLoader;
		public T_num:fgui.GTextField;
		public img_icon:fgui.GGroup;
	}
	class resurgenceView extends fgui.GComponent{
		public bg:fgui.GLoader;
		public list:fgui.GList;
		public btn_res:ui.resurgence2.reliveBtn;
		public btn_back:ui.resurgence2.backBtn;
		public btnData:ui.resurgence2.btnData;
		public modelNode:ui.comm.node.ModelNode;
	}
}
