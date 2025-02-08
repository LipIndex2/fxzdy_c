declare namespace ui.fuli {
	class fuliMain extends fgui.GComponent{
		public tabList:fgui.GList;
		public bgFooter:ui.comm.back.BackFooter;
		public viewContainer:ui.comm.ViewContainer.ViewContainer;
	}
	class ruleTips extends fgui.GComponent{
	}
	class worldBossActiveView extends fgui.GComponent{
		public bottom_bg:fgui.GImage;
		public top_bg:fgui.GImage;
		public bossName:fgui.GTextField;
		public activeTime:fgui.GTextField;
		public timeCom:fgui.GGroup;
		public tips:fgui.GTextField;
		public modelNode:ui.comm.node.ModelNode;
		public btnRule:ui.comm.btn.BtnGth3;
		public headerItem:ui.comm.header.HeaderItem;
		public reward:ui.comm.item.ItemListComp;
		public challengeBtn:ui.fuli.btn.challengeBtn;
	}
}
declare namespace ui.fuli.btn {
	class challengeBtn extends fgui.GButton{
		public redDot:ui.comm.com.RedDot;
	}
}
declare namespace ui.fuli.components {
	class tabCom extends fgui.GButton{
		public iconDown:fgui.GLoader;
		public iconUp:fgui.GLoader;
		public all:fgui.GGroup;
	}
}
