declare namespace ui.battleRecord {
	class BattleLogOneItem extends fgui.GComponent{
		public img_jdt:fgui.GImage;
		public labelTitle:fgui.GTextField;
	}
	class BattleRecordItem extends fgui.GComponent{
		public bg1:fgui.GImage;
		public bg2:fgui.GImage;
		public hurtLab:fgui.GTextField;
		public hurtPro:fgui.GImage;
		public healLab:fgui.GTextField;
		public healPro:fgui.GImage;
		public endureLab:fgui.GTextField;
		public endurePro:fgui.GImage;
		public qualityIcon:fgui.GLoader;
		public headIcon:fgui.GLoader;
	}
	class BattleRecordPanel extends fgui.GComponent{
		public loseNameLab:fgui.GTextField;
		public loseList:fgui.GList;
		public gFailed:fgui.GGroup;
		public winNameLab:fgui.GTextField;
		public winList:fgui.GList;
		public GWin:fgui.GGroup;
		public G_avatar2:ui.comm.playerInfo.PlayerAvatar;
		public G_avatar1:ui.comm.playerInfo.PlayerAvatar;
	}
	class BattleRecordView extends fgui.GComponent{
		public closeBtn:ui.comm.back.BtnBack;
		public pRecord:ui.battleRecord.BattleRecordPanel;
	}
}
