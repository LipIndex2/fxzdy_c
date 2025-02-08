declare namespace ui.chat {
	class ChatEmojiWin extends fgui.GComponent{
		public bg:fgui.GImage;
		public typeList:fgui.GList;
		public emojiList:fgui.GList;
	}
	class ChatMainView extends fgui.GComponent{
		public bg:fgui.GLoader;
		public fgTab:fgui.GImage;
		public tabList:fgui.GList;
		public G_left:fgui.GGroup;
		public G_all:fgui.GGroup;
		public pageChat:ui.chat.page.ChatContentPage;
		public pageSetting:ui.chat.page.ChatSettingsPage;
		public btnSetting:ui.chat.btn.ChatSettingBtn;
	}
}
declare namespace ui.chat.btn {
	class ChatDeleteBtn extends fgui.GButton{
	}
	class ChatEmojiBtn extends fgui.GButton{
		public imageEmoji:fgui.GLoader;
	}
	class ChatEmojiTypeBtn extends fgui.GButton{
	}
	class ChatInviteBtn extends fgui.GButton{
	}
	class ChatJumpForVipBtn extends fgui.GButton{
		public btnJumpL:fgui.GRichTextField;
	}
	class ChatLeagueExploreGotoBtn extends fgui.GComponent{
	}
	class ChatLeftItemBtn extends fgui.GButton{
		public tabItem:ui.chat.btn.ChatTabBtn;
		public avatar:ui.chat.components.ChatPlayerAvatarComp;
	}
	class ChatSendMessageBtn extends fgui.GButton{
		public bg:fgui.GImage;
		public labelName:fgui.GTextField;
	}
	class ChatSettingBtn extends fgui.GButton{
	}
	class ChatTabBtn extends fgui.GButton{
		public labelNameUp:fgui.GTextField;
		public imageTab:fgui.GLoader;
		public bgCoung:fgui.GImage;
		public labelCount:fgui.GTextField;
		public G_tips:fgui.GGroup;
		public G_up:fgui.GGroup;
		public imageTabChoose:fgui.GLoader;
		public labelNameDown:fgui.GTextField;
		public G_down:fgui.GGroup;
	}
	class ChatTypeChooseBoxBtn extends fgui.GButton{
		public bg:fgui.GImage;
		public labelName:fgui.GTextField;
		public fg:fgui.GImage;
		public gou:fgui.GImage;
	}
}
declare namespace ui.chat.components {
	class ChatGotoExploreBtn extends fgui.GButton{
	}
	class ChatOneRowCardComp extends fgui.GComponent{
		public textPlayerNameL:fgui.GTextField;
		public bgContentL:fgui.GImage;
		public imageL:fgui.GLoader;
		public textContentL:fgui.GRichTextField;
		public btnJumpL:fgui.GRichTextField;
		public G_L:fgui.GGroup;
		public textPlayerNameR:fgui.GTextField;
		public bgContentR:fgui.GImage;
		public imageR:fgui.GLoader;
		public textContentR:fgui.GRichTextField;
		public btnJumpR:fgui.GRichTextField;
		public G_R:fgui.GGroup;
		public G_content:fgui.GGroup;
		public textTime:fgui.GTextField;
		public G_center:fgui.GGroup;
		public playerAvatar:ui.comm.playerInfo.PlayerAvatar;
	}
	class ChatOneRowComp extends fgui.GComponent{
		public partCard:ui.chat.components.ChatOneRowCardComp;
		public partContent:ui.chat.components.ChatOneRowContentComp;
	}
	class ChatOneRowCompForLeagueExplore extends fgui.GComponent{
		public bgContentL:fgui.GImage;
		public iconLoaderL:fgui.GLoader;
		public textPlayerNameL:fgui.GTextField;
		public textContentL:fgui.GRichTextField;
		public textBuildingL:fgui.GTextField;
		public textLeagueNameL:fgui.GTextField;
		public G_L:fgui.GGroup;
		public bgContentR:fgui.GImage;
		public iconLoaderR:fgui.GLoader;
		public textPlayerNameR:fgui.GTextField;
		public textContentR:fgui.GRichTextField;
		public textBuildingR:fgui.GTextField;
		public textLeagueNameR:fgui.GTextField;
		public G_R:fgui.GGroup;
		public playerAvatar:ui.comm.playerInfo.PlayerAvatar;
		public btnGotoL:ui.chat.components.ChatGotoExploreBtn;
		public btnGotoR:ui.chat.components.ChatGotoExploreBtn;
	}
	class ChatOneRowCompForLeagueExplore2 extends fgui.GComponent{
		public bgContentL:fgui.GImage;
		public textPlayerNameL:fgui.GTextField;
		public textContentL:fgui.GRichTextField;
		public G_L:fgui.GGroup;
		public bgContentR:fgui.GImage;
		public textPlayerNameR:fgui.GTextField;
		public textContentR:fgui.GTextField;
		public G_R:fgui.GGroup;
		public playerAvatar:ui.comm.playerInfo.PlayerAvatar;
	}
	class ChatOneRowCompForLeagueInvite extends fgui.GComponent{
		public bgContentL:fgui.GImage;
		public bgContentL2:fgui.GImage;
		public textPlayerNameL:fgui.GTextField;
		public textContentL:fgui.GRichTextField;
		public textLeagueNameL:fgui.GTextField;
		public lineL:fgui.GImage;
		public textLeagueLvL:fgui.GTextField;
		public textLeagueIdL:fgui.GTextField;
		public G_L:fgui.GGroup;
		public bgContentR:fgui.GImage;
		public bgContentR2:fgui.GImage;
		public textPlayerNameR:fgui.GTextField;
		public textLeagueNameR:fgui.GTextField;
		public textContentR:fgui.GRichTextField;
		public lineR:fgui.GImage;
		public textLeagueLvR:fgui.GTextField;
		public textLeagueIdR:fgui.GTextField;
		public G_R:fgui.GGroup;
		public playerAvatar:ui.comm.playerInfo.PlayerAvatar;
		public btnJoinL:ui.chat.btn.ChatInviteBtn;
		public btnJoinR:ui.chat.btn.ChatInviteBtn;
	}
	class ChatOneRowComTCFail extends fgui.GComponent{
		public tips:fgui.GTextField;
	}
	class ChatOneRowComTCInvite extends fgui.GComponent{
		public bgContentL:fgui.GImage;
		public bgContentL2:fgui.GImage;
		public textPlayerNameL:fgui.GTextField;
		public ImgEmpty:fgui.GImage;
		public bg3L:fgui.GGroup;
		public ImgEmpty:fgui.GImage;
		public bg2L:fgui.GGroup;
		public ImgEmpty:fgui.GImage;
		public bg1L:fgui.GGroup;
		public textFloorL:fgui.GTextField;
		public lbConditionL:fgui.GTextField;
		public imgFightL:fgui.GImage;
		public tipsL:fgui.GTextField;
		public G_L:fgui.GGroup;
		public bgContentR:fgui.GImage;
		public bgContentR2:fgui.GImage;
		public textPlayerNameR:fgui.GTextField;
		public ImgEmpty:fgui.GImage;
		public bgR3:fgui.GGroup;
		public ImgEmpty:fgui.GImage;
		public bgR2:fgui.GGroup;
		public textFloorR:fgui.GTextField;
		public ImgEmpty:fgui.GImage;
		public bgR1:fgui.GGroup;
		public lbConditionR:fgui.GTextField;
		public imgFightR:fgui.GImage;
		public tipsR:fgui.GTextField;
		public G_R:fgui.GGroup;
		public playerAvatar:ui.comm.playerInfo.PlayerAvatar;
		public btnJoinL:ui.chat.btn.ChatInviteBtn;
		public playerAvatarL1:ui.comm.playerInfo.PlayerAvatar;
		public playerAvatarL2:ui.comm.playerInfo.PlayerAvatar;
		public playerAvatarL3:ui.comm.playerInfo.PlayerAvatar;
		public btnJoinR:ui.chat.btn.ChatInviteBtn;
		public playerAvatarR1:ui.comm.playerInfo.PlayerAvatar;
		public playerAvatarR2:ui.comm.playerInfo.PlayerAvatar;
		public playerAvatarR3:ui.comm.playerInfo.PlayerAvatar;
	}
	class ChatOneRowContentComp extends fgui.GComponent{
		public textPlayerNameL:fgui.GTextField;
		public bgContentL:fgui.GImage;
		public textContentL:fgui.GRichTextField;
		public G_L:fgui.GGroup;
		public textPlayerNameR:fgui.GTextField;
		public bgContentR:fgui.GImage;
		public textContentR:fgui.GRichTextField;
		public G_R:fgui.GGroup;
		public G_content:fgui.GGroup;
		public textTime:fgui.GTextField;
		public G_center:fgui.GGroup;
		public playerAvatar:ui.comm.playerInfo.PlayerAvatar;
	}
	class ChatPlayerAvatarComp extends fgui.GComponent{
		public fgChoose:fgui.GImage;
		public bgCount:fgui.GImage;
		public textCount:fgui.GTextField;
		public G_redDot:fgui.GGroup;
		public textPlayerName:fgui.GTextField;
		public player:ui.comm.playerInfo.PlayerAvatar;
		public btnDel:ui.chat.btn.ChatDeleteBtn;
	}
}
declare namespace ui.chat.page {
	class ChatContentPage extends fgui.GComponent{
		public rowList:fgui.GList;
		public imageTabTag:fgui.GImage;
		public labelTabName:fgui.GTextField;
		public bgBottom:fgui.GImage;
		public bgInput:fgui.GImage;
		public labelShow:fgui.GRichTextField;
		public labelInput:fgui.GTextInput;
		public G_emoji:fgui.GGroup;
		public G_footer:fgui.GGroup;
		public btnEmoji:ui.chat.btn.ChatEmojiBtn;
		public btnSend:ui.chat.btn.ChatSendMessageBtn;
		public emojiWin:ui.chat.ChatEmojiWin;
		public emojiMask:ui.comm.btn.EmptyBtn;
	}
	class ChatSettingsPage extends fgui.GComponent{
		public labelTitle:fgui.GTextField;
		public labelTips:fgui.GTextField;
		public bgChangeTitle:fgui.GImage;
		public labelEditTitle:fgui.GTextField;
		public btnList:fgui.GList;
		public imageTabTag:fgui.GImage;
		public bgChangeTitle2:fgui.GImage;
		public labelEditTitle2:fgui.GTextField;
		public bgEditSkin:fgui.GImage;
		public imageChatBg:fgui.GImage;
		public labelFakeChatMsg:fgui.GTextField;
		public labelPlayerName:fgui.GTextField;
		public G_editSkin:fgui.GGroup;
		public avatar:ui.comm.playerInfo.PlayerAvatar;
		public btnEdit:ui.comm.btn.BtnBuZhen;
	}
}
