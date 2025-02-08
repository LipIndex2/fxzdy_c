declare namespace ui.activityAutoPop.component {
	class ActivityAutoPopRankSettleBubble extends fgui.GComponent{
		public lbTip:fgui.GRichTextField;
	}
}
declare namespace ui.activityAutoPop.item {
	class ActivityAutoPopZYZMIconItem extends fgui.GComponent{
		public iconLoader:fgui.GLoader;
	}
	class ActivityAutoPopZYZMItem extends fgui.GComponent{
		public bgLoader:fgui.GLoader;
		public iconItem:ui.activityAutoPop.item.ActivityAutoPopZYZMIconItem;
	}
}
declare namespace ui.activityAutoPop.view {
	class ActivityAutoPopBannerWin extends fgui.GComponent{
		public banner:fgui.GLoader;
		public listReward:fgui.GList;
		public lbTime:fgui.GRichTextField;
		public lbAutoTime:fgui.GTextField;
		public gTodayOnce:fgui.GGroup;
		public gAll:fgui.GGroup;
		public lbClose:fgui.GTextField;
		public btnGoto:ui.comm.btn.BtnChangGui1;
		public btnGouXuan:ui.comm.btn.BtnGouXuan;
	}
	class ActivityAutoPopRankSettleWin extends fgui.GComponent{
		public banner:fgui.GLoader;
		public lbName:fgui.GTextField;
		public gPlayer:fgui.GGroup;
		public bgTitle:fgui.GImage;
		public lbTitle:fgui.GTextField;
		public gAll:fgui.GGroup;
		public lbClose:fgui.GTextField;
		public modelNode:ui.comm.node.ModelNode;
		public titleComp:ui.comm1.player.PlayerTitleSmallComp;
		public bubble:ui.activityAutoPop.component.ActivityAutoPopRankSettleBubble;
	}
	class ActivityAutoPopSTKWin extends fgui.GComponent{
		public banner:fgui.GLoader;
		public lbTime:fgui.GRichTextField;
		public lbAutoTime:fgui.GTextField;
		public gTodayOnce:fgui.GGroup;
		public gAll:fgui.GGroup;
		public lbClose:fgui.GTextField;
		public btnGoto:ui.comm.btn.BtnChangGui1;
		public btnGouXuan:ui.comm.btn.BtnGouXuan;
	}
	class ActivityAutoPopYXSLWin extends fgui.GComponent{
		public banner:fgui.GLoader;
		public lbTime:fgui.GRichTextField;
		public lbAutoTime:fgui.GTextField;
		public gTodayOnce:fgui.GGroup;
		public gAll:fgui.GGroup;
		public lbClose:fgui.GTextField;
		public btnGoto:ui.comm.btn.BtnChangGui1;
		public btnGouXuan:ui.comm.btn.BtnGouXuan;
	}
	class ActivityAutoPopZYZMWin extends fgui.GComponent{
		public banner:fgui.GLoader;
		public gItem:fgui.GGroup;
		public lbTime:fgui.GRichTextField;
		public lbAutoTime:fgui.GTextField;
		public gTodayOnce:fgui.GGroup;
		public gAll:fgui.GGroup;
		public lbClose:fgui.GTextField;
		public item1:ui.activityAutoPop.item.ActivityAutoPopZYZMItem;
		public item2:ui.activityAutoPop.item.ActivityAutoPopZYZMItem;
		public item3:ui.activityAutoPop.item.ActivityAutoPopZYZMItem;
		public item4:ui.activityAutoPop.item.ActivityAutoPopZYZMItem;
		public item5:ui.activityAutoPop.item.ActivityAutoPopZYZMItem;
		public item6:ui.activityAutoPop.item.ActivityAutoPopZYZMItem;
		public btnGoto:ui.comm.btn.BtnChangGui1;
		public btnGouXuan:ui.comm.btn.BtnGouXuan;
	}
}
