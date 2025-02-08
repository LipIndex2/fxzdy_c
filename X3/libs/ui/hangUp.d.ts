declare namespace ui.hangUp {
	class HangUpAutoChallengeConfirmView extends fgui.GComponent{
		public bg:fgui.GLoader;
		public fg:fgui.GLoader;
		public labelContent:fgui.GRichTextField;
		public desc:fgui.GTextField;
		public title:fgui.GTextField;
		public btnConfirm:ui.comm.btn.BtnConfirm;
		public btnCancel:ui.comm.btn.BtnCancel;
	}
	class HangUpBattleView extends fgui.GComponent{
		public labelRestTime:fgui.GTextField;
		public labelLevelTitle:fgui.GTextField;
		public imageVs:fgui.GImage;
		public headP:fgui.GGroup;
		public heroList:fgui.GList;
		public footP:fgui.GGroup;
		public all:fgui.GGroup;
		public progressBar1:ui.hangUp.progressBar.HangUpBattleLeftProgressBar;
		public compLevelNameTips:ui.hangUp.components.HangUpBattleLevelNameTipsComp;
		public progressBar2:ui.hangUp.progressBar.HangUpBattleRightProgressBar;
		public tipsAutoBattle:ui.hangUp.components.HangUpAutoBattleTipsComp;
		public btnAutoFight:ui.hangUp.btn.BtnHangUpAutoBattle;
		public btnBack:ui.comm.back.BtnBack75;
		public captainSkillComp:ui.comm.captainSkill.CaptionSkillCommonBattleComp;
	}
	class HangUpChallengeView extends fgui.GComponent{
		public bg:fgui.GLoader;
		public fg:fgui.GLoader;
		public labelTitle:fgui.GTextField;
		public bgTitle:fgui.GLoader;
		public labelLevelTitle:fgui.GTextField;
		public levelTitle:fgui.GGroup;
		public bgEnemySchema:fgui.GLoader;
		public bgPower:fgui.GLoader;
		public labelPower:fgui.GTextField;
		public btn:fgui.GGroup;
		public hangUpItemList:fgui.GList;
		public itemList:fgui.GList;
		public all:fgui.GGroup;
		public btnAutoChallenge:ui.hangUp.btn.HangUpChallengeInBgBtn;
		public btnSetSchema:ui.comm.btn.BtnBlue;
		public modelNode1:ui.comm.node.ModelNode;
		public modelNode2:ui.comm.node.ModelNode;
		public modelNode3:ui.comm.node.ModelNode;
		public modelNode4:ui.comm.node.ModelNode;
		public modelNode5:ui.comm.node.ModelNode;
		public modelNode6:ui.comm.node.ModelNode;
		public btnChallenge:ui.comm.btn.BtnConfirm;
	}
	class HangUpGainRewardView extends fgui.GComponent{
		public bg:fgui.GLoader;
		public fg2:fgui.GLoader;
		public bgRewardTitle:fgui.GLoader;
		public labelRewardTitle:fgui.GTextField;
		public labelBackTips:fgui.GTextField;
		public itemList:fgui.GList;
		public bgMax:fgui.GLoader;
		public labelMaxHangUpTimeDesc:fgui.GTextField;
		public maxHangUp:fgui.GGroup;
		public labelSpeedUpTips:fgui.GTextField;
		public fg1:fgui.GLoader;
		public labelTitle:fgui.GTextField;
		public labelHangUpTime:fgui.GTextField;
		public addPerHour:fgui.GGroup;
		public content:fgui.GGroup;
		public tipsHangUpGold:ui.hangUp.components.HangUpPerHourIconComp;
		public tipsHangUpExp:ui.hangUp.components.HangUpPerHourIconComp;
		public tipsHangUpLvUpItem:ui.hangUp.components.HangUpPerHourIconComp;
		public btnGain:ui.hangUp.btn.HangUpGainBtn;
		public btnBuyMax:ui.hangUp.btn.HangUpBuyMaxBtn;
		public btnSpeedUp:ui.hangUp.btn.HangUpSpeedUpBtn;
	}
	class HangUpMainView extends fgui.GComponent{
		public imageRoleSay:fgui.GImage;
		public bg:fgui.GLoader;
		public reward:fgui.GGroup;
		public levelList:fgui.GList;
		public bgBoxTime:fgui.GImage;
		public labelBoxTime:fgui.GTextField;
		public boxTime:fgui.GGroup;
		public imageRightLight:fgui.GImage;
		public all:fgui.GGroup;
		public btnChallenge:ui.hangUp.btn.BtnChallengeRoad;
		public tipsHangUpAnim:ui.hangUp.components.HangUpFloatComp;
		public btnDialog:ui.hangUp.componentsV2.HangUpBigRewardDialogComp;
		public tipsInBg:ui.hangUp.btn.HangUpInBgTipsBtn;
		public btnQuickGain:ui.hangUp.btn.HangUpQuickGainBtn;
		public btnPreview:ui.hangUp.components.HangUpFirstLevelComp;
		public spineTop:ui.comm.node.ModelNode;
		public nodePoint:ui.comm.com.Node;
		public btnBox:ui.comm.hangUp.HangUpPreviewBoxBtn;
		public btnBack:ui.comm.back.BtnBack;
	}
	class HangUpPreviewRoadView extends fgui.GComponent{
		public bg:fgui.GImage;
		public roadList:fgui.GList;
		public btnBack:ui.comm.back.BtnBack;
	}
}
declare namespace ui.hangUp.back {
	class HangUpBackComp extends fgui.GComponent{
	}
}
declare namespace ui.hangUp.bar {
	class HangUpProgressBar extends fgui.GProgressBar{
		public bar:fgui.GImage;
	}
}
declare namespace ui.hangUp.btn {
	class BtnBattleJump extends fgui.GButton{
		public bg:fgui.GImage;
	}
	class BtnChallengeRoad extends fgui.GButton{
		public bg:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public labelPower:fgui.GTextField;
	}
	class BtnHangUpAutoBattle extends fgui.GButton{
		public imageBtnAuto:fgui.GImage;
		public fg:fgui.GImage;
		public labelBtnAuto:fgui.GTextField;
	}
	class HangUpAdTipBtn extends fgui.GButton{
		public lbAd:fgui.GTextField;
	}
	class HangUpAutoInBgBtn extends fgui.GButton{
		public bg:fgui.GImage;
		public labelTips:fgui.GTextField;
	}
	class HangUpBoxComp extends fgui.GButton{
		public imageBox:fgui.GLoader;
	}
	class HangUpBuyMaxBtn extends fgui.GButton{
		public bgBuyMax:fgui.GImage;
		public labelBuyMax:fgui.GTextField;
	}
	class HangUpChallengeInBgBtn extends fgui.GButton{
		public bg:fgui.GImage;
		public labelName:fgui.GTextField;
	}
	class HangUpGainBtn extends fgui.GButton{
		public bg:fgui.GImage;
	}
	class HangUpInBgTipsBtn extends fgui.GButton{
		public bg:fgui.GImage;
		public imagePet:fgui.GLoader;
		public labelCurLevel:fgui.GTextField;
		public labelContent:fgui.GTextField;
		public charList:fgui.GList;
	}
	class HangUpQuickGainBtn extends fgui.GButton{
		public bg:fgui.GImage;
		public redDot:ui.comm.com.RedDot;
	}
	class HangUpSpeedUpBtn extends fgui.GButton{
		public bg:fgui.GLoader;
		public labelFree:fgui.GTextField;
		public labelSpeedUpCount:fgui.GTextField;
		public imageCost:fgui.GLoader;
		public labelCost:fgui.GTextField;
	}
	class HangUpV2SpeedUpBtn extends fgui.GButton{
		public bg:fgui.GLoader;
		public labelFree:fgui.GTextField;
		public labelSpeedUpCount:fgui.GTextField;
		public imageCost:fgui.GLoader;
		public labelCost:fgui.GTextField;
	}
}
declare namespace ui.hangUp.btnV2 {
	class BtnDataV2 extends fgui.GButton{
		public btnData:fgui.GImage;
	}
	class BtnHangUpNextLevelV2 extends fgui.GButton{
	}
}
declare namespace ui.hangUp.components {
	class HangUpAutoBattleTipsComp extends fgui.GComponent{
		public bg:fgui.GImage;
		public imageAutoBattle:fgui.GLoader;
		public labelAutoBattle:fgui.GTextField;
	}
	class HangUpBattleDamageTotalComp extends fgui.GComponent{
	}
	class HangUpBattleLevelNameTipsComp extends fgui.GComponent{
		public title:fgui.GTextField;
	}
	class HangUpBattleUnitComp extends fgui.GComponent{
		public bg:fgui.GLoader;
		public fg:fgui.GLoader;
		public bgMask:fgui.GImage;
		public title:fgui.GTextField;
		public heroComp:ui.hangUp.components.HangUpHeroMaskComp;
	}
	class HangUpFirstLevelComp extends fgui.GButton{
		public bar:ui.hangUp.components.HangUpRoadProgressBar;
	}
	class HangUpFloatComp extends fgui.GComponent{
		public imageItem:fgui.GLoader;
		public title:fgui.GRichTextField;
	}
	class HangUpHeroMaskComp extends fgui.GComponent{
		public imageHero:fgui.GLoader;
	}
	class HangUpPerHourIconComp extends fgui.GComponent{
		public imageItem:fgui.GLoader;
		public labelTitle:fgui.GRichTextField;
	}
	class HangUpRewardItemTipsComp extends fgui.GComponent{
		public imageNextLevelRewardItem:fgui.GLoader;
		public labelNextLevelRewardCount:fgui.GTextField;
	}
	class HangUpRoadDialogComp extends fgui.GComponent{
		public bgReward:fgui.GLoader;
		public imageReward:fgui.GLoader;
		public labelRewardCount:fgui.GTextField;
	}
	class HangUpRoadIconComp extends fgui.GButton{
		public imageMonster:fgui.GImage;
		public imagePass:fgui.GImage;
		public imageBgPass:fgui.GLoader;
		public imageBgNotPass:fgui.GLoader;
		public imageIcon:fgui.GLoader;
		public imageChallenge:fgui.GLoader;
		public item:fgui.GGroup;
	}
	class HangUpRoadOneStepComp extends fgui.GComponent{
		public bgTitle:fgui.GLoader;
		public labelLevelId:fgui.GTextField;
		public bar:ui.hangUp.components.HangUpRoadProgressBar;
		public dialogComp:ui.hangUp.components.HangUpRoadDialogComp;
		public challengeComp:ui.hangUp.components.HangUpRoadIconComp;
	}
	class HangUpRoadProgressBar extends fgui.GProgressBar{
		public bar:fgui.GImage;
	}
	class HangUpTimeRewardTipsComp extends fgui.GComponent{
		public imageItem:fgui.GLoader;
		public labelText:fgui.GRichTextField;
		public imageAdd:fgui.GImage;
	}
	class HangUpTotalDamageComp extends fgui.GComponent{
		public hurt:fgui.GTextField;
	}
}
declare namespace ui.hangUp.componentsV2 {
	class HangUpBigRewardDialogComp extends fgui.GButton{
		public bgDialog:fgui.GLoader;
		public bgCanGain:fgui.GImage;
		public labelNextLevelRewardTitle:fgui.GTextField;
		public noGain:fgui.GGroup;
		public gainComp:ui.hangUp.components.HangUpRewardItemTipsComp;
		public canGainRewardComp:ui.hangUp.components.HangUpRewardItemTipsComp;
		public redDot:ui.comm.com.RedDot;
		public redDot2:ui.comm.com.RedDot;
	}
	class HangUpFailTips extends fgui.GComponent{
		public bg:fgui.GImage;
		public bgTitle:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public btnModule1:ui.hangUp.btn.BtnBattleJump;
		public btnModule2:ui.hangUp.btn.BtnBattleJump;
		public btnModule3:ui.hangUp.btn.BtnBattleJump;
		public btnData:ui.hangUp.btnV2.BtnDataV2;
	}
	class HangUpWinV2Component extends fgui.GComponent{
		public bg:fgui.GImage;
		public bgTitle:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public bgRewardItems:fgui.GImage;
		public itemList:fgui.GList;
		public hangUpItemList:fgui.GList;
		public noBigReward:fgui.GGroup;
		public labelTips:fgui.GTextField;
		public labelRewardCount:fgui.GTextField;
		public imageNextNLevelReward:fgui.GLoader;
		public btnData:ui.hangUp.btnV2.BtnDataV2;
	}
}
declare namespace ui.hangUp.item {
	class HangUpInBgTipsTextComp extends fgui.GComponent{
		public labelContent:fgui.GTextField;
	}
	class HangUpReviewRoadItemComp extends fgui.GComponent{
		public bgOther:fgui.GImage;
		public bgCurrent:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public imageAdd:fgui.GImage;
		public labelMaxLv:fgui.GRichTextField;
		public labelLevelId:fgui.GTextField;
		public bar:ui.hangUp.bar.HangUpProgressBar;
		public tips1:ui.hangUp.components.HangUpTimeRewardTipsComp;
		public tips2:ui.hangUp.components.HangUpTimeRewardTipsComp;
		public tips3:ui.hangUp.components.HangUpTimeRewardTipsComp;
	}
}
declare namespace ui.hangUp.progressBar {
	class HangUpBattleLeftProgressBar extends fgui.GProgressBar{
		public bar:fgui.GImage;
		public title:fgui.GTextField;
	}
	class HangUpBattleRightProgressBar extends fgui.GProgressBar{
		public bar:fgui.GImage;
		public title:fgui.GTextField;
	}
}
declare namespace ui.hangUp.viewV2 {
	class HangUpBattleResultFailV2View extends fgui.GComponent{
		public labelTips:fgui.GTextField;
		public panel:ui.hangUp.componentsV2.HangUpFailTips;
		public modelNode:ui.comm.node.ModelNode;
	}
	class HangUpBattleResultWinV2View extends fgui.GComponent{
		public labelCloseTips:fgui.GTextField;
		public labelAutoTips:fgui.GTextField;
		public panel:ui.hangUp.componentsV2.HangUpWinV2Component;
		public btnNextLevel:ui.hangUp.btnV2.BtnHangUpNextLevelV2;
		public modelNode:ui.comm.node.ModelNode;
	}
}
declare namespace ui.hangUp.win {
	class HangUpInBgConfirmWin extends fgui.GComponent{
		public bg:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public fg:fgui.GImage;
		public labelContent:fgui.GTextField;
		public G_all:fgui.GGroup;
		public btnR:ui.comm.btn.BtnChangGui1;
		public btnL:ui.comm.btn.BtnChangGui3;
	}
	class HangUpInBgExitConfirmWin extends fgui.GComponent{
		public labelTitle:fgui.GTextField;
		public labelContent1:fgui.GRichTextField;
		public labelContent2:fgui.GRichTextField;
		public G_all:fgui.GGroup;
		public btnR:ui.comm.btn.BtnChangGui1;
		public btnL:ui.comm.btn.BtnChangGui3;
	}
	class HangUpInBgResultWin extends fgui.GComponent{
		public bgTitle:fgui.GImage;
		public imageTitle:fgui.GImage;
		public bg:fgui.GImage;
		public label1:fgui.GRichTextField;
		public label2:fgui.GRichTextField;
		public G_all:fgui.GGroup;
		public btnOk:ui.comm.btn.BtnChangGui1;
	}
	class HangUpPreviewRewardWin extends fgui.GComponent{
		public bg:fgui.GLoader;
		public fg1:fgui.GImage;
		public fg2:fgui.GImage;
		public fg3:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public labelHangUpTime:fgui.GTextField;
		public itemList:fgui.GList;
		public G_all:fgui.GGroup;
		public tipsHangUpGold:ui.hangUp.components.HangUpPerHourIconComp;
		public tipsHangUpExp:ui.hangUp.components.HangUpPerHourIconComp;
		public tipsHangUpLvUpItem:ui.hangUp.components.HangUpPerHourIconComp;
		public btnOk:ui.comm.btn.BtnChangGui1;
	}
	class HangUpQuickGainConfirmWin extends fgui.GComponent{
		public bg:fgui.GLoader;
		public fg:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public labelContentPay:fgui.GTextField;
		public imageItem:fgui.GLoader;
		public labelCostCount:fgui.GTextField;
		public G_pay:fgui.GGroup;
		public labelContent2:fgui.GTextField;
		public bgTime:fgui.GImage;
		public labelResetTime:fgui.GTextField;
		public imageTime:fgui.GImage;
		public listReward:fgui.GList;
		public G_all:fgui.GGroup;
		public btnAd:ui.comm.btn.BtnAdLb;
		public btnItem:ui.comm.btn.BtnChangGui1WithItem;
		public btnOk:ui.comm.btn.BtnChangGui1WithItem;
	}
}
