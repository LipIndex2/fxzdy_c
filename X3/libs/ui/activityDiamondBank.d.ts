declare namespace ui.activityDiamondBank {
	class DiamondBankBarStorage extends fgui.GProgressBar{
		public bar:fgui.GImage;
	}
	class DiamondBankView extends fgui.GComponent{
		public unlockLbl:fgui.GTextField;
		public unlockTip:fgui.GGroup;
		public t1:fgui.GTextField;
		public addRate:fgui.GRichTextField;
		public t2:fgui.GTextField;
		public storageNum:fgui.GTextField;
		public drawNum:fgui.GTextField;
		public storageInfo:fgui.GTextField;
		public lock:fgui.GImage;
		public tips:fgui.GRichTextField;
		public goldIcon:fgui.GLoader;
		public existTime:fgui.GTextField;
		public waitDrawDesc:fgui.GTextField;
		public getBtn:ui.comm.btn.BtnChangGui1;
		public btnRule:ui.comm.btn.BtnGth3;
		public barStorage:ui.activityDiamondBank.DiamondBankBarStorage;
		public emptyBtn:ui.comm.btn.EmptyBtn;
		public gotoChargeBtn:ui.comm.btn.EmptyBtn;
		public emptyBtn:ui.comm.btn.EmptyBtn;
		public rewards:ui.comm.item.ItemListComp;
	}
}
