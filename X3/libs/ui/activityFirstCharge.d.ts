declare namespace ui.activityFirstCharge {
	class FirstChargeDemoWin extends fgui.GComponent{
		public lbTitle:fgui.GTextField;
		public skill:ui.activityFirstCharge.component.FirstChargeSkill;
		public videoNode:ui.comm.node.VideoNode;
	}
	class FirstChargeWin extends fgui.GComponent{
		public bg:fgui.GLoader;
		public pContent:ui.activityFirstCharge.component.FirstChargeContent;
	}
}
declare namespace ui.activityFirstCharge.btn {
	class buyTabBtn extends fgui.GButton{
		public T_price:fgui.GTextField;
		public img_buy:fgui.GImage;
		public redDot:ui.comm.com.RedDot;
	}
	class FirstChargeDemoBtn extends fgui.GButton{
		public videoNode:ui.comm.node.VideoNode;
	}
}
declare namespace ui.activityFirstCharge.component {
	class FirstChargeBubble extends fgui.GComponent{
		public bgBubble:fgui.GImage;
		public lbBubble:fgui.GTextField;
	}
	class FirstChargeCenter extends fgui.GComponent{
		public img_buy:fgui.GImage;
		public list_award:fgui.GList;
		public btn_buy:ui.comm.btn.BtnChangGui1;
		public spineBtnLight:ui.comm.node.ModelNode;
		public spineBottomBg:ui.comm.node.ModelNode;
		public bubble:ui.activityFirstCharge.component.FirstChargeBubble;
		public btnDemo:ui.activityFirstCharge.btn.FirstChargeDemoBtn;
	}
	class FirstChargeContent extends fgui.GComponent{
		public list_tab:fgui.GList;
		public topBg:ui.activityFirstCharge.component.FristChargeTopBg;
		public centerPanel:ui.activityFirstCharge.component.FirstChargeCenter;
		public modelNode:ui.comm.node.ModelNode;
		public spineStage:ui.comm.node.ModelNode;
		public topTitle:ui.activityFirstCharge.component.FirstChargeTopTitle;
	}
	class FirstChargeSkill extends fgui.GComponent{
		public lbName:fgui.GTextField;
		public bg:fgui.GLoader;
		public img_bs:fgui.GImage;
		public pDes:ui.activityFirstCharge.component.FristChargeSkillDes;
		public img_skill:ui.comm.hero.components.skillIconMask;
	}
	class FirstChargeTopTitle extends fgui.GComponent{
		public spineTitle:ui.comm.node.ModelNode;
	}
	class FristChargeSkillDes extends fgui.GComponent{
		public lbDes:fgui.GRichTextField;
	}
	class FristChargeTopBg extends fgui.GComponent{
		public T_discount:fgui.GTextField;
		public G_discount:fgui.GGroup;
		public T_name:fgui.GTextField;
		public img_camp:fgui.GLoader;
		public list_star:fgui.GList;
		public spineTopBg:ui.comm.node.ModelNode;
		public spineTitle:ui.comm.node.ModelNode;
		public spineDiscount:ui.comm.node.ModelNode;
		public spineStar:ui.comm.node.ModelNode;
	}
}
declare namespace ui.activityFirstCharge.item {
	class FirstChargeAwardItem extends fgui.GComponent{
		public T_day:fgui.GTextField;
		public list_award:fgui.GList;
		public T_tips:fgui.GTextField;
		public btn_get:ui.comm.btn.BtnChangGui3;
		public redDot:ui.comm.com.RedDot;
	}
}
