declare namespace ui.boxItem {
	class BoxItemBaseRewardView extends fgui.GComponent{
		public background:fgui.GImage;
		public imageDetailsBackground:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public rewardItemList:fgui.GList;
		public labelChooseCount:fgui.GTextField;
		public emptyBtn:ui.comm.btn.EmptyBtn;
		public itemPreviewIconView:ui.comm.item.ItemFrame;
		public buttonUse:ui.comm.btn.BtnChangGui1;
		public progressCountView:ui.comm.progressBar.ProgressBarCommonView;
		public desc:ui.comm1.text.CommonScrollText;
		public chooseItem:ui.comm.progressBar.ButtonBoxChooseCountView2;
	}
	class BoxItemChooseRewardView extends fgui.GComponent{
		public background:fgui.GImage;
		public imageDetailsBackground:fgui.GImage;
		public imageDetailsTitle:fgui.GImage;
		public labelDetailsTitle:fgui.GTextField;
		public labelTitle:fgui.GTextField;
		public rewardItemList:fgui.GList;
		public labelHaveCount:fgui.GTextField;
		public G_all:fgui.GGroup;
		public emptyBtn:ui.comm.btn.EmptyBtn;
		public buttonUse:ui.comm.btn.BtnChangGui1;
		public itemPreviewIconView:ui.comm.item.ItemFrame;
		public desc:ui.comm1.text.CommonScrollText;
		public chooseItem:ui.comm.progressBar.ButtonBoxChooseCountView2;
	}
	class BoxItemPreviewRewardView extends fgui.GComponent{
		public background:fgui.GImage;
		public imageDetailsBackground:fgui.GImage;
		public imageDetailsTitle:fgui.GImage;
		public labelDetailsTitle:fgui.GTextField;
		public labelTitle:fgui.GTextField;
		public rewardItemList:fgui.GList;
		public emptyBtn:ui.comm.btn.EmptyBtn;
		public itemPreviewIconView:ui.comm.item.ItemFrame;
		public desc:ui.comm1.text.CommonScrollText;
	}
}
