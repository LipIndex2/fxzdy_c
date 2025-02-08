declare namespace ui.talent {
	class TalentConfirmLvUpView extends fgui.GComponent{
		public bg:fgui.GLoader;
		public labelTitle:fgui.GTextField;
		public desc:fgui.GTextField;
		public btnUnlock:ui.comm.btn.UnlockByCostItemBtn;
	}
	class TalentMainView extends fgui.GComponent{
		public adapt_bg:fgui.GImage;
		public talentList:fgui.GList;
		public labelLv:fgui.GTextField;
		public barBgL:ui.talent.progressBar.TalentFgProgressBar;
		public confirmComp:ui.talent.TalentConfirmLvUpView;
		public barBgR:ui.talent.bar.TalentBgBarR;
		public btnOneKeyLvUp:ui.talent.btn.TalentOneKeyLvUpBtn;
		public lvUpTalentTipsTop:ui.talent.btn.TalentRedDotTipsBtn;
		public lvUpTalentTipsDown:ui.talent.btn.TalentRedDotTipsBtn;
		public header1:ui.comm.header.HeadItemCompV2;
		public header2:ui.comm.header.HeadItemCompV2;
		public ruleBtn:ui.comm.btn.BtnGth3;
		public emptyBtn:ui.comm.btn.EmptyBtn;
		public footer:ui.comm.back.BackFooter;
	}
	class TalentNewEffectTipsWin extends fgui.GComponent{
		public G_lvUp:fgui.GGroup;
		public G_unlockFunc:fgui.GGroup;
		public labelTips:fgui.GRichTextField;
		public bg1:fgui.GImage;
		public bg2:fgui.GImage;
		public bgLogo:fgui.GImage;
		public imageLogo:fgui.GLoader;
		public labelTitle:fgui.GTextField;
	}
}
declare namespace ui.talent.bar {
	class TalentBgBarL extends fgui.GProgressBar{
		public bar:fgui.GImage;
	}
	class TalentBgBarR extends fgui.GProgressBar{
		public bar:fgui.GImage;
	}
	class TalentDNABar extends fgui.GProgressBar{
		public bar:fgui.GImage;
	}
}
declare namespace ui.talent.btn {
	class TalentOneKeyLvUpBtn extends fgui.GButton{
		public labelTitle:fgui.GTextField;
	}
	class TalentRedDotTipsBtn extends fgui.GButton{
	}
}
declare namespace ui.talent.components {
	class BgProgressBar extends fgui.GProgressBar{
		public bar:fgui.GImage;
	}
	class TalentBgMaskComp extends fgui.GComponent{
		public bgMask:fgui.GLoader;
	}
	class TalentBigLvUpItemComp extends fgui.GComponent{
		public bg:fgui.GLoader;
		public imageTalent:fgui.GLoader;
		public labelTitle:fgui.GTextField;
	}
	class TalentBigV2Comp extends fgui.GComponent{
		public talentBig:ui.talent.components.TalentBigLvUpItemComp;
		public redDot:ui.comm.com.RedDot;
		public modelNode:ui.comm.node.ModelNode;
	}
	class TalentOneLvComp extends fgui.GComponent{
		public lineLv:fgui.GImage;
		public bgLv:fgui.GImage;
		public labelLv:fgui.GTextField;
		public G_title:fgui.GGroup;
		public all:fgui.GGroup;
		public small1:ui.talent.components.TalentSmallV2Comp;
		public big1:ui.talent.components.TalentBigV2Comp;
		public bar:ui.talent.bar.TalentDNABar;
		public barFirst:ui.talent.bar.TalentDNABar;
	}
	class TalentOneRowComp extends fgui.GComponent{
		public tipsComp:ui.talent.components.TalentTipsComp;
		public talentSmall1:ui.talent.components.TalentSmallLvUpItemComp;
		public talentSmall2:ui.talent.components.TalentSmallLvUpItemComp;
		public talentSmall3:ui.talent.components.TalentSmallLvUpItemComp;
		public talentBig:ui.talent.components.TalentBigLvUpItemComp;
		public barSmallUp1:ui.talent.components.TalentSmallBarComp;
		public barSmallUp2:ui.talent.components.TalentSmallBarComp;
		public barSmall1:ui.talent.components.TalentSmallBarComp;
		public barSmall2:ui.talent.components.TalentSmallBarComp;
		public barBig:ui.talent.components.TalentSmallBarComp;
	}
	class TalentSmallBarComp extends fgui.GProgressBar{
		public bar:fgui.GImage;
	}
	class TalentSmallLvUpItemComp extends fgui.GComponent{
		public bg:fgui.GLoader;
		public imageTalent:fgui.GLoader;
		public labelCount:fgui.GTextField;
		public redDot:ui.comm.com.RedDot;
	}
	class TalentSmallV2Comp extends fgui.GComponent{
		public talentComp:ui.talent.components.TalentSmallLvUpItemComp;
		public modelNode:ui.comm.node.ModelNode;
	}
	class TalentTipsComp extends fgui.GComponent{
		public bg:fgui.GLoader;
		public labelTitle:fgui.GTextField;
	}
}
declare namespace ui.talent.progressBar {
	class TalentDNAProgressBar extends fgui.GProgressBar{
		public bar:fgui.GImage;
	}
	class TalentFgProgressBar extends fgui.GProgressBar{
		public bar:fgui.GImage;
	}
}
