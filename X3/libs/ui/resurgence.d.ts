declare namespace ui.resurgence {
	class btn_goto extends fgui.GComponent{
		public T_name:fgui.GTextField;
		public img_icon:fgui.GLoader;
	}
	class ResurgenceView extends fgui.GComponent{
		public img_icon:fgui.GLoader;
		public T_num:fgui.GTextField;
		public list:fgui.GList;
		public btn_res:ui.comm.btn.BaseBtn;
		public btn_back:ui.comm.btn.BaseBtn;
	}
}
