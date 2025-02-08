declare namespace ui.loginNotice {
	class NoticeWin extends fgui.GComponent{
		public titleList:fgui.GList;
		public noticeCom:ui.loginNotice.com.NoticeCom;
	}
}
declare namespace ui.loginNotice.com {
	class NoticeCom extends fgui.GComponent{
		public noticeTxt:fgui.GRichTextField;
	}
}
declare namespace ui.loginNotice.item {
	class TitleItem extends fgui.GButton{
		public titleName:fgui.GTextField;
	}
}
