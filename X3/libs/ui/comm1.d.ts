declare namespace ui.comm1.btn {
	class BtnJia1 extends fgui.GButton{
	}
	class BtnJia10 extends fgui.GButton{
	}
	class BtnJian1 extends fgui.GButton{
	}
	class BtnJian10 extends fgui.GButton{
	}
	class BtnStyle1 extends fgui.GButton{
		public redDot:ui.comm.com.RedDot;
	}
	class BtnUse extends fgui.GButton{
		public labelTitle:fgui.GTextField;
	}
	class BtnZuiDa extends fgui.GButton{
	}
	class BtnZuiDa2 extends fgui.GButton{
	}
	class ItemTipsItemButton extends fgui.GButton{
	}
}
declare namespace ui.comm1.chat {
	class ChatComp extends fgui.GComponent{
		public bg:fgui.GImage;
		public imageMsg:fgui.GImage;
		public labelMessage:fgui.GRichTextField;
		public labelMsgCount:fgui.GTextField;
		public G_redDot:fgui.GGroup;
	}
	class PostTextComp extends fgui.GComponent{
		public lbPost:fgui.GRichTextField;
	}
	class PostView extends fgui.GComponent{
		public bg1:fgui.GImage;
		public bg2:fgui.GImage;
		public gPost:fgui.GGroup;
		public textComp:ui.comm1.chat.PostTextComp;
	}
}
declare namespace ui.comm1.chat.countSlider {
	class CommonCountSliderComp extends fgui.GComponent{
		public btnAdd:ui.comm1.btn.BtnJia1;
		public btnMinus:ui.comm1.btn.BtnJian1;
		public sliderCount:ui.comm1.slider.CommonSlider1;
	}
}
declare namespace ui.comm1.league {
	class LeagueFlagComp extends fgui.GComponent{
		public flagLoader:fgui.GLoader;
		public iconLoader:fgui.GLoader;
	}
}
declare namespace ui.comm1.league.btn {
	class changgui3 extends fgui.GButton{
	}
}
declare namespace ui.comm1.league.component {
	class leagueRankCell extends fgui.GComponent{
		public myRankNoRank:fgui.GTextField;
		public myRankTxt:fgui.GTextField;
		public myRank:fgui.GGroup;
		public rankTxt:fgui.GTextField;
		public nameTxt:fgui.GTextField;
		public rankValue:fgui.GTextField;
		public titleComp:ui.comm1.player.PlayerTitleSmallComp;
		public playerAvatar:ui.comm.playerInfo.PlayerAvatar;
	}
}
declare namespace ui.comm1.player {
	class PlayerTitleSmallComp extends fgui.GComponent{
		public imageTitle:fgui.GLoader;
	}
}
declare namespace ui.comm1.race {
	class RaceLogoComp extends fgui.GComponent{
		public imageLogo:fgui.GLoader;
	}
}
declare namespace ui.comm1.slider {
	class CommonSlider1 extends fgui.GSlider{
		public bar:fgui.GImage;
		public grip:ui.comm1.slider.CommonSlider1_grip;
	}
	class CommonSlider1_grip extends fgui.GButton{
	}
}
declare namespace ui.comm1.text {
	class CommonScrollText extends fgui.GComponent{
		public labelContent:fgui.GTextField;
	}
}
