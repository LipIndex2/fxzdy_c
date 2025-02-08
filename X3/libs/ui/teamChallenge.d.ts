declare namespace ui.teamChallenge {
	class TeamChallengeChapterView extends fgui.GComponent{
		public listItems:fgui.GList;
	}
	class TeamChallengeFloorView extends fgui.GComponent{
		public bg:fgui.GLoader;
		public fg:fgui.GLoader;
		public labelTitle:fgui.GTextField;
		public bgTitle:fgui.GLoader;
		public labelLevelTitle:fgui.GTextField;
		public levelTitle:fgui.GGroup;
		public bgEnemySchema:fgui.GLoader;
		public bgPower:fgui.GLoader;
		public labelPower:fgui.GTextField;
		public tips:fgui.GTextField;
		public btn:fgui.GGroup;
		public lbTimes:fgui.GTextField;
		public all:fgui.GGroup;
		public btnSetSchema:ui.comm.btn.BtnBlue;
		public btnChallenge:ui.comm.btn.BtnChangGui1;
		public modelNode1:ui.comm.node.ModelNode;
		public modelNode2:ui.comm.node.ModelNode;
		public modelNode3:ui.comm.node.ModelNode;
		public modelNode4:ui.comm.node.ModelNode;
		public modelNode5:ui.comm.node.ModelNode;
		public modelNode6:ui.comm.node.ModelNode;
		public itemList:ui.comm.item.ItemListComp2;
	}
	class TeamChallengeInviteView extends fgui.GComponent{
		public listFriends:fgui.GList;
		public listTabs:fgui.GList;
		public btnSever:ui.teamChallenge.btn.TeamChallengeShareBtn;
		public btnLeague:ui.teamChallenge.btn.TeamChallengeShareBtn;
		public btnShare:ui.comm.btn.BtnChangGui1;
	}
	class TeamChallengeMainView extends fgui.GComponent{
		public sky:fgui.GImage;
		public baseG:fgui.GGroup;
		public lbC:fgui.GTextField;
		public lbStage:fgui.GTextField;
		public listItems:fgui.GList;
		public imgFrame:fgui.GImage;
		public lbCondition2:fgui.GTextField;
		public role1:fgui.GLoader;
		public ImgEmpty1:fgui.GImage;
		public bg1:fgui.GGroup;
		public role2:fgui.GLoader;
		public ImgEmpty2:fgui.GImage;
		public bg2:fgui.GGroup;
		public singleG:fgui.GGroup;
		public listTeam:fgui.GList;
		public lbTn:fgui.GTextField;
		public lbS:fgui.GTextField;
		public nameGroup:fgui.GGroup;
		public lbCondition:fgui.GTextField;
		public goG:fgui.GGroup;
		public lbPermission:fgui.GTextField;
		public permissionG:fgui.GGroup;
		public stageBar:ui.teamChallenge.btn.TeamChallengeBar;
		public posItem0:ui.teamChallenge.components.TeamChallengePosItem;
		public posItem1:ui.teamChallenge.components.TeamChallengePosItem;
		public posItem2:ui.teamChallenge.components.TeamChallengePosItem;
		public btnC:ui.teamChallenge.btn.TeamChallengeBtnC;
		public BtnMgr:ui.teamChallenge.btn.TeamChallengeBtnMgr;
		public btnR:ui.teamChallenge.btn.TeamChallengeBtnR;
		public farGround:ui.teamChallenge.components.TeamChallengeMapScroll;
		public foreground:ui.teamChallenge.components.TeamChallengeBg;
		public bgMask:ui.teamChallenge.components.TeamChallengeMask;
		public bossNode:ui.teamChallenge.components.TeamChallengePostBoss;
		public giftBox:ui.teamChallenge.components.TeamChallengeGiftBox;
		public btnRule:ui.comm.btn.BtnGth3;
		public btnBack:ui.comm.back.BtnBack;
		public chat:ui.comm1.chat.ChatComp;
		public btnFormation1:ui.comm.btn.BtnBlue;
		public btnFormation2:ui.comm.btn.BtnBlue;
		public avatar1:ui.comm.hero.HeroDetailsAvatar;
		public avatar2:ui.comm.hero.HeroDetailsAvatar;
		public btnGo:ui.comm.btn.BtnChangGui1;
		public btnPermission:ui.comm.btn.BtnGouXuan;
	}
	class TeamChallengeMallView extends fgui.GComponent{
		public list:fgui.GList;
		public lbTips:fgui.GTextField;
		public lbHelp:fgui.GTextField;
		public outG:fgui.GGroup;
		public imgClick:fgui.GLoader;
		public rewardsG:fgui.GGroup;
		public btnRule:ui.comm.btn.BtnGth3;
		public btnCreate:ui.comm.btn.BtnChangGui1;
		public btnJoin:ui.comm.btn.BtnChangGui1;
		public btnRefresh:ui.comm.btn.BtnChangGui3;
		public itemList:ui.comm.item.ItemListComp2;
	}
	class TeamChallengeTMgrView extends fgui.GComponent{
		public listApply:fgui.GList;
		public lbEmpty:fgui.GTextField;
		public groupApply:fgui.GGroup;
		public listMyMember:fgui.GList;
		public inputName:fgui.GTextInput;
		public inputScore:fgui.GTextInput;
		public imgClick:fgui.GLoader;
		public groupMember:fgui.GGroup;
		public listTab:fgui.GList;
		public scoreCom:ui.teamChallenge.components.TeamChallengeScoreCom;
		public btnInput2:ui.teamChallenge.btn.TeamChallengeExpandBtn;
		public btnListRe:ui.comm.btn.BtnChangGui1;
		public btnMgrRe:ui.comm.btn.BtnChangGui1;
		public btnGouXuan:ui.comm.btn.BtnGouXuan;
		public btnInput1:ui.comm.btn.BtnShuRu;
	}
}
declare namespace ui.teamChallenge.btn {
	class TeamChallengeBar extends fgui.GProgressBar{
		public bar:fgui.GImage;
		public list:fgui.GList;
	}
	class TeamChallengeBtnC extends fgui.GButton{
		public imageTab:fgui.GLoader;
		public redDot:ui.comm.com.RedDot;
	}
	class TeamChallengeBtnMgr extends fgui.GButton{
		public imageTab:fgui.GLoader;
		public redDot:ui.comm.com.RedDot;
	}
	class TeamChallengeBtnR extends fgui.GButton{
		public imageTab:fgui.GLoader;
	}
	class TeamChallengeCreateBtn extends fgui.GButton{
	}
	class TeamChallengeExpandBtn extends fgui.GButton{
	}
	class TeamChallengeLeftBtn extends fgui.GButton{
	}
	class TeamChallengeNoBtn extends fgui.GButton{
	}
	class TeamChallengeOffBtn extends fgui.GButton{
	}
	class TeamChallengeScoreItem extends fgui.GButton{
		public lb:fgui.GTextField;
		public imgSel:fgui.GImage;
	}
	class TeamChallengeShareBtn extends fgui.GButton{
		public img:fgui.GLoader;
		public imgMask:fgui.GImage;
		public lbName:fgui.GTextField;
		public lbCd:fgui.GTextField;
	}
	class TeamChallengeYesBtn extends fgui.GButton{
	}
}
declare namespace ui.teamChallenge.components {
	class TeamChallengeAvatarCom extends fgui.GComponent{
		public bgImg:fgui.GGroup;
		public lbLv:fgui.GTextField;
		public imgCaptain:fgui.GImage;
		public avatar:ui.comm.playerInfo.PlayerAvatar;
	}
	class TeamChallengeBg extends fgui.GComponent{
		public foreground1:fgui.GImage;
		public foreground2:fgui.GImage;
	}
	class TeamChallengeChapterItem extends fgui.GComponent{
		public bg:fgui.GLoader;
		public lbName:fgui.GTextField;
		public listItems:fgui.GList;
		public lbCondition:fgui.GTextField;
		public groupLock:fgui.GGroup;
		public redDot:ui.comm.com.RedDot;
	}
	class TeamChallengeFloorItem extends fgui.GComponent{
		public bg:fgui.GLoader;
	}
	class TeamChallengeGiftBox extends fgui.GComponent{
		public giftBox:fgui.GLoader;
	}
	class TeamChallengeInviteInfo extends fgui.GComponent{
		public lb1:fgui.GTextField;
		public lb2:fgui.GTextField;
	}
	class TeamChallengeInviteItem extends fgui.GComponent{
		public lbTips:fgui.GTextField;
		public lbName:fgui.GTextField;
		public lbState:fgui.GTextField;
		public lbScore:fgui.GTextField;
		public lbShare:fgui.GTextField;
		public lbLeft:fgui.GTextField;
		public groupInfo:fgui.GGroup;
		public btnShare:ui.comm.btn.BtnChangGui1;
		public avatar:ui.comm.playerInfo.PlayerAvatar;
	}
	class TeamChallengeInviteTitle extends fgui.GComponent{
		public title:fgui.GTextField;
	}
	class TeamChallengeItem extends fgui.GComponent{
		public redDot1:ui.comm.com.RedDot;
		public item:ui.comm.item.ItemFrameBtn;
	}
	class TeamChallengeMallItem extends fgui.GComponent{
		public lbFloor:fgui.GTextField;
		public lbName:fgui.GTextField;
		public lbCondition:fgui.GTextField;
		public imgFight:fgui.GImage;
		public listAvatars:fgui.GList;
		public btnApply:ui.comm.btn.BtnChangGui1;
	}
	class TeamChallengeMapScroll extends fgui.GComponent{
		public farbg_part1:fgui.GImage;
		public bg_part1:fgui.GImage;
		public bgPart1:fgui.GGroup;
		public farbg_part2:fgui.GImage;
		public bg_part2:fgui.GImage;
		public bgPart2:fgui.GGroup;
	}
	class TeamChallengeMask extends fgui.GComponent{
		public btnBack:ui.comm.back.BtnBack;
	}
	class TeamChallengeMemberInfo extends fgui.GComponent{
		public imgAdd:fgui.GImage;
		public bgName:fgui.GImage;
		public lbName:fgui.GTextField;
		public ImgEmpty:fgui.GImage;
		public bg1:fgui.GGroup;
		public ImgEmpty:fgui.GImage;
		public bg2:fgui.GGroup;
		public groupInfo:fgui.GGroup;
		public avatar1:ui.comm.hero.HeroDetailsAvatar;
		public avatar2:ui.comm.hero.HeroDetailsAvatar;
	}
	class TeamChallengePage2Btn extends fgui.GComponent{
		public imgSel:fgui.GImage;
		public lb:fgui.GTextField;
	}
	class TeamChallengePage3Btn extends fgui.GComponent{
		public imgSel:fgui.GImage;
		public lb:fgui.GTextField;
	}
	class TeamChallengePageBtn extends fgui.GComponent{
		public selImg:fgui.GImage;
		public unSelImg:fgui.GImage;
		public lb:fgui.GTextField;
		public redDot:ui.comm.com.RedDot;
	}
	class TeamChallengePosItem extends fgui.GComponent{
		public shadow:fgui.GImage;
		public imgTitle:fgui.GLoader;
		public imgCaptain:fgui.GImage;
		public roleG:fgui.GGroup;
		public imgAdd:fgui.GImage;
		public lbName:fgui.GTextField;
		public lbCondition:fgui.GTextField;
		public modelNode:ui.comm.node.ModelNode;
	}
	class TeamChallengePostBoss extends fgui.GComponent{
		public shadow:fgui.GImage;
		public modelNode:ui.comm.node.ModelNode;
	}
	class TeamChallengeScoreCom extends fgui.GComponent{
		public list_score:fgui.GList;
	}
	class TeamChallengeTMgrItem1 extends fgui.GComponent{
		public lbName:fgui.GTextField;
		public lbScore:fgui.GTextField;
		public avatar:ui.teamChallenge.components.TeamChallengeAvatarCom;
		public btnYes:ui.teamChallenge.btn.TeamChallengeYesBtn;
		public btnNo:ui.teamChallenge.btn.TeamChallengeNoBtn;
	}
	class TeamChallengeTMgrItem2 extends fgui.GComponent{
		public lbName:fgui.GTextField;
		public groupMember:fgui.GGroup;
		public imgAdd:fgui.GImage;
		public avatarCom:ui.teamChallenge.components.TeamChallengeAvatarCom;
		public btnOff:ui.teamChallenge.btn.TeamChallengeOffBtn;
		public btnGive:ui.teamChallenge.btn.TeamChallengeCreateBtn;
		public btnLeft:ui.teamChallenge.btn.TeamChallengeLeftBtn;
	}
}
