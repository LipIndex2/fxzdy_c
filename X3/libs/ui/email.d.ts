declare namespace ui.email {
	class EmailBoxView extends fgui.GComponent{
		public bg:fgui.GLoader;
		public fg:fgui.GImage;
		public labelEmailCount:fgui.GRichTextField;
		public labelTitle:fgui.GTextField;
		public mailList:fgui.GList;
		public btnGainAll:ui.comm.btn.BtnConfirm;
		public btnDeleteRead:ui.comm.btn.BtnCancel;
	}
	class EmailContentRewardPartView extends fgui.GComponent{
		public bgRewardPart:fgui.GImage;
		public iconRewardTitle:fgui.GImage;
		public labelRewardTitle:fgui.GTextField;
		public itemList:fgui.GList;
	}
	class EmailContentView extends fgui.GComponent{
		public bg:fgui.GLoader;
		public fg:fgui.GImage;
		public labelSendTime:fgui.GTextField;
		public labelTitle:fgui.GTextField;
		public btnDelete:ui.comm.btn.BtnConfirm;
		public btnGain:ui.comm.btn.BtnConfirm;
		public rewardUI:ui.email.EmailContentRewardPartView;
		public emailContentPart:ui.email.EmailDetailsContentView;
	}
	class EmailDetailsContentView extends fgui.GComponent{
		public emailContentTitle:fgui.GRichTextField;
		public labelSenderAndTime:fgui.GRichTextField;
		public emailContent:fgui.GRichTextField;
	}
	class EmailOneRowView extends fgui.GComponent{
		public bgNotRead:fgui.GImage;
		public bgRead:fgui.GImage;
		public iconNotRead:fgui.GImage;
		public iconRead:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public labelSendTime:fgui.GTextField;
		public labelReadState:fgui.GTextField;
		public itemList:fgui.GList;
		public labelSender:fgui.GTextField;
		public redDot:ui.comm.com.RedDot;
	}
}
