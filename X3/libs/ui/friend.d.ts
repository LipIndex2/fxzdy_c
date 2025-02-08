declare namespace ui.friend.btn {
	class FriendCancelBtn extends fgui.GComponent{
	}
	class FriendFactoryBtn extends fgui.GButton{
		public redDot:ui.comm.com.RedDot;
	}
	class FriendGiveOrDrawBtn extends fgui.GButton{
		public iconDraw:fgui.GImage;
		public iconDisable:fgui.GImage;
		public iconGive:fgui.GImage;
	}
	class FriendOkBtn extends fgui.GComponent{
	}
	class FriendTabBtn extends fgui.GButton{
		public redDot:ui.comm.com.RedDot;
	}
}
declare namespace ui.friend.item {
	class FriendApplyItem extends fgui.GComponent{
		public btnCancel:ui.friend.btn.FriendCancelBtn;
		public btnOk:ui.friend.btn.FriendOkBtn;
		public player:ui.friend.item.FriendPlayerInfoItem;
	}
	class FriendBlackItem extends fgui.GComponent{
		public player:ui.friend.item.FriendPlayerInfoItem;
		public btnCancel:ui.comm.btn.BtnGrsz;
	}
	class FriendItem extends fgui.GComponent{
		public btnGive:ui.friend.btn.FriendGiveOrDrawBtn;
		public player:ui.friend.item.FriendPlayerInfoItem;
	}
	class FriendPlayerInfoItem extends fgui.GComponent{
		public lbName:fgui.GTextField;
		public lbChapter:fgui.GTextField;
		public lbPower:fgui.GTextField;
		public lbOnline:fgui.GTextField;
		public lbOffline:fgui.GTextField;
		public avatar:ui.comm.playerInfo.PlayerAvatar;
	}
	class FriendRecommendItem extends fgui.GComponent{
		public lbApplied:fgui.GTextField;
		public player:ui.friend.item.FriendPlayerInfoItem;
		public btnApply:ui.comm.btn.BtnBuZhen;
	}
}
declare namespace ui.friend.page {
	class FriendApplyPage extends fgui.GComponent{
		public list:fgui.GList;
		public gNone:fgui.GGroup;
		public btnCancel:ui.comm.btn.BtnChangGui3;
		public btnSure:ui.comm.btn.BtnChangGui1;
	}
	class FriendBlackPage extends fgui.GComponent{
		public list:fgui.GList;
	}
	class FriendListPage extends fgui.GComponent{
		public list:fgui.GList;
		public lbLimit:fgui.GTextField;
		public btnOnekey:ui.comm.btn.BtnChangGui1;
		public redDot:ui.comm.com.RedDot;
		public btnFactory:ui.friend.btn.FriendFactoryBtn;
	}
	class FriendRecommendPage extends fgui.GComponent{
		public list:fgui.GList;
		public lbRefreshTime:fgui.GTextField;
		public btnRefresh:ui.comm.btn.BtnChangGui1;
	}
}
declare namespace ui.friend.view {
	class FriendBattleResultWin extends fgui.GComponent{
		public tipsExit:fgui.GTextField;
		public modelNode:ui.comm.node.ModelNode;
		public btnData:ui.comm.btn.BtnData;
		public btnShare:ui.comm.btn.BtnData;
	}
	class FriendMainWin extends fgui.GComponent{
		public lbTitle:fgui.GTextField;
		public lbNum:fgui.GTextField;
		public gNum:fgui.GGroup;
		public emptyBtn:ui.comm.btn.EmptyBtn;
		public tab0:ui.friend.btn.FriendTabBtn;
		public tab1:ui.friend.btn.FriendTabBtn;
		public tab2:ui.friend.btn.FriendTabBtn;
		public tab3:ui.friend.btn.FriendTabBtn;
		public pageRecommend:ui.friend.page.FriendRecommendPage;
		public pageApply:ui.friend.page.FriendApplyPage;
		public pageList:ui.friend.page.FriendListPage;
		public pageBlack:ui.friend.page.FriendBlackPage;
	}
}
