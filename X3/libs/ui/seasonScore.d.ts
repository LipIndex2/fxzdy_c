declare namespace ui.seasonScore {
	class SeasonScoreView extends fgui.GComponent{
		public lbScore:fgui.GTextField;
		public imgTips:fgui.GImage;
		public lvTS:fgui.GTextField;
		public listItems:fgui.GList;
		public 12:fgui.GImage;
		public 123:fgui.GImage;
		public 1234:fgui.GImage;
		public listTabs:fgui.GList;
		public lbCd:fgui.GRichTextField;
		public btnScoRule:ui.seasonScore.btn.SeasonScoreBtn;
		public btnRule:ui.comm.btn.BtnGth3;
	}
}
declare namespace ui.seasonScore.btn {
	class SeasonScoreBtn extends fgui.GButton{
	}
}
declare namespace ui.seasonScore.com {
	class SeasonScoreSItem extends fgui.GComponent{
		public lbTask:fgui.GTextField;
		public lbPro:fgui.GTextField;
		public imgGet:fgui.GImage;
		public listItems:fgui.GList;
		public btnGo:ui.comm.btn.BtnChangGui3;
		public btnGet:ui.comm.btn.BtnChangGui1;
	}
	class SeasonScoreTab extends fgui.GComponent{
		public imgSel:fgui.GImage;
		public lb:fgui.GTextField;
		public redDot:ui.comm.com.RedDot;
	}
}
