declare namespace ui.login {
	class LoginConfirmView extends fgui.GComponent{
		public bgBtn:fgui.GGraph;
		public bg:fgui.GImage;
		public fg:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public labelContent:fgui.GRichTextField;
		public confirmBtn:ui.login.com.LoginBtn;
	}
	class LoginPage extends fgui.GComponent{
		public serverName:fgui.GTextField;
		public accountBtn:ui.login.com.comBtn;
		public ageBtn:ui.login.com.baseBtn;
		public serverBtn:ui.login.com.baseBtn;
		public infoCom:ui.login.com.CompCom;
		public protocolCom:ui.login.com.ProtocolCom;
		public enterBtn:ui.login.com.LoginBtn;
		public adapt_bg:ui.login.com.BgCom;
	}
	class LoginProgressWin extends fgui.GComponent{
		public tipsText:fgui.GTextField;
		public progress:ui.login.com.ProgressBar;
		public ageBtn:ui.login.com.baseBtn;
		public infoCom:ui.login.com.CompCom;
		public bg:ui.login.com.Node;
	}
}
declare namespace ui.login.com {
	class baseBtn extends fgui.GButton{
	}
	class BgCom extends fgui.GComponent{
		public bg:fgui.GLoader;
		public logo:fgui.GLoader;
		public bgModelNode:ui.login.com.Node;
		public heroModelNode:ui.login.com.Node;
	}
	class checkBtn extends fgui.GButton{
	}
	class comBtn extends fgui.GButton{
	}
	class CompCom extends fgui.GComponent{
		public txt:fgui.GTextField;
	}
	class LoginBtn extends fgui.GButton{
	}
	class Node extends fgui.GComponent{
	}
	class ProgressBar extends fgui.GProgressBar{
		public bar:fgui.GImage;
		public title:fgui.GTextField;
	}
	class ProtocolCom extends fgui.GComponent{
		public protocolText:fgui.GRichTextField;
		public checkBtn:ui.login.com.checkBtn;
	}
}
