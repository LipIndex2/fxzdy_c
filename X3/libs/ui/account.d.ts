declare namespace ui.account {
	class AccountWin extends fgui.GComponent{
		public accountInput:fgui.GTextInput;
		public gp:fgui.GGroup;
		public loginBtn:ui.account.btn.comBtn;
		public historyCom:ui.account.com.ComAccount;
		public historyBtn:ui.account.btn.expandBtn;
		public registerBtn:ui.account.btn.RegisterBtn;
	}
	class RegisterView extends fgui.GComponent{
		public i_account:fgui.GTextInput;
		public i_password:fgui.GTextInput;
		public i_confirm:fgui.GTextInput;
		public i_name:fgui.GTextInput;
		public i_id:fgui.GTextInput;
		public rtf_desc:fgui.GRichTextField;
		public btn_enter:ui.account.btn.comBtn;
		public btn_close:ui.account.btn.comBtn;
		public btn_agree:ui.account.btn.CheckBtn;
	}
	class SuperLoginWin extends fgui.GComponent{
		public i_link:fgui.GTextInput;
		public btn_enter:ui.account.btn.comBtn;
		public btn_close:ui.account.btn.closeBtn;
	}
}
declare namespace ui.account.btn {
	class accountItem extends fgui.GButton{
	}
	class CheckBtn extends fgui.GButton{
	}
	class closeBtn extends fgui.GButton{
	}
	class comBtn extends fgui.GButton{
	}
	class expandBtn extends fgui.GButton{
	}
	class RegisterBtn extends fgui.GButton{
		public tf_register:fgui.GTextField;
	}
}
declare namespace ui.account.com {
	class ComAccount extends fgui.GComponent{
		public list_account:fgui.GList;
	}
}
