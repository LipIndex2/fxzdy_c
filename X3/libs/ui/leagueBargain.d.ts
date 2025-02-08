declare namespace ui.leagueBargain {
	class LeagueBargainFloatComp extends fgui.GComponent{
		public labelCount:fgui.GTextField;
	}
	class LeagueBargainInfoWin extends fgui.GComponent{
		public labelTitle:fgui.GTextField;
		public rowList:fgui.GList;
		public G_a:fgui.GGroup;
		public bgM:ui.comm.btn.EmptyBtn;
	}
	class LeagueBargainMainView extends fgui.GComponent{
		public labelOld:fgui.GTextField;
		public labelMoneyOld:fgui.GTextField;
		public labelNew:fgui.GTextField;
		public textMsg:fgui.GTextField;
		public rowList:fgui.GList;
		public labelTime:fgui.GTextField;
		public labelPerson:fgui.GRichTextField;
		public labelHaveDiscountMoney:fgui.GTextField;
		public labelMoneyNew:fgui.GTextField;
		public bgM:ui.comm.btn.EmptyBtn;
		public btnKill:ui.leagueBargain.btn.LeagueBargainBuyBtn;
		public r1:ui.leagueBargain.components.LeagueBargainRewardComp;
		public r2:ui.leagueBargain.components.LeagueBargainRewardComp;
		public r3:ui.leagueBargain.components.LeagueBargainRewardComp;
		public r4:ui.leagueBargain.components.LeagueBargainRewardComp;
		public floatItem:ui.leagueBargain.LeagueBargainFloatComp;
		public btnRule:ui.comm.btn.BtnGth3;
		public btnInfo:ui.comm.btn.BtnGth3;
		public btnBuy:ui.comm.btn.BtnChangGui1;
	}
}
declare namespace ui.leagueBargain.btn {
	class LeagueBargainBuyBtn extends fgui.GButton{
		public redDot:ui.comm.com.RedDot;
	}
}
declare namespace ui.leagueBargain.components {
	class LeagueBargainRewardComp extends fgui.GComponent{
		public imageReward:fgui.GLoader;
		public textCount:fgui.GTextField;
	}
}
declare namespace ui.leagueBargain.item {
	class LeagueBargainBuyItemComp extends fgui.GComponent{
		public labelName:fgui.GTextField;
		public labelC:fgui.GTextField;
		public labelCount:fgui.GTextField;
	}
	class LeagueBargainRowItemComp extends fgui.GComponent{
		public textName:fgui.GTextField;
		public textTime:fgui.GTextField;
	}
}
