declare namespace ui.playerInfo {
	class PlayerInfoChangeChatSkinView extends fgui.GComponent{
		public bg:fgui.GLoader;
		public labelTitle:fgui.GTextField;
		public bgTab:fgui.GImage;
		public tabList:fgui.GList;
		public G_all:fgui.GGroup;
		public subHeadFrame:ui.playerInfo.subView.PlayerInfoChangeChatBgSubView;
		public subHeadIcon:ui.playerInfo.subView.PlayerInfoChangeChatColorSubView;
	}
	class PlayerInfoChangeMainView extends fgui.GComponent{
		public bg:fgui.GLoader;
		public labelTitle:fgui.GTextField;
		public bgTab:fgui.GImage;
		public tabList:fgui.GList;
		public G_all:fgui.GGroup;
		public subHeadIcon:ui.playerInfo.subView.PlayerInfoHeadIconSubView;
		public subHeadFrame:ui.playerInfo.subView.PlayerInfoHeadFrameSubView;
		public subTitle:ui.playerInfo.subView.PlayerInfoTitleSubView;
		public subRole:ui.playerInfo.subView.PlayerInfoChangeRoleSubView;
	}
	class PlayerInfoChangeNameView extends fgui.GComponent{
		public bg:fgui.GLoader;
		public fg:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public bgInput:fgui.GImage;
		public labelInput:fgui.GTextInput;
		public redDot:ui.comm.com.RedDot;
		public btnFree:ui.comm.btn.BtnChangGui1;
		public btnOk:ui.comm.btn.BtnChangGui1WithItem;
	}
	class PlayerInfoMainView extends fgui.GComponent{
		public bg:fgui.GLoader;
		public fg:fgui.GImage;
		public labelPlayerName:fgui.GTextField;
		public imageTitle:fgui.GLoader;
		public lineSplit:fgui.GImage;
		public btnP:fgui.GGroup;
		public lbPetName:fgui.GTextField;
		public gPet:fgui.GGroup;
		public lbCollectionsName:fgui.GTextField;
		public gCollections:fgui.GGroup;
		public gChange:fgui.GGroup;
		public partPlayerId:ui.playerInfo.components.PlayerInfoIdComp;
		public btnAddBlack:ui.playerInfo.btn.PlayerInfoBlackFriendBtn;
		public btnWaitApply:ui.playerInfo.btn.PlayerInfoWaitConfirmBtn;
		public btnDeleteFriend:ui.playerInfo.btn.PlayerInfoBlackFriendBtn;
		public btnRemoveBlack:ui.playerInfo.btn.PlayerInfoSendPrivateMessageBtn;
		public btnApplyFriend:ui.playerInfo.btn.PlayerInfoSendPrivateMessageBtn;
		public btnSendMessage:ui.playerInfo.btn.PlayerInfoSendPrivateMessageBtn;
		public btnChallengeFriend:ui.playerInfo.btn.PlayerInfoSendPrivateMessageBtn;
		public hero1:ui.playerInfo.components.PlayerInfoOneHeroSlotComp;
		public hero2:ui.playerInfo.components.PlayerInfoOneHeroSlotComp;
		public hero3:ui.playerInfo.components.PlayerInfoOneHeroSlotComp;
		public hero4:ui.playerInfo.components.PlayerInfoOneHeroSlotComp;
		public hero5:ui.playerInfo.components.PlayerInfoOneHeroSlotComp;
		public hero6:ui.playerInfo.components.PlayerInfoOneHeroSlotComp;
		public partHangUpLevel:ui.playerInfo.components.PlayerInfoOneLineComp;
		public partServerId:ui.playerInfo.components.PlayerInfoOneLineComp;
		public partLeague:ui.playerInfo.components.PlayerInfoOneLineComp;
		public switchComp:ui.playerInfo.components.switchInfoShow;
		public btnPlayerAvatar:ui.comm.playerInfo.PlayerAvatar;
		public btnChangeName:ui.comm.btn.BtnShuRu;
		public redDot:ui.comm.com.RedDot;
		public redDot2:ui.comm.com.RedDot;
		public fightNum:ui.comm.fightNum.FightNumComp;
		public btnChangePlayerAvatar:ui.comm.btn.BtnShuaXin;
		public pPet:ui.comm.formation.FormationSkillIcon;
		public pCollections:ui.comm.formation.FormationSkillIcon;
	}
}
declare namespace ui.playerInfo.btn {
	class PlayerInfoBlackFriendBtn extends fgui.GButton{
	}
	class PlayerInfoChatSkinTabBtn extends fgui.GButton{
		public labelNoChoose:fgui.GTextField;
		public G_noChoose:fgui.GGroup;
		public bg:fgui.GImage;
		public labelChoose:fgui.GTextField;
		public G_choose:fgui.GGroup;
		public redDot:ui.comm.com.RedDot;
	}
	class PlayerInfoSaveBtn extends fgui.GButton{
	}
	class PlayerInfoSendPrivateMessageBtn extends fgui.GButton{
	}
	class PlayerInfoTabBtn extends fgui.GButton{
		public labelNoChoose:fgui.GTextField;
		public labelChoose:fgui.GTextField;
		public G_choose:fgui.GGroup;
		public redDot:ui.comm.com.RedDot;
	}
	class PlayerInfoWaitConfirmBtn extends fgui.GButton{
	}
	class PlayerInfoWearOffBtn extends fgui.GButton{
	}
}
declare namespace ui.playerInfo.components {
	class HeroDnaLittleComp extends fgui.GComponent{
		public stage1:fgui.GImage;
		public stage2:fgui.GImage;
		public stage3:fgui.GImage;
		public stage4:fgui.GImage;
		public stage5:fgui.GImage;
		public stage6:fgui.GImage;
	}
	class PlayerInfoChangeBtnGroupComp extends fgui.GComponent{
		public G_haveWear:fgui.GGroup;
		public imageLock:fgui.GImage;
		public labelLockTips:fgui.GTextField;
		public G_lock:fgui.GGroup;
		public G_noWear:fgui.GGroup;
		public labelInUseTips:fgui.GTextField;
		public G_inUse:fgui.GGroup;
		public btnWearOn:ui.playerInfo.btn.PlayerInfoSaveBtn;
		public btnWearOff:ui.comm.btn.BtnChangGui3;
	}
	class PlayerInfoCountDownTimeComp extends fgui.GComponent{
		public labelTime:fgui.GTextField;
	}
	class PlayerInfoIdComp extends fgui.GComponent{
		public bg:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public labelPlayerId:fgui.GTextField;
		public btnCopy:ui.comm.btn.BtnCopy;
	}
	class PlayerInfoOneHeroModelComp extends fgui.GComponent{
		public rootForSpine:fgui.GTextField;
		public list_star1:fgui.GList;
	}
	class PlayerInfoOneHeroSlotComp extends fgui.GComponent{
		public imageDi:fgui.GLoader;
		public starList:fgui.GList;
		public labelHeroName:fgui.GTextField;
		public dnaShow:ui.playerInfo.components.HeroDnaLittleComp;
		public rootForSpine:ui.comm.node.ModelNode;
	}
	class PlayerInfoOneLineComp extends fgui.GComponent{
		public bg:fgui.GImage;
		public labelContent:fgui.GTextField;
	}
	class switchInfoShow extends fgui.GComponent{
	}
}
declare namespace ui.playerInfo.item {
	class PlayerInfoChatBgComp extends fgui.GComponent{
		public bg:fgui.GImage;
		public imgChatBg:fgui.GImage;
		public G_wear:fgui.GGroup;
		public G_lock:fgui.GGroup;
		public G_choose:fgui.GGroup;
		public redDot:ui.comm.com.RedDot;
	}
	class PlayerInfoChatFontColorComp extends fgui.GComponent{
		public labelContent:fgui.GTextField;
		public G_wear:fgui.GGroup;
		public G_lock:fgui.GGroup;
		public G_choose:fgui.GGroup;
		public redDot:ui.comm.com.RedDot;
	}
	class PlayerInfoHeadFrameComp extends fgui.GComponent{
		public imageFrame:fgui.GLoader;
		public G_wear:fgui.GGroup;
		public G_lock:fgui.GGroup;
		public G_choose:fgui.GGroup;
		public redDot:ui.comm.com.RedDot;
	}
	class PlayerInfoHeadIconComp extends fgui.GComponent{
		public G_wear:fgui.GGroup;
		public G_lock:fgui.GGroup;
		public G_choose:fgui.GGroup;
		public avatar:ui.comm.playerInfo.PlayerAvatar;
		public redDot:ui.comm.com.RedDot;
	}
	class PlayerInfoRoleItemComp extends fgui.GComponent{
		public G_wear:fgui.GGroup;
		public G_lock:fgui.GGroup;
		public G_choose:fgui.GGroup;
		public redDot:ui.comm.com.RedDot;
		public avatar:ui.comm.hero.HeroAvatar;
	}
	class PlayerInfoTitleComp extends fgui.GComponent{
		public imageFrame:fgui.GLoader;
		public G_wear:fgui.GGroup;
		public G_lock:fgui.GGroup;
		public G_choose:fgui.GGroup;
		public redDot:ui.comm.com.RedDot;
	}
}
declare namespace ui.playerInfo.list {
	class PlayerInfoTabListComp extends fgui.GComponent{
		public bg:fgui.GImage;
		public tabList:fgui.GList;
	}
}
declare namespace ui.playerInfo.subView {
	class PlayerInfoChangeChatBgSubView extends fgui.GComponent{
		public labelDesc:fgui.GTextField;
		public bgContent:fgui.GImage;
		public itemList:fgui.GList;
		public bgMsg:fgui.GImage;
		public labelMsg:fgui.GTextField;
		public labelPlayerName:fgui.GTextField;
		public timeComp:ui.playerInfo.components.PlayerInfoCountDownTimeComp;
		public changeComp:ui.playerInfo.components.PlayerInfoChangeBtnGroupComp;
		public avatar:ui.comm.playerInfo.PlayerAvatar;
	}
	class PlayerInfoChangeChatColorSubView extends fgui.GComponent{
		public labelDesc:fgui.GTextField;
		public bgContent:fgui.GImage;
		public itemList:fgui.GList;
		public bgMsg:fgui.GImage;
		public labelMsg:fgui.GTextField;
		public labelPlayerName:fgui.GTextField;
		public timeComp:ui.playerInfo.components.PlayerInfoCountDownTimeComp;
		public changeComp:ui.playerInfo.components.PlayerInfoChangeBtnGroupComp;
		public avatar:ui.comm.playerInfo.PlayerAvatar;
	}
	class PlayerInfoChangeRoleSubView extends fgui.GComponent{
		public fg:fgui.GImage;
		public labelName:fgui.GTextField;
		public labelDesc:fgui.GTextField;
		public itemList:fgui.GList;
		public changeComp:ui.playerInfo.components.PlayerInfoChangeBtnGroupComp;
		public hero:ui.comm.node.ModelNode;
	}
	class PlayerInfoHeadFrameSubView extends fgui.GComponent{
		public labelName:fgui.GTextField;
		public labelDesc:fgui.GTextField;
		public bgContent:fgui.GImage;
		public itemList:fgui.GList;
		public timeComp:ui.playerInfo.components.PlayerInfoCountDownTimeComp;
		public changeComp:ui.playerInfo.components.PlayerInfoChangeBtnGroupComp;
		public avatar:ui.comm.playerInfo.PlayerAvatar;
	}
	class PlayerInfoHeadIconSubView extends fgui.GComponent{
		public labelName:fgui.GTextField;
		public labelDesc:fgui.GTextField;
		public bgContent:fgui.GImage;
		public itemList:fgui.GList;
		public timeComp:ui.playerInfo.components.PlayerInfoCountDownTimeComp;
		public changeComp:ui.playerInfo.components.PlayerInfoChangeBtnGroupComp;
		public avatar:ui.comm.playerInfo.PlayerAvatar;
	}
	class PlayerInfoTitleSubView extends fgui.GComponent{
		public imageTitle:fgui.GLoader;
		public labelDesc:fgui.GTextField;
		public bgContent:fgui.GImage;
		public itemList:fgui.GList;
		public timeComp:ui.playerInfo.components.PlayerInfoCountDownTimeComp;
		public changeComp:ui.playerInfo.components.PlayerInfoChangeBtnGroupComp;
	}
}
