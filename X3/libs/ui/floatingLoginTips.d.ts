declare namespace ui.floatingLoginTips {
	class FloatingLoginTipsView extends fgui.GComponent{
		public commonItem:ui.floatingLoginTips.item.RootCom;
	}
}
declare namespace ui.floatingLoginTips.item {
	class FloatingLoginTipsItem extends fgui.GComponent{
		public T_tips:fgui.GTextField;
	}
	class RootCom extends fgui.GComponent{
	}
}
