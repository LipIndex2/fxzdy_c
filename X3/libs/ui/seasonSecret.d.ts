declare namespace ui.seasonSecret {
	class SeasonSecretResultView extends fgui.GComponent{
		public lbRank:fgui.GTextField;
		public imgRank:fgui.GImage;
		public lbValue:fgui.GTextField;
		public imgValue:fgui.GImage;
		public title:fgui.GTextField;
		public title1:fgui.GTextField;
		public firstG:fgui.GGroup;
		public title2:fgui.GTextField;
		public title3:fgui.GTextField;
		public normalG:fgui.GGroup;
		public modelNode:ui.comm.node.ModelNode;
		public btnData:ui.comm.btn.BtnData;
		public itemList1:ui.comm.item.ItemListComp2;
		public itemList2:ui.comm.item.ItemListComp2;
	}
	class SeasonSecretView extends fgui.GComponent{
		public lbCd:fgui.GRichTextField;
		public listCom:fgui.GList;
		public lbClose:fgui.GTextField;
		public closeG:fgui.GGroup;
		public lbTips:fgui.GTextField;
		public lbTimes:fgui.GTextField;
		public imgAdd:fgui.GLoader;
		public timeG:fgui.GGroup;
		public tipsG:fgui.GGroup;
		public btnRule:ui.comm.btn.BtnGth3;
		public btnAdd:ui.comm1.btn.BtnJia1;
		public btnFormation1:ui.comm.btn.BtnBlue;
		public btnChallenge:ui.comm.btn.BtnChangGui1;
	}
}
declare namespace ui.seasonSecret.com {
	class SeasonSecretEnd extends fgui.GComponent{
	}
	class SeasonSecretItem extends fgui.GComponent{
		public lbTime:fgui.GTextField;
		public lbN:fgui.GTextField;
		public imgSel:fgui.GImage;
		public listItems:fgui.GList;
		public headIcon:fgui.GLoader;
		public imgPass:fgui.GImage;
		public lockG:fgui.GGroup;
	}
}
