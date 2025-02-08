declare namespace ui.captainSkill {
	class CaptainSkillDemo extends fgui.GComponent{
	}
	class CaptainSkillResetWin extends fgui.GComponent{
		public listReward:fgui.GList;
		public lbTitle:fgui.GTextField;
		public lbTime:fgui.GRichTextField;
		public lbTip:fgui.GRichTextField;
		public gAll:fgui.GGroup;
		public emptyBtn:ui.comm.btn.EmptyBtn;
		public btnReset:ui.comm.btn.BtnChangGui1WithItem;
	}
	class CaptionSkillBattleView extends fgui.GComponent{
	}
	class CaptionSkillLvUpView extends fgui.GComponent{
		public bg:fgui.GLoader;
		public top_bg:fgui.GImage;
		public bottom_bg:fgui.GImage;
		public bgTitle:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public header:fgui.GGroup;
		public labelTitleTab:fgui.GTextField;
		public gTitle:fgui.GGroup;
		public skillList:fgui.GList;
		public footer:fgui.GGroup;
		public listHeaderItem:fgui.GList;
		public ruleBtn:ui.comm.btn.BtnGth3;
		public btnBack:ui.comm.back.BtnBack;
		public contentComp:ui.captainSkill.components.CaptainSkillDescPanelComp;
		public modelComp:ui.captainSkill.CaptionSkillModelComp;
		public btnReset:ui.comm.btn.BtnEntrance;
	}
	class CaptionSkillModelComp extends fgui.GComponent{
		public iconLoader:fgui.GLoader;
		public aniNode:ui.comm.node.ModelNode;
	}
}
declare namespace ui.captainSkill.components {
	class CaptainSkillAddAttrComp extends fgui.GComponent{
		public bg:fgui.GImage;
		public labelValue:fgui.GTextField;
		public imageIcon:fgui.GLoader;
	}
	class CaptainSkillAttrTitleComp extends fgui.GComponent{
		public title:fgui.GTextField;
	}
	class CaptainSkillContentComp extends fgui.GComponent{
		public lbTitle:fgui.GTextField;
		public listAttrCareer:fgui.GList;
		public listEffect:fgui.GList;
		public gAll:fgui.GGroup;
		public titleComp:ui.captainSkill.components.CaptainSkillAttrTitleComp;
		public titleComp2:ui.captainSkill.components.CaptainSkillAttrTitleComp;
	}
	class CaptainSkillDescPanelComp extends fgui.GComponent{
		public bgBody:fgui.GImage;
		public labelLv:fgui.GTextField;
		public gBtn:fgui.GGroup;
		public bgTitle:ui.captainSkill.components.CaptainSkillLvUpTitleComp;
		public btnFull:ui.comm.btn.BtnChangGui1;
		public contentComp:ui.captainSkill.components.CaptainSkillContentComp;
		public btnLvUp:ui.comm.btn.BtnChangGui1WithItemList1;
	}
	class CaptainSkillHeaderItem extends fgui.GButton{
		public bg:fgui.GImage;
		public labelValue:fgui.GTextField;
		public imageIcon:fgui.GLoader;
	}
	class CaptainSkillLvUpTitleComp extends fgui.GComponent{
		public bg:fgui.GImage;
		public labelLv:fgui.GTextField;
		public labelName:fgui.GTextField;
	}
	class CaptainSkillOneComp extends fgui.GComponent{
		public bg:fgui.GImage;
		public imageSkill:fgui.GLoader;
		public fgMask:fgui.GImage;
		public fgMaxLv:fgui.GImage;
		public labelLv:fgui.GTextField;
		public labelLock:fgui.GTextField;
		public mc:fgui.GGroup;
		public redDot:ui.comm.com.RedDot;
	}
	class CaptainSkillOneEffectComp extends fgui.GComponent{
		public labelSkill:fgui.GRichTextField;
		public logoUnlock:fgui.GImage;
		public logoLock:fgui.GImage;
	}
}
declare namespace ui.captainSkill.main {
	class CaptionSkillLvMainAttrItem extends fgui.GComponent{
		public iconAttr:fgui.GLoader;
		public lbName:fgui.GTextField;
		public lbNow:fgui.GTextField;
		public lbNext:fgui.GTextField;
		public arrow:fgui.GImage;
	}
	class CaptionSkillLvMainBtn extends fgui.GButton{
		public iconLoader:fgui.GLoader;
		public lbLv:fgui.GTextField;
		public gLv:fgui.GGroup;
		public redDot:ui.comm.com.RedDot;
	}
	class CaptionSkillMainView extends fgui.GComponent{
		public bg:fgui.GLoader;
		public top_bg:fgui.GImage;
		public bottom_bg:fgui.GImage;
		public bgTitle:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public listHeaderItem:fgui.GList;
		public lbLv:fgui.GTextField;
		public gCenter:fgui.GGroup;
		public lbLv2:fgui.GTextField;
		public listAttr:fgui.GList;
		public gBottom:fgui.GGroup;
		public ruleBtn:ui.comm.btn.BtnGth3;
		public aniNode:ui.comm.node.ModelNode;
		public btnBack:ui.comm.btn.BtnFh2;
		public btn1:ui.captainSkill.main.CaptionSkillLvMainBtn;
		public btn2:ui.captainSkill.main.CaptionSkillLvMainBtn;
		public btn3:ui.captainSkill.main.CaptionSkillLvMainBtn;
		public btn4:ui.captainSkill.main.CaptionSkillLvMainBtn;
		public btn5:ui.captainSkill.main.CaptionSkillLvMainBtn;
		public btn6:ui.captainSkill.main.CaptionSkillLvMainBtn;
		public btnUp:ui.comm.btn.BtnChangGui1WithItemList1;
	}
}
