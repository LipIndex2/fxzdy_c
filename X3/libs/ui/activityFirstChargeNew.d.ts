declare namespace ui.activityFirstChargeNew {
	class FirstChargeWin extends fgui.GComponent{
		public pContent:ui.activityFirstChargeNew.component.FirstChargeContent;
	}
}
declare namespace ui.activityFirstChargeNew.component {
	class FirstChargeContent extends fgui.GComponent{
		public listTab:fgui.GList;
		public lbName:fgui.GTextField;
		public lbDes:fgui.GRichTextField;
		public listStar:fgui.GList;
		public campLoader:fgui.GLoader;
		public gTitle:fgui.GGroup;
		public lbTip2:fgui.GTextField;
		public lbDay1:fgui.GTextField;
		public lbDay2:fgui.GTextField;
		public lbDay3:fgui.GTextField;
		public listReward1:fgui.GList;
		public listReward2:fgui.GList;
		public listReward3:fgui.GList;
		public gContent:fgui.GGroup;
		public lbTime:fgui.GTextField;
		public lbTip:fgui.GTextField;
		public gBtns:fgui.GGroup;
		public emptyBtn:ui.comm.btn.EmptyBtn;
		public modelNode:ui.comm.node.ModelNode;
		public btnDemo:ui.activityFirstChargeNew.component.FirstChargeDemoBtn;
		public spineStar:ui.comm.node.ModelNode;
		public btnBuy:ui.comm.btn.BtnChangGui1;
		public spineBtnLight:ui.comm.node.ModelNode;
		public btnDraw:ui.comm.btn.BtnChangGui3;
	}
	class FirstChargeDemoBtn extends fgui.GButton{
		public bgLoader:fgui.GLoader;
		public videoNode:ui.comm.node.VideoNode;
	}
	class FirstChargeTabBtn extends fgui.GButton{
		public redDot:ui.comm.com.RedDot;
	}
}
