declare namespace ui.commFrame.confirm {
	class BtnConfirmOnceTodayWin extends fgui.GComponent{
		public bgBtn:fgui.GGraph;
		public lbTitle:fgui.GTextField;
		public lbTip:fgui.GTextField;
		public lbContent:fgui.GRichTextField;
		public gAll:fgui.GGroup;
		public emptyBtn:ui.comm.btn.EmptyBtn;
		public btnGouXuan:ui.comm.btn.BtnGouXuan;
		public btnConfirm:ui.comm.btn.BtnChangGui1;
		public btnCancel:ui.comm.btn.BtnChangGui3;
		public btnClose:ui.comm.btn.GoToBackButton_1;
	}
	class BtnConfirmView extends fgui.GComponent{
		public bgBtn:fgui.GGraph;
		public bg:fgui.GLoader;
		public fg:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public labelContent:fgui.GRichTextField;
		public btnNo:ui.comm.btn.BtnChangGui3;
		public btnYes:ui.comm.btn.BtnChangGui1;
	}
	class BuyInLimitTodayConfirmView extends fgui.GComponent{
		public labelTitle:fgui.GTextField;
		public labelContent1:fgui.GTextField;
		public labelTips:fgui.GTextField;
		public labelContent2:fgui.GTextField;
		public imageItem:fgui.GLoader;
		public labelCostCount:fgui.GTextField;
		public contentP:fgui.GGroup;
		public btnOk:ui.comm.btn.BtnChangGui;
		public btnCancel:ui.comm.btn.BtnChangGui2;
	}
	class FormationDefendView extends fgui.GComponent{
		public bg:fgui.GLoader;
		public fg:fgui.GLoader;
		public labelTitle:fgui.GTextField;
		public heroList:fgui.GList;
		public all:fgui.GGroup;
		public btnMaskBg:ui.comm.btn.EmptyBtn;
		public btnSetMySchema:ui.comm.btn.BtnChangGui1;
		public collectionsComp:ui.comm.formation.FormationSkillInfo;
		public petComp:ui.comm.formation.FormationSkillInfo;
	}
	class ItemCostConfirmView extends fgui.GComponent{
		public bg:fgui.GLoader;
		public fg:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public labelContent1:fgui.GTextField;
		public labelContent2:fgui.GTextField;
		public G_1:fgui.GGroup;
		public labelContent3:fgui.GTextField;
		public G_2:fgui.GGroup;
		public btnNo:ui.comm.btn.BtnCancel;
		public btnYes:ui.comm.btn.BtnConfirm;
		public imageItemText1:ui.comm.item.ItemTextComp;
	}
	class ItemExchangeConfirmView extends fgui.GComponent{
		public bg:fgui.GLoader;
		public fg:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public labelContent1:fgui.GTextField;
		public labelContent2:fgui.GTextField;
		public labelContent3:fgui.GTextField;
		public btnNo:ui.comm.btn.BtnCancel;
		public btnYes:ui.comm.btn.BtnConfirm;
		public imageItemText1:ui.comm.item.ItemTextComp;
		public imageItemText2:ui.comm.item.ItemTextComp;
	}
}
