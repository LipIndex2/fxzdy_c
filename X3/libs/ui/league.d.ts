declare namespace ui.league {
	class leagueApplicationList extends fgui.GComponent{
		public list:fgui.GList;
		public noList:fgui.GTextField;
		public onKey:ui.league.btn.sureBtn;
		public autoBtn:ui.league.btn.isAutonApllyBtn;
	}
	class leagueCenterView extends fgui.GComponent{
		public title:fgui.GTextField;
		public nameLab:fgui.GTextField;
		public mamberNumer:fgui.GTextField;
		public idLab:fgui.GTextField;
		public memberList:fgui.GList;
		public noticeEdit:fgui.GTextInput;
		public lvLab:fgui.GTextField;
		public expGr:fgui.GGroup;
		public editFlag:ui.league.btn.flagBtn;
		public applyBtn:ui.league.btn.applyEnterBtn;
		public mamberMgrBtn:ui.league.btn.applyEnterBtn;
		public inviteBtn:ui.league.btn.applyEnterBtn;
		public exitBtn:ui.league.btn.applyEnterBtn;
		public expBar:ui.league.com.leagueExpBar;
		public noticeLab:ui.league.com.leagueNoticeCom;
		public ruleBtn:ui.comm.btn.BaseBtn;
		public mailBtn:ui.comm.btn.BaseBtn;
		public editNoticeBtn:ui.comm.btn.BaseBtn;
		public nameEditBtn:ui.comm.btn.BaseBtn;
		public activeBtn:ui.comm.btn.BtnGth3;
		public flagCom:ui.comm1.league.LeagueFlagComp;
	}
	class leagueCompletedList extends fgui.GComponent{
		public list:fgui.GList;
	}
	class leagueCreateView extends fgui.GComponent{
		public nameTxt:fgui.GTextInput;
		public createBtn:ui.league.btn.leagueCreateBtn;
		public flagBtn:ui.league.btn.flagSelectBtn;
		public flagCom:ui.comm1.league.LeagueFlagComp;
	}
	class leagueFlagView extends fgui.GComponent{
		public tab:fgui.GList;
		public list:fgui.GList;
		public sureBtn:ui.league.btn.leagueCreateBtn;
		public flagCom:ui.comm1.league.LeagueFlagComp;
	}
	class LeagueGameModeWin extends fgui.GComponent{
		public list:fgui.GList;
		public gAll:fgui.GGroup;
	}
	class leagueInviteView extends fgui.GComponent{
		public countLab:fgui.GTextField;
		public mailTxt:fgui.GTextInput;
		public sendBtn:ui.comm.btn.BtnChangGui1WithItem;
	}
	class leagueList extends fgui.GComponent{
		public adapt_bg:fgui.GImage;
		public top_bg:fgui.GImage;
		public list:fgui.GList;
		public noList:fgui.GTextField;
		public searchTxt:fgui.GTextInput;
		public searchBtn:ui.league.btn.noLabelBtn;
		public refreshBtn:ui.league.btn.noLabelBtn;
		public createBtn:ui.league.btn.createBtn;
	}
	class leagueMailView extends fgui.GComponent{
		public countLab:fgui.GTextField;
		public mailTitle:fgui.GTextField;
		public mailTxt:fgui.GTextInput;
		public sendBtn:ui.league.btn.leagueCreateBtn;
	}
	class leagueNewNameView extends fgui.GComponent{
		public newName:fgui.GTextInput;
		public sureBtn:ui.league.btn.leagueCreateBtn;
	}
	class leagueRankView extends fgui.GComponent{
		public top_bg:fgui.GImage;
		public bottom_bg:fgui.GImage;
		public bgList:fgui.GImage;
		public list:fgui.GList;
		public myLeague:ui.league.com.leagueRankCell;
		public top2:ui.league.btn.leagueTop3;
		public top1:ui.league.btn.leagueTop3;
		public top3:ui.league.btn.leagueTop3;
		public footCom:ui.comm.back.BackFooter;
	}
	class leagueTaskView extends fgui.GComponent{
		public adapt_bg:fgui.GImage;
		public list:fgui.GList;
		public closeBtn:ui.comm.back.BtnBack;
		public bntRule:ui.comm.btn.BtnGth3;
	}
	class memberMgrView extends fgui.GComponent{
		public list:fgui.GList;
	}
}
declare namespace ui.league.back {
	class backBtn extends fgui.GButton{
		public btnBack:fgui.GLoader;
	}
}
declare namespace ui.league.btn {
	class applyBtn extends fgui.GButton{
	}
	class applyEnterBtn extends fgui.GButton{
		public redDot:ui.comm.com.RedDot;
	}
	class appointBtn extends fgui.GButton{
	}
	class bgBtn extends fgui.GButton{
	}
	class createBtn extends fgui.GButton{
	}
	class flagBtn extends fgui.GButton{
	}
	class flagIconCell extends fgui.GButton{
		public imageLoader:fgui.GLoader;
		public select_img:fgui.GGroup;
	}
	class flagSelectBtn extends fgui.GButton{
		public nameLabel:fgui.GTextField;
	}
	class flagTagBtn extends fgui.GButton{
	}
	class isAutonApllyBtn extends fgui.GButton{
	}
	class joinBtn extends fgui.GButton{
	}
	class LeagueBargainEnterBtn extends fgui.GButton{
		public lbTime:fgui.GTextField;
		public redDot:ui.comm.com.RedDot;
	}
	class leagueCreateBtn extends fgui.GButton{
		public costIcon:fgui.GLoader;
		public costNum:fgui.GTextField;
		public cost:fgui.GGroup;
	}
	class leagueTop3 extends fgui.GButton{
		public nameLab:fgui.GTextField;
		public fightLab:fgui.GTextField;
		public noRank:fgui.GTextField;
		public flagCom:ui.comm1.league.LeagueFlagComp;
	}
	class noLabelBtn extends fgui.GButton{
	}
	class rejectBtn extends fgui.GComponent{
	}
	class sureBtn extends fgui.GButton{
	}
}
declare namespace ui.league.com {
	class applyCell extends fgui.GComponent{
		public nameLab:fgui.GTextField;
		public fightLab:fgui.GTextField;
		public rejectBtn:ui.comm.btn.BaseBtn;
		public agreeBtn:ui.comm.btn.BaseBtn;
		public avatar:ui.comm.playerInfo.PlayerAvatar;
	}
	class centerBg extends fgui.GButton{
	}
	class joinListCell extends fgui.GComponent{
		public nameLb:fgui.GTextField;
		public lvLb:fgui.GTextField;
		public activeLb:fgui.GTextField;
		public memberLab:fgui.GTextField;
		public joinBtn:ui.league.btn.joinBtn;
		public apllyBtn:ui.league.btn.applyBtn;
		public hadApply:ui.league.btn.applyBtn;
		public flagCom:ui.comm1.league.LeagueFlagComp;
	}
	class LeagueBubble extends fgui.GComponent{
		public demoRewardLab:fgui.GTextField;
	}
	class leagueExpBar extends fgui.GProgressBar{
		public bar:fgui.GImage;
		public title:fgui.GTextField;
	}
	class leagueNotic extends fgui.GComponent{
		public notice:fgui.GTextField;
	}
	class leagueNoticeCom extends fgui.GComponent{
		public notice:fgui.GTextField;
	}
	class leagueRankCell extends fgui.GButton{
		public bg:fgui.GGroup;
		public rankLab:fgui.GTextField;
		public noRank:fgui.GTextField;
		public leagueName:fgui.GTextField;
		public leaderName:fgui.GTextField;
		public fightLab:fgui.GTextField;
		public flagCom:ui.comm1.league.LeagueFlagComp;
	}
	class leagueTaskCom extends fgui.GButton{
		public completeNum:fgui.GTextField;
		public completeLab:fgui.GTextField;
		public taskLab:fgui.GTextField;
		public completeBar:ui.league.com.taskCellBar;
		public openTaskViewBtn:ui.comm.btn.BaseBtn;
		public redDot:ui.comm.com.RedDot;
		public rewardCell:ui.comm.item.ItemFrameBtn;
	}
	class manageCell extends fgui.GComponent{
		public nameLab:fgui.GTextField;
		public fightLab:fgui.GTextField;
		public jobList:fgui.GList;
		public onLineLab:fgui.GTextField;
		public dayOutLab:fgui.GTextField;
		public removeBtn:ui.comm.btn.BaseBtn;
		public avatar:ui.comm.playerInfo.PlayerAvatar;
	}
	class memberCell extends fgui.GComponent{
		public nameLab:fgui.GTextField;
		public activeLab:fgui.GTextField;
		public fightLab:fgui.GTextField;
		public onLineLab:fgui.GTextField;
		public dayOutLab:fgui.GTextField;
		public officia:fgui.GTextField;
		public avatar:ui.comm.playerInfo.PlayerAvatar;
	}
	class taskCellBar extends fgui.GProgressBar{
		public bar:fgui.GImage;
	}
}
declare namespace ui.league.item {
	class LeagueGameModeItem extends fgui.GComponent{
		public iconLoader:fgui.GLoader;
		public lbName:fgui.GTextField;
		public lbDes:fgui.GTextField;
		public bgTime:fgui.GImage;
		public lbTime:fgui.GTextField;
		public gTime:fgui.GGroup;
		public gInfo:fgui.GGroup;
		public gNone:fgui.GGroup;
		public exploreTip:ui.league.com.LeagueBubble;
		public redDot:ui.comm.com.RedDot;
	}
}
declare namespace ui.league.leagueMain {
	class btnPanel1 extends fgui.GComponent{
		public centerBtn:ui.league.leagueMain.btn.centerBtn_small;
	}
	class btnPanel2 extends fgui.GComponent{
		public centerBtn:ui.league.leagueMain.btn.centerBtn_small;
		public techBtn:ui.league.leagueMain.btn.build_tech;
		public starWarBtn:ui.league.leagueMain.btn.build_game;
		public boxBtn:ui.league.leagueMain.btn.build_box;
		public bossBtn:ui.league.leagueMain.btn.build_boss;
	}
	class leagueMain1 extends fgui.GComponent{
	}
	class leagueMain2 extends fgui.GComponent{
		public noticeCom:ui.league.leagueMain.com.leagueNoticeCom;
		public shopBtn:ui.league.leagueMain.btn.shopBtn;
		public challengeBtn:ui.league.leagueMain.btn.challengeBtn;
	}
	class LeagueMainView extends fgui.GComponent{
		public adapt_bg:fgui.GImage;
		public bgPanel1:fgui.GLoader;
		public bgPanel2:fgui.GLoader;
		public leagueMain:fgui.GGroup;
		public leagueList:ui.league.leagueList;
		public rankBtn:ui.league.leagueMain.com.myLeagueRank;
		public pMenu:ui.league.leagueMain.com.leagueMenu;
		public myLeagueCom:ui.league.leagueMain.com.myLeagueCom;
		public btnPanel1:ui.league.leagueMain.btnPanel1;
		public btnPanel2:ui.league.leagueMain.btnPanel2;
	}
}
declare namespace ui.league.leagueMain.btn {
	class build_boss extends fgui.GButton{
		public lock:fgui.GGroup;
		public tips:fgui.GTextField;
		public bossBtn:ui.league.leagueMain.btn.leagueComBtn;
	}
	class build_box extends fgui.GButton{
		public lock:fgui.GGroup;
		public tips:fgui.GTextField;
		public boxBtn:ui.league.leagueMain.btn.leagueComBtn;
	}
	class build_game extends fgui.GButton{
		public labelTips:fgui.GRichTextField;
		public starBtn:ui.league.leagueMain.btn.leagueComBtn;
		public exploreTip:ui.league.com.LeagueBubble;
	}
	class build_tech extends fgui.GButton{
		public lock:fgui.GGroup;
		public tips:fgui.GTextField;
		public techBtn:ui.league.leagueMain.btn.leagueComBtn;
	}
	class centerBtn extends fgui.GButton{
		public centerBtn:ui.league.leagueMain.btn.leagueComBtn;
	}
	class centerBtn_small extends fgui.GButton{
		public centerBtn:ui.league.leagueMain.btn.leagueComBtn;
	}
	class challengeBtn extends fgui.GButton{
		public redDot:ui.comm.com.RedDot;
	}
	class leagueBossBtn extends fgui.GButton{
		public lockTips:fgui.GTextField;
		public tips:fgui.GTextField;
		public redDot:ui.comm.com.RedDot;
	}
	class leagueBoxBtn extends fgui.GButton{
		public playNameLb:fgui.GTextField;
		public openTimeLb:fgui.GTextField;
		public redDot:ui.comm.com.RedDot;
	}
	class leagueComBtn extends fgui.GButton{
		public timeLb:fgui.GTextField;
		public lockLb:fgui.GTextField;
		public centerCom:fgui.GGroup;
		public redDot:ui.comm.com.RedDot;
	}
	class leagueGameBtn extends fgui.GButton{
		public lbUnlock:fgui.GTextField;
		public labelTips:fgui.GRichTextField;
		public gTip:fgui.GGroup;
		public imageLogo:fgui.GLoader;
		public redDot:ui.comm.com.RedDot;
	}
	class leagueTechBtn extends fgui.GButton{
		public openTimeLb:fgui.GTextField;
		public redDot:ui.comm.com.RedDot;
	}
	class shopBtn extends fgui.GButton{
		public redDot:ui.comm.com.RedDot;
	}
}
declare namespace ui.league.leagueMain.com {
	class leagueMenu extends fgui.GComponent{
		public item2:ui.league.leagueMain.com.leagueMenuItem2;
		public item1:ui.league.leagueMain.com.leagueMenuItem1;
	}
	class leagueMenuItem1 extends fgui.GComponent{
		public noticeCom:ui.league.leagueMain.com.leagueNoticeCom;
		public btnLeagueBargain:ui.league.btn.LeagueBargainEnterBtn;
		public shopBtn:ui.league.leagueMain.btn.shopBtn;
		public challengeBtn:ui.league.leagueMain.btn.challengeBtn;
		public chat:ui.comm1.chat.ChatComp;
	}
	class leagueMenuItem2 extends fgui.GComponent{
		public bg:fgui.GImage;
		public btns:fgui.GGroup;
		public boxBtn:ui.league.leagueMain.btn.leagueBoxBtn;
		public techBtn:ui.league.leagueMain.btn.leagueTechBtn;
		public bossBtn:ui.league.leagueMain.btn.leagueBossBtn;
		public starWarBtn:ui.league.leagueMain.btn.leagueGameBtn;
	}
	class leagueNoticeCom extends fgui.GComponent{
		public notice:ui.league.leagueMain.com.leagueNoticeText;
	}
	class leagueNoticeText extends fgui.GComponent{
		public notice:fgui.GTextField;
	}
	class myLeagueCom extends fgui.GButton{
		public lvLb:fgui.GTextField;
		public nameLb:fgui.GTextField;
		public memberNumLb:fgui.GTextField;
		public myCom:fgui.GGroup;
		public flagCom:ui.comm1.league.LeagueFlagComp;
	}
	class myLeagueRank extends fgui.GButton{
		public rankLb:fgui.GTextField;
		public rankCom:fgui.GGroup;
	}
}
