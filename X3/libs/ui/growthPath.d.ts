declare namespace ui.growthPath {
	class GrowthPathMainView extends fgui.GComponent{
		public adapt_bg:fgui.GImage;
		public top_bg:fgui.GImage;
		public labelTimeTitle:fgui.GTextField;
		public labelTime:fgui.GTextField;
		public labelTitle:fgui.GTextField;
		public G_head:fgui.GGroup;
		public rowList:fgui.GList;
		public rewardP:ui.growthPath.components.GrowthPathPanelComp;
		public btnReward:ui.growthPath.btn.GrowthPathRewardButton;
		public header1:ui.comm.header.HeaderItem3;
		public header2:ui.comm.header.HeaderItem3;
	}
	class GrowthPathRewardView extends fgui.GComponent{
		public bg:fgui.GImage;
		public fg:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public fg2:fgui.GImage;
		public labelStage:fgui.GTextField;
		public labelReward:fgui.GTextField;
		public rowList:fgui.GList;
		public G_all:fgui.GGroup;
	}
}
declare namespace ui.growthPath.bar {
	class GrowthPathBarKppy extends fgui.GProgressBar{
		public bar:fgui.GImage;
	}
}
declare namespace ui.growthPath.btn {
	class GrowthPathGainButton extends fgui.GButton{
	}
	class GrowthPathRewardButton extends fgui.GButton{
	}
	class GrowthPathTaskGoButton extends fgui.GButton{
	}
}
declare namespace ui.growthPath.components {
	class GrowthPathOneRowRewardComp extends fgui.GComponent{
		public bg:fgui.GImage;
		public fg:fgui.GImage;
		public labelNoNum:fgui.GTextField;
		public itemList:fgui.GList;
	}
	class GrowthPathPanelComp extends fgui.GComponent{
		public bg:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public itemList:fgui.GList;
		public labelTips:fgui.GTextField;
		public labelPercent:fgui.GTextField;
		public barPercent:ui.growthPath.bar.GrowthPathBarKppy;
	}
	class GrowthPathTaskRowComp extends fgui.GComponent{
		public bg:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public labelCount:fgui.GTextField;
		public item1:ui.comm.item.ItemFrameBtn;
		public item2:ui.comm.item.ItemFrameBtn;
		public barPercent:ui.growthPath.bar.GrowthPathBarKppy;
		public redDot:ui.comm.com.RedDot;
		public btnGain:ui.growthPath.btn.GrowthPathGainButton;
		public btnGo:ui.growthPath.btn.GrowthPathTaskGoButton;
	}
}
