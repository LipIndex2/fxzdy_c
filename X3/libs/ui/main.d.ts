declare namespace ui.main {
	class ComContainerTopRight extends fgui.GComponent{
	}
	class MainContainerPage extends fgui.GComponent{
		public footer:ui.comm.footer.CommonFooterView;
		public viewContainer:ui.comm.ViewContainer.ViewContainer;
	}
	class MainMoreCloseBtn extends fgui.GButton{
	}
	class MainMoreView extends fgui.GComponent{
		public footerP:fgui.GGroup;
		public bgTab:fgui.GImage;
		public btnList:fgui.GList;
		public T_name:fgui.GTextField;
		public T_ID:fgui.GTextField;
		public G_main:fgui.GGroup;
		public btn_close:ui.main.MainMoreCloseBtn;
		public avatar:ui.comm.playerInfo.PlayerAvatar;
	}
	class MainPage extends fgui.GComponent{
		public footerFloat:fgui.GGroup;
		public T_resource1:fgui.GRichTextField;
		public gp_resource1:fgui.GGroup;
		public T_resource2:fgui.GRichTextField;
		public gp_resource2:fgui.GGroup;
		public storeBtn:ui.main.btn.storeBtn;
		public sideShowAd:ui.main.com.ActivityCom;
		public fuliBtn:ui.main.btn.FuliBtn;
		public tipsForBattle:ui.main.com.TipsCom;
		public btn_backHome:ui.main.btn.BackHomeBtn;
		public trunkTask:ui.main.btn.TrunkTaskBtn;
		public aniPoint:ui.main.components.MainPageAniPoint;
		public listLeftTab:ui.main.components.MainPageTabList;
		public listRightTab:ui.main.components.MainPageTabList;
		public listCenterTab:ui.main.components.MainPageTabList;
		public headPlayer:ui.comm.view.PlayerCom;
		public chat:ui.comm1.chat.ChatComp;
		public buildingBtn:ui.comm.building.BuildingBtn;
		public headerItem1:ui.comm.header.HeaderItem;
		public headerItem2:ui.comm.header.HeaderItem;
		public headerItem3:ui.comm.header.HeaderItem;
		public headerItem4:ui.comm.header.HeaderItem;
		public headerItem5:ui.comm.header.HeaderItem;
		public footer:ui.comm.footer.CommonFooterView;
		public MiniMap:ui.comm.miniMap.MiniMapItem;
		public btnHangUpLevel:ui.comm.footer.btn.HangUpEntryBtn;
		public trunkTaskTipsBtn:ui.comm.btn.LabelBtn;
	}
}
declare namespace ui.main.btn {
	class ActivityBtn extends fgui.GButton{
	}
	class BackHomeBtn extends fgui.GButton{
	}
	class FuliBtn extends fgui.GButton{
	}
	class MainMoreBtn extends fgui.GButton{
		public imageLogo:fgui.GLoader;
		public redPoint:ui.comm.com.RedDot;
	}
	class MainPageTabBtn extends fgui.GButton{
		public lbCount:fgui.GTextField;
		public pCount:fgui.GGroup;
		public lbTime:fgui.GTextField;
		public lbComingSoon:fgui.GTextField;
		public redDot:ui.comm.com.RedDot;
		public modelNodeBottom:ui.comm.node.ModelNode;
		public modelNode:ui.comm.node.ModelNode;
		public modelNodeTop:ui.comm.node.ModelNode;
	}
	class MainPageTabFoldBtn extends fgui.GButton{
	}
	class PageBtn extends fgui.GButton{
		public iconNormal:fgui.GLoader;
		public iconPress:fgui.GLoader;
		public redPoint:fgui.GImage;
	}
	class storeBtn extends fgui.GButton{
	}
	class TrunkTaskBtn extends fgui.GButton{
		public doneSpineRoot:fgui.GTextField;
		public bgTaskDone:fgui.GLoader;
		public imageReward:fgui.GLoader;
		public labelRewardTitle:fgui.GTextField;
		public labelRewardCount:fgui.GTextField;
		public done:fgui.GGroup;
		public bgTaskDoing:fgui.GLoader;
		public imageTaskTarget:fgui.GLoader;
		public labelTaskProgress:fgui.GTextField;
		public labelTaskTitle:fgui.GTextField;
		public doing:fgui.GGroup;
	}
}
declare namespace ui.main.com {
	class ActivityCom extends fgui.GComponent{
		public list_activity:fgui.GList;
		public list_tab:fgui.GList;
	}
	class ScheduleCom extends fgui.GButton{
		public labelDesc:fgui.GTextField;
		public labelTitle:fgui.GTextField;
	}
	class TaskCom extends fgui.GComponent{
	}
	class TipsCom extends fgui.GComponent{
	}
}
declare namespace ui.main.components {
	class MainMoreBtnComp extends fgui.GComponent{
		public btn:ui.main.btn.MainMoreBtn;
		public redDot:ui.comm.com.RedDot;
	}
	class MainPageAniPoint extends fgui.GComponent{
	}
	class MainPageTabList extends fgui.GComponent{
		public btnFold:ui.main.btn.MainPageTabFoldBtn;
	}
	class TaskSmallTipsComponents extends fgui.GButton{
		public bgTaskDone:fgui.GLoader;
		public labelRewardTitle:fgui.GTextField;
		public doneSpineRoot:fgui.GTextField;
		public imageReward:fgui.GLoader;
		public labelRewardCount:fgui.GTextField;
		public bgTaskDoing:fgui.GLoader;
		public imageTaskTarget:fgui.GLoader;
		public labelTaskProgress:fgui.GTextField;
		public labelTaskTitle:fgui.GTextField;
	}
}
declare namespace ui.main.item {
	class scrollImageItem extends fgui.GComponent{
		public img_icon:fgui.GLoader;
		public T_name:fgui.GTextField;
		public T_time:fgui.GTextField;
	}
	class scrollMaskItem extends fgui.GComponent{
		public nextItem:ui.main.item.scrollImageItem;
		public item:ui.main.item.scrollImageItem;
	}
	class scrollRedItem extends fgui.GComponent{
		public img_sel:fgui.GImage;
	}
}
