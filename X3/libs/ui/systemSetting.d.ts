declare namespace ui.systemSetting {
	class DemoView extends fgui.GComponent{
	}
	class SystemSettingBaseView extends fgui.GComponent{
		public bg:fgui.GLoader;
		public fg:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public labelTitleSetting:fgui.GTextField;
		public labelTitleBattery:fgui.GTextField;
		public settingList:fgui.GList;
		public batteryList:fgui.GList;
		public G_all:fgui.GGroup;
		public btnGM:ui.comm.btn.EmptyBtn;
		public btnBottom1:ui.comm.btn.BtnBuZhen;
		public btnBottom2:ui.comm.btn.BtnBuZhen;
		public btnBottom3:ui.comm.btn.BtnBuZhen;
	}
	class SystemSettingRemindView extends fgui.GComponent{
		public bg:fgui.GLoader;
		public labelTitle:fgui.GTextField;
		public itemList:fgui.GList;
		public G_all:fgui.GGroup;
	}
}
declare namespace ui.systemSetting.btn {
	class SystemSettingBatteryBtn extends fgui.GButton{
		public bg:fgui.GImage;
		public textTitle:fgui.GTextField;
	}
	class SystemSettingSwitchBtn extends fgui.GButton{
		public bg:fgui.GImage;
		public imageChoose:fgui.GImage;
		public textYes:fgui.GTextField;
		public textNo:fgui.GTextField;
	}
}
declare namespace ui.systemSetting.components {
	class SystemSettingBaseComp extends fgui.GComponent{
		public imageLogo:fgui.GLoader;
		public labelTitle:fgui.GTextField;
		public btnSwitch:ui.systemSetting.btn.SystemSettingSwitchBtn;
	}
	class SystemSettingOneRowComp extends fgui.GComponent{
		public bg:fgui.GImage;
		public fgTitle:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public labelContent:fgui.GTextField;
		public bgChoose:fgui.GImage;
		public btnSwitch:ui.systemSetting.btn.SystemSettingSwitchBtn;
	}
}
