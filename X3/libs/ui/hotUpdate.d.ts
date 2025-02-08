declare namespace ui.hotUpdate.com {
	class comBtn extends fgui.GButton{
	}
}
declare namespace ui.hotUpdate.view {
	class HotUpdateWin extends fgui.GComponent{
		public adapt_bg:fgui.GLoader;
		public contentTxt:fgui.GTextField;
		public progressTxt:fgui.GTextField;
		public confirmBtn:ui.hotUpdate.com.comBtn;
	}
}
