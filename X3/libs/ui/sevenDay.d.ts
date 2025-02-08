declare namespace ui.sevenDay {
	class SevenDayLoginSubPage extends fgui.GComponent{
		public top_bg:fgui.GImage;
		public bgB:fgui.GImage;
		public adapt_bg:fgui.GImage;
		public login:ui.sevenDay.subView.SevenDayLoginSubView;
	}
	class SevenDayMainView extends fgui.GComponent{
		public tabList:fgui.GList;
		public G_bottom:fgui.GGroup;
		public taskSubView:ui.sevenDay.subView.SevenDayTaskSubView;
		public loginSubView:ui.sevenDay.subView.SevenDayLoginSubView;
		public btnBack:ui.comm.back.BtnBack;
	}
	class SevenDayTaskPage extends fgui.GComponent{
		public task:ui.sevenDay.subView.SevenDayTaskSubView;
	}
	class SignInCenterPanel extends fgui.GComponent{
		public bgTop:fgui.GImage;
		public iconTitle:fgui.GImage;
		public list_award:fgui.GList;
		public pCenter:fgui.GGroup;
		public spineTitle:ui.comm.node.ModelNode;
		public spineModel:ui.comm.node.ModelNode;
	}
	class SignInWin extends fgui.GComponent{
		public login:ui.sevenDay.subView.SevenDayLoginSubView;
	}
}
declare namespace ui.sevenDay.bar {
	class SevenDayProgressBar extends fgui.GProgressBar{
		public bar:fgui.GImage;
	}
}
declare namespace ui.sevenDay.btn {
	class SevenDayGainBtn extends fgui.GButton{
	}
	class SevenDayJumpBtn extends fgui.GButton{
		public bg:fgui.GImage;
	}
	class SevenDayLoginGainRewardBtn extends fgui.GButton{
		public T_time:fgui.GTextField;
		public redDot:ui.comm.com.RedDot;
		public btn_get:ui.comm.btn.BtnChangGui1;
	}
	class SevenDayTabBtn extends fgui.GButton{
		public imgLogoNoChoose:fgui.GLoader;
		public labelNoChoose:fgui.GTextField;
		public imgLogoChoose:fgui.GLoader;
		public labelChoose:fgui.GTextField;
	}
	class SevenDayTaskDayBtn extends fgui.GButton{
		public labelTitle:fgui.GTextField;
		public redDot:ui.comm.com.RedDot;
	}
}
declare namespace ui.sevenDay.item {
	class SevenDayLoginItem extends fgui.GComponent{
		public img_icon:fgui.GLoader;
		public img_sel:fgui.GImage;
		public Img_item:fgui.GLoader;
		public T_day:fgui.GTextField;
		public T_count:fgui.GTextField;
		public T_desc:fgui.GTextField;
		public btn_item:fgui.GLoader;
		public spineFrame:ui.comm.node.ModelNode;
		public spineFrameBig:ui.comm.node.ModelNode;
		public spineLight:ui.comm.node.ModelNode;
		public spineLightBig:ui.comm.node.ModelNode;
	}
	class SevenDayProgressComp extends fgui.GComponent{
		public bgProgress:fgui.GImage;
		public labelProgress:fgui.GTextField;
		public imgPoint:fgui.GImage;
		public G_isNoLast:fgui.GGroup;
		public G_isGain:fgui.GGroup;
		public G_isGainLast:fgui.GGroup;
		public G_isLast:fgui.GGroup;
		public bar:ui.sevenDay.bar.SevenDayProgressBar;
		public redDot1:ui.comm.com.RedDot;
		public redDot2:ui.comm.com.RedDot;
		public item:ui.comm.item.ItemFrameBtn;
		public btnGain:ui.comm.btn.EmptyBtn;
	}
	class SevenDayTaskRowComp extends fgui.GComponent{
		public bg:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public labelProgress:fgui.GTextField;
		public nodeSp:fgui.GGroup;
		public btnGain:ui.sevenDay.btn.SevenDayGainBtn;
		public btnJump:ui.sevenDay.btn.SevenDayJumpBtn;
		public redDot:ui.comm.com.RedDot;
		public itemList:ui.comm.item.ItemListComp;
	}
}
declare namespace ui.sevenDay.subView {
	class SevenDayLoginSubView extends fgui.GComponent{
		public gCenter:fgui.GGroup;
		public pCenter:ui.sevenDay.SignInCenterPanel;
		public pBtn:ui.sevenDay.btn.SevenDayLoginGainRewardBtn;
	}
	class SevenDayTaskSubView extends fgui.GComponent{
		public top_bg:fgui.GImage;
		public top_bg2:fgui.GImage;
		public adapt_bg:fgui.GImage;
		public taskList:fgui.GList;
		public taskDayList:fgui.GList;
		public progressList:fgui.GList;
		public labelTitleRestTimeLeft:fgui.GTextField;
		public labelRestTime:fgui.GTextField;
		public labelProgress:fgui.GTextField;
		public labelNextDayTips:fgui.GTextField;
		public G_next:fgui.GGroup;
		public fgTaskMask:fgui.GLoader;
		public btnRule:ui.comm.btn.BtnGth3;
		public nodePoint:ui.comm.com.Node;
	}
}
