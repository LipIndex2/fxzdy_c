declare namespace ui.godSequence {
	class GodSequenceChallengeView extends fgui.GComponent{
		public bg:fgui.GImage;
		public top_bg:fgui.GImage;
		public bottom_bg:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public labelReward:fgui.GTextField;
		public labelTopPlayer:fgui.GTextField;
		public topPlayerAvatarList:fgui.GList;
		public bgTips:fgui.GImage;
		public imageTipsLock:fgui.GImage;
		public labelTipsLock:fgui.GTextField;
		public G_lock:fgui.GGroup;
		public rewardList:fgui.GList;
		public G_header:fgui.GGroup;
		public labelFootTips:fgui.GTextField;
		public G_footer:fgui.GGroup;
		public rowList:fgui.GList;
		public btnRule:ui.comm.btn.BtnGth3;
		public btnBuZhen:ui.comm.btn.BtnBuZhen2;
		public btnChallenge:ui.comm.btn.BtnChangGui1;
		public btnBack:ui.comm.back.BtnBack;
	}
	class GodSequenceChooseView extends fgui.GComponent{
		public adapt_bg:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public G_header:fgui.GGroup;
		public labelTips:fgui.GTextField;
		public G_footer:fgui.GGroup;
		public colList:fgui.GList;
		public btn_jj:ui.godSequence.btn.btnjj;
		public btnDraw:ui.godSequence.btn.GodSequenceLimitTimeDrawCardBtn;
		public btnInfo:ui.comm.btn.BtnGth3;
		public btnBack:ui.comm.back.BtnBack;
		public btnRank:ui.comm.btn.BtnRank;
	}
}
declare namespace ui.godSequence.bar {
	class GodSequenceShortBar extends fgui.GProgressBar{
		public bg:fgui.GImage;
		public bar:fgui.GImage;
	}
}
declare namespace ui.godSequence.btn {
	class btnjj extends fgui.GButton{
		public redDot:ui.comm.com.RedDot;
	}
	class GodSequenceLimitTimeDrawCardBtn extends fgui.GButton{
		public labelTitle:fgui.GTextField;
		public labelTime:fgui.GTextField;
		public labelDesc:fgui.GTextField;
	}
}
declare namespace ui.godSequence.components {
	class GodSequenceDialog extends fgui.GComponent{
		public bg:fgui.GImage;
		public imageItem:fgui.GLoader;
		public labelItemCount:fgui.GTextField;
		public G_c:fgui.GGroup;
	}
	class GodSequenceLeftRightComp extends fgui.GComponent{
		public left:ui.godSequence.components.GodSequenceOneGridComp;
		public right:ui.godSequence.components.GodSequenceOneGridComp;
		public barProgress:ui.godSequence.bar.GodSequenceShortBar;
	}
	class GodSequenceOneColComp extends fgui.GComponent{
		public bg:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public labelLayerNum:fgui.GTextField;
		public imageRace:fgui.GLoader;
		public labelNotOpen:fgui.GTextField;
		public barProgress:ui.godSequence.bar.GodSequenceShortBar;
		public btnOk:ui.comm.btn.BtnChangGui1;
	}
	class GodSequenceOneGridComp extends fgui.GButton{
		public bgLevel:fgui.GImage;
		public G_bg:fgui.GGroup;
		public imageHero:fgui.GLoader;
		public labelContent:fgui.GTextField;
		public labelNum:fgui.GTextField;
		public labelLv:fgui.GTextField;
		public gou:fgui.GImage;
		public dialog:ui.godSequence.components.GodSequenceDialog;
	}
	class GodSequenceRewardItemComp extends fgui.GComponent{
		public imageItem:fgui.GLoader;
	}
}
