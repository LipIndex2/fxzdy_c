declare namespace ui.seasonReach {
	class SeasonReachView extends fgui.GComponent{
		public lbScore:fgui.GTextField;
		public imgTips:fgui.GImage;
		public lvTS:fgui.GTextField;
		public listItems:fgui.GList;
		public listTabs:fgui.GList;
		public lbCd:fgui.GRichTextField;
		public btnRule:ui.comm.btn.BtnGth3;
		public btnScoRule:ui.seasonReach.btn.SeasonReachBtn;
	}
}
declare namespace ui.seasonReach.btn {
	class SeasonReachBtn extends fgui.GButton{
	}
}
declare namespace ui.seasonReach.com {
	class SeasonReachScoreItem extends fgui.GComponent{
		public lbTask:fgui.GTextField;
		public lbPro:fgui.GTextField;
		public imgGet:fgui.GImage;
		public listItems:fgui.GList;
		public btnGo:ui.comm.btn.BtnChangGui3;
		public btnGet:ui.comm.btn.BtnChangGui1;
	}
	class SeasonReachTab extends fgui.GComponent{
		public img:fgui.GImage;
		public lb:fgui.GTextField;
		public redDot:ui.comm.com.RedDot;
	}
}
